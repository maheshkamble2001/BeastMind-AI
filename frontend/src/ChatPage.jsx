import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const streamRef = useRef(null);
  const liveRecorderRef = useRef(null);
  const timeoutRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("beastmind_chats_unique") || "[]");
    setChatHistory(saved);
  }, []);

  useEffect(() => {
    if (currentChatId) {
      const updatedHistory = chatHistory.map(chat => 
        chat.id === currentChatId ? { ...chat, messages } : chat
      );
      if (!chatHistory.find(c => c.id === currentChatId) && messages.length > 0) {
        updatedHistory.push({ id: currentChatId, title: messages[0]?.content.slice(0, 30) + "...", messages });
      }
      setChatHistory(updatedHistory);
      localStorage.setItem("beastmind_chats_unique", JSON.stringify(updatedHistory));
    }
  }, [messages, currentChatId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const toggleVoiceInput = async () => {
    if (isRecording) return stopVoiceRecording();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];
      setIsRecording(true);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      liveRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size > 1000) {
          setIsTranscribing(true);
          await transcribeAudio(blob);
          setIsTranscribing(false);
        }
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(1000);
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorder.state === "recording") mediaRecorder.stop();
        setIsRecording(false);
      }, 5000);
    } catch (err) { alert("Mic error: " + err.message); }
  };

  const stopVoiceRecording = () => {
    clearTimeout(timeoutRef.current);
    if (liveRecorderRef.current && liveRecorderRef.current.state === "recording") liveRecorderRef.current.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "voice.webm");
      formData.append("language", "hi");
      const response = await fetch("http://127.0.0.1:8000/api/voice-to-text/transcribe", { method: "POST", body: formData });
      const data = await response.json();
      if (data.text) setInput((prev) => prev + " " + data.text);
    } catch (err) { console.error(err); }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyText = (text) => { navigator.clipboard.writeText(text); };

  const startNewChat = () => { setMessages([]); setCurrentChatId(Date.now().toString()); };

  const sendMessage = async () => {
    if ((!input.trim() && !file) || loading) return;
    if (!currentChatId) setCurrentChatId(Date.now().toString());

    let fileInfo = file ? `[File Attached: ${file.name}]` : "";
    const userMsg = { role: "user", content: input + (file ? `\n${fileInfo}` : "") };
    
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);
    const currentInput = input;
    setInput(""); setFile(null);
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
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: aiText };
                  return updated;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Connection error." };
        return updated;
      });
    } finally { setLoading(false); }
  };

  // --- UNIQUE UI STARTS HERE ---
  return (
    <div className="flex h-screen bg-[#F7F7F5] font-sans text-[#1A1A1A] overflow-hidden selection:bg-[#C4A1FF] selection:text-white">
      
      {/* Sidebar - Unique Minimal Design */}
      <div className="w-72 bg-white border-r-2 border-[#1A1A1A] flex flex-col hidden md:flex z-10">
        <div className="p-5 border-b-2 border-[#1A1A1A]">
          <button 
            onClick={startNewChat} 
            className="w-full py-3 px-4 bg-[#C4A1FF] text-[#1A1A1A] font-bold border-2 border-[#1A1A1A] rounded-xl shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#1A1A1A] transition-all"
          >
            + New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatHistory.length === 0 && <p className="text-sm text-gray-500 font-medium">No history yet.</p>}
          {chatHistory.map((chat) => (
            <button 
              key={chat.id} 
              onClick={() => { setCurrentChatId(chat.id); setMessages(chat.messages); }}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium truncate transition-all ${
                currentChatId === chat.id 
                  ? "bg-[#C4A1FF] border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]" 
                  : "bg-white border-transparent hover:border-[#1A1A1A]"
              }`}
            >
              {chat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Top Header - Minimal */}
        <div className="md:hidden p-4 border-b-2 border-[#1A1A1A] flex justify-between items-center bg-white z-10">
          <span className="font-bold text-lg">BeastMind AI</span>
          <button onClick={startNewChat} className="px-3 py-1.5 bg-[#C4A1FF] border-2 border-[#1A1A1A] rounded-lg font-bold shadow-[2px_2px_0px_#1A1A1A]">+ New</button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
                <div className="w-20 h-20 bg-[#C4A1FF] border-2 border-[#1A1A1A] rounded-2xl flex items-center justify-center text-4xl shadow-[6px_6px_0px_#1A1A1A] mb-6 transform -rotate-3">
                  ✨
                </div>
                <h2 className="text-3xl font-black tracking-tight text-[#1A1A1A] mb-2">BeastMind AI</h2>
                <p className="text-[#666] font-medium">Aapka personal AI assistant.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-in`}>
                
                {/* User Message Box */}
                {msg.role === "user" ? (
                  <div className="bg-[#1A1A1A] text-white px-5 py-4 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[75%] shadow-[4px_4px_0px_#C4A1FF]">
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                  </div>
                ) : (
                  /* AI Message Box */
                  <div className="bg-white border-2 border-[#1A1A1A] p-5 rounded-2xl rounded-tl-sm max-w-[85%] md:max-w-[75%] shadow-[4px_4px_0px_#1A1A1A] w-full">
                    <div className="flex items-center gap-2 mb-2 border-b-2 border-gray-100 pb-2">
                      <div className="w-6 h-6 bg-[#C4A1FF] rounded-md border border-[#1A1A1A] flex items-center justify-center text-xs">🤖</div>
                      <span className="font-bold text-sm">BeastMind</span>
                    </div>
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#333]">
                      {msg.content || (loading && i === messages.length - 1 ? "Thinking..." : "")}
                    </p>
                    
                    {/* Action Buttons */}
                    {msg.content && (
                      <div className="flex gap-3 mt-4 pt-3 border-t-2 border-gray-100">
                        <button onClick={() => copyText(msg.content)} className="text-xs font-bold text-gray-500 hover:text-[#1A1A1A] transition flex items-center gap-1">
                          📋 Copy
                        </button>
                        <button onClick={() => speakText(msg.content)} className="text-xs font-bold text-gray-500 hover:text-[#1A1A1A] transition flex items-center gap-1">
                          🔊 Speak
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F7F7F5] via-[#F7F7F5] to-transparent pt-12">
          <div className="max-w-3xl mx-auto relative">
            
            {file && (
              <div className="absolute -top-14 left-0 flex items-center gap-2 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] px-4 py-2 rounded-xl text-sm font-bold shadow-[2px_2px_0px_#1A1A1A]">
                <span>📎 {file.name}</span>
                <button onClick={() => { setFile(null); fileInputRef.current.value = ""; }} className="hover:text-red-500">✕</button>
              </div>
            )}

            <div className="flex items-end gap-2 bg-white border-2 border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] rounded-2xl p-2 pl-3">
              
              <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" accept="image/*,.pdf,.txt,.doc,.docx" />
              
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-[#1A1A1A] hover:bg-gray-100 rounded-xl transition border-2 border-transparent hover:border-[#1A1A1A]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-[150px] py-3 text-[15px] font-medium outline-none placeholder-gray-400"
                disabled={loading || isRecording || isTranscribing}
              />

              <button onClick={toggleVoiceInput} className={`p-2 rounded-xl border-2 transition ${isRecording ? "bg-red-500 border-[#1A1A1A] text-white animate-pulse" : "border-transparent text-[#1A1A1A] hover:bg-gray-100"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </button>

              <button 
                onClick={sendMessage} 
                disabled={loading || (!input.trim() && !file)} 
                className={`p-3 rounded-xl border-2 border-[#1A1A1A] font-bold transition-all ${
                  (!input.trim() && !file) 
                    ? "bg-gray-200 border-gray-300 cursor-not-allowed shadow-none" 
                    : "bg-[#C4A1FF] hover:bg-[#b08cf0] shadow-[2px_2px_0px_#1A1A1A] hover:translate-y-0.5 hover:shadow-none"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"></path></svg>
              </button>
            </div>
            
            <p className="text-center text-xs font-semibold text-gray-400 mt-3 tracking-wide">
              BEASTMIND AI • Powered by local models
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}