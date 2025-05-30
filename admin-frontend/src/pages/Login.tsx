import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAppDispatch } from '../hooks/redux';
import { authAPI } from '../services/api';
import { setAuth } from '../store/slices/authSlice';
import axios from 'axios';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('🔑 Attempting login with:', { 
        identifier,
        apiUrl: process.env.REACT_APP_API_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api'
      });
      
      const response = await authAPI.login({ 
        identifier: identifier.trim(), 
        password: password.trim() 
      });

      console.log('✅ Login response:', {
        success: response.data.success,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        userType: response.data.user?.userType,
        role: response.data.user?.role
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      if (response.data.user?.userType !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      localStorage.setItem('adminToken', response.data.token);
      dispatch(setAuth({ 
        isAuthenticated: true, 
        user: response.data.user 
      }));
      
      console.log('✅ Login successful, user:', {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        userType: response.data.user.userType,
        role: response.data.user.role
      });

      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        let errorMessage = 'Login failed';
        
        if (error.response?.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Invalid email/phone or password';
        } else if (error.response?.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
          console.error('Server error details:', errorData);
        }
        
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Admin Login
          </Typography>

          {error && (
            <Alert 
              severity="error"
              sx={{ width: '100%', mb: 2 }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              mt: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              label="Email or Phone"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              fullWidth
              placeholder="Enter email or phone number"
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 