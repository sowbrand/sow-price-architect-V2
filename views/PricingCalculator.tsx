
import React, { useState, useEffect } from 'react';
import { Tag, Package, Layers, Truck, TrendingUp, PlusCircle, Trash2, AlertTriangle, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { InputGroup } from '../components/InputGroup';
import { PriceCard } from '../components/PriceCard';
import { calculateScenario, formatCurrency } from '../utils/pricingEngine';
import { INITIAL_PRODUCT } from '../types';
import type { SettingsData, ProductInput, CalculationResult, Embellishment } from '../types';

interface PricingCalculatorProps {
  settings: SettingsData;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({ settings }) => {
    const [input, setInput] = useState<ProductInput>(INITIAL_PRODUCT);
    const [result, setResult] = useState<CalculationResult | null>(null);

    useEffect(() => {
      setResult(calculateScenario(input, settings));
    }, [input, settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setInput(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const blockDecimals = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
    };

    const addEmbellishment = () => {
      const newId = Math.random().toString(36).substr(2, 9);
      setInput(prev => ({ ...prev, embellishments: [...prev.embellishments, { id: newId, type: 'SILK' }] }));
    };

    const removeEmbellishment = (id: string) => {
      setInput(prev => ({ ...prev, embellishments: prev.embellishments.filter(i => i.id !== id) }));
    };

    const updateEmbellishment = (id: string, field: keyof Embellishment, value: string | number) => {
        setInput(prev => ({...prev, embellishments: prev.embellishments.map(item => item.id === id ? { ...item, [field]: value } : item)}));
    };

    const handleExportXLS = () => {
      if (!result) return;
      const productName = input.productCategory === 'Outro' ? input.customProductName : input.productCategory;
      const ws_data = [
          ["SOW PRICE REPORT", ""], ["Data Simulação", new Date().toLocaleDateString()], ["Produto", productName],
          ["Regime Tributário", settings.taxRegime], ["Lote (peças)", input.batchSize], ["", ""],
          ["CUSTOS INDUSTRIAIS (UNITÁRIO)", "VALOR (R$)"], ["Matéria-Prima", result.materialUnit],
          ["Risco & Corte", result.plotterUnit + result.cuttingLaborUnit], ["Beneficiamento Total", result.processingUnit],
          ["Confecção", result.sewingUnit], ["Logística Entrada", result.logisticsInUnit],
          ["Custo Fixo (Rateio)", result.fixedOverheadUnit], ["CUSTO TOTAL DE PRODUÇÃO", result.totalProductionCost],
          ["", ""], ["FORMAÇÃO DE PREÇO", ""], ["Margem Desejada (%)", input.targetMargin / 100],
          ["Markup Aplicado", result.markup], ["Preço Sugerido (PV)", result.suggestedSalePrice], ["", ""],
          ["RESULTADOS", ""], ["Impostos", result.taxesUnit], ["Despesas Variáveis", result.commercialExpensesUnit - result.taxesUnit],
          ["Lucro Líquido", result.netProfitUnit],
      ];
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Precificacao");
      ws['!cols'] = [{ wch: 30 }, { wch: 15 }];
      XLSX.writeFile(wb, `SowPrice_${productName.replace(/\s+/g, '_')}.xlsx`);
    };

    const chartData = result ? [
      { name: 'Matéria-Prima', value: result.materialUnit, color: '#f59e0b' },
      { name: 'Corte/Risco', value: result.plotterUnit + result.cuttingLaborUnit, color: '#6366f1' },
      { name: 'Beneficiamento', value: result.processingUnit, color: '#ec4899' },
      { name: 'Confecção', value: result.sewingUnit, color: '#8b5cf6' },
      { name: 'Logística', value: result.logisticsInUnit, color: '#3b82f6' },
      { name: 'Custo Fixo', value: result.fixedOverheadUnit, color: '#64748b' },
      { name: 'Despesas Com.', value: result.commercialExpensesUnit, color: '#ef4444' },
      { name: 'Lucro Líquido', value: result.netProfitUnit, color: '#72bf03' },
    ] : [];

    const PRODUCT_CATEGORIES = ['Camiseta Oversized', 'Camiseta Streetwear', 'Camiseta Casual', 'Camiseta Slim', 'Camiseta Feminina', 'Outro'];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden font-sans text-sow-dark">
        <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-3 pb-24 h-full">
            <div className="bg-white p-6 rounded-xl border border-sow-border shadow-sm">
                <div className="flex items-center gap-2 mb-5 text-sow-dark border-b border-sow-border pb-2"><Tag className="w-5 h-5 text-sow-grey" /><h3 className="font-bold text-sm uppercase tracking-wider font-helvetica">Definição do Produto</h3></div>
                <div className="space-y-4">
                    <InputGroup label="Tipo de Peça" name="productCategory" value={input.productCategory} onChange={handleChange} type="select" options={PRODUCT_CATEGORIES.map(cat => ({ label: cat, value: cat }))} />
                    {input.productCategory === 'Outro' && <InputGroup label="Nome do Produto Personalizado" name="customProductName" value={input.customProductName} onChange={handleChange} type="text" prefix="Nome:" />}
                    <InputGroup label="Qtd. do Lote (Peças)" name="batchSize" value={input.batchSize} onChange={handleChange} type="number" step="1" min="1" onKeyDown={blockDecimals} />
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2 flex items-center justify-between"><span className="text-[10px] text-sow-grey font-bold uppercase tracking-wider">Regime Tributário</span><span className="text-xs font-bold text-sow-dark bg-white border border-sow-border px-2 py-1 rounded shadow-sm">{settings.taxRegime}</span></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-sow-border shadow-sm">
              <div className="flex items-center gap-2 mb-5 text-sow-dark border-b border-sow-border pb-2"><Package className="w-5 h-5 text-sow-grey" /><h3 className="font-bold text-sm uppercase tracking-wider font-helvetica">1. Matéria-Prima & Corte</h3></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                  <InputGroup label="Preço Malha" name="fabricPricePerKg" value={input.fabricPricePerKg} onChange={handleChange} type="number" prefix="R$" suffix="/kg" />
                  <InputGroup label="Rendimento" name="piecesPerKg" value={input.piecesPerKg} onChange={handleChange} type="number" suffix="pçs/kg" step="0.1" />
                  <InputGroup label="Perda Corte" name="lossPercentage" value={input.lossPercentage} onChange={handleChange} type="number" suffix="%" />
                  <div className="col-span-1"><InputGroup label="M.O. Corte (Unit.)" name="cuttingLaborCost" value={input.cuttingLaborCost} onChange={handleChange} type="number" prefix="R$" /></div>
                  <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100"><InputGroup label="Risco/Plotter (Total Lote)" name="plotterTotalCost" value={input.plotterTotalCost} onChange={handleChange} type="number" prefix="R$" /></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-sow-border shadow-sm">
              <div className="flex items-center justify-between mb-5 border-b border-sow-border pb-2">
                  <div className="flex items-center gap-2 text-sow-dark"><Layers className="w-5 h-5 text-sow-grey" /><h3 className="font-bold text-sm uppercase tracking-wider font-helvetica">2. Beneficiamento</h3></div>
                  <button onClick={addEmbellishment} className="text-sow-green hover:text-sow-dark transition-colors"><PlusCircle className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                  {input.embellishments.length === 0 && <p className="text-xs text-sow-grey italic text-center py-4 bg-gray-50 rounded">Nenhuma técnica adicionada (Peça Lisa).</p>}
                  {input.embellishments.map((item, index) => (
                      <div key={item.id} className="bg-sow-light p-4 rounded-lg border border-sow-border relative group">
                          <button onClick={() => removeEmbellishment(item.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          <div className="mb-3 pr-6">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-sow-grey mb-1 block">Técnica #{index + 1}</label>
                              <select value={item.type} onChange={(e) => updateEmbellishment(item.id, 'type', e.target.value)} className="w-full bg-white border border-sow-border text-xs rounded p-2 focus:ring-1 focus:ring-sow-green outline-none">
                                  <option value="SILK">Silk Screen</option><option value="BORDADO">Bordado</option><option value="DTG">DTG / Digital</option>
                              </select>
                          </div>
                          {item.type === 'SILK' && (<div className="grid grid-cols-2 gap-3">
                              <InputGroup label="Custo Tela (Matriz)" name={`silk_setup_${item.id}`} value={item.printSetupCost || 0} onChange={(e) => updateEmbellishment(item.id, 'printSetupCost', parseFloat(e.target.value))} type="number" prefix="R$" />
                              <InputGroup label="Nº Cores" name={`silk_colors_${item.id}`} value={item.printColors || 0} onChange={(e) => updateEmbellishment(item.id, 'printColors', parseFloat(e.target.value))} type="number" step="1" min="1" onKeyDown={blockDecimals} />
                              <InputGroup label="Custo Passada" name={`silk_pass_${item.id}`} value={item.printPassCost || 0} onChange={(e) => updateEmbellishment(item.id, 'printPassCost', parseFloat(e.target.value))} type="number" prefix="R$" />
                          </div>)}
                          {item.type === 'BORDADO' && (<div className="grid grid-cols-2 gap-3">
                              <InputGroup label="Milheiros de Pontos" name={`emb_stitch_${item.id}`} value={item.embroideryStitchCount || 0} onChange={(e) => updateEmbellishment(item.id, 'embroideryStitchCount', parseFloat(e.target.value))} type="number" step="0.1" />
                              <InputGroup label="Valor Milheiro" name={`emb_cost_${item.id}`} value={item.embroideryCostPerThousand || 0} onChange={(e) => updateEmbellishment(item.id, 'embroideryCostPerThousand', parseFloat(e.target.value))} type="number" prefix="R$" />
                          </div>)}
                          {item.type === 'DTG' && (<div className="grid grid-cols-2 gap-3">
                              <InputGroup label="Custo Impressão" name={`dtg_print_${item.id}`} value={item.dtgPrintCost || 0} onChange={(e) => updateEmbellishment(item.id, 'dtgPrintCost', parseFloat(e.target.value))} type="number" prefix="R$" />
                              <InputGroup label="Pre-treatment" name={`dtg_pre_${item.id}`} value={item.dtgPretreatmentCost || 0} onChange={(e) => updateEmbellishment(item.id, 'dtgPretreatmentCost', parseFloat(e.target.value))} type="number" prefix="R$" />
                          </div>)}
                      </div>
                  ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-sow-border shadow-sm">
               <div className="flex items-center gap-2 mb-5 text-sow-dark border-b border-sow-border pb-2"><Truck className="w-5 h-5 text-sow-grey" /><h3 className="font-bold text-sm uppercase tracking-wider font-helvetica">3. Confecção & Logística</h3></div>
               <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                   <InputGroup label="Costura (Un)" name="sewingCost" value={input.sewingCost} onChange={handleChange} type="number" prefix="R$" />
                   <InputGroup label="Revisão/Acab." name="finishingCost" value={input.finishingCost} onChange={handleChange} type="number" prefix="R$" />
                   <InputGroup label="Embalagem (Un)" name="packagingCost" value={input.packagingCost} onChange={handleChange} type="number" prefix="R$" />
                   <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100"><InputGroup label="Logística (Total Lote)" name="logisticsTotalCost" value={input.logisticsTotalCost} onChange={handleChange} type="number" prefix="R$" /></div>
               </div>
            </div>
            <div className="bg-white p-6 rounded-xl border-l-4 border-l-sow-green shadow-sm ring-1 ring-sow-border">
               <div className="flex items-center gap-2 mb-5 text-sow-dark border-b border-sow-border pb-2"><TrendingUp className="w-5 h-5 text-sow-green" /><h3 className="font-bold text-sm uppercase tracking-wider font-helvetica">4. Estratégia</h3></div>
               <div className="grid grid-cols-1 gap-4"><InputGroup label="Margem Líquida Desejada" name="targetMargin" value={input.targetMargin} onChange={handleChange} type="number" suffix="%" /></div>
            </div>
        </div>
        <div className="lg:col-span-7 h-full flex flex-col overflow-y-auto pb-24 px-1">
            <div className="space-y-4">
                <PriceCard result={result} productName={input.customProductName} category={input.productCategory} taxRegime={settings.taxRegime} />
                <button onClick={handleExportXLS} className="w-full py-4 bg-white border border-sow-border hover:border-sow-green text-sow-dark hover:text-sow-green font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm group mt-4"><Download className="w-5 h-5 text-sow-grey group-hover:text-sow-green transition-colors" /><span>Exportar Planilha (XLS)</span></button>
            </div>
            {result && result.warnings.length > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start gap-3 shadow-sm mt-6">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /><div className="text-sm text-amber-800 space-y-1 font-medium">{result.warnings.map((w, i) => <p key={i}>{w}</p>)}</div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pb-6">
                <div className="bg-white rounded-xl p-6 border border-sow-border shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-xs font-bold uppercase text-sow-grey mb-6 font-helvetica">Composição do Preço</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e5e5', color: '#000', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#000', fontFamily: 'JetBrains Mono' }} />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontFamily: 'Inter' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-sow-border shadow-sm flex flex-col h-auto">
                    <h3 className="text-xs font-bold uppercase text-sow-grey mb-4 font-helvetica">Detalhamento Contábil</h3>
                    <div className="w-full">
                        <table className="w-full text-sm text-left"><tbody className="divide-y divide-gray-100 font-mono text-sow-dark">
                            <tr><td className="py-2 text-xs uppercase text-sow-grey">Matéria-Prima</td><td className="py-2 text-right">{result ? formatCurrency(result.materialUnit) : '-'}</td></tr>
                            <tr><td className="py-2 text-xs uppercase text-sow-grey">Corte & Risco</td><td className="py-2 text-right">{result ? formatCurrency(result.plotterUnit + result.cuttingLaborUnit) : '-'}</td></tr>
                            <tr><td className="py-2 text-xs uppercase text-sow-grey">Beneficiamento (Total)</td><td className="py-2 text-right">{result ? formatCurrency(result.processingUnit) : '-'}</td></tr>
                            <tr><td className="py-2 text-xs uppercase text-sow-grey">Confecção</td><td className="py-2 text-right">{result ? formatCurrency(result.sewingUnit) : '-'}</td></tr>
                            <tr><td className="py-2 text-xs uppercase text-sow-grey">Logística Entrada</td><td className="py-2 text-right">{result ? formatCurrency(result.logisticsInUnit) : '-'}</td></tr>
                            <tr className="bg-gray-50 font-bold text-sow-grey"><td className="py-2 pl-2 text-xs uppercase">Custo Industrial</td><td className="py-2 text-right pr-2">{result ? formatCurrency(result.industrialCostUnit) : '-'}</td></tr>
                            <tr><td className="py-2 text-xs uppercase text-sow-grey">Rateio Fixo</td><td className="py-2 text-right">{result ? formatCurrency(result.fixedOverheadUnit) : '-'}</td></tr>
                            <tr className="border-t-2 border-sow-dark font-bold"><td className="py-2 pl-2">CUSTO FINAL</td><td className="py-2 text-right pr-2">{result ? formatCurrency(result.totalProductionCost) : '-'}</td></tr>
                            <tr><td colSpan={2} className="h-4"></td></tr>
                            <tr><td className="py-2 text-xs uppercase text-red-500">Despesas Comerciais</td><td className="py-2 text-right text-red-500">{result ? formatCurrency(result.commercialExpensesUnit) : '-'}</td></tr>
                            <tr className="bg-sow-green/10 text-sow-green font-bold border-t border-sow-green/20"><td className="py-3 pl-2">LUCRO LÍQUIDO ({input.targetMargin}%)</td><td className="py-3 text-right pr-2">{result ? formatCurrency(result.netProfitUnit) : '-'}</td></tr>
                        </tbody></table>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
};
