import React, { useState } from 'react';
import { Database, FileText, Play, CheckCircle, XCircle, Clock, FolderOpen, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
          name: 'schema.sql',
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
          status: 'pending',
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
          name: 'notifications.sql',
          path: 'sql/03_features/notifications.sql',
          category: '03_features',
          description: 'Sistema de notificações',
          status: 'pending'
        },
        {
          name: 'ai_analysis.sql',
          path: 'sql/03_features/ai_analysis.sql',
          category: '03_features',
          description: 'Análise por IA',
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
          name: 'v_dashboard_stats.sql',
          path: 'sql/06_views/v_dashboard_stats.sql',
          category: '06_views',
          description: 'Views do dashboard',
          status: 'pending'
        },
        {
          name: 'v_project_summary.sql',
          path: 'sql/06_views/v_project_summary.sql',
          category: '06_views',
          description: 'Resumo de projetos',
          status: 'pending'
        },
        {
          name: 'v_verification_summary.sql',
          path: 'sql/06_views/v_verification_summary.sql',
          category: '06_views',
          description: 'Logs de verificação',
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
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4 mr-1" />
                              Executar
                            </Button>
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
