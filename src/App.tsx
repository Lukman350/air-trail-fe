import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import useCat021 from './services/useCat021';
import { useEffect, useMemo } from 'react';
import PlaneMarker from './components/PlaneMarker';
import ButtonLocate from './components/ButtonLocate';
import { Button } from './components/ui/button';
import { Layers } from 'lucide-react';
import PlaneSheet from './components/PlaneSheet';
import BBox from './components/BBox';
import useBBox from './hooks/useBBox';
import ZoomLevel from './components/ZoomLevel';

function App() {
  const cat021 = useCat021();
  const bbox = useBBox((state) => state.bbox);

  useEffect(() => {
    if (cat021.ws === null) {
      cat021.connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cat021.ws !== null) {
      if (bbox !== null) cat021.ws.send(bbox);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bbox]);

  const aircrafts = useMemo(() => {
    if (!cat021.aircrafts || !bbox) return cat021.aircrafts;

    return cat021.aircrafts?.filter((a) => {
      const [lon, lat] = a.coordinates;
      return lat >= bbox.minLat && lat <= bbox.maxLat && lon >= bbox.minLon && lon <= bbox.maxLon;
    });
  }, [cat021.aircrafts, bbox]);

  return (
    <MapContainer
      center={[-0.7893, 113.9213]}
      minZoom={2}
      zoom={5.15}
      scrollWheelZoom={true}
      className="min-h-screen w-full"
      fadeAnimation
      zoomSnap={0.25}
      zoomControl={false}
      worldCopyJump={false}
      maxBoundsViscosity={1.0}
      maxBounds={[
        [-90, -180],
        [90, 180],
      ]}
    >
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ZoomLevel />
      <BBox />
      {aircrafts?.map((aircraft) => (
        <PlaneMarker key={aircraft.icaoAddress} aircraft={aircraft} size={40} />
      ))}
      <ButtonLocate />
      <div className="absolute left-4 bottom-6 shadow-lg z-[1000]">
        <div className="flex w-14 flex-col gap-2 rounded bg-[var(--color-background)]">
          <Button variant="ghost">
            <Layers />
          </Button>
        </div>
      </div>

      <PlaneSheet />
    </MapContainer>
  );
}

export default App;
