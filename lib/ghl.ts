// lib/ghl.ts
// GoHighLevel CRM API integration

export interface GHLContactPayload {
  firstName: string
  lastName: string
  phone: string
  email: string
  address1?: string
  postalCode: string
  city?: string
  state?: string
  tags?: string[]
  customFields?: Array<{ id: string; value: string }>
  source?: string
}

export interface GHLOpportunityPayload {
  title: string
  pipelineId?: string
  pipelineStageId?: string
  contactId: string
  status: 'open' | 'won' | 'lost' | 'abandoned'
  monetaryValue?: number
  assignedTo?: string
  customFields?: Array<{ id: string; value: string }>
}

export interface ServiceRequestData {
  // Step 1
  postalCode: string
  city?: string

  // Step 2
  serviceType: string

  // Step 3 (from sub-questions - populated by your flow)
  serviceAction?: string  // e.g. "Repair", "Installation", "Maintenance"
  equipmentAge?: string   // e.g. "2-5 years old"

  // Step 4 - contact info
  firstName: string
  lastName: string
  phone: string
  email: string

  // Step 5
  preferredContact: 'Phone' | 'Email'
  address?: string
  notes?: string
}

/**
 * Creates or updates a contact in GoHighLevel, then creates a note with service details.
 * Uses GHL API v2 (LeadConnector endpoint).
 */
export async function submitToGHL(data: ServiceRequestData): Promise<{ success: boolean; contactId?: string; error?: string }> {
  const apiKey = process.env.GHL_API_KEY
  const locationId = process.env.GHL_LOCATION_ID
  const baseUrl = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com'

  if (!apiKey || !locationId) {
    throw new Error('GHL_API_KEY and GHL_LOCATION_ID must be set in environment variables.')
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  }

  // ── 1. Upsert Contact ──────────────────────────────────────────────────────
  const contactPayload: GHLContactPayload = {
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    email: data.email,
    postalCode: data.postalCode,
    address1: data.address,
    source: 'Website Service Form',
    tags: [
      'Website Lead',
      data.serviceType,
      ...(data.serviceAction ? [data.serviceAction] : []),
    ],
  }

  // Try to upsert contact (POST /contacts/upsert or /contacts)
  const contactRes = await fetch(`${baseUrl}/contacts/upsert`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...contactPayload,
      locationId,
    }),
  })

  if (!contactRes.ok) {
    // Fallback: plain POST to /contacts
    const fallbackRes = await fetch(`${baseUrl}/contacts/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...contactPayload,
        locationId,
      }),
    })

    if (!fallbackRes.ok) {
      const errText = await fallbackRes.text()
      return { success: false, error: `GHL Contact Error: ${fallbackRes.status} – ${errText}` }
    }

    const fallbackData = await fallbackRes.json()
    const contactId: string = fallbackData?.contact?.id

    await addNoteToContact(contactId, data, headers, baseUrl)
    return { success: true, contactId }
  }

  const contactData = await contactRes.json()
  const contactId: string = contactData?.contact?.id

  // ── 2. Add a Note with service details ────────────────────────────────────
  await addNoteToContact(contactId, data, headers, baseUrl)

  return { success: true, contactId }
}

async function addNoteToContact(
  contactId: string,
  data: ServiceRequestData,
  headers: Record<string, string>,
  baseUrl: string
) {
  const noteBody = [
    `📋 SERVICE REQUEST`,
    `──────────────────`,
    `Service Type: ${data.serviceType}`,
    data.serviceAction ? `Action: ${data.serviceAction}` : null,
    data.equipmentAge ? `Equipment Age: ${data.equipmentAge}` : null,
    `Location: ${data.city ? data.city + ', ' : ''}${data.postalCode}`,
    data.address ? `Address: ${data.address}` : null,
    `Preferred Contact: ${data.preferredContact}`,
    data.notes ? `\nNotes:\n${data.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  await fetch(`${baseUrl}/contacts/${contactId}/notes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ body: noteBody }),
  })
}
