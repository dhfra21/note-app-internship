'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar } from '@mui/material';
import NoteForm from '../components/NoteForm';
import NoteCard from '../components/NoteCard';
import NotesFilter from '../components/NotesFilter';
import { Note } from '../types/note';
import { api } from '../services/api';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
    const router = useRouter();
    const { token, isAuthenticated } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [editingNote, setEditingNote] = useState<Note | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchNotes();
    }, [isAuthenticated, router]);

    // Filter notes whenever notes, searchQuery, or dateFilter changes
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
                startDate = null; // All Time
        }

        const filtered = notes.filter(note => {
            const titleMatch = note.title.toLowerCase().includes(lowerCaseQuery);

            if (!startDate) {
                return titleMatch; // Only apply title filter if no date filter is selected
            }

            try {
                const noteDate = new Date(note.updatedAt);
                const dateMatch = noteDate >= startDate;
                return titleMatch && dateMatch;
            } catch (e) {
                console.error('Error parsing date for note:', note, e);
                return titleMatch; // Include note if date parsing fails
            }
        });
        
        setFilteredNotes(filtered);
    }, [notes, searchQuery, dateFilter]);

    const fetchNotes = async () => {
        if (!token) return;
        try {
            const fetchedNotes = await api.getNotes(token);
            setNotes(fetchedNotes);
        } catch (err) {
            setError('Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    };

    // Handlers for search and filter changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleDateFilterChange = (value: string) => {
        setDateFilter(value);
    };

    // Handle creating a new note
    const handleCreateNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!token) return;
        try {
            const newNote = await api.createNote(noteData, token);
            setNotes([...notes, newNote]);
        } catch (err) {
            setError('Failed to create note');
        }
    };

    // Handle updating an existing note
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

    // Handle deleting a note
    const handleDeleteNote = async (id: string) => {
        if (!token) return;
        try {
            await api.deleteNote(id, token);
            setNotes(notes.filter((note) => note.id !== id));
        } catch (err) {
            setError('Failed to delete note');
        }
    };

    // Handle editing a note
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
