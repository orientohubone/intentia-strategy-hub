import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  niche: string;
  url: string;
  competitor_urls: string[];
  solution_context?: string | null;
  missing_features?: string | null;
  score: number;
  status: 'pending' | 'analyzing' | 'completed';
  heuristic_analysis?: any;
  heuristic_completed_at?: string | null;
  ai_analysis?: any;
  ai_completed_at?: string | null;
  last_update: string | null;
  channel_scores?: {
    google: number;
    meta: number;
    linkedin: number;
    tiktok: number;
  };
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  id: string;
  user_id: string;
  company_name: string;
  plan: 'starter' | 'professional' | 'enterprise';
  monthly_analyses_limit: number;
  analyses_used: number;
  created_at: string;
  updated_at: string;
}

type TenantDataState = {
  projects: Project[];
  tenantSettings: TenantSettings | null;
  fetchedAt: number;
};

const CACHE_TTL_MS = 2 * 60 * 1000;
const tenantDataCache = new Map<string, TenantDataState>();
const tenantDataInFlight = new Map<string, Promise<TenantDataState>>();

export function useTenantData() {
  const { user } = useAuth();
  const userId = user?.id;
  const [projects, setProjects] = useState<Project[]>([]);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setTenantSettings(null);
      setLoading(false);
      return;
    }

    const cached = tenantDataCache.get(userId);
    if (cached) {
      setProjects(cached.projects);
      setTenantSettings(cached.tenantSettings);
      setLoading(false);

      if (Date.now() - cached.fetchedAt >= CACHE_TTL_MS) {
        void fetchTenantData(userId, { silent: true });
      }
      return;
    }

    void fetchTenantData(userId);
  }, [userId]);

  const fetchTenantData = async (
    targetUserId: string = userId ?? '',
    options?: { force?: boolean; silent?: boolean }
  ) => {
    if (!targetUserId) return;
    const force = !!options?.force;
    const silent = !!options?.silent;
    const cached = tenantDataCache.get(targetUserId);
    const isCacheFresh = !!cached && (Date.now() - cached.fetchedAt < CACHE_TTL_MS);

    if (!force && cached && isCacheFresh) {
      setProjects(cached.projects);
      setTenantSettings(cached.tenantSettings);
      setLoading(false);
      return;
    }

    try {
      if (!silent && !cached) {
        setLoading(true);
      }

      let request = tenantDataInFlight.get(targetUserId);
      if (!request || force) {
        request = (async () => {
          const { data: settings, error: settingsError } = await supabase
            .from('tenant_settings')
            .select('*')
            .eq('user_id', targetUserId)
            .single();

          let nextSettings = settings || null;
          if (settingsError && settingsError.code !== 'PGRST116') {
            console.error('Error fetching tenant settings:', settingsError);
          }

          if (!nextSettings) {
            nextSettings = await createDefaultTenantSettings(targetUserId);
          }

          const { data: userProjects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false });

          if (projectsError) {
            console.error('Error fetching projects:', projectsError);
          }

          return {
            projects: (userProjects as unknown as Project[]) || [],
            tenantSettings: nextSettings,
            fetchedAt: Date.now(),
          } as TenantDataState;
        })();
        tenantDataInFlight.set(targetUserId, request);
      }

      const next = await request;
      tenantDataCache.set(targetUserId, next);
      setProjects(next.projects);
      setTenantSettings(next.tenantSettings);

    } catch (error) {
      console.error('Error fetching tenant data:', error);
    } finally {
      tenantDataInFlight.delete(targetUserId);
      setLoading(false);
    }
  };

  const createDefaultTenantSettings = async (targetUserId: string) => {
    if (!targetUserId) return null;

    const { data: userData } = await supabase.auth.getUser();
    
    if (userData?.user?.user_metadata) {
      const { data, error } = await supabase
        .from('tenant_settings')
        .insert({
          user_id: targetUserId,
          company_name: userData.user.user_metadata.company_name || 'Default Company',
          plan: 'starter',
          monthly_analyses_limit: 5,
          analyses_used: 0,
        })
        .select()
        .single();

      if (!error && data) {
        return data as TenantSettings;
      }
    }
    return null;
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    // Check active project count against plan limit
    const plan = tenantSettings?.plan || 'starter';
    const maxFromTenant = (tenantSettings as any)?.max_projects;
    const maxProjects = maxFromTenant === -1 ? 999999 : (maxFromTenant ?? (plan === 'starter' ? 5 : 999999));
    const activeCount = projects.filter(p => !(p as any).deleted_at).length;
    if (activeCount >= maxProjects) {
      throw new Error(`Limite de ${maxProjects} projetos ativos atingido no plano ${plan === 'starter' ? 'Starter' : plan}. Faça upgrade para criar mais projetos.`);
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        user_id: user.id,
      } as any)
      .select()
      .single();

    if (error) throw error;

    setProjects(prev => {
      const next = [(data as unknown as Project), ...prev];
      if (userId) {
        tenantDataCache.set(userId, {
          projects: next,
          tenantSettings,
          fetchedAt: Date.now(),
        });
      }
      return next;
    });
    return data;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .update(updates as any)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own projects
      .select()
      .single();

    if (error) throw error;

    setProjects(prev => {
      const next = prev.map(project => 
        project.id === id ? { ...project, ...(data as unknown as Project) } : project
      );
      if (userId) {
        tenantDataCache.set(userId, {
          projects: next,
          tenantSettings,
          fetchedAt: Date.now(),
        });
      }
      return next;
    });
    return data;
  };

  const deleteProject = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user can only delete their own projects

    if (error) throw error;

    setProjects(prev => {
      const next = prev.filter(project => project.id !== id);
      if (userId) {
        tenantDataCache.set(userId, {
          projects: next,
          tenantSettings,
          fetchedAt: Date.now(),
        });
      }
      return next;
    });
  };

  return {
    projects,
    tenantSettings,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: (targetUserId?: string) => fetchTenantData(targetUserId ?? userId ?? '', { force: true }),
  };
}
