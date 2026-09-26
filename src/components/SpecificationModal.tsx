import React, { useState, useEffect } from 'react';
import { CarportConfig } from '../types/carport';
import { calculateCarportQuote, formatPLN } from '../utils/pricing';
import confetti from 'canvas-confetti';
import {
  X,
  Printer,
  Send,
  CheckCircle2,
  Shield,
  FileCheck,
  Calendar,
  Layers,
  Wrench,
  Building,
  User,
  MapPin,
  Check,
  Percent,
} from 'lucide-react';

interface SpecificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CarportConfig;
}

export const SpecificationModal: React.FC<SpecificationModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [vatRate, setVatRate] = useState<number>(0.08);
  const [investorName, setInvestorName] = useState(config.project?.investorName || '');
  const [investorEmail, setInvestorEmail] = useState('');
  const [investorCity, setInvestorCity] = useState(config.project?.investmentAddress || '');
  const [investorNotes, setInvestorNotes] = useState(config.project?.notes || '');
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (config.project?.investorName) setInvestorName(config.project.investorName);
    if (config.project?.investmentAddress) setInvestorCity(config.project.investmentAddress);
    if (config.project?.notes) setInvestorNotes(config.project.notes);
  }, [config.project]);

  if (!isOpen) return null;

  const quote = calculateCarportQuote(config, vatRate);
  const projectCode = `CARPORT-2026-${Math.abs(
    Math.round(config.dimensions.width * 100 + config.dimensions.length * 10)
  ).toString(16).toUpperCase()}`;

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/90 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 font-bold tracking-wider">{projectCode}</span>
              <span className="text-neutral-500">·</span>
              <span className="text-xs text-neutral-300 font-medium">Dokumentacja Techniczno-Kosztorysowa</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              {config.project?.projectName || config.name || 'Pergola Garażowa Carport'}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-200 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Drukuj / Pobierz PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Investor & Project Identification Banner */}
          {(config.project?.investorName || config.project?.investmentAddress) && (
            <div className="p-4 bg-amber-400/10 border border-amber-400/30 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span className="text-neutral-300">Inwestor:</span>
                <span className="font-bold text-white">{config.project.investorName || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-neutral-300">Lokalizacja:</span>
                <span className="font-bold text-white">{config.project.investmentAddress || '—'}</span>
              </div>
              {config.project?.plotNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-300">Działka nr:</span>
                  <span className="font-bold text-white font-mono">{config.project.plotNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* Key Parameters Matrix - HIGH LEGIBILITY & CRISP CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-700/80 shadow-md">
              <div className="text-xs uppercase font-mono tracking-wider text-neutral-400">Wymiary w rzucie</div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                {config.dimensions.width.toFixed(2)} m × {config.dimensions.length.toFixed(2)} m
              </div>
              <div className="text-xs text-amber-400 font-medium mt-1">
                Powierzchnia: <strong>{quote.areaM2} m²</strong>
              </div>
            </div>

            <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-700/80 shadow-md">
              <div className="text-xs uppercase font-mono tracking-wider text-neutral-400">Wysokość wjazdu</div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                {config.dimensions.height.toFixed(2)} m
              </div>
              <div className="text-xs text-neutral-300 mt-1">Kubatura: <strong>{quote.volumeM3} m³</strong></div>
            </div>

            <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-700/80 shadow-md">
              <div className="text-xs uppercase font-mono tracking-wider text-neutral-400">Wytrzymałość śniegowa</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                {quote.snowLoadKgM2} kg/m²
              </div>
              <div className="text-xs text-neutral-300 mt-1">Strefa I-IV Eurokod EN-1999</div>
            </div>

            <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-700/80 shadow-md">
              <div className="text-xs uppercase font-mono tracking-wider text-neutral-400">Gwarancja producenta</div>
              <div className="text-lg font-bold text-amber-400 font-mono mt-1">
                {quote.warrantyYears} Lat
              </div>
              <div className="text-xs text-neutral-300 mt-1">Powłoka Qualicoat Seaside</div>
            </div>
          </div>

          {/* Technical Details Grid */}
          <div className="p-5 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-400" />
              <span>Parametry Techniczne i Specyfikacja Materiałowa</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-8 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Typ posadowienia:</span>
                <span className="text-white font-semibold">
                  {config.installationType === 'freestanding' ? 'Wolnostojąca (słupy nośne)' : 'Przyścienna (do elewacji)'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Przekrój słupów:</span>
                <span className="text-white font-semibold">{config.postProfile} mm (ekstrudowane EN AW-6060 T66)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Typ pokrycia dachu:</span>
                <span className="text-white font-semibold">
                  {config.roofType === 'bioclimatic'
                    ? `Lamele bioklimatyczne 0-135° (aktualny kąt: ${config.louverAngle}°)`
                    : config.roofType === 'solar'
                    ? 'Dach fotowoltaiczny BIPV szkło-szkło'
                    : config.roofType === 'glass'
                    ? 'Szkło bezpieczne VSG/ESG 10mm'
                    : 'Płyta warstwowa termoizolacyjna'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Kolor ramy i słupów:</span>
                <span className="text-white font-semibold">
                  {config.colors.frameRal} ({config.colors.frameName})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Kolor lameli dachowych:</span>
                <span className="text-white font-semibold">
                  {config.colors.roofRal} ({config.colors.roofName})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Odprowadzenie wody:</span>
                <span className="text-white font-semibold">
                  {config.accessories.gutterSystem ? 'Zintegrowane wewnątrz słupów' : 'Standardowe rynnowe'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Stacja ładowania:</span>
                <span className="text-white font-semibold">
                  {config.accessories.evCharger ? 'Wallbox 22kW Type-2 zintegrowany' : 'Brak stacji'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Automatyka dachowa:</span>
                <span className="text-white font-semibold">
                  {config.accessories.somfyMotor ? 'Siłownik Somfy io + pilot radiowy' : 'Standardowa'}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Bill of Materials (BOM) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Zestawienie Elementów i Kosztorys Inwestorski</span>
              </h3>

              {/* VAT Switcher */}
              <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => setVatRate(0.08)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vatRate === 0.08
                      ? 'bg-amber-400 text-neutral-950 shadow-md'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  Stawka VAT 8% (Bud. Mieszkalne)
                </button>
                <button
                  type="button"
                  onClick={() => setVatRate(0.23)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vatRate === 0.23
                      ? 'bg-amber-400 text-neutral-950 shadow-md'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  Stawka VAT 23% (Firma)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-neutral-800 rounded-xl bg-neutral-950/60 shadow-lg">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-950 text-neutral-300 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Pozycja / Komponent</th>
                    <th className="py-3 px-4 font-bold">Kategoria</th>
                    <th className="py-3 px-4 font-bold text-center">Ilość</th>
                    <th className="py-3 px-4 font-bold text-right">Cena jedn.</th>
                    <th className="py-3 px-4 font-bold text-right">Wartość Netto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {quote.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.isCustom && (
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                              Pozycja własna
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 mt-0.5">{item.description}</div>
                      </td>
                      <td className="py-3 px-4 text-neutral-300">{item.category}</td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-white">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-300">
                        {formatPLN(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                        {formatPLN(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-neutral-950 border-t border-neutral-700 font-semibold text-xs sm:text-sm">
                  <tr>
                    <td colSpan={4} className="py-2.5 px-4 text-right text-neutral-400">
                      Suma pozycji netto:
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-white tabular-nums">
                      {formatPLN(quote.subtotalNetto)}
                    </td>
                  </tr>

                  {quote.discountAmount > 0 && (
                    <tr className="text-emerald-400">
                      <td colSpan={4} className="py-2 px-4 text-right font-bold">
                        Rabat inwestorski ({config.project?.discountPercent}%):
                      </td>
                      <td className="py-2 px-4 text-right font-mono font-bold tabular-nums">
                        - {formatPLN(quote.discountAmount)}
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td colSpan={4} className="py-2 px-4 text-right text-neutral-400">
                      Podatek VAT ({(vatRate * 100).toFixed(0)}%):
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-neutral-300 tabular-nums">
                      {formatPLN(quote.vatAmount)}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-amber-400/60 bg-neutral-950">
                    <td colSpan={4} className="py-3.5 px-4 text-right text-sm sm:text-base text-white font-extrabold uppercase tracking-tight">
                      ŁĄCZNIE BRUTTO Z MONTAŻEM:
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-lg sm:text-xl font-extrabold text-amber-400 tabular-nums">
                      {formatPLN(quote.totalBrutto)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Form to submit inquiry / order consultation */}
          <div className="p-6 bg-neutral-950/80 rounded-xl border border-neutral-700/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              <span>Zamów bezpłatną konsultację inżynierską i wizję lokalną</span>
            </h3>

            {isSent ? (
              <div className="p-4 bg-emerald-950/50 border border-emerald-700 rounded-xl flex items-center gap-3 text-emerald-300 text-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-200">Zapytanie zostało pomyślnie wysłane!</div>
                  <div>Inżynier projektu skontaktuje się w ciągu 24h z przygotowanym rysunkiem wykonawczym DWG/PDF.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Imię i Nazwisko / Firma</label>
                    <input
                      type="text"
                      required
                      placeholder="Jan Kowalski"
                      value={investorName}
                      onChange={(e) => setInvestorName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Adres E-mail</label>
                    <input
                      type="email"
                      required
                      placeholder="jan.kowalski@domena.pl"
                      value={investorEmail}
                      onChange={(e) => setInvestorEmail(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Miejscowość Inwestycji</label>
                    <input
                      type="text"
                      required
                      placeholder="np. Warszawa, Poznań, Gdańsk"
                      value={investorCity}
                      onChange={(e) => setInvestorCity(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Dodatkowe uwagi / termin realizacji</label>
                  <input
                    type="text"
                    placeholder="np. podłoże z kostki, montaż zasilania trójfazowego do Wallboxa..."
                    value={investorNotes}
                    onChange={(e) => setInvestorNotes(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-amber-400/25"
                  >
                    Wyślij Konfigurację do Wyceny
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
