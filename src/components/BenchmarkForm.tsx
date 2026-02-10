import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Target, AlertTriangle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkBenchmarkLimit } from "@/lib/urlAnalyzer";
import { useAuth } from "@/hooks/useAuth";

interface BenchmarkFormProps {
  projectId?: string;
  benchmarkId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface BenchmarkData {
  competitor_name: string;
  competitor_url: string;
  competitor_niche: string;
  overall_score: number;
  value_proposition_score: number;
  offer_clarity_score: number;
  user_journey_score: number;
  value_proposition_analysis: string;
  offer_clarity_analysis: string;
  user_journey_analysis: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategic_insights: string;
  recommendations: string;
}

const initialData: BenchmarkData = {
  competitor_name: "",
  competitor_url: "",
  competitor_niche: "",
  overall_score: 50,
  value_proposition_score: 50,
  offer_clarity_score: 50,
  user_journey_score: 50,
  value_proposition_analysis: "",
  offer_clarity_analysis: "",
  user_journey_analysis: "",
  strengths: [],
  weaknesses: [],
  opportunities: [],
  threats: [],
  strategic_insights: "",
  recommendations: "",
};

export function BenchmarkForm({ 
  projectId, 
  benchmarkId, 
  onSuccess, 
  onCancel 
}: BenchmarkFormProps) {
  const [formData, setFormData] = useState<BenchmarkData>(initialData);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(projectId || "");

  // Arrays para gerenciar tags
  const [newStrength, setNewStrength] = useState("");
  const [newWeakness, setNewWeakness] = useState("");
  const [newOpportunity, setNewOpportunity] = useState("");
  const [newThreat, setNewThreat] = useState("");

  useEffect(() => {
    loadProjects();
    if (benchmarkId) {
      loadBenchmark(benchmarkId);
    }
  }, [benchmarkId]);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar projetos");
    } else {
      setProjects(data || []);
    }
  };

  const loadBenchmark = async (id: string) => {
    const { data, error } = await supabase
      .from("benchmarks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Erro ao carregar benchmark");
    } else if (data) {
      setFormData({
        competitor_name: data.competitor_name,
        competitor_url: data.competitor_url,
        competitor_niche: data.competitor_niche,
        overall_score: data.overall_score,
        value_proposition_score: data.value_proposition_score,
        offer_clarity_score: data.offer_clarity_score,
        user_journey_score: data.user_journey_score,
        value_proposition_analysis: data.value_proposition_analysis || "",
        offer_clarity_analysis: data.offer_clarity_analysis || "",
        user_journey_analysis: data.user_journey_analysis || "",
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        opportunities: data.opportunities || [],
        threats: data.threats || [],
        strategic_insights: data.strategic_insights || "",
        recommendations: data.recommendations || "",
      });
      setSelectedProject(data.project_id);
    }
  };

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      toast.error("Selecione um projeto");
      return;
    }

    // Enforce benchmark limit for new benchmarks (not edits)
    if (!benchmarkId && user) {
      const limitCheck = await checkBenchmarkLimit(user.id);
      if (!limitCheck.allowed) {
        toast.error(`Limite de ${limitCheck.limit} benchmarks atingido no plano Starter. Faça upgrade para criar mais.`);
        return;
      }
    }

    setLoading(true);

    try {
      const submitData = {
        project_id: selectedProject,
        competitor_name: formData.competitor_name,
        competitor_url: formData.competitor_url,
        competitor_niche: formData.competitor_niche,
        overall_score: formData.overall_score,
        value_proposition_score: formData.value_proposition_score,
        offer_clarity_score: formData.offer_clarity_score,
        user_journey_score: formData.user_journey_score,
        value_proposition_analysis: formData.value_proposition_analysis,
        offer_clarity_analysis: formData.offer_clarity_analysis,
        user_journey_analysis: formData.user_journey_analysis,
        strengths: formData.strengths,
        weaknesses: formData.weaknesses,
        opportunities: formData.opportunities,
        threats: formData.threats,
        strategic_insights: formData.strategic_insights,
        recommendations: formData.recommendations,
      };

      let error;
      if (benchmarkId) {
        const result = await supabase
          .from("benchmarks")
          .update(submitData)
          .eq("id", benchmarkId);
        error = result.error;
      } else {
        const result = await supabase
          .from("benchmarks")
          .insert(submitData);
        error = result.error;
      }

      if (error) throw error;

      toast.success(benchmarkId ? "Benchmark atualizado com sucesso" : "Benchmark criado com sucesso");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar benchmark");
    } finally {
      setLoading(false);
    }
  };

  const addTag = (type: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
    }
  };

  const removeTag = (type: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleAddStrength = () => {
    addTag('strengths', newStrength);
    setNewStrength("");
  };

  const handleAddWeakness = () => {
    addTag('weaknesses', newWeakness);
    setNewWeakness("");
  };

  const handleAddOpportunity = () => {
    addTag('opportunities', newOpportunity);
    setNewOpportunity("");
  };

  const handleAddThreat = () => {
    addTag('threats', newThreat);
    setNewThreat("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Concorrente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project">Projeto</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="competitor_name">Nome do Concorrente</Label>
              <Input
                id="competitor_name"
                value={formData.competitor_name}
                onChange={(e) => setFormData(prev => ({ ...prev, competitor_name: e.target.value }))}
                placeholder="Ex: Competidor A"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="competitor_url">URL do Concorrente</Label>
              <Input
                id="competitor_url"
                type="url"
                value={formData.competitor_url}
                onChange={(e) => setFormData(prev => ({ ...prev, competitor_url: e.target.value }))}
                placeholder="https://exemplo.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="competitor_niche">Nichos do Concorrente</Label>
              <Input
                id="competitor_niche"
                value={formData.competitor_niche}
                onChange={(e) => setFormData(prev => ({ ...prev, competitor_niche: e.target.value }))}
                placeholder="Ex: SaaS B2B, FinTech"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scores de Avaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="overall_score">Score Geral (0-100)</Label>
              <Input
                id="overall_score"
                type="number"
                min="0"
                max="100"
                value={formData.overall_score}
                onChange={(e) => setFormData(prev => ({ ...prev, overall_score: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="value_proposition_score">Proposta de Valor (0-100)</Label>
              <Input
                id="value_proposition_score"
                type="number"
                min="0"
                max="100"
                value={formData.value_proposition_score}
                onChange={(e) => setFormData(prev => ({ ...prev, value_proposition_score: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="offer_clarity_score">Clareza da Oferta (0-100)</Label>
              <Input
                id="offer_clarity_score"
                type="number"
                min="0"
                max="100"
                value={formData.offer_clarity_score}
                onChange={(e) => setFormData(prev => ({ ...prev, offer_clarity_score: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="user_journey_score">Jornada do Usuário (0-100)</Label>
              <Input
                id="user_journey_score"
                type="number"
                min="0"
                max="100"
                value={formData.user_journey_score}
                onChange={(e) => setFormData(prev => ({ ...prev, user_journey_score: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análise SWOT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4 text-success" />
              Pontos Fortes
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                placeholder="Adicionar ponto forte"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStrength())}
              />
              <Button type="button" onClick={handleAddStrength} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.strengths.map((strength, index) => (
                <Badge key={index} variant="secondary" className="bg-success/10 text-success border-success/30">
                  {strength}
                  <button
                    type="button"
                    onClick={() => removeTag('strengths', index)}
                    className="ml-1 hover:bg-success/20 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-danger" />
              Pontos Fracos
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newWeakness}
                onChange={(e) => setNewWeakness(e.target.value)}
                placeholder="Adicionar ponto fraco"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddWeakness())}
              />
              <Button type="button" onClick={handleAddWeakness} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.weaknesses.map((weakness, index) => (
                <Badge key={index} variant="secondary" className="bg-danger/10 text-danger border-danger/30">
                  {weakness}
                  <button
                    type="button"
                    onClick={() => removeTag('weaknesses', index)}
                    className="ml-1 hover:bg-danger/20 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-info" />
              Oportunidades
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newOpportunity}
                onChange={(e) => setNewOpportunity(e.target.value)}
                placeholder="Adicionar oportunidade"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOpportunity())}
              />
              <Button type="button" onClick={handleAddOpportunity} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.opportunities.map((opportunity, index) => (
                <Badge key={index} variant="secondary" className="bg-info/10 text-info border-info/30">
                  {opportunity}
                  <button
                    type="button"
                    onClick={() => removeTag('opportunities', index)}
                    className="ml-1 hover:bg-info/20 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Ameaças
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newThreat}
                onChange={(e) => setNewThreat(e.target.value)}
                placeholder="Adicionar ameaça"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddThreat())}
              />
              <Button type="button" onClick={handleAddThreat} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.threats.map((threat, index) => (
                <Badge key={index} variant="secondary" className="bg-warning/10 text-warning border-warning/30">
                  {threat}
                  <button
                    type="button"
                    onClick={() => removeTag('threats', index)}
                    className="ml-1 hover:bg-warning/20 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insights Estratégicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="strategic_insights">Insights Estratégicos</Label>
            <Textarea
              id="strategic_insights"
              value={formData.strategic_insights}
              onChange={(e) => setFormData(prev => ({ ...prev, strategic_insights: e.target.value }))}
              placeholder="Análise estratégica sobre o concorrente..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="recommendations">Recomendações</Label>
            <Textarea
              id="recommendations"
              value={formData.recommendations}
              onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
              placeholder="Recomendações baseadas na análise..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : benchmarkId ? "Atualizar" : "Criar"} Benchmark
        </Button>
      </div>
    </form>
  );
}
