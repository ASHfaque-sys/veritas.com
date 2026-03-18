/**
 * Scoring utilities for Veritas AI
 * Calculates FOIR (personal) and DSCR (business) and weighted eligibility scores.
 */

// ─── CIBIL band helpers ────────────────────────────────────────────────────
export function getCibilRating(score) {
    if (score >= 750) return { label: 'Excellent', color: '#22c55e', bg: '#f0fdf4', score }
    if (score >= 700) return { label: 'Good', color: '#84cc16', bg: '#f7fee7', score }
    if (score >= 650) return { label: 'Fair', color: '#f59e0b', bg: '#fffbeb', score }
    if (score >= 600) return { label: 'Poor', color: '#f97316', bg: '#fff7ed', score }
    return { label: 'Very Poor', color: '#ef4444', bg: '#fef2f2', score }
}

// ─── FOIR (Fixed Obligation to Income Ratio) ──────────────────────────────
// Personal loan metric. Should be below 50% for good eligibility.
export function calcFoir(existingEMI, netMonthlyIncome) {
    if (!netMonthlyIncome || netMonthlyIncome <= 0) return null
    return Math.round((existingEMI / netMonthlyIncome) * 100) / 100
}

export function foirStatus(foir) {
    if (foir === null) return 'unknown'
    if (foir <= 0.40) return 'green'
    if (foir <= 0.55) return 'amber'
    return 'red'
}

// ─── DSCR (Debt Service Coverage Ratio) ──────────────────────────────────
// Business loan metric. (Net Profit + Depreciation) / Annual EMI.
// Should be >= 1.25 for approval.
export function calcDscr(netProfit, depreciation, annualEMI) {
    if (!annualEMI || annualEMI <= 0) return null
    return Math.round(((netProfit + depreciation) / annualEMI) * 100) / 100
}

export function dscrStatus(dscr) {
    if (dscr === null) return 'unknown'
    if (dscr >= 1.5) return 'green'
    if (dscr >= 1.25) return 'amber'
    return 'red'
}

// ─── Personal Loan Score (0-100) ──────────────────────────────────────────
export function scorePersonalLoan({
    cibilScore,
    monthlyIncome,
    existingEMI,
    loanAmount,
    employmentType,
    yearsAtEmployer,
}) {
    let total = 0

    // CIBIL weight: 35 pts
    const cibilPct = (cibilScore - 300) / 600
    total += cibilPct * 35

    // FOIR weight: 25 pts
    const foir = calcFoir(existingEMI, monthlyIncome)
    if (foir !== null) {
        const foirScore = foir <= 0.4 ? 25 : foir <= 0.55 ? 15 : foir <= 0.7 ? 5 : 0
        total += foirScore
    } else {
        total += 15 // neutral if no EMI data
    }

    // Loan-to-income ratio weight: 20 pts
    // Ideal: loan amount <= 30x monthly income
    const ltiRatio = loanAmount / (monthlyIncome * 12)
    const ltiScore = ltiRatio <= 0.5 ? 20 : ltiRatio <= 1.0 ? 15 : ltiRatio <= 2.0 ? 8 : 2
    total += ltiScore

    // Employment type weight: 10 pts
    const empScores = { salaried: 10, 'self-employed': 7, business: 8, professional: 9 }
    total += empScores[employmentType] || 5

    // Tenure stability weight: 10 pts
    const tenureScore = yearsAtEmployer >= 3 ? 10 : yearsAtEmployer >= 1 ? 6 : 2
    total += tenureScore

    return Math.min(100, Math.max(0, Math.round(total)))
}

// ─── Business Loan Score (0-100) ─────────────────────────────────────────
export function scoreBusinessLoan({
    cibilScore,
    annualTurnover,
    loanAmount,
    existingEMI,
    yearsInBusiness,
    netProfit,
    depreciation,
}) {
    let total = 0

    // CIBIL weight: 25 pts
    const cibilPct = (cibilScore - 300) / 600
    total += cibilPct * 25

    // DSCR weight: 30 pts
    const annualEMI = existingEMI * 12
    const dscr = calcDscr(netProfit || annualTurnover * 0.15, depreciation || 0, annualEMI)
    if (dscr !== null && annualEMI > 0) {
        total += dscr >= 1.5 ? 30 : dscr >= 1.25 ? 20 : dscr >= 1.0 ? 10 : 2
    } else {
        total += 15
    }

    // Loan-to-turnover ratio weight: 20 pts
    const ltvRatio = loanAmount / annualTurnover
    total += ltvRatio <= 0.3 ? 20 : ltvRatio <= 0.5 ? 14 : ltvRatio <= 0.7 ? 7 : 2

    // Business vintage weight: 15 pts
    total += yearsInBusiness >= 5 ? 15 : yearsInBusiness >= 3 ? 10 : yearsInBusiness >= 2 ? 6 : 2

    // Income base weight: 10 pts
    total += annualTurnover >= 5000000 ? 10 : annualTurnover >= 2000000 ? 7 : 4

    return Math.min(100, Math.max(0, Math.round(total)))
}

// ─── Generic score → colour ───────────────────────────────────────────────
export function scoreColor(score) {
    if (score >= 70) return '#22c55e'
    if (score >= 45) return '#f59e0b'
    return '#ef4444'
}

export function scoreLabel(score) {
    if (score >= 70) return 'High Probability'
    if (score >= 45) return 'Moderate Probability'
    return 'Low Probability'
}

// ─── Generate improvement tips ────────────────────────────────────────────
export function getPersonalImprovements({ cibilScore, foir, ltiRatio, yearsAtEmployer }) {
    const tips = []
    if (cibilScore < 720) tips.push({ factor: 'Low CIBIL Score', tip: 'Pay all EMIs on time for 6 months and reduce credit card utilisation below 30%.' })
    if (foir > 0.5) tips.push({ factor: 'High FOIR (Debt Burden)', tip: 'Close or pre-pay existing loans to bring monthly obligations below 40% of income.' })
    if (ltiRatio > 1.5) tips.push({ factor: 'Loan Amount Too High', tip: 'Reduce loan request or provide a co-applicant with additional income.' })
    if (yearsAtEmployer < 1) tips.push({ factor: 'Short Employment Tenure', tip: 'Wait until 1 year at current employer — most banks require minimum 1-year stability.' })
    // defaults
    if (tips.length === 0) {
        tips.push({ factor: 'Missing Documents', tip: 'Upload both payslip and ITR for a more accurate assessment.' })
        tips.push({ factor: 'Income Proof', tip: 'Providing 6-month bank statement increases approval chances by 25%.' })
    }
    return tips
}

export function getBusinessImprovements({ dscr, yearsInBusiness, ltvRatio }) {
    const tips = []
    if (dscr < 1.25) tips.push({ factor: 'Low DSCR', tip: 'Reduce annual debt obligations or show higher net profit to improve debt coverage.' })
    if (yearsInBusiness < 3) tips.push({ factor: 'Business Vintage', tip: 'Most banks prefer 3+ years. Consider MUDRA or CGTMSE schemes for newer businesses.' })
    if (ltvRatio > 0.5) tips.push({ factor: 'Loan vs. Turnover Ratio', tip: 'Reduce loan amount to below 50% of annual turnover for better eligibility.' })
    if (tips.length === 0) {
        tips.push({ factor: 'GST Compliance', tip: 'Regular GST filing improves credibility and unlocks better working capital limits.' })
        tips.push({ factor: 'Collateral', tip: 'Offering collateral (property/equipment) can significantly improve terms and approval chances.' })
        tips.push({ factor: 'Credit Mix', tip: 'Maintaining a healthy credit mix and clear trade references strengthens your profile.' })
    }
    return tips
}

// ─── Static bank recommendations (fallback without pgvector) ─────────────
export function getStaticBankRecs(loanType, score) {
    const personal = [
        { bank: 'HDFC Bank', product: 'Personal Loan', rate: '10.75% – 14.50%', maxAmount: '₹40 Lakh', minCibil: 750, link: 'https://v1.hdfcbank.com/borrow/popular-loans/personal-loan' },
        { bank: 'SBI', product: 'SBI Xpress Credit', rate: '11.15% – 15.30%', maxAmount: '₹20 Lakh', minCibil: 700, link: 'https://sbi.co.in/web/personal-banking/loans/personal-loans/xpress-credit' },
        { bank: 'ICICI Bank', product: 'Personal Loan', rate: '10.85% – 16.25%', maxAmount: '₹50 Lakh', minCibil: 720, link: 'https://www.icicibank.com/Personal-Banking/loans/personal-loan/index.page' },
        { bank: 'Axis Bank', product: 'Personal Loan', rate: '11.25% – 22.00%', maxAmount: '₹40 Lakh', minCibil: 700, link: 'https://www.axisbank.com/retail/loans/personal-loan' },
        { bank: 'Kotak Bank', product: 'Personal Loan', rate: '10.99% – 36.00%', maxAmount: '₹35 Lakh', minCibil: 720, link: 'https://www.kotak.com/en/personal-banking/loans/personal-loan.html' },
    ]
    const business = [
        { bank: 'HDFC Bank', product: 'Business Growth Loan', rate: '11.50% – 21.00%', maxAmount: '₹75 Lakh', minCibil: 700, link: 'https://www.hdfcbank.com/sme/borrow/business-loans/business-growth-loan' },
        { bank: 'SBI', product: 'SME Smart Score', rate: '11.20% – 16.00%', maxAmount: '₹50 Lakh', minCibil: 680, link: 'https://sbi.co.in/web/sme-enterprise/sme-loans' },
        { bank: 'ICICI Bank', product: 'Business Loan', rate: '12.00% – 19.00%', maxAmount: '₹2 Cr', minCibil: 700, link: 'https://www.icicibank.com/business-banking/loans/business-loan/index.page' },
        { bank: 'Bajaj Finance', product: 'Business Loan', rate: '14.00% – 26.00%', maxAmount: '₹80 Lakh', minCibil: 650, link: 'https://www.bajajfinserv.in/business-loan' },
        { bank: 'IDFC First', product: 'Business Loan', rate: '12.50% – 23.00%', maxAmount: '₹1 Cr', minCibil: 680, link: 'https://www.idfcfirstbank.com/business-banking/loans/business-loan' },
    ]
    const pool = loanType === 'personal' ? personal : business
    return pool
}
