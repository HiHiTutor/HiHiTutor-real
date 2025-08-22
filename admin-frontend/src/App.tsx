import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import Statistics from './pages/Statistics';
import SearchStatistics from './pages/SearchStatistics';
import Login from './pages/Login';
import { useAppSelector } from './hooks/redux';
import CreateUser from './pages/CreateUser';
import CreateCase from './pages/CreateCase';
import NotFound from './pages/NotFound';
import TutorApplications from './pages/TutorApplications';
import TutorProfileApprovals from './pages/TutorProfileApprovals';
import AdManager from './pages/AdManager';
import AdCreate from './pages/AdCreate';
import AdEdit from './pages/AdEdit';
import CategoryManager from './pages/CategoryManager';
import RegionManager from './pages/RegionManager';
import ModeManager from './pages/ModeManager';
import TutorChangeMonitor from './pages/TutorChangeMonitor';
import TutorChangeNotification from './components/TutorChangeNotification';

// 管理員前端應用主組件
// 包含路由保護和導航邏輯

// 受保護的路由組件 - 確保只有已認證的管理員可以訪問
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? element : null;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      {/* 登入頁面 - 未認證時顯示登入，已認證時重定向到儀表板 */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
      
      {/* 受保護的管理員路由 */}
      <Route path="/" element={<ProtectedRoute element={<Layout><Dashboard /></Layout>} />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<Layout><Dashboard /></Layout>} />} />
      <Route path="/users" element={<ProtectedRoute element={<Layout><Users /></Layout>} />} />
      <Route path="/users/create" element={<ProtectedRoute element={<Layout><CreateUser /></Layout>} />} />
      <Route path="/users/:id" element={<ProtectedRoute element={<Layout><UserDetail /></Layout>} />} />
      <Route path="/cases" element={<ProtectedRoute element={<Layout><Cases /></Layout>} />} />
      <Route path="/cases/create" element={<ProtectedRoute element={<Layout><CreateCase /></Layout>} />} />
      <Route path="/cases/:id" element={<ProtectedRoute element={<Layout><CaseDetail /></Layout>} />} />
      <Route path="/statistics" element={<ProtectedRoute element={<Layout><Statistics /></Layout>} />} />
      <Route path="/search-statistics" element={<ProtectedRoute element={<Layout><SearchStatistics /></Layout>} />} />
      <Route path="/tutor-applications" element={<ProtectedRoute element={<Layout><TutorApplications /></Layout>} />} />
      <Route path="/tutor-profile-approvals" element={<ProtectedRoute element={<Layout><TutorProfileApprovals /></Layout>} />} />
      <Route path="/AdManager" element={<ProtectedRoute element={<Layout><AdManager /></Layout>} />} />
      <Route path="/ad-create" element={<ProtectedRoute element={<Layout><AdCreate /></Layout>} />} />
      <Route path="/ad-edit/:id" element={<ProtectedRoute element={<Layout><AdEdit /></Layout>} />} />
      <Route path="/category-manager" element={<ProtectedRoute element={<Layout><CategoryManager /></Layout>} />} />
      <Route path="/region-manager" element={<ProtectedRoute element={<Layout><RegionManager /></Layout>} />} />
      <Route path="/mode-manager" element={<ProtectedRoute element={<Layout><ModeManager /></Layout>} />} />
      <Route path="/tutor-change-monitor" element={<ProtectedRoute element={<Layout><TutorChangeMonitor /></Layout>} />} />
      
      {/* 404 頁面 - 處理未找到的路由 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App; 