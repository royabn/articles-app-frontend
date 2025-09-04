import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import SavedArticlesPage from './pages/SavedArticlesPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Articles Bookmark App
          </Typography>
          {!isLoggedIn ? (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/register">Register</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/search">Search</Button>
              <Button color="inherit" component={Link} to="/saved">Saved Articles</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<ProtectedRoute><SearchPage handleLogout={handleLogout}/></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><SavedArticlesPage handleLogout={handleLogout}/></ProtectedRoute>} />
          <Route path="/" element={isLoggedIn ? <ProtectedRoute><SearchPage handleLogout={handleLogout} /></ProtectedRoute> : <LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
      </Container>
    </Box>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;