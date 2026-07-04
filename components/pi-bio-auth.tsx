"use client"

import type React from "react"
import { useMemo, useState } from "react"
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
import { Archive, CheckCircle2, Globe2, Inbox, Loader2, MailPlus, MessageSquare, Phone, Send, Settings, ShieldCheck, Trash2, UserPlus, Video, Wallet } from "lucide-react"

type Language = "ar" | "en"
type Folder = "inbox" | "sent" | "archive" | "trash"

type AppMessage = { id: string; from: string; to: string; subject: string; body: string; folder: Folder; read: boolean; createdAt: string }
type Contact = { id: string; name: string; identity: string }
type CallItem = { id: string; type: "voice" | "video"; to: string; status: "sent" | "missed" | "accepted" | "declined"; createdAt: string }
type AppState = { messages: AppMessage[]; contacts: Contact[]; calls: CallItem[]; displayName: string; language: Language; privacy: "everyone" | "contacts"; blocked: string[] }

const dictionary = {
  ar: {
    appName: "Pi Box Connect",
    badge: "هوية Pi Network",
    hero: "صندوق رسائل ومراسلة ومكالمات بهوية Pi فقط",
    intro: "تطبيق يعمل داخل Pi Browser ويستخدم Sign in with Pi فقط. لا يستخدم رقم هاتف أو بريد إلكتروني، ويعرض خارج Pi Browser إرشادات واضحة عند عدم توفر Pi SDK.",
    signInTitle: "تسجيل الدخول",
    signInDescription: "اضغط الزر لاستخدام Pi SDK الرسمي. يجب إضافة نطاق التطبيق في Pi Developer Portal قبل النشر.",
    signIn: "Sign in with Pi",
    noManual: "لا يوجد تسجيل يدوي أو حساب تجريبي. الهوية تأتي من Pi SDK فقط.",
    sdkUnavailable: "Pi SDK غير متاح هنا. افتح التطبيق من Pi Browser أو تأكد من إعداد نطاق التطبيق في Pi Developer Portal.",
    signedIn: "تم تسجيل الدخول عبر Pi",
    inbox: "الوارد", compose: "إنشاء", sent: "المرسل", archive: "الأرشيف", trash: "المحذوفات", contacts: "الجهات", calls: "المكالمات", settings: "الإعدادات",
    unread: "غير مقروء", messages: "الرسائل", totalContacts: "الجهات", totalCalls: "طلبات الاتصال",
    recipient: "هوية Pi للمستلم", subject: "الموضوع", message: "الرسالة", sendMessage: "إرسال الرسالة", required: "الحقول المطلوبة غير مكتملة", sentOk: "تم إرسال الرسالة",
    newMessageDesc: "أرسل رسالة إلى مستخدم آخر عبر هوية Pi أو عنوان محفظة Pi.",
    addContact: "إضافة جهة", displayName: "الاسم الظاهر", piIdentity: "هوية Pi / عنوان المحفظة", add: "إضافة", contactAdded: "تمت إضافة الجهة", noContacts: "لا توجد جهات بعد.",
    messageAction: "رسالة", voice: "صوت", video: "فيديو", callRequests: "طلبات الاتصال", callDesc: "مرحلة MVP: يتم تسجيل طلب الاتصال. يمكن ربط WebRTC لاحقًا للمكالمات الحقيقية.", callSent: "تم إرسال طلب الاتصال", noCalls: "لا توجد طلبات اتصال بعد.",
    noMessages: "لا توجد رسائل هنا.", from: "من", to: "إلى", signedAs: "مسجل باسم", language: "اللغة", arabic: "العربية", english: "English",
    privacy: "الخصوصية", everyone: "استقبال من الجميع", contactsOnly: "استقبال من جهات الاتصال فقط", blocked: "العناوين المحظورة", blockPlaceholder: "أضف هوية Pi للحظر", block: "حظر", profile: "الملف الشخصي", save: "حفظ", saved: "تم الحفظ",
    ecosystem: "جاهزية منظومة Pi", ecosystemText: "يتضمن التطبيق تسجيل دخول Pi فقط، عدم طلب الهاتف أو الإيميل، دعم Pi Browser، دعم HTTPS عند النشر، ومكان واضح لإضافة التحقق الخلفي من access token قبل الإنتاج.",
    welcomeSubject: "مرحبًا بك في Pi Box Connect", welcomeBody: "تم تسجيل الدخول باستخدام Pi فقط. يمكن استخدام هوية Pi لاستقبال الرسائل وطلبات الاتصال داخل هذا النموذج الأولي.",
  },
  en: {
    appName: "Pi Box Connect",
    badge: "Pi Network Identity",
    hero: "Messages, inbox, and call requests with Pi identity only",
    intro: "A Pi Browser-ready app that uses Sign in with Pi only. It does not use phone numbers or email, and outside Pi Browser it shows clear guidance when the Pi SDK is unavailable.",
    signInTitle: "Sign in", signInDescription: "Use the official Pi SDK. Add your app domain in Pi Developer Portal before production release.", signIn: "Sign in with Pi", noManual: "No manual login and no demo account. Identity comes from Pi SDK only.", sdkUnavailable: "Pi SDK is not available here. Open the app in Pi Browser or confirm the app domain in Pi Developer Portal.", signedIn: "Signed in with Pi",
    inbox: "Inbox", compose: "Compose", sent: "Sent", archive: "Archive", trash: "Trash", contacts: "Contacts", calls: "Calls", settings: "Settings", unread: "Unread", messages: "Messages", totalContacts: "Contacts", totalCalls: "Call requests",
    recipient: "Recipient Pi identity", subject: "Subject", message: "Message", sendMessage: "Send message", required: "Required fields are missing", sentOk: "Message sent", newMessageDesc: "Send a message to another user by Pi identity or Pi wallet address.",
    addContact: "Add contact", displayName: "Display name", piIdentity: "Pi identity / wallet address", add: "Add", contactAdded: "Contact added", noContacts: "No contacts yet.", messageAction: "Message", voice: "Voice", video: "Video", callRequests: "Call requests", callDesc: "MVP stage: call requests are logged. Real WebRTC calling can be connected later.", callSent: "Call request sent", noCalls: "No call requests yet.", noMessages: "No messages here.", from: "From", to: "to", signedAs: "Signed in as", language: "Language", arabic: "العربية", english: "English", privacy: "Privacy", everyone: "Allow everyone", contactsOnly: "Contacts only", blocked: "Blocked identities", blockPlaceholder: "Add Pi identity to block", block: "Block", profile: "Profile", save: "Save", saved: "Saved", ecosystem: "Pi ecosystem readiness", ecosystemText: "The app includes Pi-only authentication, no phone/email requirement, Pi Browser support, HTTPS-ready deployment guidance, and a clear place to add backend access-token verification before production.", welcomeSubject: "Welcome to Pi Box Connect", welcomeBody: "You signed in with Pi only. Your Pi identity can receive messages and call requests in this MVP.",
  },
} as const

const now = () => new Date().toISOString()
const id = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)
const appKey = (identity: string) => `pi-box-connect:${identity}`
const languageKey = "pi-box-connect:language"

function detectInitialLanguage(): Language {
  if (typeof window === "undefined") return "ar"
  const saved = localStorage.getItem(languageKey)
  if (saved === "ar" || saved === "en") return saved
  return navigator.language?.toLowerCase().startsWith("ar") ? "ar" : "en"
}

function shortIdentity(value: string) { return value.length <= 22 ? value : `${value.slice(0, 12)}…${value.slice(-8)}` }
function loadState(identity: string): AppState | null { if (typeof window === "undefined") return null; try { const raw = localStorage.getItem(appKey(identity)); return raw ? JSON.parse(raw) : null } catch { return null } }
function saveState(identity: string, state: AppState) { localStorage.setItem(appKey(identity), JSON.stringify(state)) }

export default function PiBioAuth() {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage)
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

  const identity = useMemo(() => (user ? getPiIdentity(user) : ""), [user])
  const unreadCount = messages.filter((message) => message.folder === "inbox" && !message.read).length

  function setLanguage(next: Language) {
    setLanguageState(next)
    if (typeof window !== "undefined") localStorage.setItem(languageKey, next)
    if (identity) persist({ language: next })
  }

  function currentState(overrides: Partial<AppState> = {}): AppState { return { messages, contacts, calls, displayName, language, privacy, blocked, ...overrides } }
  function persist(overrides: Partial<AppState>) { if (identity) saveState(identity, currentState(overrides)) }

  async function handleSignIn() {
    setLoading(true); setAuthError("")
    try {
      const result = await signInWithPi()
      const piIdentity = getPiIdentity(result.user)
      const saved = loadState(piIdentity)
      const initialMessages = saved?.messages ?? [{ id: id(), from: "pi:welcome", to: piIdentity, subject: t.welcomeSubject, body: t.welcomeBody, folder: "inbox" as const, read: false, createdAt: now() }]
      setAccessToken(result.accessToken); setUser(result.user); setMessages(initialMessages); setContacts(saved?.contacts ?? []); setCalls(saved?.calls ?? []); setDisplayName(saved?.displayName ?? result.user.username ?? ""); setPrivacy(saved?.privacy ?? "everyone"); setBlocked(saved?.blocked ?? [])
      if (saved?.language) setLanguageState(saved.language)
      saveState(piIdentity, { messages: initialMessages, contacts: saved?.contacts ?? [], calls: saved?.calls ?? [], displayName: saved?.displayName ?? result.user.username ?? "", language: saved?.language ?? language, privacy: saved?.privacy ?? "everyone", blocked: saved?.blocked ?? [] })
      toast.success(t.signedIn)
    } catch (error) {
      const message = error instanceof Error ? error.message : t.sdkUnavailable
      setAuthError(message); toast.error(message)
    } finally { setLoading(false) }
  }

  function sendMessage() { if (!identity) return; if (!recipient.trim() || !subject.trim() || !body.trim()) return toast.error(t.required); const outgoing = { id: id(), from: identity, to: recipient.trim(), subject: subject.trim(), body: body.trim(), folder: "sent" as const, read: true, createdAt: now() }; const next = [outgoing, ...messages]; setMessages(next); persist({ messages: next }); setRecipient(""); setSubject(""); setBody(""); toast.success(t.sentOk) }
  function moveMessage(messageId: string, folder: Folder) { const next = messages.map((message) => message.id === messageId ? { ...message, folder } : message); setMessages(next); persist({ messages: next }) }
  function markRead(messageId: string) { const next = messages.map((message) => message.id === messageId ? { ...message, read: true } : message); setMessages(next); persist({ messages: next }) }
  function addContact() { if (!contactName.trim() || !contactIdentity.trim()) return toast.error(t.required); const next = [{ id: id(), name: contactName.trim(), identity: contactIdentity.trim() }, ...contacts]; setContacts(next); persist({ contacts: next }); setContactName(""); setContactIdentity(""); toast.success(t.contactAdded) }
  function requestCall(to: string, type: "voice" | "video") { if (!to.trim()) return toast.error(t.required); const next = [{ id: id(), to: to.trim(), type, status: "sent" as const, createdAt: now() }, ...calls]; setCalls(next); persist({ calls: next }); toast.success(t.callSent) }
  function saveSettings() { persist({ displayName, language, privacy, blocked }); toast.success(t.saved) }
  function addBlocked() { if (!blockedInput.trim()) return; const next = Array.from(new Set([blockedInput.trim(), ...blocked])); setBlocked(next); setBlockedInput(""); persist({ blocked: next }) }

  if (!user) {
    return <main dir={direction} className="min-h-screen bg-gradient-to-br from-background via-background to-muted px-4 py-8"><section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center"><div className="space-y-6"><div className="flex flex-wrap items-center gap-2"><Badge className="w-fit" variant="secondary">{t.badge}</Badge><Button variant="outline" size="sm" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Globe2 className="mr-2 h-4 w-4" />{language === "ar" ? "English" : "العربية"}</Button></div><div className="space-y-3"><h1 className="text-4xl font-bold tracking-tight md:text-6xl">{t.appName}</h1><p className="text-xl font-medium">{t.hero}</p><p className="max-w-2xl text-lg text-muted-foreground">{t.intro}</p></div><div className="flex flex-wrap gap-3 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Sign in with Pi only</span><span className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Inbox</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Pi Browser ready</span></div></div><Card><CardHeader><CardTitle>{t.signInTitle}</CardTitle><CardDescription>{t.signInDescription}</CardDescription></CardHeader><CardContent className="space-y-4"><Button className="w-full" size="lg" onClick={handleSignIn} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}{t.signIn}</Button>{authError && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{authError}<p className="mt-2 text-muted-foreground">{t.sdkUnavailable}</p></div>}<p className="text-xs text-muted-foreground">{t.noManual}</p><p className="text-xs text-muted-foreground">SDK status: {isPiSdkAvailable() ? "available" : "not loaded"}</p></CardContent></Card></section></main>
  }

  return <div dir={direction} className="min-h-screen bg-background"><header className="border-b bg-card"><div className="container mx-auto flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"><div><h1 className="text-2xl font-bold">{t.appName}</h1><p className="text-sm text-muted-foreground">{t.signedAs} @{user.username}</p></div><div className="flex flex-wrap items-center gap-2"><Button variant="outline" size="sm" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Globe2 className="mr-2 h-4 w-4" />{language === "ar" ? "English" : "العربية"}</Button><div className="rounded-lg bg-muted px-3 py-2 text-xs font-mono" title={identity}>{shortIdentity(identity)}</div></div></div></header><main className="container mx-auto max-w-6xl px-4 py-6"><div className="mb-6 grid gap-4 md:grid-cols-4"><Stat label={t.unread} value={unreadCount} /><Stat label={t.messages} value={messages.length} /><Stat label={t.totalContacts} value={contacts.length} /><Stat label={t.totalCalls} value={calls.length} /></div><Tabs defaultValue="inbox"><TabsList className="mb-4 flex h-auto flex-wrap justify-start"><TabsTrigger value="inbox"><Inbox className="mr-2 h-4 w-4" />{t.inbox}</TabsTrigger><TabsTrigger value="compose"><MailPlus className="mr-2 h-4 w-4" />{t.compose}</TabsTrigger><TabsTrigger value="sent"><Send className="mr-2 h-4 w-4" />{t.sent}</TabsTrigger><TabsTrigger value="archive"><Archive className="mr-2 h-4 w-4" />{t.archive}</TabsTrigger><TabsTrigger value="trash"><Trash2 className="mr-2 h-4 w-4" />{t.trash}</TabsTrigger><TabsTrigger value="contacts"><UserPlus className="mr-2 h-4 w-4" />{t.contacts}</TabsTrigger><TabsTrigger value="calls"><Phone className="mr-2 h-4 w-4" />{t.calls}</TabsTrigger><TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />{t.settings}</TabsTrigger></TabsList><TabsContent value="inbox"><MessageList t={t} messages={messages.filter((m) => m.folder === "inbox")} onRead={markRead} onMove={moveMessage} /></TabsContent><TabsContent value="sent"><MessageList t={t} messages={messages.filter((m) => m.folder === "sent")} onRead={markRead} onMove={moveMessage} /></TabsContent><TabsContent value="archive"><MessageList t={t} messages={messages.filter((m) => m.folder === "archive")} onRead={markRead} onMove={moveMessage} /></TabsContent><TabsContent value="trash"><MessageList t={t} messages={messages.filter((m) => m.folder === "trash")} onRead={markRead} onMove={moveMessage} /></TabsContent><TabsContent value="compose"><Card><CardHeader><CardTitle>{t.compose}</CardTitle><CardDescription>{t.newMessageDesc}</CardDescription></CardHeader><CardContent className="space-y-4"><Field label={t.recipient}><Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="pi:uid or wallet address" /></Field><Field label={t.subject}><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field><Field label={t.message}><Textarea rows={7} value={body} onChange={(e) => setBody(e.target.value)} /></Field><Button onClick={sendMessage}><Send className="mr-2 h-4 w-4" />{t.sendMessage}</Button></CardContent></Card></TabsContent><TabsContent value="contacts"><div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]"><Card><CardHeader><CardTitle>{t.addContact}</CardTitle></CardHeader><CardContent className="space-y-3"><Input placeholder={t.displayName} value={contactName} onChange={(e) => setContactName(e.target.value)} /><Input placeholder={t.piIdentity} value={contactIdentity} onChange={(e) => setContactIdentity(e.target.value)} /><Button onClick={addContact} className="w-full"><UserPlus className="mr-2 h-4 w-4" />{t.add}</Button></CardContent></Card><Card><CardHeader><CardTitle>{t.contacts}</CardTitle></CardHeader><CardContent className="space-y-3">{contacts.length === 0 && <p className="text-sm text-muted-foreground">{t.noContacts}</p>}{contacts.map((contact) => <div key={contact.id} className="rounded-lg border p-3"><div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><p className="font-medium">{contact.name}</p><p className="text-xs text-muted-foreground">{contact.identity}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setRecipient(contact.identity)}>{t.messageAction}</Button><Button size="sm" variant="outline" onClick={() => requestCall(contact.identity, "voice")}>{t.voice}</Button><Button size="sm" variant="outline" onClick={() => requestCall(contact.identity, "video")}>{t.video}</Button></div></div></div>)}</CardContent></Card></div></TabsContent><TabsContent value="calls"><Card><CardHeader><CardTitle>{t.callRequests}</CardTitle><CardDescription>{t.callDesc}</CardDescription></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 md:grid-cols-[1fr_auto_auto]"><Input placeholder={t.recipient} value={recipient} onChange={(e) => setRecipient(e.target.value)} /><Button variant="outline" onClick={() => requestCall(recipient, "voice")}><Phone className="mr-2 h-4 w-4" />{t.voice}</Button><Button variant="outline" onClick={() => requestCall(recipient, "video")}><Video className="mr-2 h-4 w-4" />{t.video}</Button></div><Separator />{calls.length === 0 && <p className="text-sm text-muted-foreground">{t.noCalls}</p>}{calls.map((call) => <div key={call.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><div><p className="font-medium">{call.type === "voice" ? t.voice : t.video} {shortIdentity(call.to)}</p><p className="text-xs text-muted-foreground">{new Date(call.createdAt).toLocaleString(language === "ar" ? "ar" : "en")}</p></div><Badge variant="secondary">{call.status}</Badge></div>)}</CardContent></Card></TabsContent><TabsContent value="settings"><Card><CardHeader><CardTitle>{t.settings}</CardTitle><CardDescription>{t.ecosystemText}</CardDescription></CardHeader><CardContent className="space-y-5"><Field label={t.displayName}><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></Field><Field label={t.language}><div className="flex gap-2"><Button variant={language === "ar" ? "default" : "outline"} onClick={() => setLanguage("ar")}>{t.arabic}</Button><Button variant={language === "en" ? "default" : "outline"} onClick={() => setLanguage("en")}>{t.english}</Button></div></Field><Field label={t.privacy}><div className="flex flex-wrap gap-2"><Button variant={privacy === "everyone" ? "default" : "outline"} onClick={() => setPrivacy("everyone")}>{t.everyone}</Button><Button variant={privacy === "contacts" ? "default" : "outline"} onClick={() => setPrivacy("contacts")}>{t.contactsOnly}</Button></div></Field><Field label={t.blocked}><div className="flex gap-2"><Input placeholder={t.blockPlaceholder} value={blockedInput} onChange={(e) => setBlockedInput(e.target.value)} /><Button variant="outline" onClick={addBlocked}>{t.block}</Button></div><div className="mt-2 flex flex-wrap gap-2">{blocked.map((item) => <Badge key={item} variant="secondary">{shortIdentity(item)}</Badge>)}</div></Field><Card className="bg-muted/40"><CardHeader><CardTitle className="text-base">{t.ecosystem}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{t.ecosystemText}<br />Access token present: {accessToken ? "yes" : "no"}</CardContent></Card><Button onClick={saveSettings}>{t.save}</Button></CardContent></Card></TabsContent></Tabs></main></div>
}

function Stat({ label, value }: { label: string; value: number }) { return <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></CardContent></Card> }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div> }
function MessageList({ messages, onRead, onMove, t }: { messages: AppMessage[]; onRead: (id: string) => void; onMove: (id: string, folder: Folder) => void; t: (typeof dictionary)[Language] }) { if (messages.length === 0) return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{t.noMessages}</CardContent></Card>; return <Card><CardContent className="space-y-3 p-4">{messages.map((message) => <div key={message.id} className="rounded-lg border p-4"><div className="mb-2 flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><div className="flex items-center gap-2">{!message.read && <span className="h-2 w-2 rounded-full bg-primary" />}<h3 className="font-semibold">{message.subject}</h3></div><p className="text-xs text-muted-foreground">{t.from} {shortIdentity(message.from)} {t.to} {shortIdentity(message.to)} · {new Date(message.createdAt).toLocaleString()}</p></div><div className="flex gap-2"><Button size="icon" variant="ghost" onClick={() => onRead(message.id)}><CheckCircle2 className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => onMove(message.id, "archive")}><Archive className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => onMove(message.id, "trash")}><Trash2 className="h-4 w-4" /></Button></div></div><p className="whitespace-pre-wrap text-sm">{message.body}</p></div>)}</CardContent></Card> }
