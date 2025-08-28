// src/features/dashboard/components/NavigationTabs.jsx
import React from 'react';
import { Tabs, Tab, Paper, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PublicIcon from '@mui/icons-material/Public';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(1),
  },
  '& .MuiTab-root': {
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    minHeight: 56,
    margin: theme.spacing(0, 0.5),
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'translateY(-2px)',
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      }
    }
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  }
}));

const NavigationContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.divider}30`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  position: 'sticky',
  top: 20,
  zIndex: 100,
}));

const tabs = [
  { label: 'Vue d\'ensemble', icon: <DashboardIcon /> },
  { label: 'Coach IA', icon: <SmartToyIcon /> },
  { label: 'Ma Bibliothèque', icon: <LibraryBooksIcon /> },
  { label: 'Cours Publics', icon: <PublicIcon /> },
  { label: 'Créer un Cours', icon: <AddCircleOutlineIcon /> },
];

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <NavigationContainer elevation={0}>
      <StyledTabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            sx={{
              '& .MuiTab-iconWrapper': {
                marginRight: 1,
                marginBottom: 0
              }
            }}
          />
        ))}
      </StyledTabs>
    </NavigationContainer>
  );
};

export default NavigationTabs;