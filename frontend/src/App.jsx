import { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import SettingsPanel from "./SettingsPanel"; // Naya Import
import { HistoryPage, FeaturesPage } from "./Pages";
import { useChatStore } from "./useChatStore";

function MainLayout() {
  const { chats, createNewChat, updateChatMessages } = useChatStore();
  const [activeChatId, setActiveChatId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Naya State

  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const messages = activeChat ? activeChat.messages : [];

  // Load Saved Theme
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("beastmind_theme"));
    if (saved) {
      const root = document.documentElement;
      root.classList.add(saved.themeClass);
      if (saved.isLight) root.classList.add("light-mode");
    } else {
      document.documentElement.classList.add("theme-green"); // Default
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleNewChat = () => {
    const newId = createNewChat();
    setActiveChatId(newId);
  };

  const sendMessage = async () => {
    if ((!input.trim() && !file) || loading || !activeChatId) return;
    let fileInfo = file ? `[File: ${file.name}]` : "";
    const userMsg = {
      role: "user",
      content: input + (file ? `\n${fileInfo}` : ""),
    };
    const newMessages = [
      ...messages,
      userMsg,
      { role: "assistant", content: "" },
    ];

    updateChatMessages(activeChatId, newMessages);
    const currentInput = input;
    setInput("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput || fileInfo }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                aiText += parsed.token;
                const updatedMsgs = [...newMessages];
                updatedMsgs[updatedMsgs.length - 1] = {
                  role: "assistant",
                  content: aiText,
                };
                updateChatMessages(activeChatId, updatedMsgs);
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      const updatedMsgs = [...newMessages];
      updatedMsgs[updatedMsgs.length - 1] = {
        role: "assistant",
        content: "CONNECTION_LOST: Backend unreachable.",
      };
      updateChatMessages(activeChatId, updatedMsgs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-main)] font-sans overflow-hidden">
      {/* Top Navigation - HUD Style */}
      <div className="w-full bg-[var(--bg-panel)] border-b border-[var(--border-color)] flex items-center justify-between px-6 py-3 shrink-0 z-10 relative">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-50"></div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[var(--accent-color)] rounded-full animate-pulse"></div>
          <h1 className="text-xl font-bold tracking-widest text-[var(--text-main)] mono uppercase">
            BEASTMIND<span className="text-[var(--accent-color)]">.SYS</span>
          </h1>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3">
          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition"
          >
            ⚙️
          </button>

          {/* Profile Icon */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 px-4 py-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded hover:border-[var(--accent-color)] transition-all group"
          >
            <span className="text-xs mono text-[var(--accent-color)] opacity-70 group-hover:opacity-100 hidden md:block">
              OPERATOR:
            </span>
            <div className="w-7 h-7 bg-[var(--bg-panel)] border border-[var(--accent-color)] rounded flex items-center justify-center text-xs font-bold text-[var(--accent-color)]">
              U
            </div>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {activeChatId ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Messages Area */}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-in`}
                  >
                    {msg.role === "user" ? (
                      <div className="relative bg-[var(--bg-panel)] border-[var(--border-width)] border-[var(--user-bubble)]/50 text-[var(--user-bubble)] px-5 py-3 chat-box max-w-[85%] text-sm">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[var(--user-bubble)] hidden style-minimal:block"></div>
                        <span className="opacity-50 text-xs mb-1 block mono">
                          OPERATOR_INPUT
                        </span>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ) : (
                      <div className="relative bg-[var(--ai-bubble)] border-[var(--border-width)] border-[var(--border-color)] p-5 chat-box max-w-[85%] w-full">
                        <div className="flex items-center gap-2 mb-3 border-b border-[var(--border-color)] pb-2">
                          <div className="w-2 h-2 bg-[var(--accent-color)] animate-pulse rounded-full"></div>
                          <span className="font-mono text-xs text-[var(--accent-color)] opacity-80 tracking-widest">
                            BEASTMIND_AI.EXE
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-[15px] text-[var(--text-main)] leading-relaxed">
                          {msg.content ||
                            (loading && i === messages.length - 1
                              ? "> PROCESSING_DATA..."
                              : "")}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={bottomRef} className="h-4" />
              </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)] to-transparent pt-12">
              <div className="max-w-4xl mx-auto">
                {file && (
                  <div className="mb-2 flex items-center gap-2 bg-[var(--bg-panel)] border border-[var(--user-bubble)] px-4 py-2 text-sm text-[var(--user-bubble)] font-mono w-fit">
                    📎 {file.name}
                    <button
                      onClick={() => setFile(null)}
                      className="text-white hover:text-red-500 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded p-2 pl-4 focus-within:border-[var(--accent-color)] transition-all">
                  <span className="text-[var(--accent-color)] font-mono text-sm animate-pulse">
                    {">"}
                  </span>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      ></path>
                    </svg>
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="ENTER COMMAND..."
                    rows={1}
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-[150px] py-2 font-mono text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none"
                    disabled={loading}
                  />

                  <button
                    onClick={sendMessage}
                    disabled={loading || (!input.trim() && !file)}
                    className="p-3 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/50 text-[var(--accent-color)] rounded hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)] transition-all disabled:opacity-30"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M5 12h14M12 5l7 7-7 7"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-2 border-[var(--accent-color)] rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 bg-[var(--bg-panel)] border-2 border-[var(--accent-color)] rounded-full flex items-center justify-center text-4xl text-[var(--accent-color)]">
                ⚡
              </div>
            </div>
            <h1 className="text-4xl font-black text-[var(--text-main)] mono tracking-widest mb-2 glow-text">
              SYSTEM_READY
            </h1>
            <p className="text-[var(--accent-color)] font-mono text-sm mb-8 opacity-80">
              Awaiting user input...
            </p>
            <button
              onClick={handleNewChat}
              className="px-8 py-3 bg-[var(--bg-panel)] border border-[var(--accent-color)] text-[var(--accent-color)] font-bold mono hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)] transition-all"
            >
              [ INITIATE_NEW_CHAT ]
            </button>
          </div>
        )}
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        setActiveChatId={setActiveChatId}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
