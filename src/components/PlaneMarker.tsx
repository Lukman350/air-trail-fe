import { Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import { createSvgIconFromICAO } from '@/utils/create_svg';
import type { Cat021 } from '@/services/useCat021';
import { useEffect, useRef, useState } from 'react';
import { DivIcon, type LatLngExpression, type Marker as LeafletMarker, type LeafletMouseEvent } from 'leaflet';
import { onPlaneClicked } from '@/utils/events';
import type { Airport } from '@/services/useAirport';
import useWaypoint from '@/hooks/useWaypoint';
import useClickedPlane from '@/hooks/useClickedPlane';
import { destinationPoint, lerp } from '@/utils/helper';
import usePlaneSheet from '@/hooks/usePlaneSheet';

interface PlaneMarkerProps {
  aircraft: Cat021;
  cache?: Cat021;
  srcAirport?: Airport;
  dstAirport?: Airport;
  size?: number;
}

export default function PlaneMarker({ aircraft, cache, srcAirport, dstAirport, size = 1 }: PlaneMarkerProps) {
  const map = useMap();
  const markerRef = useRef<LeafletMarker | null>(null);
  const rafRef = useRef<number>(null);
  const [icon, setIcon] = useState<DivIcon>();
  const [positions, setPositions] = useState<LatLngExpression[]>([]);
  const { plane: clickedPlane } = useClickedPlane();
  const { waypoints } = useWaypoint();
  const { fetchAftn, aftn } = usePlaneSheet();

  useEffect(() => {
    if (srcAirport) {
      setPositions([
        {
          lat: srcAirport.latitude,
          lng: srcAirport.longitude,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    createSvgIconFromICAO(aircraft.icaoAddress, aircraft.aircraftType ? aircraft.aircraftType : '', clickedPlane, {
      size,
      rotate: aircraft.heading ?? 0,
    }).then(setIcon);
  }, [aircraft.aircraftType, aircraft.callsign, aircraft.heading, aircraft.icaoAddress, clickedPlane, size]);

  useEffect(() => {
    if (!markerRef.current || !cache) return;

    const marker = markerRef.current;
    const prev = { lat: cache.latitude, lng: cache.longitude };
    const next = { lat: aircraft.latitude, lng: aircraft.longitude };

    // ignore invalid or same-point updates
    if (Number.isNaN(prev.lat) || Number.isNaN(prev.lng) || Number.isNaN(next.lat) || Number.isNaN(next.lng) || (prev.lat === next.lat && prev.lng === next.lng)) {
      return;
    }

    const prevTs = new Date(cache.updateTimestamp).getTime();
    const nextTs = new Date(aircraft.updateTimestamp).getTime();
    const delta = Math.max(nextTs - prevTs, 10000); // expected 10s updates
    const duration = Math.min(delta * 0.85, 9000); // smooth glide (~85%)
    const startTime = performance.now();

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      const lat = lerp(prev.lat, next.lat, t);
      const lng = lerp(prev.lng, next.lng, t);

      setPositions((p) => [...p, { lat, lng }]);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        marker.setLatLng([lat, lng]);
      }

      // smooth rotation
      const el = marker.getElement()?.firstElementChild as HTMLElement | null;
      if (el && typeof aircraft.heading === 'number') {
        // Reset existing transform, then apply rotation
        el.style.transform = `rotate(${aircraft.heading}deg)`;
        el.style.transformOrigin = 'center';
      }

      // after finishing interpolation → predict short term motion
      if (t >= 1) {
        const sinceLastUpdate = Date.now() - nextTs;
        const maxPredict = 10000; // predict up to 2s
        if (sinceLastUpdate < maxPredict && aircraft.speed && aircraft.heading) {
          const speedMps = aircraft.speed * 0.514444; // knots → m/s
          const distance = speedMps * (sinceLastUpdate / 1000);
          const [predLat, predLng] = destinationPoint(next.lat, next.lng, aircraft.heading, distance);
          marker.setLatLng([predLat, predLng]);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [aircraft, cache]);

  const getDestination = (): LatLngExpression[] | undefined => {
    const result: LatLngExpression[] = [{ lat: aircraft.latitude, lng: aircraft.longitude }];

    if (aircraft.fpRoute) {
      const routes = aircraft.fpRoute.trim().split(' ');
      for (const route of routes) {
        if (route === 'DCT') continue;
        const waypoint = waypoints.find((w) => w.name === route);
        if (waypoint) result.push({ lat: waypoint.latitude, lng: waypoint.longitude });
      }
    } else if (aircraft.callsign) {
      (async () => await fetchAftn(aircraft.callsign))();

      console.log(aftn);
    }

    if (dstAirport) {
      result.push({
        lat: dstAirport.latitude,
        lng: dstAirport.longitude,
      });
    }

    return result;
  };

  return icon ? (
    <>
      <Marker
        ref={markerRef}
        position={[aircraft.latitude, aircraft.longitude]}
        icon={icon}
        eventHandlers={{
          click: (event: LeafletMouseEvent) => {
            map.flyTo([aircraft.latitude, aircraft.longitude], 10, {
              animate: true,
              duration: 1.5,
            });
            onPlaneClicked(event, aircraft);
          },
        }}
      >
        <Tooltip direction="top">
          <strong>{aircraft.callsign}</strong>
        </Tooltip>
      </Marker>

      {clickedPlane?.icaoAddress === aircraft.icaoAddress && (
        <>
          <Polyline positions={positions} color="#22c55e" />
          <Polyline positions={getDestination() || []} color="#64748b" />
        </>
      )}
    </>
  ) : null;
}
