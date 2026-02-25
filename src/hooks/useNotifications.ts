import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Singleton guards (compartilhados entre instâncias do hook)
let sharedChannel: ReturnType<typeof supabase.channel> | null = null;
let sharedUserId: string | null = null;
let sharedRefs = 0;
let sharedNotificationsCache: Notification[] = [];
let sharedUnreadCache = 0;
let sharedLoaded = false;
let sharedLoadPromise: Promise<void> | null = null;

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
  action_url?: string;
  action_text?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processedNotifications, setProcessedNotifications] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const initializedRef = useRef(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      // Cleanup when user logs out
      initializedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      channelRef.current = null;
      if (sharedChannel) {
        sharedRefs = Math.max(0, sharedRefs - 1);
        if (sharedRefs === 0) {
          supabase.removeChannel(sharedChannel);
          sharedChannel = null;
          sharedUserId = null;
        }
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;
    sharedRefs += 1;

    loadNotifications();
    channelRef.current = setupRealtimeSubscription();

    return () => {
      initializedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      channelRef.current = null;
      if (sharedChannel) {
        sharedRefs = Math.max(0, sharedRefs - 1);
        if (sharedRefs === 0) {
          supabase.removeChannel(sharedChannel);
          sharedChannel = null;
          sharedUserId = null;
        }
      }
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    // Reuse cache if já carregado para o mesmo usuário
    if (sharedLoaded && sharedUserId === user.id) {
      setNotifications(sharedNotificationsCache);
      setUnreadCount(sharedUnreadCache);
      setProcessedNotifications(new Set(sharedNotificationsCache.map((n) => n.id)));
      setLoading(false);
      return;
    }

    if (sharedLoadPromise && sharedUserId === user.id) {
      setLoading(true);
      await sharedLoadPromise;
      setNotifications(sharedNotificationsCache);
      setUnreadCount(sharedUnreadCache);
      setProcessedNotifications(new Set(sharedNotificationsCache.map((n) => n.id)));
      setLoading(false);
      return;
    }

    sharedLoadPromise = (async () => {
      try {
        setLoading(true);
        const { data, error } = await (supabase as any)
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        sharedNotificationsCache = (data || []) as Notification[];
        sharedUnreadCache = sharedNotificationsCache.filter(n => !n.read).length;
        sharedLoaded = true;
        sharedUserId = user.id;
      } catch (error) {
        console.error("Error loading notifications:", error);
        sharedLoaded = false;
      } finally {
        setLoading(false);
      }
    })();

    await sharedLoadPromise;
    setNotifications(sharedNotificationsCache);
    setUnreadCount(sharedUnreadCache);
    setProcessedNotifications(new Set(sharedNotificationsCache.map((n) => n.id)));
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    // Reuse singleton channel por usuário
    if (sharedChannel && sharedUserId === user.id) {
      return sharedChannel;
    }

    if (sharedChannel && sharedUserId !== user.id) {
      supabase.removeChannel(sharedChannel);
      sharedChannel = null;
      sharedUserId = null;
    }

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as Notification;
            
            // Prevent processing the same notification multiple times
            if (processedNotifications.has(newNotif.id)) return;
            
            setProcessedNotifications(prev => new Set([...prev, newNotif.id]));
            
            setNotifications(prev => {
              if (prev.some(n => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev];
            });
            
            // Only increment if this notification is unread
            if (!newNotif.read) {
              setUnreadCount(prev => prev + 1);
            }
          } else if (payload.eventType === 'DELETE') {
            const oldNotif = payload.old as { id: string };
            setNotifications(prev => prev.filter(n => n.id !== oldNotif.id));
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(n => n.id === payload.new.id ? payload.new as Notification : n)
            );
            // Update unread count
            const updated = payload.new as Notification;
            if (updated.read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();

    sharedChannel = channel;
    sharedUserId = user.id;
    return channel;
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deleted = notifications.find(n => n.id === notificationId);
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const createNotification = async (notification: Omit<Notification, "id" | "created_at" | "read">) => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from("notifications")
        .insert({
          ...notification,
          user_id: user.id,
          read: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  // Auto-generate system notifications based on user activity
  const generateSystemNotifications = async () => {
    if (!user) return;

    try {
      // Check for new projects created in the last 24h
      const { data: recentProjects } = await (supabase as any)
        .from("projects")
        .select("name, created_at")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentProjects && recentProjects.length > 0) {
        await createNotification({
          title: "Novos Projetos Criados",
          message: `Você criou ${recentProjects.length} novo${recentProjects.length > 1 ? 's' : ''} projeto${recentProjects.length > 1 ? 's' : ''} nas últimas 24 horas.`,
          type: "success",
          action_url: "/projects",
          action_text: "Ver Projetos"
        });
      }

      // Check for benchmark analyses completed
      const { data: recentBenchmarks } = await (supabase as any)
        .from("benchmarks")
        .select("competitor_name, created_at")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentBenchmarks && recentBenchmarks.length > 0) {
        await createNotification({
          title: "Análises de Benchmark Concluídas",
          message: `Análise competitiva para ${recentBenchmarks[0].competitor_name} está pronta.`,
          type: "info",
          action_url: "/benchmark",
          action_text: "Ver Análise"
        });
      }

      // Check for weekly insights summary
      const { count: insightsCount } = await (supabase as any)
        .from("insights")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (insightsCount && insightsCount > 0) {
        await createNotification({
          title: "Resumo Semanal de Insights",
          message: `Você gerou ${insightsCount} novo${insightsCount > 1 ? 's' : ''} insight${insightsCount > 1 ? 's' : ''} esta semana.`,
          type: "info",
          action_url: "/insights",
          action_text: "Ver Insights"
        });
      }
    } catch (error) {
      console.error("Error generating system notifications:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    generateSystemNotifications,
    refreshNotifications: loadNotifications
  };
}
