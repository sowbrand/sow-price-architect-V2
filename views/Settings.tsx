
import React from 'react';
import { Settings } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import type { SettingsData } from '../types';

interface SettingsViewProps {
  settings: SettingsData;
  updateSettings: (newSettings: SettingsData) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, updateSettings }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        updateSettings({ ...settings, [name]: type === 'number' ? parseFloat(value) || 0 : value });
    };
    const handleRegimeChange = (regime: 'SIMPLES' | 'MEI') => {
        updateSettings({ ...settings, taxRegime: regime });
    };
    return (
        <div className="max-w-3xl mx-auto h-full overflow-y-auto pr-2 font-sans">
            <div className="flex items-center gap-4 mb-10 border-b border-sow-border pb-6">
                <div className="p-3 bg-white border border-sow-border rounded-lg shadow-sm"><Settings className="w-6 h-6 text-sow-green" /></div>
                <div><h2 className="text-2xl font-bold text-sow-dark font-helvetica">Configurações Globais</h2><p className="text-sow-grey text-sm mt-1">Parâmetros financeiros que afetam todos os cálculos.</p></div>
            </div>
            <div className="space-y-8">
                <div className="bg-white rounded-xl p-8 border border-sow-border shadow-sm">
                    <h3 className="text-lg font-bold text-sow-dark mb-6 border-l-4 border-sow-green pl-3 font-helvetica">Custos Fixos & Rateio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputGroup label="Custo Fixo Mensal Total" name="monthlyFixedCosts" value={settings.monthlyFixedCosts} onChange={handleChange} type="number" prefix="R$" step="100" />
                        <InputGroup label="Produção Estimada (peças/mês)" name="estimatedMonthlyProduction" value={settings.estimatedMonthlyProduction} onChange={handleChange} type="number" step="100" suffix="pçs" />
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between"><span className="text-sm text-sow-grey font-medium">Impacto por peça (Rateio):</span><span className="text-sow-green font-mono font-bold text-lg">{(settings.monthlyFixedCosts / (settings.estimatedMonthlyProduction || 1)).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                </div>
                <div className="bg-white rounded-xl p-8 border border-sow-border shadow-sm">
                    <h3 className="text-lg font-bold text-sow-dark mb-6 border-l-4 border-red-400 pl-3 font-helvetica">Impostos & Despesas de Venda</h3>
                    <div className="mb-6">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-sow-grey mb-2 block">Regime Tributário</label>
                        <div className="flex gap-2">
                            <button onClick={() => handleRegimeChange('SIMPLES')} className={`flex-1 p-3 text-sm font-bold rounded-md border transition-all ${settings.taxRegime === 'SIMPLES' ? 'bg-sow-dark text-white border-sow-dark shadow-md' : 'bg-white text-sow-grey border-sow-border hover:bg-gray-50'}`}>Simples Nacional / Presumido</button>
                            <button onClick={() => handleRegimeChange('MEI')} className={`flex-1 p-3 text-sm font-bold rounded-md border transition-all ${settings.taxRegime === 'MEI' ? 'bg-sow-dark text-white border-sow-dark shadow-md' : 'bg-white text-sow-grey border-sow-border hover:bg-gray-50'}`}>MEI (Imposto Fixo)</button>
                        </div>
                        {settings.taxRegime === 'MEI' && <p className="text-xs text-sow-grey mt-2 italic">* No MEI, a alíquota sobre venda será considerada 0%. Lembre-se de incluir a guia DAS nos custos fixos mensais.</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className={settings.taxRegime === 'MEI' ? 'opacity-50 pointer-events-none' : ''}><InputGroup label="Imposto (Simples/Presumido)" name="defaultTaxRate" value={settings.defaultTaxRate} onChange={handleChange} type="number" suffix="%" /></div>
                        <InputGroup label="Taxa Máquina/Gateway" name="defaultCardRate" value={settings.defaultCardRate} onChange={handleChange} type="number" suffix="%" />
                        <InputGroup label="Marketing / Ads" name="defaultMarketingRate" value={settings.defaultMarketingRate} onChange={handleChange} type="number" suffix="%" />
                        <InputGroup label="Comissão Vendedores" name="defaultCommissionRate" value={settings.defaultCommissionRate} onChange={handleChange} type="number" suffix="%" />
                    </div>
                </div>
            </div>
        </div>
    );
};
