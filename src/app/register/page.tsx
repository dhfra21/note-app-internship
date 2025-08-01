'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerSchema, RegisterInput } from '@/schemas/auth';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Link as MuiLink,
} from '@mui/material';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterInput>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    try {
      registerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const zodError = error as any;
        const newErrors: { email?: string; password?: string } = {};
        
        zodError.errors?.forEach((err: any) => {
          if (err.path.includes('email')) {
            newErrors.email = err.message;
          }
          if (err.path.includes('password')) {
            newErrors.password = err.message;
          }
        });
        
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Create your account
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={!!errors.password}
              helperText={errors.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <MuiLink component={Link} href="/login" variant="body2">
                {"Already have an account? Sign in"}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 