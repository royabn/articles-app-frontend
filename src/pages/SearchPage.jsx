import { useState } from 'react';
import {
  TextField, Button, Box, Typography, Card, CardContent, Container,
  CircularProgress, Alert, Grid, Link as MuiLink
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import api from '../services/api';

function SearchPage({handleLogout}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSaveSuccess('');
    setSearchResults([]);
    setLoading(true);
    try {
      const response = await api.get(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
        navigate('/');
      }
      setError('Failed to fetch search results.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArticle = async (article) => {
    setSaveSuccess('');
    try {
      await api.post('/articles/', {
        title: article.title,
        url: article.url,
      });
      setSaveSuccess(`"${article.title}" saved successfully!`);
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save article. It might already be saved.');
      console.error('Save article error:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Search Articles
      </Typography>
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          label="Search Keyword"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{saveSuccess}</Alert>}

      <Grid container spacing={3}>
        {searchResults.length === 0 && !loading && !error && (
          <Grid item xs={12}>
            <Typography variant="body1" align="center">
              Start searching for Wikipedia articles!
            </Typography>
          </Grid>
        )}
        {searchResults.map((article, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  <MuiLink href={article.url} target="_blank" rel="noopener" underline="hover">
                    {article.title}
                  </MuiLink>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {article.summary}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSaveArticle(article)}
                  size="small"
                >
                  Save
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default SearchPage;