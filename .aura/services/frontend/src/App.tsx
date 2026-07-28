import { useState, useEffect, useCallback } from 'react';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

// Типизация данных узла
interface NodeData {
  label: string;
  type?: string;
  fullPath?: string;
  shells?: string[];
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'map'>('main');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMapData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/map');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Record<string, string[]> = await response.json();

      // 1. Создаем фоновые зоны проекта (Механика, ИИ, Логика/Данные)
      const liveNodes: Node[] = [
        { id: 'ZONE_PHYSICS', data: { label: '' }, position: { x: -450, y: -400 }, style: { width: '400px', height: '800px', background: 'rgba(30, 41, 59, 0.15)', border: '2px dashed rgba(56, 189, 248, 0.4)', borderRadius: '16px', pointerEvents: 'none', zIndex: -1 } },
        { id: 'ZONE_AI', data: { label: '' }, position: { x: -20, y: -400 }, style: { width: '400px', height: '800px', background: 'rgba(88, 28, 135, 0.08)', border: '2px dashed rgba(168, 85, 247, 0.4)', borderRadius: '16px', pointerEvents: 'none', zIndex: -1 } },
        { id: 'ZONE_DATA', data: { label: '' }, position: { x: 410, y: -400 }, style: { width: '400px', height: '800px', background: 'rgba(20, 184, 166, 0.08)', border: '2px dashed rgba(20, 184, 166, 0.4)', borderRadius: '16px', pointerEvents: 'none', zIndex: -1 } },
        
        // Текстовые маркеры-заголовки поверх зон
        { id: 'TXT_PHYS', data: { label: '🔵 МЕХАНИКА И ФИЗИКА' }, position: { x: -350, y: -380 }, style: { color: '#38bdf8', fontWeight: 'bold', border: 'none', background: 'none', fontSize: '14px', fontFamily: 'system-ui' }, type: 'output' },
        { id: 'TXT_AI', data: { label: '🧠 ИИ И УПРАВЛЕНИЕ' }, position: { x: 100, y: -380 }, style: { color: '#c084fc', fontWeight: 'bold', border: 'none', background: 'none', fontSize: '14px', fontFamily: 'system-ui' }, type: 'output' },
        { id: 'TXT_DATA', data: { label: '🟢 ЛОГИКА И ДАННЫЕ' }, position: { x: 530, y: -380 }, style: { color: '#14b8a6', fontWeight: 'bold', border: 'none', background: 'none', fontSize: '14px', fontFamily: 'system-ui' }, type: 'output' },

        // Центральный ствол дерева
        { id: 'CORE', type: 'input', data: { label: '🪐 AURA CORE' }, position: { x: 130, y: 0 }, style: { background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#000', fontWeight: '900', border: 'none', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.4)', fontFamily: 'system-ui', fontSize: '13px' } }
      ];
      
      const liveEdges: Edge[] = [];
      
      // ИСПРАВЛЕНО: раздельные счётчики для каждого сектора + глобальный счётчик для ID
      let pIdx = 0;
      let aIdx = 0; 
      let dIdx = 0;
      let globalIdx = 0;

      Object.entries(data).forEach(([filePath, shells]) => {
        const isShared = filePath.includes('shared');
        const isAi = filePath.includes('Ai') || filePath.includes('Input');
        const isPhys = filePath.includes('Movement') || filePath.includes('Collision') || filePath.includes('Cleaner');
        
        let targetX = 0;
        let targetY = 0;
        let fileBg = 'rgba(30, 41, 59, 0.8)';
        let fileBorder = '1px solid #0284c7';
        let fileColor = '#38bdf8';
        
        // Раскладываем ветки по физическим координатам фоновых секторов
        if (isPhys) {
          targetX = -400 + (pIdx % 2) * 180;
          targetY = -280 + Math.floor(pIdx / 2) * 130; // ИСПРАВЛЕНО: используем деление для строк
          pIdx++;
        } else if (isAi) {
          targetX = 20 + (aIdx % 2) * 180;
          targetY = -280 + Math.floor(aIdx / 2) * 130; // ИСПРАВЛЕНО
          fileBg = 'rgba(88, 28, 135, 0.4)';
          fileBorder = '1px solid #7c3aed';
          fileColor = '#c084fc';
          aIdx++;
        } else {
          targetX = 450 + (dIdx % 2) * 180;
          targetY = -280 + Math.floor(dIdx / 2) * 130; // ИСПРАВЛЕНО
          fileBg = isShared ? 'rgba(17, 94, 89, 0.4)' : 'rgba(30, 41, 59, 0.8)';
          fileBorder = isShared ? '1px solid #14b8a6' : '1px solid #10b981';
          fileColor = isShared ? '#2dd4bf' : '#34d399';
          dIdx++;
        }

        // ИСПРАВЛЕНО: уникальный ID через глобальный счётчик
        const fileId = `FILE_${globalIdx}`;
        globalIdx++;
        
        liveNodes.push({
          id: fileId,
          data: { label: filePath.replace('src/', ''), type: 'file', fullPath: filePath, shells },
          position: { x: targetX, y: targetY },
          style: { background: fileBg, color: fileColor, border: fileBorder, padding: '10px 16px', borderRadius: '8px', fontFamily: 'system-ui', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }
        });

        liveEdges.push({ id: `e-core-${fileId}`, source: 'CORE', target: fileId, animated: true, style: { stroke: '#4b5563', strokeWidth: 1.5 } });

        // Выращиваем листья ракушек Julia строго под своими ветками систем
        shells.forEach((shellId, sIdx) => {
          const shellIdNode = `SHELL_${fileId}_${sIdx}`;
          liveNodes.push({
            id: shellIdNode,
            type: 'output',
            data: { label: `🐚 ${shellId}`, type: 'shell' },
            position: { x: targetX + 15, y: targetY + 55 + sIdx * 45 },
            style: { background: 'rgba(15, 23, 42, 0.6)', color: '#e9d5ff', border: '1px solid #6d28d9', padding: '6px 12px', borderRadius: '6px', fontFamily: 'system-ui', fontSize: '10px', whiteSpace: 'nowrap' }
          });
          liveEdges.push({ id: `e-${fileId}-${shellIdNode}`, source: fileId, target: shellIdNode, style: { stroke: '#6d28d9', strokeWidth: 1.2 } });
        });
      });

      setNodes(liveNodes);
      setEdges(liveEdges);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error("Ошибка загрузки карты:", message);
      setError("Ожидание карты Ткача...");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Загружаем данные только когда переходим на страницу карты
    if (currentPage === 'map') {
      loadMapData();
    }
  }, [currentPage, loadMapData]);

  // Обработчик клика по узлу с правильной типизацией
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data as NodeData);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#c9d1d9] font-sans antialiased select-none">
      <header className="flex justify-between items-center px-6 py-4 bg-[#161b22] border-b border-[#30363d] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-white tracking-wider">⚡ AURA MATRIX</span>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono font-bold">v41.2</span>
        </div>
        <nav className="flex gap-3">
          <button 
            onClick={() => setCurrentPage('main')} 
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${currentPage === 'main' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-gray-300'}`}
          >
            Главная
          </button>
          <button 
            onClick={() => setCurrentPage('map')} 
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${currentPage === 'map' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-gray-300'}`}
          >
            Карта Проекта
          </button>
        </nav>
      </header>

      <main className="flex-1 overflow-hidden">
        {currentPage === 'main' ? (
          <div className="max-w-3xl mx-auto mt-20 p-8 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-3">Зональный Радар Управления Aura 7</h2>
            <p className="text-[#8b949e] text-sm leading-relaxed mb-6">Архитектура распределена по смысловым секторам. Физика, ИИ и Данные теперь фоново разделены цветными пунктирными границами для тотального контроля масштаба.</p>
            <div className="bg-black/40 p-4 rounded-lg border border-[#30363d] text-emerald-400 font-bold text-xs font-mono">🪐 Нажмите кнопку «Карта Проекта» сверху для входа в радар.</div>
          </div>
        ) : (
          <div className="flex h-full w-full relative">
            <div className="flex-1 h-full bg-[#0b0f14] relative">
              {isLoading && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#161b22]/95 border border-[#30363d] px-4 py-2 rounded-lg text-xs text-gray-400 z-50">
                  Загрузка архитектурной карты...
                </div>
              )}
              
              {error && !isLoading && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-950/50 border border-red-900 px-4 py-2 rounded-lg text-xs text-red-400 z-50">
                  {error}
                </div>
              )}

              {nodes.length > 0 ? (
                <ReactFlow 
                  nodes={nodes} 
                  edges={edges} 
                  onNodeClick={handleNodeClick} 
                  fitView
                >
                  <Background color="#1f2937" gap={20} size={1} />
                  <Controls className="bg-[#161b22] border border-[#30363d] fill-white" />
                </ReactFlow>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  {!isLoading && !error && "Карта не загружена. Нажмите кнопку обновления."}
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 bg-[#161b22]/95 border border-[#30363d] p-4 rounded-lg text-[11px] space-y-2 backdrop-blur-md pointer-events-none z-50 shadow-xl">
                <div className="font-bold text-gray-400 mb-1.5 uppercase tracking-wider text-[10px]">🎨 Архитектурные Сектора:</div>
                <div className="flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] inline-block"></span> Ядро Ствола (Aura Core)</div>
                <div className="flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] inline-block"></span> Механика и Векторная Физика</div>
                <div className="flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded-full bg-[#c084fc] inline-block"></span> ИИ и Диспетчеры Ввода</div>
                <div className="flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6] inline-block"></span> Реестры Данных и Компоненты</div>
              </div>
            </div>

            <div className="w-80 h-full bg-[#161b22] border-l border-[#30363d] p-5 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl">
              <div>
                <h3 className="text-xs font-bold text-gray-400 border-b border-[#30363d] pb-2 mb-4 uppercase tracking-wider">🔬 Инспектор Сектора</h3>
                {!selectedNode ? (
                  <div className="text-gray-500 text-xs italic leading-relaxed">Кликните на ветку системы или лист ракушки для точечного аудита...</div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="text-gray-500 mb-1">Имя элемента:</div>
                      <div className="font-bold text-white break-all bg-black/60 p-3 rounded-lg border border-[#30363d] font-mono">{selectedNode.label}</div>
                    </div>
                    {selectedNode.fullPath && (
                      <div>
                        <div className="text-gray-500 mb-1">Локация на диске Windows:</div>
                        <div className="text-gray-400 font-medium break-all bg-black/40 p-3 rounded-lg border border-[#30363d] font-mono text-[11px]">{selectedNode.fullPath}</div>
                      </div>
                    )}
                    {selectedNode.shells && selectedNode.shells.length > 0 && (
                      <div>
                        <div className="text-gray-500 mb-1.5">Связанные ноды СУБД:</div>
                        <ul className="space-y-1.5 bg-black/60 p-3 rounded-lg border border-[#30363d] text-purple-300 font-bold font-mono">
                          {selectedNode.shells.map((s: string) => <li key={s} className="flex items-center gap-1.5">🐚 {s}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="text-[10px] text-gray-500 border-t border-[#30363d] pt-3 mt-5 leading-normal">🗺️ Навигация Радара:<br />• Скролл — Масштабирование<br />• Зажатие ЛКМ — Сдвиг Сцены</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}