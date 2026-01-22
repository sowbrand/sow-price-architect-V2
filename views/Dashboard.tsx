import React from 'react';
import { Calculator, Printer, Scale, Target, Settings } from 'lucide-react';
import { CalculationMode, SettingsData } from '../types';

interface DashboardProps {
  settings: SettingsData;
  onNavigate: (mode: CalculationMode) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ settings, onNavigate }) => {
  // Definição dos módulos na nova ordem solicitada
  const modules = [
    {
      title: 'Calculadora DTF',
      description: 'Otimize rolos de impressão e calcule custos.',
      icon: Printer,
      mode: CalculationMode.DTF,
      color: 'bg-purple-100 text-purple-600',
      hoverBorder: 'hover:border-purple-200'
    },
    {
      title: 'Precificação',
      description: 'Calcule custos e defina preços de venda.',
      icon: Calculator,
      mode: CalculationMode.CALCULATOR,
      color: 'bg-green-100 text-green-600',
      hoverBorder: 'hover:border-green-200'
    },
    {
      title: 'Comparador',
      description: 'Compare cenários e proteja sua margem.',
      icon: Scale,
      mode: CalculationMode.COMPARATOR,
      color: 'bg-pink-100 text-pink-600',
      hoverBorder: 'hover:border-pink-200'
    },
    {
      title: 'Eng. Reversa',
      description: 'Defina o preço alvo e descubra o custo teto.',
      icon: Target,
      mode: CalculationMode.REVERSE,
      color: 'bg-blue-100 text-blue-600',
      hoverBorder: 'hover:border-blue-200'
    },
    {
      title: 'Configurações',
      description: 'Gerencie taxas, custos fixos e fornecedores.',
      icon: Settings,
      mode: CalculationMode.SETTINGS,
      color: 'bg-gray-100 text-gray-600',
      hoverBorder: 'hover:border-gray-300'
    }
  ];

  return (
    <div className="h-full flex flex-col font-montserrat bg-gray-50 overflow-y-auto p-8">
      
      {/* Cabeçalho / Logo */}
      <div className="mb-12">
        <h1 className="text-4xl font-helvetica font-bold text-sow-black mb-2">
          sow<span className="font-light">brand</span>
        </h1>
        <p className="text-xs text-sow-grey uppercase tracking-[0.2em] font-medium pl-1">
          Pricing Intelligence System
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {modules.map((module) => (
          <button 
            key={module.title}
            onClick={() => onNavigate(module.mode)}
            className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col h-[280px] ${module.hoverBorder}`}
          >
            {/* Ícone */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${module.color} transition-transform group-hover:scale-110 shadow-inner`}>
              <module.icon className="w-7 h-7" strokeWidth={1.5} />
            </div>
            
            {/* Título */}
            <h3 className="text-lg font-helvetica font-bold text-sow-black mb-3 group-hover:text-sow-green transition-colors">
              {module.title}
            </h3>
            
            {/* Descrição */}
            <p className="text-sm text-gray-500 mb-auto leading-relaxed font-medium">
              {module.description}
            </p>

            {/* Link de Ação */}
            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center text-[11px] font-bold text-gray-300 group-hover:text-sow-green transition-colors uppercase tracking-wider">
              Acessar Ferramenta
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};