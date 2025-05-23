import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const WhatsNew = () => (
  <Card sx={{ mb: 3, minHeight: 120 }}>
    <CardContent>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        What's new
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Stay tuned for updates and new features!
      </Typography>
    </CardContent>
  </Card>
);

export default WhatsNew; 