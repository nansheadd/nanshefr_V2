// Fichier: src/features/courses/components/DynamicPersonalizationForm.jsx
import React from 'react';
import { TextField, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';

const DynamicPersonalizationForm = ({ formSchema, courseData, setCourseData }) => {

  const handleDetailsChange = (e) => {
    setCourseData({
      ...courseData,
      personalization_details: {
        ...courseData.personalization_details,
        [e.target.name]: e.target.value,
      },
    });
  };

  if (!formSchema || !formSchema.fields || formSchema.fields.length === 0) {
    return <Typography>La personnalisation n'est pas disponible pour ce sujet pour le moment.</Typography>;
  }

  return (
    <div>
      <Typography gutterBottom>
        Parfait ! Pour adapter le cours sur **{courseData.title}** (catégorie : {formSchema.category}), veuillez répondre à ces questions :
      </Typography>

      {formSchema.fields.map((field) => {
        const value = courseData.personalization_details[field.name] || '';

        if (field.type === 'select') {
          return (
            <FormControl key={field.name} fullWidth margin="normal">
              <InputLabel>{field.label}</InputLabel>
              <Select name={field.name} value={value} label={field.label} onChange={handleDetailsChange}>
                {field.options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        }

        if (field.type === 'textarea') {
          return (
            <TextField
              key={field.name} fullWidth margin="normal" multiline rows={4}
              name={field.name} label={field.label} value={value} onChange={handleDetailsChange}
            />
          );
        }

        // Par défaut, on utilise un champ de texte simple
        return (
          <TextField
            key={field.name} fullWidth margin="normal"
            name={field.name} label={field.label} value={value} onChange={handleDetailsChange}
          />
        );
      })}
    </div>
  );
};

export default DynamicPersonalizationForm;