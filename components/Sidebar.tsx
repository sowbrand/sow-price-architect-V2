
import React from 'react';
import { LayoutDashboard, Calculator, Scale, Target, Settings } from 'lucide-react';
import { CalculationMode } from '../types';

interface SidebarProps {
  currentMode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
    const menuItems = [
        { mode: CalculationMode.DASHBOARD, icon: LayoutDashboard, label: 'Início' },
        { mode: CalculationMode.CALCULATOR, icon: Calculator, label: 'Precificação' },
        { mode: CalculationMode.COMPARATOR, icon: Scale, label: 'Comparador' },
        { mode: CalculationMode.REVERSE, icon: Target, label: 'Eng. Reversa' },
        { mode: CalculationMode.SETTINGS, icon: Settings, label: 'Configurações' },
    ];
    return (
        <div className="w-20 lg:w-64 h-screen bg-white border-r border-sow-border flex flex-col shrink-0 shadow-sm z-20 font-sans">
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-sow-border"><h1 className="font-helvetica font-bold text-xl lg:text-2xl tracking-tighter text-black">SOW<span className="text-sow-green">BRAND</span></h1></div>
            <nav className="flex-1 py-8 space-y-2 px-3">
                {menuItems.map((item) => {
                    const isActive = currentMode === item.mode;
                    return (
                        <button key={item.mode} onClick={() => setMode(item.mode)} className={`w-full flex items-center justify-center lg:justify-start p-3.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-sow-green text-white shadow-lg shadow-sow-green/20' : 'text-sow-grey hover:bg-gray-50 hover:text-sow-dark'}`}>
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-sow-grey group-hover:text-sow-dark'}`} />
                            <span className={`hidden lg:block ml-3 font-medium text-sm ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
            <div className="p-6 border-t border-sow-border hidden lg:block"><div className="bg-gray-50 rounded-lg p-4 border border-gray-100"><p className="text-xs text-sow-grey font-mono font-medium">v5.0.0</p><p className="text-[10px] text-sow-grey/60 uppercase mt-1">Sow Price System</p></div></div>
        </div>
    );
};
