"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * A client component form for creating a new poll.
 * It manages the poll's question and options, handles form submission,
 * and displays error or success messages.
 */
export default function PollCreateForm() {
  // State to hold the poll question.
  const [question, setQuestion] = useState("");
  // State to hold the list of poll options.
  const [options, setOptions] = useState(["", ""]);
  // State for storing any errors that occur during poll creation.
  const [error, setError] = useState<string | null>(null);
  // State to indicate whether the poll was created successfully.
  const [success, setSuccess] = useState(false);

  /**
   * Updates the value of a specific poll option.
   * @param idx - The index of the option to update.
   * @param value - The new value for the option.
   */
  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  /**
   * Adds a new, empty option field to the form.
   */
  const addOption = () => setOptions((opts) => [...opts, ""]);

  /**
   * Removes an option field from the form.
   * Ensures that there are always at least two options.
   * @param idx - The index of the option to remove.
   */
  const removeOption = (idx: number) => {
    if (options.length > 2) {
      setOptions((opts) => opts.filter((_, i) => i !== idx));
    }
  };

  /**
   * Handles the form submission to create a new poll.
   * @param e - The form event.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        options: options.filter(Boolean), // Filter out empty options
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
    } else {
      setSuccess(true);
      // Redirect to the polls page after a short delay to show the success message.
      setTimeout(() => {
        window.location.href = "/polls";
      }, 1200);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input
          name="question"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Options</Label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              name="options"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
            {/* Only show the remove button if there are more than two options. */}
            {options.length > 2 && (
              <Button type="button" variant="destructive" onClick={() => removeOption(idx)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={addOption} variant="secondary">
          Add Option
        </Button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Poll created! Redirecting...</div>}
      <Button type="submit">Create Poll</Button>
    </form>
  );
}