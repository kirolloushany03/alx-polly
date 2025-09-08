import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import EditPollForm from './EditPollForm';

async function getPoll(id: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    return { poll: null, error };
  }
  return { poll: data, error: null };
}

async function getCurrentUser() {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export default async function EditPollPage({ params }: { params: { id: string } }) {
  const { poll, error } = await getPoll(params.id);
  const user = await getCurrentUser();

  if (error || !poll) {
    notFound();
  }

  if (poll.user_id !== user?.id) {
    redirect('/polls');
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Poll</h1>
      <EditPollForm poll={poll} />
    </div>
  );
}