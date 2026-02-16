import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTenantData } from "@/hooks/useTenantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  type CampaignStatus,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_FLOW,
} from "@/lib/operationalTypes";
import type { Campaign, OperationalStats, CampaignGroup, CampaignFormData } from "../types";
import { notifyCampaignCreated, notifyCampaignDeleted, notifyCampaignStatusChanged } from "@/lib/notificationService";
import { defaultFormData } from "../types";

export function useCampaigns() {
  const { user } = useAuth();
  const { projects } = useTenantData();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<OperationalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<CampaignFormData>(defaultFormData);

  useEffect(() => {
    if (user) {
      loadCampaigns();
      loadStats();
    }
  }, [user]);

  const loadCampaigns = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("campaigns")
        .select("*, projects!inner(name)")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((c: any) => ({
        ...c,
        project_name: c.projects?.name || "Sem projeto",
      }));
      setCampaigns(mapped);
    } catch (error: any) {
      console.error("Error loading campaigns:", error);
      toast.error("Erro ao carregar campanhas");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      const { data, error } = await (supabase as any)
        .from("v_operational_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setStats(data || {
        total_campaigns: 0,
        active_campaigns: 0,
        paused_campaigns: 0,
        completed_campaigns: 0,
        draft_campaigns: 0,
        total_budget: 0,
        total_spent: 0,
      });
    } catch (error: any) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.name.trim()) {
      toast.error("Nome da campanha é obrigatório");
      return;
    }
    if (!formData.project_id) {
      toast.error("Selecione um projeto");
      return;
    }
    if (!formData.channel) {
      toast.error("Selecione um canal");
      return;
    }

    try {
      const payload: any = {
        user_id: user.id,
        name: formData.name.trim(),
        project_id: formData.project_id,
        channel: formData.channel,
        objective: formData.objective.trim() || null,
        notes: formData.notes.trim() || null,
        budget_total: formData.budget_total ? parseFloat(formData.budget_total) : 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (editingId) {
        const { error } = await (supabase as any)
          .from("campaigns")
          .update(payload)
          .eq("id", editingId)
          .eq("user_id", user.id);
        if (error) throw error;
        toast.success("Campanha atualizada com sucesso");
      } else {
        const { error } = await (supabase as any)
          .from("campaigns")
          .insert(payload);
        if (error) throw error;
        toast.success("Campanha criada com sucesso");
        notifyCampaignCreated(user.id, formData.name.trim(), formData.channel);
      }

      resetForm();
      loadCampaigns();
      loadStats();
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast.error("Erro ao salvar campanha: " + error.message);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingId(campaign.id);
    setFormData({
      name: campaign.name,
      project_id: campaign.project_id,
      channel: campaign.channel,
      objective: campaign.objective || "",
      notes: campaign.notes || "",
      budget_total: campaign.budget_total ? String(campaign.budget_total) : "",
      start_date: campaign.start_date || "",
      end_date: campaign.end_date || "",
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await (supabase as any)
        .from("campaigns")
        .update({ is_deleted: true })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Campanha excluída com sucesso");
      const camp = campaigns.find(c => c.id === id);
      if (camp) notifyCampaignDeleted(user.id, camp.name);
      loadCampaigns();
      loadStats();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast.error("Erro ao excluir campanha");
    }
  };

  const handleStatusChange = async (id: string, newStatus: CampaignStatus) => {
    if (!user) return;
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "active" && !campaigns.find((c) => c.id === id)?.start_date) {
        updateData.start_date = new Date().toISOString().split("T")[0];
      }
      if (newStatus === "completed") {
        updateData.end_date = new Date().toISOString().split("T")[0];
      }

      const { error } = await (supabase as any)
        .from("campaigns")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success(`Status alterado para ${CAMPAIGN_STATUS_LABELS[newStatus]}`);
      const camp = campaigns.find(c => c.id === id);
      if (camp) notifyCampaignStatusChanged(user.id, camp.name, CAMPAIGN_STATUS_LABELS[newStatus]);
      loadCampaigns();
      loadStats();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Erro ao alterar status");
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setShowCreateForm(false);
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.objective || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || c.status === filterStatus;
      const matchesChannel = filterChannel === "all" || c.channel === filterChannel;
      const matchesProject = filterProject === "all" || c.project_id === filterProject;
      return matchesSearch && matchesStatus && matchesChannel && matchesProject;
    });
  }, [campaigns, searchTerm, filterStatus, filterChannel, filterProject]);

  const groupedCampaigns = useMemo<CampaignGroup[]>(() => {
    const groups: Record<string, CampaignGroup> = {};
    filteredCampaigns.forEach((c) => {
      const key = c.project_id;
      if (!groups[key]) {
        groups[key] = { projectId: key, projectName: c.project_name || "Sem projeto", campaigns: [] };
      }
      groups[key].campaigns.push(c);
    });
    return Object.values(groups).sort((a, b) => a.projectName.localeCompare(b.projectName));
  }, [filteredCampaigns]);

  const expandAll = () => {
    const allKeys = groupedCampaigns.map((g) => g.projectId);
    setExpandedGroups(new Set(allKeys));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  return {
    user,
    projects,
    campaigns,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterChannel,
    setFilterChannel,
    filterProject,
    setFilterProject,
    showCreateForm,
    setShowCreateForm,
    editingId,
    expandedGroups,
    formData,
    setFormData,
    groupedCampaigns,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleStatusChange,
    resetForm,
    toggleGroup,
    expandAll,
    collapseAll,
    loadCampaigns,
    loadStats,
  };
}
