import type { ProductInput, SettingsData, CalculationResult, ReverseEngineeringResult } from '../types';

export const calculateScenario = (input: ProductInput, settings: SettingsData): CalculationResult => {
    const warnings: string[] = [];
    const safeBatchSize = input.batchSize > 0 ? input.batchSize : 1;

    // 1. Matéria-Prima
    const fabricBase = input.piecesPerKg > 0 ? input.fabricPricePerKg / input.piecesPerKg : 0;
    const ribanaBase = input.ribanaYield > 0 ? input.ribanaPricePerKg / input.ribanaYield : 0;
    const materialUnit = (fabricBase + ribanaBase) * (1 + input.lossPercentage / 100);

    // 2. Risco e Corte
    let plotterUnit = 0;
    let cuttingLaborUnit = 0;

    if (input.cuttingType === 'MANUAL_PLOTTER' && input.fabricWidth > 1.83) {
        warnings.push("⚠️ Largura da Malha excede o limite do Plotter (1.83m).");
    }

    if (input.cuttingType === 'MANUAL_RISCO') {
        plotterUnit = 0;
        cuttingLaborUnit = settings.serviceCosts.cuttingManual;
    } else if (input.cuttingType === 'MANUAL_PLOTTER') {
        const paperCost = input.plotterMetersTotal * settings.serviceCosts.plotterPaper;
        plotterUnit = (paperCost + input.plotterFreight) / safeBatchSize;
        cuttingLaborUnit = settings.serviceCosts.cuttingManualPlotter;
    }

    // 3. Beneficiamento
    let processingUnit = 0;
    input.embellishments.forEach((item, index) => {
        let itemCost = 0;
        if (item.type === 'SILK') {
            const table = item.silkSize === 'LARGE' ? settings.silkPrices.large : settings.silkPrices.small;
            const colors = Math.max(1, Math.floor(item.printColors || 1));
            const extraColors = Math.max(0, colors - 1);

            const screenUnitCost = item.isRegraving ? table.screenRemake : table.screenNew;
            const totalSetup = screenUnitCost * colors;
            const setupPerUnit = totalSetup / safeBatchSize;

            const productionPerUnit = table.firstColor + (extraColors * table.extraColor);

            itemCost = setupPerUnit + productionPerUnit;

            if (input.batchSize < 50 && totalSetup > 0) {
                warnings.push(`⚠️ TÉCNICA #${index + 1} (SILK): Lote pequeno encarece a tela.`);
            }
        } else if (item.type === 'BORDADO') {
            const stitches = Math.floor(item.embroideryStitchCount || 0);
            itemCost = stitches * (item.embroideryCostPerThousand || 0);
        } else if (item.type === 'DTF') {
            const applicationCost = input.batchSize > settings.serviceCosts.dtfWholesaleLimit 
                ? settings.serviceCosts.dtfAppWholesale 
                : settings.serviceCosts.dtfAppRetail;

            if (item.dtfManualUnitCost !== undefined) {
                // Se o custo manual for > 0, usamos ele. Se for 0, é 0.
                itemCost = item.dtfManualUnitCost > 0 ? item.dtfManualUnitCost : 0; 
            } else {
                const meters = item.dtfMetersUsed || 0;
                if (meters > 0) {
                    const printUnit = (meters * settings.serviceCosts.dtfPrintMeter) / safeBatchSize;
                    itemCost = printUnit + applicationCost;
                } else {
                    itemCost = 0; 
                }
            }
        }
        processingUnit += itemCost;
    });

    // 4. Confecção
    const sewingUnit = input.sewingCost + input.finishingCost + input.aviamentosCost;
    
    // 5. Logística
    const logisticsFuelPerUnit = input.logisticsTotalCost / safeBatchSize;
    const logisticsInUnit = logisticsFuelPerUnit + input.packagingCost + input.freightOutCost;

    // 6. Pilotagem
    const pilotingUnit = input.pilotingCost / safeBatchSize;

    const industrialCostUnit = materialUnit + plotterUnit + cuttingLaborUnit + processingUnit + sewingUnit + logisticsInUnit + pilotingUnit;
    const fixedOverheadUnit = settings.estimatedMonthlyProduction > 0 ? settings.monthlyFixedCosts / settings.estimatedMonthlyProduction : 0;
    const totalProductionCost = industrialCostUnit + fixedOverheadUnit;

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

export const calculateReverseEngineering = (
  targetPrice: number, 
  desiredMargin: number, 
  settings: SettingsData
): ReverseEngineeringResult => {
    const taxRate = settings.taxRegime === 'MEI' ? 0 : settings.defaultTaxRate;
    const feesRate = settings.defaultCardRate + settings.defaultMarketingRate + settings.defaultCommissionRate;
    
    const taxesAmount = targetPrice * (taxRate / 100);
    const feesAmount = targetPrice * (feesRate / 100);
    const profitAmount = targetPrice * (desiredMargin / 100);
    
    const targetProductionCost = targetPrice - taxesAmount - feesAmount - profitAmount;
    
    return {
        targetProductionCost: Math.max(0, targetProductionCost),
        taxesAmount,
        feesAmount,
        profitAmount
    };
};

export const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};