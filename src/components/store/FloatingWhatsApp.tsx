"use client";

import { MessageSquare } from "lucide-react";
import { buildGeneralAdvisorMessage } from "@/lib/whatsapp";
import { useState, useEffect } from "react";

export function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(false);
  const waUrl = buildGeneralAdvisorMessage();

  useEffect(() => {
    // Delay appearance slightly for a smooth transition entry
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 group animate-in fade-in slide-in-from-bottom-5 duration-500 pointer-events-none">
      {/* Tooltip / Badge */}
      <div className="hidden sm:block bg-white border border-[#E7E5E4] text-[#1C1917] px-3.5 py-2 rounded-2xl text-[11px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none tracking-wide max-w-xs translate-x-2 group-hover:translate-x-0">
        ¿Necesitas ayuda? Conversa con un asesor gratis.
      </div>
      
      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20ba56] hover:scale-105 active:scale-95 transition-all focus:outline-none pointer-events-auto shrink-0 relative"
        aria-label="Asesoría por WhatsApp"
      >
        <MessageSquare className="h-5 w-5 fill-current" />
        
        {/* Soft pulse indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-400"></span>
        </span>
      </a>
    </div>
  );
}
