import { useState, useEffect } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { Note, noteSchema, NoteInput } from '../schemas/note';

interface NoteFormProps {
    note?: Note;
    onSubmit: (note: NoteInput) => void;
    onCancel: () => void;
}

// Component for creating and editing notes
const NoteForm: React.FC<NoteFormProps> = ({ note, onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

    // Initialize form with note data if editing
    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
        }
    }, [note]);

    // Validate form data using Zod
    const validateForm = (): boolean => {
        try {
            noteSchema.parse({ title, content });
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof Error) {
                const zodError = error as any;
                const newErrors: { title?: string; content?: string } = {};
                
                zodError.errors?.forEach((err: any) => {
                    if (err.path.includes('title')) {
                        newErrors.title = err.message;
                    }
                    if (err.path.includes('content')) {
                        newErrors.content = err.message;
                    }
                });
                
                setErrors(newErrors);
            }
            return false;
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            onSubmit({ title, content });
            if (!note) {
                setTitle('');
                setContent('');
            }
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, p: 2, borderRadius: 1, boxShadow: 1, backgroundColor: 'background.paper' }}>
            <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                margin="normal"
                required
                error={!!errors.title}
                helperText={errors.title}
            />
            <TextField
                fullWidth
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                margin="normal"
                required
                multiline
                rows={4}
                error={!!errors.content}
                helperText={errors.content}
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" color="primary">
                    {note ? 'Update Note' : 'Create Note'}
                </Button>
                {note ? (
                    <Button onClick={onCancel} variant="outlined">
                        Cancel
                    </Button>
                ) : null}
            </Box>
        </Box>
    );
};

export default NoteForm; 