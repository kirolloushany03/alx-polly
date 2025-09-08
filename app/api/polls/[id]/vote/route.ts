
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be logged in to vote." }, { status: 401 });
  }

  const { optionIndex } = await req.json();

  if (optionIndex === undefined || optionIndex === null) {
    return NextResponse.json({ error: "Please select an option to vote." }, { status: 400 });
  }

  // Check if the user has already voted on this poll to prevent duplicates.
  const { data: existingVote, error: existingVoteError } = await supabase
    .from("votes")
    .select("id")
    .eq("poll_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    return NextResponse.json({ error: "You have already voted on this poll." }, { status: 409 });
  }

  // Insert the new vote into the database.
  const { data, error } = await supabase
    .from("votes")
    .insert([
      {
        poll_id: params.id,
        user_id: user.id,
        option_index: optionIndex,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
