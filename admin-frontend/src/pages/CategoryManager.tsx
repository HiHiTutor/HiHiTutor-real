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
  Divider,
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

interface Subject {
  value: string;
  label: string;
}

interface SubCategory {
  id: string;
  name: string;
  subjects: string[];
}

interface Category {
  value: string;
  label: string;
  subjects: Subject[];
  subCategories: SubCategory[];
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'category' | 'subject' | 'subcategory'>('category');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/config/categories');
      setCategories(response.data);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCategories = async () => {
    try {
      setSaving(true);
      await api.post('/admin/config/categories', { categories });
      setSuccess('Categories saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save categories');
      console.error('Error saving categories:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory({
      value: '',
      label: '',
      subjects: [],
      subCategories: []
    });
    setDialogType('category');
    setDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory({ ...category });
    setDialogType('category');
    setDialogOpen(true);
  };

  const handleDeleteCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const handleAddSubject = (categoryIndex: number) => {
    setEditingSubject({ value: '', label: '' });
    setEditingCategory(categories[categoryIndex]);
    setDialogType('subject');
    setDialogOpen(true);
  };

  const handleEditSubject = (categoryIndex: number, subjectIndex: number) => {
    setEditingSubject({ ...categories[categoryIndex].subjects[subjectIndex] });
    setEditingCategory(categories[categoryIndex]);
    setDialogType('subject');
    setDialogOpen(true);
  };

  const handleDeleteSubject = (categoryIndex: number, subjectIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].subjects.splice(subjectIndex, 1);
    setCategories(newCategories);
  };

  const handleAddSubCategory = (categoryIndex: number) => {
    setEditingSubCategory({ id: '', name: '', subjects: [] });
    setEditingCategory(categories[categoryIndex]);
    setDialogType('subcategory');
    setDialogOpen(true);
  };

  const handleEditSubCategory = (categoryIndex: number, subCategoryIndex: number) => {
    setEditingSubCategory({ ...categories[categoryIndex].subCategories[subCategoryIndex] });
    setEditingCategory(categories[categoryIndex]);
    setDialogType('subcategory');
    setDialogOpen(true);
  };

  const handleDeleteSubCategory = (categoryIndex: number, subCategoryIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].subCategories.splice(subCategoryIndex, 1);
    setCategories(newCategories);
  };

  const handleDialogSave = () => {
    if (!editingCategory) return;

    const categoryIndex = categories.findIndex(c => c.value === editingCategory.value);
    
    if (dialogType === 'category') {
      if (categoryIndex >= 0) {
        // Update existing category
        const newCategories = [...categories];
        newCategories[categoryIndex] = editingCategory;
        setCategories(newCategories);
      } else {
        // Add new category
        setCategories([...categories, editingCategory]);
      }
    } else if (dialogType === 'subject' && editingSubject) {
      const newCategories = [...categories];
      if (categoryIndex >= 0) {
        const subjectIndex = newCategories[categoryIndex].subjects.findIndex(s => s.value === editingSubject.value);
        if (subjectIndex >= 0) {
          newCategories[categoryIndex].subjects[subjectIndex] = editingSubject;
        } else {
          newCategories[categoryIndex].subjects.push(editingSubject);
        }
        setCategories(newCategories);
      }
    } else if (dialogType === 'subcategory' && editingSubCategory) {
      const newCategories = [...categories];
      if (categoryIndex >= 0) {
        const subCategoryIndex = newCategories[categoryIndex].subCategories.findIndex(sc => sc.id === editingSubCategory.id);
        if (subCategoryIndex >= 0) {
          newCategories[categoryIndex].subCategories[subCategoryIndex] = editingSubCategory;
        } else {
          newCategories[categoryIndex].subCategories.push(editingSubCategory);
        }
        setCategories(newCategories);
      }
    }

    setDialogOpen(false);
    setEditingCategory(null);
    setEditingSubject(null);
    setEditingSubCategory(null);
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setEditingSubject(null);
    setEditingSubCategory(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading categories...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">科目管理</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCategory}
            sx={{ mr: 2 }}
          >
            新增科目分類
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveCategories}
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
        {categories.map((category, categoryIndex) => (
          <Grid item xs={12} md={6} key={category.value}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{category.label}</Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditCategory(category)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCategory(categoryIndex)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  科目 (Subjects)
                </Typography>
                <Box mb={2}>
                  {category.subjects.map((subject, subjectIndex) => (
                    <Chip
                      key={subject.value}
                      label={subject.label}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      onDelete={() => handleDeleteSubject(categoryIndex, subjectIndex)}
                    />
                  ))}
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddSubject(categoryIndex)}
                  >
                    新增科目
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  子分類 (Sub Categories)
                </Typography>
                <List dense>
                  {category.subCategories.map((subCategory, subCategoryIndex) => (
                    <ListItem key={subCategory.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={subCategory.name}
                        secondary={`ID: ${subCategory.id} | 科目: ${subCategory.subjects.join(', ')}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => handleEditSubCategory(categoryIndex, subCategoryIndex)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteSubCategory(categoryIndex, subCategoryIndex)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddSubCategory(categoryIndex)}
                >
                  新增子分類
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for editing */}
      <Dialog open={dialogOpen} onClose={handleDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'category' && (editingCategory?.value ? '編輯科目分類' : '新增科目分類')}
          {dialogType === 'subject' && (editingSubject?.value ? '編輯科目' : '新增科目')}
          {dialogType === 'subcategory' && (editingSubCategory?.id ? '編輯子分類' : '新增子分類')}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'category' && editingCategory && (
            <Box>
              <TextField
                fullWidth
                label="分類值 (Value)"
                value={editingCategory.value}
                onChange={(e) => setEditingCategory({ ...editingCategory, value: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="分類名稱 (Label)"
                value={editingCategory.label}
                onChange={(e) => setEditingCategory({ ...editingCategory, label: e.target.value })}
                margin="normal"
              />
            </Box>
          )}

          {dialogType === 'subject' && editingSubject && (
            <Box>
              <TextField
                fullWidth
                label="科目值 (Value)"
                value={editingSubject.value}
                onChange={(e) => setEditingSubject({ ...editingSubject, value: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="科目名稱 (Label)"
                value={editingSubject.label}
                onChange={(e) => setEditingSubject({ ...editingSubject, label: e.target.value })}
                margin="normal"
              />
            </Box>
          )}

          {dialogType === 'subcategory' && editingSubCategory && (
            <Box>
              <TextField
                fullWidth
                label="子分類 ID"
                value={editingSubCategory.id}
                onChange={(e) => setEditingSubCategory({ ...editingSubCategory, id: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="子分類名稱"
                value={editingSubCategory.name}
                onChange={(e) => setEditingSubCategory({ ...editingSubCategory, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="科目列表 (用逗號分隔)"
                value={editingSubCategory.subjects.join(', ')}
                onChange={(e) => setEditingSubCategory({
                  ...editingSubCategory,
                  subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                margin="normal"
                helperText="例如: primary-chinese, primary-english, primary-math"
              />
            </Box>
          )}
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

export default CategoryManager; 