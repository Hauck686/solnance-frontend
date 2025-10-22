// File: components/UserNotificationPopup.jsx
'use client'

import { useEffect, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

export default function UserNotificationPopup ({
  message,
  type = 'info',
  openInitially = true,
  duration = 4000
}) {
  const [open, setOpen] = useState(openInitially)

  useEffect(() => {
    if (openInitially) {
      const timer = setTimeout(() => setOpen(false), duration)
      return () => clearTimeout(timer)
    }
  }, [openInitially, duration])

  return (
    <Snackbar
      open={open}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity={type} variant='filled'>
        {message}
      </Alert>
    </Snackbar>
  )
}
