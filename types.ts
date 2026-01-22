export enum CalculationMode {
  DASHBOARD = 'DASHBOARD',
  CALCULATOR = 'CALCULATOR',
  COMPARATOR = 'COMPARATOR',
  REVERSE = 'REVERSE',
  DTF = 'DTF',
  SETTINGS = 'SETTINGS',
}

export interface SilkPriceTable {
  small: { firstColor: number; extraColor: number; screenNew: number; screenRemake: number };
  large: { firstColor: number; extraColor: number; screenNew: number; screenRemake: number };
}

export interface ServicesCosts {
  cuttingManual: number;   
  cuttingPlotter: number;  
  plotterPaper: number;    
  sewingStandard: number;  
  dtfPrintMeter: number;   
  dtfApplication: number;  
}

export interface SettingsData {
  monthlyFixedCosts: number;
  estimatedMonthlyProduction: number;
  // GARANTINDO QUE ACEITA MEI
  taxRegime: 'SIMPLES' | 'MEI';
  defaultTaxRate: number;
  defaultCardRate: number;
  defaultMarketingRate: number;
  defaultCommissionRate: number;
  silkPrices: SilkPriceTable;
  serviceCosts: ServicesCosts;
}

export interface Embellishment {
  id: string;
  type: 'SILK' | 'BORDADO' | 'DTF';
  silkSize?: 'SMALL' | 'LARGE' | 'CUSTOM'; 
  printSetupCost?: number;
  printColors?: number;
  printPassCost?: number;
  isRegraving?: boolean; 
  embroideryStitchCount?: number; 
  embroideryCostPerThousand?: number;
  dtfMetersUsed?: number; 
  calculatedUnitCost?: number;
}

export interface ProductInput {
  productCategory: string;
  customProductName: string;
  fabricPricePerKg: number;
  piecesPerKg: number;
  lossPercentage: number;
  cuttingType: 'MANUAL' | 'PLOTTER';
  plotterMetersTotal: number; 
  plotterFreight: number;     
  cuttingLaborCost: number; 
  embellishments: Embellishment[];
  sewingCost: number; 
  finishingCost: number;
  packagingCost: number;
  logisticsTotalCost: number; 
  freightOutCost: number;
  batchSize: number;
  targetMargin: number;
}

export interface CalculationResult {
  materialUnit: number;
  plotterUnit: number;
  cuttingLaborUnit: number;
  processingUnit: number; 
  sewingUnit: number;
  logisticsInUnit: number;
  industrialCostUnit: number;
  fixedOverheadUnit: number;
  totalProductionCost: number;
  suggestedSalePrice: number;
  taxesUnit: number;
  cardFeesUnit: number;
  marketingUnit: number;
  commissionUnit: number;
  commercialExpensesUnit: number;
  netProfitUnit: number;
  markup: number;
  warnings: string[];
}

export interface DTFResultData {
  totalMeters: number;
  printCost: number;
  appCost: number;
  totalCost: number;
  totalItems: number;
  priceTier: string;
  isOutsourced: boolean;
}