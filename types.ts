
export enum CalculationMode {
  DASHBOARD = 'DASHBOARD',
  CALCULATOR = 'CALCULATOR',
  COMPARATOR = 'COMPARATOR',
  REVERSE = 'REVERSE',
  SETTINGS = 'SETTINGS',
}

export interface Embellishment {
  id: string;
  type: 'SILK' | 'BORDADO' | 'DTG';
  printSetupCost?: number;
  printColors?: number;
  printPassCost?: number;
  embroideryStitchCount?: number;
  embroideryCostPerThousand?: number;
  dtgPrintCost?: number;
  dtgPretreatmentCost?: number;
}

export interface ProductInput {
  productCategory: string;
  customProductName: string;
  fabricPricePerKg: number;
  piecesPerKg: number;
  lossPercentage: number;
  plotterTotalCost: number;
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

export interface SettingsData {
  monthlyFixedCosts: number;
  estimatedMonthlyProduction: number;
  taxRegime: 'SIMPLES' | 'MEI';
  defaultTaxRate: number;
  defaultCardRate: number;
  defaultMarketingRate: number;
  defaultCommissionRate: number;
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


export const INITIAL_SETTINGS: SettingsData = {
  monthlyFixedCosts: 15000,
  estimatedMonthlyProduction: 1000,
  taxRegime: 'SIMPLES',
  defaultTaxRate: 10,
  defaultCardRate: 4,
  defaultMarketingRate: 5,
  defaultCommissionRate: 0,
};

export const INITIAL_PRODUCT: ProductInput = {
  productCategory: 'Camiseta Casual',
  customProductName: '',
  fabricPricePerKg: 65.00,
  piecesPerKg: 3.2,
  lossPercentage: 8,
  plotterTotalCost: 45.00,
  cuttingLaborCost: 1.50,
  embellishments: [],
  sewingCost: 7.00,
  finishingCost: 1.00,
  packagingCost: 1.20,
  logisticsTotalCost: 50.00,
  freightOutCost: 0,
  batchSize: 100,
  targetMargin: 25,
};
