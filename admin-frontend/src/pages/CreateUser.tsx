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
  // ====== 新增：科目與地區選項 ======
  const CATEGORY_OPTIONS = [
    '幼兒中文','幼兒英文','幼兒數學','拼音／注音','邏輯思維訓練','面試技巧訓練','幼稚園功課輔導',
    '中文','英文','數學','常識','普通話','常識／STEM','其他全科補習',
    '通識教育','物理','化學','生物','經濟','地理','歷史','中國歷史','BAFS','ICT','綜合科學','其他 DSE 專科補習','全科補習',
    '繪畫','音樂（鋼琴、結他、小提琴等）','跳舞／舞蹈訓練','戲劇／演講','編程／STEM','外語（韓文／日文／法文／德文等）','魔術／棋藝','攝影／影片剪接',
    '大學通識','大學統計與數學','經濟學','資訊科技','商科（會計、管理、市場學等）','工程科目','論文指導／報告協助',
    '商務英文','生活英語會話','廣東話／普通話','興趣／第二語言學習','電腦技能（Excel／Photoshop 等）','考試準備（IELTS／TOEFL／JLPT）'
  ];
  const REGION_OPTIONS = [
    '中環','上環','西環','西營盤','石塘咀','灣仔','銅鑼灣','金鐘','跑馬地','天后','大坑','北角','鰂魚涌','太古','西灣河','筲箕灣','柴灣','杏花邨',
    '尖沙咀','佐敦','油麻地','旺角','太子','深水埗','長沙灣','紅磡','土瓜灣','何文田','九龍塘','新蒲崗','鑽石山','樂富','慈雲山','牛頭角','藍田','觀塘','油塘',
    '沙田','馬鞍山','大圍','火炭','大埔','太和','粉嶺','上水','將軍澳','坑口','寶琳','康城','屯門','兆康','元朗','朗屏','天水圍','荃灣','葵芳','葵涌','青衣',
    '東涌','梅窩','大澳','坪洲','長洲','南丫島','愉景灣','貝澳'
  ];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    userType: 'student',
    tutorProfile: {
      subjects: [], // 多選
      sessionRate: '',
      regions: [] // 多選
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name === 'subjects' || name === 'regions') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          [name]: value
        }
      });
    } else if (name === 'sessionRate') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          sessionRate: value
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
          subjects: formData.tutorProfile.subjects,
          sessionRate: Number(formData.tutorProfile.sessionRate),
          regions: formData.tutorProfile.regions
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
                  select
                  label="可教授科目 (多選)"
                  name="subjects"
                  SelectProps={{ multiple: true }}
                  value={formData.tutorProfile.subjects}
                  onChange={handleChange}
                  required
                  helperText="可多選，按住 Ctrl/Command 鍵選多個"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="時薪 (sessionRate)"
                  name="sessionRate"
                  type="number"
                  value={formData.tutorProfile.sessionRate}
                  onChange={handleChange}
                  required
                  helperText="堂費不能少於 100 元"
                />
                <TextField
                  select
                  label="地區 (多選)"
                  name="regions"
                  SelectProps={{ multiple: true }}
                  value={formData.tutorProfile.regions}
                  onChange={handleChange}
                  required
                  helperText="可多選，按住 Ctrl/Command 鍵選多個"
                >
                  {REGION_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
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