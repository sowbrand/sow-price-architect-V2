import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { PricingCalculator } from './views/PricingCalculator';
import { Comparator } from './views/Comparator';
import { ReverseEngineering } from './views/ReverseEngineering';
import { DTFCalculator } from './views/DTFCalculator'; 
import { Settings } from './views/Settings';
import { CalculationMode, SettingsData } from './types';

// Configurações Padrão
const DEFAULT_SETTINGS: SettingsData = {
  monthlyFixedCosts: 15000,
  estimatedMonthlyProduction: 1000,
  taxRegime: 'SIMPLES',
  defaultTaxRate: 4,
  defaultCardRate: 3.5,
  defaultMarketingRate: 5,
  defaultCommissionRate: 0,
  silkPrices: {
    small: { firstColor: 4.50, extraColor: 1.50, screenNew: 35, screenRemake: 25 },
    large: { firstColor: 6.50, extraColor: 2.50, screenNew: 55, screenRemake: 40 }
  },
  serviceCosts: {
    cuttingManual: 1.50,
    cuttingPlotter: 0.80,
    plotterPaper: 4.50,
    sewingStandard: 5.00,
    dtfPrintMeter: 60.00,
    dtfApplication: 4.00 
  }
};

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<CalculationMode>(CalculationMode.DASHBOARD);
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-montserrat">
      
      {/* CORREÇÃO: Sidebar só aparece se NÃO for Dashboard */}
      {currentMode !== CalculationMode.DASHBOARD && (
        <Sidebar currentMode={currentMode} onNavigate={setCurrentMode} />
      )}

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* PERSISTÊNCIA DE ABAS (Hidden) */}

        <div className={`h-full w-full ${currentMode === CalculationMode.DASHBOARD ? 'block' : 'hidden'}`}>
          <Dashboard 
            settings={settings} 
            onNavigate={setCurrentMode} 
          />
        </div>

        <div className={`h-full w-full ${currentMode === CalculationMode.CALCULATOR ? 'block' : 'hidden'}`}>
          <PricingCalculator settings={settings} />
        </div>

        {/* Módulo DTF Isolado (Tela Cheia) */}
        <div className={`h-full w-full ${currentMode === CalculationMode.DTF ? 'block' : 'hidden'}`}>
           <div className="h-full p-6 bg-gray-50">
             <div className="bg-white h-full rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <DTFCalculator settings={settings} />
             </div>
          </div>
        </div>

        <div className={`h-full w-full ${currentMode === CalculationMode.COMPARATOR ? 'block' : 'hidden'}`}>
          <Comparator settings={settings} />
        </div>

        <div className={`h-full w-full ${currentMode === CalculationMode.REVERSE ? 'block' : 'hidden'}`}>
          <ReverseEngineering settings={settings} />
        </div>

        <div className={`h-full w-full ${currentMode === CalculationMode.SETTINGS ? 'block' : 'hidden'}`}>
          <Settings 
            data={settings} 
            onSave={(newSettings) => {
              setSettings(newSettings);
              alert('Configurações salvas!');
            }} 
          />
        </div>

      </main>
    </div>
  );
}

export default App;