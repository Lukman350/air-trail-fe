import { Marker, useMap } from 'react-leaflet';
import { createSvgIconFromICAO } from '@/utils/create_svg';
import type { Cat021 } from '@/services/useCat021';
import { useEffect, useState } from 'react';
import { DivIcon, type LeafletMouseEvent } from 'leaflet';
import { onPlaneClicked } from '@/utils/events';

export default function PlaneMarker({ aircraft, size = 1 }: { aircraft: Cat021; size?: number }) {
  const map = useMap();
  const [icon, setIcon] = useState<DivIcon>();

  useEffect(() => {
    createSvgIconFromICAO(aircraft.icaoAddress, aircraft.aircraftType ? aircraft.aircraftType : '', aircraft.callsign, {
      size,
      rotate: aircraft.heading ?? 0,
    }).then(setIcon);
  }, [aircraft.aircraftType, aircraft.callsign, aircraft.heading, aircraft.icaoAddress, size]);

  if (!icon) return null; // wait for icon to load

  return (
    <Marker
      position={[aircraft.coordinates[1], aircraft.coordinates[0]]}
      icon={icon}
      eventHandlers={{
        click: (event: LeafletMouseEvent) => {
          map.flyTo([aircraft.coordinates[1], aircraft.coordinates[0]], 10, {
            animate: true,
            duration: 3,
          });
          onPlaneClicked(event, aircraft);
        },
      }}
    />
  );
}
