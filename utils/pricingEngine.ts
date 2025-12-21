
import type { ProductInput, SettingsData, CalculationResult } from '../types';

export const calculateScenario = (input: ProductInput, settings: SettingsData): CalculationResult => {
    const warnings: string[] = [];
    const safeBatchSize = input.batchSize > 0 ? input.batchSize : 1;
    const fabricBase = input.piecesPerKg > 0 ? input.fabricPricePerKg / input.piecesPerKg : 0;
    const materialUnit = fabricBase * (1 + input.lossPercentage / 100);
    const plotterUnit = input.plotterTotalCost / safeBatchSize;
    const cuttingLaborUnit = input.cuttingLaborCost;
    let processingUnit = 0;

    input.embellishments.forEach((item, index) => {
        let itemCost = 0;
        if (item.type === 'SILK') {
            const screens = item.printSetupCost || 0;
            const colors = item.printColors || 0;
            const pass = item.printPassCost || 0;
            const totalSetup = screens * colors;
            const setupPerUnit = totalSetup / safeBatchSize;
            const productionPerUnit = pass * colors;
            itemCost = setupPerUnit + productionPerUnit;
            if (input.batchSize < 50 && totalSetup > 0) {
                warnings.push(`⚠️ TÉCNICA #${index + 1} (SILK): Lote pequeno impactando custo de tela.`);
            }
        } else if (item.type === 'BORDADO') {
            const milheiros = item.embroideryStitchCount || 0;
            const valorMilheiro = item.embroideryCostPerThousand || 0;
            itemCost = milheiros * valorMilheiro;
        } else if (item.type === 'DTG') {
            itemCost = (item.dtgPrintCost || 0) + (item.dtgPretreatmentCost || 0);
        }
        processingUnit += itemCost;
    });

    const sewingUnit = input.sewingCost + input.finishingCost;
    const logisticsFuelPerUnit = input.logisticsTotalCost / safeBatchSize;
    const logisticsInUnit = logisticsFuelPerUnit + input.packagingCost + input.freightOutCost;
    const industrialCostUnit = materialUnit + plotterUnit + cuttingLaborUnit + processingUnit + sewingUnit + logisticsInUnit;
    const fixedOverheadUnit = settings.estimatedMonthlyProduction > 0 ? settings.monthlyFixedCosts / settings.estimatedMonthlyProduction : 0;
    const totalProductionCost = industrialCostUnit + fixedOverheadUnit;
    let appliedTaxRate = 0;

    if (settings.taxRegime === 'MEI') {
        appliedTaxRate = 0;
        if (!warnings.some(w => w.includes('MEI'))) {
            warnings.push("ℹ️ REGIME MEI: Imposto sobre venda é 0%. Certifique-se de que a guia DAS está inclusa nos Custos Fixos.");
        }
    } else {
        appliedTaxRate = settings.defaultTaxRate;
    }

    const totalVariableRate = appliedTaxRate + settings.defaultCardRate + settings.defaultMarketingRate + settings.defaultCommissionRate + input.targetMargin;
    const divisor = 1 - (totalVariableRate / 100);
    let suggestedSalePrice = 0;

    if (divisor <= 0) {
        suggestedSalePrice = 0;
        warnings.push("🔴 ERRO: Margem + Despesas excedem 100%.");
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

export const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};
