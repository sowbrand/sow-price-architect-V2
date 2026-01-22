import React, { useState, useEffect } from 'react';
import { Target, TrendingDown, TrendingUp } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import { calculateReverseEngineering, formatCurrency } from '../utils/pricingEngine';
import type { SettingsData, ReverseEngineeringResult } from '../types';

interface ReverseEngineeringProps {
  settings: SettingsData;
}

export const ReverseEngineering: React.FC<ReverseEngineeringProps> = ({ settings }) => {
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [desiredMargin, setDesiredMargin] = useState<number>(25);
  const [result, setResult] = useState<ReverseEngineeringResult | null>(null);

  useEffect(() => {
    if (targetPrice > 0) {
      setResult(calculateReverseEngineering(targetPrice, desiredMargin, settings));
    } else {
      setResult(null);
    }
  }, [targetPrice, desiredMargin, settings]);

  return (
    // WRAPPER PADRÃO ADICIONADO AQUI
    <div className="h-full flex flex-col font-montserrat bg-gray-50 overflow-y-auto p-6 scrollbar-thin">
      <div className="mb-6">
        <h2 className="text-2xl font-helvetica font-bold text-sow-black flex items-center gap-2">
          <Target className="w-6 h-6 text-sow-green" /> Engenharia Reversa
        </h2>
        <p className="text-sm text-sow-grey">Defina o preço de venda alvo e descubra o custo máximo de produção permitido.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft">
            <h3 className="font-helvetica font-bold text-sm uppercase tracking-wider text-sow-black mb-4 border-b border-sow-border pb-2">Parâmetros do Alvo</h3>
            <div className="space-y-4">
              <InputGroup 
                label="Preço de Venda Alvo (R$)" 
                name="targetPrice" 
                value={targetPrice} 
                onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)} 
                type="number" 
                prefix="R$"
                className="text-lg font-bold"
              />
              <div>
                <InputGroup 
                  label="Margem Líquida Desejada (%)" 
                  name="desiredMargin" 
                  value={desiredMargin} 
                  onChange={(e) => setDesiredMargin(parseFloat(e.target.value) || 0)} 
                  type="number" 
                  suffix="%"
                />
                <p className="text-xs text-sow-grey mt-1">Recomendado: entre 15% e 35% para moda.</p>
              </div>
            </div>
          </div>

          <div className="bg-sow-light p-4 rounded-xl border border-sow-border text-sm text-sow-grey">
            <p>O cálculo considera o regime tributário <strong>{settings.taxRegime}</strong> e as taxas de cartão/marketing definidas nas configurações.</p>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-8">
          {result ? (
            <div className="space-y-6">
              {/* Card Principal - Target Cost */}
              <div className="bg-white p-8 rounded-2xl border-2 border-sow-green shadow-lg text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-sow-green"></div>
                <h3 className="text-sm font-bold text-sow-grey uppercase tracking-widest mb-2">Target Cost (Teto de Produção)</h3>
                <div className="text-6xl font-helvetica font-extrabold text-sow-green mb-2">
                  {formatCurrency(result.targetProductionCost)}
                </div>
                <p className="text-sow-black font-medium">
                  Este é o custo máximo total (Indústria + Rateio) para atingir sua meta.
                </p>
              </div>

              {/* Detalhamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft">
                  <h3 className="font-bold text-sm uppercase text-sow-black mb-4 border-b pb-2 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" /> Descontos do Preço Alvo
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-sow-grey">Impostos ({settings.taxRegime}):</span> <span className="font-bold">{formatCurrency(result.taxesAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-sow-grey">Taxas (Cartão/Mkt/Comissão):</span> <span className="font-bold">{formatCurrency(result.feesAmount)}</span></div>
                    <div className="flex justify-between pt-2 border-t"><span className="text-sow-grey font-bold">Margem de Lucro ({desiredMargin}%):</span> <span className="font-bold text-sow-green">{formatCurrency(result.profitAmount)}</span></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft">
                  <h3 className="font-bold text-sm uppercase text-sow-black mb-4 border-b pb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sow-green" /> Composição do Teto
                  </h3>
                   <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center bg-sow-light p-2 rounded">
                        <span className="text-sow-black font-bold">Custo Teto Total:</span>
                        <span className="font-bold text-lg">{formatCurrency(result.targetProductionCost)}</span>
                    </div>
                     <div className="flex justify-between pl-2"><span className="text-sow-grey">(-) Rateio Fixo Estimado:</span> <span>{formatCurrency(settings.monthlyFixedCosts / settings.estimatedMonthlyProduction)}</span></div>
                    <div className="flex justify-between pt-2 border-t pl-2"><span className="text-sow-black font-bold">Disponível p/ Custo Industrial:</span> <span className="font-bold text-sow-green">{formatCurrency(result.targetProductionCost - (settings.monthlyFixedCosts / settings.estimatedMonthlyProduction))}</span></div>
                     <p className="text-xs text-sow-grey mt-2 italic">Quanto você pode gastar com Tecido, Costura, Estampa, etc.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border border-sow-border shadow-soft text-sow-grey p-12 opacity-70">
              <Target className="w-16 h-16 mb-4 text-sow-green/50" />
              <p className="text-lg font-bold">Defina um Preço Alvo</p>
              <p className="text-sm">Preencha o valor no painel ao lado para calcular o teto de custo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};