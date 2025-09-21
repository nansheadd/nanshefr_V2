import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import apiClient from '../../../api/axiosConfig';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import LinkIcon from '@mui/icons-material/Link';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import CloseIcon from '@mui/icons-material/Close';
import NotesIcon from '@mui/icons-material/Notes';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { alpha, styled } from '@mui/material/styles';

const fetchNotes = async () => {
  const { data } = await apiClient.get('/toolbox/notes');
  return data;
};

const createNote = async (payload) => {
  const { data } = await apiClient.post('/toolbox/notes', payload);
  return data;
};

const updateNote = async ({ noteId, payload }) => {
  const { data } = await apiClient.put(`/toolbox/notes/${noteId}`, payload);
  return data;
};

const deleteNote = async (noteId) => {
  await apiClient.delete(`/toolbox/notes/${noteId}`);
  return noteId;
};

const EditorPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'layout',
})(({ theme, layout = 'dock' }) => {
  const base = {
    flexGrow: 1,
    borderRadius: 18,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
    background: alpha(theme.palette.common.white, 0.9),
    backdropFilter: 'blur(16px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  if (layout === 'modal') {
    return {
      ...base,
      width: 'min(960px, 92vw)',
      height: 'min(85vh, 760px)',
    };
  }

  if (layout === 'page') {
    return {
      ...base,
      width: '100%',
      height: '100%',
      minHeight: 560,
    };
  }

  return {
    ...base,
    width: 360,
    height: 560,
    [theme.breakpoints.up('md')]: {
      width: 420,
      height: 600,
    },
  };
});

const ToolbarButton = ({ icon, label, onClick }) => (
  <Tooltip title={label}>
    <IconButton size="small" onClick={onClick} sx={{ borderRadius: 2 }}>
      {icon}
    </IconButton>
  </Tooltip>
);

const fontOptions = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
];

const fontSizeOptions = [
  { label: 'Petit', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Grand', value: '4' },
  { label: 'Très grand', value: '5' },
];

const NotesPad = ({ onClose, onExpand, layout = 'dock' }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { moleculeId } = useParams();
  const currentMoleculeId = moleculeId ? Number(moleculeId) : null;

  const [activeTab, setActiveTab] = useState('current');
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const editorRef = useRef(null);
  const lastSavedRef = useRef({ title: '', content: '' });

  const { data: notesData, isLoading, isError, error } = useQuery({
    queryKey: ['toolbox-notes'],
    queryFn: fetchNotes,
    staleTime: 30_000,
  });

  const notes = useMemo(() => notesData ?? [], [notesData]);
  const [contentHtml, setContentHtml] = useState('');

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId) || null,
    [notes, activeNoteId]
  );

  useEffect(() => {
    if (!currentMoleculeId && activeTab === 'current') {
      setActiveTab('all');
    }
  }, [currentMoleculeId, activeTab]);

  useEffect(() => {
    if (activeNote) {
      setTitleInput(activeNote.title);
      setContentHtml(activeNote.content || '');
      lastSavedRef.current = { title: activeNote.title, content: activeNote.content || '' };
      if (editorRef.current) {
        editorRef.current.innerHTML = activeNote.content || '';
      }
    } else {
      setTitleInput('');
      setContentHtml('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [activeNote]);

  useEffect(() => {
    if (!notes.length) {
      setActiveNoteId(null);
      return;
    }

    if (activeNoteId) {
      const exists = notes.some((note) => note.id === activeNoteId);
      if (exists) {
        return;
      }
    }

    if (currentMoleculeId) {
      const candidate = notes.find((note) => note.molecule_id === currentMoleculeId);
      if (candidate) {
        setActiveNoteId(candidate.id);
        setActiveTab('current');
        return;
      }
    }

    setActiveNoteId(notes[0].id);
    setActiveTab('all');
  }, [notes, activeNoteId, currentMoleculeId]);

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (note) => {
      queryClient.setQueryData(['toolbox-notes'], (prev) => (prev ? [note, ...prev] : [note]));
      setActiveNoteId(note.id);
      setActiveTab('current');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateNote,
    onSuccess: (note) => {
      queryClient.setQueryData(['toolbox-notes'], (prev) => {
        if (!prev) return [note];
        return prev.map((item) => (item.id === note.id ? note : item));
      });
      lastSavedRef.current = { title: note.title, content: note.content };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: (noteId) => {
      queryClient.setQueryData(['toolbox-notes'], (prev) => (prev ? prev.filter((item) => item.id !== noteId) : []));
      if (activeNoteId === noteId) {
        setActiveNoteId(null);
      }
    },
  });

  const saveDraft = useDebouncedCallback((noteId, titleValue, contentValue) => {
    if (!noteId) return;
    if (titleValue === lastSavedRef.current.title && contentValue === lastSavedRef.current.content) {
      return;
    }
    updateMutation.mutate({
      noteId,
      payload: { title: titleValue, content: contentValue },
    });
  }, 600);

  useEffect(() => () => saveDraft.cancel(), [saveDraft]);

  const handleCreateNote = () => {
    if (!currentMoleculeId) {
      return;
    }
    const existingCount = notes.filter((note) => note.molecule_id === currentMoleculeId).length + 1;
    createMutation.mutate({
      molecule_id: currentMoleculeId,
      title: `Note ${existingCount}`,
      content: '',
    });
  };

  const handleDeleteNote = (noteId) => {
    deleteMutation.mutate(noteId);
  };

  const handleTitleChange = (event) => {
    const value = event.target.value;
    setTitleInput(value);
    setTimeout(() => {
      if (editorRef.current && !editorRef.current.innerHTML && !value.trim()) {
        editorRef.current.innerHTML = '';
      }
    }, 0);
    if (activeNoteId) {
      saveDraft(activeNoteId, value, contentHtml);
    }
  };

  const handleEditorInput = (event) => {
    const html = event.currentTarget.innerHTML;
    setContentHtml(html);
    if (activeNoteId) {
      saveDraft(activeNoteId, titleInput, html);
    }
  };

  const handleApplyCommand = (command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  const handleInsertLink = () => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    const hasSelection = selection && !selection.isCollapsed;
    const url = window.prompt('Insère le lien (https://...)');
    if (!url) return;
    editorRef.current.focus();
    if (hasSelection) {
      document.execCommand('createLink', false, url);
    } else {
      document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    }
  };

  const filteredNotes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = notes;
    if (activeTab === 'current' && currentMoleculeId) {
      list = list.filter((note) => note.molecule_id === currentMoleculeId);
    }
    if (!term) return list;
    return list.filter((note) => {
      return (
        note.title.toLowerCase().includes(term) ||
        (note.molecule_title || '').toLowerCase().includes(term) ||
        (note.content || '').toLowerCase().includes(term)
      );
    });
  }, [notes, searchTerm, activeTab, currentMoleculeId]);

  const handleTabChange = (_event, value) => {
    setActiveTab(value);
  };

  const handleOpenNote = (noteId) => {
    setActiveNoteId(noteId);
  };

  const handleNavigateToMolecule = (note) => {
    if (!note?.molecule_id) return;
    navigate(`/session/molecule/${note.molecule_id}`);
  };

  const currentMoleculeNotesCount = notes.filter((note) => note.molecule_id === currentMoleculeId).length;

  const showExpand = Boolean(onExpand) && layout !== 'modal';

  return (
    <EditorPaper elevation={12} layout={layout}>
      <Box sx={{ px: 2.5, py: 2, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ bgcolor: 'info.main' }}>
            <NotesIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Bloc-notes IA
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Organise tes idées par molécules et retrouve-les facilement
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {showExpand && (
            <Tooltip title="Ouvrir en modal">
              <IconButton size="small" onClick={onExpand} sx={{ bgcolor: alpha('#000', 0.05), '&:hover': { bgcolor: alpha('#000', 0.1) } }}>
                <OpenInFullIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onClose && (
            <IconButton size="small" onClick={onClose} sx={{ bgcolor: alpha('#000', 0.05), '&:hover': { bgcolor: alpha('#000', 0.1) } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Box>

      <Box sx={{ px: 2.5, pt: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 3,
            },
          }}
        >
          <Tab
            value="current"
            label={
              <Badge color="info" badgeContent={currentMoleculeNotesCount} max={99}>
                Cette molécule
              </Badge>
            }
            disabled={!currentMoleculeId}
          />
          <Tab value="all" label="Toutes les notes" />
        </Tabs>
      </Box>

      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <TextField
          fullWidth
          placeholder="Rechercher une note..."
          size="small"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </Box>

      <Box sx={{ px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {filteredNotes.length} note{filteredNotes.length > 1 ? 's' : ''}
        </Typography>
        <Tooltip title={currentMoleculeId ? 'Créer une note pour cette molécule' : 'Ouvre une molécule pour ajouter des notes'}>
          <span>
            <Button
              startIcon={<NoteAddIcon />}
              size="small"
              variant="contained"
              onClick={handleCreateNote}
              disabled={!currentMoleculeId || createMutation.isPending}
            >
              Nouvelle note
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Divider sx={{ opacity: 0.5 }} />

      {isLoading ? (
        <Stack flexGrow={1} alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress size={32} />
        </Stack>
      ) : isError ? (
        <Box sx={{ px: 2.5, py: 3 }}>
          <Alert severity="error">
            {error?.message || 'Impossible de récupérer les notes'}
          </Alert>
        </Box>
      ) : (
        <Stack sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, pt: 1, maxHeight: 180, overflowY: 'auto' }}>
            {filteredNotes.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {currentMoleculeId && activeTab === 'current'
                  ? 'Commence une note pour cette molécule pour garder tes idées au même endroit.'
                  : 'Aucune note enregistrée pour le moment.'}
              </Alert>
            ) : (
              <List dense sx={{ py: 0 }}>
                {filteredNotes.map((note) => (
                  <ListItem
                    key={note.id}
                    disablePadding
                    secondaryAction={
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title="Ouvrir la molécule">
                          <IconButton edge="end" size="small" onClick={() => handleNavigateToMolecule(note)}>
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                  >
                    <ListItemButton
                      selected={note.id === activeNoteId}
                      onClick={() => handleOpenNote(note.id)}
                      sx={{ borderRadius: 2 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha('#0288d1', 0.15), color: 'info.dark' }}>
                          <FontDownloadIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {note.title}
                            {note.molecule_id === currentMoleculeId && currentMoleculeId && (
                              <Chip label="Cette molécule" size="small" color="info" variant="outlined" />
                            )}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {note.molecule_title || 'Molécule inconnue'} • {note.capsule_title || 'Capsule'}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Divider sx={{ my: 1, opacity: 0.5 }} />

          {activeNote ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, px: 2.5, pb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={titleInput}
                  onChange={handleTitleChange}
                  placeholder="Titre de la note"
                />
                <Chip
                  label={`Molécule #${activeNote.molecule_id}`}
                  size="small"
                  variant="outlined"
                  onClick={() => handleNavigateToMolecule(activeNote)}
                  sx={{ cursor: 'pointer' }}
                />
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap' }}>
                <ToolbarButton icon={<FormatBoldIcon fontSize="small" />} label="Gras" onClick={() => handleApplyCommand('bold')} />
                <ToolbarButton icon={<FormatItalicIcon fontSize="small" />} label="Italique" onClick={() => handleApplyCommand('italic')} />
                <ToolbarButton icon={<FormatUnderlinedIcon fontSize="small" />} label="Souligner" onClick={() => handleApplyCommand('underline')} />
                <ToolbarButton icon={<FormatListBulletedIcon fontSize="small" />} label="Liste à puces" onClick={() => handleApplyCommand('insertUnorderedList')} />
                <ToolbarButton icon={<LinkIcon fontSize="small" />} label="Lien" onClick={handleInsertLink} />
                <ToolbarButton icon={<UndoIcon fontSize="small" />} label="Annuler" onClick={() => handleApplyCommand('undo')} />
                <ToolbarButton icon={<RedoIcon fontSize="small" />} label="Rétablir" onClick={() => handleApplyCommand('redo')} />

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="font-select-label">Police</InputLabel>
                  <Select
                    labelId="font-select-label"
                    label="Police"
                    defaultValue={fontOptions[0].value}
                    onChange={(event) => handleApplyCommand('fontName', event.target.value)}
                  >
                    {fontOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="font-size-select-label">Taille</InputLabel>
                  <Select
                    labelId="font-size-select-label"
                    label="Taille"
                    defaultValue="3"
                    onChange={(event) => handleApplyCommand('fontSize', event.target.value)}
                  >
                    {fontSizeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Box
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  borderRadius: 2,
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  p: 2,
                  typography: 'body2',
                  lineHeight: 1.6,
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => `inset 0 1px 3px ${alpha(theme.palette.common.black, 0.08)}`,
                  '&:focus': {
                    outline: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                  },
                  '& a': {
                    color: 'primary.main',
                  },
                }}
              />

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {updateMutation.isPending ? 'Enregistrement...' : 'Enregistré automatiquement'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={activeNote.capsule_title || 'Capsule'} size="small" color="primary" variant="outlined" />
                  {activeNote.capsule_domain && (
                    <Chip label={activeNote.capsule_domain} size="small" variant="outlined" />
                  )}
                </Stack>
              </Stack>
            </Box>
          ) : (
            <Stack flexGrow={1} alignItems="center" justifyContent="center" sx={{ px: 2.5, pb: 4 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Sélectionne ou crée une note pour commencer à écrire.
              </Typography>
            </Stack>
          )}
        </Stack>
      )}
    </EditorPaper>
  );
};

export default NotesPad;
