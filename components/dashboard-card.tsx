import { ReactNode } from "react"

interface DashboardCardProps {
  title: string
  value: string | number
  icon: ReactNode
  gradient: string
}

export default function DashboardCard({
  title,
  value,
  icon,
  gradient,
}: DashboardCardProps) {
  return (
    <div
      className={`rounded-3xl p-5 text-white shadow-xl border border-white/10 ${gradient}
      backdrop-blur-md transition-all duration-300 hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <p className="text-white/70 text-sm">{title}</p>

      <h2 className="text-4xl font-bold mt-1">
        {value}
      </h2>
    </div>
  )
}