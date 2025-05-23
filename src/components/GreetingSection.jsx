import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import CreateCourseOptions from './CreateCourseOptions';

const GreetingSection = () => {
  const [showCreateOptions, setShowCreateOptions] = React.useState(false);

  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between' , mb: 5, position: 'relative' }}>
    <Box>
    <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
      Hello, Silpi
    </Typography>
    {/* <Box sx={{ }}> */}
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      Turn your expertise into engaging courses—quick and easy!
    </Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        variant="contained"
        onClick={() => setShowCreateOptions(!showCreateOptions)}
        size="small"
        sx={{
          bgcolor: '#43b77a',
          borderRadius: 20,
          px: 3,
          py: 1.2,
          width: '200px',
          height: '40px',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: 15,
          boxShadow: 'none',
          '&:hover': { bgcolor: '#2e7d32' },
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* <Box component="span" sx={{ fontSize: 20 }}>+</Box> */}
        Create course
      </Button>
    </Box>
    {/* </Box> */}
    
    {/* Create Course Options Popup */}
    {showCreateOptions && (
      <CreateCourseOptions onClose={() => setShowCreateOptions(false)} />
    )}
  </Box>
);
}

export default GreetingSection; 