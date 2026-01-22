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
  cuttingManualPlotter: number; // NOVO: Risco Plotado + Corte Manual
  cuttingMachine: number;       // NOVO: Corte Automático
  plotterPaper: number;    
  sewingStandard: number;  
  dtfPrintMeter: number;   
  dtfApplication: number;  
}

export interface SettingsData {
  monthlyFixedCosts: number;
  estimatedMonthlyProduction: number;
  taxRegime: 'SIMPLES' | 'MEI';
  defaultTaxRate: number; 
  meiDasTax: number;      
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
  printUnitCost?: number;
}

export interface ProductInput {
  productCategory: string;
  customProductName: string;
  
  // Malha
  fabricPricePerKg: number;
  piecesPerKg: number;
  lossPercentage: number;
  fabricWidth: number; // NOVO: Largura da Malha (para validar plotter)

  // Ribana
  ribanaPricePerKg: number;
  ribanaYield: number;

  // Corte
  cuttingType: 'MANUAL_RISCO' | 'MANUAL_PLOTTER' | 'MACHINE'; // Tipos atualizados
  plotterMetersTotal: number; 
  plotterFreight: number;     
  cuttingLaborCost: number; 
  
  embellishments: Embellishment[];
  
  // Confecção
  sewingCost: number; 
  finishingCost: number;
  packagingCost: number;
  
  // Aviamentos
  aviamentosCost: number; 

  // Logística
  logisticsTotalCost: number; 
  freightOutCost: number;     
  
  // Pilotagem
  pilotingCost: number; 

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