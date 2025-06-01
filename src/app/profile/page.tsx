'use client';

import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ProfileUpload from '@/components/ProfileUpload';

export default function ProfilePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            color="primary"
          >
            Back to Notes
          </Button>
        </Link>
      </Box>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        <Box sx={{ mt: 4 }}>
          <ProfileUpload />
        </Box>
      </Paper>
    </Container>
  );
} 