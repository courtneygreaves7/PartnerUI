export type PropertyListItem = {
  code: number
  name: string | null
  partner: string
  brand: string
  externalId: string
  postcode: string
  country: string
  maxOccupancy: number
  bookings: number
  propertyId: string | null
}

const PARTNER_A_PROPERTIES: PropertyListItem[] = [
  {
    code: 1,
    name: "Willowcroft House",
    partner: "Partner Alpha",
    brand: "Alpha",
    externalId: "BH2384",
    postcode: "LA22 0EU",
    country: "GB",
    maxOccupancy: 6,
    bookings: 12,
    propertyId: "BH2384",
  },
  {
    code: 2,
    name: null,
    partner: "Partner Alpha",
    brand: "Alpha",
    externalId: "SF17",
    postcode: "AB55 5BT",
    country: "GB",
    maxOccupancy: 4,
    bookings: 0,
    propertyId: null,
  },
  {
    code: 3,
    name: null,
    partner: "Partner Alpha",
    brand: "Beta",
    externalId: "CM412",
    postcode: "Unknown",
    country: "GB",
    maxOccupancy: 5,
    bookings: 3,
    propertyId: null,
  },
  {
    code: 4,
    name: null,
    partner: "Partner Alpha",
    brand: "Beta",
    externalId: "DG891",
    postcode: "Not set",
    country: "GB",
    maxOccupancy: 6,
    bookings: 1,
    propertyId: null,
  },
  {
    code: 5,
    name: null,
    partner: "Partner Alpha",
    brand: "Gamma",
    externalId: "WH204",
    postcode: "LA22 0EU",
    country: "GB",
    maxOccupancy: 6,
    bookings: 8,
    propertyId: null,
  },
  {
    code: 6,
    name: null,
    partner: "Partner Alpha",
    brand: "Gamma",
    externalId: "LK773",
    postcode: "CA12 5AB",
    country: "GB",
    maxOccupancy: 8,
    bookings: 14,
    propertyId: null,
  },
  {
    code: 7,
    name: null,
    partner: "Partner Alpha",
    brand: "Delta",
    externalId: "NR556",
    postcode: "PL23 1JA",
    country: "GB",
    maxOccupancy: 4,
    bookings: 0,
    propertyId: null,
  },
  {
    code: 8,
    name: null,
    partner: "Partner Alpha",
    brand: "Delta",
    externalId: "OX119",
    postcode: "Unknown",
    country: "GB",
    maxOccupancy: 5,
    bookings: 2,
    propertyId: null,
  },
  {
    code: 9,
    name: null,
    partner: "Partner Alpha",
    brand: "Alpha",
    externalId: "PE334",
    postcode: "TD15 1XX",
    country: "GB",
    maxOccupancy: 6,
    bookings: 5,
    propertyId: null,
  },
  {
    code: 10,
    name: null,
    partner: "Partner Alpha",
    brand: "Beta",
    externalId: "QT882",
    postcode: "Not set",
    country: "GB",
    maxOccupancy: 4,
    bookings: 0,
    propertyId: null,
  },
]

export function getPropertiesForPartner(partnerId: string): PropertyListItem[] {
  if (partnerId === "partner-a") {
    return PARTNER_A_PROPERTIES
  }

  return PARTNER_A_PROPERTIES.map((property) => ({
    ...property,
    partner: partnerId === "partner-b" ? "Partner Beta" : "Partner Gamma",
  }))
}
