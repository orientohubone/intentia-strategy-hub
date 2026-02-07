import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTenantData } from "@/hooks/useTenantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Target, TrendingUp, Globe, FileSpreadsheet } from "lucide-react";
import { exportAudiencesCsv } from "@/lib/exportCsv";

type Audience = {
  id: string;
  name: string;
  description: string;
  industry?: string;
  company_size?: string;
  location?: string;
  keywords: string[];
  project_id?: string;
  project_name?: string;
  created_at: string;
};

const sizeConfig = {
  startup: { label: "Startup", color: "bg-blue-100 text-blue-800" },
  small: { label: "Pequena", color: "bg-green-100 text-green-800" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-800" },
  large: { label: "Grande", color: "bg-orange-100 text-orange-800" },
  enterprise: { label: "Enterprise", color: "bg-purple-100 text-purple-800" },
};

export default function Audiences() {
  const { user } = useAuth();
  const { projects } = useTenantData();
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    company_size: "",
    location: "",
    keywords: "",
    project_id: "",
  });

  useEffect(() => {
    fetchAudiences();
  }, [user]);

  const fetchAudiences = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("audiences")
        .select(`
          *,
          projects!inner(name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAudiences((data || []).map((item: any) => ({
        ...item,
        project_name: item.projects?.name,
      })));
    } catch (error) {
      console.error("Erro ao buscar públicos:", error);
      toast.error("Erro ao carregar públicos-alvo");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Nome e descrição são obrigatórios");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        industry: formData.industry.trim() || null,
        company_size: formData.company_size.trim() || null,
        location: formData.location.trim() || null,
        keywords: formData.keywords
          .split(",")
          .map(k => k.trim())
          .filter(Boolean),
        project_id: formData.project_id.trim() || null,
      };

      if (editingId) {
        // Update existing audience
        const { error } = await (supabase as any)
          .from("audiences")
          .update(payload)
          .eq("id", editingId)
          .eq("user_id", user.id);
        
        if (error) throw error;
        toast.success("Público-alvo atualizado com sucesso!");
      } else {
        // Create new audience
        const { error } = await (supabase as any)
          .from("audiences")
          .insert({ ...payload, user_id: user.id });
        
        if (error) throw error;
        toast.success("Público-alvo criado com sucesso!");
      }

      resetForm();
      fetchAudiences();
    } catch (error: any) {
      console.error("Erro ao salvar público-alvo:", error);
      toast.error(error?.message || "Erro ao salvar público-alvo");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      industry: "",
      company_size: "",
      location: "",
      keywords: "",
      project_id: "",
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const startEdit = (audience: Audience) => {
    setEditingId(audience.id);
    setFormData({
      name: audience.name,
      description: audience.description,
      industry: audience.industry || "",
      company_size: audience.company_size || "",
      location: audience.location || "",
      keywords: audience.keywords.join(", "),
      project_id: audience.project_id || "",
    });
    setShowCreateForm(true);
  };

  const filteredAudiences = audiences.filter((audience) =>
    audience.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audience.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Públicos-Alvo</h1>
                <p className="text-sm text-muted-foreground">Gerencie seus públicos-alvo estratégicos.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {audiences.length > 0 && (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => exportAudiencesCsv(audiences.map(a => ({ name: a.name, description: a.description, industry: a.industry, company_size: a.company_size, location: a.location, keywords: a.keywords, project_name: a.project_name, created_at: a.created_at })))}>
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">CSV</span>
                  </Button>
                )}
                <Button size="sm" onClick={() => setShowCreateForm(true)}>
                  <Users className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Novo Público</span>
                </Button>
              </div>
            </div>

            <Input
              placeholder="Buscar públicos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />

            {showCreateForm && (
              <div className="border border-border rounded-lg bg-card p-4 sm:p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {editingId ? "Editar Público-Alvo" : "Novo Público-Alvo"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project">Projeto (opcional)</Label>
                      <select
                        id="project"
                        value={formData.project_id}
                        onChange={(e) => setFormData((prev) => ({ ...prev, project_id: e.target.value }))}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Selecione um projeto</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Público</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Indústria</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                        placeholder="Ex: Tecnologia, Saúde, Financeiro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_size">Porte da Empresa</Label>
                      <select
                        id="company_size"
                        value={formData.company_size}
                        onChange={(e) => setFormData((prev) => ({ ...prev, company_size: e.target.value }))}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Selecione...</option>
                        <option value="startup">Startup</option>
                        <option value="small">Pequena</option>
                        <option value="medium">Média</option>
                        <option value="large">Grande</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                        placeholder="Ex: Brasil, São Paulo, Remoto"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="keywords">Palavras-chave (separadas por vírgula)</Label>
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
                        placeholder="B2B, SaaS, decisores, tecnologia"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit">{editingId ? "Salvar" : "Criar Público"}</Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {loading && <p className="text-sm text-muted-foreground">Carregando públicos...</p>}
            {!loading && filteredAudiences.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum público-alvo encontrado.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAudiences.map((audience) => (
                <div key={audience.id} className="border border-border rounded-lg bg-card p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2 sm:gap-3 mb-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{audience.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{audience.description}</p>
                        </div>
                      </div>
                  {audience.project_name && (
                    <Badge variant="secondary" className="text-xs">{audience.project_name}</Badge>
                  )}

                  <div className="space-y-1.5 sm:space-y-2">
                    {audience.industry && (
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Indústria:</span>
                        <Badge variant="secondary" className="text-xs">{audience.industry}</Badge>
                      </div>
                    )}
                    
                    {audience.company_size && (
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Porte:</span>
                        <Badge variant="secondary" className={`text-xs ${sizeConfig[audience.company_size as keyof typeof sizeConfig]?.color}`}>
                          {sizeConfig[audience.company_size as keyof typeof sizeConfig]?.label}
                        </Badge>
                      </div>
                    )}
                    
                    {audience.location && (
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Local:</span>
                        <Badge variant="secondary" className="text-xs">{audience.location}</Badge>
                      </div>
                    )}
                  </div>

                  {audience.keywords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Palavras-chave:</p>
                      <div className="flex flex-wrap gap-1">
                        {audience.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-border">
                    <Button size="sm" variant="outline" onClick={() => startEdit(audience)}>
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
    </DashboardLayout>
  );
}
