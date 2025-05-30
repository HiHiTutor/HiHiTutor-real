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
  Chip,
  Stack,
} from '@mui/material';
import { casesAPI } from '../services/api';

const CreateCase: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'student',
    category: '',
    subCategory: '',
    subjects: [] as string[],
    regions: [] as string[],
    subRegions: [] as string[],
    budget: '',
    mode: 'online',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [newSubRegion, setNewSubRegion] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSubject = () => {
    if (newSubject && !formData.subjects.includes(newSubject)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject],
      });
      setNewSubject('');
    }
  };

  const handleAddRegion = () => {
    if (newRegion && !formData.regions.includes(newRegion)) {
      setFormData({
        ...formData,
        regions: [...formData.regions, newRegion],
      });
      setNewRegion('');
    }
  };

  const handleAddSubRegion = () => {
    if (newSubRegion && !formData.subRegions.includes(newSubRegion)) {
      setFormData({
        ...formData,
        subRegions: [...formData.subRegions, newSubRegion],
      });
      setNewSubRegion('');
    }
  };

  const handleDeleteSubject = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((s) => s !== subject),
    });
  };

  const handleDeleteRegion = (region: string) => {
    setFormData({
      ...formData,
      regions: formData.regions.filter((r) => r !== region),
    });
  };

  const handleDeleteSubRegion = (subRegion: string) => {
    setFormData({
      ...formData,
      subRegions: formData.subRegions.filter((sr) => sr !== subRegion),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await casesAPI.createCase(formData);
      if (response.data.success) {
        navigate('/cases');
      } else {
        setError(response.data.message || 'Failed to create case');
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
        <Typography variant="h4">Create New Case</Typography>
        <Button variant="outlined" onClick={() => navigate('/cases')}>
          Back to Cases
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
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />
            <TextField
              select
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="tutor">Tutor</MenuItem>
            </TextField>
            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
            <TextField
              label="Sub Category"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
            />

            {/* Subjects */}
            <Box>
              <Typography variant="subtitle1">Subjects</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Add Subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  size="small"
                />
                <Button variant="outlined" onClick={handleAddSubject}>
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {formData.subjects.map((subject) => (
                  <Chip
                    key={subject}
                    label={subject}
                    onDelete={() => handleDeleteSubject(subject)}
                  />
                ))}
              </Stack>
            </Box>

            {/* Regions */}
            <Box>
              <Typography variant="subtitle1">Regions</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Add Region"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  size="small"
                />
                <Button variant="outlined" onClick={handleAddRegion}>
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {formData.regions.map((region) => (
                  <Chip
                    key={region}
                    label={region}
                    onDelete={() => handleDeleteRegion(region)}
                  />
                ))}
              </Stack>
            </Box>

            {/* Sub Regions */}
            <Box>
              <Typography variant="subtitle1">Sub Regions</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Add Sub Region"
                  value={newSubRegion}
                  onChange={(e) => setNewSubRegion(e.target.value)}
                  size="small"
                />
                <Button variant="outlined" onClick={handleAddSubRegion}>
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {formData.subRegions.map((subRegion) => (
                  <Chip
                    key={subRegion}
                    label={subRegion}
                    onDelete={() => handleDeleteSubRegion(subRegion)}
                  />
                ))}
              </Stack>
            </Box>

            <TextField
              label="Budget"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              required
            />
            <TextField
              select
              label="Mode"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              required
            >
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
              <MenuItem value="hybrid">Hybrid</MenuItem>
            </TextField>
            <TextField
              label="Experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              multiline
              rows={2}
            />

            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Case'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/cases')}
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

export default CreateCase; 