import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { PricingCalculator } from './views/PricingCalculator';
import { Comparator } from './views/Comparator';
import { ReverseEngineering } from './views/ReverseEngineering';
import { SettingsView } from './views/Settings';
import { DTFCalculator } from './views/DTFCalculator'; // Importação Nova
import { CalculationMode } from './types';
import type { SettingsData } from './types';
import { INITIAL_SETTINGS } from './constants/defaults';

export const App: React.FC = () => {
    const [mode, setMode] = useState<CalculationMode>(CalculationMode.DASHBOARD);
    const [settings, setSettings] = useState<SettingsData>(INITIAL_SETTINGS);

    const renderContent = () => {
        switch (mode) {
            case CalculationMode.CALCULATOR: return <PricingCalculator settings={settings} />;
            case CalculationMode.COMPARATOR: return <Comparator settings={settings} />;
            case CalculationMode.DTF: return <DTFCalculator settings={settings} />; // Rota Nova
            case CalculationMode.REVERSE: return <ReverseEngineering settings={settings} />;
            case CalculationMode.SETTINGS: return <SettingsView settings={settings} updateSettings={setSettings} />;
            case CalculationMode.DASHBOARD:
            default: return <Dashboard setMode={setMode} />;
        }
    };

    const isDashboard = mode === CalculationMode.DASHBOARD;

    return (
        <div className="flex h-screen bg-sow-white font-montserrat overflow-hidden text-sow-grey">
            {/* A Sidebar só aparece se NÃO for o Dashboard */}
            {!isDashboard && <Sidebar currentMode={mode} setMode={setMode} />}
            
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-sow-white">
                {/* Header Mobile - Escondido no dashboard desktop, visível em telas pequenas */}
                {!isDashboard && (
                    <div className="lg:hidden h-16 border-b border-sow-border flex items-center justify-center bg-sow-white shrink-0 z-20">
                         <h1 className="text-xl tracking-tighter leading-none select-none">
                            <span className="font-helvetica font-light text-sow-black">sow</span>
                            <span className="font-helvetica font-bold text-sow-black">brand</span>
                        </h1>
                    </div>
                )}

                <div className="flex-1 p-4 lg:p-8 overflow-hidden relative">
                    <div className="h-full w-full max-w-[1600px] mx-auto animate-fade-in">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};