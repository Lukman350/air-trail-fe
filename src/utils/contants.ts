import LayerControls from '@/components/LayerControls';
import type { IPanel } from '@/hooks/usePanel';
import { Layers, User } from 'lucide-react';

export const SVG_CACHE = new Map<string, string>();
export const PANEL_LIST: IPanel[] = [
  {
    id: 1,
    title: 'Layer Controls',
    opened: false,
    children: LayerControls,
    icon: Layers,
  },
  {
    id: 2,
    title: 'Panel 2',
    opened: false,
    icon: User,
  },
];
