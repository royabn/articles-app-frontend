import { useState, useEffect } from 'react';
import {
  Typography, Container, CircularProgress, Alert, Grid, Card, CardContent,
  Chip, Box, Button, TextField, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Snackbar, Link as MuiLink
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';

function SavedArticlesPage({handleLogout}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // For editing tags
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentArticleToEdit, setCurrentArticleToEdit] = useState(null);
  const [editTagsInput, setEditTagsInput] = useState('');

  // For deleting articles
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  useEffect(() => {
    fetchSavedArticles();
  }, []);

  const fetchSavedArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/articles/');
      response.data = response.data.map(x => {
        return {...x, id: BigInt(x.id)}
      });
      setArticles(response.data);
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
        navigate('/');
      }
      setError('Failed to fetch saved articles.');
      console.error('Fetch saved articles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTags = async (articleId) => {
    setSnackbar({ open: true, message: 'Generating tags...', severity: 'info' });
    try {
      const response = await api.post(`/articles/${articleId}/generate_tags`);
      setArticles((prev) =>
        prev.map((art) => (art.id === articleId ? response.data : art))
      );
      setSnackbar({ open: true, message: 'Tags generated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to generate tags.', severity: 'error' });
      console.error('Generate tags error:', err);
    }
  };

  const handleOpenEditDialog = (article) => {
    setCurrentArticleToEdit(article);
    setEditTagsInput(article.tags.map(tag => tag.name).join(', '));
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentArticleToEdit(null);
    setEditTagsInput('');
  };

  const handleSaveTags = async () => {
    if (!currentArticleToEdit) return;

    const newTagNames = editTagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setSnackbar({ open: true, message: 'Saving tags...', severity: 'info' });

    try {
      const response = await api.put(`/articles/${currentArticleToEdit.id}/tags`, newTagNames);
      setArticles((prev) =>
        prev.map((art) => (art.id === currentArticleToEdit.id ? response.data : art))
      );
      setSnackbar({ open: true, message: 'Tags updated successfully!', severity: 'success' });
      handleCloseEditDialog();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update tags.', severity: 'error' });
      console.error('Update tags error:', err);
    }
  };

  const handleOpenConfirmDeleteDialog = (article) => {
    setArticleToDelete(article);
    setOpenConfirmDeleteDialog(true);
  };

  const handleCloseConfirmDeleteDialog = () => {
    setOpenConfirmDeleteDialog(false);
    setArticleToDelete(null);
  };

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;

    setSnackbar({ open: true, message: `Deleting "${articleToDelete.title}"...`, severity: 'info' });
    try {
      await api.delete(`/articles/${articleToDelete.id}`);
      setArticles((prev) => prev.filter((art) => art.id !== articleToDelete.id));
      setSnackbar({ open: true, message: 'Article deleted successfully!', severity: 'success' });
      handleCloseConfirmDeleteDialog();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete article.', severity: 'error' });
      console.error('Delete article error:', err);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Your Saved Articles
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && articles.length === 0 && (
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 5 }}>
          You haven't saved any articles yet. Go to the Search page to save some!
        </Typography>
      )}

      <Grid container spacing={3}>
        {articles.map((article) => (
          <Grid item xs={12} sm={6} md={4} key={article.id}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  <MuiLink href={article.url} target="_blank" rel="noopener" underline="hover">
                    {article.title}
                  </MuiLink>
                </Typography>
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Tags:</Typography>
                  {article.tags.length > 0 ? (
                    article.tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        icon={<LabelIcon />}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No tags yet.</Typography>
                  )}
                </Box>
              </CardContent>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<AutoFixHighIcon />}
                  onClick={() => handleGenerateTags(article.id)}
                  size="small"
                >
                  Auto-Tag
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenEditDialog(article)}
                  size="small"
                >
                  Edit Tags
                </Button>
                <Button
                  variant="outlined"
                  color="error" // Use error color for delete
                  startIcon={<DeleteIcon />}
                  onClick={() => handleOpenConfirmDeleteDialog(article)}
                  size="small"
                >
                  Delete
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Tags Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Tags for "{currentArticleToEdit?.title}"</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter tags separated by commas.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Tags (comma-separated)"
            type="text"
            fullWidth
            variant="outlined"
            value={editTagsInput}
            onChange={(e) => setEditTagsInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveTags} variant="contained" color="primary">Save Tags</Button>
        </DialogActions>
      </Dialog>

       {/* Confirm Delete Dialog */}
      <Dialog
        open={openConfirmDeleteDialog}
        onClose={handleCloseConfirmDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the article "{articleToDelete?.title}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteArticle} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleSnackbarClose}>
              <CloseIcon fontSize="small" />
            </Button>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SavedArticlesPage;