import React from 'react';
import { Calculator, Scale, Printer, Target, Settings, ArrowRight } from 'lucide-react';
import { CalculationMode, SettingsData } from '../types';

interface DashboardProps {
  settings: SettingsData;
  onNavigate: (mode: CalculationMode) => void; // Nova propriedade para permitir navegação
}

export const Dashboard: React.FC<DashboardProps> = ({ settings, onNavigate }) => {
  
  const cards = [
    {
      title: 'Precificação',
      description: 'Calcule custos e defina preços de venda.',
      icon: Calculator,
      color: 'bg-sow-green',
      text: 'text-sow-green',
      mode: CalculationMode.CALCULATOR
    },
    {
      title: 'Comparador',
      description: 'Compare cenários e proteja sua margem.',
      icon: Scale,
      color: 'bg-pink-500',
      text: 'text-pink-500',
      mode: CalculationMode.COMPARATOR
    },
    {
      title: 'Calculadora DTF',
      description: 'Otimize rolos de impressão e calcule custos.',
      icon: Printer,
      color: 'bg-purple-500',
      text: 'text-purple-500',
      mode: CalculationMode.DTF
    },
    {
      title: 'Eng. Reversa',
      description: 'Defina o preço alvo e descubra o custo teto.',
      icon: Target,
      color: 'bg-indigo-500',
      text: 'text-indigo-500',
      mode: CalculationMode.REVERSE
    },
    {
      title: 'Configurações',
      description: 'Gerencie taxas, custos fixos e fornecedores.',
      icon: Settings,
      color: 'bg-gray-500',
      text: 'text-gray-500',
      mode: CalculationMode.SETTINGS
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-8 font-montserrat bg-gray-50">
      <div className="mb-10">
        <h1 className="text-4xl font-helvetica font-bold text-sow-black mb-2">
          sow<span className="font-light">brand</span>
        </h1>
        <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">Pricing Intelligence System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card, index) => (
          <button
            key={index}
            onClick={() => onNavigate(card.mode)}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 text-left group flex flex-col h-64 relative overflow-hidden"
          >
            <div className={`w-12 h-12 rounded-xl ${card.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className={`w-6 h-6 ${card.text}`} />
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
            
            <div className="mt-auto pt-4 flex items-center text-xs font-bold text-gray-300 group-hover:text-sow-black transition-colors">
              <span>Acessar Ferramenta</span>
              <ArrowRight className="w-3 h-3 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          </button>
        ))}
      </div>

      <div className="fixed bottom-4 left-8 text-[10px] text-gray-300">
        © 2026 SOW BRAND • V6.1.0
      </div>
    </div>
  );
};