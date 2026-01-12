import React, { useState } from 'react';
import { Settings, Database, Save } from 'lucide-react';
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

    return (
        <div className="max-w-4xl mx-auto h-full overflow-y-auto pr-2 font-sans pb-24">
            <div className="flex items-center gap-4 mb-8 border-b border-sow-border pb-6">
                <div className="p-3 bg-white border border-sow-border rounded-lg shadow-sm"><Settings className="w-6 h-6 text-sow-green" /></div>
                <div><h2 className="text-2xl font-bold text-sow-dark font-helvetica">Configurações</h2><p className="text-sow-grey text-sm mt-1">Gerencie custos fixos e tabelas de preços de fornecedores.</p></div>
            </div>

            {/* Abas */}
            <div className="flex gap-4 mb-8">
                <button onClick={() => setActiveTab('GLOBAL')} className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'GLOBAL' ? 'bg-sow-dark text-white shadow-md' : 'bg-white text-sow-grey border border-sow-border'}`}>Global & Impostos</button>
                <button onClick={() => setActiveTab('DB')} className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'DB' ? 'bg-sow-dark text-white shadow-md' : 'bg-white text-sow-grey border border-sow-border'}`}><Database className="w-4 h-4"/> Banco de Preços (2026)</button>
            </div>

            {activeTab === 'GLOBAL' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-xl p-8 border border-sow-border shadow-sm">
                        <h3 className="text-lg font-bold text-sow-dark mb-6 border-l-4 border-sow-green pl-3 font-helvetica">Custos Fixos da Empresa</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputGroup label="Custo Fixo Mensal Total" name="monthlyFixedCosts" value={settings.monthlyFixedCosts} onChange={handleChange} type="number" prefix="R$" step="100" />
                            <InputGroup label="Produção Estimada (peças/mês)" name="estimatedMonthlyProduction" value={settings.estimatedMonthlyProduction} onChange={handleChange} type="number" step="100" suffix="pçs" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-8 border border-sow-border shadow-sm">
                        <h3 className="text-lg font-bold text-sow-dark mb-6 border-l-4 border-red-400 pl-3 font-helvetica">Impostos & Taxas</h3>
                         <div className="flex gap-2 mb-6">
                            <button onClick={() => updateSettings({...settings, taxRegime: 'SIMPLES'})} className={`flex-1 p-3 text-sm font-bold rounded-md border transition-all ${settings.taxRegime === 'SIMPLES' ? 'bg-sow-dark text-white' : 'bg-white text-sow-grey'}`}>Simples Nacional</button>
                            <button onClick={() => updateSettings({...settings, taxRegime: 'MEI'})} className={`flex-1 p-3 text-sm font-bold rounded-md border transition-all ${settings.taxRegime === 'MEI' ? 'bg-sow-dark text-white' : 'bg-white text-sow-grey'}`}>MEI</button>
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
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Tabela de Serviços Gerais */}
                    <div className="bg-white rounded-xl p-8 border border-sow-border shadow-sm">
                        <h3 className="text-lg font-bold text-sow-dark mb-6 border-l-4 border-indigo-500 pl-3 font-helvetica">Corte, Costura & DTF</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <InputGroup label="Corte Manual (Un)" name="c_man" value={settings.serviceCosts.cuttingManual} onChange={(e) => handleServiceChange('cuttingManual', parseFloat(e.target.value))} type="number" prefix="R$" />
                            <InputGroup label="Corte Plotter (Un)" name="c_plot" value={settings.serviceCosts.cuttingPlotter} onChange={(e) => handleServiceChange('cuttingPlotter', parseFloat(e.target.value))} type="number" prefix="R$" />
                            <InputGroup label="Papel Risco (Metro)" name="p_pap" value={settings.serviceCosts.plotterPaper} onChange={(e) => handleServiceChange('plotterPaper', parseFloat(e.target.value))} type="number" prefix="R$" />
                            <InputGroup label="Costura Padrão" name="sew" value={settings.serviceCosts.sewingStandard} onChange={(e) => handleServiceChange('sewingStandard', parseFloat(e.target.value))} type="number" prefix="R$" />
                            <InputGroup label="DTF (Impressão/m)" name="dtf_p" value={settings.serviceCosts.dtfPrintMeter} onChange={(e) => handleServiceChange('dtfPrintMeter', parseFloat(e.target.value))} type="number" prefix="R$" />
                            <InputGroup label="DTF (Aplicação/un)" name="dtf_a" value={settings.serviceCosts.dtfApplication} onChange={(e) => handleServiceChange('dtfApplication', parseFloat(e.target.value))} type="number" prefix="R$" />
                        </div>
                    </div>

                    {/* Tabela Silk 2026 */}
                    <div className="bg-white rounded-xl p-8 border border-sow-border shadow-sm">
                         <h3 className="text-lg font-bold text-sow-dark mb-6 border-l-4 border-pink-500 pl-3 font-helvetica">Tabela Silk Screen (2026)</h3>
                         
                         <div className="mb-8">
                             <h4 className="text-sm font-bold uppercase text-sow-grey mb-4 bg-gray-50 p-2 rounded">Estampa Pequena (até 5x10)</h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 <InputGroup label="1ª Cor (Passada)" name="sp_1" value={settings.silkPrices.small.firstColor} onChange={(e) => handleSilkChange('small', 'firstColor', parseFloat(e.target.value))} type="number" prefix="R$" />
                                 <InputGroup label="Cor Adicional" name="sp_ex" value={settings.silkPrices.small.extraColor} onChange={(e) => handleSilkChange('small', 'extraColor', parseFloat(e.target.value))} type="number" prefix="R$" />
                                 <InputGroup label="Tela Nova" name="sp_nw" value={settings.silkPrices.small.screenNew} onChange={(e) => handleSilkChange('small', 'screenNew', parseFloat(e.target.value))} type="number" prefix="R$" />
                                 <InputGroup label="Regravação" name="sp_re" value={settings.silkPrices.small.screenRemake} onChange={(e) => handleSilkChange('small', 'screenRemake', parseFloat(e.target.value))} type="number" prefix="R$" />
                             </div>
                         </div>

                         <div>
                             <h4 className="text-sm font-bold uppercase text-sow-grey mb-4 bg-gray-50 p-2 rounded">Estampa Grande ({'>'} 5x10)</h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 <InputGroup label="1ª Cor (Passada)" name="lp_1" value={settings.silkPrices.large.firstColor} onChange={(e) => handleSilkChange('large', 'firstColor', parseFloat(e.target.value))} type="number" prefix="R$" />
                                 <InputGroup label="Cor Adicional" name="lp_ex" value={settings.silkPrices.large.extraColor} onChange={(e) => handleSilkChange('large', 'extraColor', parseFloat(e.target.value))} type="number" prefix="R$" />
                                 <InputGroup label="Tela Nova" name="lp_nw" value={settings.silkPrices.large.screenNew} onChange={(e) => handleSilkChange('large', 'screenNew', parseFloat(e.target.value))} type="number" prefix="R$" />
                                 <InputGroup label="Regravação" name="lp_re" value={settings.silkPrices.large.screenRemake} onChange={(e) => handleSilkChange('large', 'screenRemake', parseFloat(e.target.value))} type="number" prefix="R$" />
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};