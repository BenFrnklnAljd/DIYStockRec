export interface SaleEntry {
  label: string
  amount: string
  date: string
}

export interface SavedLog {
  id: number
  savedAt: string
  reportTitle: string
  entries: SaleEntry[]
  total: number
}

export interface FlatLogItem extends SaleEntry {
  logId: number
  reportTitle: string
  savedAt: string
}

export interface LogGroup {
  date: string
  items: FlatLogItem[]
}

export type TabType = 'entry' | 'logs'
