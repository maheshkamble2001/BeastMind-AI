import { Link, useNavigate, useLocation } from "react-router-dom";
import { useChatStore } from "./useChatStore";

export default function Sidebar() {
  const { createNewChat } = useChatStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewChat = () => {
    const newId = createNewChat();
    navigate(`/chat/${newId}`);
  };

  const menuItems = [
    { name: "New Chat", icon: "➕", action: handleNewChat, path: "/new" },
    { name: "History", icon: "🕒", path: "/history" },
    { name: "Features", icon: "⚙️", path: "/features" },
  ];

  return (
    <div className="w-64 bg-white border-r-2 border-[#1A1A1A] flex flex-col h-screen z-10 shrink-0">
      {/* Logo */}
      <div className="p-6 border-b-2 border-[#1A1A1A]">
        <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tighter">BeastMind</h1>
      </div>
      
      {/* Menu */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => item.action ? item.action() : navigate(item.path)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all font-bold text-sm ${
              location.pathname === item.path 
                ? "bg-[#C4A1FF] border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]" 
                : "border-transparent hover:border-[#1A1A1A] hover:bg-gray-50"
            }`}
          >
            <span>{item.icon}</span>
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}