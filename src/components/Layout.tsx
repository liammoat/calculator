import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  SwapHoriz,
  Straighten,
  Calculate,
} from '@mui/icons-material';
import { categories } from '../data/categories';
import { calculators } from '../data/calculators';
import Breadcrumbs from './Breadcrumbs';

const iconMap: { [key: string]: React.ReactElement } = {
  SwapHoriz: <SwapHoriz />,
  Straighten: <Straighten />,
  Calculate: <Calculate />,
};

const Layout: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredCalculators = calculators.filter(
    (calc) =>
      calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerContent = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search calculators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Divider />
      {searchQuery ? (
        <List>
          {filteredCalculators.map((calc) => (
            <ListItem key={calc.id} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(`/calculator/${calc.id}`);
                  setDrawerOpen(false);
                }}
              >
                <ListItemText primary={calc.name} secondary={calc.description} />
              </ListItemButton>
            </ListItem>
          ))}
          {filteredCalculators.length === 0 && (
            <ListItem>
              <ListItemText secondary="No calculators found" />
            </ListItem>
          )}
        </List>
      ) : (
        <>
          <Typography variant="overline" sx={{ px: 2, mt: 2, display: 'block', color: 'text.secondary' }}>
            Categories
          </Typography>
          <List>
            {categories.map((category) => (
              <ListItem key={category.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(`/category/${category.id}`);
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemIcon>{iconMap[category.icon]}</ListItemIcon>
                  <ListItemText primary={category.name} secondary={category.description} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Engineering Calculator
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        {drawerContent}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Breadcrumbs />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
