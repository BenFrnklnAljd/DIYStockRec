import { useState, useEffect } from 'react'
import { SavedLog, SaleEntry } from '../types'
import { loadLogs, saveLogs } from '../utils/storage'
import { parseCurrency } from '../utils/format'

export function useLogs() {
  const [logs, setLogs] = useState<SavedLog[]>(loadLogs)

  useEffect(() => {
    saveLogs(logs)
  }, [logs])

  const addLog = (reportTitle: string, entries: SaleEntry[]): boolean => {
    const hasData = entries.some(e => parseCurrency(e.amount) > 0)
    if (!hasData) return false

    const log: SavedLog = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      reportTitle,
      entries: entries.map(e => ({ ...e })),
      total: entries.reduce((s, e) => s + parseCurrency(e.amount), 0),
    }
    setLogs(prev => [log, ...prev])
    return true
  }

  const deleteLog = (id: number): void => {
    if (confirm('Delete this saved entry?')) {
      setLogs(prev => prev.filter(l => l.id !== id))
    }
  }

  const clearAllLogs = (): void => {
    if (confirm('Clear ALL saved logs? This cannot be undone.')) {
      setLogs([])
    }
  }

  const totalAmount  = logs.reduce((s, l) => s + l.total, 0)
  const totalEntries = logs.reduce((s, l) => s + l.entries.length, 0)

  return { logs, addLog, deleteLog, clearAllLogs, totalAmount, totalEntries }
}
