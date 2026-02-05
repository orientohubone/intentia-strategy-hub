import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function Help() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Ajuda</h1>
            <p className="text-muted-foreground">
              Em breve: base de conhecimento e suporte.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
