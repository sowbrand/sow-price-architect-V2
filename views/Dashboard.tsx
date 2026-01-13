import React from 'react';
import { Calculator, Scale, Target, Settings } from 'lucide-react';
import { CalculationMode } from '../types';

interface DashboardProps {
  setMode: (mode: CalculationMode) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setMode }) => {
  const buttons = [
    { mode: CalculationMode.CALCULATOR, icon: Calculator, label: 'Precificação', colorBg: 'bg-sow-green/10', colorIcon: 'text-sow-green' },
    { mode: CalculationMode.COMPARATOR, icon: Scale, label: 'Comparador', colorBg: 'bg-pink-50', colorIcon: 'text-pink-500' },
    { mode: CalculationMode.REVERSE, icon: Target, label: 'Eng. Reversa', colorBg: 'bg-indigo-50', colorIcon: 'text-indigo-500' },
    { mode: CalculationMode.SETTINGS, icon: Settings, label: 'Configurações', colorBg: 'bg-gray-100', colorIcon: 'text-sow-grey' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-6xl mx-auto font-sans">
      {/* Logo Principal SOWBRAND conforme Manual */}
      <div className="mb-16">
        <h1 className="text-6xl lg:text-7xl tracking-tighter leading-none select-none">
            <span className="font-helvetica font-light text-sow-black">sow</span>
            <span className="font-helvetica font-bold text-sow-black">brand</span>
        </h1>
      </div>
      
      {/* Grid de 4 Botões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
          {buttons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button 
                key={btn.label}
                onClick={() => setMode(btn.mode)} 
                className="bg-white border border-sow-border p-8 rounded-3xl transition-all group hover:border-sow-green hover:shadow-soft hover:-translate-y-1 flex flex-col items-center justify-center h-56"
              >
                  <div className={`w-16 h-16 ${btn.colorBg} rounded-full flex items-center justify-center mb-6 transition-colors group-hover:bg-sow-green`}>
                    <Icon className={`w-8 h-8 ${btn.colorIcon} group-hover:text-white transition-colors`} />
                  </div>
                  <h3 className="text-lg font-helvetica font-bold text-sow-black uppercase tracking-wider">{btn.label}</h3>
              </button>
            );
          })}
      </div>
      <p className="mt-12 text-sm text-sow-grey/60 font-montserrat">Sistema de Inteligência de Preços v6.0</p>
    </div>
  );
};