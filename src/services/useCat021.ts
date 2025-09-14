import type { BBox } from '@/hooks/useBBox';
import useBBox from '@/hooks/useBBox';
import { WebSocketClient } from '@/utils/websocket_client';
import { create } from 'zustand';

interface Cat021State {
  aircrafts: Cat021[] | null;
  ws: WebSocketClient<any, Cat021> | null;
  add: (aircraft: Cat021) => void;
  remove: (index: string) => void;
  connect: () => void;
  getBBox: () => BBox | null;
}

export interface Cat021 {
  asterixType: string;
  sac: number;
  sic: number;
  sacSicName: string;
  systemTrackID: string;
  timeOfMessage: number;
  flightLevel: number;
  callsign: string;
  icaoAddress: string;
  speed: number;
  heading: number;
  firIcao: string;
  firName: string;
  fpDep: string;
  fpDest: string;
  aircraftType: string;
  registration: string;
  updateTimestamp: Date;
  updateDelete: string;
  coordinates: number[];
}

const useCat021 = create<Cat021State>()((set, get) => ({
  aircrafts: null,
  ws: null,
  add: (aircraft) =>
    set((state) => {
      const { getBBox } = get();
      const bbox = getBBox();
      if (bbox) {
        const { minLat, minLon, maxLat, maxLon } = bbox;
        const [lon, lat] = aircraft.coordinates;

        if (lat < minLat || lat > maxLat || lon < minLon || lon > maxLon) {
          // console.log('[Cat021 Client] Dropping aircraft outside bbox:', aircraft.icaoAddress);
          return state;
        }
      }

      if (!state.aircrafts) {
        return { aircrafts: [aircraft] };
      }

      const exists = state.aircrafts.find((a) => a.icaoAddress === aircraft.icaoAddress);

      if (exists) {
        const prevTime = new Date(exists.updateTimestamp).getTime();
        const newTime = new Date(aircraft.updateTimestamp).getTime();

        // only replace if the new one is fresher
        if (newTime > prevTime) {
          return {
            aircrafts: state.aircrafts.map((a) => (a.icaoAddress === aircraft.icaoAddress ? aircraft : a)),
          };
        }

        // otherwise ignore stale update
        return state;
      }

      // not in list → add it
      return { aircrafts: [...state.aircrafts, aircraft] };
    }),
  remove: (icaoAddress: string) =>
    set((state) => ({
      aircrafts: state.aircrafts ? state.aircrafts.filter((a) => a.icaoAddress !== icaoAddress) : null,
    })),
  connect: () => {
    if (get().ws) {
      return;
    }

    const cat021Ws = new WebSocketClient<any, any>(`wss://${import.meta.env.VITE_APP_DOMAIN}/ws/cat021-track`, {
      onOpen: onServiceConnected,
      onMessage: onMessageReceived,
      onError: onServiceError,
      onClose: (e) => console.log('[Cat021 Service] Disconnected', e.code, e.reason),
      reconnect: true,
      reconnectInterval: 5000,
      maxRetries: Infinity,
    });

    set({ ws: cat021Ws });
  },
  getBBox: () => {
    const { bbox } = useBBox.getState();

    return bbox;
  },
}));

const onServiceConnected = () => {
  console.log('[Cat021 Service] Connected successfully');
};

const onMessageReceived = (data: any) => {
  const { add, remove } = useCat021.getState();

  if ('delete' in data && data.delete === true) {
    if (data.icaoAddress) {
      remove(data.icaoAddress);
    }
    return;
  }

  add(data as Cat021);
};

const onServiceError = (event: Event) => {
  console.error('[Cat021 Service] Service error', event.timeStamp);
};

export default useCat021;
