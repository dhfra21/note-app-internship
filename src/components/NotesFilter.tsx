import React from 'react';
import { TextField, Box, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';

interface NotesFilterProps {
  onSearchChange: (value: string) => void;
  onDateFilterChange: (value: string) => void;
}

const NotesFilter: React.FC<NotesFilterProps> = ({ onSearchChange, onDateFilterChange }) => {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 3,
        backgroundColor: 'white',
        width: '100%',
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <TextField
          fullWidth
          label="Search Notes"
          variant="outlined"
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ 
            flex: 1, 
            minWidth: '200px',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white'
            }
          }}
          size="medium"
        />
        <FormControl 
          sx={{ 
            minWidth: '200px',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white'
            }
          }} 
          size="medium"
        >
          <InputLabel>Filter by Date</InputLabel>
          <Select
            label="Filter by Date"
            onChange={(e) => onDateFilterChange(e.target.value)}
            defaultValue=""
          >
            <MenuItem value="">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default NotesFilter; 