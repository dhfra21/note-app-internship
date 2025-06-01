'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Avatar,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const ProfileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    fetchProfilePicture();
  }, []);

  const fetchProfilePicture = async () => {
    try {
      const response = await fetch('http://localhost:3001/users/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile picture');
      }
      const data = await response.json();
      if (data.user.profilePicture) {
        setProfilePicture(data.user.profilePicture);
      }
    } catch (err) {
      console.error('Error fetching profile picture:', err);
      setError('Failed to fetch profile picture');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', '2'); // Hardcoded user ID for now

      const response = await fetch('http://localhost:3001/users/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to upload profile picture');
      }

      const data = await response.json();
      setSuccess('Profile picture uploaded successfully!');
      setProfilePicture(previewUrl); // Update the displayed profile picture
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={previewUrl || profilePicture || undefined}
          sx={{ 
            width: 150, 
            height: 150,
            border: '2px solid #e0e0e0'
          }}
        />
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="icon-button-file"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="icon-button-file">
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="span"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'white',
              '&:hover': { backgroundColor: 'white' }
            }}
          >
            <PhotoCamera />
          </IconButton>
        </label>
      </Box>

      <Typography variant="body1" color="text.secondary">
        Upload your profile picture
      </Typography>

      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        sx={{ mt: 2 }}
      >
        {isUploading ? 'Uploading...' : 'Upload Picture'}
      </Button>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileUpload; 