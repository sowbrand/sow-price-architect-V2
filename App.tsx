import * as React from 'react';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { PricingCalculator } from './views/PricingCalculator';
import { Comparator } from './views/Comparator';
import { ReverseEngineering } from './views/ReverseEngineering';
import { DTFCalculator } from './views/DTFCalculator'; 
import { Settings } from './views/Settings';
import { CalculationMode, SettingsData } from './types';

// Configurações Padrão (ATUALIZADO ETAPA 1)
const DEFAULT_SETTINGS: SettingsData = {
  monthlyFixedCosts: 2000, // Atualizado para R$ 2.000,00
  estimatedMonthlyProduction: 1000, // Atualizado para 1.000 peças
  taxRegime: 'MEI', // Alterado padrão para MEI conforme perfil Sowbrand
  defaultTaxRate: 4, // Mantido como referência caso mude para Simples
  meiDasTax: 75.00, // Taxa fixa MEI
  defaultCardRate: 3.5, // Atualizado para 3.5%
  defaultMarketingRate: 5, // Atualizado para 5%
  defaultCommissionRate: 0, // Mantido 0%
  
  silkPrices: {
    // Tabela Pequena (Peito/Manga)
    small: { firstColor: 4.50, extraColor: 1.50, screenNew: 35, screenRemake: 25 },
    // Tabela Grande (Costas)
    large: { firstColor: 6.50, extraColor: 2.50, screenNew: 55, screenRemake: 40 }
  },
  
  serviceCosts: {
    cuttingManual: 1.50, // Mantido base, lógica de variação virá na Etapa 3
    cuttingPlotter: 0.80, // Mantido base
    plotterPaper: 5.70, // Atualizado para R$ 5,70/metro
    sewingStandard: 4.75, // Atualizado para R$ 4,75
    dtfPrintMeter: 60.00, // Mantido R$ 60,00
    dtfApplication: 4.00 // Mantido base, lógica de escalonamento virá na Etapa 4
  }
};

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<CalculationMode>(CalculationMode.DASHBOARD);
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-montserrat">
      
      {/* SIDEBAR */}
      {currentMode !== CalculationMode.DASHBOARD && (
        <Sidebar currentMode={currentMode} onNavigate={setCurrentMode} />
      )}

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* DASHBOARD */}
        <div className={`h-full w-full ${currentMode === CalculationMode.DASHBOARD ? 'block' : 'hidden'}`}>
          <Dashboard 
            settings={settings} 
            onNavigate={setCurrentMode} 
          />
        </div>

        {/* MÓDULOS */}
        
        <div className={`h-full w-full ${currentMode === CalculationMode.CALCULATOR ? 'block' : 'hidden'}`}>
          <PricingCalculator settings={settings} />
        </div>

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