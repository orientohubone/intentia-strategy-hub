import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

export type TiaMessage = { role: "user" | "assistant"; content: string };

interface Props {
  messages: TiaMessage[];
  input: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function TiaAskSection({ messages, input, loading, onChange, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll parent container to bottom when new messages arrive
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  return (
    <>
      {/* Messages — no internal scroll, flows in parent */}
      <div className="flex flex-col gap-2.5">
        {messages.map((m, idx) => (
          <div
            key={`${m.role}-${idx}`}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] text-[13px] leading-relaxed px-3 py-2 ${
                m.role === "assistant"
                  ? "bg-primary/5 border border-primary/20 rounded-2xl rounded-bl-md text-foreground"
                  : "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="tia-markdown prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0 [&>ul]:mb-1.5 [&>ul]:pl-4 [&>ol]:mb-1.5 [&>ol]:pl-4 [&>li]:mb-0.5 [&>h1]:text-sm [&>h2]:text-sm [&>h3]:text-xs [&>h1]:font-bold [&>h2]:font-semibold [&>h3]:font-semibold [&>h1]:mb-1 [&>h2]:mb-1 [&>h3]:mb-1 [&>strong]:text-primary [&>p>strong]:text-primary">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <span>{m.content}</span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl rounded-bl-md px-4 py-2.5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </>
  );
}
