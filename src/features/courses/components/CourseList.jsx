import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import CapsuleList from '../../capsules/components/CapsuleList';

const CapsulesPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bibliothèque des Capsules
        </Typography>
        
        {/* Liste des capsules de l'utilisateur */}
        <CapsuleList listType="my-capsules" />
        
        
      </Box>
    </Container>
  );
};

export default CapsulesPage;