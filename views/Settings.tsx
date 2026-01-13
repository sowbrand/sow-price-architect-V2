import React, { useState } from 'react';
import { Settings, Database } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import type { SettingsData } from '../types';

interface SettingsViewProps {
  settings: SettingsData;
  updateSettings: (newSettings: SettingsData) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, updateSettings }) => {
    const [activeTab, setActiveTab] = useState<'GLOBAL' | 'DB'>('GLOBAL');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        updateSettings({ ...settings, [name]: type === 'number' ? parseFloat(value) || 0 : value });
    };

    const handleServiceChange = (field: keyof typeof settings.serviceCosts, value: number) => {
        updateSettings({ ...settings, serviceCosts: { ...settings.serviceCosts, [field]: value } });
    };

    const handleSilkChange = (size: 'small' | 'large', field: string, value: number) => {
        updateSettings({
            ...settings,
            silkPrices: {
                ...settings.silkPrices,
                [size]: { ...settings.silkPrices[size], [field]: value }
            }
        });
    };

    // CORREÇÃO DE CONTRASTE: Botão inativo agora tem borda cinza e texto cinza escuro
    const getTabClass = (isActive: boolean) => 
        `px-6 py-3 rounded-lg font-montserrat font-bold text-sm transition-all border ${
            isActive 
            ? 'bg-sow-green text-white border-sow-green shadow-md' 
            : 'bg-white text-sow-grey border-gray-300 hover:bg-gray-50' // Borda mais visível
        }`;

    const getRegimeClass = (isActive: boolean) => 
        `flex-1 p-3 text-sm font-montserrat font-bold rounded-lg border transition-all ${
            isActive 
            ? 'bg-sow-black text-white border-sow-black shadow-md' 
            : 'bg-white text-sow-grey border-gray-300 hover:bg-gray-50'
        }`;

    return (
        <div className="max-w-5xl mx-auto h-full overflow-y-auto pr-2 font-sans pb-24 scrollbar-thin">
            <div className="flex items-center gap-4 mb-8 border-b border-sow-border pb-6">
                <div className="p-3 bg-white border border-sow-border rounded-xl shadow-soft"><Settings className="w-6 h-6 text-sow-green" /></div>
                <div><h2 className="text-2xl font-helvetica font-bold text-sow-black">Configurações</h2><p className="text-sow-grey text-sm mt-1 font-montserrat">Gerencie custos fixos e tabelas de preços de fornecedores.</p></div>
            </div>

            <div className="flex gap-4 mb-8">
                <button onClick={() => setActiveTab('GLOBAL')} className={getTabClass(activeTab === 'GLOBAL')}>Global & Impostos</button>
                <button onClick={() => setActiveTab('DB')} className={`${getTabClass(activeTab === 'DB')} flex items-center gap-2`}><Database className="w-4 h-4"/> Banco de Preços (2026)</button>
            </div>

            {activeTab === 'GLOBAL' ? (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-white rounded-xl p-8 border border-sow-border shadow-soft">
                        <h3 className="text-lg font-helvetica font-bold text-sow-black mb-6 border-l-4 border-sow-green pl-3">Custos Fixos da Empresa</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputGroup label="Custo Fixo Mensal Total" name="monthlyFixedCosts" value={settings.monthlyFixedCosts} onChange={handleChange} type="number" prefix="R$" step="100" />
                            <InputGroup label="Produção Estimada (peças/mês)" name="estimatedMonthlyProduction" value={settings.estimatedMonthlyProduction} onChange={handleChange} type="number" step="100" suffix="pçs" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-8 border border-sow-border shadow-soft">
                        <h3 className="text-lg font-helvetica font-bold text-sow-black mb-6 border-l-4 border-red-400 pl-3">Impostos & Taxas</h3>
                         <div className="flex gap-4 mb-6">
                            <button onClick={() => updateSettings({...settings, taxRegime: 'SIMPLES'})} className={getRegimeClass(settings.taxRegime === 'SIMPLES')}>Simples Nacional</button>
                            <button onClick={() => updateSettings({...settings, taxRegime: 'MEI'})} className={getRegimeClass(settings.taxRegime === 'MEI')}>MEI</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className={settings.taxRegime === 'MEI' ? 'opacity-50 pointer-events-none' : ''}><InputGroup label="Imposto Venda (%)" name="defaultTaxRate" value={settings.defaultTaxRate} onChange={handleChange} type="number" suffix="%" /></div>
                            <InputGroup label="Taxa Cartão" name="defaultCardRate" value={settings.defaultCardRate} onChange={handleChange} type="number" suffix="%" />
                            <InputGroup label="Marketing" name="defaultMarketingRate" value={settings.defaultMarketingRate} onChange={handleChange} type="number" suffix="%" />
                            <InputGroup label="Comissão" name="defaultCommissionRate" value={settings.defaultCommissionRate} onChange={handleChange} type="number" suffix="%" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-white rounded-xl p-8 border border-sow-border shadow-soft">
                        <h3 className="text-lg font-helvetica font-bold text-sow-black mb-6 border-l-4 border-indigo-500 pl-3">Corte, Costura & DTF</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <InputGroup label="Corte Manual (Un)" name="c_man" value={settings.serviceCosts.cuttingManual} onChange={(e) => handleServiceChange('cuttingManual', parseFloat(e.target.value))} type="number" prefix="R$" />
                            <InputGroup label="Corte Plotter (Un)" name="c_plot" value={settings.serviceCosts.cuttingPlotter} onChange={(e) => handleServiceChange('cuttingPlotter', parseFloat(e.target.value))} type="number" prefix="R$" />
                            <InputGroup label="Papel Risco (Metro)" name="p_pap" value={settings.serviceCosts.plotterPaper} onChange={(e) => handleServiceChange('plotterPaper', parseFloat(e.target.value))} type="number" prefix="R$" />
                            <InputGroup label="Costura Padrão" name="sew" value={settings.serviceCosts.sewingStandard} onChange={(e) => handleServiceChange('sewingStandard', parseFloat(e.target.value))} type="number" prefix="R$" />
                            <InputGroup label="DTF (Impressão/m)" name="dtf_p" value={settings.serviceCosts.dtfPrintMeter} onChange={(e) => handleServiceChange('dtfPrintMeter', parseFloat(e.target.value))} type="number" prefix="R$" />
                            <InputGroup label="DTF (Aplicação/un)" name="dtf_a" value={settings.serviceCosts.dtfApplication} onChange={(e) => handleServiceChange('dtfApplication', parseFloat(e.target.value))} type="number" prefix="R$" />
                        </div>
                    </div>
                    {/* (Restante do código igual...) */}
                </div>
            )}
        </div>
    );
};