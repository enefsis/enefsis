'use client'

export default function ContractDePage() {
  return (
    <div className="min-h-screen font-sans contract-page" style={{ background: '#0D0F14', color: '#C8CDD8' }}>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
          @page { margin: 1.8cm; size: A4 portrait; }
          body, html { background: #fff !important; }
          .contract-page { background: #fff !important; color: #000 !important; }
          .contract-inner { max-width: 100% !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          h1.contract-title { color: #000 !important; font-size: 18pt !important; }
          h2.section-title { color: #000 !important; font-size: 11pt !important; border-bottom: 1.5px solid #000 !important; padding-bottom: 3px !important; margin-bottom: 8px !important; }
          h3.sub-title { color: #222 !important; font-size: 10pt !important; }
          p, li, span, td, th, label { color: #000 !important; font-size: 9.5pt !important; line-height: 1.55 !important; }
          .provider-box { background: #f7f7f7 !important; border: 1px solid #bbb !important; border-radius: 0 !important; }
          .form-line { border-bottom: 1px solid #000 !important; background: transparent !important; }
          .form-label { color: #555 !important; font-size: 7.5pt !important; }
          .check-label { color: #000 !important; }
          input[type="checkbox"] { width: 11px !important; height: 11px !important; accent-color: #000 !important; }
          .sig-box { border: 1px solid #ccc !important; background: transparent !important; }
          .section-block { page-break-inside: avoid; }
          .meta-row { border-color: #ccc !important; color: #000 !important; }
          .divider { border-color: #999 !important; }
          ul { padding-left: 16px !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="contract-inner mx-auto max-w-3xl px-6 py-12">

        {/* ── Top nav (screen only) ─────────────────────────────────── */}
        <nav className="no-print flex items-center justify-between mb-10">
          <img src="/enefsis-logo-transparent.png" alt="Enefsis" style={{ height: 38, objectFit: 'contain' }} />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-semibold transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(100deg, #2B65F0 0%, #1B4FD8 100%)',
              color: '#fff',
              fontSize: 14,
              boxShadow: '0 4px 16px rgba(43,101,240,0.35)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Drucken / Als PDF speichern
          </button>
        </nav>

        {/* ── Contract header ───────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="contract-title font-display font-bold text-white mb-1" style={{ fontSize: 26 }}>
            DIENSTLEISTUNGSVERTRAG
          </h1>
          <p className="font-sans font-semibold tracking-widest uppercase" style={{ fontSize: 11, color: '#2B5CE6' }}>
            Enefsis NFC Smart Hub
          </p>
        </div>

        {/* Contract meta row */}
        <div className="meta-row flex gap-6 mb-10 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex-1">
            <p className="form-label text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(200,205,216,0.45)', fontSize: 10 }}>Vertragsnummer</p>
            <div className="form-line h-7 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }} />
          </div>
          <div className="flex-1">
            <p className="form-label text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(200,205,216,0.45)', fontSize: 10 }}>Vertragsdatum</p>
            <div className="form-line h-7 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }} />
          </div>
        </div>

        <div className="space-y-9">

          {/* ── 1. Vertragsparteien ───────────────────────────────── */}
          <div className="section-block">
            <h2 className="section-title font-display font-bold mb-5 pb-2 border-b" style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
              1. Vertragsparteien
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {/* Provider */}
              <div className="provider-box rounded-xl p-4" style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="form-label font-semibold uppercase tracking-widest mb-3" style={{ fontSize: 9, color: '#2B5CE6' }}>Auftragnehmer</p>
                <p className="font-semibold text-white" style={{ fontSize: 13 }}>Multimedia Agentur, Georgios Niokos</p>
                <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                  Schnirchgasse 2/17, 1030 Wien<br />
                  Österreich<br />
                  ATU: ATU78295916<br />
                  <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span>
                </p>
              </div>

              {/* Client */}
              <div>
                <p className="form-label font-semibold uppercase tracking-widest mb-3" style={{ fontSize: 9, color: 'rgba(200,205,216,0.45)' }}>Auftraggeber</p>
                <div className="space-y-3">
                  {[
                    'Firmenname / Handelsbezeichnung',
                    'Ansprechperson',
                    'Adresse',
                    'Ort / PLZ / Land',
                    'E-Mail',
                    'Telefon',
                    'UID-Nummer (falls vorhanden)',
                  ].map(label => (
                    <div key={label}>
                      <p className="form-label" style={{ fontSize: 9, color: 'rgba(200,205,216,0.4)', marginBottom: 2 }}>{label}</p>
                      <div className="form-line h-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Vertragsdetails ────────────────────────────────── */}
          <div className="section-block">
            <h2 className="section-title font-display font-bold mb-5 pb-2 border-b" style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
              2. Vertragsdetails
            </h2>

            <div className="grid grid-cols-2 gap-5 mb-5">
              {[
                'Leistungsbeginn',
                'Anzahl NFC-Stands',
                'Monatliche / jährliche Gebühr (exkl. MwSt.)',
                'Erster Abrechnungstermin',
              ].map(label => (
                <div key={label}>
                  <p className="form-label" style={{ fontSize: 9, color: 'rgba(200,205,216,0.4)', marginBottom: 2 }}>{label}</p>
                  <div className="form-line h-7 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }} />
                </div>
              ))}
            </div>

            {/* Plan checkboxes */}
            <div className="mb-4">
              <p className="form-label mb-2" style={{ fontSize: 10, color: 'rgba(200,205,216,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Abonnement-Paket (eines auswählen)
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  'Basic Monatlich — €49 / Monat + MwSt.',
                  'Basic Jährlich — €499 / Jahr + MwSt.',
                  'Pro Monatlich — €100 / Monat + MwSt.',
                  'Pro Jährlich — €900 / Jahr + MwSt.',
                ].map(plan => (
                  <label key={plan} className="check-label flex items-center gap-2.5 cursor-pointer" style={{ fontSize: 13 }}>
                    <input type="checkbox" className="shrink-0" style={{ width: 14, height: 14, accentColor: '#2B65F0' }} />
                    <span style={{ color: '#C8CDD8' }}>{plan}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="form-label mb-2" style={{ fontSize: 10, color: 'rgba(200,205,216,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Zahlungsart
              </p>
              <div className="flex gap-8">
                {[
                  'Stripe — automatische Karten-/SEPA-Lastschrift',
                  'Banküberweisung (nach schriftlicher Vereinbarung)',
                ].map(method => (
                  <label key={method} className="check-label flex items-center gap-2.5 cursor-pointer" style={{ fontSize: 13 }}>
                    <input type="checkbox" className="shrink-0" style={{ width: 14, height: 14, accentColor: '#2B65F0' }} />
                    <span style={{ color: '#C8CDD8' }}>{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Setup fee */}
            <div className="mt-4">
              <p className="form-label" style={{ fontSize: 9, color: 'rgba(200,205,216,0.4)', marginBottom: 2 }}>Einrichtungsgebühr (€20 × __ Stands)</p>
              <div className="form-line h-7 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }} />
            </div>
          </div>

          {/* ── 3. Leistungsbeschreibung ──────────────────────────── */}
          <div className="section-block">
            <h2 className="section-title font-display font-bold mb-4 pb-2 border-b" style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
              3. Leistungsbeschreibung
            </h2>
            <p className="mb-3" style={{ fontSize: 13 }}>
              Der Auftragnehmer gewährt dem Auftraggeber für die Vertragslaufzeit Zugang zur <strong style={{ color: '#fff' }}>Enefsis NFC Smart Hub</strong>-Plattform. Die Leistung umfasst:
            </p>
            <ul className="space-y-1.5 pl-5 list-disc" style={{ fontSize: 13 }}>
              <li>Individuell gestaltete, mobiloptimierte NFC-Zielseiten für den Betrieb des Auftraggebers mit Speisekarte, Kontaktdaten, Social-Media-Links und Bewertungsaufforderungen</li>
              <li>Analyse-Dashboard mit Echtzeit- und Verlaufsdaten zu Tap-Ereignissen, Button-Klicks, Menüaufrufen, Besuchersprache und Gerätetyp</li>
              <li>No-Code-Seiteneditor zur Verwaltung von Speisekarten, Fotos, Öffnungszeiten, WLAN-Daten und weiteren Inhalten</li>
              <li>NFC-Stand-Verwaltung einschließlich Tischnummernzuweisung und standspezifischer Analyse</li>
              <li>Standard-E-Mail-Support unter <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span>, Antwort innerhalb von 2 Werktagen</li>
            </ul>
          </div>

          {/* ── 4. Mindestvertragslaufzeit ────────────────────────── */}
          <div className="section-block">
            <h2 className="section-title font-display font-bold mb-4 pb-2 border-b" style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
              4. Mindestvertragslaufzeit
            </h2>
            <p style={{ fontSize: 13 }}>
              Dieser Vertrag hat eine <strong style={{ color: '#fff' }}>Mindestlaufzeit von 12 Monaten</strong> ab dem in §2 angegebenen Leistungsbeginn. Eine vorzeitige Kündigung vor Ablauf der Mindestlaufzeit ist nicht möglich. Eine vorzeitige Beendigung entbindet den Auftraggeber nicht von der Verpflichtung, sämtliche für den vereinbarten Zeitraum fälligen Entgelte zu entrichten.
            </p>
          </div>

          {/* ── 5. Einrichtungsgebühr ─────────────────────────────── */}
          <div className="section-block">
            <h2 className="section-title font-display font-bold mb-4 pb-2 border-b" style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
              5. Einrichtungsgebühr
            </h2>
            <p style={{ fontSize: 13 }}>
              Bei Vertragsabschluss ist eine einmalige Einrichtungsgebühr von <strong style={{ color: '#fff' }}>€20 pro NFC-Stand</strong> fällig. Diese Gebühr ist <strong style={{ color: '#fff' }}>nicht rückerstattbar</strong> und deckt die Programmierung, Qualitätssicherung und Konfiguration jedes vom Auftragnehmer bereitgestellten NFC-Stands.
            </p>
          </div>

          {/* ── 6. Zahlungsbedingungen ────────────────────────────── */}
          <div className="section-block">
            <h2 className="section-title font-display font-bold mb-4 pb-2 border-b" style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
              6. Zahlungsbedingungen
            </h2>
            <ul className="space-y-2 pl-5 list-disc" style={{ fontSize: 13 }}>
              <li>Abonnementgebühren werden monatlich oder jährlich gemäß §2 zum vereinbarten Abrechnungstermin in Rechnung gestellt.</li>
              <li>Rechnungen werden von <strong style={{ color: '#fff' }}>Multimedia Agentur Georgios Niokos</strong> ausgestellt und enthalten die Mehrwertsteuer gemäß österreichischem Steuerrecht (UStG 1994).</li>
              <li>EU-Unternehmenskunden mit gültiger UID-Nummer können im Rahmen des <strong style={{ color: '#fff' }}>Reverse-Charge-Verfahrens</strong> abgerechnet werden; der Auftraggeber ist verpflichtet, eine gültige UID-Nummer mitzuteilen.</li>
              <li>Bei einem fehlgeschlagenen oder ausgebliebenen Zahlungseingang hat der Auftraggeber eine <strong style={{ color: '#fff' }}>Nachfrist von 7 Kalendertagen</strong>, um den offenen Betrag zu begleichen.</li>
              <li>Wird der Betrag nicht innerhalb der Nachfrist bezahlt, wird das Konto <strong style={{ color: '#fff' }}>gesperrt</strong> (Zielseiten offline, Dashboard-Zugang eingeschränkt), bis die Zahlung eingeht. Die Sperrung entbindet nicht von der Zahlungspflicht.</li>
            </ul>
          </div>

          {/* ── 7. Kündigung ──────────────────────────────────────── */}
          <div className="section-block">
            <h2 className="section-title font-display font-bold mb-4 pb-2 border-b" style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
              7. Kündigung
            </h2>
            <p style={{ fontSize: 13 }}>
              Nach Ablauf der 12-monatigen Mindestlaufzeit können beide Parteien den Vertrag mit einer <strong style={{ color: '#fff' }}>Frist von 30 Tagen</strong> schriftlich per E-Mail an <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span> kündigen. Die Kündigung wird zum Ende der laufenden Abrechnungsperiode nach Ablauf der Kündigungsfrist wirksam. Anteilige Rückerstattungen werden nicht gewährt.
            </p>
          </div>

          {/* ── 8. Pflichten ──────────────────────────────────────── */}
          <div className="section-block">
            <h2 className="section-title font-display font-bold mb-4 pb-2 border-b" style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
              8. Pflichten der Vertragsparteien
            </h2>

            <h3 className="sub-title font-semibold mb-2" style={{ fontSize: 12, color: 'rgba(240,242,248,0.7)' }}>Pflichten des Auftraggebers</h3>
            <ul className="space-y-1.5 pl-5 list-disc mb-4" style={{ fontSize: 13 }}>
              <li>Bereitstellung richtiger, aktueller und vollständiger Daten bei der Registrierung und während der gesamten Vertragslaufzeit</li>
              <li>Vertrauliche Behandlung der Zugangsdaten; unverzügliche Benachrichtigung des Auftragnehmers bei Verdacht auf unbefugten Zugriff</li>
              <li>Nutzung der NFC-Stands ausschließlich im eigenen Betrieb und ausschließlich für rechtmäßige, geschäftliche Zwecke</li>
              <li>Sicherstellung, dass alle hochgeladenen Inhalte (Speisekarten, Fotos, Links) den geltenden Gesetzen entsprechen und keine Rechte Dritter verletzen</li>
              <li>Fristgerechte Begleichung aller Entgelte gemäß §6</li>
            </ul>

            <h3 className="sub-title font-semibold mb-2" style={{ fontSize: 12, color: 'rgba(240,242,248,0.7)' }}>Pflichten des Auftragnehmers</h3>
            <ul className="space-y-1.5 pl-5 list-disc" style={{ fontSize: 13 }}>
              <li>Anstreben einer monatlichen Verfügbarkeit von 99,5 % für NFC-Zielseiten und Dashboard</li>
              <li>Verarbeitung personenbezogener Daten gemäß DSGVO und der Enefsis-Datenschutzerklärung</li>
              <li>Bereitstellung von E-Mail-Support unter <span style={{ color: '#2B5CE6' }}>support@enefsis.com</span> mit einer angestrebten Antwortzeit von 2 Werktagen</li>
              <li>Ankündigung wesentlicher Änderungen an Leistungen oder Preisen mit mindestens 30 Tagen Vorlauf</li>
            </ul>
          </div>

          {/* ── 9. Haftungsbeschränkung ───────────────────────────── */}
          <div className="section-block">
            <h2 className="section-title font-display font-bold mb-4 pb-2 border-b" style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
              9. Haftungsbeschränkung
            </h2>
            <p style={{ fontSize: 13 }}>
              Die Gesamthaftung des Auftragnehmers für Ansprüche aus oder im Zusammenhang mit diesem Vertrag ist auf die <strong style={{ color: '#fff' }}>vom Auftraggeber im Kalendermonat unmittelbar vor dem haftungsbegründenden Ereignis entrichteten Entgelte</strong> beschränkt. Eine Haftung für mittelbare Schäden, Folgeschäden oder entgangenen Gewinn ist ausgeschlossen. Die Haftung für Personenschäden, grobe Fahrlässigkeit oder arglistige Täuschung bleibt nach österreichischem Recht unberührt.
            </p>
          </div>

          {/* ── 10. Anwendbares Recht ─────────────────────────────── */}
          <div className="section-block">
            <h2 className="section-title font-display font-bold mb-4 pb-2 border-b" style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
              10. Anwendbares Recht und Gerichtsstand
            </h2>
            <p style={{ fontSize: 13 }}>
              Dieser Vertrag unterliegt <strong style={{ color: '#fff' }}>österreichischem Recht</strong>. Für alle Streitigkeiten, die sich aus oder im Zusammenhang mit diesem Vertrag ergeben und nicht einvernehmlich gelöst werden können, ist das zuständige Gericht in <strong style={{ color: '#fff' }}>Wien, Österreich</strong>, ausschließlich zuständig.
            </p>
          </div>

          {/* ── 11. Unterschriften ────────────────────────────────── */}
          <div className="section-block">
            <h2 className="section-title font-display font-bold mb-6 pb-2 border-b" style={{ fontSize: 14, color: '#2B5CE6', borderColor: 'rgba(43,92,230,0.3)' }}>
              11. Unterschriften
            </h2>
            <p className="mb-6" style={{ fontSize: 13 }}>
              Mit ihrer Unterschrift bestätigen beide Parteien, dass sie diesen Vertrag gelesen, verstanden und den darin enthaltenen Bedingungen zugestimmt haben.
            </p>

            <div className="grid grid-cols-2 gap-8">
              {/* Client signature */}
              <div>
                <p className="form-label font-semibold uppercase tracking-widest mb-4" style={{ fontSize: 9, color: 'rgba(200,205,216,0.45)' }}>Auftraggeber</p>
                <div className="space-y-4">
                  {['Vor- und Nachname', 'Funktion / Titel', 'Datum'].map(label => (
                    <div key={label}>
                      <p className="form-label" style={{ fontSize: 9, color: 'rgba(200,205,216,0.35)', marginBottom: 2 }}>{label}</p>
                      <div className="form-line h-7 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }} />
                    </div>
                  ))}
                  <div>
                    <p className="form-label" style={{ fontSize: 9, color: 'rgba(200,205,216,0.35)', marginBottom: 2 }}>Unterschrift</p>
                    <div className="sig-box rounded-lg" style={{ height: 80, border: '1px solid rgba(255,255,255,0.10)' }} />
                  </div>
                  <div>
                    <p className="form-label" style={{ fontSize: 9, color: 'rgba(200,205,216,0.35)', marginBottom: 2 }}>Firmenstempel (falls vorhanden)</p>
                    <div className="sig-box rounded-lg" style={{ height: 80, border: '1px solid rgba(255,255,255,0.10)' }} />
                  </div>
                </div>
              </div>

              {/* Provider signature */}
              <div>
                <p className="form-label font-semibold uppercase tracking-widest mb-4" style={{ fontSize: 9, color: '#2B5CE6' }}>Auftragnehmer</p>
                <div className="provider-box rounded-xl p-4 mb-4" style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="font-semibold text-white" style={{ fontSize: 13 }}>Georgios Niokos</p>
                  <p style={{ fontSize: 12 }}>Multimedia Agentur</p>
                  <p style={{ fontSize: 12 }}>Schnirchgasse 2/17, 1030 Wien</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="form-label" style={{ fontSize: 9, color: 'rgba(200,205,216,0.35)', marginBottom: 2 }}>Datum</p>
                    <div className="form-line h-7 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }} />
                  </div>
                  <div>
                    <p className="form-label" style={{ fontSize: 9, color: 'rgba(200,205,216,0.35)', marginBottom: 2 }}>Unterschrift</p>
                    <div className="sig-box rounded-lg" style={{ height: 80, border: '1px solid rgba(255,255,255,0.10)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="divider mt-12 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: 11, color: 'rgba(200,205,216,0.3)' }}>
            Enefsis · Multimedia Agentur, Georgios Niokos · Schnirchgasse 2/17, 1030 Wien, Österreich · ATU78295916 · support@enefsis.com
          </p>
        </div>

      </div>
    </div>
  )
}
