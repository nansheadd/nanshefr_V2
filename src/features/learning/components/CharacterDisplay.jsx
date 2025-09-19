import React from 'react';
import { Typography, Paper, Grid, Card, CardContent } from '@mui/material';

const CharacterDisplay = ({ content }) => {
  const characters = content.characters || [];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Caractères à Maîtriser
      </Typography>
      <Grid container spacing={2}>
        {characters.map((char, index) => (
          <Grid item xs={4} sm={3} md={2} key={index}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4">{char.character}</Typography>
                <Typography color="text.secondary">{char.romaji}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default CharacterDisplay;