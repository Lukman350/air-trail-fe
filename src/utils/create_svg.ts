import L, { DivIcon } from 'leaflet';
import { SVG_CACHE } from './contants';
import defaultPlane from '@/assets/icons/aircraft/default.svg?raw';
import axiosApi from './axiosApi';
import { getIcons } from './icons';
import type { Cat021 } from '@/services/useCat021';

/**
 * Dynamically load and create a Leaflet DivIcon from an ICAO SVG file.
 * @param icao ICAO type code (e.g. "a333", "b738")
 * @param opts options for size/rotation
 */
export async function createSvgIconFromICAO(address: string, icao: string, clickedPlane?: Cat021, opts: { size?: number; rotate?: number } = {}): Promise<DivIcon> {
  const size = opts.size ?? 24;
  const rotate = opts.rotate ?? 0;
  const icon = getIcons(icao);

  let svg = !icao ? defaultPlane : SVG_CACHE.get(icao);

  if (!svg) {
    try {
      const response = await axiosApi.get(`/aircraft/${icon.icon}.svg`);

      if (response.status !== 200) {
        console.warn(`[PlaneIcon] Missing SVG for type ${icao}, falling back`);
        svg = defaultPlane;
      } else {
        svg = response.data;
      }

      SVG_CACHE.set(icao, svg || defaultPlane);
    } catch (err) {
      console.error(`[PlaneIcon] Error fetching SVG for ${icao}:`, err);
      svg = defaultPlane;
      SVG_CACHE.set(icao, svg);
    }
  }

  const html = `
    <div style="
      width:${size}px;
      height:${size}px;
      transform: rotate(${rotate}deg);
      display:flex;
      align-items:center;
      justify-content:center;
    ">
      ${svg
        ?.replace(/height="\d+"/, `height="${size}"`)
        .replace(/width="\d+"/, `width="${size}"`)
        .replace(/fill="white"/gi, `fill="${clickedPlane?.icaoAddress === address ? '#f87171' : '#fcd34d'}"`)
        .replace(/fill="black"/gi, `fill="#000"`)}
    </div>
  `;

  return L.divIcon({
    html,
    className: `plane-icon icao-${address}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 6],
  });
}
