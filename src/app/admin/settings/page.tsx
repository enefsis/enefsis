export const metadata = { title: 'Admin — Settings' }

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h2 className="font-display font-semibold text-white text-sm">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  )
}

function SettingsRow({ label, value, note }: { label: string; value?: string; note?: string }) {
  return (
    <div className="flex items-start justify-between gap-8">
      <div className="min-w-0">
        <p className="font-sans text-sm font-medium text-white/80">{label}</p>
        {note && <p className="font-sans text-xs text-white/35 mt-0.5">{note}</p>}
      </div>
      {value && (
        <span className="font-mono text-xs text-white/50 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 shrink-0">
          {value}
        </span>
      )}
    </div>
  )
}

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold font-sans bg-amber-500/10 text-amber-400 border border-amber-500/20">
      Coming soon
    </span>
  )
}

const stripeMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test'

export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="font-sans text-sm text-white/40 mt-0.5">Platform configuration</p>
      </div>

      {/* Platform settings */}
      <SettingsCard title="Platform">
        <SettingsRow
          label="App Name"
          value="Enefsis"
          note="Displayed in the dashboard and emails"
        />
        <div className="h-px bg-white/[0.05]" />
        <SettingsRow
          label="Support Email"
          value={process.env.SUPPORT_EMAIL ?? 'support@enefsis.com'}
          note="Shown to clients in help flows"
        />
        <div className="h-px bg-white/[0.05]" />
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="font-sans text-sm font-medium text-white/80">App URL</p>
            <p className="font-sans text-xs text-white/35 mt-0.5">Base URL for landing pages and links</p>
          </div>
          <span className="font-mono text-xs text-white/50 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 shrink-0">
            {process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}
          </span>
        </div>
        <div className="pt-1">
          <ComingSoonBadge />
          <p className="font-sans text-xs text-white/30 mt-1.5">
            Editing platform settings via the dashboard is not yet supported. Update values in your environment variables.
          </p>
        </div>
      </SettingsCard>

      {/* Stripe settings */}
      <SettingsCard title="Stripe">
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="font-sans text-sm font-medium text-white/80">Current Mode</p>
            <p className="font-sans text-xs text-white/35 mt-0.5">
              Determined by the <code className="font-mono text-white/45">STRIPE_SECRET_KEY</code> prefix
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-sans border shrink-0 ${
            stripeMode === 'live'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
              : 'bg-amber-500/10  text-amber-400  border-amber-500/25'
          }`}>
            {stripeMode === 'live' ? '● Live' : '● Test'}
          </span>
        </div>
        <div className="h-px bg-white/[0.05]" />
        <SettingsRow
          label="Webhook Endpoint"
          value="/api/stripe/webhook"
          note="Register this URL in your Stripe dashboard"
        />
        <div className="pt-1 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 px-4 py-3">
          <p className="font-sans text-xs text-amber-400/80 leading-relaxed">
            To switch between test and live mode, replace <code className="font-mono">STRIPE_SECRET_KEY</code> and{' '}
            <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in your environment variables and redeploy.
          </p>
        </div>
      </SettingsCard>

      {/* Danger zone */}
      <SettingsCard title="Danger Zone">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-8">
            <div>
              <p className="font-sans text-sm font-medium text-white/80">Delete All Test Data</p>
              <p className="font-sans text-xs text-white/35 mt-0.5">Remove all records created during testing</p>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-xl text-xs font-semibold font-sans bg-red-500/[0.08] text-red-400/40 border border-red-500/15 cursor-not-allowed"
            >
              Delete
            </button>
          </div>
          <div className="flex items-center justify-between gap-8">
            <div>
              <p className="font-sans text-sm font-medium text-white/80">Reset Platform</p>
              <p className="font-sans text-xs text-white/35 mt-0.5">Wipe all client data — irreversible</p>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-xl text-xs font-semibold font-sans bg-red-500/[0.08] text-red-400/40 border border-red-500/15 cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="pt-1">
          <ComingSoonBadge />
          <p className="font-sans text-xs text-white/30 mt-1.5">
            Danger zone actions are disabled. They will be enabled with additional confirmation flows in a future release.
          </p>
        </div>
      </SettingsCard>
    </div>
  )
}
