import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { PricingCalculator } from './views/PricingCalculator';
import { Comparator } from './views/Comparator';
import { ReverseEngineering } from './views/ReverseEngineering';
import { Settings } from './views/Settings'; // LINHA 7 CORRIGIDA (Usa chaves {})
import { CalculationMode, SettingsData } from './types';

// Configurações Padrão (Memória Inicial)
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
  // Estado da Navegação
  const [currentMode, setCurrentMode] = useState<CalculationMode>(CalculationMode.DASHBOARD);
  
  // Estado das Configurações (Compartilhado)
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-montserrat">
      {/* SIDEBAR */}
      <Sidebar currentMode={currentMode} onNavigate={setCurrentMode} />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* ESTRATÉGIA DE PERSISTÊNCIA:
           Todos os componentes são renderizados, mas usamos a classe 'hidden'
           para ocultar visualmente os inativos. Isso preserva o estado (inputs)
           enquanto o usuário navega entre as abas.
        */}

        <div className={`h-full w-full ${currentMode === CalculationMode.DASHBOARD ? 'block' : 'hidden'}`}>
          <Dashboard settings={settings} />
        </div>

        <div className={`h-full w-full ${currentMode === CalculationMode.CALCULATOR ? 'block' : 'hidden'}`}>
          <PricingCalculator settings={settings} />
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
              alert('Configurações salvas e aplicadas em todas as abas!');
            }} 
          />
        </div>

      </main>
    </div>
  );
}

export default App;