import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, Calendar, Star } from "lucide-react";
import { Report } from "../types";
import { formatDate } from "../utils/formatters";
import { getTypeContainerClass, getTypeIcon, getScoreColor } from "../utils/styles";

interface ReportCardProps {
  report: Report;
  onToggleFavorite: (id: string) => void;
  onDownload: (report: Report, format: "pdf" | "json" | "html") => void;
}

export function ReportCard({ report, onToggleFavorite, onDownload }: ReportCardProps) {
  return (
    <Card className="border-border/80 hover:border-primary/20 hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-3">
              <div
                className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 ${getTypeContainerClass(
                  report.type
                )}`}
              >
                {getTypeIcon(report.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground leading-tight">{report.title}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {report.campaignName && (
                    <Badge variant="outline" className="text-xs">
                      <Megaphone className="h-3 w-3 mr-1" />
                      {report.campaignName}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(report.date)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 w-full lg:w-auto">
            <div className="text-left sm:text-right">
              <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>{report.score}</div>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(report.id)}
                className="p-2"
              >
                <Star
                  className={`h-4 w-4 ${
                    report.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(report, "pdf")}
                className="h-8 px-2 text-[10px] min-w-[56px]"
              >
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(report, "json")}
                className="h-8 px-2 text-[10px] min-w-[56px]"
              >
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(report, "html")}
                className="h-8 px-2 text-[10px] min-w-[56px]"
              >
                HTML
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
