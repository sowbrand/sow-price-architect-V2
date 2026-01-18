import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Trash2, ArrowRight, Ruler, TrendingDown, Box, RefreshCw, Shirt, AlertTriangle } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import { formatCurrency } from '../utils/pricingEngine';
import type { SettingsData } from '../types';

interface DTFCalculatorProps {
  settings: SettingsData;
}

// --- ESTRUTURAS DE DADOS ---
interface PrintLocation {
  id: string;
  description: string;
  width: number;
  height: number;
}

interface ShirtGroup {
  id: string;
  name: string;
  quantity: number;
  color: string;
  prints: PrintLocation[];
}

interface PlacedItem {
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
  color: string;
  rotated: boolean;
  groupName: string;
  error?: boolean; // Marca se o item não coube de jeito nenhum
}

interface Point {
  x: number;
  y: number;
}

// Função de arredondamento para 2 casas decimais para evitar flutuação (ex: 57.0000001)
const round = (num: number) => Math.round(num * 100) / 100;

export const DTFCalculator: React.FC<DTFCalculatorProps> = ({ settings }) => {
  const GROUP_COLORS = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#957DAD', '#D291BC'];

  // Dados Iniciais (Exemplo)
  const [shirtGroups, setShirtGroups] = useState<ShirtGroup[]>([
    {
      id: '1',
      name: 'Camiseta Diaconia',
      quantity: 20,
      color: GROUP_COLORS[0],
      prints: [
        { id: 'p1', description: 'Logo Peito', width: 10, height: 10 },
        { id: 'p2', description: 'Logo Costas', width: 28, height: 10 },
        { id: 'p3', description: 'Frase', width: 20, height: 5 }
      ]
    },
    {
        id: '2',
        name: 'Camiseta Louvor',
        quantity: 20,
        color: GROUP_COLORS[1],
        prints: [
          { id: 'p4', description: 'Arte Grande', width: 28, height: 35 },
          { id: 'p5', description: 'Nuca', width: 8, height: 8 }
        ]
      }
  ]);
  
  const [layout, setLayout] = useState<PlacedItem[]>([]);
  const [totalMeters, setTotalMeters] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [appliedPrice, setAppliedPrice] = useState(60);
  const [priceTier, setPriceTier] = useState('');
  const [hasErrors, setHasErrors] = useState(false);
  
  // --- CONFIGURAÇÕES FÍSICAS RÍGIDAS ---
  const ROLL_WIDTH_CM = 58; 
  const PAPER_MARGIN_CM = 1; 
  const ITEM_GAP_CM = 1.0; 
  
  // Limites da Área Útil (Tolerância Zero)
  const MIN_X = PAPER_MARGIN_CM; // 1.00
  const MAX_X = ROLL_WIDTH_CM - PAPER_MARGIN_CM; // 57.00
  const MAX_W = MAX_X - MIN_X; // Largura máxima permitida para uma peça (56.00)

  // Escala Visual
  const [scale, setScale] = useState(4); 
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 32;
        const newScale = containerWidth / ROLL_WIDTH_CM;
        setScale(newScale);
    }
  }, []);

  // --- CRUD (Adicionar/Remover/Editar) ---
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

  // --- ALGORITMO "TOLERÂNCIA ZERO" (Bin Packing Otimizado) ---
  useEffect(() => {
    let errorFound = false;
    
    // 1. Preparar lista plana de itens
    let itemsToPlace: { w: number, h: number, desc: string, color: string, groupName: string }[] = [];
    
    shirtGroups.forEach(group => {
        group.prints.forEach(print => {
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

    // 2. Ordenação Estratégica: ALTURA Decrescente
    // Isso é crucial para o "Tetris". Peças altas primeiro definem o "skyline", peças baixas preenchem os buracos.
    itemsToPlace.sort((a, b) => Math.max(b.h, b.w) - Math.max(a.h, a.w));

    let placedRects: PlacedItem[] = [];

    // Função de Verificação de Colisão RÍGIDA
    const checkOverlap = (x: number, y: number, w: number, h: number) => {
        // [TRAVA 1] Limite Direito Absoluto (Área Morta)
        // Usamos uma tolerância minúscula (0.01) para float bugs, mas a lógica é x+w > 57
        if (round(x + w) > MAX_X) return true; 

        // [TRAVA 2] Colisão com outros itens
        for (let r of placedRects) {
            // Coordenadas do item existente (com gap virtual em volta)
            // Se eu tentar colocar algo no GAP de outro, conta como colisão
            const rRight = r.x + r.width;
            const rBottom = r.y + r.height;
            const myRight = x + w;
            const myBottom = y + h;

            if (
                round(x) < round(rRight + ITEM_GAP_CM) &&
                round(myRight + ITEM_GAP_CM) > round(r.x) &&
                round(y) < round(rBottom + ITEM_GAP_CM) &&
                round(myBottom + ITEM_GAP_CM) > round(r.y)
            ) {
                return true;
            }
        }
        return false;
    };

    // Buscador de Melhor Posição
    const findBestPosition = (w: number, h: number) => {
        // Se a peça é maior que a largura útil (56cm), ela NÃO CABE.
        if (w > MAX_W) return null;

        let bestX = Infinity;
        let bestY = Infinity;
        let found = false;

        // Gera candidatos. Pontos candidatos são: (MargemEsq, 0) E (Direita de cada item, Topo de cada item)
        // Isso garante que testamos todos os "cantinhos".
        let candidates: Point[] = [{ x: MIN_X, y: 0 }];
        
        placedRects.forEach(r => {
            // Candidato à direita (mantendo Y)
            const nextX = round(r.x + r.width + ITEM_GAP_CM);
            if (nextX + w <= MAX_X) {
                candidates.push({ x: nextX, y: r.y });
            }
            // Candidato abaixo (mantendo X)
            candidates.push({ x: r.x, y: round(r.y + r.height + ITEM_GAP_CM) });
            // Candidato reset de linha (encostado na margem esquerda, na altura do item)
            candidates.push({ x: MIN_X, y: round(r.y + r.height + ITEM_GAP_CM) });
        });

        // Filtra candidatos fora do papel (redundante mas seguro)
        candidates = candidates.filter(p => p.x + w <= MAX_X);

        // Ordena candidatos: Menor Y (Topo) >> Menor X (Esquerda)
        candidates.sort((a, b) => {
            if (Math.abs(a.y - b.y) > 0.1) return a.y - b.y; // Se Y for diferente, menor Y ganha
            return a.x - b.x; // Se Y for igual, menor X ganha
        });

        // Testa o primeiro que der certo
        for (let p of candidates) {
            if (!checkOverlap(p.x, p.y, w, h)) {
                return { x: p.x, y: p.y };
            }
        }
        
        // Se não achou em nenhum buraco, coloca no finalzão absoluto
        const lastY = placedRects.length > 0 ? Math.max(...placedRects.map(r => r.y + r.height)) + ITEM_GAP_CM : 0;
        return { x: MIN_X, y: round(lastY) };
    };

    // 3. Execução do Loop Principal
    itemsToPlace.forEach(item => {
        // Tenta Normal
        const posNormal = findBestPosition(item.w, item.h);
        // Tenta Rotacionado
        const posRotated = findBestPosition(item.h, item.w);

        let finalPos;
        let isRotated = false;

        // Lógica de Decisão:
        // 1. Se nenhum couber (ex: peça gigante de 60cm), marca erro.
        // 2. Se só um couber, usa ele.
        // 3. Se ambos couberem, usa o que tiver menor Y.

        if (!posNormal && !posRotated) {
            // Erro Crítico: Peça maior que o rolo
            errorFound = true;
            // Força entrada no layout apenas para alertar, na posição 0,0 com flag de erro
            placedRects.push({
                x: 0, y: 0, width: item.w, height: item.h, description: item.desc, 
                color: '#ff0000', rotated: false, groupName: item.groupName, error: true
            });
            return;
        }

        if (posNormal && !posRotated) {
            finalPos = posNormal;
            isRotated = false;
        } else if (!posNormal && posRotated) {
            finalPos = posRotated;
            isRotated = true;
        } else if (posNormal && posRotated) {
            // Ambos cabem. Quem é melhor? (Menor Y ganha)
            if (posRotated.y < posNormal.y - 0.1) { // Rotação sobe significativamente?
                finalPos = posRotated;
                isRotated = true;
            } else if (posRotated.y > posNormal.y + 0.1) {
                finalPos = posNormal;
                isRotated = false;
            } else {
                // Y igual. Quem fica mais a esquerda?
                if (posRotated.x < posNormal.x) {
                    finalPos = posRotated;
                    isRotated = true;
                } else {
                    finalPos = posNormal;
                    isRotated = false;
                }
            }
        }

        if (finalPos) {
            placedRects.push({
                x: finalPos.x,
                y: finalPos.y,
                width: isRotated ? item.h : item.w,
                height: isRotated ? item.w : item.h,
                description: item.desc,
                color: item.color,
                rotated: isRotated,
                groupName: item.groupName
            });
        }
    });

    // 4. Calcular Totais
    const maxY = placedRects.filter(r => !r.error).reduce((max, r) => Math.max(max, r.y + r.height), 0);
    const finalMeters = maxY / 100;
    const safeMeters = Math.ceil((finalMeters + 0.05) * 100) / 100; // +5cm margem técnica

    // 5. Preços
    let currentPrice = 60; 
    let currentTier = 'Tabela Base (até 10m)';
    if (safeMeters > 20) { currentPrice = 45; currentTier = 'Atacado Super (> 20m)'; }
    else if (safeMeters > 10) { currentPrice = 50; currentTier = 'Atacado (> 10m)'; }

    setLayout(placedRects);
    setTotalMeters(safeMeters);
    setAppliedPrice(currentPrice);
    setPriceTier(currentTier);
    setTotalCost(safeMeters * currentPrice);
    setHasErrors(errorFound);

  }, [shirtGroups]);

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
        {/* COLUNA ESQUERDA: INPUTS */}
        <div className="lg:col-span-5 h-full min-h-0 flex flex-col gap-6 overflow-y-auto pr-2 pb-10 scrollbar-thin">
            
            <div className="flex flex-col gap-6">
                {shirtGroups.map((group, index) => (
                    <div key={group.id} className="bg-white rounded-xl border-2 border-sow-border shadow-sm overflow-hidden group-hover:border-purple-200 transition-colors">
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

                        <div className="p-4 bg-white">
                            <h4 className="text-[10px] font-bold text-sow-grey uppercase mb-3 flex items-center justify-between">
                                Estampas desta peça
                                <button onClick={() => addPrintToGroup(group.id)} className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-[10px] bg-purple-50 px-2 py-1 rounded">
                                    <Plus className="w-3 h-3" /> Add Estampa
                                </button>
                            </h4>
                            <div className="space-y-3">
                                {group.prints.map((print) => (
                                    <div key={print.id} className="flex flex-col md:flex-row gap-2 items-end bg-gray-50/50 p-2 rounded border border-gray-100">
                                        <div className="flex-1 w-full">
                                            <InputGroup label="Local/Desc." name="pd" value={print.description} onChange={(e) => updatePrint(group.id, print.id, 'description', e.target.value)} />
                                        </div>
                                        <div className="w-28 md:w-32">
                                            <InputGroup label="Larg (cm)" name="pw" value={print.width} onChange={(e) => updatePrint(group.id, print.id, 'width', parseFloat(e.target.value))} type="number" />
                                        </div>
                                        <div className="w-28 md:w-32">
                                            <InputGroup label="Alt (cm)" name="ph" value={print.height} onChange={(e) => updatePrint(group.id, print.id, 'height', parseFloat(e.target.value))} type="number" />
                                        </div>
                                        <button onClick={() => removePrintFromGroup(group.id, print.id)} className="text-gray-300 hover:text-red-500 pb-2 pl-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-purple-50/50 p-2 text-center border-t border-purple-100 text-[10px] text-purple-800 font-medium">
                            Total: {group.prints.length * group.quantity} estampas
                        </div>
                    </div>
                ))}
                <button onClick={addShirtGroup} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Adicionar Novo Modelo
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-purple-500 shadow-lg mt-auto">
                <h3 className="font-helvetica font-bold uppercase tracking-widest text-xs text-sow-grey mb-4">Orçamento Geral</h3>
                {hasErrors && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Atenção: Existem peças maiores que a largura do rolo ({ROLL_WIDTH_CM}cm)!</span>
                    </div>
                )}
                <div className="flex justify-between items-end mb-2">
                    <span className="text-4xl font-helvetica font-bold text-sow-black">{formatCurrency(totalCost)}</span>
                    <div className="text-right">
                        <span className="text-sm font-bold text-purple-600 block">{totalMeters.toFixed(2)} metros</span>
                        <span className="text-[10px] text-sow-grey">Rolo 58cm (Gap {ITEM_GAP_CM}cm)</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-sow-grey font-medium">Tabela: {priceTier}</span>
                        <span className="font-bold text-sow-black">{formatCurrency(appliedPrice)}/m</span>
                    </div>
                </div>
            </div>
        </div>

        {/* COLUNA DIREITA: VISUALIZAÇÃO DO ROLO */}
        <div className="lg:col-span-7 h-full flex flex-col min-h-0 bg-gray-100 rounded-xl border border-sow-border overflow-hidden relative">
            <div className="p-3 bg-white border-b border-sow-border flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold uppercase text-sow-grey">Simulação de Encaixe</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-medium text-sow-grey">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-sm"></span> Área Morta (1cm)</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex justify-center" ref={containerRef}>
                <div 
                    className="bg-white shadow-2xl relative transition-all duration-300 border-x-8 border-gray-300"
                    style={{
                        width: `${ROLL_WIDTH_CM * scale}px`, 
                        height: `${Math.max(totalMeters * 100 * scale, 500)}px`, 
                        backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 10px 10px'
                    }}
                >
                    {/* LINHAS DE METRO */}
                    {[...Array(Math.ceil(totalMeters))].map((_, i) => (
                        <div key={i} className="absolute left-0 w-full border-b border-red-300 border-dashed text-red-400 text-[10px] pl-1 font-bold z-0" style={{top: `${(i+1) * 100 * scale}px`}}>{i+1}m</div>
                    ))}
                    
                    {/* ITENS POSICIONADOS */}
                    {layout.map((rect, idx) => {
                        if (rect.error) return null; // Não desenha se for inválido
                        return (
                            <div
                                key={idx}
                                className="absolute flex flex-col items-center justify-center text-[10px] font-bold text-sow-black/70 overflow-hidden hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer border border-black/20 shadow-sm z-10 box-border"
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
                                {rect.rotated && <RefreshCw className="w-3 h-3 text-black/40 absolute top-1 right-1" />}
                                {rect.width * scale > 30 && rect.height * scale > 15 && (
                                    <span className="truncate px-1 max-w-full text-[9px]">{rect.width}x{rect.height}</span>
                                )}
                            </div>
                        );
                    })}

                    {/* ÁREA MORTA (ACIMA DE TUDO - Z-INDEX MAXIMO 50) */}
                    <div className="absolute top-0 bottom-0 left-0 bg-red-500/30 border-r border-red-500 z-50 pointer-events-none" style={{width: `${PAPER_MARGIN_CM * scale}px`}}></div>
                    <div className="absolute top-0 bottom-0 right-0 bg-red-500/30 border-l border-red-500 z-50 pointer-events-none" style={{width: `${PAPER_MARGIN_CM * scale}px`}}></div>

                    {/* Régua Lateral */}
                    <div className="absolute -right-8 top-0 bottom-0 w-6 flex flex-col items-center text-[9px] text-gray-400 pt-2" >
                        <div className="sticky top-2 flex flex-col gap-1">
                            <span className="font-bold text-purple-600">{totalMeters.toFixed(2)}m</span>
                            <span className="h-4 w-px bg-purple-200 mx-auto"></span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none shadow-lg z-30">
                Zoom: 1cm = {scale.toFixed(1)}px
            </div>
        </div>
      </div>
    </div>
  );
};