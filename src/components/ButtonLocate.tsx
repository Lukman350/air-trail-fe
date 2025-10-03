import { LocateFixed } from 'lucide-react';
import { useMap } from 'react-leaflet';
import { Button } from './ui/button';

export default function ButtonLocate() {
  const map = useMap();

  const locateToCenter = () => {
    map.flyTo([-0.7893, 113.9213], 5.15, {
      animate: true,
      duration: 3,
    });
  };

  return (
    <Button variant="secondary" size="icon" className="absolute bottom-6 right-4 shadow-lg size-8 md:size-12 z-[1000] cursor-pointer" onClick={locateToCenter}>
      <LocateFixed className="size-4 md:size-8" aria-label="Locate to Center" />
    </Button>
  );
}
