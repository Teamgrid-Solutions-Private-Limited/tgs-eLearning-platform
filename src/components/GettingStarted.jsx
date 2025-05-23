import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

const GettingStarted = () => (
  <Card sx={{ minHeight: 120 }}>
    <CardContent>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Getting started
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="Build your course" secondary="2 min" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Authoring tool guide" secondary="Course template" />
        </ListItem>
      </List>
      <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }}>
        More resources
      </Typography>
    </CardContent>
  </Card>
);

export default GettingStarted; 