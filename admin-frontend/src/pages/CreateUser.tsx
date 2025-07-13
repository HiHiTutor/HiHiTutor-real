import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { usersAPI } from '../services/api';

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    userType: 'student',
    tutorProfile: {
      subjects: '', // 逗號分隔
      sessionRate: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'subjects' || name === 'sessionRate') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let submitData: any = { ...formData };
      if (formData.userType === 'tutor') {
        submitData.tutorProfile = {
          subjects: formData.tutorProfile.subjects.split(',').map((s: string) => s.trim()).filter(Boolean),
          sessionRate: Number(formData.tutorProfile.sessionRate)
        };
      } else {
        delete submitData.tutorProfile;
      }
      const response = await usersAPI.createUser(submitData);
      if (response.data.success) {
        navigate('/users');
      } else {
        setError(response.data.message || 'Failed to create user');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Create New User</Typography>
        <Button variant="outlined" onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <TextField
              select
              label="User Type"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="tutor">Tutor</MenuItem>
              <MenuItem value="organization">Organization</MenuItem>
            </TextField>

            {/* Tutor 專用欄位 */}
            {formData.userType === 'tutor' && (
              <>
                <TextField
                  label="可教授科目 (用逗號分隔)"
                  name="subjects"
                  value={formData.tutorProfile.subjects}
                  onChange={handleChange}
                  required
                  helperText="例如: 英文, 數學, 通識"
                />
                <TextField
                  label="時薪 (sessionRate)"
                  name="sessionRate"
                  type="number"
                  value={formData.tutorProfile.sessionRate}
                  onChange={handleChange}
                  required
                  helperText="堂費不能少於 100 元"
                />
              </>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create User'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/users')}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateUser; 