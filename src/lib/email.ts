import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FOOTER_ADDRESS = `Multimedia Agentur, Georgios Niokos\nSchnirchgasse 2/17, 1030 Wien, Austria`
const FOOTER_UNSUBSCRIBE = `You received this email because you signed up for Enefsis.`

function footerHtml(): string {
  return `<p style="margin:0;font-size:12px;color:rgba(255,255,255,0.22);line-height:1.8;">
                Enefsis NFC Smart Hub &middot;
                <a href="mailto:support@enefsis.com"
                  style="color:rgba(255,255,255,0.35);text-decoration:none;">support@enefsis.com</a><br>
                Multimedia Agentur, Georgios Niokos<br>
                Schnirchgasse 2/17, 1030 Wien, Austria<br>
                <span style="font-size:11px;color:rgba(255,255,255,0.18);">${FOOTER_UNSUBSCRIBE}</span>
              </p>`
}

function logoHtml(): string {
  return `<img src="https://app.enefsis.com/enefsis-email-logo-v2.png" alt="Enefsis" width="160" style="display:block;margin:0 auto 8px auto;">`
}

function welcomeEmailHtml({
  name,
  email,
  loginUrl,
  tempPassword,
}: {
  name: string
  email: string
  loginUrl: string
  tempPassword: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Enefsis account is ready</title>
</head>
<body style="margin:0;padding:0;background:#0D0F14;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F14;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px 32px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header: logo -->
          <tr>
            <td style="padding-bottom:36px;text-align:center;">
              ${logoHtml()}
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#161920;border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:40px 44px;">

              <h1 style="margin:0 0 10px;font-size:24px;font-weight:700;color:#F0F2F8;line-height:1.2;">
                Welcome, ${name}!
              </h1>
              <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.42);line-height:1.65;">
                Your Enefsis account has been created. Use the credentials below to sign in&nbsp;&mdash; you can change your password from the dashboard at any time.
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#0D0F14;border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:22px 26px;">
                    <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.14em;
                               color:rgba(255,255,255,0.30);text-transform:uppercase;">Login Credentials</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="font-size:12px;color:rgba(255,255,255,0.32);">Email</span>
                        </td>
                        <td style="padding:8px 0;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="font-size:13px;font-weight:600;color:#F0F2F8;">${email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:12px;color:rgba(255,255,255,0.32);">Temporary password</span>
                        </td>
                        <td style="padding:8px 0;text-align:right;">
                          <span style="font-size:13px;font-weight:700;color:#38BEFF;
                                       font-family:'Courier New',Courier,monospace;letter-spacing:0.04em;">${tempPassword}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <a href="${loginUrl}"
                style="display:block;text-align:center;
                       background:linear-gradient(100deg,#2B65F0 0%,#1B4FD8 100%);
                       color:#ffffff;text-decoration:none;
                       font-size:14px;font-weight:700;
                       padding:15px 24px;border-radius:12px;
                       letter-spacing:0.02em;
                       box-shadow:0 6px 24px rgba(43,101,240,0.30);">
                Sign in to your dashboard &rarr;
              </a>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              ${footerHtml()}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function welcomeEmailText({
  name,
  email,
  loginUrl,
  tempPassword,
}: {
  name: string
  email: string
  loginUrl: string
  tempPassword: string
}): string {
  return `Welcome to Enefsis, ${name}!

Your account has been created. Use the credentials below to sign in. You can change your password from the dashboard at any time.

Login Credentials
-----------------
Email:              ${email}
Temporary password: ${tempPassword}

Sign in at: ${loginUrl}

---
Enefsis NFC Smart Hub
${FOOTER_ADDRESS}
support@enefsis.com

${FOOTER_UNSUBSCRIBE}`
}

function standOrderEmailHtml({
  clientName, clientEmail, quantity, amount, date,
}: {
  clientName:  string
  clientEmail: string
  quantity:    number
  amount:      number
  date:        string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>New Stand Order</title>
</head>
<body style="margin:0;padding:0;background:#0D0F14;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F14;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px 32px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <tr>
            <td style="padding-bottom:28px;text-align:center;">
              ${logoHtml()}
            </td>
          </tr>

          <tr>
            <td style="background:#161920;border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:36px 40px;">

              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;
                         color:rgba(245,166,35,0.80);text-transform:uppercase;">New Order</p>
              <h1 style="margin:0 0 28px;font-size:22px;font-weight:700;color:#F0F2F8;line-height:1.2;">
                Stand Order from ${clientName}
              </h1>

              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#0D0F14;border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin-bottom:28px;">
                <tr><td style="padding:22px 26px;">
                  <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.14em;
                             color:rgba(255,255,255,0.30);text-transform:uppercase;">Order Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:12px;color:rgba(255,255,255,0.32);">Client</span>
                      </td>
                      <td style="padding:8px 0;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:13px;font-weight:600;color:#F0F2F8;">${clientName}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:12px;color:rgba(255,255,255,0.32);">Email</span>
                      </td>
                      <td style="padding:8px 0;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:13px;color:#38BEFF;">${clientEmail}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:12px;color:rgba(255,255,255,0.32);">Quantity</span>
                      </td>
                      <td style="padding:8px 0;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:13px;font-weight:600;color:#F0F2F8;">${quantity} stand${quantity !== 1 ? 's' : ''}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:12px;color:rgba(255,255,255,0.32);">Setup Fee</span>
                      </td>
                      <td style="padding:8px 0;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:14px;font-weight:700;color:#4ade80;">&euro;${amount}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;">
                        <span style="font-size:12px;color:rgba(255,255,255,0.32);">Date</span>
                      </td>
                      <td style="padding:8px 0;text-align:right;">
                        <span style="font-size:13px;color:rgba(255,255,255,0.55);">${date}</span>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>

              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6;">
                Log in to the admin panel to review and process this order.
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding-top:24px;text-align:center;">
              ${footerHtml()}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function standOrderEmailText({
  clientName, clientEmail, quantity, amount, date,
}: {
  clientName:  string
  clientEmail: string
  quantity:    number
  amount:      number
  date:        string
}): string {
  return `New Stand Order

Stand Order from ${clientName}

Order Details
--------------
Client:    ${clientName}
Email:     ${clientEmail}
Quantity:  ${quantity} stand${quantity !== 1 ? 's' : ''}
Setup Fee: €${amount}
Date:      ${date}

Log in to the admin panel to review and process this order.

---
Enefsis NFC Smart Hub
${FOOTER_ADDRESS}
support@enefsis.com

${FOOTER_UNSUBSCRIBE}`
}

export async function sendStandOrderEmail({
  clientName, clientEmail, quantity, amount, date,
}: {
  clientName:  string
  clientEmail: string
  quantity:    number
  amount:      number
  date:        string
}): Promise<void> {
  const { error } = await resend.emails.send({
    from:    'Enefsis <support@enefsis.com>',
    replyTo: 'support@enefsis.com',
    to:      'support@enefsis.com',
    subject: `New Stand Order from ${clientName}`,
    html:    standOrderEmailHtml({ clientName, clientEmail, quantity, amount, date }),
    text:    standOrderEmailText({ clientName, clientEmail, quantity, amount, date }),
  })
  if (error) {
    console.error('[sendStandOrderEmail] Resend error:', error)
  }
}

interface MonthlyStats {
  totalTaps:   number
  uniqueTaps:  number
  topItems:    string[]
  totalClicks: number
  topButton:   string
  month:       string
}

function monthlyStatsEmailHtml(to: string, clientName: string, stats: MonthlyStats): string {
  const { totalTaps, uniqueTaps, topItems, totalClicks, topButton, month } = stats

  const statCard = (label: string, value: string | number, accent: string) => `
    <td width="25%" style="padding:0 6px;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#0D0F14;border:1px solid rgba(255,255,255,0.07);border-radius:14px;">
        <tr><td style="padding:18px 16px 14px;text-align:center;">
          <p style="margin:0 0 6px;font-size:22px;font-weight:800;color:${accent};line-height:1;">${value}</p>
          <p style="margin:0;font-size:10px;font-weight:600;letter-spacing:0.10em;color:rgba(255,255,255,0.35);text-transform:uppercase;">${label}</p>
        </td></tr>
      </table>
    </td>`

  const topItemRows = topItems.length
    ? topItems.map((item, i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="font-size:12px;color:rgba(255,255,255,0.30);">#${i + 1}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="font-size:13px;font-weight:600;color:#F0F2F8;">${item}</span>
          </td>
        </tr>`).join('')
    : `<tr><td colspan="2" style="padding:12px 0;font-size:13px;color:rgba(255,255,255,0.30);">No menu views recorded</td></tr>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your ${month} Performance Report</title>
</head>
<body style="margin:0;padding:0;background:#0D0F14;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F14;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px 32px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:36px;text-align:center;">
              ${logoHtml()}
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#161920;border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:40px 44px;">

              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;
                         color:rgba(56,190,255,0.80);text-transform:uppercase;">Monthly Report</p>
              <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#F0F2F8;line-height:1.2;">
                Your ${month} Performance Report
              </h1>
              <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.42);line-height:1.65;">
                Here&rsquo;s how <strong style="color:rgba(255,255,255,0.70);">${clientName}</strong> performed last month on Enefsis.
              </p>

              <!-- 4 Stat cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr style="margin:0 -6px;">
                  ${statCard('Total Taps', totalTaps.toLocaleString(), '#38BEFF')}
                  ${statCard('Unique Visitors', uniqueTaps.toLocaleString(), '#818CF8')}
                  ${statCard('Button Clicks', totalClicks.toLocaleString(), '#4ade80')}
                  ${statCard('Top Button', topButton || '—', '#F5A623')}
                </tr>
              </table>

              <!-- Top menu items -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#0D0F14;border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin-bottom:32px;">
                <tr><td style="padding:22px 26px;">
                  <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.14em;
                             color:rgba(255,255,255,0.30);text-transform:uppercase;">Top Menu Items</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${topItemRows}
                  </table>
                </td></tr>
              </table>

              <!-- Motivational message -->
              <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.50);line-height:1.7;">
                Great work this month! Every tap is a guest discovering your menu, your story, and your brand.
                Keep your profile fresh and watch your engagement grow month over month.
              </p>

              <!-- CTA button -->
              <a href="https://app.enefsis.com/dashboard"
                style="display:block;text-align:center;
                       background:linear-gradient(100deg,#2B65F0 0%,#1B4FD8 100%);
                       color:#ffffff;text-decoration:none;
                       font-size:14px;font-weight:700;
                       padding:15px 24px;border-radius:12px;
                       letter-spacing:0.02em;
                       box-shadow:0 6px 24px rgba(43,101,240,0.30);">
                View Full Dashboard &rarr;
              </a>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              ${footerHtml()}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function monthlyStatsEmailText(clientName: string, stats: MonthlyStats): string {
  const { totalTaps, uniqueTaps, topItems, totalClicks, topButton, month } = stats
  const itemsList = topItems.length
    ? topItems.map((item, i) => `  #${i + 1}  ${item}`).join('\n')
    : '  No menu views recorded'

  return `Your ${month} Performance Report — ${clientName}

STATS SUMMARY
-------------
Total Taps:       ${totalTaps.toLocaleString()}
Unique Visitors:  ${uniqueTaps.toLocaleString()}
Button Clicks:    ${totalClicks.toLocaleString()}
Top Button:       ${topButton || '—'}

TOP MENU ITEMS
--------------
${itemsList}

Great work this month! Every tap is a guest discovering your menu, your story, and your brand.
Keep your profile fresh and watch your engagement grow month over month.

View your full dashboard at: https://app.enefsis.com/dashboard

---
Enefsis NFC Smart Hub
${FOOTER_ADDRESS}
support@enefsis.com

${FOOTER_UNSUBSCRIBE}`
}

export async function sendMonthlyStatsEmail(
  to: string,
  clientName: string,
  stats: MonthlyStats,
): Promise<void> {
  const { error } = await resend.emails.send({
    from:    'Enefsis <support@enefsis.com>',
    replyTo: 'support@enefsis.com',
    to,
    subject: `Your ${stats.month} Performance Report — Enefsis`,
    html:    monthlyStatsEmailHtml(to, clientName, stats),
    text:    monthlyStatsEmailText(clientName, stats),
  })
  if (error) {
    console.error('[sendMonthlyStatsEmail] Resend error:', error)
  }
}

export async function sendWelcomeEmail({
  name,
  email,
  loginUrl,
  tempPassword,
}: {
  name: string
  email: string
  loginUrl: string
  tempPassword: string
}): Promise<void> {
  const { error } = await resend.emails.send({
    from:    'Enefsis <support@enefsis.com>',
    replyTo: 'support@enefsis.com',
    to:      email,
    subject: 'Your Enefsis account is ready',
    html:    welcomeEmailHtml({ name, email, loginUrl, tempPassword }),
    text:    welcomeEmailText({ name, email, loginUrl, tempPassword }),
  })
  if (error) {
    console.error('[sendWelcomeEmail] Resend error:', error)
  }
}
