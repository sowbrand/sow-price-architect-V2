import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InputGroup } from '../components/InputGroup';
import { calculateScenario, formatCurrency } from '../utils/pricingEngine';
import { INITIAL_PRODUCT } from '../constants/defaults';
import type { SettingsData, ProductInput, CalculationResult } from '../types';

interface ComparatorProps {
  settings: SettingsData;
}

export const Comparator: React.FC<ComparatorProps> = ({ settings }) => {
  // Inicializa dois cenários independentes
  const [inputA, setInputA] = useState<ProductInput>({ ...INITIAL_PRODUCT, customProductName: 'Cenário A' });
  const [inputB, setInputB] = useState<ProductInput>({ ...INITIAL_PRODUCT, customProductName: 'Cenário B' });

  const [resultA, setResultA] = useState<CalculationResult | null>(null);
  const [resultB, setResultB] = useState<CalculationResult | null>(null);

  // Calcula A
  useEffect(() => {
    setResultA(calculateScenario(inputA, settings));
  }, [inputA, settings]);

  // Calcula B
  useEffect(() => {
    setResultB(calculateScenario(inputB, settings));
  }, [inputB, settings]);

  // Função genérica para atualizar inputs
  const handleChange = (
    setInput: React.Dispatch<React.SetStateAction<ProductInput>>,
    field: keyof ProductInput,
    value: any
  ) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  // Função para atualizar estampa (Simplificada para o Comparador)
  const handleEmbellishmentChange = (
    setInput: React.Dispatch<React.SetStateAction<ProductInput>>,
    type: 'NONE' | 'SILK' | 'DTF'
  ) => {
    setInput(prev => {
      const newEmbellishments = [];
      if (type === 'SILK') {
        newEmbellishments.push({ id: 'comp_silk', type: 'SILK', silkSize: 'SMALL', printColors: 1, printSetupCost: 0, printPassCost: 0 });
      } else if (type === 'DTF') {
        newEmbellishments.push({ id: 'comp_dtf', type: 'DTF', dtfManualUnitCost: 0 });
      }
      return { ...prev, embellishments: newEmbellishments as any };
    });
  };

  const data = [
    { name: 'Custo', A: resultA?.totalProductionCost || 0, B: resultB?.totalProductionCost || 0 },
    { name: 'Lucro', A: resultA?.netProfitUnit || 0, B: resultB?.netProfitUnit || 0 },
  ];

  const winner = (resultA?.netProfitUnit || 0) > (resultB?.netProfitUnit || 0) ? 'A' : 'B';
  const diff = Math.abs((resultA?.netProfitUnit || 0) - (resultB?.netProfitUnit || 0));

  return (
    <div className="h-full flex flex-col font-montserrat bg-gray-50 overflow-y-auto p-6 scrollbar-thin">
      
      <div className="mb-6">
        <h2 className="text-2xl font-helvetica font-bold text-sow-black flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-sow-green" /> Comparador de Estratégias
        </h2>
        <p className="text-sm text-sow-grey">Simule dois cenários paralelamente e descubra qual protege melhor sua margem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
        
        {/* CENÁRIO A */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-gray-400 shadow-soft space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-gray-600">CENÁRIO A</h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold">Base</span>
          </div>
          
          <InputGroup label="Qtd. Lote" name="batchA" value={inputA.batchSize} onChange={(e) => handleChange(setInputA, 'batchSize', parseFloat(e.target.value))} type="number" />
          <InputGroup label="Preço Malha (R$/kg)" name="fabA" value={inputA.fabricPricePerKg} onChange={(e) => handleChange(setInputA, 'fabricPricePerKg', parseFloat(e.target.value))} type="number" prefix="R$" />
          <InputGroup label="Costura (Un)" name="sewA" value={inputA.sewingCost} onChange={(e) => handleChange(setInputA, 'sewingCost', parseFloat(e.target.value))} type="number" prefix="R$" />

          <div className="pt-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Tipo de Estampa</label>
            <div className="flex gap-1">
              {['NONE', 'SILK', 'DTF'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleEmbellishmentChange(setInputA, t as any)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded border ${
                    (inputA.embellishments[0]?.type || 'NONE') === (t === 'NONE' ? undefined : t) 
                    ? 'bg-gray-600 text-white border-gray-600' 
                    : 'bg-white text-gray-400 border-gray-200'
                  }`}
                >
                  {t === 'NONE' ? 'LISO' : t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-500">Custo Total</span>
                <span className="font-bold text-lg text-gray-800">{resultA ? formatCurrency(resultA.totalProductionCost) : '-'}</span>
             </div>
             <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                <span className="text-xs font-bold text-gray-500">Lucro Líquido</span>
                <span className="font-bold text-lg text-green-600">{resultA ? formatCurrency(resultA.netProfitUnit) : '-'}</span>
             </div>
          </div>
        </div>

        {/* GRÁFICO CENTRAL & VEREDITO */}
        <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft flex-1 flex flex-col justify-center">
                <h3 className="text-xs font-bold text-center uppercase text-gray-400 mb-4">Raio-X Comparativo (Por Peça)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barSize={40}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontFamily: 'Montserrat'}} />
                            <YAxis hide />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                formatter={(val: number) => formatCurrency(val)}
                            />
                            <Bar dataKey="A" name="Cenário A" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="B" name="Cenário B" fill="#72bf03" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded-full"></div><span className="text-xs font-bold text-gray-500">Cenário A</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-sow-green rounded-full"></div><span className="text-xs font-bold text-gray-500">Cenário B</span></div>
                </div>
            </div>

            <div className={`p-6 rounded-xl border shadow-soft transition-all ${winner === 'B' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className={`w-5 h-5 ${winner === 'B' ? 'text-green-600' : 'text-gray-400'}`} />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-sow-black">Veredito Financeiro</h3>
                </div>
                
                {winner === 'B' ? (
                    <div>
                        <p className="text-2xl font-bold text-sow-black mb-1">Vence: <span className="text-green-600 bg-green-100 px-2 rounded">Cenário B</span></p>
                        <p className="text-xs text-gray-600 mt-2">
                            Ao optar pelo Cenário B, você garante uma vantagem de <span className="font-bold text-green-700 bg-green-200 px-1 rounded">{formatCurrency(diff)}</span> de lucro a mais por cada peça vendida.
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-2xl font-bold text-sow-black mb-1">Vence: <span className="text-gray-600 bg-gray-200 px-2 rounded">Cenário A</span></p>
                        <p className="text-xs text-gray-600 mt-2">
                            O Cenário A (Base) ainda é mais lucrativo por <span className="font-bold text-gray-700 bg-gray-200 px-1 rounded">{formatCurrency(diff)}</span>. Reveja os custos do Cenário B.
                        </p>
                    </div>
                )}
            </div>
        </div>

        {/* CENÁRIO B */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-sow-green shadow-soft space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-sow-green">CENÁRIO B</h3>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-bold">Simulação</span>
          </div>
          
          <InputGroup label="Qtd. Lote" name="batchB" value={inputB.batchSize} onChange={(e) => handleChange(setInputB, 'batchSize', parseFloat(e.target.value))} type="number" />
          <InputGroup label="Preço Malha (R$/kg)" name="fabB" value={inputB.fabricPricePerKg} onChange={(e) => handleChange(setInputB, 'fabricPricePerKg', parseFloat(e.target.value))} type="number" prefix="R$" />
          <InputGroup label="Costura (Un)" name="sewB" value={inputB.sewingCost} onChange={(e) => handleChange(setInputB, 'sewingCost', parseFloat(e.target.value))} type="number" prefix="R$" />

          <div className="pt-2">
            <label className="text-[10px] font-bold text-sow-green uppercase block mb-1">Tipo de Estampa</label>
            <div className="flex gap-1">
              {['NONE', 'SILK', 'DTF'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleEmbellishmentChange(setInputB, t as any)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-colors ${
                    (inputB.embellishments[0]?.type || 'NONE') === (t === 'NONE' ? undefined : t) 
                    ? 'bg-sow-green text-white border-sow-green shadow-md' 
                    : 'bg-white text-sow-grey border-sow-border hover:bg-green-50'
                  }`}
                >
                  {t === 'NONE' ? 'LISO' : t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-500">Custo Total</span>
                <span className="font-bold text-lg text-gray-800">{resultB ? formatCurrency(resultB.totalProductionCost) : '-'}</span>
             </div>
             <div className="flex justify-between items-center bg-green-50 p-2 rounded-lg border border-green-100">
                <span className="text-xs font-bold text-green-800">Lucro Líquido</span>
                <span className="font-bold text-lg text-green-600">{resultB ? formatCurrency(resultB.netProfitUnit) : '-'}</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};