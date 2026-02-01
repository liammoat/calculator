import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Grid, Card, CardContent, CardActionArea, Typography, Box } from '@mui/material';
import { categories } from '../data/categories';
import { calculators } from '../data/calculators';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const category = categories.find((c) => c.id === categoryId);
  const categoryCalculators = calculators.filter((c) => c.category === categoryId);

  if (!category) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h5">Category not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        {category.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {category.description}
      </Typography>
      {categoryCalculators.length === 0 ? (
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No calculators available in this category yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {categoryCalculators.map((calculator) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={calculator.id}>
              <Card>
                <CardActionArea onClick={() => navigate(`/calculator/${calculator.id}`)}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {calculator.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {calculator.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CategoryPage;
