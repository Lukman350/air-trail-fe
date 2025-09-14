import type { Cat021 } from '@/services/useCat021';
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

interface PlaneSheetState {
  open: boolean;
  plane: Cat021 | null;
  photos: JetPhotoImage[] | null;
  toggle: () => void;
  setPlane: (plane: Cat021) => void;
  setPhotos: (jetPhotos: JetPhotoImage[]) => void;
}

const usePlaneSheet = create<PlaneSheetState>()((set) => ({
  open: false,
  plane: null,
  photos: [],
  toggle: () => set((state) => ({ open: !state.open })),
  setPlane: (plane: Cat021) => set({ plane }),
  setPhotos: (jetPhotos: JetPhotoImage[]) => set({ photos: jetPhotos }),
}));

export default usePlaneSheet;
