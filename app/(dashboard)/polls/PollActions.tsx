"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/context/auth-context";
import { Button } from "@/components/ui/button";

interface Poll {
  id: string;
  question: string;
  options: any[];
  user_id: string;
}

interface PollActionsProps {
  poll: Poll;
}

/**
 * Renders a card for a single poll, including actions like editing and deleting.
 * The edit and delete buttons are only shown to the user who owns the poll.
 * @param {PollActionsProps} props - The component props, containing the poll data.
 */
export default function PollActions({ poll }: PollActionsProps) {
  const { user } = useAuth();

  /**
   * Handles the deletion of the poll.
   * It prompts the user for confirmation before calling the deletePoll server action.
   */
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this poll?")) {
      await fetch(`/api/polls/${poll.id}`, { method: 'DELETE' });
      // Reload the page to reflect the deletion.
      window.location.reload();
    }
  };

  return (
    <div className="border rounded-md shadow-md hover:shadow-lg transition-shadow bg-white">
      <Link href={`/polls/${poll.id}`}>
        <div className="group p-4">
          <div className="h-full">
            <div>
              <h2 className="group-hover:text-blue-600 transition-colors font-bold text-lg">
                {poll.question}
              </h2>
              <p className="text-slate-500">{poll.options.length} options</p>
            </div>
          </div>
        </div>
      </Link>
      {/* Show edit and delete buttons only if the current user is the owner of the poll. */}
      {user && user.id === poll.user_id && (
        <div className="flex gap-2 p-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
