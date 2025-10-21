export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const toDeg = (rad: number) => (rad * 180) / Math.PI;
export const toRad = (deg: number) => (deg * Math.PI) / 180;

export function destinationPoint(lat: number, lon: number, bearingDeg: number, distanceMeters: number): [number, number] {
  const R = 6371000; // Earth radius in m
  const δ = distanceMeters / R; // angular distance
  const θ = toRad(bearingDeg);

  const φ1 = toRad(lat);
  const λ1 = toRad(lon);

  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));

  return [toDeg(φ2), toDeg(λ2)];
}

export function interpolateLatLng(a: [number, number], b: [number, number], t: number): [number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}
