import useBBox from '@/hooks/useBBox';
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

function ZoomLevel() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const { setBbox, bbox } = useBBox();

  useEffect(() => {
    const b = map.getBounds();
    setBbox({
      minLon: b.getWest(),
      maxLon: b.getEast(),
      minLat: b.getSouth(),
      maxLat: b.getWest(),
    });
  }, []);

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    const onMoveEnd = () => {
      const b = map.getBounds();
      setBbox({
        minLon: b.getWest(),
        maxLon: b.getEast(),
        minLat: b.getSouth(),
        maxLat: b.getWest(),
      });
    };
    // const onMapClicked = (event: LeafletMouseEvent) => {
    //   console.log(event);
    // };
    map.on('zoomend', onZoom);
    map.on('moveend', onMoveEnd);
    // map.on('click', onMapClicked);
    return () => {
      map.off('zoomend', onZoom);
      map.off('moveend', onMoveEnd);
      // map.off('click', onMapClicked);
    };
  }, [map]);

  return (
    <div className="absolute right-4 top-4 z-[1000] flex gap-4">
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg">Zoom Level: {zoom}</div>
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg">MinLat: {bbox?.minLat}</div>
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg">MaxLat: {bbox?.maxLat}</div>
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg">MinLon: {bbox?.minLon}</div>
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg">MaxLon: {bbox?.maxLon}</div>
    </div>
  );
}

export default ZoomLevel;
