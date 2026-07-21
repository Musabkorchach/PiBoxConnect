import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .select(`
      id,
      status,
      created_at,
      contact_profile:contact_profile_id (
        id,
        pi_uid,
        username,
        display_name,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    contacts: data ?? [],
  });
}