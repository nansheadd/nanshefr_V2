// Fichier à créer : nanshe/frontend/src/features/courses/pages/ChapterPageSwitcher.jsx (NOUVEAU)

import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, CircularProgress, Alert } from '@mui/material';

// Importez les deux pages de chapitre
import ChapterViewPage from './ChapterViewPage';
import LanguageChapterViewPage from './LanguageChapterViewPage';

// Cette fonction va juste récupérer le type de cours, c'est très léger
const fetchChapterCourseType = async (chapterId) => {
  // Note: On pourrait créer un endpoint API dédié juste pour ça pour être ultra-optimisé,
  // mais pour l'instant, récupérer le chapitre entier est acceptable.
  const { data } = await apiClient.get(`/chapters/${chapterId}`);
  return data.level.course.course_type; // On a besoin de remonter la hiérarchie des données
};

const ChapterPageSwitcher = () => {
    const { chapterId } = useParams();

    const { data: courseType, isLoading, isError } = useQuery({
        queryKey: ['chapterCourseType', chapterId],
        queryFn: () => fetchChapterCourseType(chapterId),
    });

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (isError) {
        return <Alert severity="error">Impossible de déterminer le type de cours pour ce chapitre.</Alert>;
    }

    // --- LA LOGIQUE D'AIGUILLAGE ---
    if (courseType === 'langue') {
        return <LanguageChapterViewPage />;
    } else {
        return <ChapterViewPage />;
    }
};

export default ChapterPageSwitcher;