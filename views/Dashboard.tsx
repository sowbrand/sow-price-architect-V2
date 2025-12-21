
import React from 'react';
import { Calculator, Scale, Target } from 'lucide-react';
import { CalculationMode } from '../types';

interface DashboardProps {
  setMode: (mode: CalculationMode) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setMode }) => (
  <div className="flex flex-col items-center justify-center h-full text-center max-w-4xl mx-auto font-sans">
      <div className="mb-8"><h1 className="font-helvetica font-bold text-5xl tracking-tighter text-black">SOW<span className="text-sow-green">BRAND</span></h1></div>
      <h2 className="text-3xl font-bold text-sow-dark mb-4 tracking-tight">Sow Price Architect</h2>
      <p className="text-sow-grey text-lg mb-12 max-w-2xl leading-relaxed">Sistema especialista em engenharia de custos para Private Label.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
          <button onClick={() => setMode(CalculationMode.CALCULATOR)} className="bg-white hover:bg-gray-50 border border-sow-border p-8 rounded-2xl transition-all group hover:border-sow-green hover:shadow-lg hover:-translate-y-1">
              <div className="w-16 h-16 bg-sow-green/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-sow-green transition-colors"><Calculator className="w-8 h-8 text-sow-green group-hover:text-white transition-colors" /></div>
              <h3 className="text-lg font-bold text-sow-dark mb-2 font-helvetica">Precificação Completa</h3>
              <p className="text-sm text-sow-grey leading-relaxed">Ficha técnica detalhada, cálculo de chão de fábrica e formação de preço.</p>
          </button>
          <button onClick={() => setMode(CalculationMode.COMPARATOR)} className="bg-white hover:bg-gray-50 border border-sow-border p-8 rounded-2xl transition-all group hover:border-sow-green hover:shadow-lg hover:-translate-y-1">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-500 transition-colors"><Scale className="w-8 h-8 text-pink-500 group-hover:text-white transition-colors" /></div>
              <h3 className="text-lg font-bold text-sow-dark mb-2 font-helvetica">Comparador</h3>
              <p className="text-sm text-sow-grey leading-relaxed">Compare Cenário A vs B (Ex: Silk vs Bordado) e encontre a melhor margem.</p>
          </button>
          <button onClick={() => setMode(CalculationMode.REVERSE)} className="bg-white hover:bg-gray-50 border border-sow-border p-8 rounded-2xl transition-all group hover:border-sow-green hover:shadow-lg hover:-translate-y-1">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500 transition-colors"><Target className="w-8 h-8 text-indigo-500 group-hover:text-white transition-colors" /></div>
              <h3 className="text-lg font-bold text-sow-dark mb-2 font-helvetica">Engenharia Reversa</h3>
              <p className="text-sm text-sow-grey leading-relaxed">Defina o Preço Alvo e descubra o limite máximo (Target Cost).</p>
          </button>
      </div>
  </div>
);
