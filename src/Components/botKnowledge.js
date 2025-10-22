const botKnowledge = [
  {
    keywords: [
      'hello',
      'hi',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
      'how are you',
      'what’s up',
      'yo',
      'greetings'
    ],
    answer:
      'Hello 👋, welcome to Solnance FINANCE! I’m your assistant. You can ask me anything about deposits, withdrawals, loans, investment plans, or even trading. How can I make your day easier today?'
  },
  {
    keywords: [
      'deposit',
      'add funds',
      'fund account',
      'top up',
      'make payment',
      'put money',
      'how to deposit',
      'fund wallet'
    ],
    answer:
      'Got it 👍 You’d like to deposit. Just log in to your dashboard and click **Deposit**. You’ll see options like bank transfer, card, or crypto. Choose what’s convenient for you, and once it’s processed, your balance updates automatically.'
  },
  {
    keywords: [
      'withdraw',
      'cash out',
      'payout',
      'send money',
      'take profit',
      'get money out',
      'withdraw funds'
    ],
    answer:
      'Absolutely ✅. To withdraw, open the **Withdraw** section on your dashboard, type in the amount, pick your method, and confirm. Most requests are processed within 24–72 hours depending on the method.'
  },
  {
    keywords: [
      'referral',
      'invite',
      'refer friends',
      'referral bonus',
      'share link',
      'earn by inviting'
    ],
    answer:
      'Yes! 🎉 You can earn by inviting friends. Just share your unique referral link. Once they sign up and deposit, your bonus lands directly in your account balance.'
  },
  {
    keywords: [
      'investment advice',
      'suggest plan',
      'recommend plan',
      'ai guide',
      'best investment',
      'which plan is good',
      'where should I invest'
    ],
    answer:
      'Great question 🌟. The right plan depends on your goals and risk appetite. Our system can recommend one tailored to you, or you can browse the **Investment Plans** page to see details like ROI, duration, and risk levels.'
  },
  {
    keywords: [
      'email verification',
      'verify email',
      'didn’t get email',
      'resend',
      'confirmation mail',
      'verify account email'
    ],
    answer:
      'No worries 🙏. To verify your email, check your inbox or spam folder for our confirmation message. Didn’t receive one? Just go to your profile settings and click **Resend Verification Email**.'
  },
  {
    keywords: [
      'plans',
      'investment plans',
      'returns',
      'roi',
      'profit',
      'what do you offer',
      'earnings plan',
      'what plans do you have'
    ],
    answer:
      'We’ve got different plans for different needs 📊. Some are fixed income with steady ROI (10–15% monthly), while others are dynamic portfolios that may return 20–25% depending on market performance. You’ll find all details under **Plans**.'
  },
  {
    keywords: [
      'security',
      'safe',
      'is my money safe',
      'protected',
      'fraud',
      'scam',
      'trust',
      'secure'
    ],
    answer:
      'Great you asked 🔒. Security is our top priority. We use bank-grade encryption, 2FA, cold wallet storage for crypto, and we comply with KYC/AML regulations to keep your funds safe at all times.'
  },
  {
    keywords: [
      'kyc',
      'identity verification',
      'upload id',
      'document',
      'verify account',
      'how to verify',
      'id upload'
    ],
    answer:
      'To verify your account, head over to the **KYC section**. Upload a valid government ID plus a selfie. This is quick, protects you, and ensures compliance with financial regulations.'
  },
  {
    keywords: [
      'support',
      'help',
      'contact',
      'customer service',
      'complaint',
      'speak to someone',
      'agent',
      'problem'
    ],
    answer:
      'We’re here for you 24/7 💬. You can use live chat, open a support ticket from your dashboard, or drop us an email. A support agent will get back to you as quickly as possible.'
  },
  {
    keywords: [
      'loan',
      'borrow',
      'get loan',
      'loan eligibility',
      'take a loan',
      'lend me',
      'apply for loan'
    ],
    answer:
      'We offer instant, collateral-free loans 💳 backed by your investment portfolio. Visit the **Loan section** in your dashboard to view requirements, see interest rates, and apply right away.'
  },
  {
    keywords: [
      'buy',
      'sell',
      'trade',
      'exchange',
      'purchase',
      'market',
      'how to trade'
    ],
    answer:
      'Yes, you can trade directly on our platform 🔄. Go to the **Trading section**, pick the asset, choose how much to buy or sell, and confirm. Transactions update in real time.'
  },
  {
    keywords: [
      'dashboard',
      'profile',
      'my account',
      'settings',
      'account page',
      'control panel'
    ],
    answer:
      'Your dashboard is your personal hub ⚡. From there you can check balances, track investments, request withdrawals, and update account info like password or 2FA settings.'
  },
  {
    keywords: [
      'crypto',
      'bitcoin',
      'ethereum',
      'usdt',
      'digital assets',
      'altcoin',
      'blockchain'
    ],
    answer:
      'We support all the major digital assets 💹. You can deposit Bitcoin, Ethereum, or USDT and keep track of your crypto portfolio live from your dashboard.'
  },
  {
    keywords: [
      'card payment',
      'pay with card',
      'visa',
      'mastercard',
      'credit card',
      'debit card'
    ],
    answer:
      'To use your card, just select **Credit/Debit Card** on the Deposit page. Payments are processed instantly through our secure PCI-compliant system ✅.'
  },
  {
    keywords: [
      'interest rate',
      'roi',
      'profit',
      'monthly return',
      'earnings',
      'gains'
    ],
    answer:
      'Returns vary per plan 📈. Fixed income plans offer steady 10–15% monthly ROI, while dynamic ones can yield more depending on performance. Always review the details before choosing a plan.'
  },
  {
    keywords: ['thank you', 'thanks', 'appreciate', 'grateful', 'cheers'],
    answer:
      'You’re most welcome 🙏. I’m glad I could help. Do you have any other questions about your account or investments?'
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'talk soon'],
    answer:
      'Goodbye 👋, and thanks for chatting with Solnance FINANCE! Wishing you profitable investments ahead. Come back anytime you need me.'
  }
]

export default botKnowledge
