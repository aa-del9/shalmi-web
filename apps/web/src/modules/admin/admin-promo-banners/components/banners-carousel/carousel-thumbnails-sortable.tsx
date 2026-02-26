'use client';

import { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Banner } from '../../types';

type CarouselThumbnailsSortableProps = {
  banners: Banner[];
  selectedId: string | null;
  currentIndex: number;
  onScrollTo: (index: number) => void;
  onSelectBanner: (id: string | null) => void;
  onReorder: (orderedIds: string[]) => void;
};

function SortableThumbnail({
  banner,
  index,
  isSelected,
  isCurrent,
  onScrollTo,
  onSelectBanner,
}: {
  banner: Banner;
  index: number;
  isSelected: boolean;
  isCurrent: boolean;
  onScrollTo: (index: number) => void;
  onSelectBanner: (id: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={() => {
        onScrollTo(index);
        onSelectBanner(banner.id);
      }}
      className={`overflow-hidden rounded-md border-2 transition-all ${
        isSelected
          ? 'border-primary ring-primary/30 ring-2'
          : 'border-transparent'
      } ${isCurrent && !isSelected ? 'opacity-100' : 'opacity-70'} ${
        isDragging ? 'z-50 opacity-90' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <Image
        src={banner.imageUrl}
        alt={banner.title}
        width={80}
        height={60}
        className="h-12 w-16 object-cover"
      />
    </button>
  );
}

export function CarouselThumbnailsSortable({
  banners,
  selectedId,
  currentIndex,
  onScrollTo,
  onSelectBanner,
  onReorder,
}: CarouselThumbnailsSortableProps) {
  const [localOrder, setLocalOrder] = useState(banners.map((b) => b.id));

  const bannerIdsKey = banners.map((b) => b.id).join(',');
  useEffect(() => {
    setLocalOrder(banners.map((b) => b.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerIdsKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over == null || active.id === over.id) return;
      const oldIndex = localOrder.indexOf(active.id as string);
      const newIndex = localOrder.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      const next = arrayMove([...localOrder], oldIndex, newIndex);
      setLocalOrder(next);
      onReorder(next);
    },
    [localOrder, onReorder]
  );

  if (banners.length === 0) return null;

  const orderedBanners = localOrder
    .map((id) => banners.find((b) => b.id === id))
    .filter((b): b is Banner => b != null);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localOrder}
        strategy={horizontalListSortingStrategy}
      >
        <div className="mt-4 flex gap-2">
          {orderedBanners.map((banner, index) => (
            <SortableThumbnail
              key={banner.id}
              banner={banner}
              index={index}
              isSelected={selectedId === banner.id}
              isCurrent={index === currentIndex}
              onScrollTo={onScrollTo}
              onSelectBanner={onSelectBanner}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
