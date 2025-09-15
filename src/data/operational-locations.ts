// Operational locations where Hypro operates
export const OPERATIONAL_LOCATIONS = [
  {
    id: 'oslo-no',
    city: 'Oslo',
    country: 'Norway',
    countryCode: 'NO',
  },
  // Add more cities as business expands:
  // {
  //   id: 'bergen-no',
  //   city: 'Bergen',
  //   country: 'Norway',
  //   countryCode: 'NO',
  // },
  // {
  //   id: 'trondheim-no',
  //   city: 'Trondheim',
  //   country: 'Norway',
  //   countryCode: 'NO',
  // },
] as const

export type OperationalLocation = (typeof OPERATIONAL_LOCATIONS)[number]
export type LocationId = OperationalLocation['id']

// Helper functions
export const getLocationById = (id: string): OperationalLocation | undefined =>
  OPERATIONAL_LOCATIONS.find((location) => location.id === id)

export const getLocationsByCountry = (
  countryCode: string,
): OperationalLocation[] =>
  OPERATIONAL_LOCATIONS.filter(
    (location) => location.countryCode === countryCode,
  )

export const formatLocationName = (location: OperationalLocation): string =>
  `${location.city}, ${location.country}`
