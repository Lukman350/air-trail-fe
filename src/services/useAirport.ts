import axiosApi from '@/utils/axiosApi';
import { create } from 'zustand';

interface AirportState {
  airports: Airport[] | null;
  fetchAirport: () => Promise<void>;
}

export interface Airport {
  id: number;
  code: string;
  name: string;
  country: string;
  longitude: number;
  latitude: number;
  total_day_arrivals: number | null;
  total_day_departures: number | null;
  total_month_arrivals: number | null;
  total_month_departures: number | null;
  total_year_arrivals: number | null;
  total_year_departures: number | null;
  total_on_ground: number | null;
  status: string;
  city: string;
  volume: string;
  point_type: string;
  designator: string;
}

const useAirport = create<AirportState>((set) => ({
  airports: null,
  fetchAirport: async () => {
    const response = await axiosApi.get<Airport[]>('/airports');

    if (response.status === 200) {
      set({ airports: response.data });
    }
  },
}));

export default useAirport;
