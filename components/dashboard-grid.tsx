import {
  Mail,
  Users,
  Phone,
  FolderOpen,
} from "lucide-react"

import DashboardCard from "./dashboard-card"

export default function DashboardGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">

      <DashboardCard
        title="Messages"
        value={12}
        icon={<Mail size={26} />}
        gradient="bg-gradient-to-br from-purple-700 to-violet-500"
      />

      <DashboardCard
        title="Contacts"
        value={5}
        icon={<Users size={26} />}
        gradient="bg-gradient-to-br from-blue-700 to-cyan-500"
      />

      <DashboardCard
        title="Calls"
        value={2}
        icon={<Phone size={26} />}
        gradient="bg-gradient-to-br from-green-700 to-emerald-500"
      />

      <DashboardCard
        title="Files"
        value={8}
        icon={<FolderOpen size={26} />}
        gradient="bg-gradient-to-br from-amber-600 to-yellow-400"
      />

    </div>
  )
}