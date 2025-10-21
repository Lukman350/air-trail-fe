import axiosApi from '@/utils/axiosApi';
import { create } from 'zustand';

export interface Waypoint {
  name: string;
  type: string;
  route_type: string;
  latitude: number;
  longitude: number;
}

interface WaypointState {
  waypoints: Waypoint[];
  fetchWaypoints: () => Promise<void>;
}

const useWaypoint = create<WaypointState>((set) => ({
  waypoints: [],
  fetchWaypoints: async () => {
    const response = await axiosApi.get<Waypoint[]>('/waypoints');

    if (response.status === 200) {
      set({ waypoints: response.data });
    }
  },
}));

export default useWaypoint;
