import usePlaneSheet from '@/hooks/usePlaneSheet';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Table, TableCaption, TableRow, TableBody, TableCell } from './ui/table';
import { PlaneTakeoff } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

export default function PlaneSheet() {
  const planeSheet = usePlaneSheet();
  const [loading, setLoading] = useState<boolean>(false);

  const flightLevelToFeet = (flightLevel: number | undefined): number => {
    if (flightLevel == null || isNaN(flightLevel)) return 0;
    return flightLevel * 100;
  };

  useEffect(() => {
    (async () => {
      if (planeSheet.plane?.registration) {
        setLoading(true);
        await planeSheet.fetchJetPhotos(planeSheet.plane.registration);
        setLoading(false);
      }
    })();
  }, [planeSheet.plane?.registration]);

  useEffect(() => {
    if (planeSheet.plane?.callsign) {
      planeSheet.fetchAftn(planeSheet.plane.callsign);
    }
  }, [planeSheet.plane?.callsign]);

  return (
    <Sheet open={planeSheet.open} onOpenChange={planeSheet.toggle}>
      <SheetContent className="w-screen md:w-[400px] h-max absolute md:top-8 md:right-8 z-[1000] rounded">
        <SheetHeader>
          <SheetTitle className="scroll-m-20 text-xl font-semibold tracking-tight">{planeSheet.plane?.callsign}</SheetTitle>
          <SheetDescription asChild>
            <div>
              <Carousel className="w-full relative mt-4">
                <CarouselContent className="m-0">
                  {loading ? (
                    <Skeleton className="h-[200px] w-full rounded" />
                  ) : planeSheet.photos && planeSheet.photos.length > 0 ? (
                    planeSheet.photos?.map((image, index) => (
                      <CarouselItem key={index} className="relative h-[200px] m-0 px-2">
                        <div className="relative shadow-lg">
                          <img src={image.Image} alt={`${planeSheet.plane?.registration}'s Photo`} className="w-full h-full" />
                          <div className="flex justify-between items-center w-full absolute bottom-2 px-2">
                            <p className="text-white font-light text-xs truncate w-full">&copy; {image.Photographer}</p>
                            <p className="text-white font-light text-xs truncate w-full">{image.Location}</p>
                          </div>
                        </div>
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem className="h-[200px] flex items-center justify-center m-0 p-0">
                      <img src="/assets/images/default-photo.jpg" alt="No Image" />
                      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight absolute bottom-4">No Photos Available</h4>
                    </CarouselItem>
                  )}
                </CarouselContent>
                {planeSheet.photos && planeSheet.photos.length > 0 && (
                  <>
                    <CarouselPrevious className="absolute -left-2 top-1/2 bottom-1/2" />
                    <CarouselNext className="absolute -right-2 top-1/2 bottom-1/2" />
                  </>
                )}
              </Carousel>
              <div className="my-4 flex justify-between">
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">{planeSheet.plane?.fpDep || 'N/A'}</h2>
                <PlaneTakeoff className="size-8" />
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">{planeSheet.plane?.fpDest || 'N/A'}</h2>
              </div>
              <Table>
                <TableCaption>Last Received: {planeSheet.plane?.updateTimestamp ? new Date(planeSheet.plane?.updateTimestamp).toUTCString() : ''}</TableCaption>
                <TableBody className="border-t border-b">
                  <TableRow>
                    <TableCell className="font-medium">Aircraft Type</TableCell>
                    <TableCell>{planeSheet.plane?.aircraftType || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Aircraft Registration</TableCell>
                    <TableCell>{planeSheet.plane?.registration || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ground Speed</TableCell>
                    <TableCell>{Math.floor(planeSheet.plane?.speed || 0)} kts</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Heading</TableCell>
                    <TableCell>{Math.floor(planeSheet.plane?.heading || 0)}°</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Altitude</TableCell>
                    <TableCell>{flightLevelToFeet(planeSheet.plane?.flightLevel)} ft</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Latitude</TableCell>
                    <TableCell>{planeSheet.plane?.coordinates[1]}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Longitude</TableCell>
                    <TableCell>{planeSheet.plane?.coordinates[0]}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Data Source</TableCell>
                    <TableCell>{planeSheet.plane?.asterixType}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
