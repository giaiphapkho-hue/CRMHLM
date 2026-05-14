import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useCrm } from '../store/CrmContext';
import { PIPELINE_STAGES, Opportunity } from '../types';
import { cn } from '../lib/utils';
import { Building2 } from 'lucide-react';

export default function Pipeline() {
  const { opportunities, updateOpportunityStage } = useCrm();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceStage = result.source.droppableId as Opportunity['stage'];
    const destStage = result.destination.droppableId as Opportunity['stage'];

    if (sourceStage !== destStage) {
      updateOpportunityStage(result.draggableId, destStage);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(val);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">Quy trình Bán hàng (Sales Pipeline)</h1>
        <p className="text-slate-500">Kéo thả các cơ hội kinh doanh qua 7 giai đoạn.</p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full gap-4 items-start px-1" style={{ minWidth: 'min-content' }}>
            {PIPELINE_STAGES.map((stage) => {
              const columnOpps = opportunities.filter(o => o.stage === stage);
              const columnValue = columnOpps.reduce((sum, o) => sum + o.value, 0);

              return (
                <div key={stage} className="w-80 flex-shrink-0 bg-slate-100 rounded-xl flex flex-col max-h-full">
                  <div className="p-3 bg-slate-200/50 rounded-t-xl border-b border-slate-200 shrink-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-slate-700 text-sm">{stage}</h3>
                      <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        {columnOpps.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {formatCurrency(columnValue)}
                    </p>
                  </div>
                  
                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                          "flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors",
                          snapshot.isDraggingOver ? "bg-slate-200/50" : ""
                        )}
                      >
                        {columnOpps.map((opp, index) => (
                          <Draggable key={opp.id} draggableId={opp.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "bg-white p-3 rounded-lg shadow-sm border mb-3 cursor-grab active:cursor-grabbing",
                                  snapshot.isDragging ? "border-orange-400 shadow-md rotate-2" : "border-slate-200 hover:border-orange-300"
                                )}
                              >
                                <h4 className="font-medium text-slate-800 text-sm mb-2">{opp.title}</h4>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <div className="flex items-center">
                                    <Building2 className="w-3 h-3 mr-1" />
                                    Khách hàng
                                  </div>
                                  <span className="font-semibold text-slate-700">
                                    {formatCurrency(opp.value)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
