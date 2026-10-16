'use client';
import { useId, type ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

function Row({
  id,
  label,
  disabled,
  children,
}: {
  id: string;
  label: string;
  disabled: boolean;
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
        </button>,
      )}
    </div>
  );
}
export function SortableList<T extends { id: string; title?: string }>({
  items,
  onChange,
  disabled = false,
  children,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  disabled?: boolean;
  children: (item: T, index: number, handle: ReactNode) => ReactNode;
}) {
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const end = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id)
      onChange(
        arrayMove(
          items,
          items.findIndex((item) => item.id === active.id),
          items.findIndex((item) => item.id === over.id),
        ),
      );
  };
  const collision: CollisionDetection = (args) =>
    args.droppableContainers
      .flatMap((container) => {
        const rect = args.droppableRects.get(container.id);
        return rect
          ? [
              {
                id: container.id,
                data: {
                  droppableContainer: container,
                  value: Math.abs(rect.top - args.collisionRect.top),
                },
              },
            ]
          : [];
      })
      .sort((a, b) => a.data.value - b.data.value);
  const label = (value: string | number) =>
    items.find((item) => item.id === value)?.title ||
    `Blok ${items.findIndex((item) => item.id === value) + 1}`;
  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={collision}
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
            >
              {(handle) => children(item, index, handle)}
            </Row>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
