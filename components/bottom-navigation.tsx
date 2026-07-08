import { Home, MessageCircle, Phone, Users, Settings } from "lucide-react"

const items = [
  { label: "Home", icon: Home, active: true },
  { label: "Messages", icon: MessageCircle },
  { label: "Calls", icon: Phone },
  { label: "Contacts", icon: Users },
  { label: "Settings", icon: Settings },
]

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-3xl border border-white/10 bg-[#0B1024]/90 px-3 py-2 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.label}
              className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] transition ${
                item.active
                  ? "bg-yellow-400 text-[#050716]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}