import { SaleEntry } from '../types'
import { formatDate, formatCurrency } from '../utils/format'

interface SaleEntryCardProps {
  entry: SaleEntry
  index: number
  onChange: (field: keyof SaleEntry, value: string) => void
}

export default function SaleEntryCard({ entry, index, onChange }: SaleEntryCardProps) {
  return (
    <div className="card">
      <div className="card-label">
        <span className="badge">{index + 1}</span>
        Sale Entry {index + 1}
      </div>
      <div className="field-group">
        <div>
          <div className="field-label">Label</div>
          <input
            type="text"
            placeholder={`Sale Entry ${index + 1}`}
            value={entry.label}
            onChange={e => onChange('label', e.target.value)}
          />
        </div>
        <div>
          <div className="field-label">Amount (₱)</div>
          <div className="amount-wrap">
            <span className="currency-symbol">₱</span>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={entry.amount}
              onChange={e => onChange('amount', e.target.value)}
            />
          </div>
        </div>
        <div>
          <div className="field-label">Sale Date — locked on save</div>
          <input
            type="date"
            value={entry.date}
            onChange={e => onChange('date', e.target.value)}
          />
        </div>
        <div className="preview-bar">
          <span>{formatDate(entry.date)}</span>
          <span className="preview-amount">₱{formatCurrency(entry.amount)}</span>
        </div>
      </div>
    </div>
  )
}
