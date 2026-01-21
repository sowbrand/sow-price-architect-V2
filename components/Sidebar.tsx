import React from 'react';
import { LayoutGrid, Calculator, Printer, Scale, Target, Settings } from 'lucide-react';
import { CalculationMode } from '../types';

interface SidebarProps {
  currentMode: CalculationMode;
  onNavigate: (mode: CalculationMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, onNavigate }) => {
  
  const menuItems = [
    { label: 'Dashboard', icon: LayoutGrid, mode: CalculationMode.DASHBOARD },
    { label: 'Precificação', icon: Calculator, mode: CalculationMode.CALCULATOR },
    { label: 'Calc. DTF', icon: Printer, mode: CalculationMode.DTF },
    { label: 'Comparador', icon: Scale, mode: CalculationMode.COMPARATOR },
    { label: 'Eng. Reversa', icon: Target, mode: CalculationMode.REVERSE },
    { label: 'Configurações', icon: Settings, mode: CalculationMode.SETTINGS },
  ];

  return (
    // ADICIONADO 'relative' para o z-50 funcionar corretamente
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 font-montserrat z-50 relative">
      
      {/* LOGO */}
      <div className="p-8 cursor-pointer" onClick={() => onNavigate(CalculationMode.DASHBOARD)}>
        <h1 className="text-2xl font-helvetica font-bold text-gray-900">
          sow<span className="font-light">brand</span>
        </h1>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button" // IMPORTANTE: Garante o comportamento de clique
            onClick={() => onNavigate(item.mode)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 text-left outline-none
              ${currentMode === item.mode 
                ? 'bg-gray-50 text-gray-900 border border-gray-200 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <item.icon className={`w-5 h-5 ${currentMode === item.mode ? 'text-green-600' : 'text-gray-400'}`} />
            <span>{item.label}</span>
            
            {/* Indicador Ativo (Bolinha Verde) */}
            {currentMode === item.mode && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm"></div>
            )}
          </button>
        ))}
      </nav>

      {/* RODAPÉ */}
      <div className="p-6 mt-auto">
        <span className="text-[10px] text-gray-300 block text-center">Sow Price System v6.1</span>
      </div>
    </aside>
  );
};