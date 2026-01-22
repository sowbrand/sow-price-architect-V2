import * as React from 'react';
import { LayoutDashboard, Calculator, Printer, Scale, Target, Settings } from 'lucide-react';
import { CalculationMode } from '../types';

interface SidebarProps {
  currentMode: CalculationMode;
  onNavigate: (mode: CalculationMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, onNavigate }) => {
  const menuItems = [
    { id: CalculationMode.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: CalculationMode.DTF, label: 'Calc. DTF', icon: Printer },
    { id: CalculationMode.CALCULATOR, label: 'Precificação', icon: Calculator },
    { id: CalculationMode.COMPARATOR, label: 'Comparador', icon: Scale },
    { id: CalculationMode.REVERSE, label: 'Eng. Reversa', icon: Target },
    { id: CalculationMode.SETTINGS, label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 z-20">
      <div className="p-6 flex items-center justify-center">
         {/* Espaço para logo */}
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-montserrat font-bold text-sm ${
              currentMode === item.id
                ? 'bg-gray-50 text-sow-black border border-gray-200 shadow-sm'
                : 'text-gray-400 hover:bg-gray-50 hover:text-sow-grey'
            }`}
          >
            <item.icon
              className={`w-5 h-5 transition-colors ${
                currentMode === item.id ? 'text-sow-green' : 'text-gray-400 group-hover:text-sow-grey'
              }`}
            />
            <span>{item.label}</span>
            {currentMode === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sow-green" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <p className="text-[10px] text-center text-gray-300 font-montserrat">
          Sowbrand Intelligence v2.1
        </p>
      </div>
    </aside>
  );
};