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
  cuttingManualPlotter: number; 
  plotterPaper: number;    
  sewingStandard: number;  
  dtfPrintMeter: number;   
  
  // REGRA DTF
  dtfAppRetail: number;    // Varejo (ex: 2.00)
  dtfAppWholesale: number; // Atacado (ex: 1.50)
  dtfWholesaleLimit: number; // Limite (ex: 100)
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
  
  // Campos SILK
  printSetupCost?: number; // Custo Tela
  printColors?: number;
  printPassCost?: number;
  isRegraving?: boolean; 
  
  // Campos BORDADO
  embroideryStitchCount?: number; 
  embroideryCostPerThousand?: number;
  
  // Campos DTF
  dtfMetersUsed?: number; 
  dtfManualUnitCost?: number; // Custo de impressão manual unitário
  printUnitCost?: number;
}

export interface ProductInput {
  productCategory: string;
  customProductName: string;
  
  // Malha
  fabricPricePerKg: number;
  piecesPerKg: number;
  lossPercentage: number;
  fabricWidth: number; 

  // Ribana
  ribanaPricePerKg: number;
  ribanaYield: number;

  // Corte
  cuttingType: 'MANUAL_RISCO' | 'MANUAL_PLOTTER'; 
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

export interface ReverseEngineeringResult {
  targetProductionCost: number;
  taxesAmount: number;
  feesAmount: number;
  profitAmount: number;
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