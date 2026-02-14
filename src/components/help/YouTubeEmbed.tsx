import { useState, useRef, useEffect } from "react";
import { Play, Video } from "lucide-react";
import { drawThumbnail } from "./HelpThumbnails";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  categoryId?: string;
  categoryTitle?: string;
  categoryDescription?: string;
}

export function YouTubeEmbed({ videoId, title = "Vídeo explicativo", categoryId, categoryTitle, categoryDescription }: YouTubeEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!videoId && categoryId && categoryTitle && categoryDescription && canvasRef.current) {
      document.fonts.ready.then(() => {
        if (canvasRef.current) {
          drawThumbnail(canvasRef.current, categoryId, categoryTitle, categoryDescription);
        }
      });
    }
  }, [videoId, categoryId, categoryTitle, categoryDescription]);

  if (!videoId) {
    if (categoryId && categoryTitle && categoryDescription) {
      return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-black">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
            style={{ aspectRatio: "1280 / 720" }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white/60 ml-0.5" fill="white" fillOpacity={0.6} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-white/70 font-medium">Vídeo em breve</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-video rounded-lg bg-muted/40 border border-dashed border-border flex flex-col items-center justify-center gap-2">
        <Video className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-[10px] sm:text-xs text-muted-foreground/60 font-medium">Vídeo em breve</p>
      </div>
    );
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  if (!loaded) {
    return (
      <button
        onClick={() => setLoaded(true)}
        className="relative w-full aspect-video rounded-lg overflow-hidden group cursor-pointer border border-border bg-black"
        aria-label={`Reproduzir: ${title}`}
      >
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white ml-0.5" fill="white" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3">
          <p className="text-[10px] sm:text-xs text-white/90 font-medium truncate">{title}</p>
        </div>
      </button>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
