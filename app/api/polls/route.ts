
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be logged in to create a poll." }, { status: 401 });
  }

  const { question, options } = await req.json();

  if (!question || !options || options.length < 2) {
    return NextResponse.json({ error: "Please provide a question and at least two options." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("polls")
    .insert([{ user_id: user.id, question, options }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/polls");
  return NextResponse.json(data, { status: 201 });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ polls: [], error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ polls: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ polls: data ?? [] }, { status: 200 });
}
