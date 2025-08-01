'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import NoteForm from './NoteForm';
import NoteCard from './NoteCard';
import NotesFilter from './NotesFilter';
import Pagination from './Pagination';
import { Note } from '../schemas/note';
import { PaginationQuery } from '../schemas/pagination';
import { api } from '../services/api';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface NotesClientProps {
  initialNotes: Note[];
}

export default function NotesClient({ initialNotes }: NotesClientProps) {
    const router = useRouter();
    const { token, isAuthenticated, isLoading } = useAuth();
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [editingNote, setEditingNote] = useState<Note | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    
    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: initialNotes.length,
        totalPages: Math.ceil(initialNotes.length / 10),
        hasNext: false,
        hasPrev: false,
    });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading spinner while auth is being checked
    if (isLoading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading...
                </Typography>
            </Container>
        );
    }

    // Fetch notes with pagination
    const fetchNotes = async (query: Partial<PaginationQuery> = {}) => {
        if (!token) return;
        
        try {
            setLoading(true);
            const response = await api.getNotes(token, {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
                sortBy: 'updatedAt',
                sortOrder: 'desc',
                ...query,
            });
            
            setNotes(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    };

    // Handle pagination changes
    const handlePageChange = (newPage: number) => {
        fetchNotes({ page: newPage });
    };

    const handleLimitChange = (newLimit: number) => {
        fetchNotes({ page: 1, limit: newLimit });
    };

    // Handle search changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        fetchNotes({ page: 1, search: value });
    };

    const handleDateFilterChange = (value: string) => {
        setDateFilter(value);
        // Reset to first page when filter changes
        fetchNotes({ page: 1 });
    };

    const handleCreateNote = async (noteData: { title: string; content: string }) => {
        if (!token) return;
        try {
            const newNote = await api.createNote(noteData, token);
            // Refresh the current page after creating a note
            fetchNotes();
        } catch (err) {
            setError('Failed to create note');
        }
    };

    const handleUpdateNote = async (noteData: { title: string; content: string }) => {
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
            // Refresh the current page after deleting a note
            fetchNotes();
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : notes.length === 0 ? (
                    <Typography>No notes yet. Create your first note!</Typography>
                ) : (
                    <>
                        {notes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onEdit={handleEditNote}
                                onDelete={handleDeleteNote}
                            />
                        ))}
                        
                        <Pagination
                            page={pagination.page}
                            limit={pagination.limit}
                            total={pagination.total}
                            totalPages={pagination.totalPages}
                            hasNext={pagination.hasNext}
                            hasPrev={pagination.hasPrev}
                            onPageChange={handlePageChange}
                            onLimitChange={handleLimitChange}
                        />
                    </>
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
                <Link href="/profile">
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Go to Profile
                    </button>
                </Link>
            </div>
        </Container>
    );
} 