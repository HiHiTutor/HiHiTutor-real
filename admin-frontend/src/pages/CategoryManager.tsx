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
  subjects: Subject[];
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
  const [dialogType, setDialogType] = useState<'category' | 'subject' | 'subcategory' | 'subcategory-subject'>('category');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/config/categories');
      console.log('📥 從後端獲取的原始數據:', response.data);
      
      // Convert object to array format for frontend
      const categoriesArray = Object.entries(response.data).map(([value, category]: [string, any]) => {
        console.log(`🔍 處理分類: ${value}`, category);
        
        // 確保子分類有正確的 id 和 name 屬性
        const subCategories = (category.subCategories || []).map((subCat: any, index: number) => ({
          id: subCat.id || subCat.value || `sub-${index}`,
          name: subCat.name || subCat.label || subCat.value || `子分類${index}`,
          value: subCat.value || subCat.id || `sub-${index}`,
          label: subCat.label || subCat.name || subCat.value || `子分類${index}`,
          subjects: subCat.subjects || []
        }));
        
        console.log(`📊 處理後的子分類:`, subCategories);
        
        return {
          value,
          label: category.label,
          subjects: category.subjects || [],
          subCategories
        };
      });
      
      console.log('📊 最終處理後的分類數組:', categoriesArray);
      setCategories(categoriesArray);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCategories = async () => {
    console.log('🔍 儲存函數被調用');
    console.log('📊 當前 categories 狀態:', categories);
    
    try {
      setSaving(true);
      console.log('⏳ 開始儲存...');
      
      // Convert array back to object format for backend
      const categoriesObject = categories.reduce((acc, category) => {
        acc[category.value] = {
          label: category.label,
          subjects: category.subjects,
          subCategories: category.subCategories
        };
        return acc;
      }, {} as any);
      
      console.log('📤 準備發送到後端的數據:', categoriesObject);
      console.log('🌐 API 端點: /admin/config/categories');
      
      const response = await api.post('/admin/config/categories', { categories: categoriesObject });
      
      console.log('✅ API 響應成功:', response);
      setSuccess('Categories saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ 儲存失敗:', err);
      setError('Failed to save categories');
      console.error('Error saving categories:', err);
    } finally {
      console.log('🏁 儲存完成，設置 saving 為 false');
      setSaving(false);
    }
  };

  // 測試函數：驗證按鈕點擊是否正常工作
  const testSaveButton = () => {
    console.log('🧪 測試儲存按鈕點擊');
    alert('儲存按鈕點擊測試成功！');
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

  // 新增：子分類科目管理函數
  const handleAddSubCategorySubject = (categoryIndex: number, subCategoryIndex: number) => {
    setEditingSubject({ value: '', label: '' });
    setEditingCategory(categories[categoryIndex]);
    setEditingSubCategory(categories[categoryIndex].subCategories[subCategoryIndex]);
    setDialogType('subcategory-subject');
    setDialogOpen(true);
  };

  const handleEditSubCategorySubjects = (categoryIndex: number, subCategoryIndex: number) => {
    setEditingCategory(categories[categoryIndex]);
    setEditingSubCategory(categories[categoryIndex].subCategories[subCategoryIndex]);
    setDialogType('subcategory-subject');
    setDialogOpen(true);
  };

  const handleDeleteSubCategorySubject = (categoryIndex: number, subCategoryIndex: number, subjectIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].subCategories[subCategoryIndex].subjects.splice(subjectIndex, 1);
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
    } else if (dialogType === 'subcategory-subject' && editingSubject && editingSubCategory) {
      console.log('🔍 處理子分類科目保存');
      console.log('📊 當前編輯的子分類:', editingSubCategory);
      console.log('📊 當前編輯的科目:', editingSubject);
      
      const newCategories = [...categories];
      if (categoryIndex >= 0) {
        // 找到正確的子分類索引
        const subCategoryIndex = newCategories[categoryIndex].subCategories.findIndex(sc => sc.id === editingSubCategory.id);
        console.log('🔍 找到子分類索引:', subCategoryIndex, '在分類:', categoryIndex);
        
        if (subCategoryIndex >= 0) {
          // 檢查科目是否已存在
          const subjectIndex = newCategories[categoryIndex].subCategories[subCategoryIndex].subjects.findIndex(s => s.value === editingSubject.value);
          
          if (subjectIndex >= 0) {
            // 更新現有科目
            console.log('🔄 更新現有科目:', subjectIndex);
            newCategories[categoryIndex].subCategories[subCategoryIndex].subjects[subjectIndex] = editingSubject;
          } else {
            // 添加新科目
            console.log('➕ 添加新科目到子分類:', subCategoryIndex);
            newCategories[categoryIndex].subCategories[subCategoryIndex].subjects.push(editingSubject);
          }
          
          console.log('✅ 科目保存完成，新的子分類科目列表:', newCategories[categoryIndex].subCategories[subCategoryIndex].subjects);
          setCategories(newCategories);
        } else {
          console.error('❌ 找不到對應的子分類:', editingSubCategory.id);
        }
      } else {
        console.error('❌ 找不到對應的分類:', editingCategory.value);
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
            color="secondary"
            onClick={testSaveButton}
            sx={{ mr: 2 }}
          >
            測試按鈕
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

                {/* 子分類層級顯示 */}
                <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 700, mt: 2 }}>
                  子分類 (Sub Categories)
                </Typography>
                <Box>
                  {category.subCategories.length === 0 && (
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>暫無子分類</Typography>
                  )}
                  {category.subCategories.map((subCategory, subCategoryIndex) => (
                    <Card key={subCategory.id} variant="outlined" sx={{ mb: 2, ml: 2, boxShadow: 0 }}>
                      <CardContent sx={{ pb: 1, pt: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{(subCategory as any).label || subCategory.name}</Typography>
                            <Typography variant="caption" color="textSecondary">ID: {(subCategory as any).value || subCategory.id}</Typography>
                          </Box>
                          <Box>
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
                          </Box>
                        </Box>
                        <Box mt={1} mb={1} display="flex" flexWrap="wrap" sx={{ ml: 2 }}>
                          {subCategory.subjects && subCategory.subjects.length > 0 ? (
                            subCategory.subjects.map((subject, subjectIndex) => (
                              <Chip 
                                key={subject.value} 
                                label={subject.label} 
                                size="small" 
                                sx={{ mr: 1, mb: 1 }}
                                onDelete={() => handleDeleteSubCategorySubject(categoryIndex, subCategoryIndex, subjectIndex)}
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="textSecondary">無科目</Typography>
                          )}
                        </Box>
                        
                        {/* 新增：子分類的科目管理按鈕 */}
                        <Box display="flex" gap={1} sx={{ ml: 2, mt: 1 }}>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddSubCategorySubject(categoryIndex, subCategoryIndex)}
                            variant="outlined"
                            color="primary"
                          >
                            新增科目
                          </Button>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditSubCategorySubjects(categoryIndex, subCategoryIndex)}
                            variant="outlined"
                            color="secondary"
                          >
                            編輯科目
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddSubCategory(categoryIndex)}
                  sx={{ ml: 2 }}
                >
                  新增子分類
                </Button>

                <Divider sx={{ my: 2 }} />

                {/* 課程分類本身的科目（如有） */}
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  分類直屬科目 (Subjects)
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
          {dialogType === 'subcategory-subject' && (editingSubject?.value ? '編輯子分類科目' : '新增子分類科目')}
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
                label="科目列表 (用逗號分隔，格式：value:label)"
                value={editingSubCategory.subjects.map(s => `${s.value}:${s.label}`).join(', ')}
                onChange={(e) => setEditingSubCategory({
                  ...editingSubCategory,
                  subjects: e.target.value.split(',').map(s => {
                    const [value, label] = s.split(':').map(str => str.trim());
                    return value && label ? { value, label } : null;
                  }).filter(Boolean) as Subject[]
                })}
                margin="normal"
                helperText="例如: primary-chinese:中文, primary-english:英文, primary-math:數學"
              />
            </Box>
          )}

          {dialogType === 'subcategory-subject' && editingSubject && (
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