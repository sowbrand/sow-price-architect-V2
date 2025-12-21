
import React from 'react';

interface InputGroupProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  prefix?: string;
  suffix?: string;
  step?: string;
  min?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, name, value, onChange, type = 'text', options, prefix, suffix, step = "0.01", min = "0", onKeyDown }) => (
    <div className="flex flex-col space-y-1.5 group">
      <label className="text-[10px] font-bold uppercase tracking-wider text-sow-grey group-hover:text-sow-green transition-colors">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-sow-grey/60 text-sm font-mono font-medium">{prefix}</span>}
        {type === 'select' ? (
          <select name={name} value={value} onChange={onChange} className="w-full bg-white border border-sow-border text-sow-dark text-sm rounded-md p-2.5 focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none transition-all appearance-none shadow-sm font-medium">
            {options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ) : (
          <input type={type} name={name} value={value} onChange={onChange} step={type === 'number' ? step : undefined} min={type === 'number' ? min : undefined} onKeyDown={onKeyDown} className={`w-full bg-white border border-sow-border text-sow-dark text-sm rounded-md p-2.5 focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none transition-all font-mono font-medium shadow-sm hover:border-sow-grey/40 ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-8' : ''}`} />
        )}
        {suffix && <span className="absolute right-3 text-sow-grey/60 text-sm font-mono">{suffix}</span>}
      </div>
    </div>
);
