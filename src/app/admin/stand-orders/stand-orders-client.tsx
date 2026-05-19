'use client'

import { useState, useTransition } from 'react'
import { markStandOrderFulfilled } from '@/actions/admin-stand-orders'

export type StandOrderRow = {
  id:         string
  createdAt:  string
  userId:     string | null
  quantity:   number
  amount:     number
  status:     string
  clientName: string | null
  clientEmail: string | null
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  const style =
    s === 'fulfilled'
      ? { color: '#4ade80', background: 'rgba(74,222,128,0.10)',  border: '1px solid rgba(74,222,128,0.22)'  }
      : s === 'pending'
      ? { color: '#F5A623', background: 'rgba(245,166,35,0.10)',  border: '1px solid rgba(245,166,35,0.22)'  }
      : { color: '#8A90A0', background: 'rgba(138,144,160,0.10)', border: '1px solid rgba(138,144,160,0.18)' }

  return (
    <span
      className="font-sans font-semibold rounded-full capitalize"
      style={{ fontSize: 11, padding: '3px 9px', ...style }}
    >
      {status}
    </span>
  )
}

function FulfillButton({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status,     setStatus]     = useState(currentStatus)
  const [errorMsg,   setErrorMsg]   = useState('')
  const [isPending,  startTransition] = useTransition()

  if (status === 'fulfilled') {
    return <span className="font-sans text-xs text-white/25">—</span>
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setErrorMsg('')
          startTransition(async () => {
            const res = await markStandOrderFulfilled(orderId)
            if (res.error) {
              setErrorMsg(res.error)
            } else {
              setStatus('fulfilled')
            }
          })
        }}
        className="font-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-50 hover:opacity-80"
        style={{
          background: 'rgba(74,222,128,0.10)',
          border:     '1px solid rgba(74,222,128,0.22)',
          color:      '#4ade80',
          whiteSpace: 'nowrap',
        }}
      >
        {isPending ? 'Saving…' : 'Mark as Fulfilled'}
      </button>
      {errorMsg && (
        <p className="font-sans text-[11px] text-red-400">{errorMsg}</p>
      )}
    </div>
  )
}

export function StandOrdersTable({ orders }: { orders: StandOrderRow[] }) {
  if (orders.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="font-sans text-sm text-white/30">No stand orders yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Client', 'Quantity', 'Amount', 'Date', 'Status', ''].map(h => (
              <th
                key={h}
                className="font-sans text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr
              key={order.id}
              className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors"
            >
              {/* Client */}
              <td className="px-5 py-3.5">
                <p className="font-sans font-medium text-white/85 leading-tight">
                  {order.clientName ?? '—'}
                </p>
                {order.clientEmail && (
                  <p className="font-sans text-[11px] text-white/35 mt-0.5 truncate max-w-[180px]">
                    {order.clientEmail}
                  </p>
                )}
              </td>

              {/* Quantity */}
              <td className="px-5 py-3.5">
                <span className="font-sans font-semibold text-white/80">
                  {order.quantity} {order.quantity === 1 ? 'stand' : 'stands'}
                </span>
              </td>

              {/* Amount */}
              <td className="px-5 py-3.5">
                <span className="font-sans font-semibold" style={{ color: '#4ade80' }}>
                  €{order.amount}
                </span>
              </td>

              {/* Date */}
              <td className="px-5 py-3.5">
                <span className="font-sans text-white/50">{fmtDate(order.createdAt)}</span>
              </td>

              {/* Status */}
              <td className="px-5 py-3.5">
                <StatusBadge status={order.status} />
              </td>

              {/* Action */}
              <td className="px-5 py-3.5 text-right">
                <FulfillButton orderId={order.id} currentStatus={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
