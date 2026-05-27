import React from "react";
import { cn } from "@/lib/utils";

interface ProductVisualProps {
  imageGradient: string; // Tailwind gradient classes e.g., "from-[#FEF3C7] to-[#D97706]"
  name: string;
  category: string;
  sku: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProductVisual({
  imageGradient,
  name,
  category,
  sku,
  size = "md",
  className,
}: ProductVisualProps) {
  // Dimensions based on size
  const containerClasses = {
    sm: "h-36 w-24",
    md: "h-56 w-40",
    lg: "h-72 w-52",
  };

  const capClasses = {
    sm: "h-3 w-10 rounded-t",
    md: "h-5 w-16 rounded-t-md",
    lg: "h-6 w-20 rounded-t-lg",
  };

  const neckClasses = {
    sm: "h-1.5 w-6",
    md: "h-2 w-10",
    lg: "h-3 w-12",
  };

  const bodyClasses = {
    sm: "h-28 w-20 rounded-b-lg",
    md: "h-44 w-32 rounded-b-2xl",
    lg: "h-56 w-40 rounded-b-3xl",
  };

  const labelClasses = {
    sm: "py-2 px-1 text-[7px]",
    md: "py-4 px-2 text-[10px]",
    lg: "py-6 px-3 text-xs",
  };

  // Get name initials or short representation
  const shortName = name.replace(/(Kit|Shampoo|Tratamiento|Aceite|Mascarilla|Leave-In)\s*/gi, "").substring(0, 15);

  const isImage = imageGradient.startsWith("/") || imageGradient.includes(".webp") || imageGradient.includes(".png");

  if (isImage) {
    const sizeDimensions = {
      sm: "h-36 w-36",
      md: "h-56 w-56",
      lg: "h-72 w-72",
    };

    return (
      <div className={cn("flex flex-col items-center justify-center relative select-none", className)}>
        <div className={cn("relative group transition-transform duration-300 hover:-translate-y-1.5 overflow-hidden rounded-2xl border border-[#f2eee9] shadow-md bg-[#f2eee9] flex items-center justify-center", sizeDimensions[size])}>
          <img
            src={imageGradient}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Glass shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
        </div>
        {/* Shadow Projection */}
        <div className="absolute bottom-0 w-[80%] h-4 bg-black/10 rounded-full blur-[4px] -z-10 group-hover:scale-95 group-hover:opacity-75 transition-all duration-300 transform translate-y-1.5" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center relative select-none", className)}>
      {/* 3D Bottle Assembly */}
      <div className={cn("flex flex-col items-center relative group transition-transform duration-300 hover:-translate-y-1.5", containerClasses[size])}>
        
        {/* Bottle Cap (Metallic Gold) */}
        <div className={cn("bg-gradient-to-r from-[#D4AF37] via-[#FFF8DC] to-[#AA7C11] border-b border-[#AA7C11]/30 shadow-sm relative z-20", capClasses[size])}>
          {/* Shine reflection */}
          <div className="absolute inset-0 bg-white/20 w-1/3 left-1/4 skew-x-12" />
        </div>

        {/* Bottle Neck */}
        <div className={cn("bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#8C6D30] z-15", neckClasses[size])} />

        {/* Bottle Body */}
        <div className={cn(
          "bg-gradient-to-tr relative overflow-hidden shadow-md flex items-center justify-center z-10 border border-[#E7E5E4]/20",
          imageGradient,
          bodyClasses[size]
        )}>
          {/* Glass 3D shine overlay */}
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white/20 via-transparent to-black/10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-[15%] w-[8%] bg-white/30 skew-x-6 blur-[1px] pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-[25%] w-[3%] bg-white/20 skew-x-6 pointer-events-none" />
          
          {/* Bottom rounded reflection */}
          <div className="absolute bottom-0 inset-x-0 h-[10%] bg-black/15 blur-[2px] pointer-events-none" />

          {/* Premium Minimalist Label */}
          <div className={cn(
            "w-[85%] bg-white/95 backdrop-blur-sm border border-[#C7A45A]/20 shadow-sm rounded flex flex-col items-center justify-between text-center relative z-20 text-[#1C1917]",
            labelClasses[size]
          )}>
            {/* Fine gold border outline on label */}
            <div className="absolute inset-0.5 border border-[#C7A45A]/10 rounded-sm pointer-events-none" />

            <div className="space-y-0.5 relative z-10">
              <span className="block text-[5px] tracking-[0.1em] font-bold text-[#8C6D30] uppercase">
                IVETTE BERROA
              </span>
              <span className="block font-serif font-semibold text-[#1C1917] tracking-tight leading-tight line-clamp-2">
                {shortName}
              </span>
            </div>

            <div className="w-6 h-[1px] bg-[#C7A45A]/30 my-1 relative z-10" />

            <div className="space-y-0.5 relative z-10">
              <span className="block text-[6px] tracking-wider text-[#78716C] uppercase font-medium">
                {category}
              </span>
              <span className="block text-[5px] text-[#A8A29E] tracking-normal font-mono">
                {sku}
              </span>
            </div>
          </div>
        </div>

        {/* Shadow Projection */}
        <div className="absolute bottom-0 w-[90%] h-4 bg-black/10 rounded-full blur-[4px] -z-10 group-hover:scale-95 group-hover:opacity-75 transition-all duration-300 transform translate-y-1.5" />
      </div>
    </div>
  );
}
