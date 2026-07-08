import {
  Archive,
  Box,
  FileText,
  Globe2,
  Inbox,
  MailPlus,
  MessageCircle,
  Phone,
  Send,
  Settings,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"

const stats = [
  { title: "Unread", value: 0, icon: Inbox, color: "from-purple-700 to-fuchsia-600" },
  { title: "Messages", value: 6, icon: MessageCircle, color: "from-blue-900 to-blue-700" },
  { title: "Contacts", value: 2, icon: Users, color: "from-emerald-900 to-teal-700" },
  { title: "Call requests", value: 7, icon: Phone, color: "from-yellow-900 to-amber-700" },
]

const nav = [
  { label: "Inbox", icon: Inbox, active: true },
  { label: "Compose", icon: MailPlus },
  { label: "Sent", icon: Send },
  { label: "Archive", icon: Archive },
  { label: "Trash", icon: Trash2 },
  { label: "Contacts", icon: UserPlus },
  { label: "Calls", icon: Phone },
  { label: "Settings", icon: Settings },
]

export default function NewDashboard() {
  return (
    <main className="min-h-screen bg-[#050716] text-white">
      <div className="mx-auto max-w-md px-5 pb-28 pt-6">
        <header className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm text-yellow-300">
                ✨ Pi Network Identity
              </p>
              <h1 className="text-4xl font-black tracking-tight">
                Box <span className="text-yellow-300">Connect</span>
              </h1>
              <p className="text-slate-300">Signed in as @Musabkorchac</p>
            </div>

            <button className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-5 py-3 font-bold shadow-lg shadow-purple-900/40">
              Sign in with Pi
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm">
              <Globe2 className="mr-2 inline h-4 w-4" />
              العربية
            </button>

            <button className="rounded-full border border-yellow-400/40 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-100">
              pi:4dfec5b9-...fd1119c0
            </button>
          </div>
        </header>

        <section className="mt-8 rounded-[2rem] border border-yellow-400/30 bg-gradient-to-br from-purple-950/90 to-yellow-900/30 p-6 shadow-2xl shadow-purple-950/40">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-yellow-300 text-5xl font-black text-white shadow-lg">
              π
            </div>

            <div>
              <h2 className="text-2xl font-black">Musabkorchac</h2>
              <p className="text-slate-300">Pi Wallet address.verified identity</p>
              <p className="mt-2 rounded-full bg-white/10 px-4 py-1 text-sm text-slate-200">
                pi:4dfec5b9-...fd1119c0
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-purple-400/30 bg-purple-950/40 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black">Global Connection</h2>
              <p className="text-slate-400">Connected through Pi Network identity</p>
            </div>
            <Globe2 className="h-9 w-9 text-yellow-300" />
          </div>

          <div className="mt-7 flex h-28 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/80 to-yellow-900/20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-yellow-400/40 bg-white/10 text-4xl font-black text-yellow-300">
              π
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-4">
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className={`min-h-40 rounded-[2rem] border border-white/10 bg-gradient-to-br ${item.color} p-5 shadow-lg`}
              >
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/25">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <p className="text-slate-200">{item.title}</p>
                <p className="mt-1 text-5xl font-black">{item.value}</p>
              </div>
            )
          })}
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-3">
            {nav.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  className={
                    item.active
                      ? "rounded-2xl bg-gradient-to-r from-purple-700 via-pink-400 to-yellow-400 px-3 py-3 font-bold text-white"
                      : "rounded-2xl px-3 py-3 text-slate-400"
                  }
                >
                  <Icon className="mx-auto mb-1 h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
          <h2 className="text-3xl font-black">Inbox</h2>
          <p className="py-14 text-center text-slate-400">No messages here.</p>
        </section>

        <footer className="fixed bottom-4 left-1/2 w-[92%] max-w-md -translate-x-1/2 rounded-3xl border border-white/10 bg-black/60 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-300">
            <Inbox className="h-6 w-6 text-yellow-300" />
            <MessageCircle className="h-6 w-6" />
            <Send className="h-6 w-6" />
            <FileText className="h-6 w-6" />
            <Settings className="h-6 w-6" />
          </div>
        </footer>
      </div>
    </main>
  )
}