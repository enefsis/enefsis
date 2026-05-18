'use client'

import { useEffect, useRef } from 'react'
import { logContractGenerated } from '@/actions/contract-log'
export type ContractData = {
  clientId: string
  fullName: string | null
  email: string
  restaurantName: string | null
  address: string | null
  city: string | null
  phone: string | null
  plan: string | null
  amount: number
  paymentMethod: string | null
  nextBillingDate: string | null
  standsCount: number
  today: string
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

function F({ value }: { value: string | null | undefined }) {
  return (
    <div className="filled-val" style={{ borderBottom: '1px solid rgba(255,255,255,0.22)', minHeight: 28, paddingBottom: 3, fontSize: 13, color: value ? '#E8EBF5' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'flex-end' }}>
      {value ?? ''}
    </div>
  )
}

function Blank() {
  return <div className="blank-line" style={{ borderBottom: '1px solid rgba(255,255,255,0.18)', height: 28 }} />
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="form-label" style={{ fontSize: 9, color: 'rgba(200,205,216,0.4)', marginBottom: 2 }}>{children}</p>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="section-title font-display font-bold mb-4 pb-2 border-b"
      style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
      {children}
    </h2>
  )
}

export function FilledContractDe({ data }: { data: ContractData }) {
  const logged = useRef(false)

  useEffect(() => {
    if (logged.current) return
    logged.current = true
    logContractGenerated({
      userId:      data.clientId,
      language:    'de',
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
            Drucken / Als PDF speichern
          </button>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="contract-title font-display font-bold text-white mb-1" style={{ fontSize: 26 }}>DIENSTLEISTUNGSVERTRAG</h1>
          <p className="font-sans font-semibold tracking-widest uppercase" style={{ fontSize: 11, color: '#2B5CE6' }}>Enefsis NFC Smart Hub</p>
        </div>

        {/* Meta */}
        <div className="flex gap-6 mb-10 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex-1"><Label>Vertragsnummer</Label><Blank /></div>
          <div className="flex-1"><Label>Vertragsdatum</Label><F value={data.today} /></div>
        </div>

        <div className="space-y-9">

          {/* §1 Vertragsparteien */}
          <div className="section-block">
            <SectionTitle>1. Vertragsparteien</SectionTitle>
            <div className="grid grid-cols-2 gap-6">
              <div className="provider-box rounded-xl p-4" style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ fontSize: 9, color: '#2B5CE6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, fontWeight: 600 }}>Auftragnehmer</p>
                <p className="font-semibold text-white" style={{ fontSize: 13 }}>Multimedia Agentur, Georgios Niokos</p>
                <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                  Schnirchgasse 2/17, 1030 Wien<br />Österreich<br />ATU: ATU78295916<br />
                  <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span>
                </p>
              </div>
              <div>
                <p style={{ fontSize: 9, color: 'rgba(200,205,216,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12, fontWeight: 600 }}>Auftraggeber</p>
                <div className="space-y-3">
                  {([
                    ['Firmenname / Handelsbezeichnung', data.restaurantName],
                    ['Ansprechperson',                  data.fullName],
                    ['Adresse',                         data.address],
                    ['Ort / PLZ / Land',                data.city],
                    ['E-Mail',                          data.email],
                    ['Telefon',                         data.phone],
                    ['UID-Nummer (falls vorhanden)',     null],
                  ] as [string, string | null][]).map(([label, value]) => (
                    <div key={label}><Label>{label}</Label><F value={value} /></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* §2 Vertragsdetails */}
          <div className="section-block">
            <SectionTitle>2. Vertragsdetails</SectionTitle>
            <div className="grid grid-cols-2 gap-5 mb-5">
              {([
                ['Leistungsbeginn',                          data.today],
                ['Anzahl NFC-Stands',                        data.standsCount > 0 ? String(data.standsCount) : null],
                ['Monatliche / jährliche Gebühr (exkl. MwSt.)', data.amount > 0 ? `€${data.amount}` : null],
                ['Erster Abrechnungstermin',                 data.nextBillingDate],
              ] as [string, string | null][]).map(([label, value]) => (
                <div key={label}><Label>{label}</Label><F value={value} /></div>
              ))}
            </div>

            <div className="mb-4">
              <p style={{ fontSize: 10, color: 'rgba(200,205,216,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Abonnement-Paket</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {([
                  ['basic_monthly', 'Basic Monatlich — €49 / Monat + MwSt.'],
                  ['basic_yearly',  'Basic Jährlich — €499 / Jahr + MwSt.' ],
                  ['pro_monthly',   'Pro Monatlich — €100 / Monat + MwSt.' ],
                  ['pro_yearly',    'Pro Jährlich — €900 / Jahr + MwSt.'   ],
                ] as [string, string][]).map(([id, label]) => (
                  <label key={id} className="flex items-center gap-2.5" style={{ fontSize: 13 }}>
                    <input type="checkbox" defaultChecked={data.plan === id} style={{ width: 14, height: 14, accentColor: '#2B65F0' }} />
                    <span style={{ color: '#C8CDD8' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p style={{ fontSize: 10, color: 'rgba(200,205,216,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Zahlungsart</p>
              <div className="flex gap-8">
                {([
                  ['stripe',        'Stripe — automatische Karten-/SEPA-Lastschrift'     ],
                  ['bank_transfer', 'Banküberweisung (nach schriftlicher Vereinbarung)'  ],
                ] as [string, string][]).map(([id, label]) => (
                  <label key={id} className="flex items-center gap-2.5" style={{ fontSize: 13 }}>
                    <input type="checkbox"
                      defaultChecked={data.paymentMethod === id || (id === 'stripe' && !data.paymentMethod)}
                      style={{ width: 14, height: 14, accentColor: '#2B65F0' }} />
                    <span style={{ color: '#C8CDD8' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Einrichtungsgebühr (€20 × {data.standsCount || '__'} Stands)</Label>
              <F value={data.standsCount > 0 ? `€${data.standsCount * 20}` : null} />
            </div>
          </div>

          {/* §3 Leistungsbeschreibung */}
          <div className="section-block">
            <SectionTitle>3. Leistungsbeschreibung</SectionTitle>
            <p className="mb-3" style={{ fontSize: 13 }}>Der Auftragnehmer gewährt dem Auftraggeber für die Vertragslaufzeit Zugang zur <strong style={{ color: '#fff' }}>Enefsis NFC Smart Hub</strong>-Plattform. Die Leistung umfasst:</p>
            <ul className="space-y-1.5 pl-5 list-disc" style={{ fontSize: 13 }}>
              <li>Individuell gestaltete, mobiloptimierte NFC-Zielseiten mit Speisekarte, Kontaktdaten, Social-Media-Links und Bewertungsaufforderungen</li>
              <li>Analyse-Dashboard mit Echtzeit- und Verlaufsdaten zu Tap-Ereignissen, Button-Klicks, Menüaufrufen, Besuchersprache und Gerätetyp</li>
              <li>No-Code-Seiteneditor zur Verwaltung von Speisekarten, Fotos, Öffnungszeiten, WLAN-Daten und weiteren Inhalten</li>
              <li>NFC-Stand-Verwaltung einschließlich Tischnummernzuweisung und standspezifischer Analyse</li>
              <li>Standard-E-Mail-Support unter <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span>, Antwort innerhalb von 2 Werktagen</li>
            </ul>
          </div>

          {/* §4 Mindestlaufzeit */}
          <div className="section-block">
            <SectionTitle>4. Mindestvertragslaufzeit</SectionTitle>
            <p style={{ fontSize: 13 }}>Dieser Vertrag hat eine <strong style={{ color: '#fff' }}>Mindestlaufzeit von 12 Monaten</strong> ab dem in §2 angegebenen Leistungsbeginn. Eine vorzeitige Kündigung ist nicht möglich. Eine vorzeitige Beendigung entbindet den Auftraggeber nicht von der Verpflichtung, sämtliche für den vereinbarten Zeitraum fälligen Entgelte zu entrichten.</p>
          </div>

          {/* §5 Einrichtungsgebühr */}
          <div className="section-block">
            <SectionTitle>5. Einrichtungsgebühr</SectionTitle>
            <p style={{ fontSize: 13 }}>Bei Vertragsabschluss ist eine einmalige Einrichtungsgebühr von <strong style={{ color: '#fff' }}>€20 pro NFC-Stand</strong> fällig. Diese Gebühr ist <strong style={{ color: '#fff' }}>nicht rückerstattbar</strong> und deckt die Programmierung, Qualitätssicherung und Konfiguration jedes vom Auftragnehmer bereitgestellten NFC-Stands.</p>
          </div>

          {/* §6 Zahlungsbedingungen */}
          <div className="section-block">
            <SectionTitle>6. Zahlungsbedingungen</SectionTitle>
            <ul className="space-y-2 pl-5 list-disc" style={{ fontSize: 13 }}>
              <li>Abonnementgebühren werden monatlich oder jährlich gemäß §2 zum vereinbarten Abrechnungstermin in Rechnung gestellt.</li>
              <li>Rechnungen werden von <strong style={{ color: '#fff' }}>Multimedia Agentur Georgios Niokos</strong> ausgestellt und enthalten die MwSt. gemäß österreichischem Steuerrecht (UStG 1994).</li>
              <li>EU-Unternehmenskunden mit gültiger UID-Nummer können im Rahmen des <strong style={{ color: '#fff' }}>Reverse-Charge-Verfahrens</strong> abgerechnet werden.</li>
              <li>Bei einem fehlgeschlagenen Zahlungseingang hat der Auftraggeber eine <strong style={{ color: '#fff' }}>Nachfrist von 7 Kalendertagen</strong>, um den offenen Betrag zu begleichen.</li>
              <li>Wird der Betrag nicht innerhalb der Nachfrist bezahlt, wird das Konto <strong style={{ color: '#fff' }}>gesperrt</strong> bis die Zahlung eingeht. Die Sperrung entbindet nicht von der Zahlungspflicht.</li>
            </ul>
          </div>

          {/* §7 Kündigung */}
          <div className="section-block">
            <SectionTitle>7. Kündigung</SectionTitle>
            <p style={{ fontSize: 13 }}>Nach Ablauf der 12-monatigen Mindestlaufzeit können beide Parteien den Vertrag mit einer <strong style={{ color: '#fff' }}>Frist von 30 Tagen</strong> schriftlich per E-Mail an <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span> kündigen. Die Kündigung wird zum Ende der laufenden Abrechnungsperiode nach Ablauf der Kündigungsfrist wirksam.</p>
          </div>

          {/* §8 Pflichten */}
          <div className="section-block">
            <SectionTitle>8. Pflichten der Vertragsparteien</SectionTitle>
            <h3 className="font-semibold mb-2" style={{ fontSize: 12, color: 'rgba(240,242,248,0.7)' }}>Pflichten des Auftraggebers</h3>
            <ul className="space-y-1.5 pl-5 list-disc mb-4" style={{ fontSize: 13 }}>
              <li>Bereitstellung richtiger, aktueller und vollständiger Daten bei der Registrierung und während der gesamten Vertragslaufzeit</li>
              <li>Vertrauliche Behandlung der Zugangsdaten; unverzügliche Benachrichtigung bei Verdacht auf unbefugten Zugriff</li>
              <li>Nutzung der NFC-Stands ausschließlich im eigenen Betrieb und ausschließlich für rechtmäßige Zwecke</li>
              <li>Sicherstellung, dass alle hochgeladenen Inhalte den geltenden Gesetzen entsprechen</li>
              <li>Fristgerechte Begleichung aller Entgelte gemäß §6</li>
            </ul>
            <h3 className="font-semibold mb-2" style={{ fontSize: 12, color: 'rgba(240,242,248,0.7)' }}>Pflichten des Auftragnehmers</h3>
            <ul className="space-y-1.5 pl-5 list-disc" style={{ fontSize: 13 }}>
              <li>Anstreben einer monatlichen Verfügbarkeit von 99,5 % für NFC-Zielseiten und Dashboard</li>
              <li>Verarbeitung personenbezogener Daten gemäß DSGVO und der Enefsis-Datenschutzerklärung</li>
              <li>E-Mail-Support unter <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span> mit einer angestrebten Antwortzeit von 2 Werktagen</li>
              <li>Ankündigung wesentlicher Änderungen mit mindestens 30 Tagen Vorlauf</li>
            </ul>
          </div>

          {/* §9 Haftung */}
          <div className="section-block">
            <SectionTitle>9. Haftungsbeschränkung</SectionTitle>
            <p style={{ fontSize: 13 }}>Die Gesamthaftung des Auftragnehmers ist auf die <strong style={{ color: '#fff' }}>vom Auftraggeber im Kalendermonat unmittelbar vor dem haftungsbegründenden Ereignis entrichteten Entgelte</strong> beschränkt. Eine Haftung für mittelbare Schäden oder entgangenen Gewinn ist ausgeschlossen.</p>
          </div>

          {/* §10 Anwendbares Recht */}
          <div className="section-block">
            <SectionTitle>10. Anwendbares Recht und Gerichtsstand</SectionTitle>
            <p style={{ fontSize: 13 }}>Dieser Vertrag unterliegt <strong style={{ color: '#fff' }}>österreichischem Recht</strong>. Ausschließlicher Gerichtsstand für alle Streitigkeiten ist <strong style={{ color: '#fff' }}>Wien, Österreich</strong>.</p>
          </div>

          {/* §11 Unterschriften */}
          <div className="section-block">
            <SectionTitle>11. Unterschriften</SectionTitle>
            <p className="mb-6" style={{ fontSize: 13 }}>Mit ihrer Unterschrift bestätigen beide Parteien, dass sie diesen Vertrag gelesen, verstanden und den darin enthaltenen Bedingungen zugestimmt haben.</p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p style={{ fontSize: 9, color: 'rgba(200,205,216,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, fontWeight: 600 }}>Auftraggeber</p>
                <div className="space-y-4">
                  <div><Label>Vor- und Nachname</Label><F value={data.fullName} /></div>
                  <div><Label>Funktion / Titel</Label><Blank /></div>
                  <div><Label>Datum</Label><F value={data.today} /></div>
                  <div>
                    <Label>Unterschrift</Label>
                    <div className="sig-box rounded-lg" style={{ height: 80, border: '1px solid rgba(255,255,255,0.10)' }} />
                  </div>
                  <div>
                    <Label>Firmenstempel (falls vorhanden)</Label>
                    <div className="sig-box rounded-lg" style={{ height: 80, border: '1px solid rgba(255,255,255,0.10)' }} />
                  </div>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 9, color: '#2B5CE6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, fontWeight: 600 }}>Auftragnehmer</p>
                <div className="provider-box rounded-xl p-4 mb-4" style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="font-semibold text-white" style={{ fontSize: 13 }}>Georgios Niokos</p>
                  <p style={{ fontSize: 12 }}>Multimedia Agentur</p>
                  <p style={{ fontSize: 12 }}>Schnirchgasse 2/17, 1030 Wien</p>
                </div>
                <div className="space-y-4">
                  <div><Label>Datum</Label><Blank /></div>
                  <div>
                    <Label>Unterschrift</Label>
                    <div className="sig-box rounded-lg" style={{ height: 80, border: '1px solid rgba(255,255,255,0.10)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="divider mt-12 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: 11, color: 'rgba(200,205,216,0.3)' }}>
            Enefsis · Multimedia Agentur, Georgios Niokos · Schnirchgasse 2/17, 1030 Wien, Österreich · ATU78295916 · support@enefsis.com
          </p>
        </div>

      </div>
    </div>
  )
}
