import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, children, title, description }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  return (
    <div className={cn("fixed inset-0 z-[100] flex justify-end transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div 
        className={cn(
          "relative w-full max-w-md bg-white h-full shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] p-6 overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {title && <h2 className="text-2xl font-bold text-[#1f2a1d] mb-1">{title}</h2>}
        {description && <p className="text-sm text-[#4b5b47] mb-6">{description}</p>}
        
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};
