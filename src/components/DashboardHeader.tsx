import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsDropdown } from "./NotificationsDropdown";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fullName = (user?.user_metadata?.full_name as string | undefined) || user?.email || "Usuário";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar projetos, públicos..." 
            className="pl-10 bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="hero" size="sm" className="gap-2" onClick={() => navigate("/projects")}> 
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
        
        <NotificationsDropdown />

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">{fullName}</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
