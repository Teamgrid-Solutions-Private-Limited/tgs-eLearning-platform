import React from 'react';
import { Box, Typography, Paper, List, ListItem } from '@mui/material';
import { BsPencilSquare, BsFileEarmarkText } from 'react-icons/bs';
import { RiRobot2Line } from 'react-icons/ri';
import { HiOutlinePresentationChartBar } from 'react-icons/hi2';

const options = [
  {
    icon: <BsPencilSquare size={20} />,
    title: 'Start from scratch',
    description: 'Create your course the way you want, step by step',
  },
  {
    icon: <BsFileEarmarkText size={20} />,
    title: 'Use a template',
    description: 'Pick any template and customize it to suit your e-learning needs',
  },
  {
    icon: <RiRobot2Line size={20} />,
    title: 'Use Course Builder',
    description: 'Turn your ideas and existing documents into a course',
    badge: 'EasyAI',
  },
  {
    icon: <HiOutlinePresentationChartBar size={20} />,
    title: 'Import PowerPoint',
    description: 'Convert your presentations into e-learning courses',
  },
];

const CreateCourseOptions = ({ onClose }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: '100%',
        right: 0,
        width: '400px',
        mt: 1,
        borderRadius: 2,
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      <List sx={{ p: 0 }}>
        {options.map((option, index) => (
          <ListItem
            key={index}
            sx={{
              p: 2,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(67, 183, 122, 0.04)',
              },
              display: 'flex',
              gap: 2,
            }}
          >
            <Box sx={{ 
              color: '#43b77a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {option.icon}
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '15px' }}>
                  {option.title}
                </Typography>
                {option.badge && (
                  <Box
                    sx={{
                      bgcolor: '#43b77a',
                      color: 'white',
                      px: 1,
                      py: 0.2,
                      borderRadius: 1,
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {option.badge}
                  </Box>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                {option.description}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default CreateCourseOptions; 