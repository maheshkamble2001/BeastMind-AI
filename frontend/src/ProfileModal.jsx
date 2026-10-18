import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- Add kiya
import { useChatStore } from "./useChatStore";

export default function ProfileModal({ isOpen, onClose, setActiveChatId }) {
  const { createNewChat } = useChatStore();
  const navigate = useNavigate(); // <-- Add kiya

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNewChat = () => {
    const newId = createNewChat();
    setActiveChatId(newId);
    onClose();
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-sm bg-[#F7F7F5] border-2 border-[#1A1A1A] rounded-3xl shadow-[8px_8px_0px_#1A1A1A] p-6 animate-fade-in-up">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-[#1A1A1A]">My Profile</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white border-2 border-[#1A1A1A] rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-[2px_2px_0px_#1A1A1A]">✕</button>
        </div>

        <div className="flex items-center gap-4 p-4 bg-white border-2 border-[#1A1A1A] rounded-2xl mb-6 shadow-[4px_4px_0px_#1A1A1A]">
          <div className="w-12 h-12 bg-[#C4A1FF] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center text-xl font-black">U</div>
          <div>
            <h3 className="font-bold text-lg text-[#1A1A1A]">User Account</h3>
            <p className="text-xs font-medium text-gray-500">user@beastmind.ai</p>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={handleNewChat} className="w-full flex items-center gap-4 p-3 bg-white border-2 border-[#1A1A1A] rounded-xl hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1A1A1A] transition-all">
            <div className="w-8 h-8 bg-[#C4A1FF] border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center text-sm">➕</div>
            <span className="font-bold text-[#1A1A1A]">New Chat</span>
          </button>

          {/* History Button Added */}
          <button onClick={() => handleNavigate("/history")} className="w-full flex items-center gap-4 p-3 bg-white border-2 border-[#1A1A1A] rounded-xl hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1A1A1A] transition-all">
            <div className="w-8 h-8 bg-blue-100 border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center text-sm">🕒</div>
            <span className="font-bold text-[#1A1A1A]">Chat History</span>
          </button>

          <button onClick={() => handleNavigate("/features")} className="w-full flex items-center gap-4 p-3 bg-white border-2 border-[#1A1A1A] rounded-xl hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1A1A1A] transition-all">
            <div className="w-8 h-8 bg-green-100 border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center text-sm">⚙️</div>
            <span className="font-bold text-[#1A1A1A]">Features</span>
          </button>
        </div>

        <button className="w-full mt-6 py-3 bg-red-50 border-2 border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0px_#ef4444]">
          Log out
        </button>
      </div>
    </div>
  );
}