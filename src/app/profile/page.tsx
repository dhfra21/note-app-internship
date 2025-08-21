'use client';

import React from 'react';
import { Container, Typography, Box, Paper, Button, AppBar, Toolbar } from '@mui/material';
import Link from 'next/link';
import LogoutIcon from '@mui/icons-material/Logout';
import ProfileUpload from '@/components/ProfileUpload';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Profile
          </Typography>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button color="inherit" sx={{ mr: 1 }}>Notes</Button>
          </Link>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Profile Settings
          </Typography>
          <Box sx={{ mt: 4 }}>
            <ProfileUpload />
          </Box>
        </Paper>
      </Container>
    </>
  );
}