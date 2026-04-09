import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MobileBottomNav from '../components/MobileBottomNav'
import ScoreGauge from '../components/ScoreGauge'
import MetricRow from '../components/MetricRow'
import {
    calcFoir, calcDscr, foirStatus, dscrStatus,
    getPersonalImprovements, getBusinessImprovements, getStaticBankRecs, scoreColor
} from '../utils/scoring'
import { generatePDFReport } from '../utils/pdfReport'
import { TrendingDown, Lightbulb, Building2, MessageSquarePlus, ChevronRight, AlertCircle, Info, Share2, CheckSquare, Square, Sliders, Download } from 'lucide-react'
import FloatingChat from '../components/FloatingChat'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

// ── Bank approval rates by score bracket ────────────────────────────────────
const BANK_APPROVAL_RATES = {
    personal: [
        { min: 85, bank: 'HDFC Bank', rate: 92, note: 'Pre-approved likely' },
        { min: 85, bank: 'ICICI Bank', rate: 89, note: 'Same-day processing' },
        { min: 75, bank: 'Axis Bank', rate: 81, note: 'Good approval odds' },
        { min: 60, bank: 'Bajaj Finserv', rate: 68, note: 'Consider improving score' },
        { min: 0, bank: 'NBFC Lenders', rate: 55, note: 'May have higher rates' },
    ],
    business: [
        { min: 80, bank: 'SBI', rate: 85, note: 'Strong approval odds' },
        { min: 70, bank: 'HDFC Business', rate: 79, note: 'Good fit for your profile' },
        { min: 55, bank: 'Kotak Mahindra', rate: 66, note: 'Moderate approval odds' },
        { min: 0, bank: 'Bajaj Finserv', rate: 52, note: 'May need collateral' },
    ],
}

const DOC_CHECKLISTS = {
    personal: [
        'Aadhaar Card (both sides)',
        'PAN Card',
        'Last 3 months salary slips',
        'Last 6 months bank statements',
        'Form 16 / ITR for last 2 years',
        'Employment letter / Offer letter',
        'Rent agreement or utility bill (address proof)',
        'Passport size photograph',
    ],
    business: [
        'Business PAN Card',
        'GST Registration Certificate',
        'Udyam / MSME Registration',
        'Last 2 years ITR with computation',
        'Audited Balance Sheet & P&L (2 years)',
        'Last 12 months GST returns',
        'Last 6 months current account statements',
        'Business address proof',
        'Promoter Aadhaar & PAN',
        'Partnership deed / MOA / AOA (if applicable)',
    ],
}

function fmtINR(n) {
    if (!n) return '—'
    return '₹' + Number(n).toLocaleString('en-IN')
}
function fmtPct(n) { return n != null ? (n * 100).toFixed(1) + '%' : '—' }

function getRadarData(loanType, metrics, foir, dscr, cibil) {
    if (loanType === 'personal') {
        const incomeScore = Math.min(100, (metrics.monthlyIncome / 100000) * 100)
        const debtScore = Math.max(0, 100 - (foir * 100))
        const historyScore = Math.max(0, ((cibil - 300) / 600) * 100)
        const stabilityScore = Math.min(100, (metrics.yearsAtEmployer / 5) * 100)
        const cashFlowScore = 80 // Base assumed for personal
        
        return [
            { subject: 'Cash Flow', A: cashFlowScore, fullMark: 100 },
            { subject: 'Income Size', A: incomeScore, fullMark: 100 },
            { subject: 'Debt Burden', A: debtScore, fullMark: 100 },
            { subject: 'Discipline', A: historyScore, fullMark: 100 },
            { subject: 'Stability', A: stabilityScore, fullMark: 100 },
        ]
    } else {
        const revenueScore = Math.min(100, (metrics.annualTurnover / 5000000) * 100)
        const debtScore = Math.min(100, Math.max(0, (dscr - 1) * 50)) // DSCR 1.0 = 0, DSCR 3.0 = 100
        const historyScore = Math.max(0, ((cibil - 300) / 600) * 100)
        const stabilityScore = Math.min(100, (metrics.yearsInBusiness / 5) * 100)
        
        let cashFlowScore = 70
        if (metrics.netProfit) cashFlowScore = Math.min(100, (metrics.netProfit / (metrics.annualTurnover*0.1)) * 100)

        return [
            { subject: 'Cash Flow', A: cashFlowScore, fullMark: 100 },
            { subject: 'Revenue Growth', A: revenueScore, fullMark: 100 },
            { subject: 'Debt Servicing', A: debtScore, fullMark: 100 },
            { subject: 'Discipline', A: historyScore, fullMark: 100 },
            { subject: 'Stability', A: stabilityScore, fullMark: 100 },
        ]
    }
}

function generateBankerComment(loanType, score, foir, dscr, cibil) {
    if (loanType === 'personal') {
        if (score > 80) return "The applicant demonstrates robust repayment discipline and stable employment history. Low obligations indicate a strong capacity to assume new debt. Eligible for immediate processing."
        if (score > 60) return "Applicant shows moderate stability. While credit history is acceptable, current debt-to-income limits maximum exposure. Reducing existing FOIR could significantly improve borrowing capacity."
        return "High risk profile. Elevated fixed obligations (FOIR) or poor credit history constrain borrowing capacity. Applicant falls outside primary lending policies until debt exposure is reduced."
    } else {
         if (score > 80) return "The enterprise exhibits excellent cash flow consistency and strong debt service coverage. Overall business fundamentals meet prime underwriting criteria. Recommended for approval."
         if (score > 60) return "Business shows adequate operational stability but carries moderate leverage. Debt service coverage (DSCR) is acceptable but requires monitoring. Consider collateral-backed structuring."
         return "Entity demonstrates weak operational cash flow or highly stressed debt service capacity. Risk of default is elevated under current market conditions. Not recommended for unsecured exposure."
    }
}

function getDetailedMetrics(loanType, score, metrics, foir, dscr, cibil) {
    const list = []
    
    // CASH FLOW
    const cfScore = loanType === 'business' 
        ? Math.round(Math.min(100, (metrics.netProfit / (metrics.annualTurnover*0.1)) * 100)) || 75
        : 80
    list.push({
        title: 'Cash Flow Consistency',
        score: cfScore,
        basedOn: loanType === 'business' ? 'Net Profit Margins vs Turnover' : 'Account Balance Trends',
        suggestion: cfScore > 70 ? 'Maintain stable liquid reserves' : 'Improve operational margins to build liquidity buffer'
    })

    // REVENUE/INCOME
    if (loanType === 'business') {
        const revScore = Math.round(Math.min(100, (metrics.annualTurnover / 5000000) * 100)) || 60
        list.push({ title: 'Revenue Growth', score: revScore, basedOn: 'Annual Turnover & GST trends', suggestion: 'Maintain or improve consistent volume' })
    } else {
        const incScore = Math.round(Math.min(100, (metrics.monthlyIncome / 100000) * 100)) || 65
        list.push({ title: 'Income Stability', score: incScore, basedOn: 'Monthly Net Income', suggestion: 'Consistent salary deposits improve approval odds' })
    }

    // DEBT BURDEN
    if (loanType === 'personal') {
        const dbScore = Math.round(Math.max(0, 100 - (foir * 100)))
        list.push({ title: 'Debt Burden (FOIR)', score: dbScore, basedOn: 'Existing EMI vs Net Income', suggestion: dbScore > 50 ? 'Avoid adding new unsecured obligations' : 'Reduce current loan exposure to improve limits' })
    } else {
        const dbScore = Math.round(Math.min(100, Math.max(0, (dscr - 1) * 50))) || 50
        list.push({ title: 'Debt Coverage (DSCR)', score: dbScore, basedOn: 'Net Profit vs EMI Obligations', suggestion: dbScore < 50 ? 'Reduce outstanding liabilities or restructure debt' : 'Strong capacity to service additional EMIs' })
    }

    // DISCIPLINE
    const discScore = Math.round(Math.max(0, ((cibil - 300) / 600) * 100)) || 70
    list.push({ title: 'Payment Discipline', score: discScore, basedOn: 'CIBIL Score & Repayment History', suggestion: discScore < 70 ? 'Clear outstanding dues to eliminate negative marks' : 'Reinforce positive on-time payment behavior' })

    // STABILITY
    const stabScore = loanType === 'business'
        ? Math.round(Math.min(100, (metrics.yearsInBusiness / 5) * 100)) || 50
        : Math.round(Math.min(100, (metrics.yearsAtEmployer / 5) * 100)) || 50
    list.push({ title: loanType === 'business' ? 'Business Stability' : 'Employment Stability', score: stabScore, basedOn: loanType === 'business' ? 'Business Vintage' : 'Years at Current Employer', suggestion: 'Improves naturally over time' })

    return list
}

export default function Results({ inlineData, onReset }) {
    const { state } = useLocation()
    const navigate = useNavigate()

    // Use inlineData if passed as prop, otherwise check router state, otherwise fallback to demo
    const s = inlineData || state || {
        loanType: 'personal',
        score: 68,
        sessionId: 'demo',
        metrics: {
            cibil: 720,
            monthlyIncome: 75000,
            existingEMI: 12000,
            loanAmount: 500000,
            employmentType: 'Salaried',
            yearsAtEmployer: 3,
            city: 'Mumbai',
        },
    }

    const { loanType, score, sessionId, metrics, hasGstReturns, hasBankStatements, loanTypeChosen } = s

    /* ── Personal metrics ── */
    const foir = loanType === 'personal'
        ? calcFoir(metrics.existingEMI, metrics.monthlyIncome)
        : null

    /* ── Business metrics ── */
    const dscr = loanType === 'business'
        ? calcDscr(metrics.netProfit, metrics.depreciation, (metrics.existingEMI || 0) * 12)
        : null

    const improvements = useMemo(() => {
        if (loanType === 'personal') {
            return getPersonalImprovements({
                cibilScore: metrics.cibil,
                foir,
                ltiRatio: metrics.loanAmount / (metrics.monthlyIncome * 12),
                yearsAtEmployer: metrics.yearsAtEmployer,
            })
        }
        return getBusinessImprovements({
            dscr,
            yearsInBusiness: metrics.yearsInBusiness,
            ltvRatio: metrics.loanAmount / metrics.annualTurnover,
        })
    }, [loanType, metrics, foir, dscr])

    return (
        <div className={`dark ${inlineData ? "w-full pb-10 mt-8 border-t border-white/10 pt-8" : "min-h-screen bg-[#0A0A0A] text-white flex flex-col"}`}>
            {!inlineData && <Navbar />}
            <main className={`flex-1 mx-auto w-full px-4 sm:px-6 ${inlineData ? "fade-in" : "max-w-7xl pt-24 pb-10 fade-in"}`}>
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Eligibility Decision Board</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {loanType === 'personal' ? 'Personal Loan' : 'Business Loan'} Assessed on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {inlineData && onReset && (
                            <button
                                onClick={onReset}
                                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors"
                            >
                                New Analysis
                            </button>
                        )}
                        <button
                            onClick={() => generatePDFReport({
                                loanType, score, metrics, sessionId,
                                bankRecs, improvements,
                                foir: foir,
                                dscr: dscr,
                            })}
                            className="no-print flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                        >
                            <Download size={16} />
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* ── Two Column Bank Dashboard Layout ── */}
                <div className="grid lg:grid-cols-12 gap-8 mb-12">
                    
                    {/* LEFT COLUMN (40%) Summary & Visualization */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Overall Score Card */}
                        <div className="p-6 bg-[#111111] rounded-2xl border border-white/10 shadow-lg shadow-black/40">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Overall Score</h2>
                            <div className="flex items-end gap-3">
                                <span className="text-6xl font-bold leading-none" style={{ color: mainColor }}>{score}</span>
                                <span className="text-xl text-gray-500 font-medium pb-1.5">/ 100</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5 mt-6">
                                <div className="h-1.5 rounded-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: mainColor }} />
                            </div>
                        </div>

                        {/* Radar Chart */}
                        <div className="p-6 bg-[#111111] rounded-2xl border border-white/10 shadow-lg shadow-black/40">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Core Credit Factors</h2>
                            <div className="h-[260px] w-full" style={{ marginLeft: '-15px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="#333" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Profile" dataKey="A" stroke={mainColor} fill={mainColor} fillOpacity={0.25} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Banker's View Note (AI Generated) */}
                        <div className="p-6 bg-gradient-to-br from-indigo-950/30 to-black rounded-2xl border border-indigo-900/40 shadow-lg shadow-black/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Building2 size={64} />
                            </div>
                            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                                <Info size={14} /> Underwriter's View
                            </h2>
                            <p className="text-sm text-gray-300 leading-relaxed font-medium relative z-10">
                                {bankerComment}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (60%) Detailed Breakdown */}
                    <div className="lg:col-span-7">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Detailed Breakdown</h2>
                        <div className="space-y-4">
                            {detailedMetrics.map((m, i) => (
                                <motion.div 
                                    key={m.title}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-5 bg-[#111111] rounded-2xl border border-white/10 shadow-lg shadow-black/40 flex flex-col sm:flex-row sm:items-start md:items-center gap-5"
                                >
                                    <div className="h-14 w-14 shrink-0 rounded-full flex items-center justify-center font-bold text-lg border-[3px]" 
                                        style={{ 
                                            borderColor: `${scoreColor(m.score)}40`, 
                                            color: scoreColor(m.score),
                                            backgroundColor: `${scoreColor(m.score)}15`
                                        }}>
                                        {m.score}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-bold text-gray-200">{m.title}</h3>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2.5">Determined by: <span className="text-gray-400">{m.basedOn}</span></p>
                                        <div className="flex items-start gap-2 bg-[#1A1A1A] p-3 rounded-xl border border-white/5">
                                            <Lightbulb size={14} className="mt-0.5 shrink-0 text-amber-500" />
                                            <p className="text-sm text-gray-300 leading-tight">{m.suggestion}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Enterprise Risk Analytics ── */}
                {loanType === 'business' && metrics.insights && (
                    <EnterpriseRiskCard insights={metrics.insights} />
                )}

                {/* ── Factors Hurting Validation / Red Flags ── */}
                <div className="card mb-6">
                    <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingDown size={18} className="text-red-500" />
                        Factors Hurting Your Score & Risk Flags
                    </h2>
                    
                    {metrics.redFlags && metrics.redFlags.length > 0 && (
                        <div className="mb-4 space-y-3">
                            {metrics.redFlags.map((flag, idx) => (
                                <div key={`rf-${idx}`} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 shadow-sm">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                                    <div>
                                        <strong className="block mb-0.5">Risk Detected in Bank Statement:</strong> {flag}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-3">
                        {improvements.length > 0 ? improvements.map((item, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-red-50/40 border border-red-100 rounded-xl">
                                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</div>
                                <div>
                                    <p className="text-sm font-semibold text-red-800">{item.factor}</p>
                                    <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{item.tip}</p>
                                </div>
                            </div>
                        )) : (
                            (!metrics.redFlags || metrics.redFlags.length === 0) && (
                                <p className="text-sm text-gray-500">Your profile looks solid! No major improvements needed.</p>
                            )
                        )}
                    </div>
                </div>

                {/* ── How to Improve ── */}
                <div className="card mb-6">
                    <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Lightbulb size={18} className="text-gold" />
                        Steps to Improve Your Score
                    </h2>
                    <div className="space-y-3">
                        {improvements.map((item, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-gold/5 border border-gold/20 rounded-xl">
                                <div className="w-6 h-6 rounded-full bg-gold/20 text-gold-700 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</div>
                                <p className="text-sm text-gray-700 leading-relaxed">{item.tip}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Bank Recommendations ── */}
                <div className="card mb-6">
                    <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Building2 size={18} className="text-indigo-500" />
                        {loanTypeChosen === 'psb-59' ? 'Your Recommended Scheme' : 'Top Bank Recommendations'}
                    </h2>
                    
                    {loanTypeChosen === 'psb-59' ? (
                        <div className="space-y-4">
                            <div className="border-2 border-gold rounded-xl overflow-hidden shadow-sm bg-white">
                                <div className="bg-gradient-to-r from-gold/10 to-transparent p-5 border-b border-gold/20 relative">
                                    <div className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                        Govt Scheme
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg mb-1 pr-16">PSB Loans in 59 Minutes</h3>
                                    <p className="text-sm text-gray-600">Government of India Fast-Track MSME Loan Portal</p>
                                </div>
                                
                                <div className="p-5 space-y-5">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs">In-principle approval</p>
                                            <p className="font-semibold text-gray-800">59 minutes</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Actual disbursal</p>
                                            <p className="font-semibold text-gray-800">7-8 working days</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Interest rate</p>
                                            <p className="font-semibold text-gray-800">From 8.5% p.a.</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Loan amount</p>
                                            <p className="font-semibold text-gray-800">₹10L to ₹5Cr</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Bank partners</p>
                                            <p className="font-semibold text-gray-800">21+</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Registration fee</p>
                                            <p className="font-semibold text-gray-800">Free</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="font-semibold text-gray-800 mb-2 text-sm">How to apply steps:</p>
                                        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                                            <li>Go to psbloansin59minutes.com</li>
                                            <li>Register with mobile OTP</li>
                                            <li>Select Business profile and enter business PAN</li>
                                            <li>Upload GST returns + ITR in XML format + bank statements PDF</li>
                                            <li>Enter business details and existing loan information</li>
                                            <li>Choose your preferred bank from 21+ options</li>
                                            <li>Get in-principle approval in 59 minutes</li>
                                            <li>Disbursal in 7-8 working days</li>
                                        </ol>
                                    </div>

                                    <div>
                                        <p className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center">&check;</span>
                                            Documents to prepare:
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-gray-700">
                                            <p className="flex items-start gap-2"><span className="text-gold shrink-0">&bull;</span> Business PAN card</p>
                                            <p className="flex items-start gap-2"><span className="text-gold shrink-0">&bull;</span> GST registration certificate</p>
                                            <p className="flex items-start gap-2"><span className="text-gold shrink-0">&bull;</span> GST returns last 12 months</p>
                                            <p className="flex items-start gap-2"><span className="text-gold shrink-0">&bull;</span> ITR in XML format (from incometax.gov.in)</p>
                                            <p className="flex items-start gap-2"><span className="text-gold shrink-0">&bull;</span> Bank statements last 6 months in PDF</p>
                                            <p className="flex items-start gap-2"><span className="text-gold shrink-0">&bull;</span> Udyam registration certificate</p>
                                            <p className="flex items-start gap-2"><span className="text-gold shrink-0">&bull;</span> Aadhaar card of promoter</p>
                                            <p className="flex items-start gap-2"><span className="text-gold shrink-0">&bull;</span> Existing loan details</p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex gap-2">
                                        <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                        <div>
                                            <strong>Important:</strong> ITR must be in XML format, not PDF.<br/>
                                            Go to incometax.gov.in &rarr; My Account &rarr; Download ITR XML
                                        </div>
                                    </div>

                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex gap-2">
                                        <Info className="shrink-0 mt-0.5" size={16} />
                                        <div>
                                            <strong>2% Interest Subvention</strong> available for GST-registered MSMEs with Udyog Aadhar Number. Apply separately after approval to reduce your effective interest rate by 2%.
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <a 
                                            href="https://www.psbloansin59minutes.com" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn-primary w-full text-center py-3 text-base font-semibold shadow-md flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-yellow-600 border-none relative overflow-hidden group"
                                        >
                                            <span className="relative z-10 font-bold">Apply on PSB 59 Minutes Portal &rarr;</span>
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        </a>
                                        <p className="text-xs text-center text-gray-500 mt-3 font-medium">No bank branch visit needed until final disbursement</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {bankRecs.map((bank, i) => (
                                    <div key={i} className={`flex flex-col p-4 bg-white border ${bank.matchLabel === 'Pre-Approved Match' ? 'border-emerald-200 shadow-sm' : 'border-gray-100'} rounded-xl hover:shadow-card transition-shadow relative overflow-hidden`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600 shrink-0">
                                                    {bank.bank.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-gray-800">{bank.bank}</p>
                                                        {bank.matchLabel && (
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${bank.matchColor || 'bg-gray-100 text-gray-600'}`}>
                                                                {bank.matchLabel}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5">{bank.product}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-gray-800">{bank.rate}</p>
                                                <p className="text-xs text-gray-400">up to {bank.maxAmount}</p>
                                            </div>
                                        </div>
                                        {bank.link && (
                                            <a 
                                                href={bank.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`block w-full py-2 ${bank.matchLabel === 'Pre-Approved Match' ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100'} text-xs font-semibold text-center rounded-lg transition-colors border`}
                                            >
                                                Apply Now &rarr;
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-3 text-center">* Rates are indicative. Actual rates depend on lender assessment.</p>
                        </>
                    )}
                </div>

                {/* ── PSB 59 Eligibility Banner ── */}
                {loanType === 'business' && loanTypeChosen !== 'psb-59' && score > 55 && metrics.loanAmount >= 1000000 && metrics.loanAmount <= 50000000 && hasGstReturns && hasBankStatements && (
                    <div className="card mb-6 border-2 border-gold/40 bg-gradient-to-r from-gold/10 to-transparent relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-gold">★</span> You may be eligible for PSB Loans in 59 Minutes
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Based on your profile, you meet the criteria for the government fast-track portal. Get in-principle approval in 59 minutes online.
                        </p>
                        <a 
                            href="https://www.psbloansin59minutes.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-gold hover:text-yellow-600 transition-colors"
                        >
                            Apply at psbloansin59minutes.com <ChevronRight size={16} />
                        </a>
                    </div>
                )}

                {/* ── Bank Approval Rate Stats ── */}
                <BankApprovalStats score={score} loanType={loanType} />

                {/* ── CIBIL Score Simulator ── */}
                {loanType === 'personal' && <CibilSimulator currentScore={score} currentCibil={metrics.cibil || 700} />}

                {/* ── Document Checklist ── */}
                <DocumentChecklist loanType={loanType} />

                {/* ── WhatsApp Share ── */}
                <WhatsAppShare score={score} loanType={loanType} loanAmount={metrics.loanAmount} />

                {/* ── Feedback Banner ── */}
                <div
                    className="p-5 rounded-xl border-2 border-dashed border-gold/40 bg-gradient-to-br from-gold/6 to-gold/3 cursor-pointer hover:border-gold/70 hover:bg-gold/8 transition-all duration-200"
                    onClick={() => navigate('/feedback', { state: { sessionId, loanType, score } })}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                            <MessageSquarePlus size={22} className="text-gold shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Applied for a loan? Share your outcome</p>
                                <p className="text-xs text-gray-500 mt-0.5">Unlock a free PDF report download when you submit feedback</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gold shrink-0" />
                    </div>
                </div>

                <FloatingChat context={{
                    loanType,
                    score,
                    sessionId,
                    metrics,
                    foir: foir ? (foir * 100).toFixed(1) + '%' : null,
                    dscr: dscr ? dscr.toFixed(2) : null,
                    improvements: improvements.map(i => i.tip),
                    recommendedBanks: bankRecs.map(b => b.bank),
                    summary: `This user applied for a ${loanType} loan and scored ${score}/100 on Veritas AI's eligibility checker.`,
                }} />
            </main>
            {!inlineData && <MobileBottomNav />}
        </div>
    )
}

// ── Enterprise Risk Card ───────────────────────────────────────────────────────
function EnterpriseRiskCard({ insights }) {
    if (!insights) return null
    return (
        <div className="card mb-6 border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" />
                Enterprise Risk Analytics
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
                {insights.zScore && (
                    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Altman Z-Score</p>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-2xl font-bold text-gray-800">{insights.zScore.score}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${insights.zScore.zone === 'safe' ? 'bg-emerald-100 text-emerald-700' : insights.zScore.zone === 'distress' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {insights.zScore.zone.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">Corporate bankruptcy prediction model. (&lt;1.23 = Distress, &gt;2.9 = Safe)</p>
                    </div>
                )}
                {insights.mpbf && (
                    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nayak Comm. MPBF Limit</p>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xl font-bold text-gray-800">₹{Number(insights.mpbf.limit).toLocaleString('en-IN')}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${insights.mpbf.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {insights.mpbf.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">Maximum Permissible Bank Finance (20% of projected turnover).</p>
                    </div>
                )}
                {insights.liquidity && (
                    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Ratio (Liquidity)</p>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xl font-bold text-gray-800">{insights.liquidity.ratio}x</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${insights.liquidity.zone === 'healthy' ? 'bg-emerald-100 text-emerald-700' : insights.liquidity.zone === 'insolvent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {insights.liquidity.zone.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">Short-term solvency test (Current Assets / Current Liabilities). Target &gt; 1.33x</p>
                    </div>
                )}
                {insights.stressedDscr && (
                    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Stressed DSCR</p>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xl font-bold text-gray-800">{insights.stressedDscr.ratio || '—'}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${insights.stressedDscr.zone === 'safe' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {insights.stressedDscr.zone.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">Debt coverage ratio simulated with a +2% interest rate shock.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Bank Approval Rate Stats Component ──────────────────────────────────────
function BankApprovalStats({ score, loanType }) {
    const banks = (BANK_APPROVAL_RATES[loanType] || BANK_APPROVAL_RATES.personal)
        .filter(b => score >= b.min)
        .slice(0, 3)

    if (banks.length === 0) return null

    return (
        <div className="card mb-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-lg">📈</span> Estimated Approval Rates for Your Profile
            </h2>
            <div className="space-y-3">
                {banks.map(b => (
                    <div key={b.bank} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                            {b.bank.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-semibold text-gray-700">{b.bank}</span>
                                <span className="text-sm font-bold text-indigo-600">{b.rate}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all"
                                    style={{ width: `${b.rate}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{b.note}</p>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">* Based on historical approval patterns for similar profiles. Actual approval depends on lender assessment.</p>
        </div>
    )
}

// ── CIBIL Simulator Component ────────────────────────────────────────────────
function CibilSimulator({ currentScore, currentCibil }) {
    const [simCibil, setSimCibil] = useState(currentCibil)
    const cibilBoost = simCibil - currentCibil
    const scoreBoost = Math.round(cibilBoost * 0.15) // roughly 0.15 pts per CIBIL point
    const newScore = Math.min(100, Math.max(0, currentScore + scoreBoost))

    return (
        <div className="card mb-6">
            <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <Sliders size={18} className="text-indigo-500" /> CIBIL Score Simulator
            </h2>
            <p className="text-xs text-gray-400 mb-4">See how improving your CIBIL score would affect your eligibility</p>
            <div className="mb-4">
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Simulated CIBIL</span>
                    <span className="text-sm font-bold text-indigo-600">{simCibil}</span>
                </div>
                <input type="range" min={300} max={900} step={10}
                    value={simCibil} onChange={e => setSimCibil(Number(e.target.value))}
                    className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>300 (Poor)</span><span>900 (Excellent)</span>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1 p-3 bg-gray-50 rounded-xl text-center">
                    <p className="text-xs text-gray-400 mb-1">Current Score</p>
                    <p className="text-xl font-bold text-gray-700">{currentScore}/100</p>
                </div>
                <div className="flex items-center text-gray-300 font-bold">→</div>
                <div className="flex-1 p-3 bg-indigo-50 rounded-xl text-center border border-indigo-100">
                    <p className="text-xs text-indigo-400 mb-1">Projected Score</p>
                    <p className={`text-xl font-bold ${newScore > currentScore ? 'text-emerald-600' : newScore < currentScore ? 'text-red-500' : 'text-gray-700'}`}>
                        {newScore}/100
                    </p>
                </div>
            </div>
            {cibilBoost > 0 && (
                <p className="text-xs text-emerald-600 font-medium mt-3 text-center">
                    ✓ Improving CIBIL by {cibilBoost} points could boost your score by ~{Math.abs(scoreBoost)} points
                </p>
            )}
        </div>
    )
}

// ── Document Checklist Component ─────────────────────────────────────────────
function DocumentChecklist({ loanType }) {
    const docs = DOC_CHECKLISTS[loanType] || DOC_CHECKLISTS.personal
    const [checked, setChecked] = useState({})
    const count = Object.values(checked).filter(Boolean).length

    function toggle(i) {
        setChecked(prev => ({ ...prev, [i]: !prev[i] }))
    }

    function copyList() {
        const text = `Document Checklist for ${loanType === 'business' ? 'Business' : 'Personal'} Loan:\n` +
            docs.map((d, i) => `${checked[i] ? '✅' : '☐'} ${d}`).join('\n')
        navigator.clipboard.writeText(text)
    }

    return (
        <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <CheckSquare size={18} className="text-emerald-500" />
                    Document Checklist
                </h2>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{count}/{docs.length} ready</span>
                    <button onClick={copyList} className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors font-medium">
                        Copy list
                    </button>
                </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${(count / docs.length) * 100}%` }} />
            </div>
            <div className="space-y-2">
                {docs.map((doc, i) => (
                    <button key={i} onClick={() => toggle(i)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left">
                        {checked[i]
                            ? <CheckSquare size={18} className="text-emerald-500 shrink-0" />
                            : <Square size={18} className="text-gray-300 shrink-0" />}
                        <span className={`text-sm ${checked[i] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{doc}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── WhatsApp Share Component ──────────────────────────────────────────────────
function WhatsAppShare({ score, loanType, loanAmount }) {
    const label = loanType === 'business' ? 'Business Loan' : 'Personal Loan'
    const amt = loanAmount ? `₹${Number(loanAmount).toLocaleString('en-IN')}` : 'a loan'
    const msg = encodeURIComponent(
        `🎯 I just checked my loan eligibility on Veritas AI!\n\n` +
        `📊 My Score: ${score}/100\n` +
        `💰 Loan: ${label} for ${amt}\n\n` +
        `Check yours free at: https://veritas-com-m898.vercel.app`
    )
    return (
        <a
            href={`https://wa.me/?text=${msg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full mb-6 py-3 bg-[#25D366] hover:bg-[#22c55e] text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
        >
            <Share2 size={18} />
            Share My Score on WhatsApp
        </a>
    )
}
