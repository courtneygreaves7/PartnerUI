export type PropertyBookingStatus = "confirmed" | "cancelled"

export type PropertyBooking = {
  id: string
  booked: string
  start: string
  end: string
  nights: number
  products: string
  status: PropertyBookingStatus
}

export type Property = {
  id: string
  name: string
  postcode: string
  county: string
  partner: string
  brand: string
  location: string
  country: string
  maxOccupancy: string
  bookingCount: number
  imageUrl: string
  bookings: PropertyBooking[]
}

export const MOCK_PROPERTY: Property = {
  id: "BH2384",
  name: "Willowcroft House",
  postcode: "LA22 0EU",
  county: "Cumbria",
  partner: "Partner Alpha",
  brand: "Alpha",
  location: "Ambleside",
  country: "United Kingdom",
  maxOccupancy: "6",
  bookingCount: 12,
  imageUrl: "/images/property-bh2384.png",
  bookings: [
    {
      id: "PCB-019d09dc-868f-7525-ab31-0d5e0f15c801",
      booked: "24 Aug 2025",
      start: "29 May 2026",
      end: "1 Jun 2026",
      nights: 3,
      products: "CAL",
      status: "confirmed",
    },
    {
      id: "PCB-019d2487-9a2b-7c41-b812-4e8f9a1d2034",
      booked: "13 Mar 2026",
      start: "18 Jul 2026",
      end: "25 Jul 2026",
      nights: 7,
      products: "CAL, DDL",
      status: "confirmed",
    },
    {
      id: "PCB-019c8f12-4d5e-6a90-9c31-2b7e4a8f1567",
      booked: "2 Jan 2026",
      start: "14 Apr 2026",
      end: "18 Apr 2026",
      nights: 4,
      products: "DDL",
      status: "cancelled",
    },
    {
      id: "PCB-019b4e90-1f3c-5d82-8a76-6c9d2e1b4078",
      booked: "19 Nov 2025",
      start: "3 Oct 2026",
      end: "10 Oct 2026",
      nights: 7,
      products: "CAL",
      status: "confirmed",
    },
    {
      id: "PCB-019a2d71-8e4f-4b63-9d58-5a1c0f9e3289",
      booked: "5 Sep 2025",
      start: "22 Feb 2026",
      end: "26 Feb 2026",
      nights: 4,
      products: "DDL",
      status: "confirmed",
    },
    {
      id: "PCB-01991250-7c6a-4e92-ad47-3f8b1d0c5691",
      booked: "28 Jun 2025",
      start: "11 Dec 2026",
      end: "18 Dec 2026",
      nights: 7,
      products: "CAL, DDL",
      status: "confirmed",
    },
    {
      id: "PCB-01980139-6b59-3d81-bc36-2e7a0c9d4580",
      booked: "14 Apr 2025",
      start: "6 Aug 2026",
      end: "9 Aug 2026",
      nights: 3,
      products: "CAL",
      status: "cancelled",
    },
    {
      id: "PCB-0196f028-5a48-2c70-ab25-1d690b8e3471",
      booked: "3 Mar 2025",
      start: "19 May 2026",
      end: "26 May 2026",
      nights: 7,
      products: "DDL",
      status: "confirmed",
    },
    {
      id: "PCB-0195de17-4967-1b6f-9a14-0c582a7d2362",
      booked: "21 Jan 2025",
      start: "4 Apr 2026",
      end: "7 Apr 2026",
      nights: 3,
      products: "CAL",
      status: "confirmed",
    },
    {
      id: "PCB-0194cc06-3876-0a5e-8913-fb47196c1253",
      booked: "9 Dec 2024",
      start: "27 Jan 2026",
      end: "31 Jan 2026",
      nights: 4,
      products: "CAL, DDL",
      status: "confirmed",
    },
    {
      id: "PCB-0193ba95-2765-094d-7812-ea36085b0144",
      booked: "17 Oct 2024",
      start: "15 Sep 2026",
      end: "22 Sep 2026",
      nights: 7,
      products: "DDL",
      status: "confirmed",
    },
    {
      id: "PCB-0192a984-1654-083c-6701-d925074a9075",
      booked: "1 Aug 2024",
      start: "2 Nov 2026",
      end: "5 Nov 2026",
      nights: 3,
      products: "CAL",
      status: "confirmed",
    },
  ],
}

export function getPropertyById(id: string): Property | undefined {
  if (id === MOCK_PROPERTY.id) {
    return MOCK_PROPERTY
  }
  return undefined
}
