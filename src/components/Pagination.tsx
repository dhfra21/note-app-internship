import React from 'react';
import { Box, Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ChevronLeft, ChevronRight, FirstPage, LastPage } from '@mui/icons-material';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  limit,
  total,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
  onLimitChange,
}) => {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const handleLimitChange = (event: any) => {
    onLimitChange(event.target.value);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (total === 0) {
    return null;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mt: 3, 
      p: 2,
      backgroundColor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1
    }}>
      {/* Page Info */}
      <Typography variant="body2" color="text.secondary">
        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} notes
      </Typography>

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* First Page */}
        <Button
          size="small"
          onClick={() => handlePageChange(1)}
          disabled={!hasPrev}
          startIcon={<FirstPage />}
        >
          First
        </Button>

        {/* Previous Page */}
        <Button
          size="small"
          onClick={() => handlePageChange(page - 1)}
          disabled={!hasPrev}
          startIcon={<ChevronLeft />}
        >
          Prev
        </Button>

        {/* Page Numbers */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {getPageNumbers().map((pageNum, index) => (
            <Button
              key={index}
              size="small"
              variant={pageNum === page ? 'contained' : 'outlined'}
              onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
              disabled={pageNum === '...'}
              sx={{ minWidth: 40 }}
            >
              {pageNum}
            </Button>
          ))}
        </Box>

        {/* Next Page */}
        <Button
          size="small"
          onClick={() => handlePageChange(page + 1)}
          disabled={!hasNext}
          endIcon={<ChevronRight />}
        >
          Next
        </Button>

        {/* Last Page */}
        <Button
          size="small"
          onClick={() => handlePageChange(totalPages)}
          disabled={!hasNext}
          endIcon={<LastPage />}
        >
          Last
        </Button>
      </Box>

      {/* Items Per Page */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Items per page</InputLabel>
        <Select
          value={limit}
          label="Items per page"
          onChange={handleLimitChange}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default Pagination; 