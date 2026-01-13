import React from 'react';
import { Calculator, Scale, Target } from 'lucide-react';
import { CalculationMode } from '../types';

interface DashboardProps {
  setMode: (mode: CalculationMode) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setMode }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-5xl mx-auto font-sans">
      <div className="mb-12">
        <h1 className="font-helvetica font-bold text-6xl tracking-tighter text-black">
          SOW<span className="text-sow-green">BRAND</span>
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-8">
          <button 
            onClick={() => setMode(CalculationMode.CALCULATOR)} 
            className="bg-white hover:bg-gray-50 border border-sow-border p-10 rounded-3xl transition-all group hover:border-sow-green hover:shadow-xl hover:-translate-y-2 flex flex-col items-center justify-center h-64"
          >
              <div className="w-20 h-20 bg-sow-green/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-sow-green transition-colors">
                <Calculator className="w-10 h-10 text-sow-green group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-sow-dark font-helvetica uppercase tracking-wide">Precificação</h3>
          </button>

          <button 
            onClick={() => setMode(CalculationMode.COMPARATOR)} 
            className="bg-white hover:bg-gray-50 border border-sow-border p-10 rounded-3xl transition-all group hover:border-sow-green hover:shadow-xl hover:-translate-y-2 flex flex-col items-center justify-center h-64"
          >
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-pink-500 transition-colors">
                <Scale className="w-10 h-10 text-pink-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-sow-dark font-helvetica uppercase tracking-wide">Comparador</h3>
          </button>

          <button 
            onClick={() => setMode(CalculationMode.REVERSE)} 
            className="bg-white hover:bg-gray-50 border border-sow-border p-10 rounded-3xl transition-all group hover:border-sow-green hover:shadow-xl hover:-translate-y-2 flex flex-col items-center justify-center h-64"
          >
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-500 transition-colors">
                <Target className="w-10 h-10 text-indigo-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-sow-dark font-helvetica uppercase tracking-wide">Eng. Reversa</h3>
          </button>
      </div>
    </div>
  );
};