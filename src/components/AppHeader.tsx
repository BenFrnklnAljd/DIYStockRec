interface AppHeaderProps {
  logCount: number
}

export default function AppHeader({ logCount }: AppHeaderProps) {
  return (
    <div className="app-header">
      
      <div className="header-title">Crazy Inventory</div>
      <div className="header-sub">
        Date-locked entries · Persistent save logs
        {logCount > 0 && ` · ${logCount} saved`}
      </div>
    </div>
  )
}
