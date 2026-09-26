import React from 'react';
import { Camera, FileText, Sparkles } from 'lucide-react';

interface TopNavProps {
  onOpenSpecs: () => void;
  onTakeScreenshot: () => void;
  onOpenPresets: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenSpecs,
  onTakeScreenshot,
  onOpenPresets,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="text-base font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
          <span>CarportStudio 3D</span>
        </a>
      </div>

      {/* Zone 2: clean text navigation links */}
      <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-neutral-300">
        <button
          onClick={onOpenPresets}
          className="hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Kolekcje & Presety</span>
        </button>
        <button
          onClick={() => onTabChange('project')}
          className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'project' ? 'text-amber-400 font-bold underline underline-offset-4 decoration-amber-400' : ''
          }`}
        >
          Własne Dane & Projekt
        </button>
        <button
          onClick={() => onTabChange('dimensions')}
          className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'dimensions' ? 'text-amber-400 font-bold underline underline-offset-4 decoration-amber-400' : ''
          }`}
        >
          Wymiary & Typ
        </button>
        <button
          onClick={() => onTabChange('roof')}
          className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'roof' ? 'text-amber-400 font-bold underline underline-offset-4 decoration-amber-400' : ''
          }`}
        >
          Dach & Lamele
        </button>
        <button
          onClick={() => onTabChange('walls')}
          className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'walls' ? 'text-amber-400 font-bold underline underline-offset-4 decoration-amber-400' : ''
          }`}
        >
          Zabudowa Ścian
        </button>
        <button
          onClick={() => onTabChange('colors')}
          className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'colors' ? 'text-amber-400 font-bold underline underline-offset-4 decoration-amber-400' : ''
          }`}
        >
          Paleta RAL
        </button>
        <button
          onClick={() => onTabChange('accessories')}
          className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'accessories' ? 'text-amber-400 font-bold underline underline-offset-4 decoration-amber-400' : ''
          }`}
        >
          Wyposażenie & EV
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onTakeScreenshot}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-700/80 rounded-md hover:bg-neutral-800 hover:text-white transition-colors whitespace-nowrap"
          title="Zrób zdjęcie wizualizacji w wysokiej rozdzielczości"
        >
          <Camera className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Zrzut 3D</span>
        </button>

        <button
          onClick={onOpenSpecs}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Specyfikacja & Wycena</span>
        </button>
      </div>
    </header>
  );
};
