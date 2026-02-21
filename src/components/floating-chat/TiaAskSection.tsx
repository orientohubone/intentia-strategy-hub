import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type TiaMessage = { role: "user" | "assistant"; content: string };

interface Props {
  messages: TiaMessage[];
  input: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function TiaAskSection({ messages, input, loading, onChange, onSend }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">Pergunte para a Tia</p>
        {loading && <span className="text-[10px] text-primary">Processando...</span>}
      </div>
      <div className="flex flex-col gap-2 pr-1">
        {messages.map((m, idx) => (
          <div
            key={`${m.role}-${idx}`}
            className={`text-xs leading-relaxed p-2 rounded-lg border ${
              m.role === "assistant"
                ? "bg-primary/5 border-primary/30 text-foreground"
                : "bg-card border-border text-foreground"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Pergunte sobre seu projeto, análises ou próximos passos"
          className="h-9 text-xs"
        />
        <Button size="sm" className="h-9 text-xs" onClick={onSend} disabled={loading}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
