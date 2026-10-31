'use client';
import { useId, type ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

function Row({
  id,
  label,
  disabled,
  index,
  count,
  move,
  canMove,
  children,
}: {
  id: string;
  label: string;
  disabled: boolean;
  index: number;
  count: number;
  move: (from: number, to: number) => void;
  canMove: (from: number, to: number) => boolean;
  children: (handle: ReactNode) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      data-sortable={id}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: 'relative',
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      {children(
        <span className="cms-sort-controls">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="wm-button cms-grip"
          {...attributes}
          {...listeners}
          disabled={disabled}
          aria-label={`Urutkan ${label}`}
        >
          <GripVertical size={20} aria-hidden="true" />
        </button>
        <span className="cms-sort-steps">
          <button type="button" className="wm-button" aria-label={`Naikkan ${label}`} disabled={disabled || index === 0 || !canMove(index,index-1)} onClick={()=>move(index,index-1)}><ArrowUp size={16} aria-hidden="true"/></button>
          <button type="button" className="wm-button" aria-label={`Turunkan ${label}`} disabled={disabled || index === count-1 || !canMove(index,index+1)} onClick={()=>move(index,index+1)}><ArrowDown size={16} aria-hidden="true"/></button>
        </span>
        </span>,
      )}
    </div>
  );
}
export function SortableList<T extends { id: string; title?: string }>({
  items,
  onChange,
  disabled = false,
  reorderable = true,
  canMove = () => true,
  onMove,
  children,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  disabled?: boolean;
  reorderable?: boolean;
  canMove?: (from: number, to: number) => boolean;
  onMove?: (from: number, to: number) => void;
  children: (item: T, index: number, handle: ReactNode) => ReactNode;
}) {
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      scrollBehavior: 'auto',
    }),
  );
  const move = (from: number,to: number) => {
    if(disabled || from<0 || to<0 || from>=items.length || to>=items.length || from===to || !canMove(from,to))return;
    if(onMove)onMove(from,to);else onChange(arrayMove(items,from,to));
  };
  const end = ({ active, over }: DragEndEvent) => {
    if(over)move(items.findIndex(item=>item.id===active.id),items.findIndex(item=>item.id===over.id));
  };
  const label = (value: string | number) =>
    items.find((item) => item.id === value)?.title ||
    `Blok ${items.findIndex((item) => item.id === value) + 1}`;
  if(!reorderable)return <div className="wm-list">{items.map((item,index)=><div key={item.id}>{children(item,index,null)}</div>)}</div>;
  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={end}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            'Tekan Spasi untuk mulai mengurutkan. Gunakan panah atas atau bawah. Tekan Spasi untuk selesai, Escape untuk membatalkan.',
        },
        announcements: {
          onDragStart: ({ active }) => `Mengurutkan ${label(active.id)}.`,
          onDragOver: ({ over }) =>
            over
              ? `Posisi ${items.findIndex((item) => item.id === over.id) + 1}.`
              : undefined,
          onDragEnd: ({ active, over }) =>
            over
              ? `${label(active.id)} dipindahkan ke posisi ${items.findIndex((item) => item.id === over.id) + 1}.`
              : 'Pengurutan dibatalkan.',
          onDragCancel: () => 'Pengurutan dibatalkan.',
        },
      }}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="wm-list">
          {items.map((item, index) => (
            <Row
              key={item.id}
              id={item.id}
              label={item.title || `blok ${index + 1}`}
              disabled={disabled}
              index={index}
              count={items.length}
              move={move}
              canMove={canMove}
            >
              {(handle) => children(item, index, handle)}
            </Row>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
