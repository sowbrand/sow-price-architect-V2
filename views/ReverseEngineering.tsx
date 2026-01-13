import React, { useState, useEffect } from 'react';
import { Target, ArrowDownRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import { calculateReverse, formatCurrency } from '../utils/pricingEngine';
import { INITIAL_PRODUCT } from '../constants/defaults';
import type { SettingsData, ProductInput, CalculationResult } from '../types';

interface ReverseEngineeringProps {
  settings: SettingsData;
}

export const ReverseEngineering: React.FC<ReverseEngineeringProps> = ({ settings }) => {
    const [targetPrice, setTargetPrice] = useState<number>(89.90);
    const [desiredMargin, setDesiredMargin] = useState<number>(20);
    const [batchSize, setBatchSize] = useState<number>(100);
    const [result, setResult] = useState<CalculationResult | null>(null);

    useEffect(() => {
        // Cria um produto "dummy" apenas com os dados necessários para a reversa
        const dummyInput: ProductInput = { ...INITIAL_PRODUCT, batchSize, targetMargin: desiredMargin };
        setResult(calculateReverse(targetPrice, dummyInput, settings));
    }, [targetPrice, desiredMargin, batchSize, settings]);

    const blockDecimals = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
    };

    return (
        <div className="h-full flex flex-col font-montserrat overflow-hidden">
            <div className="mb-6 shrink-0">
                <div className="flex items-center gap-3 text-sow-black mb-1">
                    <div className="p-2 bg-sow-green/10 rounded-lg"><Target className="w-6 h-6 text-sow-green" /></div>
                    <h2 className="text-2xl font-helvetica font-bold tracking-tight">Engenharia Reversa</h2>
                </div>
                <p className="text-sow-grey text-sm font-medium">Defina o preço de venda alvo e descubra o custo máximo de produção permitido.</p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Coluna de Inputs */}
                <div className="lg:col-span-4 h-full min-h-0 flex flex-col">
                     <div className="bg-white rounded-xl border border-sow-border shadow-soft overflow-hidden flex-1 flex flex-col">
                        <div className="p-4 border-b border-sow-border bg-sow-light flex items-center justify-between">
                            <h3 className="font-helvetica font-bold text-sow-black uppercase tracking-wider text-sm">Parâmetros do Alvo</h3>
                        </div>
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                             <div className="bg-sow-green/5 p-4 rounded-xl border border-sow-green/20">
                                <InputGroup label="Preço de Venda Alvo (R$)" name="targetPrice" value={targetPrice} onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)} type="number" prefix="R$" />
                                <p className="text-xs text-sow-green mt-2 flex items-center gap-1 font-medium"><ArrowDownRight className="w-3 h-3" /> Quanto o mercado paga?</p>
                            </div>
                             <div className="space-y-4 pt-2">
                                <InputGroup label="Margem Líquida Desejada" name="desiredMargin" value={desiredMargin} onChange={(e) => setDesiredMargin(parseFloat(e.target.value) || 0)} type="number" suffix="%" />
                                <InputGroup label="Tamanho do Lote (Diluição)" name="batchSize" value={batchSize} onChange={(e) => setBatchSize(parseFloat(e.target.value) || 0)} type="number" step="1" min="1" onKeyDown={blockDecimals} />
                            </div>
                        </div>
                     </div>
                </div>

                {/* Coluna de Resultados (Com Destaque Chamativo) */}
                <div className="lg:col-span-8 h-full flex flex-col gap-6 min-h-0 overflow-y-auto pr-1">
                    {/* TARGET COST CHAMATIVO */}
                    <div className="bg-white rounded-xl border-2 border-sow-green shadow-lg relative overflow-hidden shrink-0 p-8 flex flex-col items-center text-center">
                        <TrendingUp className="w-16 h-16 text-sow-green/20 absolute top-4 left-4" />
                        <Target className="w-16 h-16 text-sow-green/20 absolute bottom-4 right-4" />
                        
                        <h3 className="font-helvetica font-bold uppercase tracking-widest text-lg text-sow-grey mb-6 relative z-10">
                            Target Cost (Teto de Produção)
                        </h3>
                        
                        <div className="flex flex-col items-center relative z-10">
                            <span className="text-sow-green font-helvetica font-bold text-7xl lg:text-8xl tracking-tighter drop-shadow-sm">
                                {result ? formatCurrency(result.totalProductionCost) : 'R$ 0,00'}
                            </span>
                            <p className="text-sow-grey font-montserrat font-medium mt-4 max-w-md leading-relaxed">
                                Para vender a <strong className="text-sow-black">{formatCurrency(targetPrice)}</strong> e lucrar <strong className="text-sow-black">{desiredMargin}%</strong>, seu custo industrial final <strong>não pode ultrapassar</strong> este valor.
                            </p>
                        </div>
                         <div className="absolute top-0 inset-x-0 h-2 bg-sow-green"></div>
                    </div>

                    {/* Detalhamento das Deduções */}
                    <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft flex-1 min-h-[300px] flex flex-col">
                        <h4 className="text-xs font-helvetica font-bold text-sow-grey uppercase mb-6 tracking-wider">Detalhamento das Deduções do Preço Alvo</h4>
                        <div className="w-full flex-1">
                             <table className="w-full text-sm text-left"><tbody className="divide-y divide-sow-border font-montserrat font-medium text-sow-black">
                                <tr className="bg-sow-light"><td className="py-3 pl-3 font-bold">Preço Venda Alvo</td><td className="py-3 text-right pr-3 font-bold">{formatCurrency(targetPrice)}</td></tr>
                                <tr><td className="py-2 pl-3 text-sow-grey text-xs uppercase flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400"></span> Impostos ({settings.defaultTaxRate}%)</td><td className="py-2 text-right pr-3 text-red-500">- {result ? formatCurrency(result.taxesUnit) : '-'}</td></tr>
                                <tr><td className="py-2 pl-3 text-sow-grey text-xs uppercase flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400"></span> Taxas Cartão/Mkt ({settings.defaultCardRate + settings.defaultMarketingRate}%)</td><td className="py-2 text-right pr-3 text-red-500">- {result ? formatCurrency(result.cardFeesUnit + result.marketingUnit) : '-'}</td></tr>
                                 <tr><td className="py-2 pl-3 text-sow-grey text-xs uppercase flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sow-green"></span> Margem Líquida Desejada ({desiredMargin}%)</td><td className="py-2 text-right pr-3 text-sow-green font-bold">- {result ? formatCurrency(result.netProfitUnit) : '-'}</td></tr>
                                <tr className="border-t-2 border-sow-black font-helvetica font-bold text-base text-sow-green"><td className="py-4 pl-3 uppercase tracking-tight">SOBRA PARA PRODUÇÃO (TARGET)</td><td className="py-4 text-right pr-3">{result ? formatCurrency(result.totalProductionCost) : '-'}</td></tr>
                            </tbody></table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};