-- =====================================================
-- FUNÇÃO PARA EXECUTAR SQL DINÂMICAMENTE
-- =====================================================

-- Função para executar SQL (apenas para admin)
CREATE OR REPLACE FUNCTION execute_sql(sql_content text)
RETURNS TABLE(rowsAffected bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_count bigint;
BEGIN
    -- Executar o SQL dinamicamente
    EXECUTE sql_content;
    
    -- Retornar número de linhas afetadas (estimado)
    GET DIAGNOSTICS result_count = ROW_COUNT;
    
    RETURN QUERY SELECT result_count;
END;
$$;

-- Grant para service_role apenas
GRANT EXECUTE ON FUNCTION execute_sql TO service_role;

-- Criar tabela de logs de execução SQL
CREATE TABLE IF NOT EXISTS sql_execution_logs (
    id uuid primary key default gen_random_uuid(),
    sql_path text not null,
    executed_at timestamptz default now(),
    execution_time_ms integer,
    success boolean not null,
    error_message text,
    rows_affected bigint,
    executed_by text default 'admin'
);

-- RLS para logs (apenas admin pode ver)
ALTER TABLE sql_execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all SQL logs" ON sql_execution_logs
    FOR SELECT USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- Index para performance
CREATE INDEX IF NOT EXISTS sql_execution_logs_sql_path_idx ON sql_execution_logs(sql_path);
CREATE INDEX IF NOT EXISTS sql_execution_logs_executed_at_idx ON sql_execution_logs(executed_at);
