'use client'

import { useEffect, useRef } from 'react'
import { logContractGenerated } from '@/actions/contract-log'

export interface ContractData {
  clientId:         string
  fullName:         string | null
  email:            string
  restaurantName:   string | null
  address:          string | null
  city:             string | null
  phone:            string | null
  plan:             string | null
  amount:           number
  paymentMethod:    string | null
  nextBillingDate:  string | null
  standsCount:      number
  today:            string
  serviceStartDate: string
}

const PRINT_CSS = `
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    @page { margin: 1.8cm; size: A4 portrait; }
    body, html { background: #fff !important; }
    .contract-page { background: #fff !important; color: #000 !important; }
    .contract-inner { max-width: 100% !important; padding: 0 !important; }
    .no-print { display: none !important; }
    h1.contract-title { color: #000 !important; font-size: 18pt !important; }
    h2.section-title { color: #000 !important; font-size: 11pt !important; border-bottom: 1.5px solid #000 !important; padding-bottom: 3px !important; margin-bottom: 8px !important; }
    h3 { color: #222 !important; font-size: 10pt !important; }
    p, li, span, td, label { color: #000 !important; font-size: 9.5pt !important; line-height: 1.55 !important; }
    .provider-box { background: #f7f7f7 !important; border: 1px solid #bbb !important; border-radius: 0 !important; }
    .filled-val { border-bottom: 1px solid #000 !important; color: #000 !important; background: transparent !important; }
    .blank-line { border-bottom: 1px solid #000 !important; }
    .form-label { color: #555 !important; font-size: 7.5pt !important; }
    input[type="checkbox"] { width: 11px !important; height: 11px !important; }
    .sig-box { border: 1px solid #ccc !important; background: transparent !important; }
    .section-block { page-break-inside: avoid; }
    .divider { border-color: #999 !important; }
    ul { padding-left: 16px !important; }
  }
`

function fmtDate(str: string | null | undefined): string | null {
  if (!str) return null
  const d = str.includes('T') ? str.split('T')[0] : str
  const [y, m, day] = d.split('-')
  return `${day}-${m}-${y}`
}

function F({ value }: { value: string | null | undefined }) {
  return (
    <div
      className="filled-val"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.22)',
        minHeight: 28, paddingBottom: 3, fontSize: 13,
        color: value ? '#E8EBF5' : 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      {value ?? ''}
    </div>
  )
}

function Blank() {
  return <div className="blank-line" style={{ borderBottom: '1px solid rgba(255,255,255,0.18)', height: 28 }} />
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="form-label" style={{ fontSize: 9, color: 'rgba(200,205,216,0.4)', marginBottom: 2 }}>
      {children}
    </p>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="section-title font-display font-bold mb-4 pb-2 border-b"
      style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
      {children}
    </h2>
  )
}

export function FilledContractEn({ data }: { data: ContractData }) {
  const logged = useRef(false)

  useEffect(() => {
    if (logged.current) return
    logged.current = true
    logContractGenerated({
      userId:      data.clientId,
      language:    'en',
      plan:        data.plan ?? '',
      amount:      data.amount,
      stands:      data.standsCount,
      installDate: data.today,
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen font-sans contract-page" style={{ background: '#0D0F14', color: '#C8CDD8' }}>
      <style>{PRINT_CSS}</style>

      <div className="contract-inner mx-auto max-w-3xl px-6 py-12">

        {/* Top nav */}
        <nav className="no-print flex items-center justify-between mb-10">
          <img src="/enefsis-logo-transparent.png" alt="Enefsis" style={{ height: 38, objectFit: 'contain' }} />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-semibold transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(100deg, #2B65F0 0%, #1B4FD8 100%)', color: '#fff', fontSize: 14, boxShadow: '0 4px 16px rgba(43,101,240,0.35)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print / Download PDF
          </button>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="contract-title font-display font-bold text-white mb-1" style={{ fontSize: 26 }}>SERVICE CONTRACT</h1>
          <p className="font-sans font-semibold tracking-widest uppercase" style={{ fontSize: 11, color: '#2B5CE6' }}>Enefsis NFC Smart Hub</p>
        </div>

        {/* Meta */}
        <div className="flex gap-6 mb-10 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex-1"><Label>Contract No.</Label><Blank /></div>
          <div className="flex-1"><Label>Contract Date</Label><F value={fmtDate(data.today)} /></div>
        </div>

        <div className="space-y-9">

          {/* §1 Parties */}
          <div className="section-block">
            <SectionTitle>1. Contract Parties</SectionTitle>
            <div className="grid grid-cols-2 gap-6">
              <div className="provider-box rounded-xl p-4" style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ fontSize: 9, color: '#2B5CE6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, fontWeight: 600 }}>Service Provider</p>
                <p className="font-semibold text-white" style={{ fontSize: 13 }}>Multimedia Agentur, Georgios Niokos</p>
                <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                  Schnirchgasse 2/17, 1030 Wien<br />Austria<br />ATU: ATU78295916<br />
                  <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span>
                </p>
              </div>
              <div>
                <p style={{ fontSize: 9, color: 'rgba(200,205,216,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12, fontWeight: 600 }}>Client</p>
                <div className="space-y-3">
                  {([
                    ['Business / Trading Name', data.restaurantName],
                    ['Contact Person',          data.fullName],
                    ['Address',                 data.address],
                    ['City / ZIP / Country',    data.city],
                    ['Email',                   data.email],
                    ['Phone',                   data.phone],
                    ['VAT ID (if applicable)',  null],
                  ] as [string, string | null][]).map(([label, value]) => (
                    <div key={label}><Label>{label}</Label><F value={value} /></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* §2 Details */}
          <div className="section-block">
            <SectionTitle>2. Contract Details</SectionTitle>
            <div className="grid grid-cols-2 gap-5 mb-5">
              {([
                ['Service Start Date',                fmtDate(data.serviceStartDate)],
                ['Number of NFC Stands',             data.standsCount > 0 ? String(data.standsCount) : null],
                ['Monthly / Annual Fee (excl. VAT)', data.amount > 0 ? `€${data.amount}` : null],
                ['First Billing Date',               fmtDate(data.nextBillingDate)],
              ] as [string, string | null][]).map(([label, value]) => (
                <div key={label}><Label>{label}</Label><F value={value} /></div>
              ))}
            </div>

            <div className="mb-4">
              <p style={{ fontSize: 10, color: 'rgba(200,205,216,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Subscription Plan</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {([
                  ['basic_monthly', 'Basic Monthly — €49 / month + VAT'],
                  ['basic_yearly',  'Basic Yearly — €499 / year + VAT' ],
                  ['pro_monthly',   'Pro Monthly — €100 / month + VAT' ],
                  ['pro_yearly',    'Pro Yearly — €900 / year + VAT'   ],
                ] as [string, string][]).map(([id, label]) => (
                  <label key={id} className="flex items-center gap-2.5" style={{ fontSize: 13 }}>
                    <input type="checkbox" defaultChecked={data.plan === id} style={{ width: 14, height: 14, accentColor: '#2B5CE6' }} />
                    <span style={{ color: '#C8CDD8' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p style={{ fontSize: 10, color: 'rgba(200,205,216,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Payment Method</p>
              <div className="flex gap-8">
                {([
                  ['stripe',        'Stripe — automatic card / SEPA debit'  ],
                  ['bank_transfer', 'Bank transfer (by written agreement)'   ],
                ] as [string, string][]).map(([id, label]) => (
                  <label key={id} className="flex items-center gap-2.5" style={{ fontSize: 13 }}>
                    <input type="checkbox"
                      defaultChecked={data.paymentMethod === id || (id === 'stripe' && !data.paymentMethod)}
                      style={{ width: 14, height: 14, accentColor: '#2B5CE6' }} />
                    <span style={{ color: '#C8CDD8' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Setup Fee (€20 × {data.standsCount || '__'} stands)</Label>
              <F value={data.standsCount > 0 ? `€${data.standsCount * 20}` : null} />
            </div>
          </div>

          {/* §3 Service */}
          <div className="section-block">
            <SectionTitle>3. Service Description</SectionTitle>
            <p className="mb-3" style={{ fontSize: 13 }}>The Service Provider grants the Client access to the <strong style={{ color: '#fff' }}>Enefsis NFC Smart Hub</strong> platform for the duration of this contract. The service includes:</p>
            <ul className="space-y-1.5 pl-5 list-disc" style={{ fontSize: 13 }}>
              <li>Branded, mobile-optimised NFC landing pages for the Client&apos;s venue(s), displaying menu, contact details, social links, and review prompts</li>
              <li>Analytics dashboard with real-time and historical data on tap events, button clicks, menu item views, visitor language, and device type</li>
              <li>No-code page editor for managing menus, photos, opening hours, Wi-Fi credentials, and other content</li>
              <li>NFC stand management, including table number assignment and per-stand analytics</li>
              <li>Standard email support at <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span>, response within 2 business days</li>
            </ul>
          </div>

          {/* §4 Minimum */}
          <div className="section-block">
            <SectionTitle>4. Minimum Commitment</SectionTitle>
            <p style={{ fontSize: 13 }}>This agreement has a <strong style={{ color: '#fff' }}>minimum term of 12 months</strong> from the service start date specified in §2. The Client may not cancel or terminate this agreement before the expiry of the 12-month minimum term. Early termination does not relieve the Client of the obligation to pay all fees due for the committed period.</p>
          </div>

          {/* §5 Setup fee */}
          <div className="section-block">
            <SectionTitle>5. Setup Fee</SectionTitle>
            <p style={{ fontSize: 13 }}>A one-time setup fee of <strong style={{ color: '#fff' }}>€20 per NFC stand</strong> is payable upon signing this contract. This fee is <strong style={{ color: '#fff' }}>non-refundable</strong> and covers the programming, quality assurance, and configuration of each physical NFC stand supplied by the Service Provider.</p>
          </div>

          {/* §6 Payment */}
          <div className="section-block">
            <SectionTitle>6. Payment Terms</SectionTitle>
            <ul className="space-y-2 pl-5 list-disc" style={{ fontSize: 13 }}>
              <li>Subscription fees are billed monthly or annually as agreed in §2, on or around the billing date specified.</li>
              <li>Invoices are issued by <strong style={{ color: '#fff' }}>Multimedia Agentur Georgios Niokos</strong> and include VAT in accordance with Austrian law (UStG 1994).</li>
              <li>EU business clients with a valid VAT ID may be invoiced under the <strong style={{ color: '#fff' }}>reverse-charge mechanism</strong>; the Client is responsible for providing a valid VAT ID.</li>
              <li>If a payment fails or is not received by the due date, the Client has a <strong style={{ color: '#fff' }}>7-calendar-day grace period</strong> to settle the outstanding balance.</li>
              <li>If the balance is not settled within the grace period, the account will be <strong style={{ color: '#fff' }}>suspended</strong> (landing pages taken offline, dashboard access restricted) until payment is received. Suspension does not waive the fees owed.</li>
            </ul>
          </div>

          {/* §7 Cancellation */}
          <div className="section-block">
            <SectionTitle>7. Cancellation</SectionTitle>
            <p style={{ fontSize: 13 }}>After the 12-month minimum term, either party may cancel this agreement by giving <strong style={{ color: '#fff' }}>30 days&apos; written notice</strong> by email to <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span>. Cancellation takes effect at the end of the current billing period following the notice window. No partial-period refunds are issued.</p>
          </div>

          {/* §8 Obligations */}
          <div className="section-block">
            <SectionTitle>8. Obligations</SectionTitle>
            <h3 className="font-semibold mb-2" style={{ fontSize: 12, color: 'rgba(240,242,248,0.7)' }}>Client obligations</h3>
            <ul className="space-y-1.5 pl-5 list-disc mb-4" style={{ fontSize: 13 }}>
              <li>Provide accurate, current, and complete information during registration and throughout the contract term</li>
              <li>Keep login credentials confidential and notify the Service Provider immediately of any suspected unauthorised access</li>
              <li>Use NFC stands only within their own venue and only for lawful, legitimate business purposes</li>
              <li>Ensure all uploaded content complies with applicable law and does not infringe third-party rights</li>
              <li>Pay all fees on time in accordance with §6</li>
            </ul>
            <h3 className="font-semibold mb-2" style={{ fontSize: 12, color: 'rgba(240,242,248,0.7)' }}>Service Provider obligations</h3>
            <ul className="space-y-1.5 pl-5 list-disc" style={{ fontSize: 13 }}>
              <li>Target 99.5% monthly uptime for NFC landing pages and the client dashboard</li>
              <li>Process personal data in accordance with the GDPR and the Enefsis Privacy Policy</li>
              <li>Provide email support at <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span> with a target response time of 2 business days</li>
              <li>Give at least 30 days&apos; notice of any material changes to the service or pricing</li>
            </ul>
          </div>

          {/* §9 Liability */}
          <div className="section-block">
            <SectionTitle>9. Limitation of Liability</SectionTitle>
            <p style={{ fontSize: 13 }}>The Service Provider&apos;s total liability for any claim arising out of or related to this agreement is limited to the <strong style={{ color: '#fff' }}>fees paid by the Client in the calendar month immediately preceding the event giving rise to the claim</strong>. The Service Provider is not liable for indirect, consequential, incidental, or loss-of-profit damages. Nothing herein limits liability for death, personal injury caused by negligence, or fraud under Austrian law.</p>
          </div>

          {/* §10 Governing law */}
          <div className="section-block">
            <SectionTitle>10. Governing Law and Jurisdiction</SectionTitle>
            <p style={{ fontSize: 13 }}>This agreement is governed by <strong style={{ color: '#fff' }}>Austrian law</strong>. Any dispute that cannot be resolved amicably shall be subject to the exclusive jurisdiction of the competent courts of <strong style={{ color: '#fff' }}>Vienna, Austria</strong>.</p>
          </div>

          {/* §11 Signatures */}
          <div className="section-block">
            <SectionTitle>11. Signatures</SectionTitle>
            <p className="mb-6" style={{ fontSize: 13 }}>By signing below, both parties confirm they have read, understood, and agree to the terms of this contract.</p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p style={{ fontSize: 9, color: 'rgba(200,205,216,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, fontWeight: 600 }}>Client</p>
                <div className="space-y-4">
                  <div><Label>Full Name</Label><F value={data.fullName} /></div>
                  <div><Label>Position / Title</Label><Blank /></div>
                  <div><Label>Date</Label><F value={fmtDate(data.today)} /></div>
                  <div>
                    <Label>Signature</Label>
                    <div className="sig-box rounded-lg" style={{ height: 80, border: '1px solid rgba(255,255,255,0.10)' }} />
                  </div>
                  <div>
                    <Label>Company Stamp (if applicable)</Label>
                    <div className="sig-box rounded-lg" style={{ height: 80, border: '1px solid rgba(255,255,255,0.10)' }} />
                  </div>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 9, color: '#2B5CE6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, fontWeight: 600 }}>Service Provider</p>
                <div className="provider-box rounded-xl p-4 mb-4" style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="font-semibold text-white" style={{ fontSize: 13 }}>Georgios Niokos</p>
                  <p style={{ fontSize: 12 }}>Multimedia Agentur</p>
                  <p style={{ fontSize: 12 }}>Schnirchgasse 2/17, 1030 Wien</p>
                </div>
                <div className="space-y-4">
                  <div><Label>Date</Label><Blank /></div>
                  <div>
                    <Label>Signature</Label>
                    <div className="sig-box rounded-lg" style={{ height: 80, border: '1px solid rgba(255,255,255,0.10)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="divider mt-12 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: 11, color: 'rgba(200,205,216,0.3)' }}>
            Enefsis · Multimedia Agentur, Georgios Niokos · Schnirchgasse 2/17, 1030 Wien, Austria · ATU78295916 · support@enefsis.com
          </p>
        </div>

      </div>
    </div>
  )
}
