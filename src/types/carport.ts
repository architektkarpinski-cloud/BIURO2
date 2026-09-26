export type InstallationType = 'freestanding' | 'attached';
export type BayCount = 1 | 2;
export type PostProfile = '150x150' | '200x200';
export type RoofType = 'bioclimatic' | 'glass' | 'sandwich' | 'solar';
export type WallType = 'none' | 'wood-slats' | 'alu-shutters' | 'glass-sliding' | 'solid-panel';
export type GroundType = 'pavers' | 'concrete' | 'gravel';
export type TimeOfDay = 'day' | 'sunset' | 'night';
export type CarType = 'suv' | 'sedan' | 'ev';
export type ColorTemp = 'warm' | 'neutral' | 'cold';

export interface CarportDimensions {
  width: number;    // meters: e.g. 3.0 to 8.0
  length: number;   // meters: e.g. 4.0 to 12.0
  height: number;   // meters: e.g. 2.1 to 4.0
  slope: number;    // degrees: 0 to 15
}

export interface SideWallsConfig {
  left: WallType;
  right: WallType;
  back: WallType;
}

export interface StorageRoomConfig {
  enabled: boolean;
  depth: number; // meters: 1.0 to 3.0
  hasWindow: boolean;
}

export interface ColorScheme {
  frameRal: string;
  frameName: string;
  frameHex: string;
  roofRal: string;
  roofName: string;
  roofHex: string;
  woodTone: 'oak' | 'larch' | 'walnut';
  isCustomFrameColor?: boolean;
  isCustomRoofColor?: boolean;
}

export interface AccessoriesConfig {
  ledPerimeter: boolean;
  ledLouvers: boolean;
  ledBrightness: number; // 0 - 100
  ledColorTemp: ColorTemp;
  evCharger: boolean;
  gutterSystem: boolean;
  infraredHeater: boolean;
  somfyMotor: boolean;
  weatherSensor: boolean;
}

export interface EnvironmentConfig {
  showCar: boolean;
  carType: CarType;
  showWall: boolean;
  groundType: GroundType;
  timeOfDay: TimeOfDay;
  showDimensions: boolean;
  viewAngle: 'perspective' | 'front' | 'side' | 'top' | 'isometric';
}

export interface CustomCostItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface ProjectMetadata {
  projectName: string;
  investorName: string;
  investmentAddress: string;
  plotNumber: string;
  designerName: string;
  notes: string;
  creationDate: string;
  discountPercent: number;
  customUnitMultiplier: number;
}

export interface CarportConfig {
  id: string;
  name: string;
  installationType: InstallationType;
  bays: BayCount;
  dimensions: CarportDimensions;
  postProfile: PostProfile;
  roofType: RoofType;
  louverAngle: number; // 0 to 135 deg
  louverAnimation: boolean;
  sideWalls: SideWallsConfig;
  storageRoom: StorageRoomConfig;
  colors: ColorScheme;
  accessories: AccessoriesConfig;
  environment: EnvironmentConfig;
  project: ProjectMetadata;
  customCostItems: CustomCostItem[];
}

export interface RalColorOption {
  code: string;
  name: string;
  hex: string;
  finish: string;
}

export interface PriceBreakdownItem {
  id?: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom?: boolean;
}

export interface QuoteCalculation {
  areaM2: number;
  volumeM3: number;
  snowLoadKgM2: number;
  windResistanceKmh: number;
  items: PriceBreakdownItem[];
  subtotalNetto: number;
  discountAmount: number;
  subtotalAfterDiscountNetto: number;
  vatRate: number; // 0.08 or 0.23
  vatAmount: number;
  totalBrutto: number;
  estimatedDeliveryWeeks: string;
  warrantyYears: number;
}
