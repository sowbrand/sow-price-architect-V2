
import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import { calculateScenario, formatCurrency } from '../utils/pricingEngine';
import { INITIAL_PRODUCT } from '../types';
import type { SettingsData, ProductInput } from '../types';

interface ComparatorProps {
  settings: SettingsData;
}

export const Comparator: React.FC<ComparatorProps> = ({ settings }) => {
    const [scenarioA, setScenarioA] = useState<ProductInput>({ ...INITIAL_PRODUCT, embellishments: [{ id: 'a', type: 'SILK', printColors: 1, printSetupCost: 40, printPassCost: 1.5 }] });
    const [scenarioB, setScenarioB] = useState<ProductInput>({ ...INITIAL_PRODUCT, batchSize: 50, embellishments: [{ id: 'b', type: 'DTG', dtgPrintCost: 15, dtgPretreatmentCost: 2 }] });

    const resA = calculateScenario(scenarioA, settings);
    const resB = calculateScenario(scenarioB, settings);
    const bestMargin = resA.netProfitUnit > resB.netProfitUnit ? 'A' : 'B';

    const handleScenarioChange = (setter: React.Dispatch<React.SetStateAction<ProductInput>>, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const numValue = type === 'number' ? parseFloat(value) || 0 : value;
        setter(prev => {
            const newEmbellishments = [...prev.embellishments];
            if (newEmbellishments.length === 0) newEmbellishments.push({ id: Math.random().toString(), type: 'SILK' });
            const firstEmb = { ...newEmbellishments[0] };
            
            if (name === 'printType') {
                firstEmb.type = value as 'SILK' | 'BORDADO' | 'DTG';
            } else if (name === 'printSetupCost') {
                firstEmb.printSetupCost = numValue as number;
            } else if (name === 'printColors') {
                firstEmb.printColors = numValue as number;
            } else if (name === 'printPassCost') {
                firstEmb.printPassCost = numValue as number;
            } else if (name === 'embroideryStitchCount') {
                firstEmb.embroideryStitchCount = numValue as number;
            } else if (name === 'embroideryCostPerThousand') {
                firstEmb.embroideryCostPerThousand = numValue as number;
            } else if (name === 'dtgPrintCost') {
                firstEmb.dtgPrintCost = numValue as number;
            } else if (name in prev) {
                 return { ...prev, [name]: numValue };
            }

            newEmbellishments[0] = firstEmb;
            return { ...prev, embellishments: newEmbellishments };
        });
    };

    const renderScenarioInputs = (input: ProductInput, setInput: React.Dispatch<React.SetStateAction<ProductInput>>, title: string) => {
      const emb = input.embellishments[0] || { id: 'temp', type: 'SILK' };
      const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleScenarioChange(setInput, e);
      return (
        <div className="bg-white border border-sow-border rounded-xl p-6 space-y-5 shadow-sm">
          <h3 className="font-bold text-lg text-sow-dark mb-4 border-b border-sow-border pb-3 flex justify-between items-center">{title}<span className="text-xs bg-gray-100 text-sow-grey px-2 py-1 rounded font-normal">Input Rápido</span></h3>
          <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Preço Malha (R$/kg)" name="fabricPricePerKg" value={input.fabricPricePerKg} onChange={onChange} type="number" />
              <InputGroup label="Rendimento (pçs/kg)" name="piecesPerKg" value={input.piecesPerKg} onChange={onChange} type="number" step="0.1" />
              <div className="col-span-2"><InputGroup label="Tipo Beneficiamento" name="printType" value={emb.type} onChange={onChange} type="select" options={[{ label: 'Silk Screen', value: 'SILK' }, { label: 'DTG / Digital', value: 'DTG' }, { label: 'Bordado', value: 'BORDADO' }]} /></div>
              <InputGroup label="Lote (pçs)" name="batchSize" value={input.batchSize} onChange={onChange} type="number" step="1" />
              <InputGroup label="Costura + Acab." name="sewingCost" value={input.sewingCost + input.finishingCost} onChange={e => handleScenarioChange(setInput, {target:{name:'sewingCost', value: e.target.value, type:'number'}} as any)} type="number" prefix="R$" />
              {emb.type === 'SILK' && (<><InputGroup label="Custo Tela (Matriz)" name="printSetupCost" value={emb.printSetupCost || 0} onChange={onChange} type="number" prefix="R$" /><InputGroup label="Nº Cores" name="printColors" value={emb.printColors || 0} onChange={onChange} type="number" step="1" /><InputGroup label="Custo Passada" name="printPassCost" value={emb.printPassCost || 0} onChange={onChange} type="number" prefix="R$" /></>)}
              {emb.type === 'BORDADO' && (<><InputGroup label="Milheiros" name="embroideryStitchCount" value={emb.embroideryStitchCount || 0} onChange={onChange} type="number" step="0.1" /><InputGroup label="Valor Milheiro" name="embroideryCostPerThousand" value={emb.embroideryCostPerThousand || 0} onChange={onChange} type="number" prefix="R$" /></>)}
              {emb.type === 'DTG' && (<div className="col-span-2"><InputGroup label="Custo Impressão" name="dtgPrintCost" value={emb.dtgPrintCost || 0} onChange={onChange} type="number" prefix="R$" /></div>)}
          </div>
        </div>
      );
    };

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold text-sow-dark flex items-center gap-2"><Trophy className="text-amber-500" />Análise Comparativa</h2><div className="bg-white px-5 py-2 rounded-lg text-sm text-sow-grey border border-sow-border shadow-sm">Vencedor: <span className="font-bold text-sow-green ml-1">{bestMargin === 'A' ? 'Cenário A' : 'Cenário B'}</span></div></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pb-24">
            <div className="space-y-6">{renderScenarioInputs(scenarioA, setScenarioA, 'Cenário A')}<div className="bg-white rounded-xl p-6 border-t-4 border-sow-dark shadow-md"><div className="flex justify-between items-end mb-4"><span className="text-sow-grey uppercase text-xs font-bold">Preço Sugerido</span><span className="text-3xl font-mono font-bold text-sow-dark">{formatCurrency(resA.suggestedSalePrice)}</span></div><div className="space-y-3 text-sm font-mono border-t border-sow-border pt-4"><div className="flex justify-between text-sow-grey"><span>Custo Produção</span><span className="font-bold">{formatCurrency(resA.totalProductionCost)}</span></div><div className="flex justify-between text-sow-green font-bold text-lg bg-green-50 p-2 rounded"><span>Lucro Líquido</span><span>{formatCurrency(resA.netProfitUnit)}</span></div></div></div></div>
            <div className="space-y-6">{renderScenarioInputs(scenarioB, setScenarioB, 'Cenário B')}<div className="bg-white rounded-xl p-6 border-t-4 border-sow-dark shadow-md"><div className="flex justify-between items-end mb-4"><span className="text-sow-grey uppercase text-xs font-bold">Preço Sugerido</span><span className="text-3xl font-mono font-bold text-sow-dark">{formatCurrency(resB.suggestedSalePrice)}</span></div><div className="space-y-3 text-sm font-mono border-t border-sow-border pt-4"><div className="flex justify-between text-sow-grey"><span>Custo Produção</span><span className="font-bold">{formatCurrency(resB.totalProductionCost)}</span></div><div className="flex justify-between text-sow-green font-bold text-lg bg-green-50 p-2 rounded"><span>Lucro Líquido</span><span>{formatCurrency(resB.netProfitUnit)}</span></div></div></div></div>
        </div>
      </div>
    );
};
