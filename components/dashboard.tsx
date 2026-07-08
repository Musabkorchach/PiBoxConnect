import AppHeader from "./app-header"
import DashboardGrid from "./dashboard-grid"
import BottomNavigation from "./bottom-navigation"

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#050716] text-white">
      <div className="mx-auto max-w-md px-5 py-6 pb-28">
        <AppHeader />
        <DashboardGrid />
        <BottomNavigation />
      </div>
    </main>
  )
}