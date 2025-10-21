import type { BBox } from '@/hooks/useBBox';
import useBBox from '@/hooks/useBBox';
import useClickedPlane from '@/hooks/useClickedPlane';
import { WebSocketClient } from '@/utils/websocket_client';
import { create } from 'zustand';

interface Cat021State {
  aircrafts: Record<string, { cache?: Cat021; current: Cat021 }>;
  ws: WebSocketClient<BBox, Cat021> | null;
  updateAircraft: (aircraft: Cat021) => void;
  remove: (index: string) => void;
  connect: () => void;
  disconnect: () => void;
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
  fpRoute: string;
  aircraftType: string;
  registration: string;
  updateTimestamp: Date;
  updateDelete: string;
  coordinates: number[];
  latitude: number;
  longitude: number;
}

const useCat021 = create<Cat021State>()((set, get) => ({
  aircrafts: {},
  ws: null,
  updateAircraft: (data) =>
    set((state) => {
      // const { getBBox } = get();
      // const bbox = getBBox();
      // if (bbox) {
      //   const { minLat, minLon, maxLat, maxLon } = bbox;
      //   const [lon, lat] = aircraft.coordinates;

      //   if (lat < minLat || lat > maxLat || lon < minLon || lon > maxLon) {
      //     // console.log('[Cat021 Client] Dropping aircraft outside bbox:', aircraft.icaoAddress);
      //     state.aircraftCache.delete(aircraft.icaoAddress);
      //     return state;
      //   }
      // }

      // if (!state.aircrafts) {
      //   return { aircrafts: [aircraft] };
      // }

      // const exists = state.aircrafts.find((a) => a.icaoAddress === aircraft.icaoAddress);

      // // console.log('new', aircraft);
      // // console.log('old', exists);

      // if (exists) {
      //   state.aircraftCache.set(exists.icaoAddress, exists);

      //   const prevTime = new Date(exists.updateTimestamp).getTime();
      //   const newTime = new Date(aircraft.updateTimestamp).getTime();

      //   // only replace if the new one is fresher
      //   if (newTime > prevTime) {
      //     return {
      //       aircrafts: state.aircrafts.map((a) => (a.icaoAddress === aircraft.icaoAddress ? aircraft : a)),
      //     };
      //   }

      //   // otherwise ignore stale update
      //   return state;
      // }

      // state.aircraftCache.set(aircraft.icaoAddress, aircraft);

      // // not in list → add it
      // return { aircrafts: [...state.aircrafts, aircraft] };

      const existing = state.aircrafts[data.icaoAddress];

      if (!existing) {
        // first time — no cache yet
        return {
          aircrafts: {
            ...state.aircrafts,
            [data.icaoAddress]: { current: data },
          },
        };
      }

      const prev = existing.current;
      // ignore duplicates or outdated data
      if (new Date(data.updateTimestamp) <= new Date(prev.updateTimestamp)) {
        return state;
      }

      return {
        aircrafts: {
          ...state.aircrafts,
          [data.icaoAddress]: { cache: prev, current: data },
        },
      };
    }),
  remove: (icaoAddress: string) =>
    set((state) => {
      delete state.aircrafts[icaoAddress];

      return {
        aircrafts: { ...state.aircrafts },
      };
    }),
  connect: () => {
    if (get().ws) {
      return;
    }

    const cat021Ws = new WebSocketClient<BBox, Cat021>(`wss://${import.meta.env.VITE_APP_DOMAIN}/ws/cat021-track`, {
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
  disconnect: () => {
    const ws = get().ws;
    if (ws) {
      ws.close();
      set({ ws: null });
    }
  },
  getBBox: () => {
    const { bbox } = useBBox.getState();

    return bbox;
  },
}));

useCat021.subscribe(({ aircrafts }) => {
  const { setClickedPlane, plane } = useClickedPlane.getState();

  if (plane) {
    const latestPlane = aircrafts[plane.icaoAddress];

    if (latestPlane) setClickedPlane(latestPlane.current);
  }
});

const onServiceConnected = () => {
  console.log('[Cat021 Service] Connected successfully');
};

const onMessageReceived = (data: Cat021) => {
  const { updateAircraft, remove } = useCat021.getState();

  if ('delete' in data && data.delete === true) {
    if (data.icaoAddress) {
      remove(data.icaoAddress);
    }
    return;
  }

  updateAircraft(data);
};

const onServiceError = (event: Event) => {
  console.error('[Cat021 Service] Service error', event.timeStamp);
};

export default useCat021;
