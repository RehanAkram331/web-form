'use client'

// components/ServiceRequestModal.tsx
import { useState, useCallback, useEffect, useRef } from 'react'
import { X, MapPin, Pencil, CheckCircle2, Loader2, ChevronRight, AlertCircle } from 'lucide-react'
import {
  HeatingIcon, CoolingIcon, HeatPumpIcon, CommercialIcon,
  DuctlessIcon, EmergencyIcon, MaintenanceIcon, ThermostatIcon, IndoorAirIcon
} from './ServiceIcons'

// ── Types ──────────────────────────────────────────────────────────────────
interface FormData {
  postalCode: string
  city: string
  state: string
  country: string
  lat: number | null
  lng: number | null
  serviceType: string
  serviceAction: string
  equipmentAge: string
  firstName: string
  lastName: string
  phone: string
  email: string
  preferredContact: 'Phone' | 'Email'
  address: string
  notes: string
}

interface GeoResult {
  city: string
  state: string
  country: string
  lat: number
  lng: number
}

const SERVICE_TYPES = [
  { id: 'Heating',            label: 'Heating',            Icon: HeatingIcon },
  { id: 'Cooling',            label: 'Cooling',            Icon: CoolingIcon },
  { id: 'Heat Pumps',         label: 'Heat Pumps',         Icon: HeatPumpIcon },
  { id: 'Commercial',         label: 'Commercial',         Icon: CommercialIcon },
  { id: 'Ductless',           label: 'Ductless',           Icon: DuctlessIcon },
  { id: 'Emergency',          label: 'Emergency',          Icon: EmergencyIcon },
  { id: 'Maintenance',        label: 'Maintenance',        Icon: MaintenanceIcon },
  { id: 'Thermostats',        label: 'Thermostats',        Icon: ThermostatIcon },
  { id: 'Indoor Air Quality', label: 'Indoor Air Quality', Icon: IndoorAirIcon },
]

const SERVICE_ACTIONS = ['Repair', 'Installation', 'Replacement', 'Inspection', 'Maintenance']
const EQUIPMENT_AGES  = ['Less than 1 year', '1-2 years old', '2-5 years old', '5-10 years old', '10+ years old']

// ── Geocoding via Nominatim (free, no API key required) ────────────────────
async function geocodePostalCode(postalCode: string): Promise<GeoResult | null> {
  try {
    const encoded = encodeURIComponent(postalCode.trim())
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encoded}&format=json&addressdetails=1&limit=1`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'AdvanceHVAC/1.0' },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.length) return null

    const item = data[0]
    const addr = item.address || {}
    const city =
      addr.city || addr.town || addr.village ||
      addr.municipality || addr.county || addr.state_district || ''
    const state   = addr.state || addr.province || ''
    const country = addr.country || ''

    return {
      city,
      state,
      country,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }
  } catch {
    return null
  }
}

// ── OpenStreetMap iframe embed ─────────────────────────────────────────────
function PostalMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const bbox = 0.04
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - bbox}%2C${lat - bbox}%2C${lng + bbox}%2C${lat + bbox}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm mt-3 relative">
      <iframe
        title={`Map — ${label}`}
        src={src}
        width="100%"
        height="200"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        allowFullScreen
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm border border-gray-200
                   rounded-lg px-2 py-1 text-[10px] text-gray-500 hover:text-brand-blue transition-colors"
      >
        View larger map ↗
      </a>
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────
interface ServiceRequestModalProps {
  onClose: () => void
}

export default function ServiceRequestModal({ onClose }: ServiceRequestModalProps) {
  const [step, setStep] = useState(1)
  const totalSteps = 5

  const [form, setForm] = useState<FormData>({
    postalCode: '',
    city: '', state: '', country: '',
    lat: null, lng: null,
    serviceType: '', serviceAction: '', equipmentAge: '',
    firstName: '', lastName: '', phone: '', email: '',
    preferredContact: 'Phone',
    address: '', notes: '',
  })

  const [postalLoading, setPostalLoading] = useState(false)
  const [postalValid,   setPostalValid]   = useState(false)
  const [postalError,   setPostalError]   = useState<string | null>(null)
  const [submitting,    setSubmitting]    = useState(false)
  const [submitted,     setSubmitted]     = useState(false)
  const [submitError,   setSubmitError]   = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Accepts US ZIP (12345), CA postal (N2C1L6 / N2C 1L6), UK, AU, etc.
  const looksLikePostal = (v: string) => /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(v.trim())

  const handlePostalChange = useCallback((value: string) => {
    setForm(f => ({ ...f, postalCode: value }))
    setPostalValid(false)
    setPostalError(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!looksLikePostal(value)) return

    debounceRef.current = setTimeout(async () => {
      setPostalLoading(true)
      const geo = await geocodePostalCode(value)
      setPostalLoading(false)

      if (!geo) {
        setPostalError('Postal code not found. Please check and try again.')
        setPostalValid(false)
        setForm(f => ({ ...f, city: '', state: '', country: '', lat: null, lng: null }))
      } else {
        setForm(f => ({
          ...f,
          city: geo.city, state: geo.state, country: geo.country,
          lat: geo.lat, lng: geo.lng,
        }))
        setPostalValid(true)
      }
    }, 700)
  }, [])

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  const canContinue = () => {
    if (step === 1) return postalValid
    if (step === 2) return !!form.serviceType
    if (step === 3) return !!form.firstName && !!form.lastName && !!form.phone && !!form.email
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postalCode:       form.postalCode,
          city:             [form.city, form.state, form.country].filter(Boolean).join(', '),
          serviceType:      form.serviceType,
          serviceAction:    form.serviceAction,
          equipmentAge:     form.equipmentAge,
          firstName:        form.firstName,
          lastName:         form.lastName,
          phone:            form.phone,
          email:            form.email,
          preferredContact: form.preferredContact,
          address:          form.address,
          notes:            form.notes,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <ModalHeader onClose={onClose} />
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center check-pop">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Request Submitted!</h2>
            <p className="text-gray-500 text-sm max-w-xs">
              Thank you, <strong>{form.firstName}</strong>! We will contact you via{' '}
              {form.preferredContact.toLowerCase()} shortly.
            </p>
            {form.lat && form.lng && (
              <div className="w-full">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 text-left">
                  Your service location
                </p>
                <PostalMap lat={form.lat} lng={form.lng} label={form.postalCode} />
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-2 px-8 py-3 bg-brand-red text-white font-semibold rounded-xl hover:bg-brand-red-dark transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <ModalHeader onClose={onClose} />

        {/* Progress */}
        <div className="flex gap-1 px-6 pt-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`progress-step flex-1 ${i < step ? 'bg-brand-red' : 'bg-gray-200'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pt-5 pb-4 overflow-y-auto max-h-[62vh]">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Let us help you today!</h2>

          {step === 1 && (
            <StepPostal
              form={form}
              postalLoading={postalLoading}
              postalValid={postalValid}
              postalError={postalError}
              onPostalChange={handlePostalChange}
            />
          )}
          {step === 2 && <StepService      form={form} setForm={setForm} />}
          {step === 3 && <StepContact      form={form} setForm={setForm} />}
          {step === 4 && <StepPreferences  form={form} setForm={setForm} />}
          {step === 5 && <StepReview       form={form} />}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          {submitError && (
            <p className="text-xs text-red-500 max-w-[180px] text-center">{submitError}</p>
          )}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canContinue()}
              className="px-8 py-2.5 rounded-xl bg-brand-red text-white font-semibold text-sm
                         hover:bg-brand-red-dark disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all flex items-center gap-1"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2.5 rounded-xl bg-brand-red text-white font-semibold text-sm
                         hover:bg-brand-red-dark disabled:opacity-60 transition-all flex items-center gap-2"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                : 'Submit Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Shared components ──────────────────────────────────────────────────────

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-brand-red px-6 py-4 flex items-start justify-between">
      <div>
        <p className="text-red-200 text-xs font-semibold uppercase tracking-widest">Advance Heating & Cooling</p>
        <h1 className="text-white text-xl font-bold leading-tight">Request Service Online</h1>
      </div>
      <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5">
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

// Step 1
function StepPostal({ form, postalLoading, postalValid, postalError, onPostalChange }: {
  form: FormData
  postalLoading: boolean
  postalValid: boolean
  postalError: string | null
  onPostalChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
        <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
          <rect x="10" y="30" width="38" height="22" rx="3" fill="#FFCDD2" stroke="#D32F2F" strokeWidth="2"/>
          <path d="M48 36 L58 36 L58 52 L48 52 Z" fill="#FFCDD2" stroke="#D32F2F" strokeWidth="2"/>
          <circle cx="20" cy="52" r="4" fill="#D32F2F"/>
          <circle cx="48" cy="52" r="4" fill="#D32F2F"/>
          <circle cx="40" cy="22" r="9" fill="#D32F2F"/>
          <circle cx="40" cy="22" r="3.5" fill="white"/>
          <path d="M40 31 L35 43 L45 43 Z" fill="#D32F2F"/>
        </svg>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900">Where are you located?</h3>
        <p className="text-gray-500 text-sm mt-1">
          Enter your postal or ZIP code — we will pin your location on the map.
        </p>
      </div>

      <div className="w-full relative">
        <input
          type="text"
          placeholder="e.g. N2C 1L6  or  90210"
          value={form.postalCode}
          onChange={e => onPostalChange(e.target.value)}
          maxLength={10}
          className="form-input pr-10 tracking-widest text-center text-base font-semibold"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {postalLoading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
          {postalValid  && !postalLoading && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          {postalError  && !postalLoading && <AlertCircle  className="w-5 h-5 text-red-400" />}
        </div>
      </div>

      {postalError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 w-full">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {postalError}
        </div>
      )}

      {postalValid && form.lat && (
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 w-full">
          <MapPin className="w-4 h-4 text-green-600 shrink-0" />
          <span className="font-semibold">
            {[form.city, form.state, form.country].filter(Boolean).join(', ')}
          </span>
          <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto shrink-0" />
        </div>
      )}

      {postalValid && form.lat && form.lng && (
        <div className="w-full">
          <PostalMap lat={form.lat} lng={form.lng} label={form.postalCode} />
        </div>
      )}
    </div>
  )
}

// Step 2
function StepService({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  return (
    <div>
      <LocationBar form={form} />
      <h3 className="text-base font-bold text-gray-900 mb-4">What can we help you with?</h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {SERVICE_TYPES.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setForm(f => ({ ...f, serviceType: id }))}
            className={`service-card ${form.serviceType === id ? 'selected' : ''}`}>
            <Icon />
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
      {form.serviceType && (
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What do you need?</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_ACTIONS.map(a => (
                <button key={a} onClick={() => setForm(f => ({ ...f, serviceAction: a }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    form.serviceAction === a ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-red'
                  }`}>{a}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Equipment age</p>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_AGES.map(a => (
                <button key={a} onClick={() => setForm(f => ({ ...f, equipmentAge: a }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    form.equipmentAge === a ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-red'
                  }`}>{a}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Step 3
function StepContact({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  return (
    <div>
      <SummaryBar form={form} />
      <h3 className="text-base font-bold text-gray-900 mb-4">How can we reach you?</h3>
      <div className="grid grid-cols-2 gap-3">
        <input className="form-input" placeholder="First Name"    value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
        <input className="form-input" placeholder="Last Name"     value={form.lastName}  onChange={e => setForm(f => ({ ...f, lastName:  e.target.value }))} />
        <input className="form-input" placeholder="Phone Number"  type="tel"   value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        <input className="form-input" placeholder="Email Address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      </div>
    </div>
  )
}

// Step 4
function StepPreferences({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  return (
    <div>
      <SummaryBar form={form} />
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">Your preferred contact method?</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['Phone', 'Email'] as const).map(opt => (
              <button key={opt} onClick={() => setForm(f => ({ ...f, preferredContact: opt }))}
                className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                  form.preferredContact === opt
                    ? 'bg-red-50 border-brand-red text-brand-red'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>{opt}</button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Where we can find you?</h3>
          <input className="form-input" placeholder="Street Address"
            value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          {form.lat && form.lng && (
            <PostalMap lat={form.lat} lng={form.lng} label={form.postalCode} />
          )}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Additional Notes?</h3>
          <textarea className="form-input resize-none h-20" placeholder="Tell us about your problem."
            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
      </div>
    </div>
  )
}

// Step 5
function StepReview({ form }: { form: FormData }) {
  const locationLabel = [form.city, form.state, form.country].filter(Boolean).join(', ')
  const rows = [
    { label: 'Service',       value: form.serviceType },
    form.serviceAction && { label: 'Action',        value: form.serviceAction },
    form.equipmentAge  && { label: 'Equipment Age', value: form.equipmentAge },
    { label: 'Name',          value: `${form.firstName} ${form.lastName}` },
    { label: 'Phone',         value: form.phone },
    { label: 'Email',         value: form.email },
    { label: 'Location',      value: `${locationLabel} (${form.postalCode})` },
    form.address && { label: 'Address',      value: form.address },
    { label: 'Contact via',   value: form.preferredContact },
    form.notes && { label: 'Notes',         value: form.notes },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div>
      <SummaryBar form={form} />
      <h3 className="text-base font-bold text-gray-900 mb-3">Review your request</h3>
      <div className="space-y-2 bg-gray-50 rounded-2xl p-4 text-sm mb-4">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex gap-2">
            <span className="text-gray-400 font-medium w-28 shrink-0">{label}</span>
            <span className="text-gray-800 font-semibold break-all">{value}</span>
          </div>
        ))}
      </div>
      {form.lat && form.lng && (
        <>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Service Location</p>
          <PostalMap lat={form.lat} lng={form.lng} label={form.postalCode} />
        </>
      )}
    </div>
  )
}

// ── Shared helpers ─────────────────────────────────────────────────────────

function LocationBar({ form }: { form: FormData }) {
  const label = [form.city, form.state].filter(Boolean).join(', ') || form.postalCode
  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 mb-4 text-sm">
      <div className="flex items-center gap-2 text-gray-600">
        <MapPin className="w-4 h-4 text-brand-red" />
        <span className="font-medium">{label} · {form.postalCode}</span>
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      </div>
      <Pencil className="w-3.5 h-3.5 text-gray-400" />
    </div>
  )
}

function SummaryBar({ form }: { form: FormData }) {
  const Icon = SERVICE_TYPES.find(s => s.id === form.serviceType)?.Icon
  const locationLabel = [form.city, form.state].filter(Boolean).join(', ') || form.postalCode
  return (
    <div className="bg-gray-50 rounded-2xl p-3 mb-5 border border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Summary</p>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
            <Icon />
          </div>
        )}
        <div>
          <p className="font-bold text-gray-900">{form.serviceType}</p>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {form.serviceAction && <span className="tag-pill bg-brand-red">{form.serviceAction}</span>}
            {form.equipmentAge  && <span className="tag-pill bg-brand-red">{form.equipmentAge}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
        <MapPin className="w-3 h-3" />
        <span>{locationLabel} · {form.postalCode}</span>
      </div>
    </div>
  )
}
