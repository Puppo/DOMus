// Dispatcher: maps FurnitureItem.kind to the matching parametric component.
// This is the only file that needs to change to wire up new furniture kinds.

import type { FurnitureItem } from '../store/types';
import Bed from './furniture/Bed';
import Nightstand from './furniture/Nightstand';
import Wardrobe from './furniture/Wardrobe';
import Dresser from './furniture/Dresser';
import Lamp from './furniture/Lamp';
import { useState } from 'react';
import { useRoomStore } from '../store/useRoomStore';

interface Props {
  item: FurnitureItem;
}

export default function FurnitureMesh({ item }: Props) {
  const selectedId = useRoomStore((s) => s.selectedId);
  const selectFurniture = useRoomStore((s) => s.selectFurniture);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedId === item.id;

  // Apply transform. Items are authored centered (origin = floor center),
  // so position is added directly.
  const common = {
    position: [item.position.x, item.position.y, item.position.z] as [number, number, number],
    rotation: [0, item.rotationY, 0] as [number, number, number],
    scale: [item.scale.x, item.scale.y, item.scale.z] as [number, number, number],
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setHovered(true);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      setHovered(false);
      document.body.style.cursor = 'auto';
    },
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      selectFurniture(item.id);
    },
  };

  const props = { colors: item.colors, hovered, selected: isSelected };

  switch (item.kind) {
    case 'bed':
      return <group {...common}><Bed {...props} /></group>;
    case 'nightstand':
      return <group {...common}><Nightstand {...props} /></group>;
    case 'wardrobe':
      return <group {...common}><Wardrobe {...props} /></group>;
    case 'dresser':
      return <group {...common}><Dresser {...props} /></group>;
    case 'lamp':
      return <group {...common}><Lamp {...props} /></group>;
  }
}
