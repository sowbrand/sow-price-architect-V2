import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface InputGroupProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: { target: { name: string; value: string; type: string } } | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  prefix?: string;
  suffix?: string;
  step?: string;
  min?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const InputGroup: React.FC<InputGroupProps> = ({ 
  label, name, value, onChange, type = 'text', options, prefix, suffix, step = "0.01", min = "0", onKeyDown 
}) => {
  
  // Função para os botões manuais de + e -
  const handleStepper = (increment: boolean) => {
    const currentVal = parseFloat(value.toString()) || 0;
    const stepVal = parseFloat(step) || 1;
    // Evita negativos se o min for 0
    let newVal = increment ? currentVal + stepVal : currentVal - stepVal;
    if (min === "0" && newVal < 0) newVal = 0;

    // Arredonda para evitar erros de ponto flutuante (ex: 1.200000002)
    const decimals = step.includes('.') ? step.split('.')[1].length : 0;
    const finalVal = parseFloat(newVal.toFixed(decimals));

    // Simula o evento para o pai (PricingCalculator) entender
    onChange({
      target: {
        name: name,
        value: finalVal.toString(),
        type: type
      }
    });
  };

  return (
    <div className="flex flex-col space-y-1.5 group">
      <label className="text-[10px] font-bold uppercase tracking-wider text-sow-grey group-hover:text-sow-green transition-colors select-none">
        {label}
      </label>
      
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-sow-grey/60 text-sm font-mono font-medium z-10">{prefix}</span>}
        
        {type === 'select' ? (
          <select 
            name={name} 
            value={value} 
            onChange={onChange as any} 
            className="w-full bg-white border border-sow-border text-sow-dark text-sm rounded-md p-2.5 focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none transition-all appearance-none shadow-sm font-medium"
          >
            {options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ) : (
          <div className="relative w-full flex items-center">
            {/* Botão Menos (Só aparece para numbers) */}
            {type === 'number' && (
              <button 
                onClick={() => handleStepper(false)}
                className="absolute left-0 top-0 bottom-0 px-2 bg-gray-50 border-r border-sow-border text-sow-grey hover:text-sow-dark hover:bg-gray-100 rounded-l-md transition-colors z-20 flex items-center justify-center"
                tabIndex={-1} // Não foca no tab
              >
                <Minus className="w-3 h-3" />
              </button>
            )}

            <input 
              type={type} 
              name={name} 
              value={value} 
              onChange={onChange as any} 
              step={type === 'number' ? step : undefined} 
              min={type === 'number' ? min : undefined} 
              onKeyDown={onKeyDown}
              onFocus={(e) => e.target.select()} // Solução do "0 na frente": seleciona tudo ao clicar
              className={`w-full bg-white border border-sow-border text-sow-dark text-sm rounded-md p-2.5 outline-none transition-all font-mono font-medium shadow-sm hover:border-sow-grey/40 focus:ring-1 focus:ring-sow-green focus:border-sow-green 
                ${prefix ? 'pl-10' : (type === 'number' ? 'pl-10' : '')} 
                ${suffix ? 'pr-8' : (type === 'number' ? 'pr-10' : '')}
                ${type === 'number' ? 'text-center' : ''} 
              `} 
            />

            {/* Botão Mais (Só aparece para numbers) */}
            {type === 'number' && (
              <button 
                onClick={() => handleStepper(true)}
                className="absolute right-0 top-0 bottom-0 px-2 bg-gray-50 border-l border-sow-border text-sow-grey hover:text-sow-dark hover:bg-gray-100 rounded-r-md transition-colors z-20 flex items-center justify-center"
                tabIndex={-1}
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        
        {suffix && !type?.includes('number') && <span className="absolute right-3 text-sow-grey/60 text-sm font-mono pointer-events-none">{suffix}</span>}
        {/* Ajuste visual para sufixo quando tem botões numéricos */}
        {suffix && type === 'number' && <span className="absolute right-10 text-sow-grey/60 text-xs font-mono pointer-events-none z-30">{suffix}</span>}
      </div>
    </div>
  );
};