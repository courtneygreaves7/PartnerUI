import {
  createCapacityFromForm,
  createProductFromForm,
  type AddCapacityFormValues,
  type AddProductFormValues,
  type PasCapacityProvider,
  type PasProduct,
} from "@/lib/booking-engine-data"

const PRODUCT_STORAGE_KEY = "keystone-pas-added-products"
const CAPACITY_STORAGE_KEY = "keystone-pas-added-capacity"

function readAddedProducts(): PasProduct[] {
  try {
    const stored = localStorage.getItem(PRODUCT_STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored) as PasProduct[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAddedProducts(products: PasProduct[]) {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products))
}

function readAddedCapacity(): PasCapacityProvider[] {
  try {
    const stored = localStorage.getItem(CAPACITY_STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored) as PasCapacityProvider[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAddedCapacity(providers: PasCapacityProvider[]) {
  localStorage.setItem(CAPACITY_STORAGE_KEY, JSON.stringify(providers))
}

export function getPasProducts(): PasProduct[] {
  return readAddedProducts()
}

export function getPasCapacityProviders(): PasCapacityProvider[] {
  return readAddedCapacity()
}

export function addPasProduct(values: AddProductFormValues): PasProduct {
  const product = createProductFromForm(values)
  writeAddedProducts([...readAddedProducts(), product])
  return product
}

export function addPasCapacity(values: AddCapacityFormValues): PasCapacityProvider {
  const provider = createCapacityFromForm(values)
  writeAddedCapacity([...readAddedCapacity(), provider])
  return provider
}
