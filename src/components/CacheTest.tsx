'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

interface CacheTestProps {
  onCacheHit?: (data: any) => void;
  onCacheMiss?: () => void;
}

export default function CacheTest({ onCacheHit, onCacheMiss }: CacheTestProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [cacheStatus, setCacheStatus] = useState<string>('');

  const testCache = async () => {
    if (!token) return;
    
    setLoading(true);
    const startTime = performance.now();
    
    try {
      const response = await api.getNotes(token, { page: 1, limit: 5 });
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Safe access to response data
      const dataLength = response?.data?.length || 0;
      const total = response?.pagination?.total || 0;
      
      const result = {
        timestamp: new Date().toLocaleTimeString(),
        duration: `${duration.toFixed(2)}ms`,
        dataLength: dataLength,
        total: total,
      };
      
      setResults(prev => [result, ...prev.slice(0, 4)]);
      
      // Determine if it was likely a cache hit or miss based on response time
      if (duration < 100) {
        setCacheStatus('Cache HIT (Fast response)');
        onCacheHit?.(response);
      } else {
        setCacheStatus('Cache MISS (Slower response)');
        onCacheMiss?.();
      }
    } catch (error) {
      console.error('Cache test failed:', error);
      setCacheStatus('Error: Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setCacheStatus('');
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Cache Testing Tool
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={testCache}
          disabled={loading || !token}
          sx={{ mr: 2 }}
        >
          {loading ? 'Testing...' : 'Test Cache'}
        </Button>
        <Button 
          variant="outlined" 
          onClick={clearResults}
        >
          Clear Results
        </Button>
      </Box>

      {cacheStatus && (
        <Alert severity={cacheStatus.includes('HIT') ? 'success' : cacheStatus.includes('Error') ? 'error' : 'info'} sx={{ mb: 2 }}>
          {cacheStatus}
        </Alert>
      )}

      {results.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Recent Test Results:
          </Typography>
          {results.map((result, index) => (
            <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Time:</strong> {result.timestamp} | 
                <strong>Duration:</strong> {result.duration} | 
                <strong>Notes:</strong> {result.dataLength}/{result.total}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Typography variant="caption" color="text.secondary">
        Tip: Run multiple tests quickly to see cache hits (fast responses) vs cache misses (slower responses)
      </Typography>
    </Paper>
  );
} 