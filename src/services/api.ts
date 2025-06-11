import { Note } from '@/types/note';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  async getNotes(token: string): Promise<Note[]> {
    console.log('Making API request:', {
      endpoint: `${API_URL}/api/notes`,
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? token.substring(0, 20) + '...' : null
    });

    const response = await fetch(`${API_URL}/api/notes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for server components
    });

    if (!response.ok) {
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error('Failed to fetch notes');
    }

    return response.json();
  }

  async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Note> {
    const response = await fetch(`${API_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error('Failed to create note');
    }

    return response.json();
  }

  async updateNote(id: string, noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Note> {
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error('Failed to update note');
    }

    return response.json();
  }

  async deleteNote(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
  }
}

export const api = new ApiService(); 