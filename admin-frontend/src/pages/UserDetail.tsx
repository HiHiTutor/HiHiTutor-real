import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { usersAPI } from '../services/api';
import { setSelectedUser } from '../store/slices/userSlice';
import { User } from '../types';

interface EditFormData {
  name: string;
  email: string;
  phone: string;
  userType: 'student' | 'tutor' | 'organization' | 'admin';
  role: 'user' | 'admin';
  status: 'active' | 'pending' | 'blocked';
  avatar: string;
  isActive: boolean;
  organizationDocuments: {
    businessRegistration: string;
    addressProof: string;
  };
  tutorProfile: {
    education: string;
    experience: string;
    specialties: string[];
    documents: string[];
    applicationStatus: 'pending' | 'approved' | 'rejected';
  };
  subjects: string[];
  teachingAreas: string[];
  teachingMethods: string[];
  experience: number;
  rating: number;
  introduction: string;
  qualifications: string[];
  hourlyRate: number;
  availableTime: string[];
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedUser } = useAppSelector((state) => state.users);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    name: '',
    email: '',
    phone: '',
    userType: 'student',
    role: 'user',
    status: 'active',
    avatar: '',
    isActive: true,
    organizationDocuments: {
      businessRegistration: '',
      addressProof: ''
    },
    tutorProfile: {
      education: '',
      experience: '',
      specialties: [],
      documents: [],
      applicationStatus: 'pending'
    },
    subjects: [],
    teachingAreas: [],
    teachingMethods: [],
    experience: 0,
    rating: 0,
    introduction: '',
    qualifications: [],
    hourlyRate: 0,
    availableTime: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (id) {
        const response = await usersAPI.getUserById(id);
        if (response.data.success && response.data.user) {
          const userData = response.data.user;
          dispatch(setSelectedUser(userData as User));
          setEditForm({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            userType: userData.userType,
            status: userData.status,
            avatar: userData.avatar,
            isActive: userData.status === 'active',
            organizationDocuments: userData.organizationDocuments || {
              businessRegistration: '',
              addressProof: ''
            },
            tutorProfile: userData.tutorProfile || {
              education: '',
              experience: '',
              specialties: [],
              documents: [],
              applicationStatus: 'pending'
            },
            subjects: userData.subjects || [],
            teachingAreas: userData.teachingAreas || [],
            teachingMethods: userData.teachingMethods || [],
            experience: userData.experience || 0,
            rating: userData.rating || 0,
            introduction: userData.introduction || '',
            qualifications: userData.qualifications || [],
            hourlyRate: userData.hourlyRate || 0,
            availableTime: userData.availableTime || []
          });
        } else {
          setError('無法獲取用戶資料');
        }
      }
    } catch (err) {
      setError('獲取用戶資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [dispatch, id]);

  const handleSubmit = async () => {
    if (!id) {
      setError('用戶ID不存在');
      return;
    }

    try {
      setLoading(true);
      const response = await usersAPI.updateUser(id, editForm as Partial<User>);
      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        dispatch(setSelectedUser(userData as User));
        setIsEditDialogOpen(false);
        setError(null);
      } else {
        setError(response.data.message || '更新失敗');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setEditForm(prev => ({
        ...prev,
        [name]: value as 'user' | 'admin'
      }));
    } else if (name === 'userType') {
      setEditForm(prev => ({
        ...prev,
        [name]: value as 'student' | 'tutor' | 'organization' | 'admin'
      }));
    } else if (name === 'status') {
      setEditForm(prev => ({
        ...prev,
        [name]: value as 'active' | 'pending' | 'blocked'
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpgradeApproval = async (type: string) => {
    try {
      if (id) {
        await usersAPI.approveUserUpgrade(id, type);
        const response = await usersAPI.getUserById(id);
        dispatch(setSelectedUser(response.data));
      }
    } catch (error) {
      console.error('Error approving upgrade:', error);
    }
  };

  if (!selectedUser) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">User Details</Typography>
        <Button variant="outlined" onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography color="textSecondary">Name</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedUser.name}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Email</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedUser.email}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Phone</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedUser.phone}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">User Type</Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip label={selectedUser.userType} color="primary" />
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Role</Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip label={selectedUser.role} color="secondary" />
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Status</Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip
                  label={selectedUser.status}
                  color={selectedUser.status === 'active' ? 'success' : 'error'}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => setIsEditDialogOpen(true)}
              >
                Edit User
              </Button>
            </Box>
          </Paper>
        </Grid>

        {selectedUser.upgradeStatus === 'pending' && selectedUser.requestedRole && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upgrade Request
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  Requested Role
                </Typography>
                <Typography>{selectedUser.requestedRole}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    if (selectedUser.requestedRole) {
                      handleUpgradeApproval(selectedUser.requestedRole);
                    }
                  }}
                >
                  Approve
                </Button>
                <Button variant="contained" color="error">
                  Reject
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={editForm.name}
              onChange={handleInputChange}
              name="name"
            />
            <TextField
              label="Email"
              fullWidth
              value={editForm.email}
              onChange={handleInputChange}
              name="email"
            />
            <TextField
              label="Phone"
              fullWidth
              value={editForm.phone}
              onChange={handleInputChange}
              name="phone"
            />
            <TextField
              select
              label="User Type"
              fullWidth
              value={editForm.userType}
              onChange={handleInputChange}
              name="userType"
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="tutor">Tutor</MenuItem>
              <MenuItem value="organization">Organization</MenuItem>
            </TextField>
            <TextField
              select
              label="Role"
              fullWidth
              value={editForm.role}
              onChange={handleInputChange}
              name="role"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              fullWidth
              value={editForm.status}
              onChange={handleInputChange}
              name="status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDetail; 