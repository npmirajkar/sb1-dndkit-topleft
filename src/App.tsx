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

interface PanelData {
  id: string;
  title: string;
}

const App: React.FC = () => {
  const [panels, setPanels] = useState<PanelData[]>([
    { id: 'panel1', title: 'Panel 1' },
    { id: 'panel2', title: 'Panel 2' },
  ]);

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
            const targetPanelId = panels.find(panel => panel.id === over.id)?.id || element.panelId;
            const panelRect = document.getElementById(targetPanelId)?.getBoundingClientRect();

            if (!panelRect) return element;

            const newTop = Math.max(0, event.over.rect.top - panelRect.top + event.delta.y);
            const newLeft = Math.max(0, event.over.rect.left - panelRect.left + event.delta.x);

            return {
              ...element,
              top: newTop,
              left: newLeft,
              panelId: targetPanelId,
            };
          }
          return element;
        });
      });
    }

    setActiveId(null);
  };

  const activeElement = elements.find((element) => element.id === activeId);

  const addPanel = () => {
    const newPanelId = `panel${panels.length + 1}`;
    setPanels([...panels, { id: newPanelId, title: `Panel ${panels.length + 1}` }]);
  };

  const addElement = (panelId: string) => {
    const newElementId = `element${elements.length + 1}`;
    setElements([...elements, {
      id: newElementId,
      label: `Element ${elements.length + 1}`,
      top: 10,
      left: 10,
      panelId: panelId,
    }]);
  };

  return (
    <div className="app">
      <h1>Multi-Panel Drag and Drop</h1>
      <button onClick={addPanel}>Add Panel</button>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="panels-container">
          {panels.map((panel) => (
            <Panel key={panel.id} id={panel.id} title={panel.title}>
              {elements.filter(el => el.panelId === panel.id).map(element => (
                <DraggableElement key={element.id} {...element} />
              ))}
              <button onClick={() => addElement(panel.id)}>Add Element</button>
            </Panel>
          ))}
        </div>
        <DragOverlay>
          {activeId ? <DraggableElement {...(activeElement as Element)} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default App;