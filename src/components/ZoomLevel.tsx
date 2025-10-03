import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

function ZoomLevel() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    return () => {
      map.off('zoomend', onZoom);
    };
  }, [map]);

  return (
    <div className="absolute right-4 top-4 z-[1000] flex gap-4">
      <div className="bg-white px-2 py-1 md:px-3 md:py-2 rounded-lg shadow-lg">Zoom Level: {zoom}</div>
    </div>
  );
}

export default ZoomLevel;
