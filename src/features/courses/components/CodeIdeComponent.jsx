import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, useTheme, Tabs, Tab, Alert, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Editor from '@monaco-editor/react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import axios from 'axios';

const CodeIdeComponent = ({ component }) => {
  const theme = useTheme();
  const content = component.content_json || {};
  const [code, setCode] = useState(content.scaffolding_code || '');
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [testResults, setTestResults] = useState(null);

  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);
  const fitAddon = useRef(null);

  useEffect(() => {
    // ... (l'initialisation du terminal reste la même)
    if (terminalRef.current && !xtermInstance.current) {
      const term = new Terminal({ theme: { background: '#1e1e1e', foreground: '#d4d4d4' }, fontFamily: 'monospace', fontSize: 14, rows: 10 });
      const addon = new FitAddon();
      fitAddon.current = addon;
      term.loadAddon(addon);
      term.open(terminalRef.current);
      addon.fit();
      xtermInstance.current = term;
      xtermInstance.current.writeln('Bienvenue dans la console !');
    }
    const handleResize = () => fitAddon.current?.fit();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const writeToTerminal = (stdout, stderr) => {
    if (xtermInstance.current) {
      xtermInstance.current.clear();
      if (stdout) xtermInstance.current.write(stdout.replace(/\n/g, '\r\n'));
      if (stderr) xtermInstance.current.write(`\r\n\x1b[31m${stderr.replace(/\n/g, '\r\n')}\x1b[0m`);
    }
  };

  const handleApiCall = async (isSubmission) => {
    setIsLoading(true);
    setTestResults(null);
    if (isSubmission) {
      setTabIndex(1); // Passe à l'onglet Tests
    } else {
      setTabIndex(0); // Passe à l'onglet Console
      writeToTerminal("Exécution...", "");
    }

    try {
      const payload = {
        language: content.language || 'python',
        code: code,
        test_cases: isSubmission ? content.test_cases : null,
      };
      const response = await axios.post('/api/v2/execution/run', payload);
      writeToTerminal(response.data.stdout, response.data.stderr);
      if (isSubmission) {
        setTestResults(response.data.test_results || []);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Erreur inconnue.";
      writeToTerminal("", `Erreur de communication : ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTestResults = () => {
    if (!testResults) return <Alert severity="info">Soumettez votre code pour voir les résultats des tests.</Alert>;
    const allPassed = testResults.every(r => r.success);
    return (
      <Box>
        <Alert severity={allPassed ? "success" : "error"}>
          {allPassed ? "Félicitations ! Tous les tests sont passés." : "Certains tests ont échoué. Corrigez votre code et réessayez."}
        </Alert>
        <List dense>
          {testResults.map((result, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {result.success ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
              </ListItemIcon>
              <ListItemText 
                primary={result.description}
                secondary={!result.success ? `Attendu: ${JSON.stringify(result.expected)}, Reçu: ${JSON.stringify(result.got)}` : null}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" gutterBottom>{component.title}</Typography>
      <Paper elevation={2} sx={{ p: 2, overflow: 'auto' }}><div dangerouslySetInnerHTML={{ __html: content.prompt }} /></Paper>
      <Paper variant="outlined" sx={{ height: '400px' }}>
        <Editor height="100%" language={content.language || 'python'} theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'} value={code} onChange={(v) => setCode(v || '')} options={{ minimap: { enabled: false } }}/>
      </Paper>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button onClick={() => handleApiCall(false)} disabled={isLoading} variant="outlined">
          {isLoading && tabIndex === 0 ? <CircularProgress size={24} /> : 'Exécuter'}
        </Button>
        <Button onClick={() => handleApiCall(true)} disabled={isLoading} variant="contained">
          {isLoading && tabIndex === 1 ? <CircularProgress size={24} /> : 'Soumettre'}
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ height: '250px' }}>
        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
          <Tab label="Console" />
          <Tab label="Tests" />
        </Tabs>
        <Box sx={{ p: 2, height: 'calc(100% - 48px)', overflowY: 'auto' }}>
          {tabIndex === 0 && <div ref={terminalRef} style={{ width: '100%', height: '100%', backgroundColor: '#1e1e1e' }} />}
          {tabIndex === 1 && renderTestResults()}
        </Box>
      </Paper>
    </Box>
  );
};

export default CodeIdeComponent;