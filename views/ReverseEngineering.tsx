
import React, { useState } from 'react';
import { Target, ArrowDown, Lock } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import { formatCurrency } from '../utils/pricingEngine';
import type { SettingsData } from '../types';

interface ReverseEngineeringProps {
  settings: SettingsData;
}

export const ReverseEngineering: React.FC<ReverseEngineeringProps> = ({ settings }) => {
    const [targetPrice, setTargetPrice] = useState(59.90);
    const [desiredMargin, setDesiredMargin] = useState(20);

    const totalRates = settings.defaultTaxRate + settings.defaultCardRate + settings.defaultMarketingRate + settings.defaultCommissionRate + desiredMargin;
    const maxCost = targetPrice * (1 - (totalRates / 100));
    const taxes = targetPrice * (settings.defaultTaxRate / 100);
    const expenses = targetPrice * ((settings.defaultCardRate + settings.defaultMarketingRate + settings.defaultCommissionRate) / 100);
    const profit = targetPrice * (desiredMargin / 100);

    return (
      <div className="max-w-3xl mx-auto h-full overflow-y-auto p-2">
        <div className="text-center mb-10"><h2 className="text-2xl font-bold text-sow-dark mb-2 flex items-center justify-center gap-3"><Target className="text-sow-green w-8 h-8" />Engenharia Reversa</h2><p className="text-sow-grey font-medium">Defina o preço de prateleira e descubra o seu teto de custos de produção.</p></div>
        <div className="bg-white border border-sow-border rounded-xl p-8 mb-8 shadow-md"><div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputGroup label="Preço de Venda Alvo (PV)" name="targetPrice" value={targetPrice} onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)} type="number" prefix="R$" step="0.10" />
            <InputGroup label="Margem Líquida Desejada" name="desiredMargin" value={desiredMargin} onChange={(e) => setDesiredMargin(parseFloat(e.target.value) || 0)} type="number" suffix="%" step="1" />
        </div></div>
        <div className="relative">
            <div className="absolute left-1/2 -top-4 -translate-x-1/2 bg-white p-2 rounded-full border border-sow-border shadow-sm z-10"><ArrowDown className="text-sow-grey" /></div>
            <div className="bg-sow-dark rounded-xl p-8 text-center shadow-xl relative overflow-hidden">
                <h3 className="text-sow-green font-bold uppercase tracking-widest text-sm mb-4">Target Cost (Teto de Produção)</h3>
                <div className="text-6xl font-mono font-bold text-white mb-8 tracking-tighter">{maxCost > 0 ? formatCurrency(maxCost) : 'R$ 0,00'}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-8">
                    <div className="bg-white/5 p-4 rounded border border-white/10"><p className="text-[10px] text-white/60 uppercase mb-1">Impostos ({settings.defaultTaxRate}%)</p><p className="font-mono text-red-300 font-bold">{formatCurrency(taxes)}</p></div>
                    <div className="bg-white/5 p-4 rounded border border-white/10"><p className="text-[10px] text-white/60 uppercase mb-1">Despesas/Mkt/Com.</p><p className="font-mono text-red-300 font-bold">{formatCurrency(expenses)}</p></div>
                    <div className="bg-sow-green/10 p-4 rounded border border-sow-green/30"><p className="text-[10px] text-sow-green uppercase mb-1">Lucro Líquido ({desiredMargin}%)</p><p className="font-mono text-sow-green font-bold">{formatCurrency(profit)}</p></div>
                </div>
            </div>
        </div>
        <div className="mt-8 bg-white p-6 rounded-lg border border-sow-border flex items-start gap-4 shadow-sm"><Lock className="w-6 h-6 text-sow-grey mt-1" /><div className="text-sm text-sow-dark"><p className="font-bold mb-1 uppercase tracking-wide text-xs text-sow-grey">Análise Estratégica:</p><p>Para vender a <strong>{formatCurrency(targetPrice)}</strong> e lucrar <strong>{desiredMargin}%</strong>, a soma de todo o seu Custo Industrial (Tecido, Corte, Estampa, Costura) + Custos Fixos não pode ultrapassar <strong>{formatCurrency(maxCost)}</strong>.</p></div></div>
      </div>
    );
};
