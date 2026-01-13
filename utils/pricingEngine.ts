import type { ProductInput, SettingsData, CalculationResult } from '../types';

// --- LÓGICA DE PRECIFICAÇÃO (CUSTO -> PREÇO) ---
export const calculateScenario = (input: ProductInput, settings: SettingsData): CalculationResult => {
    const warnings: string[] = [];
    const safeBatchSize = input.batchSize > 0 ? input.batchSize : 1;

    // 1. Matéria-Prima
    const fabricBase = input.piecesPerKg > 0 ? input.fabricPricePerKg / input.piecesPerKg : 0;
    const materialUnit = fabricBase * (1 + input.lossPercentage / 100);

    // 2. Risco e Corte
    let plotterUnit = 0;
    let cuttingLaborUnit = 0;

    if (input.cuttingType === 'MANUAL') {
        plotterUnit = 0;
        cuttingLaborUnit = settings.serviceCosts.cuttingManual;
    } else {
        const paperCost = input.plotterMetersTotal * settings.serviceCosts.plotterPaper;
        plotterUnit = (paperCost + input.plotterFreight) / safeBatchSize;
        cuttingLaborUnit = settings.serviceCosts.cuttingPlotter;
    }

    // 3. Beneficiamento
    let processingUnit = 0;
    input.embellishments.forEach((item, index) => {
        let itemCost = 0;
        if (item.type === 'SILK') {
            const screens = item.printSetupCost || 0;
            const colors = item.printColors || 0;
            const pass = item.printPassCost || 0;
            
            const totalSetup = screens * colors;
            const setupPerUnit = totalSetup / safeBatchSize;
            const productionPerUnit = pass;
            itemCost = setupPerUnit + productionPerUnit;

            if (input.batchSize < 50 && totalSetup > 0) {
                warnings.push(`⚠️ TÉCNICA #${index + 1} (SILK): Lote pequeno encarece a tela.`);
            }
        } else if (item.type === 'BORDADO') {
            itemCost = (item.embroideryStitchCount || 0) * (item.embroideryCostPerThousand || 0);
        } else if (item.type === 'DTF') {
            const meters = item.dtfMetersUsed || 0;
            const printUnit = (meters * settings.serviceCosts.dtfPrintMeter) / safeBatchSize;
            const appUnit = settings.serviceCosts.dtfApplication;
            itemCost = printUnit + appUnit;
        }
        processingUnit += itemCost;
    });

    // 4. Confecção e Logística
    const sewingUnit = input.sewingCost + input.finishingCost;
    const logisticsFuelPerUnit = input.logisticsTotalCost / safeBatchSize;
    const logisticsInUnit = logisticsFuelPerUnit + input.packagingCost + input.freightOutCost;

    // 5. Custos Industriais e Fixos
    const industrialCostUnit = materialUnit + plotterUnit + cuttingLaborUnit + processingUnit + sewingUnit + logisticsInUnit;
    const fixedOverheadUnit = settings.estimatedMonthlyProduction > 0 ? settings.monthlyFixedCosts / settings.estimatedMonthlyProduction : 0;
    const totalProductionCost = industrialCostUnit + fixedOverheadUnit;

    // 6. Formação de Preço (Markup)
    let appliedTaxRate = settings.taxRegime === 'MEI' ? 0 : settings.defaultTaxRate;
    if (settings.taxRegime === 'MEI' && !warnings.some(w => w.includes('MEI'))) {
        warnings.push("ℹ️ MEI: Imposto 0% considerado.");
    }

    const totalVariableRate = appliedTaxRate + settings.defaultCardRate + settings.defaultMarketingRate + settings.defaultCommissionRate + input.targetMargin;
    const divisor = 1 - (totalVariableRate / 100);
    
    let suggestedSalePrice = 0;
    if (divisor <= 0) {
        suggestedSalePrice = 0;
        warnings.push("🔴 ERRO: Margens e Despesas somam > 100%.");
    } else {
        suggestedSalePrice = totalProductionCost / divisor;
    }

    // 7. Detalhamento Final
    const taxesUnit = suggestedSalePrice * (appliedTaxRate / 100);
    const cardFeesUnit = suggestedSalePrice * (settings.defaultCardRate / 100);
    const marketingUnit = suggestedSalePrice * (settings.defaultMarketingRate / 100);
    const commissionUnit = suggestedSalePrice * (settings.defaultCommissionRate / 100);
    const commercialExpensesUnit = taxesUnit + cardFeesUnit + marketingUnit + commissionUnit;
    const netProfitUnit = suggestedSalePrice * (input.targetMargin / 100);
    const markup = totalProductionCost > 0 ? suggestedSalePrice / totalProductionCost : 0;

    return {
        materialUnit, plotterUnit, cuttingLaborUnit, processingUnit, sewingUnit, logisticsInUnit,
        industrialCostUnit, fixedOverheadUnit, totalProductionCost, suggestedSalePrice, taxesUnit,
        cardFeesUnit, marketingUnit, commissionUnit, commercialExpensesUnit, netProfitUnit, markup, warnings
    };
};

// --- NOVA FUNÇÃO: ENGENHARIA REVERSA (PREÇO -> CUSTO ALVO) ---
export const calculateReverse = (targetPrice: number, input: ProductInput, settings: SettingsData): CalculationResult => {
    const warnings: string[] = [];
    
    // 1. Definição das Taxas de Saída
    let appliedTaxRate = settings.taxRegime === 'MEI' ? 0 : settings.defaultTaxRate;
    
    // 2. Cálculo dos valores monetários baseados no Preço Alvo
    const taxesUnit = targetPrice * (appliedTaxRate / 100);
    const cardFeesUnit = targetPrice * (settings.defaultCardRate / 100);
    const marketingUnit = targetPrice * (settings.defaultMarketingRate / 100);
    const commissionUnit = targetPrice * (settings.defaultCommissionRate / 100);
    const netProfitUnit = targetPrice * (input.targetMargin / 100); // Lucro que eu QUERO ter

    const commercialExpensesUnit = taxesUnit + cardFeesUnit + marketingUnit + commissionUnit;

    // 3. O que sobra é o Teto de Custo (Target Cost)
    // Preço - Impostos - Despesas - Lucro = Custo Máximo
    const maxProductionCost = targetPrice - commercialExpensesUnit - netProfitUnit;

    if (maxProductionCost < 0) {
        warnings.push("🔴 Preço Alvo inviável: Custos de venda superam o preço.");
    }

    // Retorna estrutura compatível, zerando os custos detalhados pois não os temos
    return {
        materialUnit: 0, plotterUnit: 0, cuttingLaborUnit: 0, processingUnit: 0, 
        sewingUnit: 0, logisticsInUnit: 0, fixedOverheadUnit: 0,
        industrialCostUnit: 0,
        totalProductionCost: maxProductionCost, // Aqui vai o TARGET COST
        suggestedSalePrice: targetPrice,
        taxesUnit, cardFeesUnit, marketingUnit, commissionUnit, commercialExpensesUnit, netProfitUnit,
        markup: maxProductionCost > 0 ? targetPrice / maxProductionCost : 0,
        warnings
    };
};

export const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};