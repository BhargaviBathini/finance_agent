# PhonePe-Style Implementation - Complete Guide

## 🎯 Implementation Status

### ✅ Completed
- [x] Updated User model with new fields (pinHash, hasBankConnected, onboardingComplete, phone, dateOfBirth, monthlyIncome)

### 🔄 In Progress
- [ ] New registration flow
- [ ] PIN setup screen
- [ ] PhonePe-style unlock screen
- [ ] Bank connection onboarding
- [ ] Dashboard redesign

---

## 📱 New User Flow

### First Time User Journey

```
1. Welcome Screen
   └─ [Get Started]

2. Registration (Step 1/3)
   ├─ Full Name
   ├─ Email
   ├─ Phone (optional)
   ├─ Date of Birth
   ├─ Monthly Income
   └─ [Continue]

3. Set Security (Step 2/3)
   ├─ "Create your 6-digit PIN"
   ├─ [PIN Entry: ● ● ● ● ● ●]
   ├─ "Confirm PIN"
   ├─ [PIN Entry: ● ● ● ● ● ●]
   ├─ OR
   ├─ [Use Device Password] (Windows Hello)
   └─ [Continue]

4. Connect Bank (Step 3/3)
   ├─ "Connect your bank to get started"
   ├─ "We need this to show your financial overview"
   ├─ [Connect Bank Account] (Large button)
   └─ Plaid Link opens

5. Success Popup
   ├─ ✓ "Bank Connected Successfully!"
   ├─ "Your account is now linked"
   └─ [View Dashboard]

6. Dashboard
   └─ Full financial overview
```

### Returning User Journey

```
1. App Opens
   ├─ User's name/photo
   ├─ "Welcome back, Bhargavi"
   └─ [PIN Entry: ● ● ● ● ● ●]
      OR
   └─ [Use Device Password]

2. Dashboard
   └─ Direct access
```

---

## 🎨 UI Components to Build

### 1. WelcomeScreen.tsx (NEW)
```typescript
- Hero image/animation
- App tagline
- [Get Started] button
- [Already have an account? Unlock]
```

### 2. RegisterPage.tsx (REDESIGN)
```typescript
// Step 1: Basic Details
- Full Name input
- Email input
- Phone input (optional)
- Date of Birth picker
- Monthly Income input
- Progress indicator (1/3)
- [Continue] button
```

### 3. SetPINPage.tsx (NEW)
```typescript
// Step 2: Security Setup
- "Create your 6-digit PIN"
- PIN input (6 dots)
- "Confirm PIN"
- PIN input (6 dots)
- [Use Device Password Instead]
- Progress indicator (2/3)
- [Continue] button
```

### 4. ConnectBankPage.tsx (NEW)
```typescript
// Step 3: Bank Connection
- Illustration
- "Connect your bank to get started"
- Description text
- [Connect Bank Account] (Large, prominent)
- Progress indicator (3/3)
- [Skip for now] (small link)
```

### 5. UnlockPage.tsx (REDESIGN)
```typescript
// PhonePe-style unlock
- User avatar/name
- "Welcome back, [Name]"
- PIN input (6 dots, large)
- Number pad (1-9, 0, backspace)
- [Use Device Password]
- [Forgot PIN?]
```

### 6. HomePage.tsx (COMPLETE REDESIGN)
```typescript
// New Dashboard Layout

// Header
- User greeting
- Notification icon
- Profile icon

// Summary Cards (Horizontal scroll)
┌─────────────┬─────────────┬─────────────┐
│ Balance     │ Cashflow    │ Net Worth   │
│ ₹1,25,450   │ +₹15,000    │ ₹5,45,000   │
└─────────────┴─────────────┴─────────────┘

// Investment Cards
┌─────────────┬─────────────┬─────────────┐
│ Mutual      │ Stocks      │ NPS         │
│ Funds       │             │             │
│ ₹2,50,000   │ ₹1,80,000   │ ₹45,000     │
└─────────────┴─────────────┴─────────────┘

// Credit Score Card
┌───────────────────────────────────────┐
│ Credit Score: 750 ⭐                  │
│ [View Details →]                      │
└───────────────────────────────────────┘

// Charts Section
- Income vs Expenses (Bar chart)
- Goal Progress (Progress bar + text)
- Expense Breakdown (Pie chart)

// Quick Actions
┌──────────┬──────────┬──────────┬──────────┐
│ + Bank   │ Set Goal │ Trans    │ Reports  │
└──────────┴──────────┴──────────┴──────────┘

// Bottom Navigation
[Home] [Transactions] [Goals] [Assistant] [Profile]
```

---

## 🔧 Backend API Updates

### New Endpoints Needed

#### 1. POST /api/auth/register-with-pin
```typescript
Body: {
  name: string,
  email: string,
  phone?: string,
  dateOfBirth?: string,
  monthlyIncome?: number,
  pin: string, // 6 digits
}

Response: {
  user: User,
  token: string,
  onboardingStep: 'bank_connection'
}
```

#### 2. POST /api/auth/verify-pin
```typescript
Body: {
  email: string,
  pin: string,
}

Response: {
  verified: boolean,
  token: string,
  user: User,
}
```

#### 3. POST /api/auth/setup-device-password
```typescript
// Existing WebAuthn endpoint, just needs to update onboarding status
```

#### 4. GET /api/user/onboarding-status
```typescript
Response: {
  onboardingComplete: boolean,
  hasBankConnected: boolean,
  nextStep: 'pin_setup' | 'bank_connection' | 'complete'
}
```

#### 5. POST /api/plaid/connection-success
```typescript
// Update hasBankConnected flag
// Set onboardingComplete to true
```

---

## 📊 Dashboard Data Structure

### Summary Cards Data
```typescript
interface DashboardSummary {
  currentBalance: number;      // From Plaid accounts
  monthlyCashflow: number;     // Income - Expenses
  netWorth: number;            // Total assets - liabilities
  creditScore: number;         // Mock for now, API later
}
```

### Investment Data
```typescript
interface Investments {
  mutualFunds: {
    total: number;
    returns: number;
    holdings: Array<{name: string, amount: number}>;
  };
  stocks: {
    total: number;
    returns: number;
    holdings: Array<{symbol: string, quantity: number, value: number}>;
  };
  nps: {
    total: number;
    returns: number;
  };
}
```

### Chart Data
```typescript
interface ChartData {
  incomeVsExpenses: Array<{month: string, income: number, expenses: number}>;
  goalProgress: {
    targetAmount: number;
    currentAmount: number;
    onTrack: boolean;
    message: string;
  };
  expenseBreakdown: Array<{category: string, amount: number, percentage: number}>;
}
```

---

## 🎨 Design System

### Colors (PhonePe-inspired)
```css
--primary: #5f259f;      /* Purple */
--primary-light: #7c3aad;
--primary-dark: #4a1d7a;
--success: #00c853;
--warning: #ffa000;
--error: #d32f2f;
--background: #f5f5f5;
--card: #ffffff;
--text-primary: #212121;
--text-secondary: #757575;
```

### Typography
```css
--font-family: 'Inter', -apple-system, sans-serif;
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 24px;
--font-size-2xl: 32px;
```

### Spacing
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

### Components
```css
/* Card */
.card {
  background: var(--card);
  border-radius: 16px;
  padding: var(--space-4);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Button Primary */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  min-height: 56px;
}

/* PIN Dot */
.pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--primary);
}

.pin-dot.filled {
  background: var(--primary);
}
```

---

## 📱 Mobile Responsiveness

### Breakpoints
```css
/* Mobile First */
@media (min-width: 640px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Layout
- Mobile: Single column, full width cards
- Tablet: 2 columns for cards
- Desktop: 3 columns, sidebar navigation

### Touch Targets
- Minimum 44x44px for all interactive elements
- Larger buttons on mobile (56px height)
- Adequate spacing between elements (16px minimum)

---

## 🔒 Security Implementation

### PIN Storage
```typescript
// Hash PIN with bcrypt before storing
import bcrypt from 'bcryptjs';

const pinHash = await bcrypt.hash(pin, 12);
user.pinHash = pinHash;
```

### PIN Verification
```typescript
const isValid = await bcrypt.compare(pin, user.pinHash);
```

### Rate Limiting
- Max 3 failed PIN attempts
- Lock for 5 minutes after 3 failures
- Show "Forgot PIN?" option

---

## 🚀 Implementation Order

### Phase 1: Core Authentication (Day 1)
1. ✅ Update User model
2. Create registration API with PIN
3. Create PIN verification API
4. Build RegisterPage with basic details
5. Build SetPINPage
6. Build new UnlockPage with PIN pad

### Phase 2: Onboarding (Day 1-2)
1. Create ConnectBankPage
2. Update Plaid flow to set hasBankConnected
3. Add success popup component
4. Implement onboarding routing logic

### Phase 3: Dashboard Redesign (Day 2-3)
1. Create new dashboard layout
2. Fetch real Plaid data
3. Calculate net worth from accounts
4. Add investment cards (mock data)
5. Add credit score card (mock)
6. Implement charts with real data
7. Add quick actions
8. Make mobile-responsive

### Phase 4: Polish (Day 3)
1. Add animations
2. Improve error handling
3. Add loading states
4. Test on mobile devices
5. Fix any bugs

---

## 📝 Testing Checklist

### Registration Flow
- [ ] Can enter basic details
- [ ] Can set 6-digit PIN
- [ ] PIN confirmation works
- [ ] Can use device password instead
- [ ] Redirects to bank connection

### Bank Connection
- [ ] Shows clear CTA
- [ ] Plaid Link opens
- [ ] Success popup appears
- [ ] hasBankConnected flag set
- [ ] Redirects to dashboard

### Unlock Flow
- [ ] Shows user name
- [ ] PIN pad works
- [ ] Correct PIN unlocks
- [ ] Wrong PIN shows error
- [ ] Device password option works
- [ ] Forgot PIN link works

### Dashboard
- [ ] Shows real balance
- [ ] Calculates net worth correctly
- [ ] Charts use real data
- [ ] Mobile responsive
- [ ] All cards visible
- [ ] Quick actions work

---

## 🎯 Success Metrics

### User Experience
- ✅ Clear onboarding flow (3 steps)
- ✅ Fast unlock (PIN or biometric)
- ✅ Obvious bank connection CTA
- ✅ Real financial data displayed
- ✅ Mobile-friendly UI

### Technical
- ✅ Secure PIN storage (bcrypt)
- ✅ Proper error handling
- ✅ Real-time data from Plaid
- ✅ Responsive design
- ✅ Fast load times

---

**Ready to start building! Beginning with Phase 1: Core Authentication**
