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
  Grid,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon
} from '@mui/icons-material';
import api from '../services/api';

interface SubRegion {
  value: string;
  label: string;
}

interface Region {
  value: string;
  label: string;
  regions?: SubRegion[];
  sortOrder?: number;
}

const RegionManager: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subRegionDialogOpen, setSubRegionDialogOpen] = useState(false);
  const [editingSubRegion, setEditingSubRegion] = useState<SubRegion | null>(null);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState<number>(-1);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/config/regions');
      // 確保有 sortOrder，如果沒有則按索引設置
      const regionsWithOrder = response.data.map((region: Region, index: number) => ({
        ...region,
        sortOrder: region.sortOrder !== undefined ? region.sortOrder : index
      }));
      // 按 sortOrder 排序
      const sortedRegions = regionsWithOrder.sort((a: Region, b: Region) => 
        (a.sortOrder || 0) - (b.sortOrder || 0)
      );
      setRegions(sortedRegions);
    } catch (err) {
      setError('Failed to load regions');
      console.error('Error loading regions:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveRegions = async () => {
    try {
      setSaving(true);
      // 為每個地區設置 sortOrder
      const regionsWithOrder = regions.map((region, index) => ({
        ...region,
        sortOrder: index
      }));
      
      console.log('📤 準備發送地區數據:', regionsWithOrder);
      console.log('📊 地區數量:', regionsWithOrder.length);
      
      const response = await api.post('/admin/config/regions', { regions: regionsWithOrder });
      console.log('✅ 保存成功響應:', response.data);
      
      setSuccess('Regions saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('❌ 保存地區時發生錯誤:', err);
      console.error('錯誤響應:', err.response?.data);
      setError(`Failed to save regions: ${err.response?.data?.error || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // 地區排序功能
  const moveRegionUp = (index: number) => {
    if (index === 0) return;
    const newRegions = [...regions];
    [newRegions[index], newRegions[index - 1]] = [newRegions[index - 1], newRegions[index]];
    setRegions(newRegions);
  };

  const moveRegionDown = (index: number) => {
    if (index === regions.length - 1) return;
    const newRegions = [...regions];
    [newRegions[index], newRegions[index + 1]] = [newRegions[index + 1], newRegions[index]];
    setRegions(newRegions);
  };

  const handleAddRegion = () => {
    setEditingRegion({ value: '', label: '', sortOrder: regions.length });
    setDialogOpen(true);
  };

  const handleEditRegion = (region: Region) => {
    setEditingRegion({ ...region });
    setDialogOpen(true);
  };

  const handleDeleteRegion = (index: number) => {
    const newRegions = regions.filter((_, i) => i !== index);
    setRegions(newRegions);
  };

  const handleDialogSave = () => {
    if (!editingRegion) return;

    const regionIndex = regions.findIndex(r => r.value === editingRegion.value);
    
    if (regionIndex >= 0) {
      // Update existing region
      const newRegions = [...regions];
      newRegions[regionIndex] = { ...editingRegion, sortOrder: regionIndex };
      setRegions(newRegions);
    } else {
      // Add new region
      setRegions([...regions, { ...editingRegion, sortOrder: regions.length }]);
    }

    setDialogOpen(false);
    setEditingRegion(null);
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    setEditingRegion(null);
  };

  // 子地區管理功能
  const handleAddSubRegion = (regionIndex: number) => {
    setSelectedRegionIndex(regionIndex);
    setEditingSubRegion({ value: '', label: '' });
    setSubRegionDialogOpen(true);
  };

  const handleEditSubRegion = (regionIndex: number, subRegionIndex: number) => {
    setSelectedRegionIndex(regionIndex);
    const subRegion = regions[regionIndex].regions?.[subRegionIndex];
    if (subRegion) {
      setEditingSubRegion({ ...subRegion });
      setSubRegionDialogOpen(true);
    }
  };

  const handleDeleteSubRegion = (regionIndex: number, subRegionIndex: number) => {
    const newRegions = [...regions];
    if (newRegions[regionIndex].regions) {
      newRegions[regionIndex].regions = newRegions[regionIndex].regions!.filter((_, i) => i !== subRegionIndex);
      setRegions(newRegions);
    }
  };

  const handleSubRegionDialogSave = () => {
    if (!editingSubRegion || selectedRegionIndex === -1) return;

    const newRegions = [...regions];
    if (!newRegions[selectedRegionIndex].regions) {
      newRegions[selectedRegionIndex].regions = [];
    }

    const subRegionIndex = newRegions[selectedRegionIndex].regions!.findIndex(
      (sr: SubRegion) => sr.value === editingSubRegion.value
    );

    if (subRegionIndex >= 0) {
      // 更新現有子地區
      newRegions[selectedRegionIndex].regions![subRegionIndex] = editingSubRegion;
    } else {
      // 添加新子地區
      newRegions[selectedRegionIndex].regions!.push(editingSubRegion);
    }

    setRegions(newRegions);
    setSubRegionDialogOpen(false);
    setEditingSubRegion(null);
    setSelectedRegionIndex(-1);
  };

  const handleSubRegionDialogCancel = () => {
    setSubRegionDialogOpen(false);
    setEditingSubRegion(null);
    setSelectedRegionIndex(-1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading regions...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">地區管理</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRegion}
            sx={{ mr: 2 }}
          >
            新增地區
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveRegions}
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

      {/* 排序說明 */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="body2" color="textSecondary">
          💡 提示：使用上下箭頭按鈕調整地區順序，前台會按照此順序顯示。調整完成後請點擊「儲存變更」。
        </Typography>
      </Paper>

      {/* 地區列表 - 改為垂直排列以便排序 */}
      <Box>
        {regions.map((region, index) => (
          <Paper 
            key={region.value} 
            sx={{ 
              mb: 2, 
              p: 2,
              border: '1px solid #e0e0e0',
              '&:hover': { borderColor: '#1976d2' }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              {/* 排序控制 */}
              <Box display="flex" alignItems="center" sx={{ minWidth: 120 }}>
                <IconButton
                  size="small"
                  onClick={() => moveRegionUp(index)}
                  disabled={index === 0}
                  sx={{ mr: 1 }}
                >
                  <UpIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => moveRegionDown(index)}
                  disabled={index === regions.length - 1}
                  sx={{ mr: 1 }}
                >
                  <DownIcon />
                </IconButton>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 30 }}>
                  #{index + 1}
                </Typography>
              </Box>

              {/* 地區信息 */}
              <Box flex={1} ml={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">{region.label}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {region.value}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditRegion(region)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteRegion(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* 子地區管理 */}
                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" color="textSecondary">
                      子地區
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddSubRegion(index)}
                      variant="outlined"
                    >
                      新增子地區
                    </Button>
                  </Box>
                  
                  <Box display="flex" flexWrap="wrap">
                    {region.regions && region.regions.length > 0 ? (
                      region.regions.map((subRegion, subIndex) => (
                        <Box key={subRegion.value} display="flex" alignItems="center" sx={{ mr: 1, mb: 1 }}>
                          <Chip 
                            label={subRegion.label} 
                            size="small" 
                            sx={{ mr: 0.5 }}
                            onDelete={() => handleDeleteSubRegion(index, subIndex)}
                            deleteIcon={<DeleteIcon />}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleEditSubRegion(index, subIndex)}
                            sx={{ ml: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">無子地區</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Dialog for editing */}
      <Dialog open={dialogOpen} onClose={handleDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRegion?.value ? '編輯地區' : '新增地區'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="地區值 (Value)"
            value={editingRegion?.value || ''}
            onChange={(e) => setEditingRegion(prev => prev ? { ...prev, value: e.target.value } : null)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="地區名稱 (Label)"
            value={editingRegion?.label || ''}
            onChange={(e) => setEditingRegion(prev => prev ? { ...prev, label: e.target.value } : null)}
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

      {/* 子地區編輯對話框 */}
      <Dialog open={subRegionDialogOpen} onClose={handleSubRegionDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSubRegion?.value ? '編輯子地區' : '新增子地區'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="子地區值 (Value)"
            value={editingSubRegion?.value || ''}
            onChange={(e) => setEditingSubRegion(prev => prev ? { ...prev, value: e.target.value } : null)}
            margin="normal"
            placeholder="例如: southern-district"
          />
          <TextField
            fullWidth
            label="子地區名稱 (Label)"
            value={editingSubRegion?.label || ''}
            onChange={(e) => setEditingSubRegion(prev => prev ? { ...prev, label: e.target.value } : null)}
            margin="normal"
            placeholder="例如: 南區"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubRegionDialogCancel} startIcon={<CancelIcon />}>
            取消
          </Button>
          <Button onClick={handleSubRegionDialogSave} variant="contained" startIcon={<SaveIcon />}>
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegionManager; 