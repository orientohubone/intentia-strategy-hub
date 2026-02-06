import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotifications();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

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
            setNotifications(prev => [payload.new as Notification, ...prev]);
            setUnreadCount(prev => prev + 1);
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

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
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
      const { error } = await supabase
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
      const { data, error } = await supabase
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
      const { data: recentProjects } = await supabase
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
      const { data: recentBenchmarks } = await supabase
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
      const { data: insightsCount } = await supabase
        .from("insights")
        .select("*", { count: "exact", head: true })
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
