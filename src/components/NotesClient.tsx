'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar } from '@mui/material';
import NoteForm from './NoteForm';
import NoteCard from './NoteCard';
import NotesFilter from './NotesFilter';
import { Note } from '../types/note';
import { api } from '../services/api';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface NotesClientProps {
  initialNotes: Note[];
}

export default function NotesClient({ initialNotes }: NotesClientProps) {
    const router = useRouter();
    const { token, isAuthenticated } = useAuth();
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>(initialNotes);
    const [editingNote, setEditingNote] = useState<Note | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        
        const now = new Date();
        let startDate = null;

        switch (dateFilter) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                const firstDayOfWeek = now.getDate() - now.getDay();
                startDate = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = null;
        }

        const filtered = notes.filter(note => {
            const titleMatch = note.title.toLowerCase().includes(lowerCaseQuery);

            if (!startDate) {
                return titleMatch;
            }

            try {
                const noteDate = new Date(note.updatedAt);
                const dateMatch = noteDate >= startDate;
                return titleMatch && dateMatch;
            } catch (e) {
                console.error('Error parsing date for note:', note, e);
                return titleMatch;
            }
        });
        
        setFilteredNotes(filtered);
    }, [notes, searchQuery, dateFilter]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleDateFilterChange = (value: string) => {
        setDateFilter(value);
    };

    const handleCreateNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!token) return;
        try {
            const newNote = await api.createNote(noteData, token);
            setNotes([...notes, newNote]);
        } catch (err) {
            setError('Failed to create note');
        }
    };

    const handleUpdateNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!token || !editingNote) return;
        try {
            const updatedNote = await api.updateNote(editingNote.id, noteData, token);
            setNotes(notes.map((note) =>
                note.id === editingNote.id ? updatedNote : note
            ));
            setEditingNote(undefined);
        } catch (err) {
            setError('Failed to update note');
        }
    };

    const handleDeleteNote = async (id: string) => {
        if (!token) return;
        try {
            await api.deleteNote(id, token);
            setNotes(notes.filter((note) => note.id !== id));
        } catch (err) {
            setError('Failed to delete note');
        }
    };

    const handleEditNote = (note: Note) => {
        setEditingNote(note);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
                My Notes
            </Typography>
            
            <NotesFilter 
                onSearchChange={handleSearchChange}
                onDateFilterChange={handleDateFilterChange}
            />

            <NoteForm
                note={editingNote}
                onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
                onCancel={() => setEditingNote(undefined)}
            />

            <Box sx={{ mt: 4 }}>
                {loading ? (
                    <Typography>Loading notes...</Typography>
                ) : filteredNotes.length === 0 ? (
                    <Typography>No notes yet. Create your first note!</Typography>
                ) : (
                    filteredNotes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onEdit={handleEditNote}
                            onDelete={handleDeleteNote}
                        />
                    ))
                )}
            </Box>

            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>

            <div className="space-x-4">
                <Link href="/notes">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Go to Notes
                    </button>
                </Link>
                <Link href="/profile">
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Go to Profile
                    </button>
                </Link>
            </div>
        </Container>
    );
} 