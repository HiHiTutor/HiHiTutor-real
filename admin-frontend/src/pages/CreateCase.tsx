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
import {
  getTypeLabel,
  getModeLabel,
} from '../utils/translations';

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
        setError(response.data.message || '建立案例失敗');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">建立新案例</Typography>
        <Button variant="outlined" onClick={() => navigate('/cases')}>
          返回案例列表
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
              label="標題"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <TextField
              label="描述"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />
            <TextField
              select
              label="類型"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="student">學生案例</MenuItem>
              <MenuItem value="tutor">導師案例</MenuItem>
            </TextField>
            <TextField
              label="分類"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
            <TextField
              label="子分類"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
            />

            {/* Subjects */}
            <Box>
              <Typography variant="subtitle1">科目</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="新增科目"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  size="small"
                />
                <Button variant="outlined" onClick={handleAddSubject}>
                  新增
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
              <Typography variant="subtitle1">地區</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="新增地區"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  size="small"
                />
                <Button variant="outlined" onClick={handleAddRegion}>
                  新增
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
              <Typography variant="subtitle1">子地區</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="新增子地區"
                  value={newSubRegion}
                  onChange={(e) => setNewSubRegion(e.target.value)}
                  size="small"
                />
                <Button variant="outlined" onClick={handleAddSubRegion}>
                  新增
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
              label="預算"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              required
            />
            <TextField
              select
              label="教學模式"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              required
            >
              <MenuItem value="online">網上教學</MenuItem>
              <MenuItem value="offline">面授教學</MenuItem>
              <MenuItem value="hybrid">混合教學</MenuItem>
            </TextField>
            <TextField
              label="經驗要求"
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
                {loading ? <CircularProgress size={24} /> : '建立案例'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/cases')}
                disabled={loading}
              >
                取消
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateCase; 