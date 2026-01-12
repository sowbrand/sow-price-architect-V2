import type { ProductInput, SettingsData, CalculationResult } from '../types';

export const calculateScenario = (input: ProductInput, settings: SettingsData): CalculationResult => {
    const warnings: string[] = [];
    const safeBatchSize = input.batchSize > 0 ? input.batchSize : 1;

    // 1. Matéria-Prima
    const fabricBase = input.piecesPerKg > 0 ? input.fabricPricePerKg / input.piecesPerKg : 0;
    const materialUnit = fabricBase * (1 + input.lossPercentage / 100);

    // 2. Risco e Corte (Nova Lógica)
    let plotterUnit = 0;
    let cuttingLaborUnit = 0;

    if (input.cuttingType === 'MANUAL') {
        // Corte Manual: Sem custo de papel, Mão de obra R$ 0,70 (ou valor configurado)
        plotterUnit = 0;
        cuttingLaborUnit = settings.serviceCosts.cuttingManual;
    } else {
        // Corte Plotter: Papel (Metros * Custo/m + Frete) / Lote
        const paperCost = input.plotterMetersTotal * settings.serviceCosts.plotterPaper;
        plotterUnit = (paperCost + input.plotterFreight) / safeBatchSize;
        cuttingLaborUnit = settings.serviceCosts.cuttingPlotter;
    }

    // 3. Beneficiamento (Silk, DTF, Bordado)
    let processingUnit = 0;

    input.embellishments.forEach((item, index) => {
        let itemCost = 0;
        
        if (item.type === 'SILK') {
            // Se for CUSTOM, usa os valores digitados. Se for Tabela, usa o DB.
            const screens = item.printSetupCost || 0;
            const colors = item.printColors || 0;
            const pass = item.printPassCost || 0;
            
            const totalSetup = screens * colors; // Preço Tela * Qtd Cores
            const setupPerUnit = totalSetup / safeBatchSize;
            const productionPerUnit = pass; // O custo da passada já inclui todas as cores na lógica manual, ou soma-se aqui? 
            // NOTA: Na tabela 2026, o preço é calculado: Base + (Extra * (Cores-1)).
            // Assumimos que o input já traz o valor final da passada calculado pelo UI, ou calculamos aqui?
            // Para segurança, vamos assumir que o valor 'printPassCost' que vem do input JÁ É o total da passada.
            
            itemCost = setupPerUnit + productionPerUnit;

            if (input.batchSize < 50 && totalSetup > 0) {
                warnings.push(`⚠️ TÉCNICA #${index + 1} (SILK): Lote pequeno (${input.batchSize}) torna a tela cara.`);
            }

        } else if (item.type === 'BORDADO') {
            const milheiros = item.embroideryStitchCount || 0;
            const valorMilheiro = item.embroideryCostPerThousand || 0;
            itemCost = milheiros * valorMilheiro;

        } else if (item.type === 'DTF') {
            // DTF: (Metros * 60) / Lote + Aplicação (4,00)
            const meters = item.dtfMetersUsed || 0;
            const printCostTotal = meters * settings.serviceCosts.dtfPrintMeter;
            const printUnit = printCostTotal / safeBatchSize;
            const appUnit = settings.serviceCosts.dtfApplication;
            itemCost = printUnit + appUnit;
        }
        processingUnit += itemCost;
    });

    // 4. Confecção e Logística
    // sewingCost agora vem do input, que por padrão puxa do DB (4.75) mas pode ser editado
    const sewingUnit = input.sewingCost + input.finishingCost;
    
    const logisticsFuelPerUnit = input.logisticsTotalCost / safeBatchSize;
    const logisticsInUnit = logisticsFuelPerUnit + input.packagingCost + input.freightOutCost;

    // 5. Consolidação Custo Industrial
    const industrialCostUnit = materialUnit + plotterUnit + cuttingLaborUnit + processingUnit + sewingUnit + logisticsInUnit;

    // 6. Custos Fixos
    const fixedOverheadUnit = settings.estimatedMonthlyProduction > 0 ? settings.monthlyFixedCosts / settings.estimatedMonthlyProduction : 0;
    const totalProductionCost = industrialCostUnit + fixedOverheadUnit;

    // 7. Precificação (Markup)
    let appliedTaxRate = 0;
    if (settings.taxRegime === 'MEI') {
        appliedTaxRate = 0;
        if (!warnings.some(w => w.includes('MEI'))) {
            warnings.push("ℹ️ REGIME MEI: Imposto 0%. Verifique guia DAS nos Custos Fixos.");
        }
    } else {
        appliedTaxRate = settings.defaultTaxRate;
    }

    const totalVariableRate = appliedTaxRate + settings.defaultCardRate + settings.defaultMarketingRate + settings.defaultCommissionRate + input.targetMargin;
    const divisor = 1 - (totalVariableRate / 100);
    
    let suggestedSalePrice = 0;
    if (divisor <= 0) {
        suggestedSalePrice = 0;
        warnings.push("🔴 ERRO CRÍTICO: Margens e Despesas somam mais de 100%.");
    } else {
        suggestedSalePrice = totalProductionCost / divisor;
    }

    // 8. Resultados Finais
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