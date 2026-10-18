import { useEffect } from "react";

export default function SettingsPanel({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const applyTheme = (themeClass, isLight, styleClass) => {
    const root = document.documentElement;
    root.classList.remove("theme-green", "theme-blue", "theme-purple", "theme-orange");
    root.classList.remove("style-minimal", "style-glass");
    
    root.classList.add(themeClass);
    if (styleClass) root.classList.add(styleClass);
    if (isLight) root.classList.add("light-mode");
    else root.classList.remove("light-mode");
    
    localStorage.setItem("beastmind_theme", JSON.stringify({ themeClass, isLight, styleClass }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-[var(--bg-panel)] border border-[var(--border-color)] shadow-xl p-6 rounded-[var(--radius-main)] animate-fade-in text-[var(--text-main)]">
        
        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-color)] pb-3">
          <h2 className="text-xl font-bold mono text-[var(--accent-color)]">SYSTEM_CONFIG</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--accent-color)] font-bold">✕</button>
        </div>

        {/* MODE */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mono text-[var(--text-muted)] mb-3">MODE</h3>
          <div className="flex gap-3">
            <button onClick={() => applyTheme("theme-green", false, null)} className="flex-1 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] font-bold mono hover:border-[var(--accent-color)] transition rounded-lg">🌙 DARK</button>
            <button onClick={() => applyTheme("theme-green", true, null)} className="flex-1 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] font-bold mono hover:border-[var(--accent-color)] transition rounded-lg">☀️ LIGHT</button>
          </div>
        </div>

        {/* DESIGN STYLE */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mono text-[var(--text-muted)] mb-3">DESIGN STYLE</h3>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => applyTheme("theme-green", false, null)} className="py-2 bg-[var(--bg-main)] border border-[var(--border-color)] font-bold mono text-xs hover:border-[var(--accent-color)] transition rounded-lg">GAMING</button>
            <button onClick={() => applyTheme("theme-blue", false, "style-minimal")} className="py-2 bg-[var(--bg-main)] border border-[var(--border-color)] font-bold mono text-xs hover:border-[var(--accent-color)] transition rounded-lg">MINIMAL</button>
            <button onClick={() => applyTheme("theme-purple", false, "style-glass")} className="py-2 bg-[var(--bg-main)] border border-[var(--border-color)] font-bold mono text-xs hover:border-[var(--accent-color)] transition rounded-lg">GLASS</button>
          </div>
        </div>

        {/* ACCENT SHADE */}
        <div>
          <h3 className="text-sm font-bold mono text-[var(--text-muted)] mb-3">ACCENT SHADE</h3>
          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => applyTheme("theme-green", false, null)} className="h-10 bg-[#00FF41] rounded-lg border-2 border-transparent hover:border-white transition"></button>
            <button onClick={() => applyTheme("theme-blue", false, null)} className="h-10 bg-[#00F0FF] rounded-lg border-2 border-transparent hover:border-white transition"></button>
            <button onClick={() => applyTheme("theme-purple", false, null)} className="h-10 bg-[#B026FF] rounded-lg border-2 border-transparent hover:border-white transition"></button>
            <button onClick={() => applyTheme("theme-orange", false, null)} className="h-10 bg-[#FF9900] rounded-lg border-2 border-transparent hover:border-white transition"></button>
          </div>
        </div>

      </div>
    </div>
  );
}