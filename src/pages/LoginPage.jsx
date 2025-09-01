import { useState } from 'react';
import { TextField, Button, Typography, Card, CardContent } from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function LoginPage({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const form = new URLSearchParams();
      form.append('username', username);
      form.append('password', password);

      const response = await api.post('/token', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      localStorage.setItem('token', response.data.access_token);
      setIsLoggedIn(true);
      navigate('/search');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', err);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: 'auto', mt: 5 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default LoginPage;