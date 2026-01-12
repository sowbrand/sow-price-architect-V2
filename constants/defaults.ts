import { SettingsData } from '../types';

// Valores extraídos da Tabela de Preços 2026 (Silk Screen)
export const DEFAULT_SILK_PRICES = {
  small: { 
    firstColor: 1.35,   // 1ª Cor (Estampa Pequena)
    extraColor: 0.35,   // Cor Adicional
    screenNew: 55.00,   // Tela Nova
    screenRemake: 35.00 // Regravação
  },
  large: { 
    firstColor: 2.00,   // 1ª Cor (Estampa Grande)
    extraColor: 0.50,   // Cor Adicional
    screenNew: 90.00,   // Tela Nova
    screenRemake: 45.00 // Regravação
  }
};

// Custos de Serviços Terceirizados (Costura, Corte, DTF)
export const DEFAULT_SERVICE_COSTS = {
  cuttingManual: 0.70,     // R$ 0,70 por peça (Corte Manual)
  cuttingPlotter: 0.55,    // R$ 0,55 por peça (Corte Plotter)
  plotterPaper: 5.50,      // R$ 5,50 por metro linear (Papel)
  sewingStandard: 4.75,    // R$ 4,75 (Costura Ombro a Ombro)
  dtfPrintMeter: 60.00,    // R$ 60,00 (Metro impressão DTF)
  dtfApplication: 4.00     // R$ 4,00 (Aplicação DTF)
};

// Configurações Iniciais Completas
export const INITIAL_SETTINGS: SettingsData = {
  monthlyFixedCosts: 15000,
  estimatedMonthlyProduction: 1000,
  taxRegime: 'SIMPLES',
  defaultTaxRate: 10,
  defaultCardRate: 4,
  defaultMarketingRate: 5,
  defaultCommissionRate: 0,
  // Aqui injetamos os preços padrão
  silkPrices: DEFAULT_SILK_PRICES,
  serviceCosts: DEFAULT_SERVICE_COSTS
};

// Produto Inicial Padrão (Reset)
export const INITIAL_PRODUCT: any = { 
  productCategory: 'Camiseta Casual',
  customProductName: '',
  
  // Matéria Prima
  fabricPricePerKg: 65.00,
  piecesPerKg: 3.2,
  lossPercentage: 8,
  
  // Corte (Padrão Plotter)
  cuttingType: 'PLOTTER',
  plotterMetersTotal: 0,
  plotterFreight: 0,
  cuttingLaborCost: 0, 

  // Beneficiamento
  embellishments: [],
  
  // Costura (Puxa valor padrão do banco)
  sewingCost: DEFAULT_SERVICE_COSTS.sewingStandard, 
  finishingCost: 1.00,
  packagingCost: 1.20,
  
  // Logística
  logisticsTotalCost: 50.00,
  freightOutCost: 0,
  
  batchSize: 100,
  targetMargin: 25,
};