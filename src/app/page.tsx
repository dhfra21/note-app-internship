import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NotesClient from '@/components/NotesClient';
import { api } from '@/services/api';

export default async function Home() {
  // Immediate authentication check - redirect before any other logic
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  // If we get here, user is authenticated
  try {
    const notes = await api.getNotes(token);
    return <NotesClient initialNotes={notes} />;
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return <NotesClient initialNotes={[]} />;
  }
}
