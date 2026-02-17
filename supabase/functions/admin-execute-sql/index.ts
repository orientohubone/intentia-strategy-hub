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
    // Por enquanto, vamos usar um conteúdo de exemplo
    // Em produção, isso implementaria a leitura real do arquivo
    
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
      `,
      'sql/00_setup/storage_setup.sql': `
-- Configuração do bucket avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;
      `,
      'sql/01_schema/tactical_schema.sql': `
-- Camada tática (5 tabelas)
CREATE TABLE IF NOT EXISTS tactical_plans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  name text not null,
  created_at timestamptz default now()
);
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
