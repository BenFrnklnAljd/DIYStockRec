import { TabType } from '../types'

interface TabBarProps {
  tab: TabType
  onTabChange: (tab: TabType) => void
  logCount: number
}

export default function TabBar({ tab, onTabChange, logCount }: TabBarProps) {
  return (
    <div className="tab-bar">
      <button
        className={`tab-btn${tab === 'entry' ? ' active' : ''}`}
        onClick={() => onTabChange('entry')}
      >
        &nbsp; New Entry
      </button>
      <button
        className={`tab-btn${tab === 'logs' ? ' active' : ''}`}
        onClick={() => onTabChange('logs')}
      >
        &nbsp; Saved Logs{logCount > 0 ? ` (${logCount})` : ''}
      </button>
    </div>
  )
}
