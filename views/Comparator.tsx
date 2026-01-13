import React, { useState, useEffect } from 'react';
import { Scale, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import { calculateScenario, formatCurrency } from '../utils/pricingEngine';
import { INITIAL_PRODUCT } from '../constants/defaults';
import type { SettingsData, ProductInput, CalculationResult } from '../types';

interface ComparatorProps {
  settings: SettingsData;
}

export const Comparator: React.FC<ComparatorProps> = ({ settings }) => {
    const [scenarioA, setScenarioA] = useState<ProductInput>(INITIAL_PRODUCT);
    const [scenarioB, setScenarioB] = useState<ProductInput>({
        ...INITIAL_PRODUCT,
        productCategory: 'Camiseta Casual',
        batchSize: 50,
        embellishments: [{ id: 'b1', type: 'DTF', dtfMetersUsed: 0.5, dtfPrintCost: 30, dtfPretreatmentCost: 2 }]
    });

    const [resultA, setResultA] = useState<CalculationResult | null>(null);
    const [resultB, setResultB] = useState<CalculationResult | null>(null);

    useEffect(() => {
        setResultA(calculateScenario(scenarioA, settings));
        setResultB(calculateScenario(scenarioB, settings));
    }, [scenarioA, scenarioB, settings]);

    const handleChange = (
        e: { target: { name: string; value: string; type: string } } | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        setFunc: React.Dispatch<React.SetStateAction<ProductInput>>
    ) => {
        const { name, value, type } = e.target;
        setFunc(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const blockDecimals = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
    };

    const updateFirstEmbellishment = (
        field: string,
        value: string | number,
        currentInput: ProductInput,
        setFunc: React.Dispatch<React.SetStateAction<ProductInput>>
    ) => {
        const newEmbellishments = [...currentInput.embellishments];
        if (newEmbellishments.length === 0) {
            newEmbellishments.push({ id: Math.random().toString(), type: 'SILK' });
        }
        newEmbellishments[0] = { ...newEmbellishments[0], [field]: value };
        setFunc(prev => ({ ...prev, embellishments: newEmbellishments }));
    };

    const winner = resultA && resultB && resultA.netProfitUnit > resultB.netProfitUnit ? 'A' : 'B';
    const profitDiff = resultA && resultB ? Math.abs(resultA.netProfitUnit - resultB.netProfitUnit) : 0;

    // Lógica para Gráfico CSS Simples
    const maxVal = Math.max(
        resultA?.totalProductionCost || 0, 
        resultB?.totalProductionCost || 0,
        resultA?.suggestedSalePrice || 0,
        resultB?.suggestedSalePrice || 0
    ) || 1;

    const getBarHeight = (val: number) => `${(val / maxVal) * 100}%`;

    return (
        <div className="h-full flex flex-col font-montserrat overflow-hidden">
            <div className="mb-6 shrink-0">
                <div className="flex items-center gap-3 text-sow-black mb-1">
                    <div className="p-2 bg-sow-green/10 rounded-lg"><Scale className="w-6 h-6 text-sow-green" /></div>
                    <h2 className="text-2xl font-helvetica font-bold tracking-tight">Comparador de Estratégias</h2>
                </div>
                <p className="text-sow-grey text-sm font-medium">Simule dois cenários paralelamente e descubra qual protege melhor sua margem.</p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* COLUNA A */}
                <div className="lg:col-span-4 h-full min-h-0">
                    <div className={`flex flex-col h-full bg-white rounded-xl border border-sow-border shadow-soft overflow-hidden min-h-[500px]`}>
                        <div className={`p-4 border-b border-sow-border bg-gray-100 flex items-center justify-between`}>
                            <h3 className="font-helvetica font-bold text-sow-black uppercase tracking-wider">Cenário A</h3>
                            <div className="text-xs font-montserrat font-bold px-3 py-1 bg-white rounded-lg border border-sow-border shadow-sm text-sow-black">
                                Lote: {scenarioA.batchSize} pçs
                            </div>
                        </div>
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                            <InputGroup label="Qtd. Lote" name="batchSize" value={scenarioA.batchSize} onChange={(e) => handleChange(e, setScenarioA)} type="number" step="1" min="1" onKeyDown={blockDecimals} />
                            <InputGroup label="Preço Malha" name="fabricPricePerKg" value={scenarioA.fabricPricePerKg} onChange={(e) => handleChange(e, setScenarioA)} type="number" prefix="R$" />
                            <div className="mt-6 pt-6 border-t border-sow-border space-y-3">
                                <div className="flex justify-between items-center"><span className="text-xs text-sow-grey uppercase font-bold font-montserrat">Custo Total</span><span className="font-mono font-bold text-sow-black">{resultA ? formatCurrency(resultA.totalProductionCost) : '-'}</span></div>
                                <div className="flex justify-between items-center bg-sow-green/10 p-3 rounded-lg"><span className="text-xs text-sow-green uppercase font-bold font-montserrat">Lucro Líquido</span><span className="font-mono font-bold text-sow-green text-lg">{resultA ? formatCurrency(resultA.netProfitUnit) : '-'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUNA CENTRAL (Gráfico CSS + Veredito) */}
                <div className="lg:col-span-4 h-full flex flex-col gap-6 min-h-0 overflow-y-auto pr-1">
                    {/* Gráfico Visual CSS (Infalível) */}
                    <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft flex flex-col min-h-[300px]">
                        <h4 className="text-xs font-bold text-sow-grey uppercase mb-6 font-helvetica tracking-wide text-center">Comparativo Visual (Por Peça)</h4>
                        
                        <div className="flex-1 flex items-end justify-center gap-8 pb-4 border-b border-sow-border">
                            {/* Grupo Custo */}
                            <div className="flex gap-2 items-end h-40 w-1/3 justify-center group relative">
                                <div style={{ height: getBarHeight(resultA?.totalProductionCost || 0) }} className="w-4 bg-gray-400 rounded-t transition-all hover:bg-gray-500 relative"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap bg-black text-white px-1 rounded">{formatCurrency(resultA?.totalProductionCost || 0)}</span></div>
                                <div style={{ height: getBarHeight(resultB?.totalProductionCost || 0) }} className="w-4 bg-sow-green rounded-t transition-all hover:bg-green-600 relative"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap bg-black text-white px-1 rounded">{formatCurrency(resultB?.totalProductionCost || 0)}</span></div>
                                <span className="absolute -bottom-6 text-[9px] font-bold uppercase text-sow-grey">Custo</span>
                            </div>
                            
                            {/* Grupo Preço */}
                            <div className="flex gap-2 items-end h-40 w-1/3 justify-center group relative">
                                <div style={{ height: getBarHeight(resultA?.suggestedSalePrice || 0) }} className="w-4 bg-gray-400 rounded-t transition-all hover:bg-gray-500 relative"></div>
                                <div style={{ height: getBarHeight(resultB?.suggestedSalePrice || 0) }} className="w-4 bg-sow-green rounded-t transition-all hover:bg-green-600 relative"></div>
                                <span className="absolute -bottom-6 text-[9px] font-bold uppercase text-sow-grey">Preço Venda</span>
                            </div>

                            {/* Grupo Lucro */}
                            <div className="flex gap-2 items-end h-40 w-1/3 justify-center group relative">
                                <div style={{ height: getBarHeight(resultA?.netProfitUnit || 0) }} className="w-4 bg-gray-400 rounded-t transition-all hover:bg-gray-500 relative"></div>
                                <div style={{ height: getBarHeight(resultB?.netProfitUnit || 0) }} className="w-4 bg-sow-green rounded-t transition-all hover:bg-green-600 relative"></div>
                                <span className="absolute -bottom-6 text-[9px] font-bold uppercase text-sow-grey">Lucro Liq.</span>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center gap-6">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded"></div><span className="text-[10px] uppercase font-bold text-sow-grey">Cenário A</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-sow-green rounded"></div><span className="text-[10px] uppercase font-bold text-sow-grey">Cenário B</span></div>
                        </div>
                    </div>

                    {/* Veredito Financeiro Corrigido */}
                    <div className="bg-white border-2 border-sow-green p-6 rounded-xl shadow-lg relative overflow-hidden shrink-0 mt-auto">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp className="w-32 h-32 text-sow-green" /></div>
                        <h3 className="text-sow-green font-helvetica font-bold uppercase tracking-widest text-xs mb-2">Veredito Financeiro</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl lg:text-4xl font-helvetica font-bold text-sow-black">Vence: <span className="text-sow-green">Cenário {winner}</span></span>
                            <CheckCircle2 className="text-sow-green w-8 h-8" />
                        </div>
                        <p className="text-sm text-sow-grey font-medium leading-relaxed">
                            Vantagem de <strong className="text-sow-black bg-sow-green/20 px-1 rounded">{formatCurrency(profitDiff)}</strong> de lucro a mais por peça. 
                        </p>
                    </div>
                </div>

                {/* COLUNA B */}
                <div className="lg:col-span-4 h-full min-h-0">
                    <div className={`flex flex-col h-full bg-white rounded-xl border border-sow-border shadow-soft overflow-hidden min-h-[500px]`}>
                        <div className={`p-4 border-b border-sow-border bg-sow-green/10 flex items-center justify-between`}>
                            <h3 className="font-helvetica font-bold text-sow-black uppercase tracking-wider">Cenário B</h3>
                            <div className="text-xs font-montserrat font-bold px-3 py-1 bg-white rounded-lg border border-sow-border shadow-sm text-sow-black">
                                Lote: {scenarioB.batchSize} pçs
                            </div>
                        </div>
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                            <InputGroup label="Qtd. Lote" name="batchSize" value={scenarioB.batchSize} onChange={(e) => handleChange(e, setScenarioB)} type="number" step="1" min="1" onKeyDown={blockDecimals} />
                            <InputGroup label="Preço Malha" name="fabricPricePerKg" value={scenarioB.fabricPricePerKg} onChange={(e) => handleChange(e, setScenarioB)} type="number" prefix="R$" />
                            <div className="mt-6 pt-6 border-t border-sow-border space-y-3">
                                <div className="flex justify-between items-center"><span className="text-xs text-sow-grey uppercase font-bold font-montserrat">Custo Total</span><span className="font-mono font-bold text-sow-black">{resultB ? formatCurrency(resultB.totalProductionCost) : '-'}</span></div>
                                <div className="flex justify-between items-center bg-sow-green/10 p-3 rounded-lg"><span className="text-xs text-sow-green uppercase font-bold font-montserrat">Lucro Líquido</span><span className="font-mono font-bold text-sow-green text-lg">{resultB ? formatCurrency(resultB.netProfitUnit) : '-'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};