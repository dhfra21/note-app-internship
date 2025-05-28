'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar } from '@mui/material';
import NoteForm from '../components/NoteForm';
import NoteCard from '../components/NoteCard';
import { Note } from '../types/note';
import { api } from '../services/api';

export default function Home() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [editingNote, setEditingNote] = useState<Note | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch notes on component mount
    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const fetchedNotes = await api.getNotes();
            setNotes(fetchedNotes);
        } catch (err) {
            setError('Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    };

    // Handle creating a new note
    const handleCreateNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newNote = await api.createNote(noteData);
            setNotes([...notes, newNote]);
        } catch (err) {
            setError('Failed to create note');
        }
    };

    // Handle updating an existing note
    const handleUpdateNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingNote) {
            try {
                const updatedNote = await api.updateNote(editingNote.id, noteData);
                setNotes(notes.map((note) =>
                    note.id === editingNote.id ? updatedNote : note
                ));
                setEditingNote(undefined);
            } catch (err) {
                setError('Failed to update note');
            }
        }
    };

    // Handle deleting a note
    const handleDeleteNote = async (id: string) => {
        try {
            await api.deleteNote(id);
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
