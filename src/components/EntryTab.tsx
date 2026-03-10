import { useState } from 'react'
import { SaleEntry } from '../types'
import { parseCurrency } from '../utils/format'
import SaleEntryCard from './SaleEntryCard'

interface EntryTabProps {
  onSave: (reportTitle: string, entries: SaleEntry[]) => boolean
}

const today = new Date().toISOString().split('T')[0]

const defaultEntries: SaleEntry[] = [
  { label: 'FRANK', amount: '', date: today },
  { label: 'FRANKLIN', amount: '', date: today },
]

export default function EntryTab({ onSave }: EntryTabProps) {
  const [reportTitle, setReportTitle] = useState<string>('WIFI VENDO SALES')
  const [entries, setEntries]         = useState<SaleEntry[]>(defaultEntries)
  const [saved, setSaved]             = useState<boolean>(false)

  const updateEntry = (i: number, field: keyof SaleEntry, value: string): void => {
    setEntries(prev => prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)))
  }

  const total = entries.reduce((s, e) => s + parseCurrency(e.amount), 0)

  const handleSave = (): void => {
    const success = onSave(reportTitle, entries)
    if (!success) {
      alert('Please enter at least one sale amount before saving.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="body">
      {/* Report title */}
      <div className="card">
        <div className="card-label">Report Title</div>
        <div className="field-group">
          <div>
            <div className="field-label">Document Name</div>
            <input
              type="text"
              placeholder="e.g. Daily Sales Report"
              value={reportTitle}
              onChange={e => setReportTitle(e.target.value)}
              style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px' }}
            />
          </div>
        </div>
      </div>

      {/* Entry cards */}
      {entries.map((entry, i) => (
        <SaleEntryCard
          key={i}
          entry={entry}
          index={i}
          onChange={(field, value) => updateEntry(i, field, value)}
        />
      ))}

      {/* Total */}
      <div className="total-card">
        <div>
          <div className="total-label">Total Sales</div>
          <div className="total-note">{entries.length} entries</div>
        </div>
        <div className="total-amount">
          ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Save button */}
      <button
        className={`save-btn${saved ? ' saved' : ''}`}
        style={{ width: '100%', padding: '16px', borderRadius: '14px' }}
        onClick={handleSave}
      >
        {saved ? '✓ Saved to Log!' : 'Save to Log'}
      </button>

      <p className="hint">
        <strong>Save</strong> locks each entry to its selected date in your log.
      </p>
    </div>
  )
}
