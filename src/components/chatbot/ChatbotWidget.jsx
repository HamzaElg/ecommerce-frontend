import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const SUGGESTIONS = [
  "Montre-moi des laptops sous 1500",
  "Recommande un telephone avec bonne camera",
  "Suivi de ma commande",
  "Produits gaming disponibles ?",
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const cleanText = text.trim();
    if (!cleanText || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: cleanText }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/chat", { message: cleanText });
      const chatData = data?.data;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: chatData?.reply || "Je n'ai pas trouve de reponse pour le moment.",
          products: chatData?.recommendedProducts || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: error?.message || "Desole, une erreur est survenue. Reessayez dans un instant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-110 hover:bg-blue-400"
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {open ? (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-80 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 border-b border-white/5 bg-[#111827] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17 9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">E-com Assistant</p>
              <p className="flex items-center gap-1 text-xs text-green-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                En ligne
              </p>
            </div>
          </div>

          <div className="max-h-80 flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-blue-500 text-white"
                      : "rounded-bl-sm bg-white/5 text-slate-200"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {msg.products?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.products.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          onClick={() => setOpen(false)}
                          className="flex gap-2 rounded-xl border border-white/10 bg-black/20 p-2 transition-colors hover:bg-white/10"
                        >
                          <img
                            src={product.imageUrls?.[0] || "/placeholder-product.png"}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg bg-white/10 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-white">{product.name}</p>
                            <p className="truncate text-xs text-slate-400">{product.brand}</p>
                            <p className="text-xs font-semibold text-blue-300">{product.price} DH</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white/5 px-4 py-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((item) => (
                      <span
                        key={item}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: `${item * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-blue-500/30 px-2.5 py-1 text-xs text-blue-400 transition-colors hover:bg-blue-500/10"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 border-t border-white/5 p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(input);
                }
              }}
              placeholder="Tapez votre message..."
              disabled={loading}
              className="flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500/50"
            />
            <button
              type="button"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white transition-colors hover:bg-blue-400 disabled:opacity-40"
              aria-label="Envoyer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m12 19 9 2-9-18-9 18 9-2Zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
