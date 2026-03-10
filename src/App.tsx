import { useState } from 'react'
import { TabType, SaleEntry } from './types'
import { useLogs } from './hooks/useLogs'
import AppHeader from './components/AppHeader'
import TabBar from './components/TabBar'
import EntryTab from './components/EntryTab'
import LogsTab from './components/LogsTab'
import './App.css'

export default function App() {
  const [tab, setTab] = useState<TabType>('entry')
  const { logs, addLog, deleteLog, clearAllLogs, totalAmount, totalEntries } = useLogs()

  const handleSave = (reportTitle: string, entries: SaleEntry[]): boolean => {
    return addLog(reportTitle, entries)
  }

  return (
    <div>
      <AppHeader logCount={logs.length} />
      <TabBar tab={tab} onTabChange={setTab} logCount={logs.length} />

      {tab === 'entry' && (
        <EntryTab onSave={handleSave} />
      )}

      {tab === 'logs' && (
        <LogsTab
          logs={logs}
          totalAmount={totalAmount}
          totalEntries={totalEntries}
          onDelete={deleteLog}
          onClearAll={clearAllLogs}
        />
      )}
    </div>
  )
}
