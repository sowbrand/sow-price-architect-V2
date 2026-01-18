import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Trash2, ArrowRight, Ruler, TrendingDown, Box, RefreshCw, Shirt } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import { formatCurrency } from '../utils/pricingEngine';
import type { SettingsData } from '../types';

interface DTFCalculatorProps {
  settings: SettingsData;
}

// Nova Estrutura Hierárquica
interface PrintLocation {
  id: string;
  description: string;
  width: number;
  height: number;
}

interface ShirtGroup {
  id: string;
  name: string;
  quantity: number; // Quantidade de Camisetas
  color: string; // Cor visual para o gráfico
  prints: PrintLocation[];
}

// Item posicionado no rolo (Layout final)
interface PlacedItem {
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
  color: string;
  rotated: boolean;
  groupName: string;
}

interface Point {
  x: number;
  y: number;
}

export const DTFCalculator: React.FC<DTFCalculatorProps> = ({ settings }) => {
  // Paleta de cores para diferenciar os Grupos de Camisetas
  const GROUP_COLORS = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#957DAD', '#D291BC'];

  // Estado inicial com o exemplo que você pediu
  const [shirtGroups, setShirtGroups] = useState<ShirtGroup[]>([
    {
      id: '1',
      name: 'Camiseta Diaconia',
      quantity: 20,
      color: GROUP_COLORS[0],
      prints: [
        { id: 'p1', description: 'Logo Peito (Esq)', width: 10, height: 10 },
        { id: 'p2', description: 'Logo Costas', width: 28, height: 10 },
        { id: 'p3', description: 'Frase "Eis-me"', width: 20, height: 5 }
      ]
    },
    {
        id: '2',
        name: 'Camiseta Louvor',
        quantity: 20,
        color: GROUP_COLORS[1],
        prints: [
          { id: 'p4', description: 'Logo Adoração', width: 25, height: 25 },
          { id: 'p5', description: 'Nuca', width: 8, height: 8 }
        ]
      }
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
  const MIN_X = PAPER_MARGIN_CM; 
  const MAX_X = ROLL_WIDTH_CM - PAPER_MARGIN_CM;

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

  // --- GERENCIAMENTO DE CAMISETAS (GRUPOS) ---
  const addShirtGroup = () => {
    const nextColor = GROUP_COLORS[shirtGroups.length % GROUP_COLORS.length];
    const newGroup: ShirtGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Nova Camiseta ${shirtGroups.length + 1}`,
      quantity: 10,
      color: nextColor,
      prints: [{ id: Math.random().toString(36), description: 'Estampa 1', width: 10, height: 10 }]
    };
    setShirtGroups([...shirtGroups, newGroup]);
  };

  const removeShirtGroup = (groupId: string) => {
    setShirtGroups(shirtGroups.filter(g => g.id !== groupId));
  };

  const updateShirtGroup = (groupId: string, field: keyof ShirtGroup, value: any) => {
    setShirtGroups(shirtGroups.map(g => (g.id === groupId ? { ...g, [field]: value } : g)));
  };

  // --- GERENCIAMENTO DE ESTAMPAS DENTRO DA CAMISETA ---
  const addPrintToGroup = (groupId: string) => {
    setShirtGroups(shirtGroups.map(group => {
        if (group.id !== groupId) return group;
        return {
            ...group,
            prints: [...group.prints, { id: Math.random().toString(36), description: 'Nova Estampa', width: 10, height: 10 }]
        };
    }));
  };

  const removePrintFromGroup = (groupId: string, printId: string) => {
    setShirtGroups(shirtGroups.map(group => {
        if (group.id !== groupId) return group;
        return { ...group, prints: group.prints.filter(p => p.id !== printId) };
    }));
  };

  const updatePrint = (groupId: string, printId: string, field: keyof PrintLocation, value: any) => {
    setShirtGroups(shirtGroups.map(group => {
        if (group.id !== groupId) return group;
        return {
            ...group,
            prints: group.prints.map(p => (p.id === printId ? { ...p, [field]: value } : p))
        };
    }));
  };

  // --- ALGORITMO "SMART TETRIS" V3 (Adaptado para Hierarquia) ---
  useEffect(() => {
    // 1. "Explodir" a hierarquia em uma lista plana de itens para o algoritmo
    let itemsToPlace: { w: number, h: number, desc: string, color: string, groupName: string }[] = [];
    
    shirtGroups.forEach(group => {
        group.prints.forEach(print => {
            // Adiciona a estampa X vezes (quantidade de camisetas)
            for (let i = 0; i < group.quantity; i++) {
                itemsToPlace.push({ 
                    w: print.width, 
                    h: print.height, 
                    desc: print.description, 
                    color: group.color,
                    groupName: group.name
                });
            }
        });
    });

    // 2. Ordenar: Maior dimensão primeiro
    itemsToPlace.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));

    let placedRects: PlacedItem[] = [];

    // Função para checar colisão
    const checkOverlap = (x: number, y: number, w: number, h: number) => {
        if (x + w > MAX_X) return true; 

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

    // Função Best Fit
    const findBestPosition = (w: number, h: number) => {
        let candidates: Point[] = [{ x: MIN_X, y: 0 }];
        placedRects.forEach(r => {
            if (r.x + r.width + ITEM_GAP_CM + w <= MAX_X) {
                candidates.push({ x: r.x + r.width + ITEM_GAP_CM, y: r.y });
            }
            candidates.push({ x: r.x, y: r.y + r.height + ITEM_GAP_CM });
            candidates.push({ x: MIN_X, y: r.y + r.height + ITEM_GAP_CM });
        });

        candidates.sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y);

        for (let p of candidates) {
            if (!checkOverlap(p.x, p.y, w, h)) return { x: p.x, y: p.y };
        }
        
        const lastY = placedRects.length > 0 ? Math.max(...placedRects.map(r => r.y + r.height)) + ITEM_GAP_CM : 0;
        return { x: MIN_X, y: lastY };
    };

    // 3. Loop de Posicionamento
    itemsToPlace.forEach(item => {
        const posNormal = findBestPosition(item.w, item.h);
        const posRotated = findBestPosition(item.h, item.w);

        let finalPos;
        // Prefere rotação se economizar Y
        if (posRotated.y < posNormal.y || (posRotated.y === posNormal.y && posRotated.x < posNormal.x)) {
             finalPos = { x: posRotated.x, y: posRotated.y, w: item.h, h: item.w, rotated: true };
        } else {
             finalPos = { x: posNormal.x, y: posNormal.y, w: item.w, h: item.h, rotated: false };
        }

        placedRects.push({
            x: finalPos.x,
            y: finalPos.y,
            width: finalPos.w,
            height: finalPos.h,
            description: item.desc,
            color: item.color,
            rotated: finalPos.rotated,
            groupName: item.groupName
        });
    });

    // 4. Métricas Finais
    const maxY = placedRects.reduce((max, r) => Math.max(max, r.y + r.height), 0);
    const finalMeters = maxY / 100;
    const safeMeters = Math.ceil((finalMeters + 0.05) * 100) / 100; 

    // 5. Tabela de Preço
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

  }, [shirtGroups]); // Recalcula quando qualquer dado da camisa mudar

  return (
    <div className="h-full flex flex-col font-montserrat overflow-hidden">
      <div className="mb-6 shrink-0">
        <div className="flex items-center gap-3 text-sow-black mb-1">
          <div className="p-2 bg-purple-100 rounded-lg"><Printer className="w-6 h-6 text-purple-600" /></div>
          <h2 className="text-2xl font-helvetica font-bold tracking-tight">Otimizador DTF por Camiseta</h2>
        </div>
        <p className="text-sow-grey text-sm font-medium">
          Adicione modelos de camisetas e suas estampas. O sistema multiplica e encaixa automaticamente.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* COLUNA ESQUERDA: INPUTS DE CAMISETAS */}
        <div className="lg:col-span-5 h-full min-h-0 flex flex-col gap-6 overflow-y-auto pr-2 pb-10 scrollbar-thin">
            
            {/* Lista de Grupos de Camisetas */}
            <div className="flex flex-col gap-6">
                {shirtGroups.map((group, index) => (
                    <div key={group.id} className="bg-white rounded-xl border-2 border-sow-border shadow-sm overflow-hidden group-hover:border-purple-200 transition-colors">
                        {/* Cabeçalho da Camiseta */}
                        <div className="p-4 bg-gray-50 border-b border-sow-border flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 text-sow-black font-bold uppercase tracking-wide text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: group.color}}></div>
                                    <Shirt className="w-4 h-4 text-sow-grey" />
                                    <span>Modelo #{index + 1}</span>
                                </div>
                                <button onClick={() => removeShirtGroup(group.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <InputGroup label="Nome da Camiseta" name="gn" value={group.name} onChange={(e) => updateShirtGroup(group.id, 'name', e.target.value)} />
                                </div>
                                <div className="col-span-1">
                                    <InputGroup label="Qtd. Camisetas" name="gq" value={group.quantity} onChange={(e) => updateShirtGroup(group.id, 'quantity', parseFloat(e.target.value))} type="number" step="1" />
                                </div>
                            </div>
                        </div>

                        {/* Lista de Estampas da Camiseta */}
                        <div className="p-4 bg-white">
                            <h4 className="text-[10px] font-bold text-sow-grey uppercase mb-3 flex items-center justify-between">
                                Estampas desta peça
                                <button onClick={() => addPrintToGroup(group.id)} className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-[10px] bg-purple-50 px-2 py-1 rounded">
                                    <Plus className="w-3 h-3" /> Add Estampa
                                </button>
                            </h4>
                            
                            <div className="space-y-3">
                                {group.prints.map((print) => (
                                    <div key={print.id} className="flex gap-2 items-end bg-gray-50/50 p-2 rounded border border-gray-100">
                                        <div className="flex-1">
                                            <InputGroup label="Local/Desc." name="pd" value={print.description} onChange={(e) => updatePrint(group.id, print.id, 'description', e.target.value)} />
                                        </div>
                                        <div className="w-20">
                                            <InputGroup label="Larg" name="pw" value={print.width} onChange={(e) => updatePrint(group.id, print.id, 'width', parseFloat(e.target.value))} type="number" />
                                        </div>
                                        <div className="w-20">
                                            <InputGroup label="Alt" name="ph" value={print.height} onChange={(e) => updatePrint(group.id, print.id, 'height', parseFloat(e.target.value))} type="number" />
                                        </div>
                                        <button onClick={() => removePrintFromGroup(group.id, print.id)} className="text-gray-300 hover:text-red-500 pb-2">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-purple-50/50 p-2 text-center border-t border-purple-100 text-[10px] text-purple-800 font-medium">
                            Total de estampas neste lote: {group.prints.length * group.quantity} un
                        </div>
                    </div>
                ))}

                <button onClick={addShirtGroup} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Adicionar Novo Modelo de Camiseta
                </button>
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-white p-6 rounded-xl border-2 border-purple-500 shadow-lg mt-auto">
                <h3 className="font-helvetica font-bold uppercase tracking-widest text-xs text-sow-grey mb-4">Orçamento Geral do Lote</h3>
                
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
                    <span className="text-xs font-bold uppercase text-sow-grey">Simulação de Impressão (Todos os Modelos)</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-medium text-sow-grey">
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
                            title={`${rect.groupName} - ${rect.description}: ${rect.width}x${rect.height}`}
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
                                    <span className="truncate px-1 max-w-full text-[9px]">{rect.width}x{rect.height}</span>
                                    {rect.height * scale > 30 && <span className="text-[7px] opacity-60 truncate px-1 max-w-full leading-tight">{rect.description}</span>}
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