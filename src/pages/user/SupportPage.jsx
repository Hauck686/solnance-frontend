import React from 'react'

export default function SupportPage () {
  return (
    <div className='support-page-container'>
      <div className='support-content'>
        <h1>Support Center</h1>
        <p className='intro'>
          Need help? Our support team is here for you 24/7. Choose a topic
          below, or contact us directly.
        </p>
        <div className='support-options'>
          {/* <div className='support-card'>
            <h2>FAQs</h2>
            <p>
              Find answers to common questions about your account, investments,
              and more.
            </p>
            <a href='/faq' className='support-link'>
              View FAQs
            </a>
          </div> */}
          <div className='support-card'>
            <h2>Contact Us</h2>
            <p>
              Reach out to our support team via email or live chat for
              personalized assistance.
            </p>
            <a href='mailto:support@example.com' className='support-link'>
              Email Support
            </a>
            <a href='/chat-support' className='support-link'>
              Live Chat
            </a>
          </div>
          <div className='support-card'>
            <h2>Report an Issue</h2>
            <p>
              Encountered a problem? Report it here and we'll resolve it
              promptly.
            </p>
            <a href='/report-issue' className='support-link'>
              Report Issue
            </a>
          </div>
        </div>
        <div className='support-footer'>
          <p>
            <strong>We're committed to helping you succeed.</strong>
            <br />
            Response times: typically within 2 mins.
          </p>
        </div>
      </div>
    </div>
  )
}
