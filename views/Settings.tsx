import * as React from 'react';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import type { SettingsData } from '../types';

interface SettingsProps {
  data: SettingsData;
  onSave: (newSettings: SettingsData) => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<SettingsData>(data);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(data);
    setHasChanges(false);
  }, [data]);

  const handleChange = (section: keyof SettingsData, field: string | null, value: any) => {
    setFormData(prev => {
      if (field && typeof prev[section] === 'object') {
        return {
          ...prev,
          [section]: {
            ...prev[section] as any,
            [field]: value
          }
        };
      }
      
      if (section === 'taxRegime' && value === 'MEI' && !prev.meiDasTax) {
          return { ...prev, taxRegime: value, meiDasTax: 75.00 };
      }

      return { ...prev, [section]: value };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  return (
    <div className="h-full flex flex-col font-montserrat bg-gray-50 overflow-y-auto p-6 scrollbar-thin">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-helvetica font-bold text-sow-black">Configurações Globais</h2>
          <p className="text-sm text-sow-grey">Defina os parâmetros base para todos os cálculos.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            hasChanges 
              ? 'bg-sow-green text-white shadow-lg hover:shadow-xl hover:scale-105' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-5 h-5" /> Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        
        <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft">
          <h3 className="font-bold text-sow-black mb-4 uppercase text-sm border-b pb-2">Estrutura da Empresa</h3>
          <div className="space-y-4">
            <InputGroup label="Custos Fixos Mensais" name="fixed" value={formData.monthlyFixedCosts} onChange={(e) => handleChange('monthlyFixedCosts', null, parseFloat(e.target.value))} type="number" prefix="R$" />
            <InputGroup label="Capacidade Produtiva (Peças/Mês)" name="prod" value={formData.estimatedMonthlyProduction} onChange={(e) => handleChange('estimatedMonthlyProduction', null, parseFloat(e.target.value))} type="number" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft">
          <h3 className="font-bold text-sow-black mb-4 uppercase text-sm border-b pb-2">Financeiro & Comercial</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Regime Tributário</label>
                 <select 
                    value={formData.taxRegime}
                    onChange={(e) => handleChange('taxRegime', null, e.target.value)}
                    className="w-full h-[42px] px-3 border border-gray-300 rounded-lg font-bold text-gray-700 bg-white focus:outline-none focus:border-green-500 transition-colors text-sm"
                 >
                   <option value="SIMPLES">Simples Nacional</option>
                   <option value="MEI">MEI (Microempreendedor)</option>
                 </select>
               </div>
               
               {formData.taxRegime === 'MEI' ? (
                   <InputGroup 
                      label="Taxa Mensal DAS" 
                      name="meiDas" 
                      value={formData.meiDasTax || 0} 
                      onChange={(e) => handleChange('meiDasTax', null, parseFloat(e.target.value))} 
                      type="number" 
                      prefix="R$" 
                   />
               ) : (
                   <InputGroup 
                      label="Imposto Médio (%)" 
                      name="tax" 
                      value={formData.defaultTaxRate} 
                      onChange={(e) => handleChange('defaultTaxRate', null, parseFloat(e.target.value))} 
                      type="number" 
                      suffix="%" 
                   />
               )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
               <InputGroup label="Taxa Cartão" name="card" value={formData.defaultCardRate} onChange={(e) => handleChange('defaultCardRate', null, parseFloat(e.target.value))} type="number" suffix="%" />
               <InputGroup label="Marketing" name="mkt" value={formData.defaultMarketingRate} onChange={(e) => handleChange('defaultMarketingRate', null, parseFloat(e.target.value))} type="number" suffix="%" />
               <InputGroup label="Comissão" name="com" value={formData.defaultCommissionRate} onChange={(e) => handleChange('defaultCommissionRate', null, parseFloat(e.target.value))} type="number" suffix="%" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft lg:col-span-2">
          <h3 className="font-bold text-sow-black mb-4 uppercase text-sm border-b pb-2">Custos de Serviços (Mão de Obra e Insumos)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-3">
                <span className="text-xs font-bold text-purple-600 block">Corte & Risco</span>
                <InputGroup label="Corte Manual s/ Plotter (Un)" name="cutM" value={formData.serviceCosts.cuttingManual} onChange={(e) => handleChange('serviceCosts', 'cuttingManual', parseFloat(e.target.value))} type="number" prefix="R$" />
                <InputGroup label="Corte Manual c/ Plotter (Un)" name="cutMP" value={formData.serviceCosts.cuttingManualPlotter} onChange={(e) => handleChange('serviceCosts', 'cuttingManualPlotter', parseFloat(e.target.value))} type="number" prefix="R$" />
                <InputGroup label="Papel Plotter (Metro)" name="pap" value={formData.serviceCosts.plotterPaper} onChange={(e) => handleChange('serviceCosts', 'plotterPaper', parseFloat(e.target.value))} type="number" prefix="R$" />
             </div>
             
             {/* CAMPOS NOVOS PARA DTF */}
             <div className="space-y-3">
                <span className="text-xs font-bold text-purple-600 block">DTF</span>
                <InputGroup label="Custo Impressão (Metro)" name="dtfP" value={formData.serviceCosts.dtfPrintMeter} onChange={(e) => handleChange('serviceCosts', 'dtfPrintMeter', parseFloat(e.target.value))} type="number" prefix="R$" />
                <div className="grid grid-cols-2 gap-2">
                    <InputGroup label="Aplic. (Até limite)" name="dtfR" value={formData.serviceCosts.dtfAppRetail} onChange={(e) => handleChange('serviceCosts', 'dtfAppRetail', parseFloat(e.target.value))} type="number" prefix="R$" />
                    <InputGroup label="Aplic. (Acima limite)" name="dtfW" value={formData.serviceCosts.dtfAppWholesale} onChange={(e) => handleChange('serviceCosts', 'dtfAppWholesale', parseFloat(e.target.value))} type="number" prefix="R$" />
                </div>
                <InputGroup label="Limite Quantidade" name="dtfL" value={formData.serviceCosts.dtfWholesaleLimit} onChange={(e) => handleChange('serviceCosts', 'dtfWholesaleLimit', parseFloat(e.target.value))} type="number" />
             </div>
             
             <div className="space-y-3">
                <span className="text-xs font-bold text-purple-600 block">Confecção</span>
                <InputGroup label="Costura Padrão (Un)" name="sew" value={formData.serviceCosts.sewingStandard} onChange={(e) => handleChange('serviceCosts', 'sewingStandard', parseFloat(e.target.value))} type="number" prefix="R$" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};