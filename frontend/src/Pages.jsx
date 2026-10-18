import { useNavigate } from "react-router-dom";
import { useChatStore } from "./useChatStore";

// --- HISTORY PAGE (Jo purani chats dikhata hai) ---
export function HistoryPage() {
  const { chats, deleteChat } = useChatStore();
  const navigate = useNavigate();

  return (
    <div className="flex-1 p-8 bg-[#F7F7F5] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-[#1A1A1A] mb-8">Chat History</h2>
        {chats.length === 0 ? (
          <p className="text-gray-500 font-medium">Abhi tak koi chat nahi ki gayi.</p>
        ) : (
          <div className="grid gap-4">
            {chats.map(chat => (
              <div key={chat.id} className="flex items-center justify-between p-5 bg-white border-2 border-[#1A1A1A] rounded-2xl shadow-[4px_4px_0px_#1A1A1A] hover:-translate-y-0.5 transition-all">
                <div className="cursor-pointer" onClick={() => navigate(`/chat/${chat.id}`)}>
                  <h3 className="font-bold text-lg text-[#1A1A1A]">{chat.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{chat.messages.length} messages</p>
                </div>
                <button onClick={() => deleteChat(chat.id)} className="text-red-500 font-bold px-4 py-2 hover:bg-red-50 rounded-lg transition">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- FEATURES PAGE ---
export function FeaturesPage() {
  const features = [
    { title: "Voice Chat", desc: "Talk to AI using real-time voice.", icon: "🎤", color: "bg-blue-100" },
    { title: "Image Generation", desc: "Create images from text prompts.", icon: "🎨", color: "bg-purple-100" },
    { title: "Document Analysis", desc: "Upload PDFs and ask questions.", icon: "📄", color: "bg-green-100" },
    { title: "Code Assistant", desc: "Write and debug code instantly.", icon: "💻", color: "bg-yellow-100" },
    { title: "Web Search", desc: "Get real-time info from internet.", icon: "🌐", color: "bg-red-100" },
    { title: "Long-term Memory", desc: "AI remembers your preferences.", icon: "🧠", color: "bg-pink-100" },
  ];

  return (
    <div className="flex-1 p-8 bg-[#F7F7F5] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-[#1A1A1A] mb-2">Features</h2>
        <p className="text-gray-500 font-medium mb-8">Yeh features jald hi BeastMind AI mein add kiye jayenge.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div key={i} className={`p-5 border-2 border-[#1A1A1A] rounded-2xl shadow-[4px_4px_0px_#1A1A1A] ${f.color} bg-opacity-50`}>
              <div className="w-10 h-10 bg-white border-2 border-[#1A1A1A] rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm">{f.icon}</div>
              <h3 className="font-bold text-lg text-[#1A1A1A]">{f.title}</h3>
              <p className="text-gray-600 text-sm mt-1 font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}