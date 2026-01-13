import React from 'react';
import { Calculator, Scale, Target, Settings } from 'lucide-react';
import { CalculationMode } from '../types';

interface DashboardProps {
  setMode: (mode: CalculationMode) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setMode }) => {
  const buttons = [
    { mode: CalculationMode.CALCULATOR, icon: Calculator, label: 'Precificação', colorBg: 'bg-sow-green/10', colorIcon: 'text-sow-green', description: 'Calcule custos e defina preços de venda.' },
    { mode: CalculationMode.COMPARATOR, icon: Scale, label: 'Comparador', colorBg: 'bg-pink-50', colorIcon: 'text-pink-500', description: 'Compare cenários e proteja sua margem.' },
    { mode: CalculationMode.REVERSE, icon: Target, label: 'Eng. Reversa', colorBg: 'bg-indigo-50', colorIcon: 'text-indigo-500', description: 'Defina o preço alvo e descubra o custo teto.' },
    { mode: CalculationMode.SETTINGS, icon: Settings, label: 'Configurações', colorBg: 'bg-gray-100', colorIcon: 'text-sow-grey', description: 'Gerencie taxas, custos fixos e fornecedores.' },
  ];

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto font-sans">
      {/* CABEÇALHO DISCRETO E ATRATIVO (Estilo Referência) */}
      <div className="w-full py-6 mb-12 flex flex-col items-start border-b border-sow-border/40">
        {/* Logo mais discreto alinhado à esquerda */}
        <h1 className="text-3xl lg:text-4xl tracking-tighter leading-none select-none mb-3">
            <span className="font-helvetica font-light text-sow-black">sow</span>
            <span className="font-helvetica font-bold text-sow-black">brand</span>
        </h1>
        {/* Nome do Sistema em Inglês - Tipografia Profissional */}
        <h2 className="font-helvetica font-bold text-lg md:text-xl text-sow-grey uppercase tracking-[0.2em]">
          Pricing Intelligence System
        </h2>
      </div>
      
      {/* CONTEÚDO PRINCIPAL - CARDS CENTRADOS */}
      <div className="flex-1 flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {buttons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button 
                  key={btn.label}
                  onClick={() => setMode(btn.mode)} 
                  className="bg-white border border-sow-border p-8 rounded-3xl transition-all duration-300 group hover:border-sow-green hover:shadow-soft hover:-translate-y-1 flex flex-col items-start text-left h-64 relative overflow-hidden"
                >
                    {/* Ícone com fundo colorido */}
                    <div className={`w-14 h-14 ${btn.colorBg} rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:scale-110 duration-300`}>
                      <Icon className={`w-7 h-7 ${btn.colorIcon}`} />
                    </div>
                    
                    {/* Título e Descrição */}
                    <div>
                      <h3 className="text-xl font-helvetica font-bold text-sow-black mb-2">{btn.label}</h3>
                      <p className="text-sm text-sow-grey font-montserrat leading-relaxed pr-4">{btn.description}</p>
                    </div>

                    {/* Detalhe visual de hover (Barra inferior) */}
                    <div className={`absolute bottom-0 left-0 h-1.5 w-0 bg-sow-green transition-all duration-500 group-hover:w-full opacity-80`}></div>
                </button>
              );
            })}
        </div>
      </div>
      
      {/* Rodapé discreto */}
      <div className="py-8 mt-auto text-left text-xs text-sow-grey/60 font-montserrat">
        © 2026 SOW BRAND. Sow Price System v6.0. Todos os direitos reservados.
      </div>
    </div>
  );
};