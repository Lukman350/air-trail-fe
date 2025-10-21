import type { Cat021 } from '@/services/useCat021';
import { create } from 'zustand';

interface UseClickedPlaneState {
  plane?: Cat021;
  setClickedPlane: (plane: Cat021 | undefined) => void;
}

const useClickedPlane = create<UseClickedPlaneState>((set) => ({
  plane: undefined,
  setClickedPlane: (plane) => set({ plane }),
}));

export default useClickedPlane;
