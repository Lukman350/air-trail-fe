import { MapContainer, Marker, Popup, ScaleControl, TileLayer } from 'react-leaflet';
import useCat021 from '@/services/useCat021';
import { useEffect, useMemo } from 'react';
import PlaneMarker from '@/components/PlaneMarker';
import ButtonLocate from '@/components/ButtonLocate';
import { Button } from '@/components/ui/button';
import PlaneSheet from '@/components/PlaneSheet';
import useBBox from '@/hooks/useBBox';
import useAirport from '@/services/useAirport';
import usePanel from '@/hooks/usePanel';
import Panel from '@/components/Panel';
import useLayer from '@/hooks/useLayer';
import useWaypoint from './hooks/useWaypoint';
import MapEvents from '@/components/MapEvents';

function App() {
  const cat021 = useCat021();
  const bbox = useBBox((state) => state.bbox);
  const layerControl = useLayer();
  const { airports: airportData, fetchAirport } = useAirport();
  const { fetchWaypoints } = useWaypoint();
  const { panels, togglePanel } = usePanel();

  useEffect(() => {
    if (!cat021.ws) cat021.connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAirport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAirport]);

  useEffect(() => {
    fetchWaypoints();
  }, [fetchWaypoints]);

  useEffect(() => {
    if (bbox !== null && cat021.ws) cat021.ws?.send(bbox);
  }, [bbox, cat021.ws]);

  const aircrafts = useMemo(() => {
    if (!cat021.aircrafts || !bbox) return cat021.aircrafts;

    return Object.values(cat021.aircrafts).filter(({ current }) => {
      const [lon, lat] = current.coordinates;
      return lat >= bbox.minLat && lat <= bbox.maxLat && lon >= bbox.minLon && lon <= bbox.maxLon;
    });
  }, [cat021.aircrafts, bbox]);

  const airports = useMemo(() => airportData, [airportData]);

  return (
    <>
      <MapContainer
        center={[-0.7893, 113.9213]}
        minZoom={2}
        zoom={5.15}
        scrollWheelZoom={true}
        className="h-screen w-screen relative"
        fadeAnimation
        zoomSnap={0.25}
        zoomControl={false}
        worldCopyJump={false}
        maxBoundsViscosity={1.0}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          zIndex={0}
        />
        <ScaleControl position="topright" />
        <MapEvents />
        {layerControl.planeLayer &&
          Object.values(aircrafts).map(({ current, cache }) => (
            <PlaneMarker
              key={current.icaoAddress}
              aircraft={current}
              cache={cache}
              size={40}
              srcAirport={airports?.find((a) => current.fpDep === a.code)}
              dstAirport={airports?.find((a) => current.fpDest === a.code)}
            />
          ))}
        {layerControl.airportLayer &&
          airports?.map((airport) => (
            <Marker key={airport.id} position={[airport.latitude, airport.longitude]}>
              <Popup>{airport.name}</Popup>
            </Marker>
          ))}
        <ButtonLocate />
      </MapContainer>
      {/* Layer controls */}
      <div className="relative">
        <div className="absolute left-4 bottom-6 shadow-lg z-[1000]">
          <div className="flex md:w-14 flex-col gap-2 rounded bg-background">
            {panels.map((panel) => (
              <Button key={panel.id} variant="ghost" className="cursor-pointer" onClick={() => togglePanel(panel)}>
                <panel.icon />
              </Button>
            ))}
          </div>
        </div>

        {panels.map((panel) => (
          <Panel key={panel.id} panel={panel} />
        ))}

        <PlaneSheet />
      </div>
    </>
  );
}

export default App;
