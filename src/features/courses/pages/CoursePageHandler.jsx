// src/features/courses/pages/CoursePageHandler.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import CourseGenerationPage from './CourseGenerationPage';
import CoursePlanPage from './CoursePlanPage';
import { Box, CircularProgress } from '@mui/material';

const CoursePageHandler = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await apiClient.get(`/courses/${courseId}`);
        const courseData = response.data;
        setCourse(courseData);
        
        // LOGIQUE CORRIGÉE : on vérifie plusieurs critères pour déterminer si la génération est terminée
        const hasLevels = courseData.levels && courseData.levels.length > 0;
        const hasCharacterSets = courseData.character_sets && courseData.character_sets.length > 0;
        const generationComplete = courseData.generation_status === 'completed';
        
        // Le cours est considéré comme généré si :
        // 1. Il a un statut 'completed' OU
        // 2. Il a du contenu (levels ou character_sets pour les langues)
        const courseIsReady = generationComplete || hasLevels || hasCharacterSets;
        
        setIsGenerating(!courseIsReady);
      } catch (error) {
        console.error('Erreur lors du chargement du cours:', error);
        // En cas d'erreur, on affiche la page de génération
        setIsGenerating(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={48} />
        <Box sx={{ textAlign: 'center' }}>
          <Box variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Chargement du cours...
          </Box>
        </Box>
      </Box>
    );
  }

  // Si le cours est en génération, affiche la page de génération
  if (isGenerating) {
    return <CourseGenerationPage />;
  }

  // Sinon, affiche la page de cours normale
  return <CoursePlanPage course={course} />;
};

export default CoursePageHandler;