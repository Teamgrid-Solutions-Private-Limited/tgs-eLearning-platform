import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';

const CourseCard = ({ image, title, date }) => (
  <Card sx={{ width: 220, borderRadius: 3, boxShadow: 1 }}>
    <CardMedia
      component="img"
      height="120"
      image={image}
      alt={title}
    />
    <CardContent>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Modified: {date}
      </Typography>
    </CardContent>
  </Card>
);

export default CourseCard; 