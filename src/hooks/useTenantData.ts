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
  score: number;
  status: 'pending' | 'analyzing' | 'completed';
  heuristic_analysis?: any;
  heuristic_completed_at?: string;
  ai_analysis?: any;
  ai_completed_at?: string;
  last_update: string;
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

export function useTenantData() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setTenantSettings(null);
      setLoading(false);
      return;
    }

    fetchTenantData();
  }, [user]);

  const fetchTenantData = async () => {
    try {
      setLoading(true);

      // Fetch tenant settings
      const { data: settings, error: settingsError } = await (supabase as any)
        .from('tenant_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching tenant settings:', settingsError);
      }

      if (settings) {
        setTenantSettings(settings);
      } else {
        // Create default tenant settings for new users
        await createDefaultTenantSettings();
      }

      // Fetch user's projects (tenant isolation)
      const { data: userProjects, error: projectsError } = await (supabase as any)
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      } else {
        setProjects(userProjects || []);
      }

    } catch (error) {
      console.error('Error fetching tenant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTenantSettings = async () => {
    const { data: userData } = await supabase.auth.getUser();
    
    if (userData?.user?.user_metadata) {
      const { data, error } = await (supabase as any)
        .from('tenant_settings')
        .insert({
          user_id: user.id,
          company_name: userData.user.user_metadata.company_name || 'Default Company',
          plan: 'starter',
          monthly_analyses_limit: 5,
          analyses_used: 0,
        })
        .select()
        .single();

      if (!error && data) {
        setTenantSettings(data);
      }
    }
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

    const { data, error } = await (supabase as any)
      .from('projects')
      .insert({
        ...projectData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    setProjects(prev => [data, ...prev]);
    return data;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await (supabase as any)
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own projects
      .select()
      .single();

    if (error) throw error;

    setProjects(prev => 
      prev.map(project => 
        project.id === id ? { ...project, ...data } : project
      )
    );
    return data;
  };

  const deleteProject = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await (supabase as any)
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user can only delete their own projects

    if (error) throw error;

    setProjects(prev => prev.filter(project => project.id !== id));
  };

  return {
    projects,
    tenantSettings,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchTenantData,
  };
}
