const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteInput {
  title: string;
  content: string;
}

export const api = {
  async getNotes(token: string): Promise<Note[]> {
    const response = await fetch(`${API_URL}/notes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch notes');
    return response.json();
  },

  async createNote(note: NoteInput, token: string): Promise<Note> {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(note),
    });
    if (!response.ok) throw new Error('Failed to create note');
    return response.json();
  },

  async updateNote(id: string, note: NoteInput, token: string): Promise<Note> {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(note),
    });
    if (!response.ok) throw new Error('Failed to update note');
    return response.json();
  },

  async deleteNote(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete note');
  },
}; 