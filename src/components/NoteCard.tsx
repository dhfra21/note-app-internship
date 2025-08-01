import { Card, CardContent, CardActions, Typography, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Note } from '../schemas/note';

interface NoteCardProps {
    note: Note;
    onEdit?: (note: Note) => void;
    onDelete: (id: string) => void;
}

// Format date in a consistent way
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Component for displaying a single note card
const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {

    return (
        <Card sx={{ minWidth: 275, mb: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {note.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {note.content}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Last updated: {formatDate(new Date(note.updatedAt))}
                </Typography>
            </CardContent>
            <CardActions>
                {onEdit ? (
                    <IconButton onClick={() => onEdit(note)} size="small">
                        <EditIcon />
                    </IconButton>
                ) : null}
                <IconButton onClick={() => onDelete(note.id)} size="small">
                    <DeleteIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default NoteCard; 