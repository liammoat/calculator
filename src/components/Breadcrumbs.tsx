import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { categories } from '../data/categories';
import { calculators } from '../data/calculators';

const Breadcrumbs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);

  const getBreadcrumbs = () => {
    const crumbs: Array<{ label: string; path: string; icon?: React.ReactElement }> = [
      { label: 'Home', path: '/', icon: <Home sx={{ mr: 0.5, fontSize: 20 }} /> },
    ];

    if (pathParts[0] === 'category' && pathParts[1]) {
      const category = categories.find((c) => c.id === pathParts[1]);
      if (category) {
        crumbs.push({ label: category.name, path: `/category/${category.id}` });
      }
    }

    if (pathParts[0] === 'calculator' && pathParts[1]) {
      const calculator = calculators.find((c) => c.id === pathParts[1]);
      if (calculator) {
        const category = categories.find((c) => c.id === calculator.category);
        if (category) {
          crumbs.push({ label: category.name, path: `/category/${category.id}` });
        }
        crumbs.push({ label: calculator.name, path: `/calculator/${calculator.id}` });
      }
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <MuiBreadcrumbs
      separator={<NavigateNext fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return isLast ? (
          <Typography
            key={crumb.path}
            color="text.primary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            {crumb.icon}
            {crumb.label}
          </Typography>
        ) : (
          <Link
            key={crumb.path}
            component="button"
            variant="body1"
            onClick={() => navigate(crumb.path)}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            {crumb.icon}
            {crumb.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
