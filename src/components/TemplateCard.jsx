import React from 'react';
import { Card, CardMedia, CardContent, Typography, Chip } from '@mui/material';

const TemplateCard = ({ image, title, description }) => (
  <Card sx={{ width: 220, borderRadius: 3, boxShadow: 1 }}>
    <CardMedia
      component="img"
      height="120"
      image={image}
      alt={title}
    />
    <CardContent>
      <Chip label="Microlearning" size="small" sx={{ mb: 1 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

export default TemplateCard; 