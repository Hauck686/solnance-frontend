'use client'

import React, { useState } from 'react'
import { TextField, IconButton, Input } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import botKnowledge from '../botKnowledge'

export default function ChatBot () {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return
    const userMessage = { sender: 'user', text: input }
    const lowerInput = input.toLowerCase()

    let reply = "I'm not sure how to help with that."
    for (const item of botKnowledge) {
      if (item.keywords.some(keyword => lowerInput.includes(keyword))) {
        reply = item.answer
        break
      }
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const botMessage = { sender: 'bot', text: reply }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className='smartsupp-bot'>
      {open ? (
        <div className='chat-box'>
          <div className='chat-header'>
            <div className='chat-header-info'>
              <img
                src='https://i.postimg.cc/V6f00jhs/Crypt-Logo-Retina.webp'
                alt='logo'
                className='chat-logo'
              />
              <div>
                <strong>Solnance Ai.</strong>
                <p className='status'>
                  <span className='green-dot' /> Ask me anything about Solnance.
                </p>
              </div>
            </div>
            <button className='close-btn' onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          <div className='chat-body'>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className='message bot'>
                <div className='typing-dots'>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <div className='chat-input'>
            <Input
              autoFocus
              fullWidth
              size='small'
              className='input-field'
              type='text'
              placeholder='Type your message...'
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <IconButton onClick={handleSend} color='primary'>
              <SendIcon />
            </IconButton>
          </div>
        </div>
      ) : (
        <button className='chat-toggle' onClick={() => setOpen(true)}>
          💬
          <span>Ask Solnance Ai</span>
        </button>
      )}
    </div>
  )
}
