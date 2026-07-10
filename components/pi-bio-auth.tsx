"use client"

import NewDashboard from "./new-dashboard"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { getPiIdentity, isPiSdkAvailable, signInWithPi, type PiUser } from "@/lib/pi-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Archive,
  CheckCircle2,
  Copy,
  Globe2,
  Inbox,
  Loader2,
  Lock,
  MailPlus,
  MessageCircle,
  Phone,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Video,
  Wallet,
} from "lucide-react"

type Language = "ar" | "en"
type Folder = "inbox" | "sent" | "archive" | "trash"

type AppMessage = {
  id: string
  from: string
  to: string
  subject: string
  body: string
  folder: Folder
  read: boolean
  createdAt: string
}
type Contact = { id: string; name: string; identity: string }
type CallItem = {
  id: string
  type: "voice" | "video"
  to: string
  status: "sent" | "missed" | "accepted" | "declined"
  createdAt: string
}
type AppState = {
  messages: AppMessage[]
  contacts: Contact[]
  calls: CallItem[]
  displayName: string
  language: Language
  privacy: "everyone" | "contacts"
  blocked: string[]
}

const dictionary = {
  ar: {
    appName: "Box Connect",
    badge: "هوية Pi Network",
    hero: "شبكة رسائل ومكالمات آمنة بهوية Pi",
    intro:
      "تطبيق يعمل داخل Pi Browser ويستخدم Sign in with Pi فقط. لا يستخدم رقم هاتف أو بريد إلكتروني، ويعرض خارج Pi Browser إرشادات واضحة عند عدم توفر Pi SDK.",
    signInTitle: "تسجيل الدخول",
    signInDescription: "اضغط الزر لاستخدام Pi SDK الرسمي. يجب إضافة نطاق التطبيق في Pi Developer Portal قبل النشر.",
    signIn: "Sign in with Pi",
    noManual: "لا يوجد تسجيل يدوي أو حساب تجريبي. الهوية تأتي من Pi SDK فقط.",
    sdkUnavailable: "Pi SDK غير متاح هنا. افتح التطبيق من Pi Browser أو تأكد من إعداد نطاق التطبيق في Pi Developer Portal.",
    signedIn: "تم تسجيل الدخول عبر Pi",
    inbox: "الوارد",
    compose: "إنشاء",
    sent: "المرسل",
    archive: "الأرشيف",
    trash: "المحذوفات",
    contacts: "الجهات",
    calls: "المكالمات",
    settings: "الإعدادات",
    unread: "غير مقروء",
    messages: "الرسائل",
    totalContacts: "الجهات",
    totalCalls: "طلبات الاتصال",
    recipient: "هوية Pi للمستلم",
    subject: "الموضوع",
    message: "الرسالة",
    sendMessage: "إرسال الرسالة",
    required: "الحقول المطلوبة غير مكتملة",
    sentOk: "تم إرسال الرسالة",
    newMessageDesc: "أرسل رسالة إلى مستخدم آخر عبر هوية Pi أو عنوان محفظة Pi.",
    addContact: "إضافة جهة",
    displayName: "الاسم الظاهر",
    piIdentity: "هوية Pi / عنوان المحفظة",
    add: "إضافة",
    contactAdded: "تمت إضافة الجهة",
    noContacts: "لا توجد جهات بعد.",
    messageAction: "رسالة",
    voice: "صوت",
    video: "فيديو",
    callRequests: "طلبات الاتصال",
    callDesc: "مرحلة MVP: يتم تسجيل طلب الاتصال. يمكن ربط WebRTC لاحقًا للمكالمات الحقيقية.",
    callSent: "تم إرسال طلب الاتصال",
    noCalls: "لا توجد طلبات اتصال بعد.",
    noMessages: "لا توجد رسائل هنا.",
    from: "من",
    to: "إلى",
    signedAs: "مسجل باسم",
    language: "اللغة",
    arabic: "العربية",
    english: "English",
    privacy: "الخصوصية",
    everyone: "استقبال من الجميع",
    contactsOnly: "استقبال من جهات الاتصال فقط",
    blocked: "العناوين المحظورة",
    blockPlaceholder: "أضف هوية Pi للحظر",
    block: "حظر",
    profile: "الملف الشخصي",
    save: "حفظ",
    saved: "تم الحفظ",
    ecosystem: "جاهزية منظومة Pi",
    ecosystemText:
      "يتضمن التطبيق تسجيل دخول Pi فقط، عدم طلب الهاتف أو الإيميل، دعم Pi Browser، دعم HTTPS عند النشر، ومكان واضح لإضافة التحقق الخلفي من access token قبل الإنتاج.",
    welcomeSubject: "مرحبًا بك في Box Connect",
    welcomeBody: "تم تسجيل الدخول باستخدام Pi فقط. يمكن استخدام هوية Pi لاستقبال الرسائل وطلبات الاتصال داخل هذا النموذج الأولي.",
  },
  en: {
    appName: "Box Connect",
    badge: "Pi Network Identity",
    hero: "Secure messages and call requests with Pi identity",
    intro:
      "A Pi Browser-ready app that uses Sign in with Pi only. It does not use phone numbers or email, and outside Pi Browser it shows clear guidance when the Pi SDK is unavailable.",
    signInTitle: "Sign in",
    signInDescription: "Use the official Pi SDK. Add your app domain in Pi Developer Portal before production release.",
    signIn: "Sign in with Pi",
    noManual: "No manual login and no demo account. Identity comes from Pi SDK only.",
    sdkUnavailable: "Pi SDK is not available here. Open the app in Pi Browser or confirm the app domain in Pi Developer Portal.",
    signedIn: "Signed in with Pi",
    inbox: "Inbox",
    compose: "Compose",
    sent: "Sent",
    archive: "Archive",
    trash: "Trash",
    contacts: "Contacts",
    calls: "Calls",
    settings: "Settings",
    unread: "Unread",
    messages: "Messages",
    totalContacts: "Contacts",
    totalCalls: "Call requests",
    recipient: "Recipient Pi identity",
    subject: "Subject",
    message: "Message",
    sendMessage: "Send message",
    required: "Required fields are missing",
    sentOk: "Message sent",
    newMessageDesc: "Send a message to another user by Pi identity or Pi wallet address.",
    addContact: "Add contact",
    displayName: "Display name",
    piIdentity: "Pi identity / wallet address",
    add: "Add",
    contactAdded: "Contact added",
    noContacts: "No contacts yet.",
    messageAction: "Message",
    voice: "Voice",
    video: "Video",
    callRequests: "Call requests",
    callDesc: "MVP stage: call requests are logged. Real WebRTC calling can be connected later.",
    callSent: "Call request sent",
    noCalls: "No call requests yet.",
    noMessages: "No messages here.",
    from: "From",
    to: "to",
    signedAs: "Signed in as",
    language: "Language",
    arabic: "العربية",
    english: "English",
    privacy: "Privacy",
    everyone: "Allow everyone",
    contactsOnly: "Contacts only",
    blocked: "Blocked identities",
    blockPlaceholder: "Add Pi identity to block",
    block: "Block",
    profile: "Profile",
    save: "Save",
    saved: "Saved",
    ecosystem: "Pi ecosystem readiness",
    ecosystemText:
      "The app includes Pi-only authentication, no phone/email requirement, Pi Browser support, HTTPS-ready deployment guidance, and a clear place to add backend access-token verification before production.",
    welcomeSubject: "Welcome to Box Connect",
    welcomeBody: "You signed in with Pi only. Your Pi identity can receive messages and call requests in this MVP.",
  },
} as const

const now = () => new Date().toISOString()
const id = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
const appKey = (identity: string) => `pi-box-connect:${identity}`
const languageKey = "pi-box-connect:language"

function detectInitialLanguage(): Language {
  if (typeof window === "undefined") return "en"
  const saved = localStorage.getItem(languageKey)
  if (saved === "ar" || saved === "en") return saved
  return "en"
}

function shortIdentity(value: string) {
  return value.length <= 22 ? value : `${value.slice(0, 12)}…${value.slice(-8)}`
}

function loadState(identity: string): AppState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(appKey(identity))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveState(identity: string, state: AppState) {
  localStorage.setItem(appKey(identity), JSON.stringify(state))
}

export default function PiBioAuth() {
  const [language, setLanguageState] = useState<Language>("en")
  useEffect(() => {
    setLanguageState("en")
  }, [])
  const t = dictionary[language]
  const direction = language === "ar" ? "rtl" : "ltr"
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [user, setUser] = useState<PiUser | null>(null)
  const [messages, setMessages] = useState<AppMessage[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [calls, setCalls] = useState<CallItem[]>([])
  const [displayName, setDisplayName] = useState("")
  const [privacy, setPrivacy] = useState<"everyone" | "contacts">("everyone")
  const [blocked, setBlocked] = useState<string[]>([])
  const [blockedInput, setBlockedInput] = useState("")
  const [recipient, setRecipient] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactIdentity, setContactIdentity] = useState("")
  const [activeTab, setActiveTab] = useState<string>("inbox")

  const identity = useMemo(() => (user ? getPiIdentity(user) : ""), [user])
  const unreadCount = messages.filter((message) => message.folder === "inbox" && !message.read).length

  function setLanguage(next: Language) {
    setLanguageState(next)
    if (typeof window !== "undefined") localStorage.setItem(languageKey, next)
    if (identity) persist({ language: next })
  }

  function currentState(overrides: Partial<AppState> = {}): AppState {
    return { messages, contacts, calls, displayName, language, privacy, blocked, ...overrides }
  }

  function persist(overrides: Partial<AppState>) {
    if (identity) saveState(identity, currentState(overrides))
  }

  async function handleSignIn() {
    setLoading(true)
    setAuthError("")
    try {
      const result = await signInWithPi()
      const piIdentity = getPiIdentity(result.user)
      const saved = loadState(piIdentity)
      const initialMessages = saved?.messages ?? [
        {
          id: id(),
          from: "pi:welcome",
          to: piIdentity,
          subject: t.welcomeSubject,
          body: t.welcomeBody,
          folder: "inbox" as const,
          read: false,
          createdAt: now(),
        },
      ]

      setAccessToken(result.accessToken)
      setUser(result.user)
      setMessages(initialMessages)
      setContacts(saved?.contacts ?? [])
      setCalls(saved?.calls ?? [])
      setDisplayName(saved?.displayName ?? result.user.username ?? "")
      setPrivacy(saved?.privacy ?? "everyone")
      setBlocked(saved?.blocked ?? [])
      if (saved?.language) setLanguageState(saved.language)

      saveState(piIdentity, {
        messages: initialMessages,
        contacts: saved?.contacts ?? [],
        calls: saved?.calls ?? [],
        displayName: saved?.displayName ?? result.user.username ?? "",
        language: saved?.language ?? language,
        privacy: saved?.privacy ?? "everyone",
        blocked: saved?.blocked ?? [],
      })
      toast.success(t.signedIn)
    } catch (error) {
      const message = error instanceof Error ? error.message : t.sdkUnavailable
      setAuthError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  function sendMessage() {
    if (!identity) return
    if (!recipient.trim() || !subject.trim() || !body.trim()) return toast.error(t.required)
    const outgoing = {
      id: id(),
      from: identity,
      to: recipient.trim(),
      subject: subject.trim(),
      body: body.trim(),
      folder: "sent" as const,
      read: true,
      createdAt: now(),
    }
    const next = [outgoing, ...messages]
    setMessages(next)
    persist({ messages: next })
    setRecipient("")
    setSubject("")
    setBody("")
    toast.success(t.sentOk)
  }

  function moveMessage(messageId: string, folder: Folder) {
    const next = messages.map((message) => (message.id === messageId ? { ...message, folder } : message))
    setMessages(next)
    persist({ messages: next })
  }

  function markRead(messageId: string) {
    const next = messages.map((message) => (message.id === messageId ? { ...message, read: true } : message))
    setMessages(next)
    persist({ messages: next })
  }

  function addContact() {
    if (!contactName.trim() || !contactIdentity.trim()) return toast.error(t.required)
    const next = [{ id: id(), name: contactName.trim(), identity: contactIdentity.trim() }, ...contacts]
    setContacts(next)
    persist({ contacts: next })
    setContactName("")
    setContactIdentity("")
    toast.success(t.contactAdded)
  }

  function requestCall(to: string, type: "voice" | "video") {
    if (!to.trim()) return toast.error(t.required)
    const next = [{ id: id(), to: to.trim(), type, status: "sent" as const, createdAt: now() }, ...calls]
    setCalls(next)
    persist({ calls: next })
    toast.success(t.callSent)
  }

  function saveSettings() {
    persist({ displayName, language, privacy, blocked })
    toast.success(t.saved)
  }

  function addBlocked() {
    if (!blockedInput.trim()) return
    const next = Array.from(new Set([blockedInput.trim(), ...blocked]))
    setBlocked(next)
    setBlockedInput("")
    persist({ blocked: next })
  }

  if (!user) {
    return (
      <main dir={direction} className="relative min-h-screen overflow-hidden bg-[#030712] px-4 py-8 text-white">
        <Aurora />
        <section className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border border-purple-400/40 bg-purple-500/15 text-purple-100" variant="secondary">
                {t.badge}
              </Badge>
              <Button className="glass-button" variant="outline" size="sm" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
                <Globe2 className="mr-2 h-4 w-4" />
                {language === "ar" ? "English" : "العربية"}
              </Button>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-yellow-400/25 bg-white/[0.04] p-6 shadow-2xl shadow-purple-950/40 backdrop-blur-xl md:p-9">
              <div className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-purple-600/30 blur-3xl" />
              <div className="absolute -bottom-32 left-10 h-56 w-56 rounded-full bg-yellow-500/20 blur-3xl" />
              <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
                <div className="mx-auto flex h-56 w-56 shrink-0 items-center justify-center rounded-full border border-yellow-400/40 bg-[radial-gradient(circle,#241044,#050816_65%)] shadow-2xl shadow-yellow-500/20">
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-yellow-300/50 bg-black/40">
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/40" />
                    <div className="text-center">
                      <div className="text-4xl font-black tracking-wide text-yellow-300">BOX</div>
                      <div className="text-lg font-bold tracking-[0.32em] text-white">CONNECT</div>
                      <div className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-2xl font-black text-purple-950">
                        π
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-center md:text-start">
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-yellow-300">One identity • One network</p>
                  <h1 className="text-5xl font-black tracking-tight md:text-7xl">
                    Box <span className="text-transparent bg-gradient-to-r from-yellow-300 to-purple-300 bg-clip-text">Connect</span>
                  </h1>
                  <p className="text-xl font-semibold text-slate-100 md:text-2xl">{t.hero}</p>
                  <p className="max-w-2xl text-base leading-8 text-slate-300">{t.intro}</p>
                  <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-300 md:justify-start">
                    <Pill icon={<Lock className="h-4 w-4" />} text="End-to-end ready" />
                    <Pill icon={<ShieldCheck className="h-4 w-4" />} text="Pi verified" />
                    <Pill icon={<Globe2 className="h-4 w-4" />} text="Global network" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="relative overflow-hidden rounded-[2rem] border border-purple-400/25 bg-white/[0.05] text-white shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#7c3aed44,transparent_38%)]" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Wallet className="h-6 w-6 text-yellow-300" />
                {t.signInTitle}
              </CardTitle>
              <CardDescription className="text-slate-300">{t.signInDescription}</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-5">
              <Button className="h-14 w-full rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-yellow-500 text-base font-bold shadow-lg shadow-purple-900/30 hover:opacity-95" size="lg" onClick={handleSignIn} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wallet className="mr-2 h-5 w-5" />}
                {t.signIn}
              </Button>
              {authError && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {authError}
                  <p className="mt-2 text-slate-300">{t.sdkUnavailable}</p>
                </div>
              )}
              <p className="text-xs leading-6 text-slate-400">{t.noManual}</p>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-300">
                <span>SDK status</span>
                <span className={isPiSdkAvailable() ? "text-emerald-300" : "text-yellow-300"}>
                  {isPiSdkAvailable() ? "available" : "not loaded"}
                </span>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    )
  }
  if (user) {
  return <NewDashboard />
}

  return (
    <div dir={direction} className="relative min-h-screen overflow-hidden bg-[#030712] pb-28 text-white">
      <Aurora />
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-yellow-300">
              <Sparkles className="h-4 w-4" />
              {t.badge}
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              Box <span className="text-yellow-300">Connect</span>
            </h1>
            <p className="text-sm text-slate-300">
              {t.signedAs} <span className="font-semibold text-purple-200">@{user.username}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="glass-button" variant="outline" size="sm" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
              <Globe2 className="mr-2 h-4 w-4" />
              {language === "ar" ? "English" : "العربية"}
            </Button>
            <div className="flex items-center gap-2 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-xs font-mono text-yellow-100" title={identity}>
              {shortIdentity(identity)}
              <Copy className="h-3.5 w-3.5 opacity-70" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-6">
        <section className="mb-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-yellow-400/25 bg-white/[0.05] p-5 shadow-2xl shadow-purple-950/30 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-yellow-300/40 bg-gradient-to-br from-purple-700 to-yellow-500 text-4xl font-black shadow-lg shadow-yellow-500/20">
                π
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-bold">{displayName || user.username}</p>
                <p className="text-sm text-slate-400">Pi Wallet address.verified identity</p>
                <p className="mt-2 inline-flex rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-100">
                  {shortIdentity(identity)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-purple-400/25 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Global Connection</h2>
                <p className="text-sm text-slate-400">Connected through Pi Network identity</p>
              </div>
              <Globe2 className="h-8 w-8 text-yellow-300" />
            </div>
            <div className="relative h-28 overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle,#4c1d95,transparent_70%)]">
              <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-300/40 bg-yellow-400/10" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-yellow-300">π</div>
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(250,204,21,.15),transparent)]" />
            </div>
          </div>
        </section>

        {/* البطاقات - أصبحت الآن تعمل مع useState */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div 
            className="rounded-[1.7rem] border bg-gradient-to-br from-purple-600/40 to-purple-900/20 p-5 shadow-xl shadow-black/20 backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-all duration-200"
            onClick={() => setActiveTab("inbox")}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/30">
              <Inbox className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-slate-300">{t.unread}</p>
            <p className="mt-1 text-4xl font-black text-white">{unreadCount}</p>
          </div>

          <div 
            className="rounded-[1.7rem] border bg-gradient-to-br from-blue-500/30 to-blue-900/20 p-5 shadow-xl shadow-black/20 backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-all duration-200"
            onClick={() => setActiveTab("compose")}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/30">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-slate-300">{t.messages}</p>
            <p className="mt-1 text-4xl font-black text-white">{messages.length}</p>
          </div>

          <div 
            className="rounded-[1.7rem] border bg-gradient-to-br from-emerald-500/25 to-emerald-900/20 p-5 shadow-xl shadow-black/20 backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-all duration-200"
            onClick={() => setActiveTab("contacts")}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-slate-300">{t.totalContacts}</p>
            <p className="mt-1 text-4xl font-black text-white">{contacts.length}</p>
          </div>

          <div 
            className="rounded-[1.7rem] border bg-gradient-to-br from-yellow-500/30 to-yellow-900/20 p-5 shadow-xl shadow-black/20 backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-all duration-200"
            onClick={() => setActiveTab("calls")}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/30">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-slate-300">{t.totalCalls}</p>
            <p className="mt-1 text-4xl font-black text-white">{calls.length}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 rounded-3xl border border-white/10 bg-white/[0.05] p-2 backdrop-blur-xl">
            <AppTab value="inbox" icon={<Inbox />} label={t.inbox} />
            <AppTab value="compose" icon={<MailPlus />} label={t.compose} />
            <AppTab value="sent" icon={<Send />} label={t.sent} />
            <AppTab value="archive" icon={<Archive />} label={t.archive} />
            <AppTab value="trash" icon={<Trash2 />} label={t.trash} />
            <AppTab value="contacts" icon={<UserPlus />} label={t.contacts} />
            <AppTab value="calls" icon={<Phone />} label={t.calls} />
            <AppTab value="settings" icon={<Settings />} label={t.settings} />
          </TabsList>

          <TabsContent value="inbox">
            <MessageList t={t} messages={messages.filter((m) => m.folder === "inbox")} onRead={markRead} onMove={moveMessage} />
          </TabsContent>
          <TabsContent value="sent">
            <MessageList t={t} messages={messages.filter((m) => m.folder === "sent")} onRead={markRead} onMove={moveMessage} />
          </TabsContent>
          <TabsContent value="archive">
            <MessageList t={t} messages={messages.filter((m) => m.folder === "archive")} onRead={markRead} onMove={moveMessage} />
          </TabsContent>
          <TabsContent value="trash">
            <MessageList t={t} messages={messages.filter((m) => m.folder === "trash")} onRead={markRead} onMove={moveMessage} />
          </TabsContent>

          <TabsContent value="compose">
            <Panel title={t.compose} description={t.newMessageDesc}>
              <div className="space-y-4">
                <Field label={t.recipient}>
                  <Input className="app-input" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="pi:uid or wallet address" />
                </Field>
                <Field label={t.subject}>
                  <Input className="app-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </Field>
                <Field label={t.message}>
                  <Textarea className="app-input min-h-40" rows={7} value={body} onChange={(e) => setBody(e.target.value)} />
                </Field>
                <Button className="primary-action" onClick={sendMessage}>
                  <Send className="mr-2 h-4 w-4" />
                  {t.sendMessage}
                </Button>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <Panel title={t.addContact}>
                <div className="space-y-3">
                  <Input className="app-input" placeholder={t.displayName} value={contactName} onChange={(e) => setContactName(e.target.value)} />
                  <Input className="app-input" placeholder={t.piIdentity} value={contactIdentity} onChange={(e) => setContactIdentity(e.target.value)} />
                  <Button onClick={addContact} className="primary-action w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t.add}
                  </Button>
                </div>
              </Panel>
              <Panel title={t.contacts}>
                <div className="space-y-3">
                  {contacts.length === 0 && <p className="text-sm text-slate-400">{t.noContacts}</p>}
                  {contacts.map((contact) => (
                    <div key={contact.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold">{contact.name}</p>
                          <p className="text-xs text-slate-400">{contact.identity}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" className="glass-button" onClick={() => setRecipient(contact.identity)}>
                            {t.messageAction}
                          </Button>
                          <Button size="sm" variant="outline" className="glass-button" onClick={() => requestCall(contact.identity, "voice")}>
                            {t.voice}
                          </Button>
                          <Button size="sm" variant="outline" className="glass-button" onClick={() => requestCall(contact.identity, "video")}>
                            {t.video}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="calls">
            <Panel title={t.callRequests} description={t.callDesc}>
              <div className="space-y-4">
                <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                  <Input className="app-input" placeholder={t.recipient} value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                  <Button variant="outline" className="glass-button" onClick={() => requestCall(recipient, "voice")}>
                    <Phone className="mr-2 h-4 w-4" />
                    {t.voice}
                  </Button>
                  <Button variant="outline" className="glass-button" onClick={() => requestCall(recipient, "video")}>
                    <Video className="mr-2 h-4 w-4" />
                    {t.video}
                  </Button>
                </div>
                <Separator className="bg-white/10" />
                {calls.length === 0 && <p className="text-sm text-slate-400">{t.noCalls}</p>}
                {calls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4 text-sm">
                    <div>
                      <p className="font-medium">
                        {call.type === "voice" ? t.voice : t.video} {shortIdentity(call.to)}
                      </p>
                      <p className="text-xs text-slate-400">{new Date(call.createdAt).toLocaleString(language === "ar" ? "ar" : "en")}</p>
                    </div>
                    <Badge className="bg-purple-600/30 text-purple-100" variant="secondary">
                      {call.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="settings">
            <Panel title={t.settings} description={t.ecosystemText}>
              <div className="space-y-5">
                <Field label={t.displayName}>
                  <Input className="app-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </Field>
                <Field label={t.language}>
                  <div className="flex gap-2">
                    <Button className={language === "ar" ? "primary-action" : "glass-button"} variant={language === "ar" ? "default" : "outline"} onClick={() => setLanguage("ar")}>
                      {t.arabic}
                    </Button>
                    <Button className={language === "en" ? "primary-action" : "glass-button"} variant={language === "en" ? "default" : "outline"} onClick={() => setLanguage("en")}>
                      {t.english}
                    </Button>
                  </div>
                </Field>
                <Field label={t.privacy}>
                  <div className="flex flex-wrap gap-2">
                    <Button className={privacy === "everyone" ? "primary-action" : "glass-button"} variant={privacy === "everyone" ? "default" : "outline"} onClick={() => setPrivacy("everyone")}>
                      {t.everyone}
                    </Button>
                    <Button className={privacy === "contacts" ? "primary-action" : "glass-button"} variant={privacy === "contacts" ? "default" : "outline"} onClick={() => setPrivacy("contacts")}>
                      {t.contactsOnly}
                    </Button>
                  </div>
                </Field>
                <Field label={t.blocked}>
                  <div className="flex gap-2">
                    <Input className="app-input" placeholder={t.blockPlaceholder} value={blockedInput} onChange={(e) => setBlockedInput(e.target.value)} />
                    <Button variant="outline" className="glass-button" onClick={addBlocked}>
                      {t.block}
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {blocked.map((item) => (
                      <Badge key={item} className="bg-white/10 text-slate-200" variant="secondary">
                        {shortIdentity(item)}
                      </Badge>
                    ))}
                  </div>
                </Field>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-slate-300">
                  <p className="mb-2 font-semibold text-white">{t.ecosystem}</p>
                  {t.ecosystemText}
                  <br />
                  Access token present: {accessToken ? "yes" : "no"}
                </div>
                <Button onClick={saveSettings} className="primary-action">
                  {t.save}
                </Button>
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function Aurora() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(126,34,206,.38),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(245,158,11,.22),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,.2),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:42px_42px]" />
    </>
  )
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-xl">
      <span className="text-yellow-300">{icon}</span>
      {text}
    </span>
  )
}

function AppTab({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger value={value} className="rounded-2xl px-3 py-2 text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-yellow-500 data-[state=active]:text-white">
      <span className="mr-2 h-4 w-4">{icon}</span>
      {label}
    </TabsTrigger>
  )
}

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] text-white shadow-2xl shadow-purple-950/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription className="text-slate-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-200">{label}</Label>
      {children}
    </div>
  )
}

function MessageList({
  messages,
  onRead,
  onMove,
  t,
}: {
  messages: AppMessage[]
  onRead: (id: string) => void
  onMove: (id: string, folder: Folder) => void
  t: (typeof dictionary)[Language]
}) {
  if (messages.length === 0) {
    return (
      <Panel title="Inbox">
        <div className="p-8 text-center text-sm text-slate-400">{t.noMessages}</div>
      </Panel>
    )
  }

  return (
    <Panel title="Inbox">
      <div className="space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-yellow-400/40">
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {!message.read && <span className="h-2.5 w-2.5 rounded-full bg-yellow-300 shadow-lg shadow-yellow-300/50" />}
                  <h3 className="font-semibold text-white">{message.subject}</h3>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {t.from} {shortIdentity(message.from)} {t.to} {shortIdentity(message.to)} · {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="text-slate-300 hover:text-yellow-300" onClick={() => onRead(message.id)}>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-slate-300 hover:text-yellow-300" onClick={() => onMove(message.id, "archive")}>
                  <Archive className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-slate-300 hover:text-red-300" onClick={() => onMove(message.id, "trash")}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{message.body}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}