import * as React from 'react';
import { Box, Typography, Button, Avatar, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
  { label: 'Home', path: '/' },
  { label: 'Courses', path: '/courses' },
  { label: 'My library', path: '/library' },
  { label: 'My organization', path: '/organization' },
  { label: 'Learners', path: '/learners' }
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#fff',
        borderBottom: '1px solid #ececec',
        height: '73px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          maxWidth: '1800px',
          width: '100%',
          mx: 'auto',
          px: 4,
          display: 'grid',
          gridTemplateColumns: '240px 1fr 360px',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Left section with logo */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => handleNavigation('/')}
        >
          <Box
            sx={{
              width: 45,
              height: 45,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6dd5ed 0%,rgb(1, 3, 70) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px 0 rgba(33, 147, 176, 0.15)',
              transition: 'box-shadow 0.2s',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 20, lineHeight: 1, letterSpacing: 1 }}>
              tgs
            </Typography>
          </Box>
        </Box>

        {/* Center Menu */}
        <Box sx={{
            width: '80%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
        }}>
          {menuItems.map((item) => (
            <Typography
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              sx={{
                textAlign: 'center',
                fontWeight: location.pathname === item.path ? 700 : 500,
                color: location.pathname === item.path ? '#2193b0' : '#666',
                fontSize: '16px',
                cursor: 'pointer',
                py: 3,
                px: 1.5,
                textDecoration: 'none',
                borderBottom: location.pathname === item.path ? '2.5px solid #2193b0' : '2.5px solid transparent',
                borderRadius: '2px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content',
                '&:hover': {
                  color: '#2193b0',
                }
              }}
            >
              {item.label}
            </Typography>
          ))}
        </Box>

        {/* Right section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          gap: 1,
        }}>
          {/* <Typography sx={{ 
            color: '#666', 
            fontSize: '14px', 
            whiteSpace: 'nowrap',
          }}>
            5 days until trial ends
          </Typography> */}
          {/* <Button
            variant="outlined"
            size="small"
            sx={{
              borderColor: '#2193b0',
              color: '#2193b0',
              borderRadius: '20px',
              fontSize: '13px',
              textTransform: 'none',
              px: 1.2,
              py: 0.2,
              width: '90px',
              borderWidth: 2,
              height: '32px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px 0 rgba(33, 147, 176, 0.10)',
              fontWeight: 600,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: '#6dd5ed',
                backgroundColor: 'rgba(33, 147, 176, 0.07)',
                color: '#2193b0',
                boxShadow: '0 4px 16px 0 rgba(33, 147, 176, 0.15)',
              }
            }}
          >
            Upgrade
          </Button> */}
          <Box
            sx={{
              color: '#2193b0',
              ml: 1,
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(33, 147, 176, 0.07)',
                borderRadius: '50%',
              },
              width: 40,
              height: 40,
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <Badge 
              badgeContent={3} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '10px',
                  height: '16px',
                  width: '16px',
                  borderRadius: '50%',
                  padding: 0,
                  minWidth: 'unset',
                  top: '1px',
                  left: '4px',
                  boxShadow: '0 0 0 2px #fff',
                }
              }}
            >
              <NotificationsIcon sx={{ fontSize: 26 }} />
            </Badge>
          </Box>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: '#e3f2fd',
              color: '#2193b0',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              ml: 1,
              boxShadow: '0 2px 8px 0 rgba(33, 147, 176, 0.10)',
              transition: 'background 0.2s',
              '&:hover': {
                bgcolor: '#bbdefb',
              }
            }}
          >
            SM
          </Avatar>
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar; 