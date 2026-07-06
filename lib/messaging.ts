import { supabase } from "@/lib/supabase"

export interface Message {
  id: string
  from: string
  to: string
  subject?: string
  content: string
  timestamp: number
  read: boolean
}

function mapDbMessage(row: any): Message {
  return {
    id: row.id,
    from: row.sender,
    to: row.receiver,
    subject: row.subject ?? "",
    content: row.content,
    timestamp: new Date(row.created_at).getTime(),
    read: row.is_read ?? false,
  }
}

export async function syncInbox(identity?: string): Promise<Message[]> {
  if (!identity) return []

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("receiver", identity)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("syncInbox error:", error)
    return []
  }

  return (data ?? []).map(mapDbMessage)
}

export async function syncSent(identity?: string): Promise<Message[]> {
  if (!identity) return []

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("sender", identity)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("syncSent error:", error)
    return []
  }

  return (data ?? []).map(mapDbMessage)
}

export async function sendRealMessage(input: {
  from: string
  to: string
  subject?: string
  content: string
}): Promise<Message | null> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender: input.from,
      receiver: input.to,
      subject: input.subject ?? "",
      content: input.content,
      is_read: false,
    })
    .select("*")
    .single()

  if (error) {
    console.error("sendRealMessage error:", error)
    return null
  }

  return mapDbMessage(data)
}

export async function markMessageRead(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", id)

  if (error) {
    console.error("markMessageRead error:", error)
    return false
  }

  return true
}