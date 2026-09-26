import React, { useState } from 'react';
import {
  CarportConfig,
  RoofType,
  WallType,
  InstallationType,
  BayCount,
  PostProfile,
  TimeOfDay,
  CarType,
  ColorTemp,
  CustomCostItem,
} from '../types/carport';
import { RAL_PALETTE, WOOD_TONES, formatPLN } from '../utils/pricing';
import {
  Maximize2,
  Layers,
  Palette,
  Shield,
  Zap,
  Eye,
  Sun,
  Moon,
  Sunset,
  Car,
  FolderEdit,
  Plus,
  Trash2,
  Download,
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  Building,
  User,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';

interface ConfigPanelProps {
  config: CarportConfig;
  onChange: (updater: (prev: CarportConfig) => CarportConfig) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExportJson?: () => void;
  onImportJson?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onChange,
  activeTab,
  onTabChange,
  onExportJson,
  onImportJson,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newCustomItem, setNewCustomItem] = useState<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>({
    name: '',
    category: 'Fundamenty',
    quantity: 1,
    unit: 'kpl',
    unitPrice: 1500,
  });

  const tabs = [
    { id: 'dimensions', label: 'Wymiary & Typ', icon: Maximize2 },
    { id: 'project', label: 'Projekt & Własne Dane', icon: FolderEdit },
    { id: 'roof', label: 'Dach & Lamele', icon: Layers },
    { id: 'walls', label: 'Zabudowa Ścian', icon: Shield },
    { id: 'colors', label: 'Paleta RAL', icon: Palette },
    { id: 'accessories', label: 'Wyposażenie & EV', icon: Zap },
    { id: 'environment', label: 'Otoczenie 3D', icon: Eye },
  ];

  const updateDimensions = (key: keyof typeof config.dimensions, val: number) => {
    // Sanitizing numeric value
    const num = isNaN(val) ? 0 : Math.round(val * 100) / 100;
    onChange((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [key]: num,
      },
    }));
  };

  const handleAddCustomCostItem = () => {
    if (!newCustomItem.name.trim()) return;
    const itemToAdd: CustomCostItem = {
      id: 'custom-' + Date.now(),
      name: newCustomItem.name.trim(),
      category: newCustomItem.category,
      quantity: Number(newCustomItem.quantity) || 1,
      unit: newCustomItem.unit || 'kpl',
      unitPrice: Number(newCustomItem.unitPrice) || 0,
    };

    onChange((prev) => ({
      ...prev,
      customCostItems: [...(prev.customCostItems || []), itemToAdd],
    }));

    setNewCustomItem({
      name: '',
      category: 'Fundamenty',
      quantity: 1,
      unit: 'kpl',
      unitPrice: 1500,
    });
  };

  const handleRemoveCustomCostItem = (id: string) => {
    onChange((prev) => ({
      ...prev,
      customCostItems: (prev.customCostItems || []).filter((item) => item.id !== id),
    }));
  };

  return (
    <aside
      className={`bg-neutral-900 border-l border-neutral-800 flex flex-col h-full z-20 shrink-0 overflow-hidden shadow-2xl transition-all duration-300 ${
        isExpanded ? 'w-full lg:w-[620px]' : 'w-full lg:w-[480px] xl:w-[520px]'
      }`}
    >
      {/* Category Tabs & Expand Button */}
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950/90 shrink-0 px-3 py-2">
        <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 flex-1 mr-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-400 text-neutral-950 shadow-md font-bold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Expand / Narrow panel button for maximum information readability */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden lg:flex items-center justify-center p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          title={isExpanded ? 'Zwęź panel' : 'Poszerz przestrzeń informacyjną'}
        >
          {isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* ========================================================= */}
        {/* TAB: PROJEKT & WŁASNE DANE */}
        {/* ========================================================= */}
        {activeTab === 'project' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderEdit className="w-5 h-5 text-amber-400" />
                <span>Dane Inwestycji & Parametry Indywidualne</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Wprowadź dane inwestora, lokalizacji oraz dodaj własne pozycje do kosztorysu i dokumentacji.
              </p>
            </div>

            {/* Project & Client Identity Inputs */}
            <div className="space-y-4 bg-neutral-950/70 p-4 rounded-xl border border-neutral-800">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4" />
                Metryka Projektu
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Nazwa Zlecenia / Wariantu
                </label>
                <input
                  type="text"
                  value={config.project?.projectName || ''}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      project: { ...prev.project, projectName: e.target.value },
                    }))
                  }
                  placeholder="np. Pergola Rezydencjalna - Wariant A"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    Inwestor / Klient
                  </label>
                  <input
                    type="text"
                    value={config.project?.investorName || ''}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        project: { ...prev.project, investorName: e.target.value },
                      }))
                    }
                    placeholder="np. Jan Kowalski"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    Adres Inwestycji
                  </label>
                  <input
                    type="text"
                    value={config.project?.investmentAddress || ''}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        project: { ...prev.project, investmentAddress: e.target.value },
                      }))
                    }
                    placeholder="np. ul. Parkowa 12, Warszawa"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Nr Działki Ewidencyjnej
                  </label>
                  <input
                    type="text"
                    value={config.project?.plotNumber || ''}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        project: { ...prev.project, plotNumber: e.target.value },
                      }))
                    }
                    placeholder="np. 142/5 obręb 0012"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Rabat Inwestorski (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={config.project?.discountPercent || 0}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        project: { ...prev.project, discountPercent: Math.max(0, parseFloat(e.target.value) || 0) },
                      }))
                    }
                    placeholder="0"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Dodatkowe Uwagi Inżynierskie / Wykonawcze
                </label>
                <textarea
                  rows={2}
                  value={config.project?.notes || ''}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      project: { ...prev.project, notes: e.target.value },
                    }))
                  }
                  placeholder="np. Zasilanie 400V doprowadzone do słupa lewego przedniego, posadzka z kostki bez spadku..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>

            {/* Custom Cost Items Section */}
            <div className="space-y-4 bg-neutral-950/70 p-4 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Własne Pozycje Kosztorysowe
                </div>
                <span className="text-xs text-neutral-400 font-mono">
                  {(config.customCostItems || []).length} poz.
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Możesz dodać własne prace (np. wykonanie stóp fundamentowych, doprowadzenie zasilania, montaż dodatkowej automatyki).
              </p>

              {/* Form to add item */}
              <div className="p-3 bg-neutral-900 border border-neutral-700/80 rounded-lg space-y-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Nazwa elementu / usługi</label>
                  <input
                    type="text"
                    value={newCustomItem.name}
                    onChange={(e) => setNewCustomItem({ ...newCustomItem, name: e.target.value })}
                    placeholder="np. Wykonanie 4 stóp fundamentowych B25 z kotwami"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Kategoria</label>
                    <select
                      value={newCustomItem.category}
                      onChange={(e) => setNewCustomItem({ ...newCustomItem, category: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Fundamenty">Fundamenty</option>
                      <option value="Elektryka">Elektryka</option>
                      <option value="Roboty ziemne">Roboty ziemne</option>
                      <option value="Dodatki">Dodatki</option>
                      <option value="Inne">Inne</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Ilość & Jedn.</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min={1}
                        value={newCustomItem.quantity}
                        onChange={(e) =>
                          setNewCustomItem({ ...newCustomItem, quantity: Math.max(1, parseFloat(e.target.value) || 1) })
                        }
                        className="w-14 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        value={newCustomItem.unit}
                        onChange={(e) => setNewCustomItem({ ...newCustomItem, unit: e.target.value })}
                        className="w-12 bg-neutral-950 border border-neutral-700 rounded-lg px-1.5 py-1.5 text-xs text-white"
                        placeholder="kpl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Cena jedn. netto</label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={newCustomItem.unitPrice}
                      onChange={(e) =>
                        setNewCustomItem({ ...newCustomItem, unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomCostItem}
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj Własną Pozycję do Kosztorysu
                </button>
              </div>

              {/* List of custom items */}
              {(config.customCostItems || []).length > 0 && (
                <div className="space-y-2 mt-3">
                  {(config.customCostItems || []).map((cItem) => (
                    <div
                      key={cItem.id}
                      className="flex items-center justify-between p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-white truncate">{cItem.name}</div>
                        <div className="text-[11px] text-neutral-400">
                          {cItem.category} · {cItem.quantity} {cItem.unit} × {formatPLN(cItem.unitPrice)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-amber-400">
                          {formatPLN(cItem.quantity * cItem.unitPrice)}
                        </span>
                        <button
                          onClick={() => handleRemoveCustomCostItem(cItem.id)}
                          className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-neutral-800 transition-colors"
                          title="Usuń pozycję"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export & Import JSON Configuration */}
            <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Archiwizacja i Wymiana Projektu
              </div>
              <p className="text-xs text-neutral-300">
                Możesz zapisać pełną konfigurację jako plik JSON na dysku lub wczytać wcześniej zapisany projekt.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onExportJson}
                  className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-neutral-700"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  Eksportuj Projekt (.JSON)
                </button>

                <label className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-neutral-700 cursor-pointer">
                  <Upload className="w-4 h-4 text-amber-400" />
                  Wczytaj (.JSON)
                  <input type="file" accept=".json" onChange={onImportJson} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: WYMIARY & TYP */}
        {/* ========================================================= */}
        {activeTab === 'dimensions' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-amber-400" />
                <span>Geometria i Wymiary Architektoniczne</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Możesz przesuwać suwaki lub <strong>wpisać dokładne wymiary ręcznie w polach liczbowych</strong>.
              </p>
            </div>

            {/* Installation Type */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Sposób Posadowienia Konstrukcji
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      installationType: 'freestanding',
                      environment: { ...prev.environment, showWall: false },
                    }))
                  }
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    config.installationType === 'freestanding'
                      ? 'border-amber-400 bg-amber-400/15 text-white shadow-md'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-sm font-bold text-white">Wolnostojąca</div>
                  <div className="text-xs text-neutral-300 mt-1">4 lub 6 niezależnych słupów</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      installationType: 'attached',
                      environment: { ...prev.environment, showWall: true },
                    }))
                  }
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    config.installationType === 'attached'
                      ? 'border-amber-400 bg-amber-400/15 text-white shadow-md'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-sm font-bold text-white">Przyścienna</div>
                  <div className="text-xs text-neutral-300 mt-1">Montaż do ściany elewacyjnej</div>
                </button>
              </div>
            </div>

            {/* Bay count */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Stanowiska Postojowe
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onChange((prev) => ({
                      ...prev,
                      bays: 1,
                      dimensions: {
                        ...prev.dimensions,
                        width: Math.min(prev.dimensions.width, 4.5),
                      },
                    }));
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.bays === 1
                      ? 'border-amber-400 bg-amber-400/15 text-white shadow-md'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-sm font-bold text-white">1 Pojazd</div>
                  <div className="text-xs text-neutral-300 mt-0.5">Szerokość 3.00 - 4.50 m</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onChange((prev) => ({
                      ...prev,
                      bays: 2,
                      dimensions: {
                        ...prev.dimensions,
                        width: Math.max(prev.dimensions.width, 5.5),
                      },
                    }));
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.bays === 2
                      ? 'border-amber-400 bg-amber-400/15 text-white shadow-md'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-sm font-bold text-white">2 Pojazdy (Dwu-stanowiskowa)</div>
                  <div className="text-xs text-neutral-300 mt-0.5">Szerokość 5.00 - 8.00 m</div>
                </button>
              </div>
            </div>

            {/* PRECISION DIMENSIONAL CONTROLS WITH DIRECT NUMERIC INPUTS */}
            <div className="space-y-5 p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Parametry Wymiarowe (Wpisz wartość lub przesuń suwak)
              </div>

              {/* Width Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Szerokość Całkowita</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step={0.05}
                      min={2.8}
                      max={8.5}
                      value={config.dimensions.width}
                      onChange={(e) => updateDimensions('width', parseFloat(e.target.value))}
                      className="w-24 bg-neutral-900 border border-neutral-600 rounded-lg px-2.5 py-1 text-sm font-bold font-mono text-amber-300 text-right focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-xs text-neutral-300 font-medium">m</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={config.bays === 1 ? 3.0 : 4.8}
                  max={config.bays === 1 ? 4.8 : 8.0}
                  step={0.05}
                  value={config.dimensions.width}
                  onChange={(e) => updateDimensions('width', parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Min: {config.bays === 1 ? '3.00 m' : '4.80 m'}</span>
                  <div className="flex gap-1">
                    {[3.5, 4.0, 5.8, 6.5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateDimensions('width', val)}
                        className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300"
                      >
                        {val}m
                      </button>
                    ))}
                  </div>
                  <span>Max: {config.bays === 1 ? '4.80 m' : '8.00 m'}</span>
                </div>
              </div>

              {/* Length Input */}
              <div className="space-y-2 pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Długość Całkowita (Głębokość)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step={0.05}
                      min={4.0}
                      max={12.0}
                      value={config.dimensions.length}
                      onChange={(e) => updateDimensions('length', parseFloat(e.target.value))}
                      className="w-24 bg-neutral-900 border border-neutral-600 rounded-lg px-2.5 py-1 text-sm font-bold font-mono text-amber-300 text-right focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-xs text-neutral-300 font-medium">m</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={4.2}
                  max={9.0}
                  step={0.05}
                  value={config.dimensions.length}
                  onChange={(e) => updateDimensions('length', parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>4.20 m (Kompakt)</span>
                  <div className="flex gap-1">
                    {[5.5, 6.0, 7.0, 8.0].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateDimensions('length', val)}
                        className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300"
                      >
                        {val}m
                      </button>
                    ))}
                  </div>
                  <span>9.00 m (Max)</span>
                </div>
              </div>

              {/* Height Input */}
              <div className="space-y-2 pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Wysokość w Świetle Wjazdu</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step={0.05}
                      min={2.0}
                      max={4.0}
                      value={config.dimensions.height}
                      onChange={(e) => updateDimensions('height', parseFloat(e.target.value))}
                      className="w-24 bg-neutral-900 border border-neutral-600 rounded-lg px-2.5 py-1 text-sm font-bold font-mono text-amber-300 text-right focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-xs text-neutral-300 font-medium">m</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={2.2}
                  max={3.4}
                  step={0.05}
                  value={config.dimensions.height}
                  onChange={(e) => updateDimensions('height', parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>2.20 m (Sedan)</span>
                  <span>2.50 m (SUV/Van)</span>
                  <span>3.40 m (Kamper/Bus)</span>
                </div>
              </div>

              {/* Roof slope */}
              <div className="space-y-2 pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Kąt Spadku Dachu</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step={1}
                      min={0}
                      max={15}
                      value={config.dimensions.slope}
                      onChange={(e) => updateDimensions('slope', parseInt(e.target.value) || 0)}
                      className="w-20 bg-neutral-900 border border-neutral-600 rounded-lg px-2.5 py-1 text-sm font-bold font-mono text-amber-300 text-right focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-xs text-neutral-300 font-medium">°</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={1}
                  value={config.dimensions.slope}
                  onChange={(e) => updateDimensions('slope', parseInt(e.target.value) || 0)}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Post Profile */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Przekrój Słupów Nośnych (Wytrzymałość Śniegowa)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, postProfile: '150x150' }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.postProfile === '150x150'
                      ? 'border-amber-400 bg-amber-400/15 text-white shadow-md'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-sm font-bold text-white">150 × 150 mm</div>
                  <div className="text-xs text-neutral-300 mt-0.5">Obciążenie do 125 kg/m²</div>
                </button>

                <button
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, postProfile: '200x200' }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.postProfile === '200x200'
                      ? 'border-amber-400 bg-amber-400/15 text-white shadow-md'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-sm font-bold text-white">200 × 200 mm Heavy</div>
                  <div className="text-xs text-neutral-300 mt-0.5">Wzmocniony: do 160 kg/m²</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DACH & LAMELE */}
        {/* ========================================================= */}
        {activeTab === 'roof' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Technologia Zadaszenia & Lamele</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Wybierz system zadaszenia i steruj kątem otwarcia lameli.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: 'bioclimatic',
                  name: 'Obrotowe Lamele Bioklimatyczne (0 - 135°)',
                  badge: 'Bestseller',
                  desc: 'Aerodynamiczne profile aluminiowe z uszczelkami wygłuszającymi opady i ukrytym orynnowaniem.',
                },
                {
                  id: 'solar',
                  name: 'Dach Fotowoltaiczny BIPV (Szkło-Szkło)',
                  badge: 'Eco Energy',
                  desc: 'Bifacjalne moduły PV wytwarzające prąd bezpośrednio pod ładowanie Wallboxa.',
                },
                {
                  id: 'glass',
                  name: 'Szklenie Bezpieczne VSG/ESG 10mm',
                  badge: 'Maksymalne Światło',
                  desc: 'Laminowane szkło bezpieczne z filtrem przeciwsłonecznym UV.',
                },
                {
                  id: 'sandwich',
                  name: 'Panele Termoizolacyjne Sandwich PIR',
                  badge: 'Cisza & Ciepło',
                  desc: 'Pełne płyty warstwowe o maksymalnej izolacji akustycznej podczas deszczu.',
                },
              ].map((roof) => (
                <button
                  key={roof.id}
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, roofType: roof.id as RoofType }))}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    config.roofType === roof.id
                      ? 'border-amber-400 bg-amber-400/15 text-white shadow-md'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white">{roof.name}</span>
                    <span className="text-xs text-amber-400 font-mono font-bold">{roof.badge}</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{roof.desc}</p>
                </button>
              ))}
            </div>

            {/* Louver controls if bioclimatic */}
            {config.roofType === 'bioclimatic' && (
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Kąt Otwarcia Lameli</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={135}
                      value={config.louverAngle}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          louverAngle: Math.min(135, Math.max(0, parseInt(e.target.value) || 0)),
                        }))
                      }
                      className="w-16 bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-sm font-bold font-mono text-amber-300 text-center"
                    />
                    <span className="text-xs text-neutral-300 font-medium">°</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={135}
                  step={1}
                  value={config.louverAngle}
                  disabled={config.louverAnimation}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      louverAngle: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
                />

                {/* Preset angles */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '0° Zamknięte', angle: 0 },
                    { label: '45° Półcień', angle: 45 },
                    { label: '90° Przewiew', angle: 90 },
                    { label: '135° Pełne', angle: 135 },
                  ].map((p) => (
                    <button
                      key={p.angle}
                      type="button"
                      onClick={() => onChange((prev) => ({ ...prev, louverAngle: p.angle, louverAnimation: false }))}
                      className={`py-1.5 px-2 text-xs rounded-lg border text-center font-medium transition-colors ${
                        config.louverAngle === p.angle && !config.louverAnimation
                          ? 'border-amber-400 bg-amber-400/20 text-white font-bold'
                          : 'border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Auto animation toggle */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Animacja Ruchu Lameli</div>
                    <div className="text-[11px] text-neutral-400">Płynny obrót w czasie rzeczywistym</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        louverAnimation: !prev.louverAnimation,
                      }))
                    }
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors ${
                      config.louverAnimation
                        ? 'bg-amber-400 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {config.louverAnimation ? 'Aktywna' : 'Włącz Animację'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ZABUDOWA ŚCIAN & SCHOWEK */}
        {/* ========================================================= */}
        {activeTab === 'walls' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>Ściany Boczne & Schowek Narzędziowy</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Zabezpiecz pojazd przed wiatrem, deszczem i zawiewającym śniegiem.
              </p>
            </div>

            {(['left', 'right', 'back'] as const).map((side) => {
              if (side === 'back' && config.installationType === 'attached') {
                return null;
              }
              const title =
                side === 'left' ? 'Ściana Lewa' : side === 'right' ? 'Ściana Prawa' : 'Ściana Tylna';
              return (
                <div key={side} className="space-y-2 p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl">
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <select
                    value={config.sideWalls[side]}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        sideWalls: {
                          ...prev.sideWalls,
                          [side]: e.target.value as WallType,
                        },
                      }))
                    }
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
                  >
                    <option value="none">Brak zabudowy (Otwarta)</option>
                    <option value="wood-slats">Lamele Drewniane (Thermo Drewno Naturalne)</option>
                    <option value="alu-shutters">Przesuwne Żaluzje Aluminiowe (Shutters)</option>
                    <option value="glass-sliding">Przesuwne Panele Szklane (Bezramowe)</option>
                    <option value="solid-panel">Pełny Panel Aluminiowy Izolowany</option>
                  </select>
                </div>
              );
            })}

            {/* Storage room module with custom depth numeric input */}
            <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Schowek Gospodarczy / Rowerowy</div>
                  <div className="text-xs text-neutral-300">Zintegrowany boks z drzwiami i zamkiem Wilka</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.storageRoom.enabled}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      storageRoom: {
                        ...prev.storageRoom,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="w-5 h-5 rounded text-amber-400 cursor-pointer bg-neutral-800 border-neutral-700"
                />
              </div>

              {config.storageRoom.enabled && (
                <div className="space-y-3 pt-3 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Głębokość Schowka</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step={0.1}
                        min={1.0}
                        max={3.0}
                        value={config.storageRoom.depth}
                        onChange={(e) =>
                          onChange((prev) => ({
                            ...prev,
                            storageRoom: {
                              ...prev.storageRoom,
                              depth: parseFloat(e.target.value) || 1.2,
                            },
                          }))
                        }
                        className="w-20 bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-xs font-bold font-mono text-amber-300 text-right"
                      />
                      <span className="text-xs text-neutral-300">m</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1.2}
                    max={2.6}
                    step={0.1}
                    value={config.storageRoom.depth}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        storageRoom: {
                          ...prev.storageRoom,
                          depth: parseFloat(e.target.value),
                        },
                      }))
                    }
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: PALETA RAL & WŁASNE KOLORY */}
        {/* ========================================================= */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                <span>Kolorystyka & Własny Kolor RAL</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Wybierz gotowy odcień z palety architektonicznej lub <strong>wprowadź dowolny własny kod RAL / HEX</strong>.
              </p>
            </div>

            {/* CUSTOM RAL COLOR INPUT - NEW! */}
            <div className="p-4 bg-neutral-950/80 border border-neutral-700/80 rounded-xl space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Wprowadź Własny Kolor (Custom RAL / HEX)
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.colors.frameHex}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      colors: {
                        ...prev.colors,
                        frameHex: e.target.value,
                        frameName: 'Kolor Indywidualny',
                        frameRal: 'CUSTOM',
                      },
                    }))
                  }
                  className="w-12 h-10 rounded-lg border border-neutral-600 cursor-pointer bg-neutral-900 p-1"
                />
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={config.colors.frameRal}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        colors: {
                          ...prev.colors,
                          frameRal: e.target.value,
                        },
                      }))
                    }
                    placeholder="Kod RAL (np. RAL 7039)"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={config.colors.frameHex}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        colors: {
                          ...prev.colors,
                          frameHex: e.target.value,
                        },
                      }))
                    }
                    placeholder="#373F43"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Standard RAL palette */}
            <div>
              <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Standardowa Paleta Architektoniczna
              </div>
              <div className="grid grid-cols-1 gap-2">
                {RAL_PALETTE.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        colors: {
                          ...prev.colors,
                          frameRal: c.code,
                          frameName: c.name,
                          frameHex: c.hex,
                        },
                      }))
                    }
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      config.colors.frameRal === c.code
                        ? 'border-amber-400 bg-amber-400/15 shadow-md'
                        : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-lg border border-neutral-700 shadow-md shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{c.name}</div>
                      <div className="text-[11px] text-neutral-400">
                        {c.code} · {c.finish}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Wood tones */}
            <div>
              <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Wykończenie Lameli Drewnianych
              </div>
              <div className="grid grid-cols-3 gap-2">
                {WOOD_TONES.map((wt) => (
                  <button
                    key={wt.id}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        colors: {
                          ...prev.colors,
                          woodTone: wt.id as 'oak' | 'larch' | 'walnut',
                        },
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      config.colors.woodTone === wt.id
                        ? 'border-amber-400 bg-amber-400/20 text-white font-bold shadow-md'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className="w-6 h-6 mx-auto rounded-full border border-neutral-700 mb-1.5 shadow-sm"
                      style={{ backgroundColor: wt.hex }}
                    />
                    <div className="text-xs font-semibold text-white truncate">{wt.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: WYPOSAŻENIE & EV */}
        {/* ========================================================= */}
        {activeTab === 'accessories' && (
          <div className="space-y-4">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Wyposażenie & Elektromobilność</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Dodaj oświetlenie LED, ładowarkę pojazdów elektrycznych i automatykę.
              </p>
            </div>

            {/* LED Perimeter */}
            <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Liniowe Oświetlenie LED w Ramie</div>
                  <div className="text-xs text-neutral-300">Wbudowany profil LED z kloszem mlecznym IP67</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.accessories.ledPerimeter}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      accessories: {
                        ...prev.accessories,
                        ledPerimeter: e.target.checked,
                      },
                    }))
                  }
                  className="w-5 h-5 rounded text-amber-400 cursor-pointer bg-neutral-800 border-neutral-700"
                />
              </div>

              {config.accessories.ledPerimeter && (
                <div className="space-y-3 pt-3 border-t border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300 font-semibold">Moc / Jasność LED:</span>
                    <span className="font-mono text-amber-400 font-bold text-sm">
                      {config.accessories.ledBrightness}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={5}
                    value={config.accessories.ledBrightness}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        accessories: {
                          ...prev.accessories,
                          ledBrightness: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-neutral-300">Barwa światła:</span>
                    <div className="flex gap-1.5">
                      {[
                        { id: 'warm', label: 'Ciepła 3000K' },
                        { id: 'neutral', label: 'Neutralna 4000K' },
                        { id: 'cold', label: 'Zimna 6000K' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() =>
                            onChange((prev) => ({
                              ...prev,
                              accessories: {
                                ...prev.accessories,
                                ledColorTemp: t.id as ColorTemp,
                              },
                            }))
                          }
                          className={`px-2.5 py-1 text-xs rounded-lg border font-medium ${
                            config.accessories.ledColorTemp === t.id
                              ? 'border-amber-400 bg-amber-400/20 text-white font-bold'
                              : 'border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wallbox EV */}
            <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Stacja Ładowania EV Wallbox 22kW</div>
                <div className="text-xs text-neutral-300">Montaż na słupie nośnym, kabel 5m z wtyczką Type-2</div>
              </div>
              <input
                type="checkbox"
                checked={config.accessories.evCharger}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    accessories: {
                      ...prev.accessories,
                      evCharger: e.target.checked,
                    },
                  }))
                }
                className="w-5 h-5 rounded text-amber-400 cursor-pointer bg-neutral-800 border-neutral-700"
              />
            </div>

            {/* Internal gutter system */}
            <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">System Rynnowy Ukryty w Słupach</div>
                <div className="text-xs text-neutral-300">Niewidoczne grawitacyjne odprowadzanie wody ze stopami drenarskimi</div>
              </div>
              <input
                type="checkbox"
                checked={config.accessories.gutterSystem}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    accessories: {
                      ...prev.accessories,
                      gutterSystem: e.target.checked,
                    },
                  }))
                }
                className="w-5 h-5 rounded text-amber-400 cursor-pointer bg-neutral-800 border-neutral-700"
              />
            </div>

            {/* Somfy Motor */}
            <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Automatyka Somfy io & Pilot Wielokanałowy</div>
                <div className="text-xs text-neutral-300">Integracja ze smart home i centralą TaHoma</div>
              </div>
              <input
                type="checkbox"
                checked={config.accessories.somfyMotor}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    accessories: {
                      ...prev.accessories,
                      somfyMotor: e.target.checked,
                    },
                  }))
                }
                className="w-5 h-5 rounded text-amber-400 cursor-pointer bg-neutral-800 border-neutral-700"
              />
            </div>

            {/* Weather Sensors */}
            <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Stacja Pogodowa (Czujnik Deszczu & Wiatru)</div>
                <div className="text-xs text-neutral-300">Automatyczne zamykanie dachu podczas opadów</div>
              </div>
              <input
                type="checkbox"
                checked={config.accessories.weatherSensor}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    accessories: {
                      ...prev.accessories,
                      weatherSensor: e.target.checked,
                    },
                  }))
                }
                className="w-5 h-5 rounded text-amber-400 cursor-pointer bg-neutral-800 border-neutral-700"
              />
            </div>

            {/* Infrared Heater */}
            <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Promiennik Ciepła Podczerwieni 2400W</div>
                <div className="text-xs text-neutral-300">Wodoodporna oprawa IP65 z regulacją pilotem</div>
              </div>
              <input
                type="checkbox"
                checked={config.accessories.infraredHeater}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    accessories: {
                      ...prev.accessories,
                      infraredHeater: e.target.checked,
                    },
                  }))
                }
                className="w-5 h-5 rounded text-amber-400 cursor-pointer bg-neutral-800 border-neutral-700"
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: OTOCZENIE 3D & WIDOK */}
        {/* ========================================================= */}
        {activeTab === 'environment' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <span>Symulacja Środowiskowa & Widok 3D</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Zmień porę dnia, typ pojazdu w skali 1:1 oraz rodzaj podłoża.
              </p>
            </div>

            {/* Time of Day */}
            <div>
              <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Pora Dnia & Oświetlenie
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'day', label: 'Dzień', icon: Sun },
                  { id: 'sunset', label: 'Zmierzch', icon: Sunset },
                  { id: 'night', label: 'Noc (LED)', icon: Moon },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = config.environment.timeOfDay === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          environment: {
                            ...prev.environment,
                            timeOfDay: t.id as TimeOfDay,
                          },
                        }))
                      }
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'border-amber-400 bg-amber-400/20 text-white font-bold shadow-md'
                          : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1 text-amber-400" />
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vehicle in Scene */}
            <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Model Pojazdu w Skali 1:1</div>
                  <div className="text-xs text-neutral-300">Weryfikacja ergonomii wysiadania i wjazdu</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.environment.showCar}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      environment: {
                        ...prev.environment,
                        showCar: e.target.checked,
                      },
                    }))
                  }
                  className="w-5 h-5 rounded text-amber-400 cursor-pointer bg-neutral-800 border-neutral-700"
                />
              </div>

              {config.environment.showCar && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[
                    { id: 'suv', label: 'Duży SUV' },
                    { id: 'sedan', label: 'Sedan/Kombi' },
                    { id: 'ev', label: 'Pojazd EV' },
                  ].map((car) => (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          environment: {
                            ...prev.environment,
                            carType: car.id as CarType,
                          },
                        }))
                      }
                      className={`p-2.5 rounded-lg border text-center text-xs transition-colors font-medium ${
                        config.environment.carType === car.id
                          ? 'border-amber-400 bg-amber-400/20 text-white font-bold'
                          : 'border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {car.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dimensions toggle */}
            <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Linie Wymiarowe 3D & Wskaźniki</div>
                <div className="text-xs text-neutral-300">Pokaż osie szerokości, długości i wysokości w przestrzeni 3D</div>
              </div>
              <input
                type="checkbox"
                checked={config.environment.showDimensions}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    environment: {
                      ...prev.environment,
                      showDimensions: e.target.checked,
                    },
                  }))
                }
                className="w-5 h-5 rounded text-amber-400 cursor-pointer bg-neutral-800 border-neutral-700"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
