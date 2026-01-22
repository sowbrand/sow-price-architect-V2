import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { InputGroup } from '../components/InputGroup';
import { calculateScenario, formatCurrency } from '../utils/pricingEngine';
import { INITIAL_PRODUCT } from '../constants/defaults';
import type { SettingsData, ProductInput, CalculationResult } from '../types';

interface ComparatorProps {
  settings: SettingsData;
}

export const Comparator: React.FC<ComparatorProps> = ({ settings }) => {
  // Inicializa dois cenários
  const [inputA, setInputA] = useState<ProductInput>({ ...INITIAL_PRODUCT, customProductName: 'Cenário A' });
  const [inputB, setInputB] = useState<ProductInput>({ ...INITIAL_PRODUCT, customProductName: 'Cenário B' });

  const [resultA, setResultA] = useState<CalculationResult | null>(null);
  const [resultB, setResultB] = useState<CalculationResult | null>(null);

  // --- MEMÓRIA DE DADOS (Para persistência ao trocar abas) ---
  // Cenário A
  const [memSilkColorsA, setMemSilkColorsA] = useState(1);
  const [memDtfCostA, setMemDtfCostA] = useState(0);
  // Cenário B
  const [memSilkColorsB, setMemSilkColorsB] = useState(1);
  const [memDtfCostB, setMemDtfCostB] = useState(0);

  // Calcula A
  useEffect(() => {
    setResultA(calculateScenario(inputA, settings));
  }, [inputA, settings]);

  // Calcula B
  useEffect(() => {
    setResultB(calculateScenario(inputB, settings));
  }, [inputB, settings]);

  const handleChange = (
    setInput: React.Dispatch<React.SetStateAction<ProductInput>>,
    field: keyof ProductInput,
    value: any
  ) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  // Helper para verificar tipo ativo
  const getActiveType = (input: ProductInput) => {
      if (input.embellishments.length === 0) return 'NONE';
      return input.embellishments[0].type;
  };

  // Função INTELIGENTE para trocar estampa mantendo os dados salvos
  const handleEmbellishmentChange = (
    scenario: 'A' | 'B',
    type: 'NONE' | 'SILK' | 'DTF'
  ) => {
    const setInput = scenario === 'A' ? setInputA : setInputB;
    
    // Recupera da memória correta
    const savedColors = scenario === 'A' ? memSilkColorsA : memSilkColorsB;
    const savedDtfCost = scenario === 'A' ? memDtfCostA : memDtfCostB;

    setInput(prev => {
      const newEmbellishments = [];
      
      if (type === 'SILK') {
        newEmbellishments.push({ 
            id: `comp_silk_${scenario}`, 
            type: 'SILK', 
            silkSize: 'SMALL', 
            printColors: savedColors, // Usa valor da memória
            isRegraving: false 
        });
      } else if (type === 'DTF') {
        newEmbellishments.push({ 
            id: `comp_dtf_${scenario}`, 
            type: 'DTF', 
            dtfManualUnitCost: savedDtfCost // Usa valor da memória
        });
      }
      // Se for NONE, array fica vazio
      
      return { ...prev, embellishments: newEmbellishments as any };
    });
  };

  // Função para atualizar valores e SALVAR NA MEMÓRIA
  const updateEmbellishmentValue = (
    scenario: 'A' | 'B',
    field: 'printColors' | 'dtfManualUnitCost',
    value: number
  ) => {
    const setInput = scenario === 'A' ? setInputA : setInputB;

    // 1. Atualiza a memória
    if (scenario === 'A') {
        if (field === 'printColors') setMemSilkColorsA(value);
        if (field === 'dtfManualUnitCost') setMemDtfCostA(value);
    } else {
        if (field === 'printColors') setMemSilkColorsB(value);
        if (field === 'dtfManualUnitCost') setMemDtfCostB(value);
    }

    // 2. Atualiza o input atual para recálculo imediato
    setInput(prev => {
        const updated = [...prev.embellishments];
        if (updated.length > 0) {
            updated[0] = { ...updated[0], [field]: value };
        }
        return { ...prev, embellishments: updated };
    });
  };

  // Dados para o gráfico
  const chartData = [
    { 
        name: 'Custo Prod.', 
        A: resultA?.totalProductionCost || 0, 
        B: resultB?.totalProductionCost || 0 
    },
    { 
        name: 'Preço Venda', 
        A: resultA?.suggestedSalePrice || 0, 
        B: resultB?.suggestedSalePrice || 0 
    },
    { 
        name: 'Lucro Liq.', 
        A: resultA?.netProfitUnit || 0, 
        B: resultB?.netProfitUnit || 0 
    },
  ];

  const profitA = resultA?.netProfitUnit || 0;
  const profitB = resultB?.netProfitUnit || 0;
  const winner = profitA > profitB ? 'A' : 'B';
  const diff = Math.abs(profitA - profitB);

  return (
    <div className="h-full flex flex-col font-montserrat bg-gray-50 overflow-y-auto p-6 scrollbar-thin">
      
      <div className="mb-6">
        <h2 className="text-2xl font-helvetica font-bold text-sow-black flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-sow-green" /> Comparador de Estratégias
        </h2>
        <p className="text-sm text-sow-grey">Simule dois cenários paralelamente e descubra qual protege melhor sua margem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
        
        {/* === CENÁRIO A === */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-gray-400 shadow-soft space-y-4 h-fit">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-gray-600">CENÁRIO A (Base)</h3>
          </div>
          
          <InputGroup label="Qtd. Lote" name="batchA" value={inputA.batchSize} onChange={(e) => handleChange(setInputA, 'batchSize', parseFloat(e.target.value))} type="number" />
          <InputGroup label="Preço Malha (R$/kg)" name="fabA" value={inputA.fabricPricePerKg} onChange={(e) => handleChange(setInputA, 'fabricPricePerKg', parseFloat(e.target.value))} type="number" prefix="R$" />
          
          <div className="pt-2 border-t border-gray-100">
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Tipo de Estampa</label>
            <div className="flex gap-1 mb-3">
              {['NONE', 'SILK', 'DTF'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleEmbellishmentChange('A', t as any)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-all ${
                    getActiveType(inputA) === t
                    ? 'bg-gray-600 text-white border-gray-600 shadow-sm' 
                    : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t === 'NONE' ? 'LISO' : t}
                </button>
              ))}
            </div>

            {/* Inputs com Memória */}
            {getActiveType(inputA) === 'SILK' && (
                <div className="bg-gray-50 p-2 rounded border border-gray-200 animate-fade-in">
                    <InputGroup label="Nº de Cores" name="colorsA" value={inputA.embellishments[0]?.printColors || 1} onChange={(e) => updateEmbellishmentValue('A', 'printColors', parseInt(e.target.value))} type="number" step="1" />
                </div>
            )}
            {getActiveType(inputA) === 'DTF' && (
                <div className="bg-gray-50 p-2 rounded border border-gray-200 animate-fade-in">
                    <InputGroup label="Custo Impressão (Un)" name="dtfCostA" value={inputA.embellishments[0]?.dtfManualUnitCost || 0} onChange={(e) => updateEmbellishmentValue('A', 'dtfManualUnitCost', parseFloat(e.target.value))} type="number" prefix="R$" />
                </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-500">Custo Unitário</span>
                <span className="font-bold text-base text-gray-800">{resultA ? formatCurrency(resultA.totalProductionCost) : '-'}</span>
             </div>
             <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
                <span className="text-xs font-bold text-gray-600">Lucro Líquido</span>
                <span className="font-bold text-base text-gray-800">{resultA ? formatCurrency(resultA.netProfitUnit) : '-'}</span>
             </div>
          </div>
        </div>

        {/* === GRÁFICO CENTRAL & VEREDITO === */}
        <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft flex-1 flex flex-col justify-center min-h-[350px]">
                <h3 className="text-xs font-bold text-center uppercase text-gray-400 mb-6">Raio-X Comparativo</h3>
                
                <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barGap={0} barSize={35} margin={{top: 10, right: 10, left: -25, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontFamily: 'Montserrat', fill: '#9ca3af', dy: 10}} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontFamily: 'Montserrat', fill: '#9ca3af'}} 
                                tickFormatter={(value) => `R$${value}`}
                            />
                            <Tooltip 
                                cursor={{fill: '#f9fafb'}}
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Montserrat', fontSize: '12px'}}
                                formatter={(val: number) => [formatCurrency(val), '']}
                            />
                            <Bar dataKey="A" name="Cenário A" fill="#9ca3af" radius={[4, 4, 0, 0]} animationDuration={1000} />
                            <Bar dataKey="B" name="Cenário B" fill="#72bf03" radius={[4, 4, 0, 0]} animationDuration={1000} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex justify-center gap-6 mt-6 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded-full"></div><span className="text-xs font-bold text-gray-500">Cenário A (Base)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-sow-green rounded-full"></div><span className="text-xs font-bold text-gray-500">Cenário B (Simulação)</span></div>
                </div>
            </div>

            <div className={`p-6 rounded-xl border shadow-soft transition-all ${winner === 'B' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className={`w-5 h-5 ${winner === 'B' ? 'text-green-600' : 'text-gray-400'}`} />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-sow-black">Veredito Financeiro</h3>
                </div>
                
                {Math.abs(diff) < 0.01 ? (
                     <div>
                        <p className="text-xl font-bold text-sow-black mb-1">Empate Técnico</p>
                        <p className="text-xs text-gray-600 mt-2">Os dois cenários apresentam o mesmo resultado financeiro.</p>
                     </div>
                ) : winner === 'B' ? (
                    <div>
                        <p className="text-2xl font-bold text-sow-black mb-1">Vence: <span className="text-green-600 bg-green-100 px-2 rounded">Cenário B</span></p>
                        <p className="text-xs text-gray-600 mt-2">
                            O Cenário B garante uma vantagem de <span className="font-bold text-green-700 bg-green-200 px-1 rounded">{formatCurrency(diff)}</span> de lucro a mais por peça.
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-2xl font-bold text-sow-black mb-1">Vence: <span className="text-gray-600 bg-gray-100 px-2 rounded">Cenário A</span></p>
                        <p className="text-xs text-gray-600 mt-2">
                            O Cenário A ainda é mais lucrativo por <span className="font-bold text-gray-700 bg-gray-200 px-1 rounded">{formatCurrency(diff)}</span>.
                        </p>
                    </div>
                )}
            </div>
        </div>

        {/* === CENÁRIO B === */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-sow-green shadow-soft space-y-4 h-fit">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-sow-green">CENÁRIO B (Simulação)</h3>
          </div>
          
          <InputGroup label="Qtd. Lote" name="batchB" value={inputB.batchSize} onChange={(e) => handleChange(setInputB, 'batchSize', parseFloat(e.target.value))} type="number" />
          <InputGroup label="Preço Malha (R$/kg)" name="fabB" value={inputB.fabricPricePerKg} onChange={(e) => handleChange(setInputB, 'fabricPricePerKg', parseFloat(e.target.value))} type="number" prefix="R$" />
          
          <div className="pt-2 border-t border-gray-100">
            <label className="text-[10px] font-bold text-sow-green uppercase block mb-1">Tipo de Estampa</label>
            <div className="flex gap-1 mb-3">
              {['NONE', 'SILK', 'DTF'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleEmbellishmentChange('B', t as any)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-all ${
                    getActiveType(inputB) === t
                    ? 'bg-sow-green text-white border-sow-green shadow-md' 
                    : 'bg-white text-sow-grey border-sow-border hover:bg-green-50'
                  }`}
                >
                  {t === 'NONE' ? 'LISO' : t}
                </button>
              ))}
            </div>

            {/* Inputs com Memória */}
            {getActiveType(inputB) === 'SILK' && (
                <div className="bg-green-50 p-2 rounded border border-green-100 animate-fade-in">
                    <InputGroup label="Nº de Cores" name="colorsB" value={inputB.embellishments[0]?.printColors || 1} onChange={(e) => updateEmbellishmentValue('B', 'printColors', parseInt(e.target.value))} type="number" step="1" />
                </div>
            )}
            {getActiveType(inputB) === 'DTF' && (
                <div className="bg-green-50 p-2 rounded border border-green-100 animate-fade-in">
                    <InputGroup label="Custo Impressão (Un)" name="dtfCostB" value={inputB.embellishments[0]?.dtfManualUnitCost || 0} onChange={(e) => updateEmbellishmentValue('B', 'dtfManualUnitCost', parseFloat(e.target.value))} type="number" prefix="R$" />
                </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-500">Custo Unitário</span>
                <span className="font-bold text-base text-gray-800">{resultB ? formatCurrency(resultB.totalProductionCost) : '-'}</span>
             </div>
             <div className="flex justify-between items-center bg-green-50 p-2 rounded-lg border border-green-200">
                <span className="text-xs font-bold text-green-800">Lucro Líquido</span>
                <span className="font-bold text-base text-green-700">{resultB ? formatCurrency(resultB.netProfitUnit) : '-'}</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};