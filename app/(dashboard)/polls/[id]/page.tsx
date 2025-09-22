'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import VulnerableShare from '../share';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';


// Simplified poll type to match the data structure from the API
interface Poll {
  id: string;
  question: string;
  options: string[];
  description?: string;
  created_at: string;
  votes: { option_index: number }[];
}

/**
 * Renders the detailed view of a single poll, allowing users to vote and see results.
 * This page fetches poll data on the client side and handles the voting process.
 * @param {object} props - The component props.
 * @param {object} props.params - The route parameters, containing the poll ID.
 * @param {string} props.params.id - The ID of the poll to display.
 */
export default function PollDetailPage({ params }: { params: { id: string } }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<number[]>([]);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await fetch(`/api/polls/${params.id}`);
        if (!res.ok) {
          throw new Error("Poll not found.");
        }
        const data = await res.json();
        setPoll(data.poll);

        // Initialize votes count based on fetched votes
        const initialVotes = new Array(data.poll.options.length).fill(0);
        data.poll.votes.forEach((vote: { option_index: number }) => {
          initialVotes[vote.option_index]++;
        });
        setVotes(initialVotes);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchPoll();
  }, [params.id]);

  const handleVote = async () => {
    if (selectedOption === null) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/polls/${params.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionIndex: selectedOption }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit vote.");
      }

      setHasVoted(true);
      const newVotes = [...votes];
      newVotes[selectedOption] += 1;
      setVotes(newVotes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPercentage = (optionVotes: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((optionVotes / totalVotes) * 100);
  };

  if (!poll) {
    return <div>Loading poll...</div>;
  }

  const totalVotes = votes.reduce((sum, count) => sum + count, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/polls" className="text-blue-600 hover:underline">
          &larr; Back to Polls
        </Link>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/polls/${params.id}/edit`}>Edit Poll</Link>
          </Button>
          <Button variant="outline" onClick={() => setShowShare(!showShare)}>
            Share
          </Button>
        </div>
      </div>

      {showShare && poll && (
        <VulnerableShare pollId={poll.id} pollTitle={poll.question} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.question}</CardTitle>
          <CardDescription>{poll.description || 'Vote for your favorite option below.'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasVoted ? (
            <div className="space-y-3">
              {poll.options.map((option: string, index: number) => (
                <div
                  key={index}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedOption === index ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}
                  onClick={() => setSelectedOption(index)}
                >
                  {option}
                </div>
              ))}
              <Button
                onClick={handleVote}
                disabled={selectedOption === null || isSubmitting}
                className="mt-4"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Results:</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={poll.options.map((option, index) => ({ name: option, votes: votes[index] }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="votes" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-slate-500 pt-2">
                Total votes: {totalVotes}
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardContent>
        <CardFooter className="text-sm text-slate-500 flex justify-between">
          <span>Created on {new Date(poll.created_at).toLocaleDateString()}</span>
        </CardFooter>
      </Card>
    </div>
  );
}