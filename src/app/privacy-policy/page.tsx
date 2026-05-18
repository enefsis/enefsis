import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Enefsis NFC Smart Hub',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen font-sans" style={{ background: '#0D0F14', color: '#C8CDD8' }}>
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Top nav */}
        <nav className="flex items-center justify-between mb-12">
          <img src="/enefsis-logo-transparent.png" alt="Enefsis" style={{ height: 38, objectFit: 'contain' }} />
          <a
            href="https://app.enefsis.com"
            className="font-sans hover:opacity-70 transition-opacity"
            style={{ fontSize: 13, color: 'rgba(200,205,216,0.45)' }}
          >
            ← Back to app
          </a>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#2B5CE6' }}>
            Legal
          </p>
          <h1 className="font-display font-bold text-white mb-3" style={{ fontSize: 36 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(200,205,216,0.5)' }}>
            Last updated: May 2026
          </p>
        </div>

        <div className="space-y-12" style={{ fontSize: 15, lineHeight: 1.75 }}>

          {/* 1. Data Controller */}
          <Section title="1. Data Controller">
            <p>
              The data controller for the Enefsis platform is:
            </p>
            <AddressBlock />
            <p>
              For any privacy-related enquiries, please contact us at{' '}
              <a href="mailto:support@enefsis.com" style={{ color: '#2B5CE6' }}>
                support@enefsis.com
              </a>.
            </p>
          </Section>

          {/* 2. Data we collect */}
          <Section title="2. Data We Collect">
            <p>
              We collect different categories of personal data depending on whether you are a
              registered business client or a guest visiting a client&apos;s NFC-powered page.
            </p>

            <SubHeading>Business Clients</SubHeading>
            <p>
              When you create an Enefsis account and manage your digital presence through our
              dashboard, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Full name and email address</li>
              <li>Business name, city, and restaurant type</li>
              <li>Payment information (processed by Stripe — we do not store raw card data)</li>
              <li>Menu content, opening hours, and other page configuration you provide</li>
              <li>Account activity logs (page saves, logins)</li>
            </ul>

            <SubHeading>Guests (NFC landing page visitors)</SubHeading>
            <p>
              Analytics data is collected <strong className="text-white">only with your explicit consent</strong>.
              If you decline the cookie consent banner, no tracking data is stored.
              If you accept, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Anonymous visitor ID (randomly generated, stored in your browser only)</li>
              <li>Device type (mobile or desktop)</li>
              <li>Tap / page-view events with timestamp</li>
              <li>Table number (if present in the NFC link)</li>
              <li>Button clicks (e.g. Google Review, Instagram, Call Waiter)</li>
              <li>Menu item views</li>
              <li>Browser language preference</li>
              <li>Country derived from IP address (IP is not stored)</li>
            </ul>
          </Section>

          {/* 3. Legal basis */}
          <Section title="3. Legal Basis for Processing">
            <Table
              rows={[
                ['Business client data (account, billing)', 'Art. 6(1)(b) GDPR — performance of a contract'],
                ['Guest analytics (with consent)', 'Art. 6(1)(a) GDPR — freely given, specific consent via cookie banner'],
                ['Security logs, fraud prevention', 'Art. 6(1)(f) GDPR — legitimate interests of the controller'],
                ['Invoice and billing records', 'Art. 6(1)(c) GDPR — compliance with Austrian legal retention obligations'],
              ]}
            />
          </Section>

          {/* 4. Retention */}
          <Section title="4. Data Retention">
            <Table
              rows={[
                ['Client account & page data', 'Duration of contract + 3 years after termination'],
                ['Guest analytics events', '24 months from date of collection'],
                ['Invoices and billing records', '7 years (§ 132 BAO — Austrian Federal Fiscal Code)'],
                ['Activity logs', '12 months'],
              ]}
            />
            <p>
              You may request deletion of your data at any time by contacting{' '}
              <a href="mailto:support@enefsis.com" style={{ color: '#2B5CE6' }}>
                support@enefsis.com
              </a>
              , unless retention is required by law.
            </p>
          </Section>

          {/* 5. Third-party processors */}
          <Section title="5. Third-Party Processors">
            <p>
              We share data with the following sub-processors solely to operate the service.
              All processors are bound by Data Processing Agreements. Transfers to the United States
              are covered by Standard Contractual Clauses (SCCs) approved by the European Commission.
            </p>
            <Table
              headers={['Processor', 'Purpose', 'Location']}
              rows={[
                ['Stripe', 'Payment processing and subscription management', 'USA — SCCs'],
                ['Supabase', 'Database and file storage', 'EU (Frankfurt, Germany)'],
                ['Vercel', 'Application hosting and edge delivery', 'USA — SCCs'],
                ['Resend', 'Transactional email (account notifications)', 'USA — SCCs'],
                ['DeepL', 'On-demand menu translation', 'Germany (EU)'],
                ['Google', 'Review ratings sync via Places API', 'USA — SCCs'],
              ]}
            />
          </Section>

          {/* 6. Your rights */}
          <Section title="6. Your Rights Under GDPR">
            <p>
              As a data subject under the General Data Protection Regulation you have the following rights:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-white">Right of access (Art. 15)</strong> — obtain a copy of all personal data we hold about you</li>
              <li><strong className="text-white">Right to rectification (Art. 16)</strong> — have inaccurate or incomplete data corrected without undue delay</li>
              <li><strong className="text-white">Right to erasure (Art. 17)</strong> — request deletion of your data (&quot;right to be forgotten&quot;) where no legal obligation requires us to retain it</li>
              <li><strong className="text-white">Right to restriction of processing (Art. 18)</strong> — ask us to suspend processing of your data in certain circumstances</li>
              <li><strong className="text-white">Right to data portability (Art. 20)</strong> — receive your data in a structured, commonly used, machine-readable format and transfer it to another controller</li>
              <li><strong className="text-white">Right to object (Art. 21)</strong> — object at any time to processing based on legitimate interests; we will cease unless we can demonstrate compelling legitimate grounds</li>
              <li><strong className="text-white">Right to withdraw consent (Art. 7(3))</strong> — withdraw any previously given consent at any time; withdrawal does not affect the lawfulness of prior processing</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{' '}
              <a href="mailto:support@enefsis.com" style={{ color: '#2B5CE6' }}>
                support@enefsis.com
              </a>
              . We will respond within <strong className="text-white">30 days</strong> of receipt.
            </p>
            <p>
              You also have the right to lodge a complaint with the Austrian supervisory authority:
            </p>
            <div
              className="rounded-xl px-5 py-4"
              style={{
                background: '#161920',
                border: '1px solid rgba(255,255,255,0.07)',
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              <p className="font-semibold text-white">Datenschutzbehörde (DSB)</p>
              <p>Barichgasse 40–42, 1030 Vienna, Austria</p>
              <p>
                <a
                  href="https://www.dsb.gv.at"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#2B5CE6' }}
                >
                  www.dsb.gv.at
                </a>
              </p>
            </div>
          </Section>

          {/* 7. Cookies */}
          <Section title="7. Cookies and Local Storage">
            <p>
              Enefsis uses browser <code style={codeStyle}>localStorage</code> rather than traditional
              HTTP cookies. The table below explains what is stored and why.
            </p>
            <Table
              headers={['Category', 'What is stored', 'Consent required?']}
              rows={[
                [
                  'Essential',
                  'Authentication session tokens managed by Supabase (httpOnly cookies set by the server). Required for the dashboard to function.',
                  'No — necessary for the service',
                ],
                [
                  'Analytics',
                  'Anonymous visitor ID, device type, tap events, button clicks, menu item views, language, and country. Stored only on NFC landing pages.',
                  'Yes — only set after you accept the consent banner',
                ],
                [
                  'Advertising',
                  'None.',
                  'N/A — we do not use advertising or cross-site tracking',
                ],
              ]}
            />
            <p>
              The following <code style={codeStyle}>localStorage</code> keys are used on NFC landing pages:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><code style={codeStyle}>enefsis_cookie_consent</code> — records your consent choice (<code style={codeStyle}>accepted</code> or <code style={codeStyle}>declined</code>)</li>
              <li><code style={codeStyle}>enefsis_visitor_id</code> — randomly generated anonymous ID for session analytics (written only after consent is accepted)</li>
              <li><code style={codeStyle}>enefsis_lang</code> — your selected display language</li>
            </ul>
            <p>
              <strong className="text-white">Withdrawing consent:</strong> clear your browser&apos;s
              site data for the relevant domain (Settings → Privacy → Clear browsing data, or
              equivalent). This removes all stored keys and resets consent — the banner will reappear
              on your next visit.
            </p>
          </Section>

          {/* 8. Changes */}
          <Section title="8. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the
              top of this page reflects the most recent revision. Continued use of the service after
              changes are posted constitutes acceptance of the updated policy. For material changes,
              we will notify registered clients by email.
            </p>
          </Section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: 13, color: 'rgba(200,205,216,0.35)' }}>
            © {new Date().getFullYear()} Enefsis — Multimedia Agentur, Georgios Niokos, Vienna, Austria
          </p>
        </div>

      </div>
    </div>
  )
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="font-display font-bold mb-4"
        style={{ fontSize: 20, color: '#2B5CE6' }}
      >
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-display font-semibold mt-5 mb-2"
      style={{ fontSize: 15, color: 'rgba(240,242,248,0.75)' }}
    >
      {children}
    </h3>
  )
}

function AddressBlock() {
  return (
    <div
      className="rounded-xl px-5 py-4 my-4"
      style={{
        background: '#161920',
        border: '1px solid rgba(255,255,255,0.07)',
        fontSize: 14,
        lineHeight: 1.8,
      }}
    >
      <p className="font-semibold text-white">Multimedia Agentur, Georgios Niokos</p>
      <p>Trading as <span className="text-white font-medium">Enefsis</span></p>
      <p>Vienna, Austria</p>
      <p>
        Email:{' '}
        <a href="mailto:support@enefsis.com" style={{ color: '#2B5CE6' }}>
          support@enefsis.com
        </a>
      </p>
    </div>
  )
}

function Table({
  headers,
  rows,
}: {
  headers?: string[]
  rows: string[][]
}) {
  return (
    <div
      className="rounded-xl overflow-hidden my-2"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <table className="w-full" style={{ fontSize: 14, borderCollapse: 'collapse' }}>
        {headers && (
          <thead>
            <tr style={{ background: 'rgba(43,92,230,0.10)' }}>
              {headers.map(h => (
                <th
                  key={h}
                  className="text-left font-semibold px-4 py-3"
                  style={{ color: 'rgba(240,242,248,0.7)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((cols, i) => (
            <tr
              key={i}
              style={{
                background: i % 2 === 0 ? '#161920' : '#111318',
                borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              {cols.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 align-top"
                  style={{ color: j === 0 ? 'rgba(240,242,248,0.8)' : 'rgba(200,205,216,0.6)' }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const codeStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, monospace',
  fontSize: 12,
  color: '#38BEFF',
  background: 'rgba(56,190,255,0.10)',
  border: '1px solid rgba(56,190,255,0.18)',
  borderRadius: 4,
  padding: '1px 5px',
}
