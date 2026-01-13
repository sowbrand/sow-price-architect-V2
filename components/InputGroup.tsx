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
  
  const isCurrency = prefix === 'R$';
  const showStepper = type === 'number' && !isCurrency;

  const handleStepper = (increment: boolean) => {
    const currentVal = parseFloat(value.toString()) || 0;
    const stepVal = parseFloat(step) || 1;
    let newVal = increment ? currentVal + stepVal : currentVal - stepVal;
    if (min !== undefined && newVal < parseFloat(min)) newVal = parseFloat(min);
    const decimals = step.includes('.') ? step.split('.')[1].length : 0;
    const finalVal = parseFloat(newVal.toFixed(decimals));
    onChange({ target: { name: name, value: finalVal.toString(), type: type } });
  };

  const baseInputClass = `
    w-full bg-sow-white border border-sow-border rounded-lg p-2.5 
    text-sow-black text-sm font-montserrat font-medium
    outline-none transition-all duration-300
    hover:border-sow-grey/40
    focus:border-sow-green focus:ring-1 focus:ring-sow-green focus:shadow-soft
    disabled:bg-sow-light disabled:text-sow-grey/50
  `;

  return (
    <div className="flex flex-col space-y-1.5 group">
      <label className="text-[11px] font-bold uppercase tracking-wide text-sow-grey group-hover:text-sow-black transition-colors pl-1">
        {label}
      </label>
      
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-sow-grey text-sm font-montserrat font-semibold z-10 select-none">{prefix}</span>}
        
        {type === 'select' ? (
          <select 
            name={name} 
            value={value} 
            onChange={onChange as any} 
            className={`${baseInputClass} appearance-none cursor-pointer`}
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23545454%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center', backgroundSize: '0.65em auto', paddingRight: '2.5rem' }}
          >
            {options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ) : (
          <div className="relative w-full flex items-center">
            {showStepper && (
              <button 
                onClick={() => handleStepper(false)}
                className="absolute left-1 p-1.5 text-sow-grey hover:text-sow-black hover:bg-sow-light rounded-md transition-colors z-20"
                tabIndex={-1}
              >
                <Minus className="w-3 h-3" />
              </button>
            )}

            <input 
              type={type} 
              name={name} 
              // CORREÇÃO: Forçar string remove zeros à esquerda residuais do navegador
              value={value.toString()} 
              onChange={onChange as any} 
              step={type === 'number' ? step : undefined} 
              min={type === 'number' ? min : undefined} 
              onKeyDown={onKeyDown}
              // CORREÇÃO: Seleciona tudo ao clicar ou focar (resolve o problema de ter que apagar o zero)
              onFocus={(e) => e.target.select()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className={`${baseInputClass} 
                ${prefix ? 'pl-9' : (showStepper ? 'pl-9' : '')} 
                ${suffix ? 'pr-8' : (showStepper ? 'pr-9' : '')}
                ${showStepper ? 'text-center' : ''} 
              `} 
            />

            {showStepper && (
              <button 
                onClick={() => handleStepper(true)}
                className="absolute right-1 p-1.5 text-sow-grey hover:text-sow-black hover:bg-sow-light rounded-md transition-colors z-20"
                tabIndex={-1}
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        
        {suffix && !type?.includes('number') && <span className="absolute right-3 text-sow-grey text-sm font-montserrat select-none">{suffix}</span>}
        {suffix && type === 'number' && <span className={`absolute text-sow-grey text-xs font-montserrat font-medium select-none z-30 ${showStepper ? 'right-9' : 'right-3'}`}>{suffix}</span>}
      </div>
    </div>
  );
};