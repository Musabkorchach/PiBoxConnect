"use client"

import {
  languages,
  translations,
  type LanguageCode,
} from "@/lib/i18n/translations"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft, Bell, Camera, CheckCheck, ChevronRight, FileText, Globe2, Home, Image as ImageIcon,
  MapPin, Menu, MessageCircle, Mic, MoreVertical, Paperclip, Phone, Play, Search, Send, Settings,
  ShieldCheck, Square, User, UserRound, Users, Video, X
} from "lucide-react"
import { getPiIdentity, signInWithPi, type PiUser } from "@/lib/pi-auth"
import { toast } from "sonner"

type View = "home" | "chats" | "chat" | "contacts" | "calls" | "files" | "profile" | "settings"
type ChatMessage = {
  id: string
  kind: "text" | "audio" | "location" | "identity" | "file" | "image"
  text?: string
  url?: string
  filename?: string
  duration?: number
  latitude?: number
  longitude?: number
  mine: boolean
  time: string
}

type Contact = { id: string; name: string; handle: string; status: string; color: string }

const contacts: Contact[] = [
  { id: "1", name: "سارة", handle: "@sara.pi", status: "متصلة الآن", color: "from-fuchsia-500 to-purple-700" },
  { id: "2", name: "أحمد", handle: "@ahmed.pi", status: "منذ 5 دقائق", color: "from-cyan-400 to-blue-700" },
  { id: "3", name: "ليلى", handle: "@layla.pi", status: "متصلة الآن", color: "from-amber-400 to-orange-600" },
]

const quickActions = [
  { view: "chats" as View, label: "الرسائل", sub: "محادثاتك الآمنة", icon: MessageCircle, gradient: "from-blue-500 to-cyan-400" },
  { view: "calls" as View, label: "المكالمات", sub: "صوت وفيديو", icon: Phone, gradient: "from-emerald-500 to-lime-400" },
  { view: "files" as View, label: "الملفات", sub: "صور ومستندات", icon: FileText, gradient: "from-orange-500 to-amber-300" },
  { view: "contacts" as View, label: "جهات الاتصال", sub: "هوية Pi", icon: Users, gradient: "from-violet-500 to-fuchsia-400" },
]

function avatarText(name: string) { return (name || "P").slice(0, 1).toUpperCase() }
function nowTime() { return new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }) }

export default function PiBioAuth() {
  const [language, setLanguage] = useState<LanguageCode>("ar")
  const t = translations[language]
  const [user, setUser] = useState<PiUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<View>("home")
  const [previousView, setPreviousView] = useState<View>("home")
  const [activeContact, setActiveContact] = useState<Contact>(contacts[0])
  const [message, setMessage] = useState("")
  const [attachmentOpen, setAttachmentOpen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", kind: "text", text: "مرحبًا بك في Pi Box Connect 👋", mine: false, time: "09:42" },
    { id: "privacy", kind: "text", text: "تواصل بهويتك في Pi، بدون رقم هاتف أو بريد إلكتروني.", mine: false, time: "09:43" },
  ])
  useEffect(() => {
  const savedLanguage = localStorage.getItem("pi-box-language") as LanguageCode | null

  if (savedLanguage && translations[savedLanguage]) {
    setLanguage(savedLanguage)
  }
}, [])

useEffect(() => {
  const selectedLanguage = languages.find((item) => item.code === language)

  localStorage.setItem("pi-box-language", language)
  document.documentElement.lang = language
  document.documentElement.dir = selectedLanguage?.dir ?? "ltr"
}, [language])
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const fileInput = useRef<HTMLInputElement | null>(null)
  const imageInput = useRef<HTMLInputElement | null>(null)

  const identity = useMemo(() => user ? getPiIdentity(user) : "", [user])
  const displayName = user?.username || "Pioneer"

  useEffect(() => {
    if (!recording) return
    const timer = window.setInterval(() => setRecordSeconds((v) => v + 1), 1000)
    return () => window.clearInterval(timer)
  }, [recording])

  function navigate(next: View) {
    setPreviousView(view)
    setView(next)
    setAttachmentOpen(false)
  }

  async function handleSignIn() {
    setLoading(true)
    try {
      const result = await signInWithPi()
      setUser(result.user)
      toast.success("تم تسجيل الدخول بنجاح")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تسجيل الدخول")
    } finally {
      setLoading(false)
    }
  }

  function sendText() {
    const value = message.trim()
    if (!value) return
    setMessages((old) => [...old, { id: crypto.randomUUID(), kind: "text", text: value, mine: true, time: nowTime() }])
    setMessage("")
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunks.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: recorder.mimeType || "audio/webm" })
        const url = URL.createObjectURL(blob)
        setMessages((old) => [...old, { id: crypto.randomUUID(), kind: "audio", url, duration: Math.max(recordSeconds, 1), mine: true, time: nowTime() }])
        stream.getTracks().forEach((track) => track.stop())
        setRecordSeconds(0)
      }
      mediaRecorder.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      toast.error("يرجى السماح باستخدام الميكروفون")
    }
  }

  function stopRecording() {
    mediaRecorder.current?.stop()
    setRecording(false)
  }

  function shareLocation() {
    setAttachmentOpen(false)
    if (!navigator.geolocation) return toast.error("الموقع غير مدعوم على هذا الجهاز")
    toast.info("جارٍ تحديد الموقع...")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMessages((old) => [...old, {
          id: crypto.randomUUID(), kind: "location", latitude: position.coords.latitude,
          longitude: position.coords.longitude, mine: true, time: nowTime(),
        }])
        toast.success("تمت مشاركة الموقع لمرة واحدة")
      },
      () => toast.error("تعذر الوصول إلى الموقع. تحقق من الإذن."),
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }

  function shareIdentity() {
    setAttachmentOpen(false)
    setMessages((old) => [...old, {
      id: crypto.randomUUID(), kind: "identity", text: `@${displayName}`, mine: true, time: nowTime(),
    }])
  }

  function handleFile(file: File, kind: "file" | "image") {
    const url = URL.createObjectURL(file)
    setMessages((old) => [...old, { id: crypto.randomUUID(), kind, url, filename: file.name, mine: true, time: nowTime() }])
    setAttachmentOpen(false)
  }

  if (!user) return <Landing loading={loading} onSignIn={handleSignIn} />

  return (
    <main dir="rtl" className="pibox-shell min-h-screen text-white">
      <div className="pibox-orb pibox-orb-one" /><div className="pibox-orb pibox-orb-two" />
      <div className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6">
        <header className="glass-panel sticky top-3 z-30 flex items-center justify-between rounded-[1.6rem] px-4 py-3">
          <div className="flex items-center gap-3">
            {view !== "home" ? (
              <button aria-label="رجوع" onClick={() => setView(previousView === view ? "home" : previousView)} className="icon-button">
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            ) : <button className="icon-button"><Menu className="h-5 w-5" /></button>}
            <div className="brand-mark small">π</div>
            <div><p className="text-sm font-black">Pi Box Connect</p><p className="text-[11px] text-violet-200/70">Connect freely. Stay private.</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button className="icon-button relative"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-300" /></button>
            <button onClick={() => navigate("profile")} className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-300 to-fuchsia-600 p-[2px]">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-[#171026] font-black">{avatarText(displayName)}</span>
            </button>
          </div>
        </header>

        <div className="mt-6">
          {view === "home" && <HomeView name={displayName} onNavigate={navigate} />}
          {view === "chats" && <ChatsView onOpen={(c) => { setActiveContact(c); navigate("chat") }} />}
          {view === "chat" && <ChatView contact={activeContact} messages={messages} message={message} setMessage={setMessage} onSend={sendText}
            attachmentOpen={attachmentOpen} setAttachmentOpen={setAttachmentOpen} recording={recording} recordSeconds={recordSeconds}
            onStartRecording={startRecording} onStopRecording={stopRecording} onLocation={shareLocation} onIdentity={shareIdentity}
            onFile={() => fileInput.current?.click()} onImage={() => imageInput.current?.click()} />}
          {view === "contacts" && <ContactsView onChat={(c) => { setActiveContact(c); navigate("chat") }} />}
          {view === "calls" && <CallsView />}
          {view === "files" && <FilesView />}
          {view === "profile" && <ProfileView name={displayName} identity={identity} />}
          {view === "settings" && (
  <SettingsView
    language={language}
    setLanguage={setLanguage}
  />
)}
        </div>

        <input ref={fileInput} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], "file")} />
        <input ref={imageInput} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], "image")} />

        <nav className="glass-panel fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 justify-around rounded-[1.7rem] p-2 shadow-2xl">
          {[{v:"home",l:"الرئيسية",i:Home},{v:"chats",l:"الرسائل",i:MessageCircle},{v:"contacts",l:"الجهات",i:Users},{v:"files",l:"الملفات",i:FileText},{v:"settings",l:"الإعدادات",i:Settings}].map((item) => {
            const Icon = item.i; const active = view === item.v || (item.v === "chats" && view === "chat")
            return <button key={item.v} onClick={() => navigate(item.v as View)} className={`nav-item ${active ? "active" : ""}`}><Icon className="h-5 w-5"/><span>{item.l}</span></button>
          })}
        </nav>
      </div>
    </main>
  )
}

function Landing({ loading, onSignIn }: { loading: boolean; onSignIn: () => void }) {
  return <main dir="rtl" className="pibox-shell relative flex min-h-screen items-center justify-center overflow-hidden px-5 text-white">
    <div className="pibox-orb pibox-orb-one"/><div className="pibox-orb pibox-orb-two"/><div className="network-grid"/>
    <section className="glass-panel relative z-10 w-full max-w-md rounded-[2.5rem] p-7 text-center sm:p-10">
      <div className="mx-auto mb-6 flex h-36 w-36 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-violet-700 via-fuchsia-500 to-amber-300 p-[3px] shadow-[0_0_60px_rgba(168,85,247,.45)]">
        <div className="flex h-full w-full items-center justify-center rounded-[2.35rem] bg-[#171026] text-7xl font-black text-amber-300">π</div>
      </div>
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Pi Box <span className="text-amber-300">Connect</span></h1>
      <p className="mt-3 text-lg text-violet-100/80">تواصل بحرية. ابقَ آمنًا.</p>
      <div className="my-7 grid grid-cols-3 gap-3 text-xs text-violet-100/70">
        <div className="feature-chip"><MessageCircle/>رسائل</div><div className="feature-chip"><Mic/>صوت</div><div className="feature-chip"><ShieldCheck/>خصوصية</div>
      </div>
      <button disabled={loading} onClick={onSignIn} className="pi-signin-button">
        <span className="text-2xl font-black">π</span>{loading ? "جارٍ تسجيل الدخول..." : "Sign in with Pi"}
      </button>
      <p className="mt-4 text-xs leading-6 text-violet-100/60">يُستخدم Pi SDK لتسجيل الدخول وإنشاء هوية المستخدم داخل التطبيق.</p>
    </section>
  </main>
}

function HomeView({ name, onNavigate }: { name: string; onNavigate: (v: View) => void }) {
  return <div className="space-y-6">
    <section className="hero-card overflow-hidden rounded-[2.2rem] p-6 sm:p-8">
      <div className="relative z-10 max-w-xl"><span className="status-pill"><span/> متصل عبر هوية Pi</span><h2 className="mt-5 text-3xl font-black sm:text-5xl">مرحبًا، {name} 👋</h2><p className="mt-3 max-w-lg text-violet-100/75">رسائلك، مكالماتك وملفاتك في مكان واحد بتجربة أنيقة ومصممة للهاتف.</p><button onClick={() => onNavigate("chats")} className="mt-6 rounded-2xl bg-white px-5 py-3 font-black text-violet-900">ابدأ محادثة</button></div>
    </section>
    <section><div className="mb-4 flex items-end justify-between"><div><h3 className="text-2xl font-black">الخدمات</h3><p className="text-sm text-violet-200/60">كل ما تحتاجه للتواصل</p></div></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{quickActions.map((item) => { const Icon=item.icon; return <button key={item.label} onClick={() => onNavigate(item.view)} className="service-card text-right"><span className={`service-icon bg-gradient-to-br ${item.gradient}`}><Icon/></span><strong>{item.label}</strong><small>{item.sub}</small><ChevronRight className="arrow h-5 w-5 rotate-180"/></button> })}</div>
    </section>
    <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]"><div className="glass-panel rounded-[2rem] p-5"><div className="flex items-center justify-between"><div><h3 className="text-xl font-black">آخر المحادثات</h3><p className="text-sm text-violet-200/60">ابقَ قريبًا ممن يهمك</p></div><button onClick={() => onNavigate("chats")} className="text-sm font-bold text-amber-300">عرض الكل</button></div><div className="mt-4 space-y-2">{contacts.slice(0,3).map(c=><ContactRow key={c.id} contact={c}/>)}</div></div>
      <div className="glass-panel rounded-[2rem] p-5"><Globe2 className="h-8 w-8 text-amber-300"/><h3 className="mt-4 text-xl font-black">اتصال عالمي</h3><p className="mt-2 text-sm leading-6 text-violet-100/65">استخدم هوية Pi للتواصل دون كشف رقم هاتفك أو بريدك.</p><div className="mt-5 flex items-center gap-2 text-xs text-emerald-300"><ShieldCheck className="h-4 w-4"/> الخصوصية أولًا</div></div>
    </section>
  </div>
}

function ContactRow({ contact, onClick }: { contact: Contact; onClick?: () => void }) { return <button onClick={onClick} className="contact-row w-full"><span className={`avatar bg-gradient-to-br ${contact.color}`}>{avatarText(contact.name)}</span><span className="min-w-0 flex-1 text-right"><strong className="block">{contact.name}</strong><small className="block truncate text-violet-200/55">{contact.handle} · {contact.status}</small></span><ChevronRight className="h-5 w-5 rotate-180 text-violet-200/35"/></button> }
function ChatsView({ onOpen }: { onOpen: (c: Contact) => void }) { return <section><PageTitle title="الرسائل" subtitle="محادثاتك الأخيرة"/><div className="glass-panel rounded-[2rem] p-3"><label className="search-box"><Search/><input placeholder="ابحث عن محادثة..."/></label><div className="mt-3 space-y-1">{contacts.map((c,i)=><div key={c.id} className="relative"><ContactRow contact={c} onClick={()=>onOpen(c)}/>{i<2&&<span className="absolute left-4 top-6 min-w-5 rounded-full bg-fuchsia-500 px-1.5 text-center text-xs font-bold">{i+1}</span>}</div>)}</div></div></section> }

function ChatView(props: any) {
  const { contact, messages, message, setMessage, onSend, attachmentOpen, setAttachmentOpen, recording, recordSeconds, onStartRecording, onStopRecording, onLocation, onIdentity, onFile, onImage } = props
  return <section className="glass-panel flex min-h-[72vh] flex-col overflow-hidden rounded-[2rem]">
    <div className="flex items-center gap-3 border-b border-white/10 p-4"><span className={`avatar bg-gradient-to-br ${contact.color}`}>{avatarText(contact.name)}</span><div className="flex-1"><h2 className="font-black">{contact.name}</h2><p className="text-xs text-emerald-300">● {contact.status}</p></div><button className="icon-button"><Phone/></button><button className="icon-button"><Video/></button><button className="icon-button"><MoreVertical/></button></div>
    <div className="chat-background flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">{messages.map((m:ChatMessage)=><MessageBubble key={m.id} item={m}/>)}</div>
    <div className="relative border-t border-white/10 bg-[#120b20]/90 p-3">
      {attachmentOpen && <div className="attachment-menu"><button onClick={onImage}><ImageIcon/>صورة</button><button onClick={onFile}><FileText/>ملف</button><button onClick={onLocation}><MapPin/>الموقع</button><button onClick={onIdentity}><UserRound/>الهوية</button></div>}
      {recording ? <div className="flex items-center gap-3"><span className="h-3 w-3 animate-pulse rounded-full bg-red-500"/><span className="flex-1 font-bold">جارٍ التسجيل... {recordSeconds}ث</span><button onClick={onStopRecording} className="send-button bg-red-500"><Square/></button></div> : <div className="flex items-end gap-2"><button onClick={()=>setAttachmentOpen(!attachmentOpen)} className="icon-button"><Paperclip/></button><textarea value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onSend()}}} rows={1} placeholder="اكتب رسالة..." className="message-input"/><button onClick={message.trim()?onSend:onStartRecording} className="send-button">{message.trim()?<Send/>:<Mic/>}</button></div>}
    </div>
  </section>
}
function MessageBubble({ item }: { item: ChatMessage }) { return <div className={`flex ${item.mine?"justify-start":"justify-end"}`}><div className={`message-bubble ${item.mine?"mine":"theirs"}`}>
  {item.kind==="text"&&<p>{item.text}</p>}
  {item.kind==="audio"&&<div className="flex min-w-48 items-center gap-3"><button className="audio-play" onClick={(e)=>{const audio=e.currentTarget.parentElement?.querySelector("audio");audio?.play()}}><Play/></button><div className="h-1 flex-1 rounded-full bg-white/30"><div className="h-full w-2/3 rounded-full bg-white"/></div><span className="text-xs">{item.duration}ث</span><audio src={item.url}/></div>}
  {item.kind==="location"&&<a className="block min-w-52" target="_blank" rel="noreferrer" href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}><div className="mb-2 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/30 to-cyan-500/20"><MapPin className="h-10 w-10"/></div><strong>موقع مشترك</strong><small className="block opacity-70">اضغط لفتحه في الخريطة</small></a>}
  {item.kind==="identity"&&<div className="min-w-52"><div className="mb-3 flex items-center gap-3"><span className="avatar bg-gradient-to-br from-amber-300 to-fuchsia-500">{avatarText(item.text||"P")}</span><div><strong>بطاقة هوية Pi</strong><small className="block opacity-70">{item.text}</small></div></div><button className="w-full rounded-xl bg-white/15 py-2 text-sm font-bold">عرض البروفايل</button></div>}
  {item.kind==="image"&&<img src={item.url} alt={item.filename||"صورة مشتركة"} className="max-h-64 w-full rounded-xl object-cover"/>}
  {item.kind==="file"&&<a href={item.url} download={item.filename} className="flex min-w-52 items-center gap-3"><span className="rounded-xl bg-white/15 p-3"><FileText/></span><span className="min-w-0"><strong className="block truncate">{item.filename}</strong><small className="opacity-70">ملف مشترك</small></span></a>}
  <span className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-55">{item.time}{item.mine&&<CheckCheck className="h-3 w-3"/>}</span></div></div> }

function ContactsView({ onChat }: { onChat:(c:Contact)=>void }) { return <section><PageTitle title="جهات الاتصال" subtitle="تواصل عبر هوية Pi"/><div className="grid gap-3 md:grid-cols-2">{contacts.map(c=><div key={c.id} className="glass-panel rounded-[1.7rem] p-4"><ContactRow contact={c}/><div className="mt-3 grid grid-cols-3 gap-2"><button onClick={()=>onChat(c)} className="mini-action"><MessageCircle/>رسالة</button><button className="mini-action"><Phone/>صوت</button><button className="mini-action"><Video/>فيديو</button></div></div>)}</div></section> }
function CallsView() { return <section><PageTitle title="المكالمات" subtitle="صوت وفيديو"/><div className="glass-panel rounded-[2rem] p-4"><div className="grid grid-cols-2 gap-3"><button className="call-card from-emerald-500 to-cyan-500"><Phone/>مكالمة صوتية</button><button className="call-card from-violet-500 to-fuchsia-500"><Video/>مكالمة فيديو</button></div><div className="mt-5 space-y-2">{contacts.map((c,i)=><div key={c.id} className="contact-row"><span className={`avatar bg-gradient-to-br ${c.color}`}>{avatarText(c.name)}</span><span className="flex-1"><strong>{c.name}</strong><small className="block text-violet-200/55">{i===1?"مكالمة فائتة":"مكالمة صادرة"} · اليوم</small></span><button className="icon-button">{i%2?<Video/>:<Phone/>}</button></div>)}</div></div></section> }
function FilesView() { return <section><PageTitle title="الملفات والوسائط" subtitle="كل ما تمت مشاركته"/><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[{l:"الصور",i:ImageIcon,g:"from-pink-500 to-orange-400",n:"24"},{l:"الصوتيات",i:Mic,g:"from-cyan-500 to-blue-500",n:"8"},{l:"المستندات",i:FileText,g:"from-amber-400 to-orange-500",n:"12"},{l:"المواقع",i:MapPin,g:"from-emerald-400 to-teal-600",n:"5"}].map(x=>{const I=x.i;return <div key={x.l} className="service-card"><span className={`service-icon bg-gradient-to-br ${x.g}`}><I/></span><strong>{x.l}</strong><small>{x.n} عناصر</small></div>})}</div></section> }
function ProfileView({ name, identity }: { name:string; identity:string }) { return <section><PageTitle title="البروفايل" subtitle="هويتك داخل Pi Box Connect"/><div className="glass-panel overflow-hidden rounded-[2.2rem]"><div className="h-36 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-400"/><div className="px-6 pb-7 text-center"><div className="mx-auto -mt-16 flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#160d25] bg-gradient-to-br from-amber-300 to-fuchsia-600 text-5xl font-black">{avatarText(name)}</div><h2 className="mt-4 text-3xl font-black">{name}</h2><p className="text-violet-200/60">@{name}</p><div className="mx-auto mt-5 max-w-md rounded-2xl bg-white/5 p-4 text-sm text-violet-100/70"><p className="break-all">{identity}</p></div><div className="mt-5 grid grid-cols-2 gap-3"><button className="rounded-2xl bg-white px-4 py-3 font-black text-violet-900"><Camera className="ml-2 inline h-4 w-4"/>تغيير الصورة</button><button className="rounded-2xl border border-white/15 px-4 py-3 font-black"><User className="ml-2 inline h-4 w-4"/>تعديل البروفايل</button></div></div></div></section> }
function SettingsView({
  language,
  setLanguage,
}: {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
}) {
  const [notifications, setNotifications] = useState(true)
  const [privacy, setPrivacy] = useState(true)
  const [languageOpen, setLanguageOpen] = useState(false)

  const t = translations[language]
  const selectedLanguage = languages.find(
    (item) => item.code === language
  )

  const settingItems = [
    {
      title: language === "ar" ? "الإشعارات" : "Notifications",
      description:
        language === "ar"
          ? "تنبيهات الرسائل والمكالمات"
          : "Message and call notifications",
      icon: Bell,
      value: notifications,
      setValue: setNotifications,
    },
    {
      title: language === "ar" ? "الخصوصية" : "Privacy",
      description:
        language === "ar"
          ? "السماح لجهات الاتصال فقط"
          : "Allow contacts only",
      icon: ShieldCheck,
      value: privacy,
      setValue: setPrivacy,
    },
  ]

  return (
    <section>
      <PageTitle
        title={t.settings}
        subtitle={
          language === "ar"
            ? "خصص تجربتك"
            : "Customize your experience"
        }
      />

      <div className="glass-panel mb-4 rounded-[2rem] p-4">
        <label className="mb-2 block text-sm font-bold text-violet-100">
          {t.language}
        </label>

        <button
          type="button"
          onClick={() => setLanguageOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-[#1a0b2e] px-4 py-3 text-white"
        >
          <span>{selectedLanguage?.name ?? t.language}</span>

          <ChevronRight
            className={`h-5 w-5 transition-transform ${
              languageOpen ? "rotate-90" : ""
            }`}
          />
        </button>

        {languageOpen && (
          <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-white/15 bg-[#160d25] p-2">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLanguage(item.code)
                  setLanguageOpen(false)
                }}
                className={`mb-1 flex w-full rounded-xl px-4 py-3 text-start ${
                  language === item.code
                    ? "bg-violet-500/30 text-white"
                    : "text-violet-100 hover:bg-white/10"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel rounded-[2rem] p-4">
        {settingItems.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.title} className="setting-row">
              <span className="service-icon h-11 w-11 bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Icon />
              </span>

              <span className="flex-1">
                <strong>{item.title}</strong>
                <small className="block text-violet-200/55">
                  {item.description}
                </small>
              </span>

              <button
                type="button"
                onClick={() => item.setValue(!item.value)}
                className={`toggle ${item.value ? "on" : ""}`}
              >
                <span />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
     
function PageTitle({title,subtitle}:{title:string;subtitle:string}) { return <div className="mb-5"><h1 className="text-3xl font-black">{title}</h1><p className="mt-1 text-violet-200/60">{subtitle}</p></div> }
