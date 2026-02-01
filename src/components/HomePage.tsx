import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Card, CardContent, CardActionArea, Typography, Box } from '@mui/material';
import { SwapHoriz, Straighten, Calculate, Build } from '@mui/icons-material';
import { categories } from '../data/categories';

const iconMap: { [key: string]: React.ReactElement } = {
  SwapHoriz: <SwapHoriz fontSize="large" />,
  Straighten: <Straighten fontSize="large" />,
  Calculate: <Calculate fontSize="large" />,
  Build: <Build fontSize="large" />,
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Welcome to Calculator
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Choose a category to get started with your calculations.
      </Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {categories.map((category) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category.id}>
            <Card>
              <CardActionArea onClick={() => navigate(`/category/${category.id}`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {iconMap[category.icon]}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {category.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage;
