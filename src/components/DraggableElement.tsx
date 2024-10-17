import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableElementProps {
  id: string;
  label: string;
  top: number;
  left: number;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({ id, label, top, left }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: transform ? undefined : 'transform 0.3s ease',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="draggable-element">
      {label}
    </div>
  );
};