import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
// import Contact from './pages/Contact'; // 已廢除 contact 頁面
import Legal from './pages/Legal';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import FindTutor from './pages/FindTutor';
import FindStudent from './pages/FindStudent';
import TutorDetail from './pages/TutorDetail';
import StudentDetail from './pages/StudentDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          {/* <Route path="/contact" element={<Contact />} /> */} {/* 已廢除 contact 頁面 */}
          <Route path="/legal" element={<Legal />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/find-tutor" element={<FindTutor />} />
          <Route path="/find-student" element={<FindStudent />} />
          <Route path="/tutor/:id" element={<TutorDetail />} />
          <Route path="/student/:id" element={<StudentDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </Router>
    </ThemeProvider>
  );
};

export default App; 