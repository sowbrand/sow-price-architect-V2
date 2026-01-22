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
  // Regime Tributário
  taxRegime: 'SIMPLES' | 'MEI';
  defaultTaxRate: number; // Porcentagem (%) para Simples Nacional
  meiDasTax: number;      // Valor Fixo (R$) para MEI
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
  printUnitCost?: number;
}

export interface ProductInput {
  productCategory: string;
  customProductName: string;
  
  // Malha
  fabricPricePerKg: number;
  piecesPerKg: number;
  lossPercentage: number;

  // NOVOS CAMPOS: Ribana
  ribanaPricePerKg: number;
  ribanaYield: number; // Rendimento (pçs/kg)

  // Corte
  cuttingType: 'MANUAL' | 'PLOTTER';
  plotterMetersTotal: number; 
  plotterFreight: number;     
  cuttingLaborCost: number; 
  
  embellishments: Embellishment[];
  
  // Confecção
  sewingCost: number; 
  finishingCost: number;
  packagingCost: number;
  
  // NOVOS CAMPOS: Aviamentos
  aviamentosCost: number; // Por peça (etiqueta, viés, etc)

  // Logística
  logisticsTotalCost: number; // Entrada
  freightOutCost: number;     // Saída (Cliente - NOVO CAMPO)
  
  // NOVO CAMPO: Pilotagem
  pilotingCost: number; // Custo fixo do desenvolvimento

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