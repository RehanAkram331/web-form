// app/api/service-request/route.ts
import { NextResponse } from 'next/server'
import { submitToGHL, ServiceRequestData } from '@/lib/ghl'

export async function POST(request: Request) {
  try {
    const body: ServiceRequestData = await request.json()

    // Basic validation
    const required: (keyof ServiceRequestData)[] = ['firstName', 'lastName', 'email', 'phone', 'postalCode', 'serviceType']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const result = await submitToGHL(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, contactId: result.contactId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[service-request]', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
