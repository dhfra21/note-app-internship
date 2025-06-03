'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar } from '@mui/material';
import { useRouter } from 'next/navigation';
import NoteForm from '../../components/NoteForm';
import NoteCard from '../../components/NoteCard';
import { Note } from '../../types/note';
import { api, NoteInput } from '../../services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function NotesPage() {
    const router = useRouter();
    const { token, isAuthenticated } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [editingNote, setEditingNote] = useState<Note | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchNotes();
    }, [isAuthenticated, router]);

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

    // Handle creating a new note
    const handleCreateNote = async (noteData: NoteInput) => {
        if (!token) return;
        try {
            const newNote = await api.createNote(noteData, token);
            setNotes([...notes, newNote]);
        } catch (err) {
            setError('Failed to create note');
        }
    };

    // Handle updating an existing note
    const handleUpdateNote = async (noteData: NoteInput) => {
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

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
                My Notes
            </Typography>
            
            <NoteForm
                note={editingNote}
                onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
                onCancel={() => setEditingNote(undefined)}
            />

            <Box sx={{ mt: 4 }}>
                {loading ? (
                    <Typography>Loading notes...</Typography>
                ) : notes.length === 0 ? (
                    <Typography>No notes yet. Create your first note!</Typography>
                ) : (
                    notes.map((note) => (
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
        </Container>
    );
} 