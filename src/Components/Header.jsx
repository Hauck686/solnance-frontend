'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Header () {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => (document.body.style.overflow = '')
  }, [menuOpen])

  const NAV_LINKS = [
    { label: 'Investment', href: '/plans' },
    { label: 'Loans', href: '/Loans' },
    { label: 'Trading Bot', href: '/Trading Bot' },
    { label: 'Token', href: '/token' },
    { label: 'Docs', href: '/docs' },
    { label: 'Contact', href: '/contact' }
  ]

  return (
    <header className='header'>
      {/* Logo */}
      <div>
        <a href='/' className='logoWrap'>
          <div className='logo'>Solnance</div>
          <div className='tag'>Wallet & Exchange</div>
        </a>
      </div>

      {/* Desktop Nav */}
      <div className='desktopNav'>
        <nav className='nav'>
          <ul>
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
            <li>
              <a href='/auth/Login' className='authBtn'>
                Login
              </a>
            </li>
            <li>
              <a href='/auth/RegistrationPage' className='authBtn accent'>
                Register
              </a>
            </li>
          </ul>
        </nav>
      </div>
      {/* Mobile Menu Toggle */}
      <button
        className='hamburger'
        aria-label='Toggle menu'
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Mobile Overlay + Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className='mobileOverlay'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className='mobileDropdown'
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul>
                {NAV_LINKS.map(link => (
                  <li key={link.href}>
                    <a href={link.href} onClick={() => setMenuOpen(false)}>
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a href='/auth/Login'>Login</a>
                </li>
                <li>
                  <a href='/auth/RegistrationPage'>Register</a>
                </li>
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
