import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Enefsis NFC Smart Hub',
}

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(200,205,216,0.5)' }}>
            Last updated: May 2026
          </p>
        </div>

        <div className="space-y-12" style={{ fontSize: 15, lineHeight: 1.75 }}>

          {/* 1. Parties */}
          <Section title="1. Parties">
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between:
            </p>
            <AddressBlock
              name="Multimedia Agentur, Georgios Niokos"
              tradingAs="Enefsis"
              location="Vienna, Austria"
              email="support@enefsis.com"
              role="Service Provider"
            />
            <p>
              and the individual or legal entity that has registered for or uses the Enefsis platform
              (&quot;Client&quot; or &quot;you&quot;).
            </p>
            <p>
              By creating an account, activating a subscription, or using any part of the service,
              you confirm that you have read, understood, and agreed to these Terms. If you are
              entering into this agreement on behalf of a company or other legal entity, you represent
              that you have the authority to bind that entity.
            </p>
          </Section>

          {/* 2. Service */}
          <Section title="2. The Service">
            <p>
              Enefsis provides the <strong className="text-white">NFC Smart Hub</strong> platform, a
              software-as-a-service (SaaS) product designed for restaurants, cafés, and hospitality
              businesses. The platform includes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-white">NFC landing pages</strong> — branded, mobile-optimised
                pages served when a guest taps an Enefsis NFC stand, displaying the menu, contact
                information, social links, and review prompts
              </li>
              <li>
                <strong className="text-white">Analytics dashboard</strong> — real-time and historical
                data on tap events, menu views, button clicks, visitor language, and device type
              </li>
              <li>
                <strong className="text-white">Page editor</strong> — a no-code editor for managing
                restaurant content, menu sections, photos, opening hours, and page settings
              </li>
              <li>
                <strong className="text-white">NFC stand management</strong> — assignment of physical
                NFC stands to tables or locations, with per-stand analytics
              </li>
            </ul>
            <p>
              Enefsis reserves the right to add, modify, or discontinue features at any time. Material
              changes to the core service will be communicated to Clients with at least 30 days&apos;
              notice by email.
            </p>
          </Section>

          {/* 3. Plans & Pricing */}
          <Section title="3. Plans and Pricing">
            <p>
              The following subscription plans are available. All prices are exclusive of VAT, which
              will be added at the applicable Austrian or EU rate at the time of invoicing.
            </p>

            <Table
              headers={['Plan', 'Billing cycle', 'Price (excl. VAT)']}
              rows={[
                ['Basic', 'Monthly', '€49 / month'],
                ['Basic', 'Yearly', '€499 / year'],
                ['Pro',   'Monthly', '€100 / month'],
                ['Pro',   'Yearly',  '€900 / year'],
              ]}
            />

            <SubHeading>Additional fees</SubHeading>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-white">NFC stand setup fee:</strong> €20 per stand, charged
                once at the time of provisioning. This covers programming, quality assurance, and
                configuration of each physical NFC stand.
              </li>
              <li>
                <strong className="text-white">Custom pricing:</strong> enterprise or multi-location
                arrangements are available by written agreement. Contact{' '}
                <a href="mailto:support@enefsis.com" style={{ color: '#2B5CE6' }}>
                  support@enefsis.com
                </a>{' '}
                to discuss.
              </li>
            </ul>

            <p>
              Prices are subject to change. Existing Clients will be notified by email at least
              30 days before any price increase takes effect.
            </p>
          </Section>

          {/* 4. Commitment & Termination */}
          <Section title="4. Minimum Commitment and Termination">
            <p>
              All subscriptions carry a <strong className="text-white">minimum 12-month commitment</strong>{' '}
              from the date the subscription is first activated.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-white">No early termination:</strong> the Client may not cancel
                the subscription before the end of the 12-month minimum term. Early termination does
                not relieve the Client of the obligation to pay the remaining fees due for the
                committed period.
              </li>
              <li>
                <strong className="text-white">After the minimum term:</strong> subscriptions
                automatically renew on a monthly or yearly basis (matching the original billing cycle)
                unless written notice of cancellation is given at least 30 days before the renewal date.
              </li>
              <li>
                <strong className="text-white">Termination by Enefsis:</strong> Enefsis may terminate
                or suspend the service immediately if the Client breaches these Terms, fails to pay
                after the grace period set out in §5, or engages in activity that violates applicable law.
              </li>
              <li>
                <strong className="text-white">Effect of termination:</strong> upon termination, access
                to the dashboard and landing pages is revoked. Client data is retained for 3 years
                after termination as set out in the Privacy Policy, after which it is permanently deleted.
              </li>
            </ul>
          </Section>

          {/* 5. Payment */}
          <Section title="5. Payment and Invoicing">
            <SubHeading>Payment methods</SubHeading>
            <p>
              Payments are processed via <strong className="text-white">Stripe</strong> (automatic
              recurring billing by card or SEPA direct debit). Payment by bank transfer may be arranged
              by written agreement with Enefsis prior to the start of the subscription.
            </p>

            <SubHeading>Invoicing</SubHeading>
            <p>
              Invoices are issued by <strong className="text-white">Multimedia Agentur Georgios Niokos</strong>,
              Vienna, Austria. VAT is applied in accordance with Austrian VAT law (UStG 1994) and
              applicable EU VAT rules for cross-border B2B and B2C transactions. EU business Clients
              with a valid VAT ID may be eligible for the reverse-charge mechanism; it is the
              Client&apos;s responsibility to provide a valid VAT ID at the time of registration.
            </p>

            <SubHeading>Failed payments and suspension</SubHeading>
            <div
              className="rounded-xl px-5 py-4"
              style={{
                background: 'rgba(251,146,60,0.07)',
                border: '1px solid rgba(251,146,60,0.20)',
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              <p style={{ color: 'rgba(251,146,60,0.9)' }}>
                <strong>7-day grace period:</strong> if a payment fails, Enefsis will retry
                automatically and notify the Client by email. The Client has <strong>7 calendar days</strong>{' '}
                from the original due date to resolve the outstanding balance. If payment is not
                received within this period, the account will be <strong>suspended</strong> (landing
                pages taken offline, dashboard access restricted) until the balance is settled.
                Suspension does not cancel the subscription or waive any fees owed.
              </p>
            </div>
          </Section>

          {/* 6. Cancellation */}
          <Section title="6. Cancellation">
            <p>
              After the 12-month minimum term has elapsed (see §4), either party may cancel the
              subscription by giving <strong className="text-white">30 days&apos; written notice</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Notice must be sent by email to{' '}
                <a href="mailto:support@enefsis.com" style={{ color: '#2B5CE6' }}>
                  support@enefsis.com
                </a>{' '}
                from the email address registered to the account.
              </li>
              <li>
                Cancellation takes effect at the end of the current billing period following the
                30-day notice window. No partial-period refunds are issued.
              </li>
              <li>
                Subscriptions on yearly plans will continue until the end of the paid year;
                auto-renewal is disabled once notice is received.
              </li>
              <li>
                Upon cancellation, the Client&apos;s landing page is taken offline and dashboard
                access is revoked at the end of the final paid period.
              </li>
            </ul>
          </Section>

          {/* 7. Client Responsibilities */}
          <Section title="7. Client Responsibilities">
            <p>By using the Enefsis platform you agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-white">Accurate information:</strong> provide truthful,
                current, and complete information during registration and when configuring your
                page. Notify us promptly of any changes to your contact or billing details.
              </li>
              <li>
                <strong className="text-white">Account security:</strong> keep your login credentials
                confidential and not share access with unauthorised individuals. You are responsible
                for all activity that occurs under your account. Notify us immediately at{' '}
                <a href="mailto:support@enefsis.com" style={{ color: '#2B5CE6' }}>
                  support@enefsis.com
                </a>{' '}
                if you suspect unauthorised access.
              </li>
              <li>
                <strong className="text-white">Appropriate NFC use:</strong> deploy NFC stands only
                in your own venue for the purpose of presenting your business content to guests.
                Do not use NFC stands to link to harmful, deceptive, or unlawful content.
              </li>
              <li>
                <strong className="text-white">Lawful content:</strong> ensure that all content you
                upload or display (menus, photos, descriptions, links) complies with applicable law
                and does not infringe third-party intellectual property rights.
              </li>
              <li>
                <strong className="text-white">Compliance:</strong> you are responsible for obtaining
                any necessary permissions or licences required to operate your business and for
                compliance with local regulations applicable to your industry.
              </li>
            </ul>
          </Section>

          {/* 8. Our Responsibilities */}
          <Section title="8. Our Responsibilities">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-white">Uptime target:</strong> Enefsis targets{' '}
                <strong className="text-white">99.5% monthly uptime</strong> for NFC landing pages
                and the dashboard. Planned maintenance will be announced in advance where possible.
                Downtime caused by third-party infrastructure providers (Vercel, Supabase) or
                force-majeure events is excluded from this target.
              </li>
              <li>
                <strong className="text-white">Data protection:</strong> Enefsis processes personal
                data in accordance with the GDPR and our{' '}
                <a href="/privacy-policy" style={{ color: '#2B5CE6' }}>Privacy Policy</a>.
                We implement appropriate technical and organisational measures to protect your data.
              </li>
              <li>
                <strong className="text-white">Support:</strong> we provide support by email at{' '}
                <a href="mailto:support@enefsis.com" style={{ color: '#2B5CE6' }}>
                  support@enefsis.com
                </a>
                . We aim to respond to all enquiries within 2 business days.
              </li>
              <li>
                <strong className="text-white">Backups:</strong> client data is backed up regularly
                by our infrastructure provider. However, Enefsis does not guarantee recovery of
                data lost due to Client actions (e.g. accidental deletion of menu content).
              </li>
            </ul>
          </Section>

          {/* 9. Intellectual Property */}
          <Section title="9. Intellectual Property">
            <SubHeading>Platform</SubHeading>
            <p>
              The Enefsis platform — including its software, design, branding, and all associated
              intellectual property — is owned exclusively by{' '}
              <strong className="text-white">Multimedia Agentur, Georgios Niokos</strong>. Nothing
              in these Terms grants the Client any ownership right, title, or interest in the
              platform or its underlying technology.
            </p>

            <SubHeading>Client content</SubHeading>
            <p>
              All content you upload or create through the platform — including menu text, photos,
              logos, and business information — remains your property. You grant Enefsis a
              non-exclusive, royalty-free licence to host, display, and process that content solely
              for the purpose of providing the service to you. This licence ends when you cancel
              your subscription and your data is deleted.
            </p>

            <SubHeading>Feedback</SubHeading>
            <p>
              Any suggestions or feedback you provide about the platform may be used by Enefsis
              to improve the service without obligation or compensation.
            </p>
          </Section>

          {/* 10. Limitation of Liability */}
          <Section title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted by Austrian law:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Enefsis&apos;s total liability to the Client for any claim arising out of or related
                to these Terms or the service — whether in contract, tort, or otherwise — is
                limited to the <strong className="text-white">fees paid in the calendar month
                immediately preceding the event giving rise to the claim</strong>.
              </li>
              <li>
                Enefsis is not liable for any indirect, consequential, incidental, or special
                damages, including lost profits or lost revenue, even if advised of the possibility
                of such damages.
              </li>
              <li>
                Enefsis is not liable for service interruptions, data loss, or errors caused by
                third-party infrastructure providers, force-majeure events, or the Client&apos;s
                own actions.
              </li>
            </ul>
            <p>
              Nothing in these Terms limits liability for death or personal injury caused by
              negligence, fraud, or any other liability that cannot be excluded under Austrian law.
            </p>
          </Section>

          {/* 11. Governing Law */}
          <Section title="11. Governing Law and Jurisdiction">
            <p>
              These Terms are governed by and construed in accordance with the laws of{' '}
              <strong className="text-white">Austria</strong>, without regard to its conflict-of-law
              provisions.
            </p>
            <p>
              Any dispute arising out of or in connection with these Terms that cannot be resolved
              amicably shall be subject to the exclusive jurisdiction of the competent courts of{' '}
              <strong className="text-white">Vienna, Austria</strong>.
            </p>
            <p>
              For EU consumers, this choice of law does not deprive you of the mandatory consumer
              protections afforded by the law of your country of residence.
            </p>
          </Section>

          {/* 12. Changes to Terms */}
          <Section title="12. Changes to These Terms">
            <p>
              Enefsis may update these Terms from time to time to reflect changes in the service,
              applicable law, or business practices.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                We will notify registered Clients by email at least{' '}
                <strong className="text-white">30 days before</strong> any material changes take
                effect.
              </li>
              <li>
                The &quot;Last updated&quot; date at the top of this page reflects the most recent revision.
              </li>
              <li>
                Continued use of the service after the effective date of changes constitutes
                acceptance of the revised Terms. If you do not agree to the changes, you may
                cancel your subscription in accordance with §6.
              </li>
            </ul>
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

function AddressBlock({
  name, tradingAs, location, email, role,
}: {
  name: string
  tradingAs: string
  location: string
  email: string
  role: string
}) {
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
      <p
        className="font-sans font-semibold text-[10px] tracking-widest uppercase mb-2"
        style={{ color: '#2B5CE6' }}
      >
        {role}
      </p>
      <p className="font-semibold text-white">{name}</p>
      <p>Trading as <span className="text-white font-medium">{tradingAs}</span></p>
      <p>{location}</p>
      <p>
        <a href={`mailto:${email}`} style={{ color: '#2B5CE6' }}>{email}</a>
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
                  style={{
                    color: 'rgba(240,242,248,0.7)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                  }}
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
