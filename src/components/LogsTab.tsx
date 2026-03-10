import { useState, useMemo, useCallback } from 'react'
import { SavedLog, FlatLogItem, LogGroup } from '../types'
import { parseCurrency, formatCurrency, formatDate, formatDateShort } from '../utils/format'
import { buildLogExportPDF } from '../pdf/pdfBuilders'

interface LogsTabProps {
  logs: SavedLog[]
  totalAmount: number
  totalEntries: number
  onDelete: (id: number) => void
  onClearAll: () => void
}

// Entry label pill colors — cycles through a palette
const LABEL_COLORS: string[] = [
  '#1e5040', '#2e6b7a', '#7a3e2e', '#5a3e7a', '#3e7a4a', '#7a6b2e',
]
function labelColor(label: string, allLabels: string[]): string {
  const idx = allLabels.indexOf(label)
  return LABEL_COLORS[idx % LABEL_COLORS.length]
}

export default function LogsTab({
  logs,
  totalAmount,
  totalEntries,
  onDelete,
  onClearAll,
}: LogsTabProps) {
  const [filterLabel, setFilterLabel] = useState<string>('') // '' = All
  const [filterMonth, setFilterMonth] = useState<string>('') // 'YYYY-MM' or ''

  // ── Derive unique entry labels from all saved logs ──────────
  const allLabels = useMemo<string[]>(() => {
    const set = new Set<string>()
    logs.forEach(l => l.entries.forEach(e => { if (e.label) set.add(e.label) }))
    return Array.from(set).sort()
  }, [logs])

  // ── Derive unique months from all saved logs ─────────────────
  const allMonths = useMemo<string[]>(() => {
    const set = new Set<string>()
    logs.forEach(l => l.entries.forEach(e => {
      if (e.date) set.add(e.date.slice(0, 7)) // 'YYYY-MM'
    }))
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [logs])

  // ── Filter logs by selected label + month ────────────────────
  const filteredLogs = useMemo<SavedLog[]>(() => {
    return logs.filter(l => {
      const labelMatch = !filterLabel || l.entries.some(e => e.label === filterLabel)
      const monthMatch = !filterMonth || l.entries.some(e => e.date?.startsWith(filterMonth))
      return labelMatch && monthMatch
    })
  }, [logs, filterLabel, filterMonth])

  // ── Flat filtered items (only matching entries) ───────────────
  const filteredItems = useMemo<FlatLogItem[]>(() => {
    return filteredLogs.flatMap(l =>
      l.entries
        .filter(e => {
          const labelMatch = !filterLabel || e.label === filterLabel
          const monthMatch = !filterMonth || e.date?.startsWith(filterMonth)
          return labelMatch && monthMatch
        })
        .map(e => ({ ...e, logId: l.id, reportTitle: l.reportTitle, savedAt: l.savedAt }))
    )
  }, [filteredLogs, filterLabel, filterMonth])

  // ── Group filtered items by date ─────────────────────────────
  const groupedLogs = useMemo<LogGroup[]>(() => {
    const map: Record<string, LogGroup> = {}
    filteredItems.forEach(item => {
      const d = item.date || 'unknown'
      if (!map[d]) map[d] = { date: d, items: [] }
      map[d].items.push(item)
    })
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date))
  }, [filteredItems])

  // ── Filtered total ────────────────────────────────────────────
  const filteredTotal = filteredItems.reduce((s, e) => s + parseCurrency(e.amount), 0)

  // ── Export ────────────────────────────────────────────────────
  const exportLogsPDF = useCallback((): void => {
    if (!filteredItems.length) { alert('No entries to export.'); return }
    const doc = buildLogExportPDF(filteredItems, '', filterLabel)
    const nameParts = [
      filterLabel || 'all-entries',
      filterMonth || 'all-months',
    ]
    doc.save(`sales-log-${nameParts.join('-')}.pdf`)
  }, [filteredItems, filterLabel, filterMonth])

  const hasFilters = !!filterLabel || !!filterMonth

  // ── Month display helper ──────────────────────────────────────
  const monthLabel = (ym: string) => {
    const [y, m] = ym.split('-')
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-PH', {
      month: 'long', year: 'numeric',
    })
  }

  return (
    <div className="body">

      {/* ── Stats ── */}
      {logs.length > 0 && (
        <div className="log-stats-row">
          <div className="stat-item">
            <div className="stat-val">{logs.length}</div>
            <div className="stat-lbl">Saves</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{totalEntries}</div>
            <div className="stat-lbl">Entries</div>
          </div>
          <div className="stat-item">
            <div className="stat-val" style={{ fontSize: '13px' }}>
              ₱{totalAmount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
            </div>
            <div className="stat-lbl">Grand Total</div>
          </div>
        </div>
      )}

      {/* ── Filter card ── */}
      {logs.length > 0 && (
        <div className="card">
          <div className="card-label">Filter by Entry &amp; Month</div>

          {/* Entry label pills */}
          <div className="field-label" style={{ marginBottom: '8px' }}>Sale Entry</div>
          <div className="filter-pill-row">
            <button
              className={`filter-pill${filterLabel === '' ? ' active' : ''}`}
              style={filterLabel === '' ? { background: '#1e5040', color: '#fff', borderColor: '#1e5040' } : {}}
              onClick={() => setFilterLabel('')}
            >
              All Entries
            </button>
            {allLabels.map(lbl => (
              <button
                key={lbl}
                className={`filter-pill${filterLabel === lbl ? ' active' : ''}`}
                style={filterLabel === lbl
                  ? { background: labelColor(lbl, allLabels), color: '#fff', borderColor: labelColor(lbl, allLabels) }
                  : { borderColor: labelColor(lbl, allLabels), color: labelColor(lbl, allLabels) }
                }
                onClick={() => setFilterLabel(filterLabel === lbl ? '' : lbl)}
              >
                {lbl}
              </button>
            ))}
          </div>

          {/* Month pills */}
          <div className="field-label" style={{ marginTop: '14px', marginBottom: '8px' }}>Month</div>
          <div className="filter-pill-row">
            <button
              className={`filter-pill${filterMonth === '' ? ' active' : ''}`}
              style={filterMonth === '' ? { background: '#1e5040', color: '#fff', borderColor: '#1e5040' } : {}}
              onClick={() => setFilterMonth('')}
            >
              All Months
            </button>
            {allMonths.map(ym => (
              <button
                key={ym}
                className={`filter-pill${filterMonth === ym ? ' active' : ''}`}
                style={filterMonth === ym
                  ? { background: '#2e7d55', color: '#fff', borderColor: '#2e7d55' }
                  : {}
                }
                onClick={() => setFilterMonth(filterMonth === ym ? '' : ym)}
              >
                {monthLabel(ym)}
              </button>
            ))}
          </div>

          {/* Active filter summary + clear */}
          {hasFilters && (
            <div className="filter-summary">
              <span>
                {filterLabel && <span className="filter-tag">{filterLabel}</span>}
                {filterMonth && <span className="filter-tag">{monthLabel(filterMonth)}</span>}
                <span className="filter-result-count">{filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}</span>
              </span>
              <button className="clear-filter-btn" onClick={() => { setFilterLabel(''); setFilterMonth('') }}>
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Filtered total banner (when filters active) ── */}
      {hasFilters && filteredItems.length > 0 && (
        <div className="filtered-total-banner">
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#90c4a4', marginBottom: '2px' }}>
              Filtered Total
            </div>
            <div style={{ fontSize: '10px', color: '#7fb89a' }}>
              {filterLabel && <span>{filterLabel}</span>}
              {filterLabel && filterMonth && <span> · </span>}
              {filterMonth && <span>{monthLabel(filterMonth)}</span>}
            </div>
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: '#fff' }}>
            ₱{filteredTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
        </div>
      )}

      {/* ── Empty states ── */}
      {logs.length === 0 && (
        <div className="log-empty">
          <div className="log-empty-icon">📂</div>
          <div>No saved entries yet.</div>
          <div>Tap <strong>"New Entry"</strong> and press <strong>Save to Log</strong>.</div>
        </div>
      )}

      {logs.length > 0 && filteredItems.length === 0 && (
        <div className="log-empty">
          <div className="log-empty-icon">🔍</div>
          <div>No entries match the selected filters.</div>
        </div>
      )}

      {/* ── Log groups ── */}
      {filteredItems.length > 0 && (
        <div className="log-section">
          {groupedLogs.map(group => (
            <div key={group.date}>
              <div className="log-group-header">
                <span>{formatDate(group.date)}</span>
                <span className="log-group-total">
                  ₱{group.items
                    .reduce((s, it) => s + parseCurrency(it.amount), 0)
                    .toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {group.items.map((item, j) => (
                <div className="log-item" key={j} style={{ marginTop: '8px' }}>
                  <div
                    className="log-item-accent"
                    style={{ background: labelColor(item.label, allLabels) }}
                  />
                  <div className="log-item-info" style={{ paddingLeft: '6px' }}>
                    <div className="log-item-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        className="entry-label-dot"
                        style={{ background: labelColor(item.label, allLabels) }}
                      />
                      {item.label || 'Sale Entry'}
                    </div>
                    <div className="log-item-date">{formatDateShort(item.date)}</div>
                    <div className="log-item-title">{item.reportTitle || 'Sales Report'}</div>
                  </div>
                  <div className="log-item-right">
                    <div className="log-item-amount">₱{formatCurrency(item.amount)}</div>
                    <button className="log-delete-btn" onClick={() => onDelete(item.logId)} title="Delete">✕</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Export ── */}
      {logs.length > 0 && (
        <button className="export-log-btn" onClick={exportLogsPDF}>
          &nbsp; Export {hasFilters ? 'Filtered' : 'All'} Logs as PDF
        </button>
      )}

      {/* ── Clear all ── */}
      {logs.length > 0 && (
        <p className="clear-all-link" onClick={onClearAll}>
          Clear all logs
        </p>
      )}
    </div>
  )
}
