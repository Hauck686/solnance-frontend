import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTheme } from '../../context/ThemeContext'
import {
  Activity,
  AlignJustify,
  ArrowBigDownDash,
  ArrowBigUpDash,
  ArrowRightLeft,
  Blocks,
  Brain,
  ChartCandlestick,
  ChartGantt,
  CircleX,
  FileQuestionMark,
  FileUser,
  History,
  LayoutDashboard,
  LogOut,
  RefreshCcwDot,
  ShieldCheck,
  Sun,
  SunMoon,
  UserPen
} from 'lucide-react'
import axios from 'axios'

export default function MainHeader () {
  const [isMobile, setIsMobile] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const router = useRouter()

  // Inject Google Translate script
  useEffect(() => {
    const googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
      )
    }

    // Attach to global for callback
    window.googleTranslateElementInit = googleTranslateElementInit

    const script = document.createElement('script')
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.id = 'google-translate-script'
    script.async = true
    document.body.appendChild(script)
  }, [])

  // Sidebar structure with headers and sub-links
  const sidebarSections = [
    {
      header: null,
      links: [
        {
          icon: <LayoutDashboard strokeWidth={1} />,
          label: 'Dashboard',
          path: '/user/UserDashboard'
        },
        {
          icon: <Brain strokeWidth={1} />,
          label: 'AI Assistant',
          path: '/user/AiRecommendation'
        },
        {
          icon: <UserPen strokeWidth={1} />,
          label: 'Profile Settings',
          path: '/user/Profilepage'
        }
      ]
    },
    {
      header: 'Investment Plans',
      links: [
        {
          icon: <ChartGantt strokeWidth={1} />,
          label: 'Plans',
          path: '/user/InvestmentPlan'
        },
        {
          icon: <Activity strokeWidth={1} />,
          label: 'Active Investment',
          path: '/user/ActivePlanPage'
        },
        {
          icon: <Blocks strokeWidth={1} />,
          label: 'Earnings',
          path: '/user/EarningsPage'
        }
      ]
    },
    {
      header: 'Transactions',
      links: [
        {
          icon: <ArrowBigDownDash strokeWidth={1} />,
          label: 'Deposit',
          path: '/user/DepositPage'
        },
        {
          icon: <ArrowBigUpDash strokeWidth={1} />,
          label: 'Withdrawal',
          path: '/user/WithdrawalPage'
        },
        {
          icon: <ArrowRightLeft strokeWidth={1} />,
          label: 'Swap Coin',
          path: '/user/SwapCoinPage'
        }
      ]
    },
    {
      header: 'Loans',
      links: [
        {
          icon: <FileUser strokeWidth={1} />,
          label: 'Apply for Loan',
          path: '/user/ApplyLoanPage'
        },
        {
          icon: <Blocks strokeWidth={1} />,
          label: 'Loan History',
          path: '/user/LoansPage'
        }
      ]
    },
    // {
    //   header: 'Trade',
    //   links: [
    //     {
    //       icon: <ChartCandlestick strokeWidth={1} />,
    //       label: 'Buy Coin',
    //       path: '/user/DepositPage'
    //     },
    //     {
    //       icon: <ChartCandlestick strokeWidth={1} />,
    //       label: 'Sell Coin',
    //       path: '/user/WithdrawalPage'
    //     },
    //     {
    //       icon: <ArrowRightLeft strokeWidth={1} />,
    //       label: 'Swap Coin',
    //       path: '/user/SwapCoinPage'
    //     }
    //   ]
    // },

    {
      header: 'Privacy',
      links: [
        {
          icon: <RefreshCcwDot strokeWidth={1} />,
          label: 'Your Referrals',
          path: '/user/ReferralPage'
        },
        {
          icon: <History strokeWidth={1} />,
          label: 'History',
          path: '/user/HistoryPage'
        },
        {
          icon: <ShieldCheck strokeWidth={1} />,
          label: 'KYC Verification',
          path: '/user/KycPage'
        },
        {
          icon: <FileQuestionMark strokeWidth={1} />,
          label: 'Support Center',
          path: '/user/SupportPage'
        },
        {
          icon: <LogOut strokeWidth={1} />,
          label: 'Logout',
          path: '/logout',
          action: 'logout'
        }
      ]
    }
  ]

  // Responsive handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 600)
      const handleResize = () => {
        const mobile = window.innerWidth <= 600
        setIsMobile(mobile)
        if (!mobile) setDrawerOpen(false)
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleLogout = async () => {
    try {
      // Remove local session
      localStorage.removeItem('authToken')
      localStorage.removeItem('userIdHash')

      // Notify backend (optional)
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Redirect
      window.location.href = '/auth/Login'
    } catch (err) {
      console.error('Logout error:', err)
      window.location.href = '/auth/Login' // still force redirect
    }
  }

  // Theme toggle
  const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme()

    return (
      <div onClick={toggleTheme}>
        {theme === 'light' ? (
          <Sun className='icon-btn' strokeWidth={1} />
        ) : (
          <SunMoon className='icon-btn' strokeWidth={1} />
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Google Translate Container */}
      <div
        id='google_translate_element'
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 9999 }}
      ></div>

      <header className='dashboard-header'>
        <div className='logo-section'>
          <Link href='/user/UserDashboard'>
            <span className='brand-name'>Solnance</span>
          </Link>
          {/* <img
            src='https://i.postimg.cc/V6f00jhs/Crypt-Logo-Retina.webp'
            alt='company logo'
            className='brand-name'
          /> */}
        </div>
        <div className='header-actions'>
          <>
            <ThemeToggle />
          </>

          <AlignJustify
            className='icon-btn'
            aria-label='Menu'
            onClick={() => setDrawerOpen(true)}
            strokeWidth={1}
          />
        </div>
      </header>

      {drawerOpen && (
        <div className='drawer-overlay' onClick={() => setDrawerOpen(false)} />
      )}

      <nav
        className={`drawer${drawerOpen ? ' open' : ''}${
          isMobile ? ' mobile' : ''
        }`}
      >
        <button
          className='drawer-close-btn'
          onClick={() => setDrawerOpen(false)}
        >
          <CircleX strokeWidth={1} />
        </button>
        <ul className='drawer-list'>
          {sidebarSections.map((section, i) => (
            <React.Fragment key={i}>
              {section.header && (
                <li className='drawer-category-header'>{section.header}</li>
              )}
              {section.links.map((link, idx) => (
                <li key={link.path + idx} onClick={() => setDrawerOpen(false)}>
                  {link.action === 'logout' ? (
                    <button
                      className='drawer-link'
                      onClick={handleLogout}
                      style={{
                        color:
                          router.pathname === link.path ? '#d67a49' : undefined,
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <span className='drawer-icon'>{link.icon}</span>
                      <span>{link.label}</span>
                    </button>
                  ) : (
                    <Link
                      href={link.path}
                      className='drawer-link'
                      style={{
                        color:
                          router.pathname === link.path ? '#d67a49' : undefined
                      }}
                    >
                      <span className='drawer-icon'>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
      </nav>
    </div>
  )
}
