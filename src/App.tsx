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

            // Calculate new position relative to the panel
            const newTop = Math.max(0, event.delta.y + element.top);
            const newLeft = Math.max(0, event.delta.x + element.left);

            // Ensure the element stays within the panel boundaries
            const maxTop = panelRect.height - 50; // Assuming element height is 50px
            const maxLeft = panelRect.width - 100; // Assuming element width is 100px

            const clampedTop = Math.min(Math.max(0, newTop), maxTop);
            const clampedLeft = Math.min(Math.max(0, newLeft), maxLeft);

            console.log(`Dropped element: ${element.id}`);
            console.log(`New position - Top: ${clampedTop}, Left: ${clampedLeft}`);

            return {
              ...element,
              top: clampedTop,
              left: clampedLeft,
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