import React from 'react';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatComposer = ({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
  areaOptions = [],
  areaLocked = false,
  selectedArea,
  onAreaChange,
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (disabled) return;
    onSubmit?.();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!disabled) {
        onSubmit?.();
      }
    }
  };

  const handleAreaChange = (event) => {
    onAreaChange?.(event.target.value);
  };

  const areaSelectionEnabled = !areaLocked && areaOptions.length > 0;
  const trimmedValue = value?.trim?.() || '';

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-end">
        {areaSelectionEnabled && (
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
            <InputLabel id="chat-area-select-label">Zone</InputLabel>
            <Select
              labelId="chat-area-select-label"
              label="Zone"
              value={selectedArea || ''}
              onChange={handleAreaChange}
            >
              <MenuItem value="">Toutes les zones</MenuItem>
              {areaOptions.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          placeholder={placeholder || 'Écrivez votre message…'}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={handleKeyDown}
          size="small"
          disabled={disabled}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            type="submit"
            color="primary"
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            disabled={disabled || trimmedValue.length === 0}
          >
            <SendIcon />
          </IconButton>
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={disabled || trimmedValue.length === 0}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Envoyer
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ChatComposer;
