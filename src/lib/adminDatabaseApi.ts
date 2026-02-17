import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TYPES
// =====================================================

export interface SQLExecutionResult {
  success: boolean;
  message: string;
  error?: string;
  executionTime?: number;
  rowsAffected?: number;
}

export interface SQLFile {
  name: string;
  path: string;
  category: string;
  description: string;
  status: 'executed' | 'pending' | 'error';
  lastExecuted?: string;
  executionTime?: string;
}

// =====================================================
// API FUNCTIONS
// =====================================================

/**
 * Executa um arquivo SQL via Admin API
 */
export async function adminExecuteSQL(sqlPath: string): Promise<SQLExecutionResult> {
  try {
    const startTime = Date.now();
    
    // Chamar Edge Function para executar SQL
    const { data, error } = await supabase.functions.invoke('admin-execute-sql', {
      body: { sqlPath }
    });

    const executionTime = Date.now() - startTime;

    if (error) {
      console.error('SQL execution error:', error);
      return {
        success: false,
        message: 'Erro ao executar SQL',
        error: error.message,
        executionTime
      };
    }

    return {
      success: true,
      message: data?.message || 'SQL executado com sucesso',
      executionTime,
      rowsAffected: data?.rowsAffected
    };

  } catch (error: any) {
    console.error('SQL execution exception:', error);
    return {
      success: false,
      message: 'Erro ao executar SQL',
      error: error.message
    };
  }
}

/**
 * Obtém o conteúdo de um arquivo SQL (para preview)
 */
export async function adminGetSQLContent(sqlPath: string): Promise<string> {
  try {
    // Em produção, isso viria de uma API que lê o arquivo
    // Por agora, vamos retornar um placeholder
    return `-- Conteúdo do arquivo: ${sqlPath}\n-- Em produção, isso viria da API`;
  } catch (error: any) {
    console.error('Error getting SQL content:', error);
    return `-- Erro ao carregar conteúdo: ${error.message}`;
  }
}

/**
 * Atualiza o status de execução de um SQL
 */
export async function adminUpdateSQLStatus(
  sqlPath: string, 
  status: SQLFile['status'], 
  executionTime?: number,
  error?: string
): Promise<boolean> {
  try {
    // Em produção, isso salvaria no banco de dados
    console.log('Updating SQL status:', { sqlPath, status, executionTime, error });
    return true;
  } catch (error: any) {
    console.error('Error updating SQL status:', error);
    return false;
  }
}

/**
 * Obtém lista de todos os SQLs com status
 */
export async function adminGetSQLFiles(): Promise<SQLFile[]> {
  try {
    // Em produção, isso viria do banco de dados
    // Por agora, retornamos os dados mock do componente
    return [];
  } catch (error: any) {
    console.error('Error getting SQL files:', error);
    return [];
  }
}
