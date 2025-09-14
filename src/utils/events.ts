import usePlaneSheet from '@/hooks/usePlaneSheet';
import type { Cat021 } from '@/services/useCat021';
import type { LeafletMouseEvent } from 'leaflet';

export const onPlaneClicked = async (_: LeafletMouseEvent, aircraft: Cat021): Promise<void> => {
  const planeSheet = usePlaneSheet.getState();

  planeSheet.setPlane(aircraft);
  planeSheet.toggle();
};
