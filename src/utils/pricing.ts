import { CarportConfig, QuoteCalculation, PriceBreakdownItem } from '../types/carport';

export const RAL_PALETTE = [
  { code: 'RAL 7016', name: 'Antracytowy Szary (Struktura mat)', hex: '#373F43', finish: 'Drobna struktura' },
  { code: 'RAL 9005', name: 'Głęboka Czerń', hex: '#1C1D21', finish: 'Mat satynowy' },
  { code: 'RAL 9010', name: 'Czysta Biel Alpejska', hex: '#F7F9F9', finish: 'Gładki mat' },
  { code: 'RAL 9006', name: 'Srebrny Aluminiowy', hex: '#A5A8A6', finish: 'Metalik' },
  { code: 'RAL 7021', name: 'Szary Bazaltowy', hex: '#2F3234', finish: 'Struktura mat' },
  { code: 'RAL 8017', name: 'Czekoladowy Brąz', hex: '#44322D', finish: 'Mat' },
  { code: 'RAL 7035', name: 'Jasnoszary Platynowy', hex: '#D7D7D7', finish: 'Gładki mat' },
  { code: 'WOOD OAK', name: 'Dąb Turner / Winchester', hex: '#9E6A3B', finish: 'Drewnopodobny subl.' },
];

export const WOOD_TONES = [
  { id: 'oak', name: 'Dąb Naturalny Thermo', hex: '#A06E3C' },
  { id: 'larch', name: 'Modrzew Syberyjski', hex: '#BD894E' },
  { id: 'walnut', name: 'Orzech Ciemny', hex: '#533B27' },
];

export function calculateCarportQuote(config: CarportConfig, vatRate: number = 0.08): QuoteCalculation {
  const { width, length, height } = config.dimensions;
  const areaM2 = Math.round(width * length * 100) / 100;
  const volumeM3 = Math.round(width * length * height * 10) / 10;
  
  // Calculate effective post count
  const isAttached = config.installationType === 'attached';
  const basePosts = isAttached ? (length > 6 ? 3 : 2) : (length > 6 || width > 6 ? 6 : 4);
  
  const items: PriceBreakdownItem[] = [];

  // Multiplier from project settings (e.g. price adjustment)
  const multiplier = config.project?.customUnitMultiplier || 1.0;

  // 1. Konstrukcja nośna
  const postPriceMultiplier = config.postProfile === '200x200' ? 1.25 : 1.0;
  const structureBasePrice = Math.round(areaM2 * 850 * postPriceMultiplier * multiplier);
  items.push({
    name: `Konstrukcja nośna Alu EN AW-6060 T66 (${config.postProfile} mm)`,
    category: 'Konstrukcja',
    description: `Ekstrudowane profile aluminiowe, słupy (${basePosts} szt.), belki wieńczące zintegrowane ze stopami, malowanie proszkowe Qualicoat`,
    unit: 'kpl',
    quantity: 1,
    unitPrice: structureBasePrice,
    totalPrice: structureBasePrice,
  });

  // 2. Pokrycie dachowe
  let roofUnitPrice = 0;
  let roofName = '';
  let roofDesc = '';

  switch (config.roofType) {
    case 'bioclimatic':
      roofUnitPrice = Math.round(920 * multiplier);
      roofName = 'System obrotowych lameli bioklimatycznych 0-135°';
      roofDesc = 'Aerodynamiczne profile z uszczelkami EPDM wygłuszającymi opady i ukrytym rynnowaniem';
      break;
    case 'solar':
      roofUnitPrice = Math.round(1250 * multiplier);
      roofName = 'Dach fotowoltaiczny BIPV szkło-szkło (Bifacjalny)';
      roofDesc = `Zintegrowane moduły PV o szacunkowej mocy ~${Math.round(areaM2 * 0.2 * 10) / 10} kWp, klasa gradowa RG4`;
      break;
    case 'glass':
      roofUnitPrice = Math.round(680 * multiplier);
      roofName = 'Szklenie bezpieczne VSG/ESG 10mm z filtrem UV';
      roofDesc = 'Hartowane szkło laminowane bezpieczne, odporne na obciążenie śniegiem i grad';
      break;
    case 'sandwich':
      roofUnitPrice = Math.round(490 * multiplier);
      roofName = 'Panele termoizolacyjne z rdzeniem PIR + rąbek';
      roofDesc = 'Płyty warstwowe o podwyższonej sztywności i izolacji akustycznej podczas deszczu';
      break;
  }

  const roofTotalPrice = Math.round(areaM2 * roofUnitPrice);
  items.push({
    name: roofName,
    category: 'Zadaszenie',
    description: roofDesc,
    unit: 'm²',
    quantity: areaM2,
    unitPrice: roofUnitPrice,
    totalPrice: roofTotalPrice,
  });

  // 3. Automatyka Somfy dla lameli
  if (config.roofType === 'bioclimatic' || config.accessories.somfyMotor) {
    items.push({
      name: 'Siłownik liniowy Somfy io z centralą radiową',
      category: 'Automatyka',
      description: 'Zabezpieczenie przeciążeniowe, integracja smart home TaHoma, pilot wielokanałowy',
      unit: 'kpl',
      quantity: 1,
      unitPrice: Math.round(2850 * multiplier),
      totalPrice: Math.round(2850 * multiplier),
    });
  }

  // 4. Ściany boczne
  const wallDefs: { key: keyof typeof config.sideWalls; name: string; lengthM: number }[] = [
    { key: 'left', name: 'Ściana lewa', lengthM: length },
    { key: 'right', name: 'Ściana prawa', lengthM: length },
    { key: 'back', name: 'Ściana tylna', lengthM: width },
  ];

  wallDefs.forEach((wall) => {
    const wallType = config.sideWalls[wall.key];
    if (wallType !== 'none') {
      const wallArea = Math.round(wall.lengthM * height * 10) / 10;
      let priceM2 = 0;
      let label = '';
      if (wallType === 'wood-slats') {
        priceM2 = Math.round(420 * multiplier);
        label = `Żaluzje lamelowe drewniane (${wall.name})`;
      } else if (wallType === 'alu-shutters') {
        priceM2 = Math.round(640 * multiplier);
        label = `Przesuwne panele żaluzjowe alu (${wall.name})`;
      } else if (wallType === 'glass-sliding') {
        priceM2 = Math.round(780 * multiplier);
        label = `System przesuwnych paneli szklanych (${wall.name})`;
      } else if (wallType === 'solid-panel') {
        priceM2 = Math.round(380 * multiplier);
        label = `Zabudowa pełna panelowa (${wall.name})`;
      }

      const total = Math.round(wallArea * priceM2);
      items.push({
        name: label,
        category: 'Zabudowa boczna',
        description: `Wymiary modułu: ${wall.lengthM.toFixed(2)}m × ${height.toFixed(2)}m (${wallArea} m²)`,
        unit: 'm²',
        quantity: wallArea,
        unitPrice: priceM2,
        totalPrice: total,
      });
    }
  });

  // 5. Schowek gospodarczy
  if (config.storageRoom.enabled) {
    const storageArea = Math.round(width * config.storageRoom.depth * 10) / 10;
    const storagePrice = Math.round((5800 + storageArea * 650) * multiplier);
    items.push({
      name: `Zintegrowany schowek narzędziowy / rowerowy (${storageArea} m²)`,
      category: 'Zabudowa',
      description: `Wymiary: ${width.toFixed(2)}m × ${config.storageRoom.depth.toFixed(2)}m, drzwi aluminiowe z zamkiem Wilka, okucie ze stali nierdzewnej`,
      unit: 'kpl',
      quantity: 1,
      unitPrice: storagePrice,
      totalPrice: storagePrice,
    });
  }

  // 6. Oświetlenie LED
  if (config.accessories.ledPerimeter) {
    const perimeterM = Math.round((width * 2 + length * 2) * 10) / 10;
    const ledPrice = Math.round((1400 + perimeterM * 90) * multiplier);
    items.push({
      name: 'Oświetlenie liniowe LED RGBW/CCT obwodowe w ramie',
      category: 'Elektryka & LED',
      description: `Profil ukryty w obwodzie ramy (${perimeterM} mb), zasilacz MeanWell IP67, ściemniacz radiowy`,
      unit: 'kpl',
      quantity: 1,
      unitPrice: ledPrice,
      totalPrice: ledPrice,
    });
  }

  if (config.accessories.ledLouvers && config.roofType === 'bioclimatic') {
    items.push({
      name: 'Punkty LED Spot zintegrowane w lamelach dachowych',
      category: 'Elektryka & LED',
      description: 'Zestaw wodoszczelnych opraw LED zintegrowanych bezpośrednio z profilami lameli',
      unit: 'kpl',
      quantity: 1,
      unitPrice: Math.round(1950 * multiplier),
      totalPrice: Math.round(1950 * multiplier),
    });
  }

  // 7. Stacja ładowania Wallbox EV
  if (config.accessories.evCharger) {
    items.push({
      name: 'Stacja ładowania pojazdów elektrycznych Wallbox 22kW Type-2',
      category: 'Elektromobilność',
      description: 'Montaż na słupie nośnym, kabel 5m z wtyczką Type 2, autoryzacja RFID i WiFi',
      unit: 'szt.',
      quantity: 1,
      unitPrice: Math.round(4200 * multiplier),
      totalPrice: Math.round(4200 * multiplier),
    });
  }

  // 8. Orynnowanie wewnętrzne
  if (config.accessories.gutterSystem) {
    items.push({
      name: 'System rynnowy ukryty w belkach i słupach nośnych',
      category: 'Odwodnienie',
      description: 'Odprowadzenie grawitacyjne wody deszczowej przez wnętrza słupów ze stopami drenarskimi',
      unit: 'kpl',
      quantity: 1,
      unitPrice: Math.round(1650 * multiplier),
      totalPrice: Math.round(1650 * multiplier),
    });
  }

  // 9. Promiennik ciepła IR
  if (config.accessories.infraredHeater) {
    items.push({
      name: 'Promiennik ciepła podczerwieni 2400W z pilotem',
      category: 'Komfort',
      description: 'Krótkofalowe promieniowanie kwarcowe o wysokiej sprawności cieplnej, obudowa IP65',
      unit: 'szt.',
      quantity: 1,
      unitPrice: Math.round(2100 * multiplier),
      totalPrice: Math.round(2100 * multiplier),
    });
  }

  // 10. Czujniki pogodowe
  if (config.accessories.weatherSensor) {
    items.push({
      name: 'Zintegrowana stacja pogodowa (czujnik deszczu i wiatru)',
      category: 'Automatyka',
      description: 'Automatyczne domykanie lameli podczas deszczu oraz ochrona przed porywami wiatru',
      unit: 'kpl',
      quantity: 1,
      unitPrice: Math.round(1350 * multiplier),
      totalPrice: Math.round(1350 * multiplier),
    });
  }

  // 11. Montaż certyfikowany z kotwieniem
  const assemblyPrice = Math.round((3500 + areaM2 * 120) * multiplier);
  items.push({
    name: 'Certyfikowany montaż konstrukcji z kotwieniem chemicznym',
    category: 'Usługa',
    description: 'Niwelacja laserowa, atestowane kotwy chemiczne Fischer, podłączenie elektryki, próba szczelności',
    unit: 'usł.',
    quantity: 1,
    unitPrice: assemblyPrice,
    totalPrice: assemblyPrice,
  });

  // 12. User Custom items entered manually
  if (config.customCostItems && config.customCostItems.length > 0) {
    config.customCostItems.forEach((cItem) => {
      const lineTotal = Math.round(cItem.quantity * cItem.unitPrice);
      items.push({
        id: cItem.id,
        name: cItem.name || 'Własna pozycja inwestycji',
        category: cItem.category || 'Dodatkowe',
        description: `Wprowadzona przez użytkownika / inwestora`,
        unit: cItem.unit || 'kpl',
        quantity: cItem.quantity || 1,
        unitPrice: cItem.unitPrice || 0,
        totalPrice: lineTotal,
        isCustom: true,
      });
    });
  }

  const subtotalNetto = items.reduce((acc, curr) => acc + curr.totalPrice, 0);

  // Discount calculation
  const discountPercent = config.project?.discountPercent || 0;
  const discountAmount = Math.round((subtotalNetto * discountPercent) / 100);
  const subtotalAfterDiscountNetto = subtotalNetto - discountAmount;

  const vatAmount = Math.round(subtotalAfterDiscountNetto * vatRate);
  const totalBrutto = subtotalAfterDiscountNetto + vatAmount;

  // Engineering calculations
  const snowLoadKgM2 = config.postProfile === '200x200' ? 160 : 125;
  const windResistanceKmh = config.postProfile === '200x200' ? 135 : 120;

  return {
    areaM2,
    volumeM3,
    snowLoadKgM2,
    windResistanceKmh,
    items,
    subtotalNetto,
    discountAmount,
    subtotalAfterDiscountNetto,
    vatRate,
    vatAmount,
    totalBrutto,
    estimatedDeliveryWeeks: '3-4 tygodnie',
    warrantyYears: 10,
  };
}

export function formatPLN(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(amount);
}
