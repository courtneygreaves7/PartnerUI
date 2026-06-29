import {
  BOOKING_ENGINE_PARTNERS,
  createPartnerFromForm,
  createPolicyFromForm,
  type AddPartnerFormValues,
  type AddPolicyFormValues,
  type Partner,
  type PolicyRate,
} from "@/lib/booking-engine-data"

const PARTNER_STORAGE_KEY = "keystone-pas-added-partners"
const POLICY_STORAGE_KEY = "keystone-pas-added-policies"

export type StoredPolicy = {
  partnerId: string
  policy: PolicyRate
  details?: AddPolicyFormValues
}

function readAddedPartners(): Partner[] {
  try {
    const stored = localStorage.getItem(PARTNER_STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored) as Partner[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAddedPartners(partners: Partner[]) {
  localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(partners))
}

function readAddedPolicies(): StoredPolicy[] {
  try {
    const stored = localStorage.getItem(POLICY_STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored) as StoredPolicy[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAddedPolicies(policies: StoredPolicy[]) {
  localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(policies))
}

function mergePartnerPolicies(partners: Partner[]): Partner[] {
  const addedByPartner = new Map<string, PolicyRate[]>()

  for (const { partnerId, policy } of readAddedPolicies()) {
    const existing = addedByPartner.get(partnerId) ?? []
    existing.push(policy)
    addedByPartner.set(partnerId, existing)
  }

  return partners.map((partner) => ({
    ...partner,
    policies: [...partner.policies, ...(addedByPartner.get(partner.id) ?? [])],
  }))
}

export function getPasPartners(): Partner[] {
  return mergePartnerPolicies([...BOOKING_ENGINE_PARTNERS, ...readAddedPartners()])
}

export function isUserAddedPartner(partnerId: string): boolean {
  return readAddedPartners().some((partner) => partner.id === partnerId)
}

export function isUserAddedPolicy(policyId: string): boolean {
  return readAddedPolicies().some((entry) => entry.policy.id === policyId)
}

export function getPasPolicyDetails(policyId: string): AddPolicyFormValues | undefined {
  return readAddedPolicies().find((entry) => entry.policy.id === policyId)?.details
}

export function addPasPartner(values: AddPartnerFormValues): Partner {
  const existing = getPasPartners()
  const partner = createPartnerFromForm(values, existing)
  writeAddedPartners([...readAddedPartners(), partner])
  return partner
}

export function addPasPolicy(partnerId: string, values: AddPolicyFormValues): PolicyRate {
  const partner = getPasPartners().find((item) => item.id === partnerId)
  if (!partner) {
    throw new Error(`Partner not found: ${partnerId}`)
  }

  const policy = createPolicyFromForm(values, partner)
  writeAddedPolicies([...readAddedPolicies(), { partnerId, policy, details: values }])
  return policy
}

export function deletePasPartner(partnerId: string): boolean {
  if (!isUserAddedPartner(partnerId)) return false

  writeAddedPartners(readAddedPartners().filter((partner) => partner.id !== partnerId))
  writeAddedPolicies(readAddedPolicies().filter((entry) => entry.partnerId !== partnerId))
  return true
}

export function deletePasPolicy(policyId: string): boolean {
  const next = readAddedPolicies().filter((entry) => entry.policy.id !== policyId)
  if (next.length === readAddedPolicies().length) return false

  writeAddedPolicies(next)
  return true
}

export function updatePasPartnerBrand(
  partnerId: string,
  brandId: string,
  updates: { name: string; policyGroup: string }
): boolean {
  const added = readAddedPartners()
  const index = added.findIndex((partner) => partner.id === partnerId)
  if (index < 0) return false

  const partner = added[index]
  const name = updates.name.trim()
  if (!name) return false

  const brands = partner.brands.map((brand) =>
    brand.id === brandId
      ? { ...brand, name, policyGroup: updates.policyGroup.trim() || name }
      : brand
  )

  if (!brands.some((brand) => brand.id === brandId)) return false

  added[index] = { ...partner, brands }
  writeAddedPartners(added)
  return true
}
