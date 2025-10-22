'use client'

import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip
} from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'

const initialAdmins = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'admin@platform.com',
    role: 'SuperAdmin'
  },
  {
    id: 2,
    name: 'Support Staff',
    email: 'support@platform.com',
    role: 'Moderator'
  }
]

const roles = ['SuperAdmin', 'Moderator', 'ReadOnly']

export default function RoleManagement () {
  const [admins, setAdmins] = useState(initialAdmins)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'Moderator' })
  const [editingId, setEditingId] = useState(null)

  const handleOpen = (admin = null) => {
    if (admin) {
      setForm(admin)
      setEditingId(admin.id)
    } else {
      setForm({ name: '', email: '', role: 'Moderator' })
      setEditingId(null)
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setForm({ name: '', email: '', role: 'Moderator' })
    setEditingId(null)
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    if (!form.name || !form.email || !form.role) return

    if (editingId) {
      setAdmins(prev =>
        prev.map(admin =>
          admin.id === editingId ? { ...form, id: editingId } : admin
        )
      )
    } else {
      setAdmins(prev => [...prev, { ...form, id: Date.now() }])
    }

    handleClose()
  }

  const handleDelete = id => {
    setAdmins(prev => prev.filter(admin => admin.id !== id))
  }

  return (
    <Box sx={{ bgcolor: '#f4f4f4', minHeight: '100vh' }}>
      <Container maxWidth='lg' sx={{ py: 6 }}>
        <Typography variant='h5' fontWeight='bold' gutterBottom>
          Role & Admin Management
        </Typography>

        <Paper className='tableWrapper'>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant='contained' onClick={() => handleOpen()}>
              Add Admin
            </Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map(admin => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.role}</TableCell>
                  <TableCell align='right'>
                    <Tooltip title='Edit'>
                      <IconButton onClick={() => handleOpen(admin)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Delete'>
                      <IconButton
                        onClick={() => handleDelete(admin.id)}
                        color='error'
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Add/Edit Modal */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            {editingId ? 'Edit Admin' : 'Add New Admin'}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              label='Name'
              name='name'
              fullWidth
              sx={{ mb: 2 }}
              value={form.name}
              onChange={handleChange}
            />
            <TextField
              label='Email'
              name='email'
              fullWidth
              sx={{ mb: 2 }}
              value={form.email}
              onChange={handleChange}
            />
            <TextField
              select
              label='Role'
              name='role'
              fullWidth
              value={form.role}
              onChange={handleChange}
            >
              {roles.map(role => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave} variant='contained'>
              {editingId ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
