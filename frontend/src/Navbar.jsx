import { useState } from "react";
import { Link } from "react-router-dom";
import ProfileModal from "./ProfileModal";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="w-full bg-white border-b-2 border-[#1A1A1A] flex items-center justify-between px-6 py-4 z-10 shrink-0">
        <Link to="/" className="text-2xl font-black text-[#1A1A1A] tracking-tighter">
          BeastMind<span className="text-[#C4A1FF]">.</span>
        </Link>
        
        {/* Profile Icon Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 p-1 pr-3 bg-white border-2 border-[#1A1A1A] rounded-full hover:bg-gray-50 transition-all shadow-[2px_2px_0px_#1A1A1A] hover:translate-y-0.5 hover:shadow-none"
        >
          <div className="w-8 h-8 bg-[#C4A1FF] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center text-sm font-bold">
            U
          </div>
        </button>
      </nav>

      <ProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}