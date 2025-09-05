"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Creates a new poll.
 * This server action handles form submission for creating a new poll.
 * It validates the input, ensures the user is authenticated, and inserts the new poll into the database.
 * @param formData - The form data from the poll creation form.
 * @returns An object with an error property if creation fails, otherwise null.
 */
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // Validate that the question and at least two options are provided.
  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Ensure the user is authenticated before creating a poll.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question,
      options,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  // Revalidate the polls page to show the new poll.
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Fetches all polls created by the currently authenticated user.
 * @returns An object containing the user's polls and an error property if fetching fails.
 */
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

/**
 * Fetches a single poll by its ID.
 * This action does not perform any ownership checks, so it can be used for public poll pages.
 * @param id - The ID of the poll to fetch.
 * @returns An object containing the poll data and an error property if fetching fails.
 */
export async function getPollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

/**
 * Submits a vote for a specific poll option.
 * It ensures that a user is logged in and has not already voted on the poll.
 * @param pollId - The ID of the poll being voted on.
 * @param optionIndex - The index of the option being voted for.
 * @returns An object with an error property if voting fails, otherwise null.
 */
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to vote." };

  // Check if the user has already voted on this poll to prevent duplicates.
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("poll_id", pollId)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    return { error: "You have already voted on this poll." };
  }

  // Insert the new vote into the database.
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user.id,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Deletes a poll.
 * This action includes an ownership check to ensure that only the poll's creator can delete it.
 * @param id - The ID of the poll to delete.
 * @returns An object with an error property if deletion fails, otherwise null.
 */
export async function deletePoll(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to delete a poll." };
  }

  // Ensure that the user deleting the poll is the owner.
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Updates an existing poll.
 * This action includes an ownership check to ensure that only the poll's creator can update it.
 * @param pollId - The ID of the poll to update.
 * @param formData - The form data containing the updated question and options.
 * @returns An object with an error property if the update fails, otherwise null.
 */
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // Ensure that the user updating the poll is the owner.
  const { error } = await supabase
    .from("polls")
    .update({ question, options })
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/polls/${pollId}`);
  revalidatePath("/polls");
  return { error: null };
}
