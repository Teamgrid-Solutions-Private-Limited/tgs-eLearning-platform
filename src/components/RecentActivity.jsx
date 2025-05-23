import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import CourseCard from './CourseCard';

const recentCourses = [
    {
      image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80',
      title: 'Untitled course',
      date: 'May 23, 2025',
    },
    {
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      title: 'How to troubleshoot software',
      date: 'May 23, 2025',
    },
    {
      image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80',
      title: 'E-Learning Course Review Checklist',
      date: 'May 23, 2025',
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
      title: 'Backend Node Js',
      date: 'May 23, 2025',
    },
    {
      image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80',
      title: 'Untitled course',
      date: 'May 23, 2025',
    },
  ];

const RecentActivity = () => {
  return (
    <Box sx={{ mb: 6 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Recent activity
      </Typography>
      <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Button
        variant="text"
        sx={{ 
          color: '#222', 
          fontWeight: 500, 
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 0.5,
          width: '100px',
        }}
      >
        All courses
        {/* <HiOutlineChevronRight size={18} /> */}
      </Button>
      </Box>
    </Box>
    <Stack direction="row" spacing={3} sx={{ overflowX: 'auto', pb: 1 }}>
      {recentCourses.map((course, idx) => (
        <Box 
          key={idx} 
          sx={{ 
            minWidth: 240, 
            maxWidth: 260, 
            bgcolor: '#fff', 
            borderRadius: 2, 
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', 
            p: 2, 
            mb: 1,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)',
            }
          }}
        >
          <Box sx={{ height: 120, mb: 2, borderRadius: 2, overflow: 'hidden', background: '#f5f5f5' }}>
            <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 0.5 }}>{course.title}</Typography>
          <Typography sx={{ color: '#888', fontSize: 13, mb: 0.5 }}>Modified: {course.date}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ bgcolor: '#e3f2fd', color: '#2193b0', fontWeight: 600, fontSize: 13, borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SM</Box>
          </Box>
        </Box>
      ))}
    </Stack>
  </Box>
);
}
export default RecentActivity; 