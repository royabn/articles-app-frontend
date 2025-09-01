import { useState } from 'react';
import { TextField, Button, Typography, Card, CardContent, Alert } from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await api.post('/register', { username, password });
      setSuccess('Registration successful! Please log in.');
      setTimeout(() => {
        navigate('/');
      }, 1000); // Redirect to login after a second
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', err);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: 'auto', mt: 5 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Register
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
          <TextField
            label="Confirm Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
            Register
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default RegisterPage;