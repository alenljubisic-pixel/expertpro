// Approximate town centres. Used only to order nearby-city suggestions;
// distances are straight-line estimates, not travel distance or worker reach.
export const CITY_COORDS: Record<string, readonly [number, number]> = {
  'Beograd': [44.8176, 20.4569],
  'Novi Sad': [45.2671, 19.8335],
  'Niš': [43.3209, 21.8954],
  'Kragujevac': [44.0128, 20.9114],
  'Subotica': [46.1000, 19.6667],
  'Zrenjanin': [45.3833, 20.3833],
  'Pančevo': [44.8704, 20.6407],
  'Čačak': [43.8914, 20.3497],
  'Novi Pazar': [43.1333, 20.5167],
  'Kruševac': [43.5797, 21.3281],
  'Leskovac': [42.9981, 21.9461],
  'Smederevo': [44.6636, 20.9278],
  'Valjevo': [44.2667, 19.8833],
  'Vranje': [42.5500, 21.9000],
  'Šabac': [44.7500, 19.7000],
  'Požarevac': [44.6100, 21.1900],
  'Zaječar': [43.9010, 22.2755],
  'Kikinda': [45.8304, 20.4677],
  'Sombor': [45.7744, 19.1122],
  'Pirot': [43.1538, 22.5862],
  'Jagodina': [43.9767, 21.2611],
  'Bor': [44.0784, 22.0988],
  'Vršac': [45.1167, 21.3000],
  'Sremska Mitrovica': [44.9667, 19.6167],
  'Prokuplje': [43.2333, 21.5833],
  'Užice': [43.8554, 19.8419],
  'Loznica': [44.5333, 19.2333],
  'Aleksandrovac': [43.4586, 21.0466],
  'Bačka Palanka': [45.2501, 19.3829],
  'Kosovska Mitrovica': [42.8853, 20.8681],
}

export function distanceKm(a: readonly [number, number], b: readonly [number, number]): number {
  const radians = Math.PI / 180
  const lat1 = a[0] * radians
  const lat2 = b[0] * radians
  const dLat = (b[0] - a[0]) * radians
  const dLon = (b[1] - a[1]) * radians
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function getNearestCity(lat: number, lon: number): string {
  let nearest = 'Beograd'
  let minDistance = Infinity
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    const distance = distanceKm([lat, lon], coords)
    if (distance < minDistance) {
      nearest = city
      minDistance = distance
    }
  }
  return nearest
}

export function distanceBetweenCities(a: string, b: string): number | null {
  const from = CITY_COORDS[a]
  const to = CITY_COORDS[b]
  return from && to ? distanceKm(from, to) : null
}

export function nearbyCitiesWithResults(
  selectedCity: string,
  rows: { city: string; listing_count: number }[],
  limit = 3
) {
  return rows
    .filter(row => row.city !== selectedCity && row.listing_count > 0)
    .map(row => ({ ...row, distanceKm: distanceBetweenCities(selectedCity, row.city) }))
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
      || b.listing_count - a.listing_count || a.city.localeCompare(b.city, 'sr'))
    .slice(0, limit)
}
