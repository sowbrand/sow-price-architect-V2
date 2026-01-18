import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Trash2, ArrowRight, Ruler, TrendingDown, Box, Info } from 'lucide-react';
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
  color: string; // Cor para visualização
}

// Interface para o item já posicionado no rolo
interface PlacedItem {
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
  color: string;
}

export const DTFCalculator: React.FC<DTFCalculatorProps> = ({ settings }) => {
  // Cores pastéis para diferenciar os itens visualmente
  const COLORS = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#957DAD', '#D291BC'];

  const [items, setItems] = useState<PrintItem[]>([
    { id: '1', width: 28, height: 35, quantity: 10, description: 'Estampa Costas', color: COLORS[0] },
    { id: '2', width: 10, height: 10, quantity: 10, description: 'Logo Peito', color: COLORS[1] }
  ]);
  
  const [layout, setLayout] = useState<PlacedItem[]>([]);
  const [totalMeters, setTotalMeters] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [appliedPrice, setAppliedPrice] = useState(60);
  const [priceTier, setPriceTier] = useState('');
  
  // Constantes de impressão (Físicas)
  const ROLL_WIDTH_CM = 58; 
  const PAPER_MARGIN_CM = 1; 
  const ITEM_GAP_CM = 1.5; 
  const USABLE_WIDTH = ROLL_WIDTH_CM - (PAPER_MARGIN_CM * 2);

  // Escala para visualização na tela (1cm = X pixels)
  const [scale, setScale] = useState(4); 
  const containerRef = useRef<HTMLDivElement>(null);

  // Ajusta a escala visual baseada na largura da coluna
  useEffect(() => {
    if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 32; // padding
        // O rolo tem 58cm. Quantos pixels por cm cabem na tela?
        const newScale = containerWidth / ROLL_WIDTH_CM;
        setScale(newScale);
    }
  }, []);

  const addItem = () => {
    const nextColor = COLORS[items.length % COLORS.length];
    const newItem: PrintItem = {
      id: Math.random().toString(36).substr(2, 9),
      width: 10,
      height: 10,
      quantity: 1,
      description: `Estampa ${items.length + 1}`,
      color: nextColor
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof PrintItem, value: any) => {
    setItems(items.map(i => (i.id === id ? { ...i, [field]: value } : i)));
  };

  // --- O CÉREBRO: Algoritmo "Smart Tetris" (Shelf First Fit) ---
  useEffect(() => {
    // 1. "Explodir" os itens pela quantidade (se tenho 10 logos, crio 10 objetos)
    let allRects: PlacedItem[] = [];
    items.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
            allRects.push({
                x: 0, y: 0,
                width: item.width,
                height: item.height,
                description: item.description,
                color: item.color
            });
        }
    });

    // 2. Ordenar por Altura (Decrescente) - Importante para eficiência do algoritmo
    allRects.sort((a, b) => b.height - a.height);

    // 3. Algoritmo de Prateleira (Shelf Bin Packing)
    let shelves: { y: number, height: number, currentWidth: number }[] = [];
    let currentY = 0;

    // Margem inicial do topo
    const START_Y = 0.5; // cm (margem de segurança inicial)

    allRects.forEach(rect => {
        let placed = false;
        
        // Espaço ocupado pela peça + gap
        const physicalW = rect.width + ITEM_GAP_CM;
        const physicalH = rect.height + ITEM_GAP_CM;

        // Tenta encaixar em prateleiras existentes (buracos)
        for (let shelf of shelves) {
            // Verifica se cabe na largura E se a altura da peça não estoura muito a prateleira (opcional, aqui aceitamos se couber na largura)
            if (shelf.currentWidth + physicalW <= USABLE_WIDTH) {
                // Posiciona
                rect.x = PAPER_MARGIN_CM + shelf.currentWidth;
                
                // Centraliza verticalmente na prateleira ou alinha ao topo? Alinhar ao topo da prateleira (shelf.y)
                rect.y = shelf.y + START_Y; 
                
                shelf.currentWidth += physicalW;
                placed = true;
                break;
            }
        }

        // Se não coube em nenhuma, cria nova prateleira
        if (!placed) {
            // Nova prateleira começa onde a última "linha" terminou
            // A altura da prateleira é definida pela primeira peça (que é a mais alta pois ordenamos)
            const shelfY = shelves.length > 0 ? shelves[shelves.length-1].y + shelves[shelves.length-1].height : 0;
            
            rect.x = PAPER_MARGIN_CM;
            rect.y = shelfY + START_Y;
            
            shelves.push({
                y: shelfY,
                height: physicalH,
                currentWidth: physicalW
            });
            placed = true;
        }
    });

    // 4. Calcular métricas finais
    const totalHeightCm = shelves.reduce((acc, shelf) => acc + shelf.height, 0);
    const finalMeters = totalHeightCm / 100;
    // Margem final de segurança (corte)
    const safeMeters = Math.ceil((finalMeters + 0.1) * 100) / 100;

    // 5. Aplicar Tabela de Preço
    let currentPrice = 60; 
    let currentTier = 'Tabela Base (até 10m)';

    if (safeMeters > 20) {
        currentPrice = 45;
        currentTier = 'Atacado Super (> 20m)';
    } else if (safeMeters > 10) {
        currentPrice = 50;
        currentTier = 'Atacado (> 10m)';
    }

    setLayout(allRects);
    setTotalMeters(safeMeters);
    setAppliedPrice(currentPrice);
    setPriceTier(currentTier);
    setTotalCost(safeMeters * currentPrice);

  }, [items]);

  return (
    <div className="h-full flex flex-col font-montserrat overflow-hidden">
      <div className="mb-6 shrink-0">
        <div className="flex items-center gap-3 text-sow-black mb-1">
          <div className="p-2 bg-purple-100 rounded-lg"><Printer className="w-6 h-6 text-purple-600" /></div>
          <h2 className="text-2xl font-helvetica font-bold tracking-tight">Otimizador de Rolo DTF</h2>
        </div>
        <p className="text-sow-grey text-sm font-medium">
          Sistema "Smart Nesting": Reduz desperdício encaixando artes automaticamente.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* COLUNA ESQUERDA: INPUTS */}
        <div className="lg:col-span-5 h-full min-h-0 flex flex-col gap-6 overflow-y-auto pr-1">
            {/* Lista de Itens */}
            <div className="bg-white p-4 rounded-xl border border-sow-border shadow-soft">
                <div className="flex justify-between items-center mb-4 border-b border-sow-border pb-2">
                    <h3 className="font-bold text-sm text-sow-black uppercase">Artes para Impressão</h3>
                    <button onClick={addItem} className="flex items-center gap-1 text-xs font-bold bg-sow-black text-white px-3 py-1.5 rounded hover:bg-sow-green transition-colors">
                        <Plus className="w-3 h-3" /> Nova
                    </button>
                </div>

                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 relative group">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: item.color}}></div>
                                <div className="flex-1">
                                    <InputGroup label="Descrição" name="d" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/3"><InputGroup label="Larg (cm)" name="w" value={item.width} onChange={(e) => updateItem(item.id, 'width', parseFloat(e.target.value))} type="number" /></div>
                                <div className="w-1/3"><InputGroup label="Alt (cm)" name="h" value={item.height} onChange={(e) => updateItem(item.id, 'height', parseFloat(e.target.value))} type="number" /></div>
                                <div className="w-1/3"><InputGroup label="Qtd" name="q" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))} type="number" step="1" /></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-white p-6 rounded-xl border-2 border-purple-500 shadow-lg">
                <h3 className="font-helvetica font-bold uppercase tracking-widest text-xs text-sow-grey mb-4">Orçamento Estimado</h3>
                
                <div className="flex justify-between items-end mb-2">
                    <span className="text-4xl font-helvetica font-bold text-sow-black">{formatCurrency(totalCost)}</span>
                    <div className="text-right">
                        <span className="text-sm font-bold text-purple-600 block">{totalMeters.toFixed(2)} metros</span>
                        <span className="text-[10px] text-sow-grey">Rolo 58cm</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-sow-grey font-medium">Tabela Aplicada:</span>
                        <span className="font-bold text-sow-black bg-yellow-100 px-2 py-0.5 rounded">{priceTier}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                        <span className="text-sow-grey font-medium">Custo Unitário do Metro:</span>
                        <span className="font-bold text-sow-black">{formatCurrency(appliedPrice)}</span>
                    </div>
                    {appliedPrice < 60 && (
                        <div className="mt-2 bg-green-50 text-green-700 text-[10px] font-bold p-2 rounded flex items-center gap-1 justify-center">
                            <TrendingDown className="w-3 h-3" /> Economia de atacado aplicada!
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* COLUNA DIREITA: VISUALIZAÇÃO DO ROLO */}
        <div className="lg:col-span-7 h-full flex flex-col min-h-0 bg-gray-100 rounded-xl border border-sow-border overflow-hidden relative">
            <div className="p-3 bg-white border-b border-sow-border flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold uppercase text-sow-grey">Simulação Visual do Rolo (58cm)</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-medium text-sow-grey">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-300 rounded-sm"></span> Área Morta (Margem)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 border border-gray-400 bg-white rounded-sm"></span> Área Útil</span>
                </div>
            </div>

            {/* ÁREA DE DESENHO (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto p-4 flex justify-center" ref={containerRef}>
                <div 
                    className="bg-white shadow-2xl relative transition-all duration-300 border-x-8 border-gray-300"
                    style={{
                        width: `${ROLL_WIDTH_CM * scale}px`, // Largura real convertida para pixels
                        height: `${Math.max(totalMeters * 100 * scale, 500)}px`, // Altura dinâmica
                        backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 10px 10px'
                    }}
                >
                    {/* Linha indicativa de 1 metro */}
                    <div className="absolute left-0 w-full border-b border-red-300 border-dashed text-red-400 text-[10px] pl-1" style={{top: `${100 * scale}px`}}>1m</div>
                    
                    {/* Itens posicionados */}
                    {layout.map((rect, idx) => (
                        <div
                            key={idx}
                            className="absolute flex items-center justify-center text-[10px] font-bold text-sow-black/60 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer border border-black/10 shadow-sm"
                            title={`${rect.description} (${rect.width}x${rect.height})`}
                            style={{
                                left: `${rect.x * scale}px`,
                                top: `${rect.y * scale}px`,
                                width: `${rect.width * scale}px`,
                                height: `${rect.height * scale}px`,
                                backgroundColor: rect.color,
                                borderRadius: '2px'
                            }}
                        >
                            {/* Mostra texto só se couber */}
                            {rect.width * scale > 30 && rect.height * scale > 15 ? (
                                <span className="truncate px-1">{rect.width}x{rect.height}</span>
                            ) : ''}
                        </div>
                    ))}

                    {/* Régua Lateral */}
                    <div className="absolute -right-8 top-0 bottom-0 w-6 flex flex-col items-center text-[9px] text-gray-400 pt-2 gap-[100px]" style={{gap: `${100 * scale}px`}}>
                        <span>0m</span>
                        <span>1m</span>
                        <span>2m</span>
                        <span>3m</span>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
                Escala: 1cm = {scale.toFixed(1)}px
            </div>
        </div>
      </div>
    </div>
  );
};