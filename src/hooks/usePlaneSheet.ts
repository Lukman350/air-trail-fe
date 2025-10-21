import type { Cat021 } from '@/services/useCat021';
import axiosApi from '@/utils/axiosApi';
import { create } from 'zustand';

export interface JetPhotosResponse {
  Reg: string;
  Images: JetPhotoImage[] | null;
}

export interface JetPhotoImage {
  Image: string;
  Link: string;
  Thumbnail: string;
  DateTaken: string;
  DateUploaded: string;
  Location: string;
  Photographer: string;
  Aircraft: string;
  Serial: string;
  Airline: string;
}

export interface AftnAirport {
  city: string;
  country: string;
  airport_name: string;
}

export interface AftnResponse {
  datetime: string;
  registration: string;
  departure: string;
  destination: string;
  duration: string;
  speed: string;
  altitude: string;
  route: string;
  raw: string;
  dof: string;
  etaProgress: number;
  message_type: string;
  call_sign: string;
  aircraft_type: string;
  departure_time: string;
  destination_time: string;
  schedule_departure_utc: string;
  schedule_destination_utc: string;
  actual_departure_utc: string;
  departure_airport: AftnAirport;
  destination_airport: AftnAirport;
}

interface PlaneSheetState {
  open: boolean;
  plane: Cat021 | null;
  photos: JetPhotoImage[] | null;
  aftn: AftnResponse | null;
  toggle: () => void;
  openSheet: () => void;
  closeSheet: () => void;
  setPlane: (plane: Cat021) => void;
  setPhotos: (jetPhotos: JetPhotoImage[]) => void;
  setAftn: (aftn: AftnResponse) => void;
  fetchJetPhotos: (registration: string) => Promise<void>;
  fetchAftn: (callsign: string) => Promise<void>;
}

const usePlaneSheet = create<PlaneSheetState>()((set, get) => ({
  open: false,
  plane: null,
  photos: [],
  aftn: null,
  toggle: () => set((state) => ({ open: !state.open })),
  openSheet: () => set(() => ({ open: true })),
  closeSheet: () => set(() => ({ open: false })),
  setPlane: (plane: Cat021) => set({ plane }),
  setPhotos: (jetPhotos: JetPhotoImage[]) => set({ photos: jetPhotos }),
  setAftn: (aftn: AftnResponse) => set({ aftn: aftn }),
  fetchJetPhotos: async (registration: string) => {
    const response = await axiosApi.get<JetPhotosResponse>(`/jet_photos?reg=${registration}`);

    if (response.status === 200) {
      const body = response.data;
      const jetPhotos = body.Images ? body.Images : [];
      get().setPhotos(jetPhotos);
    }
  },
  fetchAftn: async (callsign: string) => {
    const response = await axiosApi.get<AftnResponse>(`${callsign}/aftn`);

    if (response.status === 200) {
      get().setAftn(response.data);
    }
  },
}));

export default usePlaneSheet;
