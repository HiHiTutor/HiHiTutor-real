import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../services/api';

interface TeachingMode {
  value: string;
  label: string;
}

const ModeManager: React.FC = () => {
  const [teachingModes, setTeachingModes] = useState<TeachingMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingMode, setEditingMode] = useState<TeachingMode | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadTeachingModes();
  }, []);

  const loadTeachingModes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/config/teaching-modes');
      setTeachingModes(response.data);
    } catch (err) {
      setError('Failed to load teaching modes');
      console.error('Error loading teaching modes:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTeachingModes = async () => {
    try {
      setSaving(true);
      await api.post('/admin/config/teaching-modes', { teachingModes });
      setSuccess('Teaching modes saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save teaching modes');
      console.error('Error saving teaching modes:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMode = () => {
    setEditingMode({ value: '', label: '' });
    setDialogOpen(true);
  };

  const handleEditMode = (mode: TeachingMode) => {
    setEditingMode({ ...mode });
    setDialogOpen(true);
  };

  const handleDeleteMode = (index: number) => {
    const newModes = teachingModes.filter((_, i) => i !== index);
    setTeachingModes(newModes);
  };

  const handleDialogSave = () => {
    if (!editingMode) return;

    const modeIndex = teachingModes.findIndex(m => m.value === editingMode.value);
    
    if (modeIndex >= 0) {
      // Update existing mode
      const newModes = [...teachingModes];
      newModes[modeIndex] = editingMode;
      setTeachingModes(newModes);
    } else {
      // Add new mode
      setTeachingModes([...teachingModes, editingMode]);
    }

    setDialogOpen(false);
    setEditingMode(null);
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    setEditingMode(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading teaching modes...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">教學模式管理</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddMode}
            sx={{ mr: 2 }}
          >
            新增教學模式
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveTeachingModes}
            disabled={saving}
          >
            {saving ? '儲存中...' : '儲存變更'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {teachingModes.map((mode, index) => (
          <Grid item xs={12} sm={6} md={4} key={mode.value}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">{mode.label}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {mode.value}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditMode(mode)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteMode(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                {/* 子選項 chips 顯示 */}
                <Box mt={2} display="flex" flexWrap="wrap">
                  {(mode as any).subCategories && (mode as any).subCategories.length > 0 ? (
                    (mode as any).subCategories.map((sub: any) => (
                      <Chip key={sub.value} label={sub.label} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">無子選項</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for editing */}
      <Dialog open={dialogOpen} onClose={handleDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMode?.value ? '編輯教學模式' : '新增教學模式'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="模式值 (Value)"
            value={editingMode?.value || ''}
            onChange={(e) => setEditingMode(prev => prev ? { ...prev, value: e.target.value } : null)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="模式名稱 (Label)"
            value={editingMode?.label || ''}
            onChange={(e) => setEditingMode(prev => prev ? { ...prev, label: e.target.value } : null)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel} startIcon={<CancelIcon />}>
            取消
          </Button>
          <Button onClick={handleDialogSave} variant="contained" startIcon={<SaveIcon />}>
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModeManager; 