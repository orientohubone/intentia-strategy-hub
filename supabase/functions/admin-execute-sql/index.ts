import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// =====================================================
// CONFIG
// =====================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// =====================================================
// MAIN HANDLER
// =====================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { sqlPath } = await req.json()
    
    if (!sqlPath) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'sqlPath is required'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Validate sqlPath format
    if (!sqlPath.startsWith('sql/') || !sqlPath.endsWith('.sql')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid sqlPath format'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Read SQL file content
    const sqlContent = await readSQLFile(sqlPath)
    
    if (!sqlContent) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'SQL file not found or empty'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    // Execute SQL
    const startTime = Date.now()
    
    // Log para debug
    console.log('🔍 Executing SQL:', { sqlPath, sqlContent: sqlContent?.substring(0, 100) + '...' })
    
    // Executar SQL real via RPC
    const { error, data } = await supabase.rpc('execute_sql', { 
      sql_content: sqlContent 
    })
    const executionTime = Date.now() - startTime

    if (error) {
      console.error('SQL execution error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          executionTime
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Log execution
    await logExecution(sqlPath, true, executionTime)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SQL executed successfully',
        executionTime,
        rowsAffected: data?.rowsAffected || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('Execution error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Lê o conteúdo de um arquivo SQL
 * Em produção, isso poderia ler do GitHub, S3, ou outro storage
 */
async function readSQLFile(sqlPath: string): Promise<string | null> {
  try {
    // SQLs reais para os exemplos
    const examples: Record<string, string> = {
      'sql/00_setup/schema.sql': `
-- Schema base (tenant_settings, projects)
CREATE TABLE IF NOT EXISTS tenant_settings (
  user_id uuid primary key references auth.users(id),
  company_name text,
  plan text default 'starter',
  monthly_analyses_limit integer default 5,
  analyses_used integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references tenant_settings(user_id),
  name text not null,
  url text not null,
  niche text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Criar função para updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
CREATE TRIGGER set_tenant_settings_updated_at
  BEFORE UPDATE ON tenant_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      `,
      'sql/00_setup/storage_setup.sql': `
-- Configuração do bucket avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own avatar" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars' AND auth.uid::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
      `,
      'sql/01_schema/tactical_schema.sql': `
-- Camada tática (5 tabelas)
CREATE TABLE IF NOT EXISTS tactical_plans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) ON DELETE CASCADE,
  name text not null,
  objective text,
  strategy text,
  tactics text[],
  kpi_targets jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS tactical_actions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references tactical_plans(id) ON DELETE CASCADE,
  title text not null,
  description text,
  channel text,
  status text default 'pending',
  priority text default 'medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Triggers para updated_at
CREATE TRIGGER set_tactical_plans_updated_at
  BEFORE UPDATE ON tactical_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_tactical_actions_updated_at
  BEFORE UPDATE ON tactical_actions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      `
    }

    return examples[sqlPath] || `-- Placeholder SQL for ${sqlPath}`;
    
  } catch (error) {
    console.error('Error reading SQL file:', error)
    return null
  }
}

/**
 * Registra log de execução
 */
async function logExecution(sqlPath: string, success: boolean, executionTime: number) {
  try {
    // Em produção, isso salvaria em uma tabela de logs
    console.log('SQL Execution Log:', {
      sqlPath,
      success,
      executionTime,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error logging execution:', error)
  }
}
