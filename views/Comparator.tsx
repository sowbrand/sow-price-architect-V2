import React, { useState, useEffect } from 'react';
import { Scale, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
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

    // --- Lógica Avançada do Gráfico ---
    // 1. Encontrar o valor máximo global para escalar as barras (evita estouro)
    const maxVal = Math.max(
        resultA?.totalProductionCost || 0, 
        resultB?.totalProductionCost || 0,
        resultA?.suggestedSalePrice || 0,
        resultB?.suggestedSalePrice || 0
    ) * 1.2; // +20% de margem no topo para o tooltip não cortar

    const getBarHeight = (val: number) => `${Math.max((val / maxVal) * 100, 2)}%`; // Mínimo de 2% para barra não sumir

    // Componente de Barra Individual (Para limpar o código)
    const ComparisonBar = ({ label, valueA, valueB, colorB = "bg-sow-green" }: { label: string, valueA: number, valueB: number, colorB?: string }) => (
        <div className="flex flex-col justify-end items-center h-full w-1/3 group cursor-pointer relative">
            
            {/* Tooltip Flutuante (Aparece no Hover do Grupo Inteiro) */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-sow-black text-white text-[10px] font-helvetica font-bold py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 flex flex-col gap-1 min-w-[80px] text-center border border-sow-grey/50 translate-y-2 group-hover:translate-y-0">
                <div className="flex justify-between w-full gap-2">
                    <span className="text-gray-400">A:</span>
                    <span>{formatCurrency(valueA)}</span>
                </div>
                <div className="border-t border-gray-700 pt-1 flex justify-between w-full gap-2 text-sow-green">
                    <span>B:</span>
                    <span>{formatCurrency(valueB)}</span>
                </div>
            </div>

            {/* Área das Barras */}
            <div className="flex gap-3 items-end w-full justify-center h-full px-2 pb-8 border-b border-sow-border relative hover:bg-gray-50/50 rounded-t-xl transition-colors">
                {/* Barra A */}
                <div style={{ height: getBarHeight(valueA) }} className="w-6 bg-sow-grey/40 rounded-t-md relative transition-all duration-500 ease-out group-hover:bg-sow-grey"></div>
                
                {/* Barra B (Com Gradiente Sutil para destaque Moderno) */}
                <div style={{ height: getBarHeight(valueB) }} className={`w-6 ${colorB} rounded-t-md relative transition-all duration-500 ease-out shadow-[0_0_15px_-5px_rgba(114,191,3,0.4)] bg-gradient-to-t from-sow-green to-[#86d615]`}></div>
            </div>

            {/* Rótulo do Eixo X */}
            <span className="absolute bottom-2 text-[10px] font-bold uppercase text-sow-grey group-hover:text-sow-black transition-colors tracking-wide font-montserrat">{label}</span>
        </div>
    );

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

                {/* COLUNA CENTRAL (Gráfico Premium) */}
                <div className="lg:col-span-4 h-full flex flex-col gap-6 min-h-0 overflow-y-auto pr-1">
                    
                    {/* CARD DO GRÁFICO */}
                    <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft flex flex-col min-h-[320px]">
                        <h4 className="text-xs font-bold text-sow-grey uppercase mb-2 font-helvetica tracking-wide text-center">Comparativo Visual (Por Peça)</h4>
                        <div className="text-[10px] text-sow-grey/50 text-center mb-6 font-montserrat">Passe o mouse sobre as barras para ver valores</div>
                        
                        <div className="flex-1 flex items-end justify-between w-full px-2">
                            <ComparisonBar 
                                label="Custo Prod." 
                                valueA={resultA?.totalProductionCost || 0} 
                                valueB={resultB?.totalProductionCost || 0} 
                            />
                            <ComparisonBar 
                                label="Preço Venda" 
                                valueA={resultA?.suggestedSalePrice || 0} 
                                valueB={resultB?.suggestedSalePrice || 0} 
                            />
                            <ComparisonBar 
                                label="Lucro Líquido" 
                                valueA={resultA?.netProfitUnit || 0} 
                                valueB={resultB?.netProfitUnit || 0} 
                            />
                        </div>

                        {/* Legenda */}
                        <div className="mt-6 flex justify-center gap-6 border-t border-sow-border pt-4">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-sow-grey/40 rounded-full"></div><span className="text-[10px] uppercase font-bold text-sow-grey">Cenário A</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-sow-green rounded-full shadow-[0_0_8px_rgba(114,191,3,0.6)]"></div><span className="text-[10px] uppercase font-bold text-sow-green">Cenário B</span></div>
                        </div>
                    </div>

                    {/* Veredito Financeiro */}
                    <div className="bg-white border-2 border-sow-green p-6 rounded-xl shadow-lg relative overflow-hidden shrink-0 mt-auto group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="w-32 h-32 text-sow-green" /></div>
                        
                        <h3 className="text-sow-green font-helvetica font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                            Veredito Financeiro <ArrowRight className="w-3 h-3" />
                        </h3>
                        
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <span className="text-3xl lg:text-4xl font-helvetica font-bold text-sow-black">
                                Vence: <span className="text-sow-green underline decoration-2 underline-offset-4 decoration-sow-green/30">Cenário {winner}</span>
                            </span>
                            <CheckCircle2 className="text-sow-green w-8 h-8 drop-shadow-sm" />
                        </div>
                        
                        <p className="text-sm text-sow-grey font-medium leading-relaxed relative z-10 font-montserrat">
                            Ao optar pelo Cenário {winner}, você garante uma vantagem de <strong className="text-sow-black bg-sow-green/20 px-1.5 py-0.5 rounded border border-sow-green/30">{formatCurrency(profitDiff)}</strong> de lucro a mais por cada peça vendida.
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
                            
                            {/* Controle de Corte e Estampas para B (Simplificado para o comparador focar no básico, ou expandir se necessário) */}
                            {/* Aqui mantemos o básico do comparador para não poluir a UI */}
                            
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