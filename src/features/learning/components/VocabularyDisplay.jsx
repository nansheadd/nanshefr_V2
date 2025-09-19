import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const VocabularyDisplay = ({ content }) => {
  const items = content.items || [];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Vocabulaire Clé
      </Typography>
      <List>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={`${item.word} (${item.reading})`}
                secondary={item.meaning}
              />
            </ListItem>
            {index < items.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default VocabularyDisplay;