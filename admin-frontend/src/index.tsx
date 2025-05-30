import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import { setAuth } from './store/slices/authSlice';
import theme from './theme';
import App from './App';

// Check for existing auth token and user data
const token = localStorage.getItem('adminToken');
const userDataStr = localStorage.getItem('adminUser');

if (token && userDataStr) {
  try {
    const userData = JSON.parse(userDataStr);
    store.dispatch(setAuth({
      isAuthenticated: true,
      user: userData
    }));
  } catch (error) {
    console.error('Failed to parse stored user data:', error);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <App />
        </Router>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
); 