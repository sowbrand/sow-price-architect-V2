import React, { useState, useEffect, useRef } from 'react';
import { Tag, Package, Layers, Truck, TrendingUp, PlusCircle, Trash2, CheckCircle2, Download, RefreshCw, X, Printer, DollarSign, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { InputGroup } from '../components/InputGroup';
import { PriceCard } from '../components/PriceCard';
import { calculateScenario, formatCurrency } from '../utils/pricingEngine';
import { DTFCalculator } from './DTFCalculator'; 
import { INITIAL_PRODUCT } from '../constants/defaults';
import type { SettingsData, ProductInput, CalculationResult, Embellishment } from '../types';

interface PricingCalculatorProps {
  settings: SettingsData;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({ settings }) => {
    const [input, setInput] = useState<ProductInput>(INITIAL_PRODUCT);
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [dtfPrintManual, setDtfPrintManual] = useState(0);
    const [dtfAppManual, setDtfAppManual] = useState(0);
    const [settingsChangedAlert, setSettingsChangedAlert] = useState(false);
    const prevSettingsRef = useRef<SettingsData>(settings);

    // 1. MONITOR DE MUDANÇAS GLOBAIS
    useEffect(() => {
        const prevSettings = prevSettingsRef.current;
        let hasChanges = false;
        if (
            prevSettings.defaultTaxRate !== settings.defaultTaxRate ||
            prevSettings.defaultCardRate !== settings.defaultCardRate ||
            prevSettings.defaultMarketingRate !== settings.defaultMarketingRate ||
            prevSettings.monthlyFixedCosts !== settings.monthlyFixedCosts ||
            prevSettings.estimatedMonthlyProduction !== settings.estimatedMonthlyProduction ||
            prevSettings.meiDasTax !== settings.meiDasTax
        ) {
            hasChanges = true;
        }
        if (settings.serviceCosts.sewingStandard !== prevSettings.serviceCosts.sewingStandard) {
            if (input.sewingCost === prevSettings.serviceCosts.sewingStandard) {
                setInput(prev => ({ ...prev, sewingCost: settings.serviceCosts.sewingStandard }));
                hasChanges = true;
            }
        }
        if (hasChanges) {
            setSettingsChangedAlert(true);
            const timer = setTimeout(() => setSettingsChangedAlert(false), 10000);
            return () => clearTimeout(timer);
        }
        prevSettingsRef.current = settings;
    }, [settings, input.sewingCost]);

    // 2. CÁLCULO E ATUALIZAÇÃO DO CENÁRIO (DTF MANUAL)
    useEffect(() => {
        const calculatedInput = { 
            ...input, 
            embellishments: input.embellishments.map(e => ({...e})) 
        };
        
        const dtfItemIndex = calculatedInput.embellishments.findIndex(e => e.type === 'DTF');
        
        if (dtfItemIndex >= 0) {
             const totalDtfCost = dtfPrintManual + dtfAppManual;
             const unitCost = input.batchSize > 0 ? (totalDtfCost / input.batchSize) : 0;
             
             // GRAVA NA VARIÁVEL EXCLUSIVA E LIMPA SILK
             calculatedInput.embellishments[dtfItemIndex] = {
                 ...calculatedInput.embellishments[dtfItemIndex],
                 dtfManualUnitCost: unitCost, 
                 dtfMetersUsed: 0,
                 // Garante que campos de Silk sejam ignorados/zerados no cálculo
                 printColors: 0,
                 isRegraving: false,
                 printSetupCost: 0
             };
        }
        
        setResult(calculateScenario(calculatedInput, settings));
    }, [input, settings, dtfPrintManual, dtfAppManual]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setInput(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const blockDecimals = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
    };

    const addEmbellishment = () => {
      const newId = Math.random().toString(36).substr(2, 9);
      // CORREÇÃO CRÍTICA: silkSize 'SMALL' (não CUSTOM) ativa o cálculo automático
      setInput(prev => ({ ...prev, embellishments: [...prev.embellishments, { id: newId, type: 'SILK', silkSize: 'SMALL', printColors: 1 }] }));
    };

    const removeEmbellishment = (id: string) => {
      setInput(prev => ({ ...prev, embellishments: prev.embellishments.filter(i => i.id !== id) }));
    };

    const updateEmbellishment = (id: string, field: keyof Embellishment, value: string | number | boolean) => {
        setInput(prev => {
            const updatedList = prev.embellishments.map(item => {
                if (item.id !== id) return item;
                
                // 1. Tratamento de Inteiros (Cores e Milheiros)
                let cleanValue = value;
                if (field === 'printColors' || field === 'embroideryStitchCount') {
                    cleanValue = typeof value === 'string' ? parseInt(value) || 0 : Math.floor(value as number);
                    if (cleanValue < 1 && field === 'printColors') cleanValue = 1;
                }

                const newItem = { ...item, [field]: cleanValue };

                // 2. Lógica de Reset ao Trocar Tipo
                if (field === 'type') {
                    if (value === 'DTF') {
                        // Limpa dados de Silk
                        newItem.printSetupCost = 0; 
                        newItem.printPassCost = 0;
                        newItem.printColors = 0;
                    } else if (value === 'SILK') {
                        // Reseta para padrão Silk
                        newItem.dtfManualUnitCost = 0;
                        newItem.printColors = 1;
                        newItem.silkSize = 'SMALL'; // Garante cálculo automático
                    }
                }

                // 3. Recálculo Automático do Preço Silk
                if (newItem.type === 'SILK' && newItem.silkSize !== 'CUSTOM') {
                    const table = newItem.silkSize === 'SMALL' ? settings.silkPrices.small : settings.silkPrices.large;
                    
                    const colors = newItem.printColors || 1;
                    const extraColors = Math.max(0, colors - 1);
                    
                    newItem.printSetupCost = newItem.isRegraving ? table.screenRemake : table.screenNew;
                    newItem.printPassCost = table.firstColor + (extraColors * table.extraColor);
                }
                
                return newItem;
            });
            return { ...prev, embellishments: updatedList };
        });
    };

    const handleExportXLS = () => {
      if (!result) return;
      const productName = input.productCategory === 'Outro' ? input.customProductName : input.productCategory;
      const ws_data = [
          ["SOW PRICE REPORT", ""], ["Data Simulação", new Date().toLocaleDateString()], ["Produto", productName],
          ["CUSTOS INDUSTRIAIS", "VALOR (R$)"], ["Matéria-Prima", result.materialUnit],
          ["Risco & Corte", result.plotterUnit + result.cuttingLaborUnit], ["Beneficiamento", result.processingUnit],
          ["Confecção", result.sewingUnit], ["Custo Total", result.totalProductionCost],
          ["", ""], ["RESULTADOS", ""],
          ["Preço Sugerido", result.suggestedSalePrice], ["Lucro Líquido", result.netProfitUnit]
      ];
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Precificacao");
      XLSX.writeFile(wb, `SowPrice_${productName}.xlsx`);
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
    const getSelectionButtonClass = (isActive: boolean) => `flex-1 py-2.5 text-xs font-montserrat font-bold rounded-lg border transition-all duration-200 ${isActive ? 'bg-sow-black text-white border-sow-black shadow-md' : 'bg-white text-sow-grey border-sow-border hover:bg-gray-50'}`;

    const hasDTFSelection = input.embellishments.some(e => e.type === 'DTF');

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
        {/* COLUNA ESQUERDA: INPUTS */}
        <div className="lg:col-span-5 space-y-4 overflow-y-auto pr-2 pb-24 h-full scrollbar-thin">
            
            <div className="bg-white p-5 rounded-xl border border-sow-border shadow-soft">
                <div className="flex items-center gap-2 mb-4 text-sow-black border-b border-sow-border pb-2"><Tag className="w-4 h-4 text-sow-green" /><h3 className="font-helvetica font-bold text-sm uppercase tracking-wider">Definição do Produto</h3></div>
                <div className="space-y-3">
                    <InputGroup label="Tipo de Peça" name="productCategory" value={input.productCategory} onChange={handleChange} type="select" options={PRODUCT_CATEGORIES.map(cat => ({ label: cat, value: cat }))} />
                    {input.productCategory === 'Outro' && <InputGroup label="Nome Personalizado" name="customProductName" value={input.customProductName} onChange={handleChange} type="text" />}
                    <div className="grid grid-cols-2 gap-3">
                        <InputGroup label="Qtd. do Lote (Peças)" name="batchSize" value={input.batchSize} onChange={handleChange} type="number" step="1" min="1" onKeyDown={blockDecimals} />
                        <InputGroup label="Pilotagem (Custo Total)" name="pilotingCost" value={input.pilotingCost} onChange={handleChange} type="number" prefix="R$" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-sow-border shadow-soft">
              <div className="flex items-center gap-2 mb-4 text-sow-black border-b border-sow-border pb-2"><Package className="w-4 h-4 text-sow-green" /><h3 className="font-helvetica font-bold text-sm uppercase tracking-wider">1. Matéria-Prima & Corte</h3></div>
              <div className="grid grid-cols-2 gap-3">
                  <InputGroup label="Preço Malha" name="fabricPricePerKg" value={input.fabricPricePerKg} onChange={handleChange} type="number" prefix="R$" suffix="/kg" />
                  <InputGroup label="Rendimento" name="piecesPerKg" value={input.piecesPerKg} onChange={handleChange} type="number" suffix="pçs/kg" step="0.1" />
                  
                  <InputGroup label="Preço Ribana" name="ribanaPricePerKg" value={input.ribanaPricePerKg} onChange={handleChange} type="number" prefix="R$" suffix="/kg" />
                  <InputGroup label="Rend. Ribana" name="ribanaYield" value={input.ribanaYield} onChange={handleChange} type="number" suffix="pçs/kg" step="0.1" />

                  <InputGroup label="Larg. Malha (m)" name="fabricWidth" value={input.fabricWidth || 0} onChange={handleChange} type="number" step="0.01" suffix="m" />
                  <InputGroup label="Perda Corte" name="lossPercentage" value={input.lossPercentage} onChange={handleChange} type="number" suffix="%" />
                  
                  <div className="col-span-2 border-t border-sow-border pt-3 mt-1">
                      <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Método de Corte</label>
                          <div className="flex gap-2 mb-2">
                              <button onClick={() => setInput(prev => ({...prev, cuttingType: 'MANUAL_RISCO'}))} className={getSelectionButtonClass(input.cuttingType === 'MANUAL_RISCO')}>Manual (s/ papel)</button>
                              <button onClick={() => setInput(prev => ({...prev, cuttingType: 'MANUAL_PLOTTER'}))} className={getSelectionButtonClass(input.cuttingType === 'MANUAL_PLOTTER')}>Plotter (c/ papel)</button>
                          </div>
                      </div>
                      
                      {input.cuttingType === 'MANUAL_PLOTTER' && (
                          <div className="bg-sow-light p-3 rounded-lg border border-sow-border grid grid-cols-2 gap-3 animate-fade-in">
                              <InputGroup label="Total Metros Risco" name="plotterMetersTotal" value={input.plotterMetersTotal} onChange={handleChange} type="number" suffix="m" />
                              <InputGroup label="Frete Papel" name="plotterFreight" value={input.plotterFreight} onChange={handleChange} type="number" prefix="R$" />
                          </div>
                      )}
                  </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-sow-border shadow-soft">
              <div className="flex items-center justify-between mb-4 border-b border-sow-border pb-2">
                  <div className="flex items-center gap-2 text-sow-black"><Layers className="w-4 h-4 text-sow-green" /><h3 className="font-helvetica font-bold text-sm uppercase tracking-wider">2. Beneficiamento</h3></div>
                  <button onClick={addEmbellishment} className="text-sow-green hover:text-sow-black transition-colors"><PlusCircle className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                  {input.embellishments.length === 0 && <p className="text-xs text-sow-grey italic text-center py-3 bg-sow-light rounded-lg">Peça Lisa (Sem estampas).</p>}
                  {input.embellishments.map((item, index) => (
                      <div key={item.id} className="bg-sow-light p-3 rounded-lg border border-sow-border relative group">
                          <button onClick={() => removeEmbellishment(item.id)} className="absolute top-2 right-2 text-sow-grey/50 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          
                          <div className="mb-3 pr-6">
                              <label className="text-[11px] font-bold text-sow-grey uppercase block mb-1">Tipo</label>
                              <select value={item.type} onChange={(e) => updateEmbellishment(item.id, 'type', e.target.value)} className="w-full bg-sow-white border border-sow-border text-sm rounded-lg p-2 font-bold">
                                  <option value="SILK">Silk Screen</option><option value="DTF">DTF (Digital)</option><option value="BORDADO">Bordado</option>
                              </select>
                          </div>

                          {item.type === 'DTF' ? (
                              <div className="bg-purple-50 border border-purple-200 rounded p-3">
                                  <div className="flex items-center gap-2 text-purple-700 font-bold text-xs mb-3 border-b border-purple-200 pb-2">
                                      <CheckCircle2 className="w-4 h-4" /> <span>Integrado com Otimizador</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 mb-2">
                                      <div>
                                          <label className="text-[10px] font-bold text-purple-800 uppercase block mb-1">Custo Impressão (Total Lote)</label>
                                          <div className="relative">
                                              <span className="absolute left-2 top-1.5 text-xs text-gray-500 font-bold">R$</span>
                                              <input type="number" value={dtfPrintManual || ''} onChange={(e) => setDtfPrintManual(parseFloat(e.target.value))} className="w-full pl-7 p-1.5 text-sm border border-purple-300 rounded font-bold text-gray-700 focus:outline-none focus:border-purple-500"/>
                                          </div>
                                      </div>
                                      <div>
                                          <label className="text-[10px] font-bold text-purple-800 uppercase block mb-1">Custo Aplicação (Total Lote)</label>
                                          <div className="relative">
                                              <span className="absolute left-2 top-1.5 text-xs text-gray-500 font-bold">R$</span>
                                              <input type="number" value={dtfAppManual || ''} onChange={(e) => setDtfAppManual(parseFloat(e.target.value))} className="w-full pl-7 p-1.5 text-sm border border-purple-300 rounded font-bold text-gray-700 focus:outline-none focus:border-purple-500"/>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="text-[10px] text-purple-400 italic text-center">Copie os valores do painel ao lado</div>
                              </div>
                          ) : (
                              item.type === 'SILK' ? (
                                  <div className="grid grid-cols-2 gap-3">
                                      <InputGroup label="Nº Cores" name={`colors_${item.id}`} value={item.printColors || 1} onChange={(e) => updateEmbellishment(item.id, 'printColors', e.target.value)} type="number" step="1" />
                                      <div className="flex items-center pt-5"><label className="flex gap-2 text-xs font-bold text-sow-grey"><input type="checkbox" checked={item.isRegraving || false} onChange={(e) => updateEmbellishment(item.id, 'isRegraving', e.target.checked)} /> Regravação?</label></div>
                                  </div>
                              ) : (
                                  <div className="grid grid-cols-2 gap-3">
                                      <InputGroup label="Milheiros" name={`emb_stitch_${item.id}`} value={item.embroideryStitchCount || 0} onChange={(e) => updateEmbellishment(item.id, 'embroideryStitchCount', e.target.value)} type="number" step="1" />
                                      <InputGroup label="Valor/Mil" name={`emb_cost_${item.id}`} value={item.embroideryCostPerThousand || 0} onChange={(e) => updateEmbellishment(item.id, 'embroideryCostPerThousand', parseFloat(e.target.value))} type="number" prefix="R$" />
                                  </div>
                              )
                          )}
                      </div>
                  ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-sow-border shadow-soft">
               <div className="flex items-center gap-2 mb-4 text-sow-black border-b border-sow-border pb-2"><Truck className="w-4 h-4 text-sow-green" /><h3 className="font-helvetica font-bold text-sm uppercase tracking-wider">3. Confecção & Logística</h3></div>
               <div className="grid grid-cols-2 gap-3">
                   <InputGroup label="Costura (Un)" name="sewingCost" value={input.sewingCost} onChange={handleChange} type="number" prefix="R$" />
                   <InputGroup label="Revisão/Acab." name="finishingCost" value={input.finishingCost} onChange={handleChange} type="number" prefix="R$" />
                   
                   <InputGroup label="Aviamentos (Un)" name="aviamentosCost" value={input.aviamentosCost} onChange={handleChange} type="number" prefix="R$" />
                   <InputGroup label="Embalagem (Un)" name="packagingCost" value={input.packagingCost} onChange={handleChange} type="number" prefix="R$" />
                   
                   <div className="col-span-2 bg-sow-light p-3 rounded-lg border border-sow-border grid grid-cols-2 gap-3">
                       <InputGroup label="Logística (Entrada)" name="logisticsTotalCost" value={input.logisticsTotalCost} onChange={handleChange} type="number" prefix="R$" />
                       <InputGroup label="Frete Saída (Cliente)" name="freightOutCost" value={input.freightOutCost} onChange={handleChange} type="number" prefix="R$" />
                   </div>
               </div>
            </div>

            <div className="bg-white p-5 rounded-xl border-l-4 border-l-sow-green shadow-soft">
               <div className="flex items-center gap-2 mb-4 text-sow-black border-b border-sow-border pb-2"><TrendingUp className="w-4 h-4 text-sow-green" /><h3 className="font-helvetica font-bold text-sm uppercase tracking-wider">4. Estratégia</h3></div>
               <InputGroup label="Margem Líquida Desejada" name="targetMargin" value={input.targetMargin} onChange={handleChange} type="number" suffix="%" />
            </div>
        </div>

        <div className="lg:col-span-7 h-full flex flex-col overflow-y-auto pb-24 px-1 scrollbar-thin">
            
            {hasDTFSelection && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6 h-[600px] flex flex-col">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Printer className="w-4 h-4" /> Painel de Produção DTF</span>
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">Modo Edição</span>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 p-2">
                            <DTFCalculator settings={settings} />
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {settingsChangedAlert && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start justify-between shadow-sm animate-fade-in-down">
                        <div className="flex gap-3">
                            <div className="bg-blue-100 p-2 rounded-full h-fit">
                                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin-slow" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-800">Taxas ou Custos Globais Atualizados!</h4>
                                <p className="text-xs text-blue-600 mt-1">O cálculo de preço foi ajustado automaticamente para refletir as novas configurações.</p>
                            </div>
                        </div>
                        <button onClick={() => setSettingsChangedAlert(false)} className="text-blue-400 hover:text-blue-600 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <PriceCard result={result} productName={input.customProductName} category={input.productCategory} taxRegime={settings.taxRegime} />
                <button onClick={handleExportXLS} className="w-full py-4 bg-white border border-sow-border hover:border-sow-green text-sow-black hover:text-sow-green font-montserrat font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-soft group mt-2"><Download className="w-5 h-5 text-sow-grey group-hover:text-sow-green transition-colors" /><span>Exportar Planilha (XLS)</span></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pb-6">
                <div className="bg-white rounded-xl p-6 border border-sow-border shadow-soft flex flex-col">
                    <h3 className="text-xs font-helvetica font-bold uppercase text-sow-grey mb-6 tracking-wider">Composição do Preço</h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: '#fff', borderColor: '#E5E5E5', color: '#000', borderRadius: '8px', fontFamily: 'Montserrat', fontWeight: 500 }} />
                                <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', fontFamily: 'Montserrat', paddingTop: '16px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-sow-border shadow-soft flex flex-col h-auto">
                    <h3 className="text-xs font-helvetica font-bold uppercase text-sow-grey mb-4 tracking-wider">Detalhamento Contábil</h3>
                    <div className="w-full">
                        <table className="w-full text-sm text-left"><tbody className="divide-y divide-sow-border font-montserrat font-medium text-sow-black">
                            <tr><td className="py-2 text-[11px] uppercase text-sow-grey tracking-wide">Matéria-Prima</td><td className="py-2 text-right">{result ? formatCurrency(result.materialUnit) : '-'}</td></tr>
                            <tr><td className="py-2 text-[11px] uppercase text-sow-grey tracking-wide">Corte & Risco</td><td className="py-2 text-right">{result ? formatCurrency(result.plotterUnit + result.cuttingLaborUnit) : '-'}</td></tr>
                            <tr><td className="py-2 text-[11px] uppercase text-sow-grey tracking-wide">Beneficiamento</td><td className="py-2 text-right">{result ? formatCurrency(result.processingUnit) : '-'}</td></tr>
                            <tr><td className="py-2 text-[11px] uppercase text-sow-grey tracking-wide">Confecção</td><td className="py-2 text-right">{result ? formatCurrency(result.sewingUnit) : '-'}</td></tr>
                            <tr className="bg-sow-light font-bold text-sow-black"><td className="py-2 pl-2 text-[11px] uppercase tracking-wide">Custo Industrial</td><td className="py-2 text-right pr-2">{result ? formatCurrency(result.industrialCostUnit) : '-'}</td></tr>
                            <tr><td className="py-2 text-[11px] uppercase text-sow-grey tracking-wide">Rateio Fixo</td><td className="py-2 text-right">{result ? formatCurrency(result.fixedOverheadUnit) : '-'}</td></tr>
                            <tr className="border-t-2 border-sow-black font-bold text-base"><td className="py-3 pl-2 tracking-tight">CUSTO FINAL</td><td className="py-3 text-right pr-2">{result ? formatCurrency(result.totalProductionCost) : '-'}</td></tr>
                        </tbody></table>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
};