import { PlaneIcon, TowerControl } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import useLayer from '@/hooks/useLayer';

export default function LayerControls() {
  const layerControl = useLayer();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="plane-layer">
        <AccordionTrigger className="cursor-pointer">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <Checkbox id="plane" onCheckedChange={() => layerControl.togglePlaneLayer()} checked={layerControl.planeLayer} />
              <div className="flex gap-2 items-center">
                <PlaneIcon className="size-4 md:size-6" />
                <Label htmlFor="plane" className="text-xs md:text-base font-medium">
                  Plane
                </Label>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>Ini content</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="airport-layer">
        <AccordionTrigger className="cursor-pointer">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <Checkbox id="airport" onCheckedChange={() => layerControl.toggleAirportLayer()} checked={layerControl.airportLayer} />
              <div className="flex gap-2 items-center">
                <TowerControl className="size-4 md:size-6" />
                <Label htmlFor="airport" className="text-xs md:text-base font-medium">
                  Airport
                </Label>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>Ini content</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
