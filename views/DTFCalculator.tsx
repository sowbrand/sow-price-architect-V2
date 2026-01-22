import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Trash2, Box, RefreshCw, Shirt, AlertTriangle, Download, Users, Building2 } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import { formatCurrency } from '../utils/pricingEngine';
import html2canvas from 'html2canvas'; 
import type { SettingsData } from '../types';

interface DTFCalculatorProps {
  settings: SettingsData;
  // Sem props de comunicação externa, funciona como calculadora visual independente
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
  error?: boolean; 
}

interface Point {
  x: number;
  y: number;
}

export const DTFCalculator: React.FC<DTFCalculatorProps> = ({ settings }) => {
  // Cores para diferenciar os grupos de camisetas visualmente
  const GROUP_COLORS = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#957DAD', '#D291BC'];

  // --- ESTADOS GLOBAIS ---
  const [shirtGroups, setShirtGroups] = useState<ShirtGroup[]>([
    {
      id: '1',
      name: 'Camiseta Exemplo',
      quantity: 20,
      color: GROUP_COLORS[0],
      prints: [
        { id: 'p1', description: 'Logo Peito', width: 10, height: 10 },
        { id: 'p2', description: 'Costas Grande', width: 28, height: 35 }
      ]
    },
    {
        id: '2',
        name: 'Camiseta Staff',
        quantity: 10,
        color: GROUP_COLORS[1],
        prints: [
          { id: 'p3', description: 'Logo Frente', width: 12, height: 12 }
        ]
      }
  ]);
  
  const [layout, setLayout] = useState<PlacedItem[]>([]);
  
  // Estados de Resultados (Cálculo)
  const [totalMeters, setTotalMeters] = useState(0);
  const [printCost, setPrintCost] = useState(0);
  const [appliedPricePerMeter, setAppliedPricePerMeter] = useState(60);
  const [priceTier, setPriceTier] = useState('');
  
  // Estados de Mão de Obra (Apenas visualização)
  const [appType, setAppType] = useState<'internal' | 'outsourced'>('internal');
  const [totalApplications, setTotalApplications] = useState(0);
  const [appCost, setAppCost] = useState(0);

  const [hasErrors, setHasErrors] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // --- CONFIGURAÇÕES FÍSICAS DO ROLO (LÓGICA BLINDADA) ---
  const ROLL_WIDTH_CM = 58; 
  const VISUAL_MARGIN_CM = 1; 
  const ITEM_GAP_CM = 1.0; 
  // Margem de segurança invisível para evitar erros de arredondamento do navegador
  const CALC_MARGIN_OFFSET = 0.05; 
  const MIN_X = VISUAL_MARGIN_CM + CALC_MARGIN_OFFSET; 
  const MAX_X = ROLL_WIDTH_CM - (VISUAL_MARGIN_CM + CALC_MARGIN_OFFSET);
  const MAX_W = MAX_X - MIN_X;

  const [scale, setScale] = useState(4); 
  const containerRef = useRef<HTMLDivElement>(null);

  // --- CONTROLE DE ESCALA DA VISUALIZAÇÃO (CORRIGIDO COM RESIZEOBSERVER) ---
  // Alterado para garantir que o papel ocupe a largura máxima ao trocar de aba
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth;
        
        // Só calcula se a largura for válida (maior que 0)
        if (availableWidth > 0) {
           // Subtrai uma margem fixa pequena (40px) para garantir que caiba sem gerar scroll horizontal indesejado
           // e compensar a barra de rolagem vertical e padding do container pai
           const paddingX = 40; 
           const targetWidth = availableWidth - paddingX;
           
           // Calcula a escala: Quantos pixels por CM são necessários para preencher a largura?
           const newScale = targetWidth / ROLL_WIDTH_CM;
           
           // Garante um mínimo de 2px por cm para visualização, mas usa o newScale se for maior
           setScale(Math.max(newScale, 2));
        }
      }
    };

    // O ResizeObserver "vigia" o elemento. Assim que a aba deixa de ser 'hidden',
    // ele dispara o updateScale e corrige o tamanho do papel instantaneamente.
    const observer = new ResizeObserver(() => {
      updateScale();
    });

    observer.observe(containerRef.current);

    // Chama uma vez no início para garantir
    updateScale();

    return () => observer.disconnect();
  }, []);

  // --- FUNÇÃO DE DOWNLOAD DE IMAGEM (HTML2CANVAS) ---
  const handleDownloadImage = async () => {
    const element = document.getElementById('print-area');
    if (!element) return;

    setIsExporting(true);
    try {
        // Pequeno delay para garantir renderização
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const canvas = await html2canvas(element, {
            scale: 2, // Alta resolução
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true
        });
        
        const link = document.createElement('a');
        link.download = `Layout_DTF_${totalMeters.toFixed(2)}m.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error("Erro ao gerar imagem", error);
        alert("Erro ao baixar imagem.");
    } finally {
        setIsExporting(false);
    }
  };

  // --- OPERAÇÕES CRUD (ADICIONAR/REMOVER CAMISETAS E ESTAMPAS) ---
  const addShirtGroup = () => {
    const nextColor = GROUP_COLORS[shirtGroups.length % GROUP_COLORS.length];
    setShirtGroups([...shirtGroups, {
      id: Math.random().toString(36).substr(2, 9),
      name: `Nova Camiseta ${shirtGroups.length + 1}`,
      quantity: 10,
      color: nextColor,
      prints: [{ id: Math.random().toString(36), description: 'Estampa 1', width: 10, height: 10 }]
    }]);
  };

  const removeShirtGroup = (id: string) => {
      setShirtGroups(shirtGroups.filter(g => g.id !== id));
  };
  
  const updateShirtGroup = (id: string, field: keyof ShirtGroup, value: any) => {
    setShirtGroups(shirtGroups.map(g => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const addPrintToGroup = (gid: string) => {
    setShirtGroups(shirtGroups.map(g => g.id !== gid ? g : {
        ...g, prints: [...g.prints, { id: Math.random().toString(36), description: 'Nova', width: 10, height: 10 }]
    }));
  };

  const removePrintFromGroup = (gid: string, pid: string) => {
    setShirtGroups(shirtGroups.map(g => g.id !== gid ? g : {
        ...g, prints: g.prints.filter(p => p.id !== pid)
    }));
  };

  const updatePrint = (gid: string, pid: string, field: keyof PrintLocation, value: any) => {
    setShirtGroups(shirtGroups.map(g => g.id !== gid ? g : {
        ...g, prints: g.prints.map(p => p.id === pid ? { ...p, [field]: value } : p)
    }));
  };

  // --- ALGORITMO DE ENCAIXE (TETRIS/BIN PACKING) V5 ---
  useEffect(() => {
    let errorFound = false;
    let items: { w: number, h: number, desc: string, color: string, groupName: string }[] = [];
    
    // 1. Flatten (Transforma grupos em lista única de itens para imprimir)
    // Também conta o total de aplicações para o custo de serviço
    let totalApps = 0;

    shirtGroups.forEach(g => {
        const printsInShirt = g.prints.length;
        const totalPrintsInGroup = printsInShirt * g.quantity;
        totalApps += totalPrintsInGroup;

        g.prints.forEach(p => {
            // Adiciona cada estampa individualmente na fila de impressão
            for (let i = 0; i < g.quantity; i++) {
                items.push({ w: p.width, h: p.height, desc: p.description, color: g.color, groupName: g.name });
            }
        });
    });

    setTotalApplications(totalApps);

    // 2. Cálculo do Custo de Aplicação (Serviço)
    if (appType === 'internal') {
        setAppCost(0);
    } else {
        // Regra de preço: Acima de 100un é mais barato
        const unitCost = totalApps > 100 ? 1.50 : 2.00;
        setAppCost(totalApps * unitCost);
    }

    // 3. Ordenação Inteligente (Heurística)
    // Prioriza peças mais altas para fechar colunas, depois por área
    items.sort((a, b) => {
        const maxDimA = Math.max(a.w, a.h);
        const maxDimB = Math.max(b.w, b.h);
        if (maxDimB !== maxDimA) return maxDimB - maxDimA;
        return (b.w * b.h) - (a.w * a.h); 
    });

    let placed: PlacedItem[] = [];

    // Função auxiliar para verificar colisão
    const checkOverlap = (x: number, y: number, w: number, h: number) => {
        // Verifica limite lateral direito
        if (x + w > MAX_X) return true;

        for (const r of placed) {
            // Verifica sobreposição com itens já posicionados + GAP
            if (
                x < r.x + r.width + ITEM_GAP_CM &&
                x + w + ITEM_GAP_CM > r.x &&
                y < r.y + r.height + ITEM_GAP_CM &&
                y + h + ITEM_GAP_CM > r.y
            ) {
                return true;
            }
        }
        return false;
    };

    // Estratégia "Best Fit" (Encontrar melhor posição)
    const findPos = (w: number, h: number) => {
        if (w > MAX_W) return null; // Impossível caber na largura

        let candidates: Point[] = [{ x: MIN_X, y: 0 }];
        
        // Gera pontos candidatos ao redor de cada peça já posicionada
        placed.forEach(r => {
            const rightX = r.x + r.width + ITEM_GAP_CM;
            if (rightX + w <= MAX_X) candidates.push({ x: rightX, y: r.y });
            
            const bottomY = r.y + r.height + ITEM_GAP_CM;
            candidates.push({ x: r.x, y: bottomY });
            
            candidates.push({ x: MIN_X, y: bottomY }); // Tenta voltar para a margem esquerda
        });

        // Filtra candidatos fora da largura
        candidates = candidates.filter(p => p.x + w <= MAX_X);

        // Ordena candidatos: Prioriza Y menor (topo), depois X menor (esquerda)
        candidates.sort((a, b) => {
            if (Math.abs(a.y - b.y) > 0.01) return a.y - b.y;
            return a.x - b.x;
        });

        // Testar candidatos na ordem
        for (const p of candidates) {
            if (!checkOverlap(p.x, p.y, w, h)) {
                return p;
            }
        }

        // Fallback: Coloca no final absoluto
        const maxY = placed.reduce((max, r) => Math.max(max, r.y + r.height + ITEM_GAP_CM), 0);
        return { x: MIN_X, y: maxY };
    };

    // Processa cada item da lista
    items.forEach(item => {
        // Tenta posição normal
        const posN = findPos(item.w, item.h);
        // Tenta posição rotacionada
        const posR = findPos(item.h, item.w);

        let final = null;
        let isRot = false;

        if (!posN && !posR) {
            // Erro Crítico: Item não cabe nem girando
            errorFound = true;
            placed.push({
                x: 0, y: 0, width: item.w, height: item.h, description: item.desc,
                color: '#ff4444', rotated: false, groupName: item.groupName, error: true
            });
            return;
        }

        // Lógica de Decisão: Escolhe a opção que coloca a peça mais para cima (menor Y)
        if (posN && !posR) { final = posN; isRot = false; }
        else if (!posN && posR) { final = posR; isRot = true; }
        else if (posN && posR) {
            // Se ambos cabem, compara Y
            if (posR.y < posN.y - 0.1) { final = posR; isRot = true; }
            else if (posN.y < posR.y - 0.1) { final = posN; isRot = false; }
            else {
                // Se Y for igual, prioriza esquerda
                if (posR.x < posN.x) { final = posR; isRot = true; }
                else { final = posN; isRot = false; }
            }
        }

        if (final) {
            placed.push({
                x: final.x, y: final.y,
                width: isRot ? item.h : item.w,
                height: isRot ? item.w : item.h,
                description: item.desc, color: item.color, rotated: isRot, groupName: item.groupName
            });
        }
    });

    // 4. Consolidação dos Resultados
    const validItems = placed.filter(i => !i.error);
    const maxY = validItems.reduce((max, r) => Math.max(max, r.y + r.height), 0);
    const meters = Math.ceil((maxY / 100) * 100) / 100; // Converte CM para Metros
    const safeMeters = meters > 0 ? meters + 0.05 : 0; // Margem de segurança de corte (5cm)

    // Definição de Preço por Tabela
    let price = 60; let tier = 'Tabela Base (até 10m)';
    if (safeMeters > 20) { price = 45; tier = 'Atacado Super (> 20m)'; }
    else if (safeMeters > 10) { price = 50; tier = 'Atacado (> 10m)'; }

    // Atualiza Estados
    setLayout(placed);
    setTotalMeters(safeMeters);
    setAppliedPricePerMeter(price);
    setPriceTier(tier);
    setPrintCost(safeMeters * price);
    setHasErrors(errorFound);

  }, [shirtGroups, appType]); // Recalcula sempre que inputs mudam

  return (
    <div className="h-full flex flex-col font-montserrat overflow-hidden">
      {/* CABEÇALHO */}
      <div className="mb-6 shrink-0 px-6 pt-6">
        <div className="flex items-center gap-3 text-sow-black mb-1">
          <div className="p-2 bg-purple-100 rounded-lg"><Printer className="w-6 h-6 text-purple-600" /></div>
          <h2 className="text-2xl font-helvetica font-bold tracking-tight">Otimizador DTF Pro</h2>
        </div>
        <p className="text-sow-grey text-sm font-medium">Otimização inteligente com cálculo de impressão e aplicação.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 px-6 pb-6">
        
        {/* COLUNA ESQUERDA: INPUTS DE CAMISETAS */}
        <div className="lg:col-span-5 h-full min-h-0 flex flex-col gap-6 overflow-y-auto pr-2 pb-10 scrollbar-thin">
            <div className="flex flex-col gap-6">
                {shirtGroups.map((group, idx) => {
                    const groupApps = group.prints.length * group.quantity;
                    return (
                    <div key={group.id} className="bg-white rounded-xl border-2 border-sow-border shadow-sm group-hover:border-purple-200 transition-colors">
                        {/* Header do Card da Camiseta */}
                        <div className="p-4 bg-gray-50 border-b border-sow-border flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 font-bold uppercase text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: group.color}}></div>
                                    <Shirt className="w-4 h-4 text-sow-grey" />
                                    <span>Modelo #{idx + 1}</span>
                                    {/* Badge discreto de aplicações */}
                                    <span className="text-[10px] text-gray-400 font-normal normal-case ml-1 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                        ({groupApps} aplicações)
                                    </span>
                                </div>
                                <button onClick={() => removeShirtGroup(group.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Remover Modelo">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {/* Inputs Principais do Grupo */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <InputGroup 
                                        label="Nome do Modelo" 
                                        name="gn" 
                                        value={group.name} 
                                        onChange={(e) => updateShirtGroup(group.id, 'name', e.target.value)} 
                                    />
                                </div>
                                <div className="col-span-1">
                                    <InputGroup 
                                        label="Qtd Peças" 
                                        name="gq" 
                                        value={group.quantity} 
                                        onChange={(e) => updateShirtGroup(group.id, 'quantity', parseFloat(e.target.value))} 
                                        type="number" 
                                        step="1" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lista de Estampas deste Grupo */}
                        <div className="p-4 space-y-3">
                            {group.prints.map((p) => (
                                <div key={p.id} className="flex flex-col md:flex-row gap-2 items-end bg-gray-50/50 p-2 rounded border border-gray-100 hover:border-purple-200 transition-colors">
                                    <div className="flex-1 w-full">
                                        <InputGroup 
                                            label="Descrição da Estampa" 
                                            name="pd" 
                                            value={p.description} 
                                            onChange={(e) => updatePrint(group.id, p.id, 'description', e.target.value)} 
                                        />
                                    </div>
                                    <div className="w-24">
                                        <InputGroup 
                                            label="Larg (cm)" 
                                            name="pw" 
                                            value={p.width} 
                                            onChange={(e) => updatePrint(group.id, p.id, 'width', parseFloat(e.target.value))} 
                                            type="number" 
                                        />
                                    </div>
                                    <div className="w-24">
                                        <InputGroup 
                                            label="Alt (cm)" 
                                            name="ph" 
                                            value={p.height} 
                                            onChange={(e) => updatePrint(group.id, p.id, 'height', parseFloat(e.target.value))} 
                                            type="number" 
                                        />
                                    </div>
                                    <button onClick={() => removePrintFromGroup(group.id, p.id)} className="text-gray-300 hover:text-red-500 pb-2 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => addPrintToGroup(group.id)} className="w-full py-2 text-xs font-bold text-purple-600 bg-purple-50 rounded border border-dashed border-purple-200 hover:bg-purple-100 flex items-center justify-center gap-1 transition-colors">
                                <Plus className="w-3 h-3" /> Adicionar Estampa
                            </button>
                        </div>
                    </div>
                )})}
                <button onClick={addShirtGroup} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-purple-500 hover:text-purple-600 flex items-center justify-center gap-2 transition-colors">
                    <Plus className="w-5 h-5" /> Novo Modelo de Camiseta
                </button>
            </div>
            
            {/* PAINEL DE CUSTOS (Resumo Financeiro) */}
            <div className="bg-white p-6 rounded-xl border-2 border-purple-500 shadow-lg mt-auto space-y-4">
                {hasErrors && (
                    <div className="mb-4 bg-red-100 text-red-700 p-3 rounded text-xs flex items-center gap-2 border border-red-200">
                        <AlertTriangle className="w-4 h-4" /> 
                        <span>Atenção: Existem itens excedendo a largura máxima do rolo!</span>
                    </div>
                )}
                
                {/* Seletor de Mão de Obra (Interna vs Terceirizada) */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setAppType('internal')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${appType === 'internal' ? 'bg-white shadow text-sow-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Building2 className="w-3 h-3" /> Na Empresa (0,00)
                    </button>
                    <button 
                        onClick={() => setAppType('outsourced')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${appType === 'outsourced' ? 'bg-purple-600 shadow text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Users className="w-3 h-3" /> Terceirizada
                    </button>
                </div>

                {/* Totais Calculados */}
                <div>
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-gray-500 uppercase">Total Impressão (DTF)</span>
                        <span className="text-xl font-helvetica font-bold text-sow-black">{formatCurrency(printCost)}</span>
                    </div>
                    
                    {/* Linha pontilhada separadora */}
                    <div className="flex justify-between items-end mt-1 pt-1 border-t border-dashed border-gray-200">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Aplicação ({totalApplications} un)</span>
                            {/* Mostra o preço unitário usado se for terceirizado */}
                            {appType === 'outsourced' && <span className="text-[9px] text-purple-500">{totalApplications > 100 ? 'R$ 1,50/un' : 'R$ 2,00/un'}</span>}
                        </div>
                        <span className={`text-sm font-bold ${appType === 'outsourced' ? 'text-purple-600' : 'text-gray-400'}`}>
                            + {formatCurrency(appCost)}
                        </span>
                    </div>

                    {/* Total Geral (Soma) */}
                    <div className="flex justify-between items-end mt-3 pt-2 border-t border-purple-100">
                         <span className="text-xs font-bold text-purple-800 uppercase">Custo Final Produção</span>
                         <span className="text-2xl font-black text-purple-700">{formatCurrency(printCost + appCost)}</span>
                    </div>
                </div>

                {/* Rodapé do Card de Preço */}
                <div className="mt-2 text-[10px] text-gray-400 flex justify-between">
                    <span>{totalMeters.toFixed(2)}m utilizados</span>
                    <span>{priceTier}</span>
                </div>
            </div>
        </div>

        {/* COLUNA DIREITA: VISUALIZAÇÃO DO ROLO */}
        <div className="lg:col-span-7 h-full flex flex-col min-h-0 bg-gray-100 rounded-xl border border-sow-border overflow-hidden relative">
            {/* Header da Visualização */}
            <div className="p-3 bg-white border-b border-sow-border flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold uppercase text-gray-500">Visualização</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <span className="w-2 h-2 bg-red-500 rounded-sm"></span> Área Morta ({VISUAL_MARGIN_CM}cm)
                    </div>
                    <button 
                        onClick={handleDownloadImage} 
                        disabled={isExporting} 
                        className="flex items-center gap-1 text-[10px] font-bold bg-sow-black text-white px-3 py-1.5 rounded hover:bg-sow-green disabled:opacity-50 transition-colors"
                    >
                        {isExporting ? '...' : <><Download className="w-3 h-3" /> PNG</>}
                    </button>
                </div>
            </div>

            {/* Container Scrollável da Área de Impressão */}
            <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-gray-200/50" ref={containerRef}>
                <div id="print-area" className="bg-white shadow-2xl relative transition-all duration-300 origin-top"
                    style={{
                        width: `${ROLL_WIDTH_CM * scale}px`,
                        height: `${Math.max(totalMeters * 100 * scale, 500)}px`,
                        backgroundImage: 'linear-gradient(45deg, #f8f8f8 25%, transparent 25%, transparent 75%, #f8f8f8 75%, #f8f8f8), linear-gradient(45deg, #f8f8f8 25%, transparent 25%, transparent 75%, #f8f8f8 75%, #f8f8f8)',
                        backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'
                    }}
                >
                    {/* ZONAS MORTAS (VISUAL) - Barras Vermelhas laterais */}
                    <div className="absolute top-0 bottom-0 left-0 bg-red-500/20 border-r border-red-500/50 z-50 pointer-events-none" style={{width: `${VISUAL_MARGIN_CM * scale}px`}}></div>
                    <div className="absolute top-0 bottom-0 right-0 bg-red-500/20 border-l border-red-500/50 z-50 pointer-events-none" style={{width: `${VISUAL_MARGIN_CM * scale}px`}}></div>

                    {/* Linhas Pontilhadas a cada metro */}
                    {[...Array(Math.ceil(totalMeters))].map((_, i) => (
                        <div key={i} className="absolute left-0 w-full border-b border-red-300 border-dashed text-red-400 text-[10px] pl-2 font-bold z-0" style={{top: `${(i+1) * 100 * scale}px`}}>
                            {i+1}m
                        </div>
                    ))}

                    {/* ITENS RENDERIZADOS */}
                    {layout.map((r, idx) => !r.error && (
                        <div key={idx} className="absolute flex flex-col items-center justify-center text-[9px] font-bold text-black/70 border border-black/10 shadow-sm z-10 hover:z-20 hover:scale-105 transition-transform cursor-pointer"
                            title={`${r.groupName} - ${r.description}`}
                            style={{
                                left: `${r.x * scale}px`, 
                                top: `${r.y * scale}px`,
                                width: `${r.width * scale}px`, 
                                height: `${r.height * scale}px`,
                                backgroundColor: r.color, 
                                borderRadius: '2px'
                            }}
                        >
                            {/* Ícone de rotação se a peça foi girada */}
                            {r.rotated && <RefreshCw className="w-3 h-3 text-black/40 absolute top-1 right-1" />}
                            
                            {/* Mostra dimensão se couber visualmente */}
                            {r.width * scale > 30 && r.height * scale > 15 && (
                                <span className="truncate px-1 max-w-full">{r.width}x{r.height}</span>
                            )}
                        </div>
                    ))}
                    
                    {/* Régua Lateral Fixa */}
                    <div className="absolute -right-6 top-0 bottom-0 w-6 flex flex-col items-center text-[9px] text-gray-400 pt-2">
                        <span className="sticky top-2 text-purple-600 font-bold">{totalMeters.toFixed(2)}m</span>
                    </div>
                </div>
            </div>
            
            {/* Indicador de Escala no canto */}
            <div className="absolute bottom-4 right-4 bg-black/80 text-white text-[10px] px-3 py-1 rounded-full shadow-lg z-50 pointer-events-none">
                1cm = {scale.toFixed(1)}px
            </div>
        </div>
      </div>
    </div>
  );
};