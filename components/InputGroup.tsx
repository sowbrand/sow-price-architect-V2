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
  // Novas props para controle fino
  showStepper?: boolean; // Mostra ou esconde botões +/-
  allowDecimals?: boolean; // Permite virgula/ponto?
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const InputGroup: React.FC<InputGroupProps> = ({ 
  label, name, value, onChange, type = 'text', options, prefix, suffix, 
  step = "0.01", min = "0", showStepper = true, allowDecimals = true, onKeyDown 
}) => {
  
  const handleStepper = (increment: boolean) => {
    const currentVal = parseFloat(value.toString()) || 0;
    const stepVal = parseFloat(step) || 1;
    let newVal = increment ? currentVal + stepVal : currentVal - stepVal;
    
    if (min !== undefined && newVal < parseFloat(min)) newVal = parseFloat(min);
    
    // Arredondamento para evitar 1.2000000002
    const decimals = allowDecimals ? (step.includes('.') ? step.split('.')[1].length : 2) : 0;
    const finalVal = parseFloat(newVal.toFixed(decimals));

    onChange({ target: { name, value: finalVal.toString(), type } });
  };

  // Remove o zero à esquerda visualmente se o usuário estiver digitando, mas mantém 0 se estiver vazio
  const displayValue = value === 0 ? '0' : value;

  return (
    <div className="flex flex-col space-y-1.5 group">
      <label className="text-[10px] font-bold uppercase tracking-wider text-sow-grey group-hover:text-sow-green transition-colors select-none">
        {label}
      </label>
      
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-sow-grey/60 text-sm font-mono font-medium z-10 select-none">{prefix}</span>}
        
        {type === 'select' ? (
          <select 
            name={name} value={value} onChange={onChange as any} 
            className="w-full bg-white border border-sow-border text-sow-dark text-sm rounded-md p-2.5 focus:ring-1 focus:ring-sow-green outline-none appearance-none shadow-sm font-medium"
          >
            {options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ) : (
          <div className="relative w-full flex items-center">
            {/* Botão Menos - Só aparece se showStepper for true */}
            {type === 'number' && showStepper && (
              <button onClick={() => handleStepper(false)} className="absolute left-0 top-0 bottom-0 px-2 bg-gray-50 border-r border-sow-border text-sow-grey hover:text-sow-dark hover:bg-gray-100 rounded-l-md z-20 flex items-center justify-center tab-index-[-1]">
                <Minus className="w-3 h-3" />
              </button>
            )}

            <input 
              type={type} name={name} value={displayValue} onChange={onChange as any} 
              step={allowDecimals ? step : "1"} 
              min={min} 
              onKeyDown={onKeyDown}
              onFocus={(e) => e.target.select()} // Resolve o problema do "Zero na frente" selecionando tudo ao clicar
              className={`
                w-full bg-white border border-sow-border text-sow-dark text-sm rounded-md p-2.5 outline-none transition-all font-mono font-medium shadow-sm hover:border-sow-grey/40 focus:ring-1 focus:ring-sow-green 
                ${prefix ? 'pl-10' : (type === 'number' && showStepper ? 'pl-10' : 'pl-3')} 
                ${suffix ? 'pr-10' : (type === 'number' && showStepper ? 'pr-10' : 'pr-3')}
                ${type === 'number' ? 'text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''} 
              `} 
            />

            {/* Botão Mais - Só aparece se showStepper for true */}
            {type === 'number' && showStepper && (
              <button onClick={() => handleStepper(true)} className="absolute right-0 top-0 bottom-0 px-2 bg-gray-50 border-l border-sow-border text-sow-grey hover:text-sow-dark hover:bg-gray-100 rounded-r-md z-20 flex items-center justify-center tab-index-[-1]">
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        
        {suffix && <span className={`absolute right-3 text-sow-grey/60 text-sm font-mono pointer-events-none z-30 ${showStepper ? 'mr-8' : ''}`}>{suffix}</span>}
      </div>
    </div>
  );
};