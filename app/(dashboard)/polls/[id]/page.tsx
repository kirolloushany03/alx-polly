'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getPollById, submitVote } from '@/app/lib/actions/poll-actions';
import { Poll } from '@/app/lib/types';

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

  useEffect(() => {
    /**
     * Fetches the poll data from the server.
     */
    const fetchPoll = async () => {
      const { poll: fetchedPoll, error } = await getPollById(params.id);
      if (error || !fetchedPoll) {
        setError('Poll not found.');
      } else {
        setPoll(fetchedPoll as any);
        // Initialize votes count to 0 for each option.
        setVotes(new Array((fetchedPoll as any).options.length).fill(0));
      }
    };

    fetchPoll();
  }, [params.id]);

  /**
   * Handles the vote submission.
   * It calls the submitVote server action and updates the UI to show the results.
   */
  const handleVote = async () => {
    if (selectedOption === null) return;
    
    setIsSubmitting(true);
    setError(null);

    const result = await submitVote(params.id, selectedOption);

    if (result?.error) {
      setError(result.error);
    } else {
      setHasVoted(true);
      // This is a simplified representation of vote results.
      // In a real app, you would refetch the vote counts or update them based on the response.
      const newVotes = [...votes];
      newVotes[selectedOption] += 1;
      setVotes(newVotes);
    }
    setIsSubmitting(false);
  };

  /**
   * Calculates the percentage of votes for a given option.
   * @param optionVotes - The number of votes for the option.
   * @param totalVotes - The total number of votes for the poll.
   * @returns The percentage of votes.
   */
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
          <Button variant="outline" className="text-red-500 hover:text-red-700">
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.question}</CardTitle>
          <CardDescription>{(poll as any).description || 'Vote for your favorite option below.'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasVoted ? (
            <div className="space-y-3">
              {(poll as any).options.map((option: string, index: number) => (
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
              {(poll as any).options.map((option: string, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option}</span>
                    <span>{getPercentage(votes[index], totalVotes)}% ({votes[index]} votes)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${getPercentage(votes[index], totalVotes)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="text-sm text-slate-500 pt-2">
                Total votes: {totalVotes}
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardContent>
        <CardFooter className="text-sm text-slate-500 flex justify-between">
          <span>Created on {new Date((poll as any).created_at).toLocaleDateString()}</span>
        </CardFooter>
      </Card>

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4">Share this poll</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            Copy Link
          </Button>
          <Button variant="outline" className="flex-1">
            Share on Twitter
          </Button>
        </div>
      </div>
    </div>
  );
}