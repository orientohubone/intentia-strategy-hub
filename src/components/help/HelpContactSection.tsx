import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Mail, Phone } from "lucide-react";

export function HelpContactSection() {
  return (
    <Card>
      <CardHeader className="px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          Precisa de mais ajuda?
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Entre em contato com nossa equipe
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm">Email</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">intentia@orientohub.com.br</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Respondemos em até 24h úteis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm">Telefone</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">+55 (14) 99861-8547</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Seg a Sex, 9h às 18h</p>
            </div>
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4 text-center">
          Uma solução do ecossistema <a href="https://orientohub.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">orientohub.com.br</a>
        </p>
      </CardContent>
    </Card>
  );
}
