import { SettingsData } from '../types';

// Valores extraídos da Tabela de Preços Atualizada (Silk Screen)
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

// Custos de Serviços Terceirizados (Base para Reset)
export const DEFAULT_SERVICE_COSTS = {
  cuttingManual: 1.50,     
  cuttingPlotter: 0.80,    
  plotterPaper: 5.70,      // Atualizado R$ 5,70
  sewingStandard: 4.75,    // Atualizado R$ 4,75
  dtfPrintMeter: 60.00,    
  dtfApplication: 4.00     
};

// Configurações Iniciais Completas
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

// Produto Inicial Padrão (Reset) - ATUALIZADO ETAPA 1
export const INITIAL_PRODUCT: any = { 
  productCategory: 'Camiseta Casual',
  customProductName: '',
  
  // Matéria Prima
  fabricPricePerKg: 60.00, // Atualizado R$ 60,00
  piecesPerKg: 3.5,        // Atualizado 3.5
  lossPercentage: 10,      // Atualizado 10%
  
  // Corte
  cuttingType: 'PLOTTER',
  plotterMetersTotal: 0,
  plotterFreight: 0,
  cuttingLaborCost: 0, 

  // Beneficiamento
  embellishments: [],
  
  // Costura 
  sewingCost: DEFAULT_SERVICE_COSTS.sewingStandard, // Vai puxar 4.75
  finishingCost: 0.00, // Zerado conforme solicitado
  packagingCost: 0.00, // Zerado conforme solicitado
  
  // Logística
  logisticsTotalCost: 0.00,
  freightOutCost: 0,
  
  batchSize: 50, // Lote padrão seguro
  targetMargin: 30 // Margem padrão 30%
};