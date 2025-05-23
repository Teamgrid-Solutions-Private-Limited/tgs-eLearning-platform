import React from 'react';
import WhatsNew from './WhatsNew';
import GettingStarted from './GettingStarted';
import { Box } from '@mui/material';

const Sidebar = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <WhatsNew />
    <GettingStarted />
  </Box>
);

export default Sidebar; 