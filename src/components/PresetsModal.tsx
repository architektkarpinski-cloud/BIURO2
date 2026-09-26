import React from 'react';
import { PRESETS } from '../utils/presets';
import { CarportConfig } from '../types/carport';
import { X, Check, Sparkles } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetConfig: Partial<CarportConfig>) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Gotowe Konfiguracje Architektoniczne
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Cards List */}
        <div className="p-6 overflow-y-auto space-y-3">
          <p className="text-xs text-neutral-400 mb-2">
            Wybierz jeden z gotowych projektów przygotowanych przez architektów, aby szybko zobaczyć go w widoku 3D.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="group p-4 bg-neutral-950/60 border border-neutral-800 hover:border-amber-400/80 rounded-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10">
                      {preset.tag}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      {preset.config.dimensions?.width}m × {preset.config.dimensions?.length}m
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-neutral-400">
                    {preset.config.roofType === 'bioclimatic'
                      ? 'Lamele obrotowe'
                      : preset.config.roofType === 'solar'
                      ? 'Fotowoltaika BIPV'
                      : 'Szkło bezpieczne'}
                  </div>
                  <button
                    onClick={() => {
                      onSelectPreset(preset.config);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-neutral-800 group-hover:bg-amber-400 group-hover:text-neutral-950 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    Załaduj Projekt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
