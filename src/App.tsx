import React, { useState, useRef, useEffect } from 'react';
import { CarportConfig, TimeOfDay } from './types/carport';
import { DEFAULT_CONFIG } from './utils/presets';
import { CarportViewer3D } from './components/CarportViewer3D';
import { TopNav } from './components/TopNav';
import { ConfigPanel } from './components/ConfigPanel';
import { SummaryBar } from './components/SummaryBar';
import { SpecificationModal } from './components/SpecificationModal';
import { PresetsModal } from './components/PresetsModal';

export default function App() {
  const [config, setConfig] = useState<CarportConfig>(() => {
    try {
      const saved = localStorage.getItem('carport_config_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          dimensions: { ...DEFAULT_CONFIG.dimensions, ...(parsed.dimensions || {}) },
          colors: { ...DEFAULT_CONFIG.colors, ...(parsed.colors || {}) },
          accessories: { ...DEFAULT_CONFIG.accessories, ...(parsed.accessories || {}) },
          environment: { ...DEFAULT_CONFIG.environment, ...(parsed.environment || {}) },
          project: { ...DEFAULT_CONFIG.project, ...(parsed.project || {}) },
          customCostItems: Array.isArray(parsed.customCostItems) ? parsed.customCostItems : [],
        };
      }
    } catch (e) {
      // Ignore
    }
    return DEFAULT_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<string>('dimensions');
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const screenshotRef = useRef<(() => string) | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('carport_config_v2', JSON.stringify(config));
    } catch (e) {
      // Ignore
    }
  }, [config]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3600);
  };

  // Take high resolution 3D screenshot
  const handleTakeScreenshot = () => {
    if (screenshotRef.current) {
      const dataUrl = screenshotRef.current();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `Carport-Wizualizacja-3D-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        showToast('Wizualizacja 3D została pobrana jako plik graficzny PNG!');
      }
    }
  };

  // Export JSON configuration file
  const handleExportJson = () => {
    try {
      const fileName = `${(config.project?.projectName || 'Carport-Projekt')
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()}-${Date.now()}.json`;
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', fileName);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Konfiguracja projektu została wyeksportowana jako plik JSON!');
    } catch (err) {
      showToast('Wystąpił błąd podczas eksportu konfiguracji.');
    }
  };

  // Import JSON configuration file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        if (imported && imported.dimensions && imported.roofType) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...imported,
            dimensions: { ...DEFAULT_CONFIG.dimensions, ...(imported.dimensions || {}) },
            colors: { ...DEFAULT_CONFIG.colors, ...(imported.colors || {}) },
            accessories: { ...DEFAULT_CONFIG.accessories, ...(imported.accessories || {}) },
            environment: { ...DEFAULT_CONFIG.environment, ...(imported.environment || {}) },
            project: { ...DEFAULT_CONFIG.project, ...(imported.project || {}) },
            customCostItems: Array.isArray(imported.customCostItems) ? imported.customCostItems : [],
          });
          showToast(`Projekt "${imported.project?.projectName || imported.name || 'Wczytany'}" został pomyślnie załadowany!`);
        } else {
          showToast('Nieprawidłowy format pliku projektu JSON.');
        }
      } catch (err) {
        showToast('Błąd odczytu pliku JSON. Upewnij się, że plik nie jest uszkodzony.');
      }
    };
    reader.readAsText(file);
    // Reset file input so user can re-import same file if wanted
    e.target.value = '';
  };

  // Select preset
  const handleSelectPreset = (presetData: Partial<CarportConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...presetData,
      dimensions: {
        ...prev.dimensions,
        ...(presetData.dimensions || {}),
      },
      sideWalls: {
        ...prev.sideWalls,
        ...(presetData.sideWalls || {}),
      },
      storageRoom: {
        ...prev.storageRoom,
        ...(presetData.storageRoom || {}),
      },
      colors: {
        ...prev.colors,
        ...(presetData.colors || {}),
      },
      accessories: {
        ...prev.accessories,
        ...(presetData.accessories || {}),
      },
      environment: {
        ...prev.environment,
        ...(presetData.environment || {}),
      },
      project: {
        ...prev.project,
        ...(presetData.project || {}),
        projectName: presetData.name || prev.project?.projectName,
      },
    }));
    showToast(`Załadowano kolekcję: ${presetData.name || 'Wybrany projekt'}`);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans select-none">
      {/* Top Bar with Wordmark & Actions */}
      <TopNav
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onTakeScreenshot={handleTakeScreenshot}
        onOpenPresets={() => setIsPresetsOpen(true)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Workspace Area (3D Viewport + Config Side Panel) */}
      <div className="flex-1 flex flex-col lg:flex-row relative min-h-0 overflow-hidden">
        {/* 3D Visualizer Viewport */}
        <main className="flex-1 relative h-full min-h-[350px]">
          <CarportViewer3D config={config} onTakeScreenshotRef={screenshotRef} />
        </main>

        {/* Parametric Configuration Sidebar */}
        <ConfigPanel
          config={config}
          onChange={setConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
        />
      </div>

      {/* Bottom Live Summary & Quick Camera Bar */}
      <SummaryBar
        config={config}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onTimeChange={(time: TimeOfDay) =>
          setConfig((prev) => ({
            ...prev,
            environment: { ...prev.environment, timeOfDay: time },
          }))
        }
        onCameraChange={(angle) =>
          setConfig((prev) => ({
            ...prev,
            environment: { ...prev.environment, viewAngle: angle },
          }))
        }
      />

      {/* Technical Specification and Cost Breakdown Modal */}
      <SpecificationModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
        config={config}
      />

      {/* Preset Archetypes Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-neutral-900 border border-amber-400 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl animate-fade-in flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
