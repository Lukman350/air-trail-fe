import { create } from 'zustand';

interface BBoxState {
  bbox: BBox | null;
  setBbox: (box: BBox) => void;
}

export interface BBox {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

const useBBox = create<BBoxState>()((set) => ({
  bbox: null,
  setBbox: (box) => set({ bbox: box }),
}));

export default useBBox;
