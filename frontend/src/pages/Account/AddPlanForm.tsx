import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { planService } from '../../services/api';
import { Plan } from '../../services/Plan';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Grid, 
  FormControlLabel, 
  Checkbox, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Snackbar, 
  Alert, 
  Divider 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const AddPlanForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Omit<Plan, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: {
      is_active: true,
      is_default: false,
      features: []
    }
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const onSubmit = async (data: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => {
    if (features.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add at least one feature',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const planData = {
        ...data,
        features,
        price: Number(data.price),
        duration_days: Number(data.duration_days)
      };

      await planService.createPlan(planData);
      
      setSnackbar({
        open: true,
        message: 'Plan created successfully!',
        severity: 'success'
      });
      
      reset();
      setFeatures([]);
    } catch (error) {
      console.error('Error creating plan:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create plan. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
        Add New Plan
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Plan Name"
              variant="outlined"
              {...register('name', { required: 'Plan name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              {...register('description', { required: 'Description is required' })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Price ($)"
              type="number"
              inputProps={{ step: "0.01", min: 0 }}
              variant="outlined"
              {...register('price', { 
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' }
              })}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Duration (days)"
              type="number"
              inputProps={{ min: 1 }}
              variant="outlined"
              {...register('duration_days', { 
                required: 'Duration is required',
                min: { value: 1, message: 'Duration must be at least 1 day' }
              })}
              error={!!errors.duration_days}
              helperText={errors.duration_days?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Features
            </Typography>
            
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <TextField
                fullWidth
                label="Add feature"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddFeature}
                disabled={!newFeature.trim()}
                startIcon={<AddCircleIcon />}
              >
                Add
              </Button>
            </Box>

            {features.length > 0 ? (
              <List dense sx={{ border: '1px solid #eee', borderRadius: 1 }}>
                {features.map((feature, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No features added yet
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  {...register('is_active')}
                />
              }
              label="Active Plan"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  {...register('is_default')}
                />
              }
              label="Default Plan"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || features.length === 0}
          >
            {loading ? 'Creating...' : 'Create Plan'}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddPlanForm;