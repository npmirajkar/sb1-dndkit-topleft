import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Panel } from './components/Panel';
import { DraggableElement } from './components/DraggableElement';
import './App.css';

interface Element {
  id: string;
  label: string;
  top: number;
  left: number;
  panelId: string;
}

const App: React.FC = () => {
  const [elements, setElements] = useState<Element[]>([
    { id: 'element1', label: 'Element 1', top: 10, left: 10, panelId: 'panel1' },
    { id: 'element2', label: 'Element 2', top: 70, left: 10, panelId: 'panel1' },
    { id: 'element3', label: 'Element 3', top: 10, left: 10, panelId: 'panel2' },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));

  const handleDragStart = (event: { active: { id: string } }) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      setElements((prevElements) => {
        return prevElements.map((element) => {
          if (element.id === active.id) {
            const panelRect = (over.id === 'panel1' || over.id === 'panel2')
              ? (document.getElementById(over.id as string)?.getBoundingClientRect() as DOMRect)
              : (document.getElementById(element.panelId)?.getBoundingClientRect() as DOMRect);

            const newTop = event.over?.rect.top
              ? Math.max(0, event.over.rect.top - panelRect.top + event.delta.y)
              : element.top;
            const newLeft = event.over?.rect.left
              ? Math.max(0, event.over.rect.left - panelRect.left + event.delta.x)
              : element.left;

            console.log(`Dropped element: ${element.id}`);
            console.log(`New position - Top: ${newTop}, Left: ${newLeft}`);

            return {
              ...element,
              top: newTop,
              left: newLeft,
              panelId: (over.id === 'panel1' || over.id === 'panel2') ? over.id : element.panelId,
            };
          }
          return element;
        });
      });
    }

    setActiveId(null);
  };

  const activeElement = elements.find((element) => element.id === activeId);

  return (
    <div className="app">
      <h1>Multi-Panel Drag and Drop</h1>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="panels-container">
          <Panel id="panel1" title="Panel 1">
            {elements.filter(el => el.panelId === 'panel1').map(element => (
              <DraggableElement key={element.id} {...element} />
            ))}
          </Panel>
          <Panel id="panel2" title="Panel 2">
            {elements.filter(el => el.panelId === 'panel2').map(element => (
              <DraggableElement key={element.id} {...element} />
            ))}
          </Panel>
        </div>
        <DragOverlay>
          {activeId ? <DraggableElement {...(activeElement as Element)} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default App;