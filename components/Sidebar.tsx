import React from 'react';
import { LayoutDashboard, Calculator, Scale, Target, Settings } from 'lucide-react';
import { CalculationMode } from '../types';

interface SidebarProps {
  currentMode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
    const menuItems = [
        { mode: CalculationMode.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
        { mode: CalculationMode.CALCULATOR, icon: Calculator, label: 'Precificação' },
        { mode: CalculationMode.COMPARATOR, icon: Scale, label: 'Comparador' },
        { mode: CalculationMode.REVERSE, icon: Target, label: 'Eng. Reversa' },
        { mode: CalculationMode.SETTINGS, icon: Settings, label: 'Configurações' },
    ];

    return (
        <aside className="w-20 lg:w-64 h-screen bg-sow-white border-r border-sow-border flex flex-col shrink-0 z-30 transition-all duration-300">
            {/* Logo SOW BRAND - Conforme Manual (Helvetica) */}
            <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8">
                <h1 className="font-helvetica text-2xl lg:text-3xl tracking-tight select-none">
                    <span className="font-light text-sow-black">sow</span>
                    <span className="font-bold text-sow-black">brand</span>
                </h1>
            </div>

            {/* Menu de Navegação Minimalista */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const isActive = currentMode === item.mode;
                    return (
                        <button 
                            key={item.mode} 
                            onClick={() => setMode(item.mode)} 
                            className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-300 group
                                ${isActive 
                                    ? 'bg-sow-light text-sow-black shadow-sm border border-sow-border' 
                                    : 'text-sow-grey hover:bg-sow-light hover:text-sow-black'
                                }`
                            }
                        >
                            <item.icon 
                                className={`w-5 h-5 transition-colors 
                                    ${isActive ? 'text-sow-green' : 'text-sow-grey group-hover:text-sow-black'}`
                                } 
                            />
                            <span className="hidden lg:block font-montserrat font-medium text-sm">{item.label}</span>
                            
                            {/* Indicador de Ativo (Ponto Verde) */}
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sow-green hidden lg:block shadow-[0_0_8px_rgba(114,191,3,0.5)]"></div>}
                        </button>
                    );
                })}
            </nav>

            <div className="p-6 hidden lg:block">
                <div className="text-[10px] text-sow-grey/40 font-montserrat text-center border-t border-sow-border pt-4">
                    Sow Price System v6.0
                </div>
            </div>
        </aside>
    );
};