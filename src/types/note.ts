// Interface defining the structure of a Note
export interface Note {
    id: string;
    title: string;
    content: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
} 