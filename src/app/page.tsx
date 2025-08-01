import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NotesClient from '@/components/NotesClient';
import { api } from '@/services/api';

async function getNotes() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const response = await api.getNotes(token);
    return response.data; // Return just the notes array for initial load
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return [];
  }
}

export default async function Home() {
  const initialNotes = await getNotes();

  return <NotesClient initialNotes={initialNotes} />;
}
