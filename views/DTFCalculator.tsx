import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Trash2, ArrowRight, Ruler, TrendingDown, Box, RefreshCw } from 'lucide-react';
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
  color: string;
}

// Item posicionado no rolo
interface PlacedItem {
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
  color: string;
  rotated: boolean;
}

// Ponto candidato para encaixe
interface Point {
  x: number;
  y: number;
}

export const DTFCalculator: React.FC<DTFCalculatorProps> = ({ settings }) => {
  const COLORS = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#957DAD', '#D291BC'];

  const [items, setItems] = useState<PrintItem[]>([
    { id: '1', width: 28, height: 35, quantity: 1, description: 'Estampa Grande', color: COLORS[0] },
    { id: '2', width: 10, height: 10, quantity: 4, description: 'Logo Pequeno', color: COLORS[1] }
  ]);
  
  const [layout, setLayout] = useState<PlacedItem[]>([]);
  const [totalMeters, setTotalMeters] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [appliedPrice, setAppliedPrice] = useState(60);
  const [priceTier, setPriceTier] = useState('');
  
  // CONSTANTES DE IMPRESSÃO
  const ROLL_WIDTH_CM = 58; 
  const PAPER_MARGIN_CM = 1; 
  const ITEM_GAP_CM = 1.0; 
  const USABLE_WIDTH = ROLL_WIDTH_CM - (PAPER_MARGIN_CM * 2);
  const MIN_X = PAPER_MARGIN_CM; // Início da área útil (1cm)
  const MAX_X = ROLL_WIDTH_CM - PAPER_MARGIN_CM; // Fim da área útil (57cm)

  // Escala visual
  const [scale, setScale] = useState(4); 
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 32;
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
      description: `Arte ${items.length + 1}`,
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

  // --- ALGORITMO "TETRIS" (Bottom-Left Greedy com Rotação) ---
  useEffect(() => {
    // 1. Explodir itens pela quantidade
    let itemsToPlace: { w: number, h: number, desc: string, color: string }[] = [];
    items.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
            itemsToPlace.push({ w: item.width, h: item.height, desc: item.description, color: item.color });
        }
    });

    // 2. Ordenar: Maior primeiro
    itemsToPlace.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));

    let placedRects: PlacedItem[] = [];

    // Função para checar colisão
    const checkOverlap = (x: number, y: number, w: number, h: number) => {
        // Limite da direita
        if (x + w > MAX_X) return true; 

        // Colisão com outros itens
        for (let r of placedRects) {
            const rRight = r.x + r.width;
            const rBottom = r.y + r.height;
            const myRight = x + w;
            const myBottom = y + h;

            if (
                x < rRight + ITEM_GAP_CM &&
                myRight + ITEM_GAP_CM > r.x &&
                y < rBottom + ITEM_GAP_CM &&
                myBottom + ITEM_GAP_CM > r.y
            ) {
                return true;
            }
        }
        return false;
    };

    // 3. Loop de Posicionamento
    itemsToPlace.forEach(item => {
        let bestPos: { x: number, y: number, rotated: boolean } | null = null;
        let minY = Infinity;
        let minX = Infinity;

        // Gerar pontos candidatos
        // Ponto inicial absoluto: (Margem, 0)
        let candidates: Point[] = [{ x: MIN_X, y: 0 }]; 
        
        placedRects.forEach(r => {
            // Candidato à direita de um item: X = (X do item + Largura do item + GAP)
            if (r.x + r.width + ITEM_GAP_CM + item.w <= MAX_X) {
                candidates.push({ x: r.x + r.width + ITEM_GAP_CM, y: r.y });
            }
            
            // Candidato abaixo de um item: Mantém o X do item, Y = (Y do item + Altura do item + GAP)
            candidates.push({ x: r.x, y: r.y + r.height + ITEM_GAP_CM });
            
            // Candidato "Reset de Linha": Encostado na margem esquerda (MIN_X), na altura abaixo de um item existente
            // CORREÇÃO: Aqui usamos MIN_X direto, sem somar GAP, pois a margem já é a segurança.
            candidates.push({ x: MIN_X, y: r.y + r.height + ITEM_GAP_CM });
        });

        // Ordenar candidatos
        candidates.sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y);

        // Testar posicionamento
        for (let p of candidates) {
            if (bestPos && p.y > bestPos.y) break;

            // Teste 1: Orientação Normal
            if (!checkOverlap(p.x, p.y, item.w, item.h)) {
                if (p.y < minY || (p.y === minY && p.x < minX)) {
                    minY = p.y;
                    minX = p.x;
                    bestPos = { x: p.x, y: p.y, rotated: false };
                }
            }

            // Teste 2: Rotacionado
            if (item.w !== item.h) {
                if (!checkOverlap(p.x, p.y, item.h, item.w)) {
                    if (p.y < minY || (p.y === minY && p.x < minX)) {
                        minY = p.y;
                        minX = p.x;
                        bestPos = { x: p.x, y: p.y, rotated: true };
                    }
                }
            }
            
            if (bestPos && bestPos.y === 0) break; 
        }

        // Fallback: Se não achou (põe no final, encostado na esquerda)
        if (!bestPos) {
            const lastY = placedRects.length > 0 
                ? Math.max(...placedRects.map(r => r.y + r.height)) + ITEM_GAP_CM 
                : 0;
            bestPos = { x: MIN_X, y: lastY, rotated: false };
        }

        placedRects.push({
            x: bestPos.x,
            y: bestPos.y,
            width: bestPos.rotated ? item.h : item.w,
            height: bestPos.rotated ? item.w : item.h,
            description: item.desc,
            color: item.color,
            rotated: bestPos.rotated
        });
    });

    // 4. Calcular métricas finais
    const maxY = placedRects.reduce((max, r) => Math.max(max, r.y + r.height), 0);
    const finalMeters = maxY / 100;
    const safeMeters = Math.ceil((finalMeters + 0.05) * 100) / 100; 

    // 5. Aplicar Tabela
    let currentPrice = 60; 
    let currentTier = 'Tabela Base (até 10m)';

    if (safeMeters > 20) {
        currentPrice = 45;
        currentTier = 'Atacado Super (> 20m)';
    } else if (safeMeters > 10) {
        currentPrice = 50;
        currentTier = 'Atacado (> 10m)';
    }

    setLayout(placedRects);
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
          <h2 className="text-2xl font-helvetica font-bold tracking-tight">Otimizador de Rolo DTF (Tetris)</h2>
        </div>
        <p className="text-sow-grey text-sm font-medium">
          Sistema inteligente de encaixe automático com rotação de peças para economia máxima de papel.
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
                        <div key={item.id} className="flex flex-col gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 relative group">
                            {/* Linha 1 */}
                            <div className="flex items-center gap-2 w-full">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: item.color}}></div>
                                <div className="flex-1">
                                    <InputGroup label="Descrição" name="d" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 pt-3">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            {/* Linha 2 */}
                            <div className="grid grid-cols-3 gap-3 w-full">
                                <InputGroup label="Larg (cm)" name="w" value={item.width} onChange={(e) => updateItem(item.id, 'width', parseFloat(e.target.value))} type="number" />
                                <InputGroup label="Alt (cm)" name="h" value={item.height} onChange={(e) => updateItem(item.id, 'height', parseFloat(e.target.value))} type="number" />
                                <InputGroup label="Qtd" name="q" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))} type="number" step="1" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-white p-6 rounded-xl border-2 border-purple-500 shadow-lg">
                <h3 className="font-helvetica font-bold uppercase tracking-widest text-xs text-sow-grey mb-4">Orçamento Otimizado</h3>
                
                <div className="flex justify-between items-end mb-2">
                    <span className="text-4xl font-helvetica font-bold text-sow-black">{formatCurrency(totalCost)}</span>
                    <div className="text-right">
                        <span className="text-sm font-bold text-purple-600 block">{totalMeters.toFixed(2)} metros</span>
                        <span className="text-[10px] text-sow-grey">Rolo 58cm (Gap {ITEM_GAP_CM}cm)</span>
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
                    <span className="text-xs font-bold uppercase text-sow-grey">Simulação de Encaixe Automático</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-medium text-sow-grey">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-300 rounded-sm"></span> Área Morta</span>
                    <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 text-purple-600" /> Peça Rotacionada</span>
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
                    {/* Área Morta Esquerda e Direita (Visual) */}
                    <div className="absolute top-0 bottom-0 left-0 bg-red-500/10 border-r border-red-500/20 z-0 pointer-events-none" style={{width: `${PAPER_MARGIN_CM * scale}px`}}></div>
                    <div className="absolute top-0 bottom-0 right-0 bg-red-500/10 border-l border-red-500/20 z-0 pointer-events-none" style={{width: `${PAPER_MARGIN_CM * scale}px`}}></div>

                    {/* Linhas indicativas de metro */}
                    {[...Array(Math.ceil(totalMeters))].map((_, i) => (
                        <div key={i} className="absolute left-0 w-full border-b border-red-300 border-dashed text-red-400 text-[10px] pl-1 font-bold z-0" style={{top: `${(i+1) * 100 * scale}px`}}>{i+1}m</div>
                    ))}
                    
                    {/* Itens posicionados */}
                    {layout.map((rect, idx) => (
                        <div
                            key={idx}
                            className="absolute flex flex-col items-center justify-center text-[10px] font-bold text-sow-black/70 overflow-hidden hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer border border-black/20 shadow-sm z-10"
                            title={`${rect.description}: ${rect.width}x${rect.height} (Rotacionado: ${rect.rotated ? 'Sim' : 'Não'})`}
                            style={{
                                left: `${rect.x * scale}px`,
                                top: `${rect.y * scale}px`,
                                width: `${rect.width * scale}px`,
                                height: `${rect.height * scale}px`,
                                backgroundColor: rect.color,
                                borderRadius: '3px'
                            }}
                        >
                            {/* Ícone de rotação se a peça foi virada */}
                            {rect.rotated && <RefreshCw className="w-3 h-3 text-black/40 absolute top-1 right-1" />}
                            
                            {/* Texto (Só mostra se couber) */}
                            {rect.width * scale > 30 && rect.height * scale > 15 && (
                                <>
                                    <span className="truncate px-1 max-w-full">{rect.width}x{rect.height}</span>
                                    {rect.height * scale > 30 && <span className="text-[8px] opacity-60 truncate px-1 max-w-full">{rect.description}</span>}
                                </>
                            )}
                        </div>
                    ))}

                    {/* Régua Lateral */}
                    <div className="absolute -right-8 top-0 bottom-0 w-6 flex flex-col items-center text-[9px] text-gray-400 pt-2" >
                        <div className="sticky top-2 flex flex-col gap-1">
                            <span className="font-bold text-purple-600">{totalMeters.toFixed(2)}m</span>
                            <span className="h-4 w-px bg-purple-200 mx-auto"></span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none shadow-lg">
                Zoom: 1cm = {scale.toFixed(1)}px
            </div>
        </div>
      </div>
    </div>
  );
};