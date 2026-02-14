import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportDashboard } from "@/components/SupportDashboard";
import { 
  MessageCircle, 
  Users, 
  Settings, 
  FileText,
  Shield,
  ArrowLeft
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";

export default function AdminSupportPage() {
  const { user: adminUser } = useAdminAuth();

  return (
    <AdminProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Atendimentos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os chamados de suporte dos clientes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Admin: {adminUser?.name || 'Suporte'}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <SupportDashboard />
      </div>
    </AdminProtectedRoute>
  );
}
