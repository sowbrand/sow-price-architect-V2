import React from 'react';
import { Calculator, Scale, Target, Settings, Printer } from 'lucide-react'; // Adicionei Printer
import { CalculationMode } from '../types';

interface DashboardProps {
  setMode: (mode: CalculationMode) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setMode }) => {
  const buttons = [
    { mode: CalculationMode.CALCULATOR, icon: Calculator, label: 'Precificação', colorBg: 'bg-sow-green/10', colorIcon: 'text-sow-green', description: 'Calcule custos e defina preços de venda.' },
    { mode: CalculationMode.COMPARATOR, icon: Scale, label: 'Comparador', colorBg: 'bg-pink-50', colorIcon: 'text-pink-500', description: 'Compare cenários e proteja sua margem.' },
    { mode: CalculationMode.DTF, icon: Printer, label: 'Calculadora DTF', colorBg: 'bg-purple-50', colorIcon: 'text-purple-500', description: 'Otimize rolos de impressão e calcule custos.' }, // <-- NOVO BOTÃO
    { mode: CalculationMode.REVERSE, icon: Target, label: 'Eng. Reversa', colorBg: 'bg-indigo-50', colorIcon: 'text-indigo-500', description: 'Defina o preço alvo e descubra o custo teto.' },
    { mode: CalculationMode.SETTINGS, icon: Settings, label: 'Configurações', colorBg: 'bg-gray-100', colorIcon: 'text-sow-grey', description: 'Gerencie taxas, custos fixos e fornecedores.' },
  ];

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto font-sans">
      
      <div className="w-full pt-8 pb-12 flex flex-col items-start">
        <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none select-none text-sow-black">
            <span className="font-helvetica font-light">sow</span>
            <span className="font-helvetica font-bold">brand</span>
        </h1>
        <p className="font-montserrat font-medium text-[9px] lg:text-[10px] text-sow-grey/70 uppercase tracking-[0.35em] mt-1.5 ml-0.5">
          Pricing Intelligence System
        </p>
      </div>
      
      <div className="flex-1">
        {/* Ajustei o grid para comportar 5 itens ou fluir melhor */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full">
            {buttons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button 
                  key={btn.label}
                  onClick={() => setMode(btn.mode)} 
                  className="bg-white border border-sow-border p-6 rounded-3xl transition-all duration-300 group hover:border-sow-green hover:shadow-soft hover:-translate-y-1 flex flex-col items-start text-left h-60 relative overflow-hidden"
                >
                    <div className={`w-12 h-12 ${btn.colorBg} rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300`}>
                      <Icon className={`w-6 h-6 ${btn.colorIcon}`} />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-helvetica font-bold text-sow-black mb-2">{btn.label}</h3>
                      <p className="text-[11px] text-sow-grey font-montserrat leading-relaxed pr-2 font-medium">{btn.description}</p>
                    </div>

                    <div className={`absolute bottom-0 left-0 h-1.5 w-0 bg-sow-green transition-all duration-500 group-hover:w-full`}></div>
                </button>
              );
            })}
        </div>
      </div>
      
      <div className="py-6 mt-auto text-left border-t border-sow-border/30">
        <p className="text-[10px] text-sow-grey/40 font-montserrat uppercase tracking-wider">
          © 2026 Sow Brand &bull; v6.1.0
        </p>
      </div>
    </div>
  );
};