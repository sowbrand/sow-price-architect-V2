
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { PricingCalculator } from './views/PricingCalculator';
import { Comparator } from './views/Comparator';
import { ReverseEngineering } from './views/ReverseEngineering';
import { SettingsView } from './views/Settings';
import { CalculationMode, INITIAL_SETTINGS } from './types';
import type { SettingsData } from './types';

export const App: React.FC = () => {
    const [mode, setMode] = useState<CalculationMode>(CalculationMode.DASHBOARD);
    const [settings, setSettings] = useState<SettingsData>(INITIAL_SETTINGS);

    const renderContent = () => {
        switch (mode) {
            case CalculationMode.CALCULATOR: return <PricingCalculator settings={settings} />;
            case CalculationMode.COMPARATOR: return <Comparator settings={settings} />;
            case CalculationMode.REVERSE: return <ReverseEngineering settings={settings} />;
            case CalculationMode.SETTINGS: return <SettingsView settings={settings} updateSettings={setSettings} />;
            case CalculationMode.DASHBOARD:
            default: return <Dashboard setMode={setMode} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-sow-dark font-sans overflow-hidden">
            <Sidebar currentMode={mode} setMode={setMode} />
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="lg:hidden h-16 border-b border-sow-border flex items-center px-4 bg-white shrink-0">
                    <span className="font-bold text-sow-dark">SOW Price Architect</span>
                </div>
                <div className="flex-1 p-4 lg:p-8 overflow-hidden relative">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};
