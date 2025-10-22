'use client'

import { useState } from 'react'
import {
  Snackbar,
  Alert,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material'
import axios from 'axios'

export default function PopUpPage () {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')

  const handleSend = async () => {
    if (message.trim()) {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/popup-notification`,
        {
          title,
          message,
          type,
          active: true
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setOpen(true)
      setTitle('')
      setMessage('')
      setType('info')
    }
  }

  return (
    <div>
      <Box className='buyStatusPage'>
        <Typography variant='h6' fontWeight={600} mb={2}>
          Create User Notification
        </Typography>

        <TextField
          label='Notification Title'
          variant='outlined'
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label='Notification Message'
          variant='outlined'
          multiline
          rows={3}
          value={message}
          onChange={e => setMessage(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Type</InputLabel>
          <Select value={type} onChange={e => setType(e.target.value)}>
            <MenuItem value='info'>Info</MenuItem>
            <MenuItem value='success'>Success</MenuItem>
            <MenuItem value='warning'>Warning</MenuItem>
            <MenuItem value='error'>Error</MenuItem>
          </Select>
        </FormControl>

        <Button variant='contained' onClick={handleSend}>
          Save & Broadcast
        </Button>

        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={4000}
        >
          <Alert severity='success' variant='filled'>
            Notification saved & sent to users!
          </Alert>
        </Snackbar>
      </Box>
    </div>
  )
}
