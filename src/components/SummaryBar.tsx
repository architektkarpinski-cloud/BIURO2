import React from 'react';
import { CarportConfig, TimeOfDay } from '../types/carport';
import { calculateCarportQuote, formatPLN } from '../utils/pricing';
import { Sun, Moon, Sunset, Maximize, FileSpreadsheet, ShieldCheck, Wind, Sparkles } from 'lucide-react';

interface SummaryBarProps {
  config: CarportConfig;
  onOpenSpecs: () => void;
  onTimeChange: (time: TimeOfDay) => void;
  onCameraChange: (angle: any) => void;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({
  config,
  onOpenSpecs,
  onTimeChange,
  onCameraChange,
}) => {
  const quote = calculateCarportQuote(config);

  return (
    <footer className="h-16 sm:h-20 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left: Quick Environmental & Camera Controls */}
      <div className="flex items-center gap-4">
        {/* Time of Day */}
        <div className="flex items-center bg-neutral-900 border border-neutral-700/80 rounded-xl p-1 gap-1 shadow-md">
          <button
            onClick={() => onTimeChange('day')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              config.environment.timeOfDay === 'day'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Dzień"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTimeChange('sunset')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              config.environment.timeOfDay === 'sunset'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Zmierzch"
          >
            <Sunset className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTimeChange('night')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              config.environment.timeOfDay === 'night'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Noc & Oświetlenie LED"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Quick View Angle Buttons */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-300">
          <span className="text-neutral-500 mr-1 font-medium">Kamera:</span>
          {[
            { id: 'perspective', label: 'Perspektywa 3D' },
            { id: 'front', label: 'Wjazd' },
            { id: 'side', label: 'Bok' },
            { id: 'top', label: 'Rzut z góry' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => onCameraChange(v.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                config.environment.viewAngle === v.id
                  ? 'border-amber-400 bg-amber-400/20 text-white shadow-sm'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Architectural Specs chips */}
        <div className="hidden xl:flex items-center gap-4 text-xs font-medium text-neutral-300 pl-4 border-l border-neutral-800">
          <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2.5 py-1.5 rounded-lg border border-neutral-800">
            <Maximize className="w-4 h-4 text-amber-400" />
            <span>Powierzchnia:</span>
            <strong className="text-white font-mono text-sm tabular-nums">{quote.areaM2} m²</strong>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2.5 py-1.5 rounded-lg border border-neutral-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Śnieg:</span>
            <strong className="text-white font-mono text-sm tabular-nums">{quote.snowLoadKgM2} kg/m²</strong>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2.5 py-1.5 rounded-lg border border-neutral-800">
            <Wind className="w-4 h-4 text-sky-400" />
            <span>Wiatr:</span>
            <strong className="text-white font-mono text-sm tabular-nums">{quote.windResistanceKmh} km/h</strong>
          </div>
        </div>
      </div>

      {/* Right: Live Price & Specification CTA */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="text-right">
          <div className="text-xs text-neutral-300 font-medium flex items-center justify-end gap-2">
            <span>Szacunkowy koszt inwestycji:</span>
            <span className="text-[11px] font-bold text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.5 rounded">
              VAT 8%
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold font-mono tracking-tight text-white tabular-nums">
            {formatPLN(quote.totalBrutto)}
            <span className="text-xs text-neutral-400 font-normal ml-2 hidden sm:inline">
              (netto: {formatPLN(quote.subtotalAfterDiscountNetto)})
            </span>
          </div>
        </div>

        <button
          onClick={onOpenSpecs}
          className="flex items-center gap-2 px-5 py-2.5 sm:py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-amber-400/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Specyfikacja & Wycena</span>
        </button>
      </div>
    </footer>
  );
};
