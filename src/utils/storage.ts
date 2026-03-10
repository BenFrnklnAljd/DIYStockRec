import { SavedLog } from '../types'
import { STORAGE_KEY } from './format'

export function loadLogs(): SavedLog[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveLogs(logs: SavedLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  } catch {
    // quota exceeded – silently ignore
  }
}
