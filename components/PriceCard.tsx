
import React from 'react';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/pricingEngine';
import type { CalculationResult, SettingsData } from '../types';

interface PriceCardProps {
  result: CalculationResult | null;
  productName: string;
  category: string;
  taxRegime: SettingsData['taxRegime'];
}

export const PriceCard: React.FC<PriceCardProps> = ({ result, productName, category, taxRegime }) => (
    <div className="bg-white rounded-xl border border-sow-border shadow-md relative overflow-hidden group flex flex-col h-auto p-6 transition-all hover:shadow-lg">
        <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none z-0"><DollarSign className="w-48 h-48 text-sow-green" /></div>
        <div className="relative z-10 flex flex-col gap-6 w-full">
            <div className="w-full">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h2 className="text-sow-grey text-xs font-bold uppercase tracking-widest font-helvetica">Preço Sugerido (PV)</h2>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-sow-grey font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">{category === 'Outro' ? productName : category}</span>
                </div>
                <div className="text-5xl font-mono font-bold text-sow-dark tracking-tighter break-words leading-tight w-full">{result ? formatCurrency(result.suggestedSalePrice) : '---'}</div>
            </div>
            <div className="flex flex-wrap gap-6 border-t border-sow-border pt-4 w-full">
                <div><p className="text-[10px] text-sow-grey uppercase font-bold mb-1">Custo Total</p><p className="text-xl font-mono text-sow-dark font-medium whitespace-nowrap">{result ? formatCurrency(result.totalProductionCost) : '---'}</p></div>
                <div><p className="text-[10px] text-sow-green uppercase font-bold mb-1">Lucro Líquido</p><p className="text-xl font-mono text-sow-green font-bold whitespace-nowrap">{result ? formatCurrency(result.netProfitUnit) : '---'}</p></div>
            </div>
        </div>
        <div className="mt-6 pt-4 border-t border-sow-border grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 w-full">
            <div><span className="text-[10px] text-sow-grey block font-bold">Markup</span><span className="font-mono text-sm font-bold text-sow-dark">{result ? result.markup.toFixed(2) : '-'}x</span></div>
            <div><span className="text-[10px] text-sow-grey block font-bold">CMV %</span><span className="font-mono text-sm font-bold text-sow-dark">{result && result.suggestedSalePrice > 0 ? ((result.totalProductionCost / result.suggestedSalePrice) * 100).toFixed(1) : '-'}%</span></div>
            <div><span className="text-[10px] text-sow-grey block font-bold">Impostos ({taxRegime})</span><span className="font-mono text-sm font-bold text-red-500">{result ? formatCurrency(result.taxesUnit) : '-'}</span></div>
            <div><span className="text-[10px] text-sow-grey block font-bold">Despesas</span><span className="font-mono text-sm font-bold text-red-500">{result ? formatCurrency(result.commercialExpensesUnit - result.taxesUnit) : '-'}</span></div>
        </div>
    </div>
);
