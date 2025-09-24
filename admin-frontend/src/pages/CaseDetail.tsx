import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { casesAPI } from '../services/api';
import { setSelectedCase, setLoading, setError } from '../store/slices/caseSlice';
import { Case } from '../types/case';
import {
  getCategoryLabel,
  getSubCategoryLabel,
  getStatusLabel,
  getTypeLabel,
  getModeLabel,
  getExperienceLabel,
  getSubjectLabel,
  getRegionLabel,
  getSubRegionLabel,
} from '../utils/translations';
import regionService, { Region } from '../services/regionService';
import { CATEGORY_OPTIONS_OBJECT } from '../constants/categoryOptions';

// 地區選項將從API動態加載

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { selectedCase, loading, error } = useAppSelector((state) => state.cases);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [regionOptions, setRegionOptions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // 載入地區資料
  const loadRegions = async () => {
    try {
      setLoadingRegions(true);
      const regions = await regionService.getRegions();
      setRegionOptions(regions);
    } catch (error) {
      console.error('Failed to load regions:', error);
    } finally {
      setLoadingRegions(false);
    }
  };

  useEffect(() => {
    const fetchCase = async () => {
      try {
        dispatch(setLoading(true));
        if (id) {
          const searchParams = new URLSearchParams(location.search);
          const type = searchParams.get('type');
          const response = await casesAPI.getCaseById(id, type || undefined);
          const { success, data } = response.data;
          
          if (success && data.case) {
            dispatch(setSelectedCase(data.case));
            setEditData(data.case);
          } else {
            dispatch(setError('找不到案例'));
          }
        }
      } catch (error: any) {
        dispatch(setError(error.message || '獲取案例詳情失敗'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCase();
    loadRegions();
  }, [dispatch, id, location.search]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'matched':
        return 'success';
      case 'closed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getSubCategories = () => {
    return [];
  };

  const getAvailableSubjects = () => {
    if (!editData.category) return [];
    
    const category = CATEGORY_OPTIONS_OBJECT[editData.category];
    if (!category || !category.subjects) return [];
    
    return category.subjects;
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setEditData({
        ...editData,
        category: value,
        subCategory: '',
        subjects: []
      });
    } else if (name === 'subCategory') {
      setEditData({
        ...editData,
        subCategory: value,
        subjects: Array.isArray(editData.subjects) ? editData.subjects : []
      });
    } else if (name === 'subjects') {
      setEditData({
        ...editData,
        subjects: value
      });
    } else if (name === 'regions') {
      setEditData({
        ...editData,
        regions: value ? [value] : [],
        subRegions: []
      });
    } else if (name === 'subRegions') {
      setEditData({
        ...editData,
        subRegions: Array.isArray(value) ? value : [value]
      });
    } else {
      setEditData({
        ...editData,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    try {
      setEditLoading(true);
      setEditError(null);
      
      // 添加調試信息
      console.log('🔍 準備提交的編輯數據:', editData);
      console.log('🔍 案例ID:', id);
      
      // 從 URL 參數中獲取案例類型
      const searchParams = new URLSearchParams(location.search);
      const type = searchParams.get('type');
      
      console.log('🔍 案例類型:', type);
      console.log('🔍 URL 參數:', location.search);
      
      const response = await casesAPI.updateCase(id!, editData, type || undefined);
      if (response.data.success) {
        console.log('✅ 案例更新成功:', response.data);
        dispatch(setSelectedCase(editData));
        setIsEditing(false);
        // 重新獲取案例數據
        const refreshResponse = await casesAPI.getCaseById(id!, location.search.includes('type=student') ? 'student' : undefined);
        if (refreshResponse.data.success && refreshResponse.data.data.case) {
          dispatch(setSelectedCase(refreshResponse.data.data.case));
          setEditData(refreshResponse.data.data.case);
        }
      } else {
        console.error('❌ 案例更新失敗:', response.data);
        setEditError(response.data.message || '更新失敗');
      }
    } catch (error: any) {
      console.error('❌ 案例更新異常:', error);
      console.error('❌ 錯誤響應:', error.response);
      console.error('❌ 錯誤數據:', error.response?.data);
      setEditError(error.response?.data?.message || '更新失敗');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(selectedCase);
    setIsEditing(false);
    setEditError(null);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const searchParams = new URLSearchParams(location.search);
      const type = searchParams.get('type');
      
      const response = await casesAPI.deleteCase(id!, type || undefined);
      
      if (response.data.success) {
        // 刪除成功，返回案例列表
        navigate('/cases');
      } else {
        throw new Error(response.data.message || '刪除失敗');
      }
    } catch (error: any) {
      console.error('Error deleting case:', error);
      // 這裡可以添加錯誤提示
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // 檢查是否為線上教學
  const isOnlineMode = selectedCase?.mode === 'online' || selectedCase?.mode === '網上教學';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!selectedCase) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">找不到案例</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">案例詳情</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isEditing && (
            <>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => setIsEditing(true)}
              >
                編輯案例
              </Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                刪除案例
              </Button>
            </>
          )}
          <Button variant="outlined" onClick={() => navigate('/cases')}>
            返回案例列表
          </Button>
        </Box>
      </Box>

      {editError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {editError}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {isEditing ? (
          // 編輯模式
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="標題"
              name="title"
              value={editData.title || ''}
              onChange={handleEditChange}
              required
              fullWidth
            />
            
            <TextField
              label="描述"
              name="description"
              value={editData.description || ''}
              onChange={handleEditChange}
              multiline
              rows={4}
              required
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>課程分類</InputLabel>
              <Select
                name="category"
                value={editData.category || ''}
                label="課程分類"
                onChange={handleSelectChange}
              >
                {Object.entries(CATEGORY_OPTIONS_OBJECT).map(([value, category]) => (
                  <MenuItem key={value} value={value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>


            {editData.category && (
              <TextField
                select
                label="需要科目"
                name="subjects"
                SelectProps={{ multiple: true }}
                value={Array.isArray(editData.subjects) ? editData.subjects : []}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditData({
                    ...editData,
                    subjects: Array.isArray(value) ? value : [value]
                  });
                }}
                required
                helperText="可多選，按住 Ctrl/Command 鍵選多個"
                fullWidth
              >
                {getAvailableSubjects().map((subject) => (
                  <MenuItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Box>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                🌍 地區設置
              </Typography>
              
              <FormControl fullWidth required sx={{ mb: 2 }}>
                <InputLabel>主地區</InputLabel>
                <Select
                  name="regions"
                  value={editData.regions?.[0] || ''}
                  label="主地區"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">請選擇主地區</MenuItem>
                  {regionOptions.map((regionOption) => (
                    <MenuItem key={regionOption.value} value={regionOption.value}>
                      {regionOption.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {editData.regions?.[0] && editData.regions[0] !== 'all-hong-kong' && (
                <FormControl fullWidth required>
                  <InputLabel>子地區</InputLabel>
                  <Select
                    name="subRegions"
                    multiple
                    value={Array.isArray(editData.subRegions) ? editData.subRegions : []}
                    label="子地區"
                    onChange={handleSelectChange}
                  >
                    {regionOptions.map((regionOption) => 
                      regionOption.regions && regionOption.regions.map((subRegion) => (
                        <MenuItem key={subRegion.value} value={subRegion.value}>
                          {regionOption.label} - {subRegion.label}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}
            </Box>

            <TextField
              label="預算"
              name="budget"
              type="number"
              value={editData.budget || ''}
              onChange={handleEditChange}
              required
              fullWidth
            />

            <TextField
              label="經驗要求"
              name="experience"
              value={editData.experience || ''}
              onChange={handleEditChange}
              multiline
              rows={2}
              fullWidth
            />

            <TextField
              label="詳細地址"
              name="detailedAddress"
              value={editData.detailedAddress || ''}
              onChange={handleEditChange}
              multiline
              rows={2}
              helperText="具體的上課地點或地址"
              fullWidth
            />

            <TextField
              label="開始日期"
              name="startDate"
              type="date"
              value={editData.startDate ? editData.startDate.split('T')[0] : ''}
              onChange={handleEditChange}
              InputLabelProps={{
                shrink: true,
              }}
              helperText="希望開始上課的日期"
              fullWidth
            />

            <TextField
              label="詳細描述"
              name="requirements"
              value={editData.requirements || editData.requirement || ''}
              onChange={handleEditChange}
              multiline
              rows={3}
              helperText="額外的要求或說明"
              fullWidth
            />

            <TextField
              label="申請者姓名"
              name="studentName"
              value={editData.studentId?.name || ''}
              onChange={(e) => {
                setEditData({
                  ...editData,
                  studentId: {
                    ...editData.studentId,
                    name: e.target.value
                  }
                });
              }}
              helperText="申請此案例的學生姓名"
              fullWidth
            />

            <TextField
              label="申請者電郵"
              name="studentEmail"
              type="email"
              value={editData.studentId?.email || ''}
              onChange={(e) => {
                setEditData({
                  ...editData,
                  studentId: {
                    ...editData.studentId,
                    email: e.target.value
                  }
                });
              }}
              helperText="申請者的聯絡電郵"
              fullWidth
            />

            <TextField
              label="用戶ID"
              name="userID"
              value={editData.userID || ''}
              onChange={handleEditChange}
              helperText="發布此案例的用戶ID"
              fullWidth
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={editLoading}
              >
                {editLoading ? <CircularProgress size={24} /> : '保存更改'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={editLoading}
              >
                取消編輯
              </Button>
            </Box>
          </Box>
        ) : (
          // 查看模式
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                {selectedCase.title}
              </Typography>
              <Chip
                label={getStatusLabel(selectedCase.status)}
                color={getStatusColor(selectedCase.status)}
                sx={{ mr: 1 }}
              />
              <Chip label={getTypeLabel(selectedCase.type)} color="secondary" />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                描述
              </Typography>
              <Typography>{selectedCase.description}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                分類
              </Typography>
              <Typography>{getCategoryLabel(selectedCase.category)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                子分類
              </Typography>
              <Typography>{selectedCase.subCategory ? getSubCategoryLabel(selectedCase.subCategory) : '不適用'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                科目
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedCase.subjects?.map((subject) => (
                  <Chip key={subject} label={getSubjectLabel(subject)} />
                ))}
              </Box>
            </Grid>

            {/* 地區信息 - 只在非線上教學時顯示 */}
            {!isOnlineMode && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    地區
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedCase.regions?.map((region) => (
                      <Chip key={region} label={getRegionLabel(region)} />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    子地區
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedCase.subRegions?.map((subRegion) => (
                      <Chip key={subRegion} label={getSubRegionLabel(subRegion)} />
                    ))}
                  </Box>
                </Grid>
              </>
            )}

            {/* 線上教學時顯示適用地區 */}
            {isOnlineMode && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  適用地區
                </Typography>
                <Typography color="textSecondary">
                  線上教學，全港適用
                </Typography>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                預算
              </Typography>
              <Typography>{selectedCase.budget}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                教學模式
              </Typography>
              <Typography>{getModeLabel(selectedCase.mode)}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                經驗要求
              </Typography>
              <Typography>{selectedCase.experience ? getExperienceLabel(selectedCase.experience) : '不適用'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                詳細地址
              </Typography>
              <Typography>{selectedCase.detailedAddress || '未提供詳細地址'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                開始日期
              </Typography>
              <Typography>
                {selectedCase.startDate ? new Date(selectedCase.startDate).toLocaleDateString('zh-TW') : '未指定開始日期'}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                詳細描述
              </Typography>
              <Typography>
                {selectedCase.requirements || selectedCase.requirement || '無詳細描述'}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                申請者
              </Typography>
              <Typography>
                {selectedCase.studentId?.name || selectedCase.studentId?.userId || '未指定申請者'}
              </Typography>
              {selectedCase.studentId?.email && (
                <Typography variant="body2" color="text.secondary">
                  聯絡電郵: {selectedCase.studentId.email}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                建立時間
              </Typography>
              <Typography>
                {new Date(selectedCase.createdAt).toLocaleString('zh-TW')}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                用戶ID
              </Typography>
              <Typography>
                {selectedCase.userID || selectedCase.studentId?.userId || '未指定'}
              </Typography>
            </Grid>

          </Grid>
        )}
      </Paper>

      {/* 刪除確認對話框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>確認刪除案例</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            您確定要刪除這個案例嗎？此操作無法撤銷。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            案例標題：{selectedCase?.title}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
            取消
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : '確認刪除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseDetail; 