import React, { useState } from 'react';
import { Database, FileText, Play, CheckCircle, XCircle, Clock, FolderOpen, Search, Filter, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { adminExecuteSQL, adminUpdateSQLStatus } from '@/lib/adminDatabaseApi';
import { toast } from 'sonner';

interface SQLFile {
  name: string;
  path: string;
  category: string;
  description: string;
  status: 'executed' | 'pending' | 'error';
  lastExecuted?: string;
  executionTime?: string;
}

interface SQLCategory {
  name: string;
  description: string;
  icon: React.ReactNode;
  files: SQLFile[];
  order: number;
}

const DatabaseManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['01_schema']));
  const [executingFile, setExecutingFile] = useState<string | null>(null);
  const [sqlFiles, setSqlFiles] = useState<SQLFile[]>([]);

  // Mock data - em produção viria do backend
  const sqlCategories: SQLCategory[] = [
    {
      name: '00_setup',
      description: 'Setup inicial do banco',
      icon: <Database className="h-4 w-4" />,
      order: 0,
      files: [
        {
          name: 'schema.sql',
          path: 'sql/00_setup/schema.sql',
          category: '00_setup',
          description: 'Schema base (tenant_settings, projects)',
          status: 'executed',
          lastExecuted: '2026-02-17 18:30:00',
          executionTime: '2.3s'
        },
        {
          name: 'storage_setup.sql',
          path: 'sql/00_setup/storage_setup.sql',
          category: '00_setup',
          description: 'Configuração do bucket avatars',
          status: 'executed',
          lastExecuted: '2026-02-17 18:31:00',
          executionTime: '1.1s'
        },
        {
          name: 'verify_isolated_setup.sql',
          path: 'sql/00_setup/verify_isolated_setup.sql',
          category: '00_setup',
          description: 'Setup para verificação por e-mail',
          status: 'executed',
          lastExecuted: '2026-02-17 18:37:00',
          executionTime: '0.8s'
        },
        {
          name: 'EXECUTION_ORDER.md',
          path: 'sql/00_setup/EXECUTION_ORDER.md',
          category: '00_setup',
          description: 'Guia de execução passo a passo',
          status: 'executed',
          lastExecuted: '2026-02-17 18:30:00',
          executionTime: '0.1s'
        }
      ]
    },
    {
      name: '01_schema',
      description: 'Schema de tabelas principais',
      icon: <FileText className="h-4 w-4" />,
      order: 1,
      files: [
        {
          name: 'main_schema.sql',
          path: 'sql/01_schema/schema.sql',
          category: '01_schema',
          description: 'Schema principal',
          status: 'executed',
          lastExecuted: '2026-02-17 18:30:00',
          executionTime: '2.3s'
        },
        {
          name: 'tactical_schema.sql',
          path: 'sql/01_schema/tactical_schema.sql',
          category: '01_schema',
          description: 'Camada tática (5 tabelas)',
          status: 'pending'
        },
        {
          name: 'ad_integrations.sql',
          path: 'sql/01_schema/ad_integrations.sql',
          category: '01_schema',
          description: 'Integrações com APIs de marketing',
          status: 'pending'
        },
        {
          name: 'budget_management.sql',
          path: 'sql/01_schema/budget_management.sql',
          category: '01_schema',
          description: 'Gestão de budget e pacing',
          status: 'pending'
        },
        {
          name: 'campaign_calendar.sql',
          path: 'sql/01_schema/campaign_calendar.sql',
          category: '01_schema',
          description: 'Calendário de campanhas',
          status: 'pending'
        },
        {
          name: 'operational_schema.sql',
          path: 'sql/01_schema/operational_schema.sql',
          category: '01_schema',
          description: 'Schema operacional (campanhas, métricas)',
          status: 'pending'
        },
        {
          name: 'benchmarks_schema.sql',
          path: 'sql/01_schema/benchmarks_schema.sql',
          category: '01_schema',
          description: 'Schema de benchmarks competitivos',
          status: 'pending'
        },
        {
          name: 'contact_messages_schema.sql',
          path: 'sql/01_schema/contact_messages_schema.sql',
          category: '01_schema',
          description: 'Schema de mensagens de contato',
          status: 'pending'
        },
        {
          name: 'notifications_schema.sql',
          path: 'sql/01_schema/notifications_schema.sql',
          category: '01_schema',
          description: 'Schema de notificações',
          status: 'pending'
        },
        {
          name: 'status_page_schema.sql',
          path: 'sql/01_schema/status_page_schema.sql',
          category: '01_schema',
          description: 'Schema de status page',
          status: 'pending'
        },
        {
          name: 'support_tickets.sql',
          path: 'sql/01_schema/support_tickets.sql',
          category: '01_schema',
          description: 'Schema de tickets de suporte',
          status: 'pending'
        },
        {
          name: 'seo_analysis_history_schema.sql',
          path: 'sql/01_schema/seo_analysis_history_schema.sql',
          category: '01_schema',
          description: 'Schema de histórico de análise SEO',
          status: 'pending'
        },
        {
          name: 'status_subscribers_schema.sql',
          path: 'sql/01_schema/status_subscribers_schema.sql',
          category: '01_schema',
          description: 'Schema de inscritos na status page',
          status: 'pending'
        }
      ]
    },
    {
      name: '02_security',
      description: 'Segurança, RLS, Admin',
      icon: <CheckCircle className="h-4 w-4" />,
      order: 2,
      files: [
        {
          name: 'security_hardening.sql',
          path: 'sql/02_security/security_hardening.sql',
          category: '02_security',
          description: 'Hardening de segurança',
          status: 'executed',
          lastExecuted: '2026-02-17 18:32:00',
          executionTime: '1.5s'
        },
        {
          name: 'audit_log.sql',
          path: 'sql/02_security/audit_log.sql',
          category: '02_security',
          description: 'Sistema de auditoria',
          status: 'executed',
          lastExecuted: '2026-02-17 18:33:00',
          executionTime: '1.2s'
        },
        {
          name: 'guardrails.sql',
          path: 'sql/02_security/guardrails.sql',
          category: '02_security',
          description: 'Rate limiting e soft delete',
          status: 'executed',
          lastExecuted: '2026-02-17 18:34:00',
          executionTime: '2.1s'
        },
        {
          name: 'admin_schema.sql',
          path: 'sql/02_security/admin_schema.sql',
          category: '02_security',
          description: 'Admin Panel schema',
          status: 'pending'
        },
        {
          name: 'admin_integrations_upgrade.sql',
          path: 'sql/02_security/admin_integrations_upgrade.sql',
          category: '02_security',
          description: 'Upgrade de integrações admin',
          status: 'pending'
        },
        {
          name: 'admin_rls_fix.sql',
          path: 'sql/02_security/admin_rls_fix.sql',
          category: '02_security',
          description: 'Fix de RLS admin',
          status: 'pending'
        },
        {
          name: 'admin_support_policies.sql',
          path: 'sql/02_security/admin_support_policies.sql',
          category: '02_security',
          description: 'Políticas de suporte admin',
          status: 'pending'
        },
        {
          name: 'admin_tenant_fix.sql',
          path: 'sql/02_security/admin_tenant_fix.sql',
          category: '02_security',
          description: 'Fix de tenant admin',
          status: 'pending'
        },
        {
          name: 'security_audit_fix.sql',
          path: 'sql/02_security/security_audit_fix.sql',
          category: '02_security',
          description: 'Fix de auditoria de segurança',
          status: 'pending'
        },
        {
          name: 'enable_support_rls.sql',
          path: 'sql/02_security/enable_support_rls.sql',
          category: '02_security',
          description: 'Habilitar RLS de suporte',
          status: 'pending'
        },
        {
          name: 'simple_admin_policies.sql',
          path: 'sql/02_security/simple_admin_policies.sql',
          category: '02_security',
          description: 'Políticas admin simplificadas',
          status: 'pending'
        },
        {
          name: 'status_rls_fix.sql',
          path: 'sql/02_security/status_rls_fix.sql',
          category: '02_security',
          description: 'Fix de RLS de status',
          status: 'pending'
        }
      ]
    },
    {
      name: '03_features',
      description: 'Features específicas',
      icon: <Clock className="h-4 w-4" />,
      order: 3,
      files: [
        {
          name: 'user_backup.sql',
          path: 'sql/03_features/user_backup.sql',
          category: '03_features',
          description: 'Sistema de backup',
          status: 'executed',
          lastExecuted: '2026-02-17 18:35:00',
          executionTime: '1.8s'
        },
        {
          name: 'benchmark_ai_analysis.sql',
          path: 'sql/03_features/benchmark_ai_analysis.sql',
          category: '03_features',
          description: 'Análise IA para benchmarks',
          status: 'pending'
        },
        {
          name: 'insights_ai_enrichment.sql',
          path: 'sql/03_features/insights_ai_enrichment.sql',
          category: '03_features',
          description: 'Enriquecimento de insights com IA',
          status: 'pending'
        },
        {
          name: 'enable_ai_for_starter.sql',
          path: 'sql/03_features/enable_ai_for_starter.sql',
          category: '03_features',
          description: 'Habilitar IA para plano Starter',
          status: 'pending'
        },
        {
          name: 'enable_google_meta_professional.sql',
          path: 'sql/03_features/enable_google_meta_professional.sql',
          category: '03_features',
          description: 'Habilitar Google/Meta para Professional',
          status: 'pending'
        },
        {
          name: 'enable_integrations_professional.sql',
          path: 'sql/03_features/enable_integrations_professional.sql',
          category: '03_features',
          description: 'Habilitar integrações para Professional',
          status: 'pending'
        },
        {
          name: 'enable_integrations_professional_only.sql',
          path: 'sql/03_features/enable_integrations_professional_only.sql',
          category: '03_features',
          description: 'Integrações exclusivas Professional',
          status: 'pending'
        },
        {
          name: 'operational_phase2_metrics.sql',
          path: 'sql/03_features/operational_phase2_metrics.sql',
          category: '03_features',
          description: 'Métricas operacionais fase 2',
          status: 'pending'
        },
        {
          name: 'operational_phase2b_google_metrics.sql',
          path: 'sql/03_features/operational_phase2b_google_metrics.sql',
          category: '03_features',
          description: 'Métricas Google Ads fase 2b',
          status: 'pending'
        },
        {
          name: 'campaign_performance_ai.sql',
          path: 'sql/03_features/campaign_performance_ai.sql',
          category: '03_features',
          description: 'Performance de campanha com IA',
          status: 'pending'
        },
        {
          name: 'sync_budget_spent_trigger.sql',
          path: 'sql/03_features/sync_budget_spent_trigger.sql',
          category: '03_features',
          description: 'Trigger de sincronização de budget',
          status: 'pending'
        }
      ]
    },
    {
      name: '04_migrations',
      description: 'Migrações e updates',
      icon: <Filter className="h-4 w-4" />,
      order: 4,
      files: [
        {
          name: 'add_project_to_audiences.sql',
          path: 'sql/04_migrations/add_project_to_audiences.sql',
          category: '04_migrations',
          description: 'Update audiences',
          status: 'executed',
          lastExecuted: '2026-02-17 18:36:00',
          executionTime: '0.9s'
        },
        {
          name: 'audiences_schema.sql',
          path: 'sql/04_migrations/audiences_schema.sql',
          category: '04_migrations',
          description: 'Schema de audiências',
          status: 'pending'
        },
        {
          name: 'add_authenticated_rls_policies.sql',
          path: 'sql/04_migrations/add_authenticated_rls_policies.sql',
          category: '04_migrations',
          description: 'Adicionar políticas RLS autenticadas',
          status: 'pending'
        },
        {
          name: 'add_benchmarks_structured_data.sql',
          path: 'sql/04_migrations/add_benchmarks_structured_data.sql',
          category: '04_migrations',
          description: 'Adicionar dados estruturados de benchmarks',
          status: 'pending'
        },
        {
          name: 'add_html_snapshot_structured_data.sql',
          path: 'sql/04_migrations/add_html_snapshot_structured_data.sql',
          category: '04_migrations',
          description: 'Adicionar HTML snapshot estruturado',
          status: 'pending'
        },
        {
          name: 'add_icp_enrichment.sql',
          path: 'sql/04_migrations/add_icp_enrichment.sql',
          category: '04_migrations',
          description: 'Adicionar enriquecimento ICP',
          status: 'pending'
        },
        {
          name: 'add_max_audiences_column.sql',
          path: 'sql/04_migrations/add_max_audiences_column.sql',
          category: '04_migrations',
          description: 'Adicionar coluna max_audiences',
          status: 'pending'
        },
        {
          name: 'add_max_projects_column.sql',
          path: 'sql/04_migrations/add_max_projects_column.sql',
          category: '04_migrations',
          description: 'Adicionar coluna max_projects',
          status: 'pending'
        },
        {
          name: 'add_operations_feature.sql',
          path: 'sql/04_migrations/add_operations_feature.sql',
          category: '04_migrations',
          description: 'Adicionar feature de operações',
          status: 'pending'
        },
        {
          name: 'apply_benchmarks_schema.sql',
          path: 'sql/04_migrations/apply_benchmarks_schema.sql',
          category: '04_migrations',
          description: 'Aplicar schema de benchmarks',
          status: 'pending'
        },
        {
          name: 'auto_tenant_creation.sql',
          path: 'sql/04_migrations/auto_tenant_creation.sql',
          category: '04_migrations',
          description: 'Criação automática de tenant',
          status: 'pending'
        },
        {
          name: 'migrate_meta_user_to_professional.sql',
          path: 'sql/04_migrations/migrate_meta_user_to_professional.sql',
          category: '04_migrations',
          description: 'Migrar meta user para professional',
          status: 'pending'
        },
        {
          name: 'update_starter_plan.sql',
          path: 'sql/04_migrations/update_starter_plan.sql',
          category: '04_migrations',
          description: 'Atualizar plano Starter',
          status: 'pending'
        },
        {
          name: 'clean_update_integrations.sql',
          path: 'sql/04_migrations/clean_update_integrations.sql',
          category: '04_migrations',
          description: 'Limpeza de atualização de integrações',
          status: 'pending'
        },
        {
          name: 'fix_audit_log_fk.sql',
          path: 'sql/04_migrations/fix_audit_log_fk.sql',
          category: '04_migrations',
          description: 'Fix de FK audit_log',
          status: 'pending'
        },
        {
          name: 'fix_operations_starter.sql',
          path: 'sql/04_migrations/fix_operations_starter.sql',
          category: '04_migrations',
          description: 'Fix de operações Starter',
          status: 'pending'
        },
        {
          name: 'fix_overrides_rls.sql',
          path: 'sql/04_migrations/fix_overrides_rls.sql',
          category: '04_migrations',
          description: 'Fix de RLS overrides',
          status: 'pending'
        },
        {
          name: 'fix_seo_performance_features.sql',
          path: 'sql/04_migrations/fix_seo_performance_features.sql',
          category: '04_migrations',
          description: 'Fix de features SEO performance',
          status: 'pending'
        },
        {
          name: 'fix_ticket_trigger.sql',
          path: 'sql/04_migrations/fix_ticket_trigger.sql',
          category: '04_migrations',
          description: 'Fix de trigger de tickets',
          status: 'pending'
        },
        {
          name: 'fix_views_security.sql',
          path: 'sql/04_migrations/fix_views_security.sql',
          category: '04_migrations',
          description: 'Fix de segurança de views',
          status: 'pending'
        },
        {
          name: 'update_integrations_control.sql',
          path: 'sql/04_migrations/update_integrations_control.sql',
          category: '04_migrations',
          description: 'Atualizar controle de integrações',
          status: 'pending'
        },
        {
          name: 'update_integrations_feature_names.sql',
          path: 'sql/04_migrations/update_integrations_feature_names.sql',
          category: '04_migrations',
          description: 'Atualizar nomes de features integrações',
          status: 'pending'
        },
        {
          name: 'update_integrations_status_messages.sql',
          path: 'sql/04_migrations/update_integrations_status_messages.sql',
          category: '04_migrations',
          description: 'Atualizar mensagens de status integrações',
          status: 'pending'
        },
        {
          name: 'update_screen_features.sql',
          path: 'sql/04_migrations/update_screen_features.sql',
          category: '04_migrations',
          description: 'Atualizar features de tela',
          status: 'pending'
        },
        {
          name: 'update_seo_features.sql',
          path: 'sql/04_migrations/update_seo_features.sql',
          category: '04_migrations',
          description: 'Atualizar features SEO',
          status: 'pending'
        },
        {
          name: 'setup_seo_performance_category.sql',
          path: 'sql/04_migrations/setup_seo_performance_category.sql',
          category: '04_migrations',
          description: 'Setup categoria SEO performance',
          status: 'pending'
        }
      ]
    },
    {
      name: '05_utils',
      description: 'SQLs utilitários e debug',
      icon: <Search className="h-4 w-4" />,
      order: 5,
      files: [
        {
          name: 'check_user_exists.sql',
          path: 'sql/05_utils/check_user_exists.sql',
          category: '05_utils',
          description: 'Verificação de usuário',
          status: 'executed',
          lastExecuted: '2026-02-17 18:37:00',
          executionTime: '0.3s'
        },
        {
          name: 'debug_auth_error.sql',
          path: 'sql/05_utils/debug_auth_error.sql',
          category: '05_utils',
          description: 'Debug de autenticação',
          status: 'executed',
          lastExecuted: '2026-02-17 18:38:00',
          executionTime: '0.4s'
        },
        {
          name: 'fix_meta_user.sql',
          path: 'sql/05_utils/fix_meta_user.sql',
          category: '05_utils',
          description: 'Limpeza de dados',
          status: 'executed',
          lastExecuted: '2026-02-17 18:39:00',
          executionTime: '0.2s'
        },
        {
          name: 'create_meta_user.sql',
          path: 'sql/05_utils/create_meta_user.sql',
          category: '05_utils',
          description: 'Criação manual',
          status: 'executed',
          lastExecuted: '2026-02-17 18:40:00',
          executionTime: '0.5s'
        },
        {
          name: 'create_user_via_auth.sql',
          path: 'sql/05_utils/create_user_via_auth.sql',
          category: '05_utils',
          description: 'Criação via auth',
          status: 'executed',
          lastExecuted: '2026-02-17 18:41:00',
          executionTime: '0.6s'
        },
        {
          name: 'check_app_url.sql',
          path: 'sql/05_utils/check_app_url.sql',
          category: '05_utils',
          description: 'Verificação de APP_URL',
          status: 'executed',
          lastExecuted: '2026-02-17 18:42:00',
          executionTime: '0.1s'
        },
        {
          name: 'check_feature_details.sql',
          path: 'sql/05_utils/check_feature_details.sql',
          category: '05_utils',
          description: 'Verificar detalhes de features',
          status: 'pending'
        },
        {
          name: 'check_founder_role.sql',
          path: 'sql/05_utils/check_founder_role.sql',
          category: '05_utils',
          description: 'Verificar role founder',
          status: 'pending'
        },
        {
          name: 'check_screen_features.sql',
          path: 'sql/05_utils/check_screen_features.sql',
          category: '05_utils',
          description: 'Verificar features de tela',
          status: 'pending'
        },
        {
          name: 'create_meta_tenant_only.sql',
          path: 'sql/05_utils/create_meta_tenant_only.sql',
          category: '05_utils',
          description: 'Criar meta tenant apenas',
          status: 'pending'
        },
        {
          name: 'create_meta_test_user.sql',
          path: 'sql/05_utils/create_meta_test_user.sql',
          category: '05_utils',
          description: 'Criar meta test user',
          status: 'pending'
        },
        {
          name: 'create_meta_test_user_v2.sql',
          path: 'sql/05_utils/create_meta_test_user_v2.sql',
          category: '05_utils',
          description: 'Criar meta test user v2',
          status: 'pending'
        },
        {
          name: 'create_support_tables.sql',
          path: 'sql/05_utils/create_support_tables.sql',
          category: '05_utils',
          description: 'Criar tabelas de suporte',
          status: 'pending'
        },
        {
          name: 'create_support_tables_safe.sql',
          path: 'sql/05_utils/create_support_tables_safe.sql',
          category: '05_utils',
          description: 'Criar tabelas de suporte seguras',
          status: 'pending'
        },
        {
          name: 'create_test_user.sql',
          path: 'sql/05_utils/create_test_user.sql',
          category: '05_utils',
          description: 'Criar test user',
          status: 'pending'
        },
        {
          name: 'debug_features.sql',
          path: 'sql/05_utils/debug_features.sql',
          category: '05_utils',
          description: 'Debug de features',
          status: 'pending'
        },
        {
          name: 'debug_support.sql',
          path: 'sql/05_utils/debug_support.sql',
          category: '05_utils',
          description: 'Debug de suporte',
          status: 'pending'
        },
        {
          name: 'identify_founder.sql',
          path: 'sql/05_utils/identify_founder.sql',
          category: '05_utils',
          description: 'Identificar founder',
          status: 'pending'
        },
        {
          name: 'disable_rls.sql',
          path: 'sql/05_utils/disable_rls.sql',
          category: '05_utils',
          description: 'Desabilitar RLS',
          status: 'pending'
        },
        {
          name: 'force_admin_refresh.sql',
          path: 'sql/05_utils/force_admin_refresh.sql',
          category: '05_utils',
          description: 'Forçar refresh admin',
          status: 'pending'
        },
        {
          name: 'improved_admin_view.sql',
          path: 'sql/05_utils/improved_admin_view.sql',
          category: '05_utils',
          description: 'View admin melhorada',
          status: 'pending'
        },
        {
          name: 'fixed_admin_view.sql',
          path: 'sql/05_utils/fixed_admin_view.sql',
          category: '05_utils',
          description: 'View admin corrigida',
          status: 'pending'
        },
        {
          name: 'sample_notifications.sql',
          path: 'sql/05_utils/sample_notifications.sql',
          category: '05_utils',
          description: 'Notificações de exemplo',
          status: 'pending'
        },
        {
          name: 'verify_feature_updates.sql',
          path: 'sql/05_utils/verify_feature_updates.sql',
          category: '05_utils',
          description: 'Verificar atualizações de features',
          status: 'pending'
        },
        {
          name: 'verify_features.sql',
          path: 'sql/05_utils/verify_features.sql',
          category: '05_utils',
          description: 'Verificar features',
          status: 'pending'
        }
      ]
    },
    {
      name: '06_views',
      description: 'Views e funções',
      icon: <FolderOpen className="h-4 w-4" />,
      order: 6,
      files: [
        {
          name: 'backupschema.sql',
          path: 'sql/06_views/backupschema.sql',
          category: '06_views',
          description: 'Schema de backup',
          status: 'pending'
        }
      ]
    }
  ];

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Função para executar SQL
  const handleExecuteSQL = async (sqlPath: string, fileName: string) => {
    setExecutingFile(sqlPath);
    
    try {
      toast.loading(`Executando ${fileName}...`, { id: 'sql-execution' });
      
      const result = await adminExecuteSQL(sqlPath);
      
      if (result.success) {
        toast.success(`${fileName} executado com sucesso!`, { id: 'sql-execution' });
        
        // Atualizar status do arquivo
        await adminUpdateSQLStatus(
          sqlPath, 
          'executed', 
          result.executionTime
        );
        
        // Atualizar estado local (em produção viria do backend)
        setSqlFiles(prev => prev.map(file => 
          file.path === sqlPath 
            ? { 
                ...file, 
                status: 'executed',
                lastExecuted: new Date().toLocaleString('pt-BR'),
                executionTime: result.executionTime ? `${result.executionTime}ms` : undefined
              }
            : file
        ));
        
      } else {
        toast.error(`Erro ao executar ${fileName}: ${result.error}`, { id: 'sql-execution' });
        
        // Atualizar status para erro
        await adminUpdateSQLStatus(sqlPath, 'error', undefined, result.error);
        
        setSqlFiles(prev => prev.map(file => 
          file.path === sqlPath 
            ? { ...file, status: 'error' }
            : file
        ));
      }
      
    } catch (error: any) {
      toast.error(`Erro inesperado ao executar ${fileName}`, { id: 'sql-execution' });
      console.error('SQL execution error:', error);
    } finally {
      setExecutingFile(null);
    }
  };

  const getStatusIcon = (status: SQLFile['status']) => {
    switch (status) {
      case 'executed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: SQLFile['status']) => {
    switch (status) {
      case 'executed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Executado</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const filteredCategories = sqlCategories
    .filter(cat => selectedCategory === 'all' || cat.name === selectedCategory)
    .filter(cat => 
      cat.files.some(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const totalFiles = sqlCategories.reduce((acc, cat) => acc + cat.files.length, 0);
  const executedFiles = sqlCategories.reduce((acc, cat) => 
    acc + cat.files.filter(f => f.status === 'executed').length, 0
  );
  const pendingFiles = sqlCategories.reduce((acc, cat) => 
    acc + cat.files.filter(f => f.status === 'pending').length, 0
  );
  const errorFiles = sqlCategories.reduce((acc, cat) => 
    acc + cat.files.filter(f => f.status === 'error').length, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Management</h2>
          <p className="text-muted-foreground">
            Gerencie scripts SQL, schema e migrações do banco de dados
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total de Arquivos</p>
                <p className="text-2xl font-bold">{totalFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Executados</p>
                <p className="text-2xl font-bold">{executedFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold">{pendingFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Com Erro</p>
                <p className="text-2xl font-bold">{errorFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivos SQL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {sqlCategories.map(cat => (
              <TabsTrigger key={cat.name} value={cat.name}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* SQL Files List */}
      <div className="space-y-4">
        {filteredCategories.map(category => (
          <Collapsible
            key={category.name}
            open={expandedCategories.has(category.name)}
            onOpenChange={() => toggleCategory(category.name)}
          >
            <CollapsibleTrigger asChild>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {category.icon}
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{category.files.length} arquivos</Badge>
                      <Badge variant="outline">
                        {category.files.filter(f => f.status === 'executed').length} executados
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pl-4 space-y-2">
                {category.files
                  .filter(file => 
                    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    file.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(file => (
                    <Card key={file.path} className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(file.status)}
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">{file.description}</p>
                              {file.lastExecuted && (
                                <p className="text-xs text-muted-foreground">
                                  Executado: {file.lastExecuted} ({file.executionTime})
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(file.status)}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled={executingFile === file.path}
                                >
                                  {executingFile === file.path ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      Executando...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-1" />
                                      Executar
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Execução</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja executar o arquivo <strong>{file.name}</strong>?
                                    <br /><br />
                                    <span className="text-sm text-muted-foreground">
                                      {file.description}
                                    </span>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleExecuteSQL(file.path, file.name)}
                                    disabled={executingFile === file.path}
                                  >
                                    {executingFile === file.path ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        Executando...
                                      </>
                                    ) : (
                                      'Executar SQL'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default DatabaseManagement;
