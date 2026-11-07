"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Mic, RotateCcw } from "lucide-react";
import { chatWithAI } from "@/lib/supabase-functions";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

const WELCOME: ChatMessage = {
  role: "assistant",
  text: "Bonjour ! Je suis l'assistant Sol-Chic. Comment puis-je vous aider pour vos travaux de rénovation ?",
};

const SUGGESTIONS = [
  "Quels services proposez-vous ?",
  "Comment obtenir un devis gratuit ?",
  "Dans quelles zones intervenez-vous ?",
  "Proposez-vous une garantie sur vos travaux ?",
  "Fournissez-vous les matériaux ?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Dictée vocale (Web Speech API) : absente de Firefox, donc le bouton micro n'apparaît que si le navigateur la gère
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);
  const [canListen, setCanListen] = useState(false);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    setCanListen(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
    const rec = new Rec();
    rec.lang = "fr-FR";
    rec.interimResults = false;
    rec.onstart = () => { setListening(true); setMicError(""); };
    rec.onend = () => setListening(false);
    rec.onerror = (e: { error: string }) => {
      setListening(false);
      setMicError(e.error === "not-allowed" ? "Micro refusé : autorisez-le dans le navigateur." : "Voix non comprise, réessayez.");
    };
    rec.onresult = (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      setInput(Array.from(e.results).map((r) => r[0].transcript).join(" "));
    };
    recRef.current = rec;
    rec.start();
  };

  const reset = () => {
    recRef.current?.abort?.();
    setMessages([WELCOME]);
    setInput("");
    setMicError("");
    setLoading(false);
  };

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const history = [...messages, userMsg];
      const res = await chatWithAI(history);
      setMessages((m) => [...m, { role: "assistant", text: res.answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Désolé, une erreur s'est produite. Veuillez réessayer." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bubble button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-brand-navy shadow-lg flex items-center justify-center text-white hover:bg-brand-navy-light transition-colors"
        aria-label="Assistant IA"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl bg-white border border-gray-200 flex flex-col overflow-hidden" style={{ maxHeight: "70vh" }}>
          {/* Header */}
          <div className="bg-brand-navy px-4 py-3 flex items-center gap-2">
            <Bot className="h-5 w-5 text-brand-gold" />
            <div>
              <p className="text-sm font-bold text-white">Assistant Sol-Chic</p>
              <p className="text-xs text-white/80">Réponses rapides sur nos services</p>
            </div>
            <button
              onClick={reset}
              disabled={messages.length === 1 && !input}
              className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-xs text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Réinitialiser la conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-brand-navy flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-brand-gold" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-brand-navy text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  )}
                >
                  {msg.text}
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-brand-gold flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-brand-navy" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="h-7 w-7 rounded-full bg-brand-navy flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-brand-gold" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-brand-navy/30 px-3 py-1.5 text-left text-xs font-medium text-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {micError && <p role="status" className="px-3 pb-1 text-xs text-red-700">{micError}</p>}
          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2">
            <input
              className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              placeholder="Votre question…"
              aria-label="Votre question"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
            />
            {canListen && (
              <button
                onClick={toggleMic}
                disabled={loading}
                className={cn(
                  "h-9 w-9 shrink-0 rounded-full flex items-center justify-center disabled:opacity-40",
                  listening ? "bg-red-600 text-white animate-pulse" : "bg-gray-100 text-brand-navy hover:bg-gray-200"
                )}
                aria-label={listening ? "Arrêter la dictée" : "Dicter votre question"}
                aria-pressed={listening}
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-full bg-brand-navy flex items-center justify-center text-white disabled:opacity-40"
              aria-label="Envoyer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
