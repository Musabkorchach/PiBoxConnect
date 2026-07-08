import { Bell, Search, ShieldCheck } from "lucide-react"

interface AppHeaderProps {
  username?: string
  identity?: string
}

export default function AppHeader({
  username = "Musabkorchac",
  identity = "Pi Wallet Address",
}: AppHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs text-yellow-300">
          <ShieldCheck size={14} />
          Pi Wallet Address • Verified Identity
        </div>

        <h1 className="text-2xl font-bold text-white">
          Box <span className="text-yellow-300">Connect</span>
        </h1>

        <p className="mt-1 text-xs text-slate-400">
          Signed in as @{username}
        </p>

        <p className="mt-1 max-w-[240px] truncate text-[11px] text-slate-500">
          {identity}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white backdrop-blur">
          <Search size={18} />
        </button>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white backdrop-blur">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-300" />
        </button>
      </div>
    </header>
  )
}