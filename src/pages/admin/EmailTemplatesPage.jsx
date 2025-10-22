import React, { useState, useEffect } from 'react'

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material'
import axios from 'axios'

export default function EmailTemplatesPage () {
  const [templates, setTemplates] = useState([])
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  // 🔹 Load all templates
  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setTemplates(res.data)
    } catch (err) {
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  // 🔹 Select template
  const handleSelect = async template => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email/${template._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const data = res.data
      setSelected(data._id)
      setName(data.name || '')
      setSubject(data.subject || '')
      setBody(data.body || '')
    } catch (err) {
      console.error('Error fetching template:', err)
    }
  }

  // 🔹 Save update
  const handleSave = async () => {
    if (!selected) return
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email/${selected}`,
        { name, subject, body }
      )
      fetchTemplates()
      alert('Template updated!')
    } catch (err) {
      console.error('Error saving template:', err)
    }
  }

  // 🔹 Create new template
  const handleCreate = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email`,
        {
          name: 'New Template',
          subject: 'Untitled',
          body: 'Write your message here...',
          type: 'general'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      await fetchTemplates()
      handleSelect(res.data) // auto-open new template
    } catch (err) {
      console.error('Error creating template:', err)
    }
  }

  // 🔹 Delete template
  const handleDelete = async (e, id) => {
    e.stopPropagation() // prevent selecting when deleting
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setTemplates(prev => prev.filter(t => t._id !== id))
      if (selected === id) {
        setSelected(null)
        setName('')
        setSubject('')
        setBody('')
      }
    } catch (err) {
      console.error('Error deleting template:', err)
    }
  }

  const selectedTemplate = templates.find(t => t._id === selected)

  return (
    <>
      <Box
        sx={{ p: { xs: 2, md: 4 }, background: '#f9f9f9', minHeight: '100vh' }}
      >
        <Typography variant='h6' mb={3} fontWeight={600}>
          ✉️ Email Templates Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ maxHeight: '70vh', overflowY: 'auto', p: 1 }}>
              <Button variant='outlined' fullWidth onClick={handleCreate}>
                + New Template
              </Button>

              {loading ? (
                <Box textAlign='center' py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List>
                  {templates.map(template => (
                    <ListItem
                      button
                      key={template._id}
                      selected={selected === template._id}
                      onClick={() => handleSelect(template)}
                      secondaryAction={
                        <Button
                          color='error'
                          size='small'
                          onClick={e => handleDelete(e, template._id)}
                        >
                          Delete
                        </Button>
                      }
                    >
                      <ListItemText primary={template.name} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Editor */}
          {selectedTemplate && (
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant='h6' mb={2} fontWeight={600}>
                  Edit Template
                </Typography>

                <TextField
                  label='Name'
                  fullWidth
                  variant='outlined'
                  margin='normal'
                  value={name}
                  onChange={e => setName(e.target.value)}
                />

                <TextField
                  label='Subject'
                  fullWidth
                  variant='outlined'
                  margin='normal'
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />

                <TextField
                  label='Body'
                  fullWidth
                  multiline
                  rows={10}
                  variant='outlined'
                  margin='normal'
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />

                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleSave}
                >
                  Save Template
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  )
}
