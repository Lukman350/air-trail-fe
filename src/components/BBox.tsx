import useBBox from '@/hooks/useBBox';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function BBox() {
  const { setBbox } = useBBox();
  const map = useMap();

  useEffect(() => {
    const b = map.getBounds();
    setBbox({
      minLon: b.getWest(),
      maxLon: b.getEast(),
      minLat: b.getSouth(),
      maxLat: b.getWest(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onMoveEnd = () => {
      const b = map.getBounds();
      setBbox({
        minLon: b.getWest(),
        maxLon: b.getEast(),
        minLat: b.getSouth(),
        maxLat: b.getWest(),
      });
    };
    map.on('moveend', onMoveEnd);
    return () => {
      map.off('moveend', onMoveEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}
