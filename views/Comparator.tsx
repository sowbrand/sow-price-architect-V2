import React, { useState, useEffect } from 'react';
import { Scale, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

    const chartData = [
        { name: 'Custo Prod.', A: resultA?.totalProductionCost || 0, B: resultB?.totalProductionCost || 0 },
        { name: 'Preço Venda', A: resultA?.suggestedSalePrice || 0, B: resultB?.suggestedSalePrice || 0 },
        { name: 'Lucro Liq.', A: resultA?.netProfitUnit || 0, B: resultB?.netProfitUnit || 0 },
    ];

    const renderScenarioColumn = (
        title: string,
        colorClass: string,
        input: ProductInput,
        setInput: React.Dispatch<React.SetStateAction<ProductInput>>,
        result: CalculationResult | null
    ) => (
        <div className={`flex flex-col h-full bg-white rounded-xl border border-sow-border shadow-soft overflow-hidden min-h-[500px]`}>
            <div className={`p-4 border-b border-sow-border ${colorClass} bg-opacity-10 flex items-center justify-between`}>
                <h3 className="font-helvetica font-bold text-sow-black uppercase tracking-wider">{title}</h3>
                <div className="text-xs font-montserrat font-bold px-3 py-1 bg-white rounded-lg border border-sow-border shadow-sm text-sow-black">
                    Lote: {input.batchSize} pçs
                </div>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-4">
                    <p className="text-xs font-montserrat font-bold text-sow-grey uppercase border-b border-sow-border pb-2">Variáveis Chave</p>
                    <InputGroup label="Qtd. Lote" name="batchSize" value={input.batchSize} onChange={(e) => handleChange(e, setInput)} type="number" step="1" min="1" onKeyDown={blockDecimals} />
                    <InputGroup label="Preço Malha" name="fabricPricePerKg" value={input.fabricPricePerKg} onChange={(e) => handleChange(e, setInput)} type="number" prefix="R$" />
                    
                    {input.cuttingType === 'PLOTTER' && (
                         <InputGroup label="Total Metros Risco" name="plotterMetersTotal" value={input.plotterMetersTotal} onChange={(e) => handleChange(e, setInput)} type="number" step="1" min="1" onKeyDown={blockDecimals} suffix="m" />
                    )}

                    <div className="bg-sow-light p-4 rounded-xl border border-sow-border">
                        <label className="text-[11px] font-bold uppercase tracking-wide text-sow-grey mb-2 block">Técnica Principal</label>
                        <select 
                            value={input.embellishments[0]?.type || 'SILK'} 
                            onChange={(e) => updateFirstEmbellishment('type', e.target.value, input, setInput)}
                            className="w-full mb-3 bg-white border border-sow-border text-sm font-montserrat font-medium rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-sow-green"
                        >
                            <option value="SILK">Silk Screen</option>
                            <option value="DTF">DTF / Digital</option>
                            <option value="BORDADO">Bordado</option>
                        </select>
                        
                        {(!input.embellishments[0] || input.embellishments[0].type === 'SILK') && (
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Custo Tela" name="setup" value={input.embellishments[0]?.printSetupCost || 0} onChange={(e) => updateFirstEmbellishment('printSetupCost', parseFloat(e.target.value), input, setInput)} type="number" prefix="R$" />
                                <InputGroup label="Nº Cores" name="colors" value={input.embellishments[0]?.printColors || 1} onChange={(e) => updateFirstEmbellishment('printColors', parseFloat(e.target.value), input, setInput)} type="number" step="1" onKeyDown={blockDecimals} />
                            </div>
                        )}
                        {input.embellishments[0]?.type === 'DTF' && (
                             <InputGroup label="Metros Usados" name="dtfCost" value={input.embellishments[0]?.dtfMetersUsed || 0} onChange={(e) => updateFirstEmbellishment('dtfMetersUsed', parseFloat(e.target.value), input, setInput)} type="number" />
                        )}
                         {input.embellishments[0]?.type === 'BORDADO' && (
                             <InputGroup label="Milheiros Pontos" name="stitch" value={input.embellishments[0]?.embroideryStitchCount || 0} onChange={(e) => updateFirstEmbellishment('embroideryStitchCount', parseFloat(e.target.value), input, setInput)} type="number" />
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-sow-border space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-sow-grey uppercase font-bold font-montserrat">Custo Total</span>
                        <span className="font-mono font-bold text-sow-black">{result ? formatCurrency(result.totalProductionCost) : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-sow-green/10 p-3 rounded-lg">
                        <span className="text-xs text-sow-green uppercase font-bold font-montserrat">Lucro Líquido</span>
                        <span className="font-mono font-bold text-sow-green text-lg">{result ? formatCurrency(result.netProfitUnit) : '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const winner = resultA && resultB && resultA.netProfitUnit > resultB.netProfitUnit ? 'A' : 'B';
    const profitDiff = resultA && resultB ? Math.abs(resultA.netProfitUnit - resultB.netProfitUnit) : 0;

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
                <div className="lg:col-span-4 h-full min-h-0">
                    {renderScenarioColumn('Cenário A', 'bg-gray-200', scenarioA, setScenarioA, resultA)}
                </div>

                <div className="lg:col-span-4 h-full flex flex-col gap-6 min-h-0 overflow-y-auto pr-1">
                    {/* CONTAINER DO GRÁFICO (Altura fixa para funcionar) */}
                    <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft flex flex-col min-h-[350px]">
                        <h4 className="text-xs font-bold text-sow-grey uppercase mb-6 font-helvetica tracking-wide">Comparativo Visual (Por Peça)</h4>
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barGap={8}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#545454', fontFamily: 'Montserrat'}} />
                                    <YAxis hide />
                                    <Tooltip 
                                        cursor={{fill: '#f8f9fa'}}
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontFamily: 'Montserrat' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontFamily: 'Montserrat' }} />
                                    <Bar dataKey="A" name="Cenário A" fill="#545454" radius={[4, 4, 0, 0]} barSize={24} />
                                    <Bar dataKey="B" name="Cenário B" fill="#72bf03" radius={[4, 4, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* VEREDITO FINANCEIRO CORRIGIDO */}
                    <div className="bg-white border-2 border-sow-green p-6 rounded-xl shadow-lg relative overflow-hidden shrink-0 mt-auto">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp className="w-32 h-32 text-sow-green" /></div>
                        
                        <h3 className="text-sow-green font-helvetica font-bold uppercase tracking-widest text-xs mb-2">Veredito Financeiro</h3>
                        
                        <div className="flex items-center gap-3 mb-4">
                            {/* CORREÇÃO: Texto Preto para dar contraste no fundo claro */}
                            <span className="text-4xl font-helvetica font-bold text-sow-black">Vence: <span className="text-sow-green">Cenário {winner}</span></span>
                            <CheckCircle2 className="text-sow-green w-8 h-8" />
                        </div>
                        
                        <p className="text-sm text-sow-grey font-medium leading-relaxed">
                            Vantagem de <strong className="text-sow-black bg-sow-green/20 px-1 rounded">{formatCurrency(profitDiff)}</strong> de lucro a mais por peça. 
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-4 h-full min-h-0">
                    {renderScenarioColumn('Cenário B', 'bg-sow-green', scenarioB, setScenarioB, resultB)}
                </div>
            </div>
        </div>
    );
};