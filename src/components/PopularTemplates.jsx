import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import TemplateCard from './TemplateCard';

const templates = [
  {
    image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80',
    title: 'E-Learning Course Review Checklist',
    description: 'Check the quality of your e-learning course.'
  },
  {
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    title: 'E-learning Accessibility Checklist',
    description: 'Ensure that your e-learning is accessible.'
  },
  {
    image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80',
    title: 'Remote Work Checklist',
    description: 'Increase your productivity in the remote setting.'
  },
  {
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
    title: 'How to create a community in Teams',
    description: 'Learn how to create teams and communities.'
  },
  {
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    title: 'Product Feature Set Checklist',
    description: 'Checklist for your product features.'
  },
];

const PopularTemplates = () => (
  <Box sx={{ mb: 5 }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
      Popular templates
    </Typography>
    <Stack direction="row" spacing={3}>
      {templates.map((template, idx) => (
        <TemplateCard key={idx} {...template} />
      ))}
    </Stack>
  </Box>
);

export default PopularTemplates; 