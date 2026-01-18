import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Trash2, Box, RefreshCw, Shirt, AlertTriangle, Download, Users, Building2 } from 'lucide-react';
import { InputGroup } from '../components/InputGroup';
import { formatCurrency } from '../utils/pricingEngine';
import html2canvas from 'html2canvas'; 
import type { SettingsData, DTFResultData } from '../types';

interface DTFCalculatorProps {
  settings: SettingsData;
  onCalculationChange?: (data: DTFResultData) => void;
}

// Estruturas Internas
interface PrintLocation { id: string; description: string; width: number; height: number; }
interface ShirtGroup { id: string; name: string; quantity: number; color: string; prints: PrintLocation[]; }
interface PlacedItem { x: number; y: number; width: number; height: number; description: string; color: string; rotated: boolean; groupName: string; error?: boolean; }
interface Point { x: number; y: number; }

export const DTFCalculator: React.FC<DTFCalculatorProps> = ({ settings, onCalculationChange }) => {
  const GROUP_COLORS = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#957DAD', '#D291BC'];

  const [shirtGroups, setShirtGroups] = useState<ShirtGroup[]>([
    {
      id: '1', name: 'Camiseta Exemplo', quantity: 20, color: GROUP_COLORS[0],
      prints: [{ id: 'p1', description: 'Frente', width: 28, height: 35 }]
    }
  ]);
  
  const [layout, setLayout] = useState<PlacedItem[]>([]);
  const [totalMeters, setTotalMeters] = useState(0);
  const [printCost, setPrintCost] = useState(0);
  const [appliedPricePerMeter, setAppliedPricePerMeter] = useState(60);
  const [priceTier, setPriceTier] = useState('');
  const [appType, setAppType] = useState<'internal' | 'outsourced'>('internal');
  const [totalApplications, setTotalApplications] = useState(0);
  const [appCost, setAppCost] = useState(0);
  const [hasErrors, setHasErrors] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // --- CONFIGURAÇÕES BLINDADAS ---
  const ROLL_WIDTH_CM = 58; 
  const VISUAL_MARGIN_CM = 1; 
  const ITEM_GAP_CM = 1.0; 
  // Margem de segurança de 0.5mm para evitar erros de renderização
  const CALC_MARGIN_OFFSET = 0.05; 
  const MIN_X = VISUAL_MARGIN_CM + CALC_MARGIN_OFFSET; 
  const MAX_X = ROLL_WIDTH_CM - (VISUAL_MARGIN_CM + CALC_MARGIN_OFFSET); 
  const MAX_W = MAX_X - MIN_X;

  const [scale, setScale] = useState(4); 
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 32;
        const newScale = containerWidth / ROLL_WIDTH_CM;
        setScale(newScale);
    }
  }, []);

  const handleDownloadImage = async () => {
    const element = document.getElementById('print-area');
    if (!element) return;
    setIsExporting(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 200));
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
        const link = document.createElement('a');
        link.download = `Layout_DTF_${totalMeters.toFixed(2)}m.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) { console.error(error); alert("Erro ao baixar."); } 
    finally { setIsExporting(false); }
  };

  const addShirtGroup = () => setShirtGroups([...shirtGroups, { id: Math.random().toString(36).substr(2, 9), name: `Modelo ${shirtGroups.length + 1}`, quantity: 10, color: GROUP_COLORS[shirtGroups.length % GROUP_COLORS.length], prints: [{ id: Math.random().toString(36), description: 'Estampa 1', width: 10, height: 10 }] }]);
  const removeShirtGroup = (id: string) => setShirtGroups(shirtGroups.filter(g => g.id !== id));
  const updateShirtGroup = (id: string, field: keyof ShirtGroup, value: any) => setShirtGroups(shirtGroups.map(g => (g.id === id ? { ...g, [field]: value } : g)));
  const addPrintToGroup = (gid: string) => setShirtGroups(shirtGroups.map(g => g.id !== gid ? g : { ...g, prints: [...g.prints, { id: Math.random().toString(36), description: 'Nova', width: 10, height: 10 }] }));
  const removePrintFromGroup = (gid: string, pid: string) => setShirtGroups(shirtGroups.map(g => g.id !== gid ? g : { ...g, prints: g.prints.filter(p => p.id !== pid) }));
  const updatePrint = (gid: string, pid: string, field: keyof PrintLocation, value: any) => setShirtGroups(shirtGroups.map(g => g.id !== gid ? g : { ...g, prints: g.prints.map(p => p.id === pid ? { ...p, [field]: value } : p) }));

  // --- ALGORITMO OTIMIZADO V5 ---
  useEffect(() => {
    let errorFound = false;
    let items: { w: number, h: number, desc: string, color: string, groupName: string }[] = [];
    let totalApps = 0;

    shirtGroups.forEach(g => {
        totalApps += g.prints.length * g.quantity;
        g.prints.forEach(p => {
            for (let i = 0; i < g.quantity; i++) items.push({ w: p.width, h: p.height, desc: p.description, color: g.color, groupName: g.name });
        });
    });

    setTotalApplications(totalApps);
    const calculatedAppCost = appType === 'internal' ? 0 : (totalApps * (totalApps > 100 ? 1.50 : 2.00));
    setAppCost(calculatedAppCost);

    // Ordenação Inteligente (Altura > Largura)
    items.sort((a, b) => {
        const maxA = Math.max(a.w, a.h);
        const maxB = Math.max(b.w, b.h);
        if (maxB !== maxA) return maxB - maxA;
        return (b.w * b.h) - (a.w * a.h);
    });

    let placed: PlacedItem[] = [];
    
    const checkOverlap = (x: number, y: number, w: number, h: number) => {
        if (x + w > MAX_X) return true;
        for (const r of placed) {
            if (x < r.x + r.width + ITEM_GAP_CM && x + w + ITEM_GAP_CM > r.x && y < r.y + r.height + ITEM_GAP_CM && y + h + ITEM_GAP_CM > r.y) return true;
        }
        return false;
    };

    const findPos = (w: number, h: number) => {
        if (w > MAX_W) return null;
        let candidates: Point[] = [{ x: MIN_X, y: 0 }];
        placed.forEach(r => {
            if (r.x + r.width + ITEM_GAP_CM + w <= MAX_X) candidates.push({ x: r.x + r.width + ITEM_GAP_CM, y: r.y });
            candidates.push({ x: r.x, y: r.y + r.height + ITEM_GAP_CM });
            candidates.push({ x: MIN_X, y: r.y + r.height + ITEM_GAP_CM });
        });
        candidates = candidates.filter(p => p.x + w <= MAX_X);
        candidates.sort((a, b) => Math.abs(a.y - b.y) > 0.01 ? a.y - b.y : a.x - b.x);
        for (const p of candidates) if (!checkOverlap(p.x, p.y, w, h)) return p;
        return { x: MIN_X, y: placed.reduce((max, r) => Math.max(max, r.y + r.height + ITEM_GAP_CM), 0) };
    };

    items.forEach(item => {
        const posN = findPos(item.w, item.h);
        const posR = findPos(item.h, item.w);
        let final = null, isRot = false;

        if (!posN && !posR) {
            errorFound = true;
            placed.push({ x: 0, y: 0, width: item.w, height: item.h, description: item.desc, color: '#ff4444', rotated: false, groupName: item.groupName, error: true });
        } else {
            if (posN && posR) {
                if (posR.y < posN.y - 0.1) { final = posR; isRot = true; }
                else if (posN.y < posR.y - 0.1) { final = posN; isRot = false; }
                else { final = posR.x < posN.x ? posR : posN; isRot = final === posR; }
            } else {
                final = posN || posR; isRot = final === posR;
            }
            placed.push({ ...final!, width: isRot ? item.h : item.w, height: isRot ? item.w : item.h, description: item.desc, color: item.color, rotated: isRot, groupName: item.groupName });
        }
    });

    const validItems = placed.filter(i => !i.error);
    const maxY = validItems.reduce((max, r) => Math.max(max, r.y + r.height), 0);
    const meters = Math.ceil((maxY / 100) * 100) / 100;
    const safeMeters = meters > 0 ? meters + 0.05 : 0;
    
    let price = 60; let tier = 'Tabela Base';
    if (safeMeters > 20) { price = 45; tier = 'Atacado Super'; } else if (safeMeters > 10) { price = 50; tier = 'Atacado'; }
    const calculatedPrintCost = safeMeters * price;

    setLayout(placed); setTotalMeters(safeMeters); setAppliedPricePerMeter(price); setPriceTier(tier); setPrintCost(calculatedPrintCost); setHasErrors(errorFound);

    if (onCalculationChange) {
        onCalculationChange({
            totalMeters: safeMeters,
            printCost: calculatedPrintCost,
            appCost: calculatedAppCost,
            totalCost: calculatedPrintCost + calculatedAppCost,
            totalItems: totalApps,
            priceTier: tier,
            isOutsourced: appType === 'outsourced'
        });
    }
  }, [shirtGroups, appType]);

  return (
    <div className="flex flex-col h-full overflow-hidden font-montserrat">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-5 h-full flex flex-col gap-4 overflow-y-auto pr-2 pb-4 scrollbar-thin">
            {shirtGroups.map((group, idx) => (
                <div key={group.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                    <div className="flex justify-between items-center mb-2 border-b pb-2">
                        <div className="flex items-center gap-2 font-bold text-sm text-gray-700">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: group.color}}></div>
                            <span>{group.name}</span>
                            <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500">({group.prints.length * group.quantity} un)</span>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => addPrintToGroup(group.id)} className="text-purple-600 p-1"><Plus className="w-4 h-4"/></button>
                            <button onClick={() => removeShirtGroup(group.id)} className="text-red-400 p-1"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <InputGroup label="Nome" name="n" value={group.name} onChange={e => updateShirtGroup(group.id, 'name', e.target.value)} />
                        <InputGroup label="Qtd" name="q" value={group.quantity} onChange={e => updateShirtGroup(group.id, 'quantity', parseFloat(e.target.value))} type="number" />
                    </div>
                    <div className="space-y-2">
                        {group.prints.map(p => (
                            <div key={p.id} className="flex gap-1 items-end text-xs">
                                <div className="flex-1"><InputGroup label="Desc" name="d" value={p.description} onChange={e => updatePrint(group.id, p.id, 'description', e.target.value)} /></div>
                                <div className="w-16"><InputGroup label="L" name="w" value={p.width} onChange={e => updatePrint(group.id, p.id, 'width', parseFloat(e.target.value))} type="number" /></div>
                                <div className="w-16"><InputGroup label="A" name="h" value={p.height} onChange={e => updatePrint(group.id, p.id, 'height', parseFloat(e.target.value))} type="number" /></div>
                                <button onClick={() => removePrintFromGroup(group.id, p.id)} className="text-red-300 pb-1"><Trash2 className="w-3 h-3"/></button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <button onClick={addShirtGroup} className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 text-xs font-bold hover:bg-gray-50">+ Add Camiseta</button>

            <div className="bg-white p-4 rounded-xl border-2 border-purple-500 shadow-lg mt-auto">
                <div className="flex bg-gray-100 p-1 rounded-md mb-3">
                    <button onClick={() => setAppType('internal')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${appType === 'internal' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>Na Empresa (0,00)</button>
                    <button onClick={() => setAppType('outsourced')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${appType === 'outsourced' ? 'bg-purple-600 shadow text-white' : 'text-gray-400'}`}>Terceirizada</button>
                </div>
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] uppercase text-gray-500 font-bold">Impressão ({totalMeters.toFixed(2)}m)</span>
                    <span className="text-lg font-bold">{formatCurrency(printCost)}</span>
                </div>
                <div className="flex justify-between items-end border-t border-dashed pt-1 mb-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-gray-500 font-bold">Aplicação ({totalApplications} un)</span>
                        {appType === 'outsourced' && <span className="text-[9px] text-purple-500">{totalApplications > 100 ? 'R$ 1,50' : 'R$ 2,00'}/un</span>}
                    </div>
                    <span className="text-sm font-bold text-purple-600">+ {formatCurrency(appCost)}</span>
                </div>
                <div className="flex justify-between items-center bg-purple-50 p-2 rounded border border-purple-100">
                    <span className="text-xs font-bold text-purple-800 uppercase">Total Produção</span>
                    <span className="text-xl font-black text-purple-700">{formatCurrency(printCost + appCost)}</span>
                </div>
            </div>
        </div>

        <div className="lg:col-span-7 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex flex-col relative h-full">
            <div className="p-2 bg-white border-b flex justify-between items-center text-xs font-bold text-gray-500">
                <span>Visualização (58cm)</span>
                <button onClick={handleDownloadImage} disabled={isExporting} className="flex items-center gap-1 bg-black text-white px-2 py-1 rounded hover:bg-gray-800 disabled:opacity-50"><Download className="w-3 h-3"/> {isExporting ? '...' : 'PNG'}</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-gray-200/50" ref={containerRef}>
                <div id="print-area" className="bg-white shadow-xl relative transition-all" style={{width: `${ROLL_WIDTH_CM * scale}px`, height: `${Math.max(totalMeters * 100 * scale, 500)}px`, backgroundSize: '20px 20px', backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0)'}}>
                    <div className="absolute inset-y-0 left-0 bg-red-500/20 border-r border-red-500 z-50 pointer-events-none" style={{width: `${VISUAL_MARGIN_CM * scale}px`}}></div>
                    <div className="absolute inset-y-0 right-0 bg-red-500/20 border-l border-red-500 z-50 pointer-events-none" style={{width: `${VISUAL_MARGIN_CM * scale}px`}}></div>
                    {[...Array(Math.ceil(totalMeters))].map((_, i) => <div key={i} className="absolute left-0 w-full border-b border-red-300 border-dashed text-red-400 text-[9px] pl-2 font-bold z-0" style={{top: `${(i+1) * 100 * scale}px`}}>{i+1}m</div>)}
                    {layout.map((r, idx) => !r.error && (
                        <div key={idx} className="absolute flex flex-col items-center justify-center text-[8px] font-bold text-black/60 border border-black/10 z-10 box-border leading-none" style={{left: `${r.x * scale}px`, top: `${r.y * scale}px`, width: `${r.width * scale}px`, height: `${r.height * scale}px`, backgroundColor: r.color, borderRadius: '2px'}}>
                            {r.rotated && <RefreshCw className="w-3 h-3 absolute top-0.5 right-0.5 text-black/30"/>}
                            {r.width*scale > 20 && r.height*scale > 10 && <span>{r.width}x{r.height}</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};