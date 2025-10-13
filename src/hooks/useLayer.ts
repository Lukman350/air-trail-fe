import { create } from 'zustand';

interface LayerState {
  planeLayer: boolean;
  airportLayer: boolean;
  togglePlaneLayer: () => void;
  toggleAirportLayer: () => void;
}

const useLayer = create<LayerState>()((set, get) => ({
  planeLayer: true,
  airportLayer: false,
  togglePlaneLayer: () => set({ planeLayer: !get().planeLayer }),
  toggleAirportLayer: () => set({ airportLayer: !get().airportLayer }),
}));

export default useLayer;
