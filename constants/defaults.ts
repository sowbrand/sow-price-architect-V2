import { SettingsData } from '../types';

export const DEFAULT_SILK_PRICES = {
  small: { 
    firstColor: 4.50,   
    extraColor: 1.50,   
    screenNew: 35.00,   
    screenRemake: 25.00 
  },
  large: { 
    firstColor: 6.50,   
    extraColor: 2.50,   
    screenNew: 55.00,   
    screenRemake: 40.00 
  }
};

export const DEFAULT_SERVICE_COSTS = {
  cuttingManual: 0.70,        
  cuttingManualPlotter: 0.55, 
  plotterPaper: 5.70,      
  sewingStandard: 4.75,    
  dtfPrintMeter: 60.00,
  
  // NOVOS VALORES PADRÃO (ETAPA 4)
  dtfAppRetail: 2.00,      // Preço até 100 peças
  dtfAppWholesale: 1.50,   // Preço a partir de 101 peças
  dtfWholesaleLimit: 100   // Limite
};

export const INITIAL_SETTINGS: SettingsData = {
  monthlyFixedCosts: 2000,
  estimatedMonthlyProduction: 1000,
  taxRegime: 'MEI',
  defaultTaxRate: 4,
  meiDasTax: 75.00,
  defaultCardRate: 3.5,
  defaultMarketingRate: 5,
  defaultCommissionRate: 0,
  silkPrices: DEFAULT_SILK_PRICES,
  serviceCosts: DEFAULT_SERVICE_COSTS
};

export const INITIAL_PRODUCT: any = { 
  productCategory: 'Camiseta Casual',
  customProductName: '',
  
  // Malha
  fabricPricePerKg: 60.00, 
  piecesPerKg: 3.5,        
  lossPercentage: 10,
  fabricWidth: 1.80,
  
  // Ribana
  ribanaPricePerKg: 0.00, 
  ribanaYield: 0.00,

  // Corte
  cuttingType: 'MANUAL_PLOTTER',
  plotterMetersTotal: 0,
  plotterFreight: 0,
  cuttingLaborCost: 0, 

  // Beneficiamento
  embellishments: [],
  
  // Costura 
  sewingCost: DEFAULT_SERVICE_COSTS.sewingStandard, 
  finishingCost: 0.00, 
  packagingCost: 0.00,
  
  // Aviamentos
  aviamentosCost: 0.00, 
  
  // Pilotagem
  pilotingCost: 0.00,

  // Logística
  logisticsTotalCost: 0.00,
  freightOutCost: 0.00, 
  
  batchSize: 50, 
  targetMargin: 30 
};