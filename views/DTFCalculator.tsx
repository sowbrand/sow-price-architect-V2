import React, { useState, useEffect } from 'react';
import { Printer, Plus, Trash2, ArrowRight, Ruler } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import { formatCurrency } from '../utils/pricingEngine';
import type { SettingsData } from '../types';

interface DTFCalculatorProps {
  settings: SettingsData;
}

interface PrintItem {
  id: string;
  width: number; // cm
  height: number; // cm
  quantity: number;
  description: string;
}

export const DTFCalculator: React.FC<DTFCalculatorProps> = ({ settings }) => {
  const [items, setItems] = useState<PrintItem[]>([
    { id: '1', width: 25, height: 17, quantity: 20, description: 'Estampa Peito' }
  ]);
  const [totalMeters, setTotalMeters] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Constantes de impressão
  const ROLL_WIDTH = 58; // cm
  const PAPER_MARGIN = 1; // cm (Borda do papel)
  const ITEM_GAP = 1.5; // cm (Espaçamento entre estampas)
  const USABLE_WIDTH = ROLL_WIDTH - (PAPER_MARGIN * 2);

  const addItem = () => {
    const newItem: PrintItem = {
      id: Math.random().toString(36).substr(2, 9),
      width: 10,
      height: 10,
      quantity: 1,
      description: 'Nova Estampa'
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof PrintItem, value: any) => {
    setItems(items.map(i => (i.id === id ? { ...i, [field]: value } : i)));
  };

  // ALGORITMO DE "NESTING" (Empilhamento Simples em Linha)
  useEffect(() => {
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;
    
    // Vamos explodir a lista: se tenho 20 unidades da estampa A, crio 20 objetos para alocar
    const allPrints: { w: number, h: number }[] = [];
    
    items.forEach(item => {
      // Adiciona o espaçamento no tamanho da peça para cálculo
      const effectiveW = item.width + ITEM_GAP;
      const effectiveH = item.height + ITEM_GAP;
      
      for (let i = 0; i < item.quantity; i++) {
        allPrints.push({ w: effectiveW, h: effectiveH });
      }
    });

    // Ordenar por altura ajuda a otimizar (opcional, mas recomendado)
    allPrints.sort((a, b) => b.h - a.h);

    allPrints.forEach(print => {
      // Cabe na linha atual?
      if (currentX + print.w <= USABLE_WIDTH) {
        // Sim, adiciona na linha
        currentX += print.w;
        rowHeight = Math.max(rowHeight, print.h);
      } else {
        // Não, pula para próxima linha
        currentY += rowHeight;
        currentX = print.w; // Começa nova linha com este item
        rowHeight = print.h;
      }
    });

    // Soma a altura da última linha
    const finalHeightCm = currentY + rowHeight;
    const finalHeightMeters = finalHeightCm / 100;

    // Arredonda para cima com uma pequena margem de segurança (10cm) para corte/início
    const safeMeters = Math.ceil((finalHeightMeters + 0.1) * 100) / 100;

    setTotalMeters(safeMeters);
    setTotalCost(safeMeters * settings.serviceCosts.dtfPrintMeter);

  }, [items, settings.serviceCosts.dtfPrintMeter]);

  return (
    <div className="h-full flex flex-col font-montserrat overflow-hidden">
      <div className="mb-6 shrink-0">
        <div className="flex items-center gap-3 text-sow-black mb-1">
          <div className="p-2 bg-purple-100 rounded-lg"><Printer className="w-6 h-6 text-purple-600" /></div>
          <h2 className="text-2xl font-helvetica font-bold tracking-tight">Calculadora de Rolo DTF</h2>
        </div>
        <p className="text-sow-grey text-sm font-medium">
          Otimize o encaixe de estampas no rolo de {ROLL_WIDTH}cm e calcule o custo exato de impressão.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Coluna de Inputs */}
        <div className="lg:col-span-7 h-full min-h-0 flex flex-col">
          <div className="bg-white rounded-xl border border-sow-border shadow-soft overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-sow-border bg-gray-50 flex items-center justify-between">
              <h3 className="font-helvetica font-bold text-sow-black uppercase tracking-wider text-sm">Lista de Estampas</h3>
              <button onClick={addItem} className="flex items-center gap-2 text-xs font-bold bg-sow-black text-white px-3 py-2 rounded-lg hover:bg-sow-green transition-colors">
                <Plus className="w-4 h-4" /> Adicionar Estampa
              </button>
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded-lg border border-sow-border shadow-sm group">
                  <div className="col-span-4">
                    <InputGroup label="Descrição" name="desc" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} type="text" />
                  </div>
                  <div className="col-span-2">
                    <InputGroup label="Larg (cm)" name="w" value={item.width} onChange={(e) => updateItem(item.id, 'width', parseFloat(e.target.value))} type="number" />
                  </div>
                  <div className="col-span-2">
                    <InputGroup label="Alt (cm)" name="h" value={item.height} onChange={(e) => updateItem(item.id, 'height', parseFloat(e.target.value))} type="number" />
                  </div>
                  <div className="col-span-2">
                    <InputGroup label="Qtd" name="q" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))} type="number" step="1" />
                  </div>
                  <div className="col-span-2 flex justify-end pb-2">
                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-purple-50 border-t border-purple-100 text-xs text-purple-800 font-medium">
              <p>ℹ️ Considerado: Rolo {ROLL_WIDTH}cm | Margem Papel {PAPER_MARGIN}cm | Espaço entre artes {ITEM_GAP}cm</p>
            </div>
          </div>
        </div>

        {/* Coluna de Resultados */}
        <div className="lg:col-span-5 h-full flex flex-col gap-6 min-h-0">
          
          {/* Card Principal */}
          <div className="bg-white rounded-xl border-2 border-purple-500 shadow-lg p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5"><Ruler className="w-40 h-40 text-purple-600" /></div>
             
             <h3 className="font-helvetica font-bold uppercase tracking-widest text-sm text-sow-grey mb-2 relative z-10">
                Consumo Total de Rolo
             </h3>
             <span className="text-6xl font-helvetica font-bold text-purple-600 tracking-tighter relative z-10">
               {totalMeters.toFixed(2)}m
             </span>
             
             <div className="mt-8 pt-6 border-t border-gray-100 w-full relative z-10">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-sm font-bold text-sow-grey">Custo do Metro (Config)</span>
                   <span className="font-mono text-sow-black">{formatCurrency(settings.serviceCosts.dtfPrintMeter)}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-sow-black bg-gray-50 p-4 rounded-lg">
                   <span>Custo Total do Lote</span>
                   <span className="text-purple-600">{formatCurrency(totalCost)}</span>
                </div>
             </div>
          </div>

          {/* Dica de Aplicação */}
          <div className="bg-white p-6 rounded-xl border border-sow-border shadow-soft flex-1">
             <h4 className="font-bold text-sow-black mb-4 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-sow-green" /> Como usar este valor?
             </h4>
             <ul className="space-y-3 text-sm text-sow-grey">
                <li className="flex gap-2">
                   <span className="font-bold text-sow-black bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
                   <span>Pegue o <strong>Custo Total do Lote ({formatCurrency(totalCost)})</strong>.</span>
                </li>
                <li className="flex gap-2">
                   <span className="font-bold text-sow-black bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
                   <span>Vá para a aba <strong>Precificação</strong>.</span>
                </li>
                <li className="flex gap-2">
                   <span className="font-bold text-sow-black bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full text-xs">3</span>
                   <span>No item "DTF", insira esse valor dividido pela quantidade de peças, ou use o campo de "Logística/Outros" se preferir lançar o lote todo.</span>
                </li>
             </ul>
          </div>

        </div>
      </div>
    </div>
  );
};