import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ExternalLink
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-500/20 bg-green-500/10";
      case "warning":
        return "border-yellow-500/20 bg-yellow-500/10";
      case "error":
        return "border-red-500/20 bg-red-500/10";
      default:
        return "border-blue-500/20 bg-blue-500/10";
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={unreadCount > 0 ? `Notificações, ${unreadCount} ${unreadCount === 1 ? 'não lida' : 'não lidas'}` : "Notificações"}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full text-[10px] font-bold text-primary-foreground flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <Card
            className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-12 w-auto sm:w-96 max-h-[calc(100vh-5rem)] sm:max-h-[500px] z-50 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Notificações"
          >
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg">Notificações</CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-[10px] sm:text-xs h-7 px-2"
                    >
                      <CheckCheck className="h-3 w-3 mr-0.5 sm:mr-1" aria-hidden="true" />
                      <span className="hidden sm:inline">Marcar todas como lidas</span>
                      <span className="sm:hidden">Ler todas</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-12rem)] sm:h-96">
                  <div className="p-1.5 sm:p-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-2.5 sm:p-3 rounded-lg border mb-1.5 sm:mb-2 cursor-pointer transition-colors",
                          getNotificationColor(notification.type),
                          !notification.read && "font-semibold"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                              <h4 className="text-xs sm:text-sm font-medium text-foreground truncate">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                              )}
                            </div>
                            
                            <p className="text-[11px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] sm:text-xs text-muted-foreground">
                                {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                {notification.action_url && (
                                  <Link
                                    to={notification.action_url}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                  >
                                    {notification.action_text || "Ver"}
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  aria-label="Excluir notificação"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
