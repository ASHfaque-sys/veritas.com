import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FileUpload from '../components/FileUpload'
import LoadingScreen from '../components/LoadingScreen'
import PillButton from '../components/PillButton'
import { ChevronLeft, AlertCircle, Info } from 'lucide-react'
import { scoreBusinessLoan } from '../utils/scoring'
import { analyseDocument, saveAssessment } from '../utils/api'
import BusinessIntelligenceDashboard from '../components/business/BusinessIntelligenceDashboard'

const LOAN_TYPES = [
    {
        id: 'psb-59',
        label: 'PSB 59 Minutes',
        metrics: 'GST turnover + ITR in XML format + bank statements',
        docs: 'Business PAN, GST returns, ITR XML, bank statements PDF, Udyam certificate',
        desc: 'Government of India Fast-Track MSME Loan Portal (In-principle approval in 59 mins).',
    },
    {
        id: 'term-loan',
        label: 'Term Loan',
        metrics: 'DSCR ≥ 1.25, Business vintage ≥ 3 yrs, CIBIL ≥ 700',
        docs: 'Balance Sheet, ITR (3 yrs), Bank Statements (12 months)',
        desc: 'Fixed repayment schedule for capital expenditure or asset purchase.',
    },
    {
        id: 'working-capital',
        label: 'Working Capital',
        metrics: 'Current Ratio ≥ 1.33, Turnover-based limit',
        docs: 'GST Returns, Bank Statements (6 months), Stock Statement',
        desc: 'Short-term funding to manage daily operations and cash flow gaps.',
    },
    {
        id: 'lap',
        label: 'Loan Against Property',
        metrics: 'LTV ≤ 65%, DSCR ≥ 1.0, Property clear title',
        docs: 'Property Documents, Valuation Report, Balance Sheet, ITR',
        desc: 'Secured loan using commercial or residential property as collateral.',
    },
    {
        id: 'unsecured-business',
        label: 'Unsecured Business',
        metrics: 'CIBIL ≥ 720, Turnover ≥ ₹30 lakh, Vintage ≥ 2 yrs',
        docs: 'GST Returns (12 months), Bank Statements, ITR',
        desc: 'Collateral-free loan based on business health and credit profile.',
    },
    {
        id: 'invoice-discounting',
        label: 'Invoice Discounting',
        metrics: 'Invoice quality, Buyer creditworthiness',
        docs: 'Outstanding Invoices, GST Returns, Bank Statements',
        desc: 'Convert outstanding receivables into immediate liquidity.',
    },
    {
        id: 'equipment-finance',
        label: 'Equipment Finance',
        metrics: 'Asset value, DSCR ≥ 1.2, Quotation from supplier',
        docs: 'Equipment Quotation, ITR, Balance Sheet, Bank Statements',
        desc: 'Funding for purchase of machinery or equipment with asset as security.',
    },
    {
        id: 'mudra-cgtmse',
        label: 'MUDRA / CGTMSE',
        metrics: 'Turnover ≤ ₹10 Cr, CIBIL ≥ 650, No collateral required',
        docs: 'Business Plan, ITR, Bank Statements, KYC',
        desc: 'Government-backed loans for micro, small and medium enterprises.',
    },
    {
        id: 'overdraft',
        label: 'Overdraft',
        metrics: 'Average bank balance, Turnover, Property value',
        docs: 'Bank Statements (12 months), Financial Statements',
        desc: 'Revolving credit facility linked to current account for flexible withdrawal.',
    },
]

const BUSINESS_TYPES = ['Sole Proprietorship', 'Partnership', 'Private Limited', 'LLP', 'Public Limited', 'Trust / NGO']
const INDUSTRIES = ['Manufacturing', 'Trading', 'Services', 'Technology', 'Healthcare', 'Construction', 'Retail', 'Food & Beverage', 'Logistics', 'Other']

export default function BusinessLoan() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('intelligence') // 'apply' or 'intelligence'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [activeLoanType, setActiveLoanType] = useState('working_capital')
    const [analysisResult, setAnalysisResult] = useState(null)

    const [form, setForm] = useState({
        businessType: '',
        industry: '',
        yearsInBusiness: '',
        annualTurnover: '',
        loanAmount: '',
        existingEMI: '',
        cibilScore: '700',
        totalAssets: '',
        currentAssets: '',
        currentLiabilities: '',
    })
    const [balanceSheet, setBalanceSheet] = useState(null)
    const [itrPnl, setItrPnl] = useState(null)
    const [gstReturns, setGstReturns] = useState(null)
    const [bankStatements, setBankStatements] = useState(null)

    const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const selectedLoanType = LOAN_TYPES.find(t => t.id === activeLoanType)

    function validate() {
        const req = ['businessType', 'annualTurnover', 'loanAmount']
        for (const k of req) if (!form[k]) return 'Please fill in all required fields.'
        if (!balanceSheet) return 'Balance Sheet PDF is required.'
        if (!itrPnl) return 'ITR / P&L PDF is required.'
        return null
    }

    async function handleSubmit() {
        setError('')
        const err = validate()
        if (err) { setError(err); return }
        setLoading(true)
    }

    async function handleAnalysisComplete() {
        try {
            let extractedData = {}
            if (balanceSheet?.base64) {
                try {
                    const r = await analyseDocument(balanceSheet.base64, 'balance_sheet', 'business')
                    extractedData = { ...extractedData, balanceSheet: r.data }
                } catch (e) { /* non-fatal */ }
            }
            if (itrPnl?.base64) {
                try {
                    const r = await analyseDocument(itrPnl.base64, 'itr_pnl', 'business')
                    extractedData = { ...extractedData, itrPnl: r.data }
                } catch (e) { /* non-fatal */ }
            }
            if (bankStatements?.base64) {
                try {
                    const r = await analyseDocument(bankStatements.base64, 'bank_statements', 'business')
                    extractedData = { ...extractedData, bankStatements: r.data }
                } catch (e) { /* non-fatal */ }
            }

            const numTurnover = Number(form.annualTurnover)
            const numLoan = Number(form.loanAmount)
            const numEMI = Number(form.existingEMI) || 0
            const numYears = Number(form.yearsInBusiness) || 0
            
            const extractedProfit = extractedData.itrPnl?.net_profit
            const numProfit = extractedProfit ? Number(extractedProfit) : numTurnover * 0.12
            
            const extractedDeprec = extractedData.itrPnl?.depreciation
            const numDeprec = extractedDeprec ? Number(extractedDeprec) : 0
            
            const numCibil = Number(form.cibilScore) || 700

            const score = scoreBusinessLoan({
                cibilScore: numCibil,
                annualTurnover: numTurnover,
                loanAmount: numLoan,
                existingEMI: numEMI,
                yearsInBusiness: numYears,
                netProfit: numProfit,
                depreciation: numDeprec,
                totalAssets: Number(form.totalAssets) || numTurnover * 0.5,
                currentAssets: Number(form.currentAssets) || numTurnover * 0.3,
                currentLiabilities: Number(form.currentLiabilities) || numTurnover * 0.2,
            })

            const sessionData = await saveAssessment({
                loanType: 'business',
                extractedData: { ...form, loanTypeChosen: activeLoanType, ...extractedData, algorithmInsights: score.insights },
                probabilityScore: score.score,
            })

            setAnalysisResult({
                loanType: 'business',
                score,
                sessionId: sessionData?.session_id,
                loanTypeChosen: activeLoanType,
                hasGstReturns: !!gstReturns,
                hasBankStatements: !!bankStatements,
                metrics: {
                    annualTurnover: numTurnover,
                    loanAmount: numLoan,
                    existingEMI: numEMI,
                    yearsInBusiness: numYears,
                    netProfit: numProfit,
                    depreciation: numDeprec,
                    cibilScore: numCibil,
                    businessType: form.businessType,
                    industry: form.industry,
                    redFlags: extractedData.bankStatements?.red_flags || [],
                    insights: score.insights,
                },
            })
            setLoading(false)
        } catch (e) {
            setError('Analysis failed. Please try again.')
            setLoading(false)
        }
    }

    if (loading) return <LoadingScreen onComplete={handleAnalysisComplete} />

    return (
        <div className="min-h-screen bg-cream dark:bg-void flex flex-col">
            <Navbar />
            <main className={`flex-1 mx-auto w-full px-4 sm:px-6 pt-24 pb-10 fade-in ${activeTab === 'apply' ? 'max-w-2xl' : 'max-w-6xl'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
                        <ChevronLeft size={16} /> Back
                    </button>
                    
                    {!analysisResult && (
                        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                            <button 
                                onClick={() => setActiveTab('intelligence')}
                                className={`flex-1 sm:px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'intelligence' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Intelligence Suite
                            </button>
                            <button 
                                onClick={() => setActiveTab('apply')}
                                className={`flex-1 sm:px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'apply' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Apply for Loan
                            </button>
                        </div>
                    )}
                </div>

                {!analysisResult && (
                    <div className="mb-8">
                        <h1 className="section-title">Business Loan Center</h1>
                        <p className="text-sm text-gray-500 mt-1">AI-powered analytics and direct application portal.</p>
                    </div>
                )}

                {activeTab === 'intelligence' && !analysisResult ? (
                    <BusinessIntelligenceDashboard />
                ) : analysisResult ? (
                    <Results inlineData={analysisResult} onReset={() => { setAnalysisResult(null); window.scrollTo(0,0); }} />
                ) : (
                    <>

                {/* ── Step 1: Loan Type ── */}
                <div className="card mb-6">
                    <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gold text-white text-xs flex items-center justify-center font-bold">1</span>
                        Loan Type
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {LOAN_TYPES.map(lt => (
                            <PillButton
                                key={lt.id}
                                id={`loan-type-${lt.id}`}
                                label={lt.label}
                                active={activeLoanType === lt.id}
                                onClick={() => setActiveLoanType(activeLoanType === lt.id ? null : lt.id)}
                                className={lt.id === 'psb-59' ? 'border-2 border-gold shadow-sm' : ''}
                            />
                        ))}
                    </div>

                    {/* Context box */}
                    {selectedLoanType && (
                        <div className="mt-3 p-4 bg-gradient-to-br from-gold/8 to-gold/4 border border-gold/25 rounded-xl slide-in">
                            <div className="flex items-start gap-2">
                                <Info size={16} className="text-gold shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{selectedLoanType.label}</p>
                                    <p className="text-xs text-gray-600 mt-0.5 mb-3">{selectedLoanType.desc}</p>
                                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <p className="font-semibold text-gray-500 mb-1">Key Metrics</p>
                                            <p className="text-gray-600">{selectedLoanType.metrics}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-500 mb-1">Documents Needed</p>
                                            <p className="text-gray-600">{selectedLoanType.docs}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* ── Step 2: Business Details ── */}
                <div className="card mb-6">
                    <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gold text-white text-xs flex items-center justify-center font-bold">2</span>
                        Business Details
                    </h2>
                    <div className="space-y-4">
                        {/* Business type pills */}
                        <div>
                            <label className="label-base">Business Type <span className="text-red-400">*</span></label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {BUSINESS_TYPES.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setField('businessType', t)}
                                        className={`pill text-xs ${form.businessType === t ? 'pill-active' : 'pill-inactive'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Industry */}
                        <div>
                            <label className="label-base">Industry</label>
                            <select
                                id="industry"
                                value={form.industry}
                                onChange={e => setField('industry', e.target.value)}
                                className="input-base"
                            >
                                <option value="">Select industry…</option>
                                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                            </select>
                        </div>

                        {/* Vintage & Turnover */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label-base">Years in Business</label>
                                <input id="years-in-business" type="number" placeholder="e.g. 5" value={form.yearsInBusiness} onChange={e => setField('yearsInBusiness', e.target.value)} className="input-base" />
                            </div>
                            <div>
                                <label className="label-base">Annual Turnover (₹) <span className="text-red-400">*</span></label>
                                <input id="annual-turnover" type="number" placeholder="e.g. 5000000" value={form.annualTurnover} onChange={e => setField('annualTurnover', e.target.value)} className="input-base" />
                            </div>
                        </div>

                        {/* Loan amount & EMI */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label-base">Loan Amount Needed (₹) <span className="text-red-400">*</span></label>
                                <input id="business-loan-amount" type="number" placeholder="e.g. 2000000" value={form.loanAmount} onChange={e => setField('loanAmount', e.target.value)} className="input-base" />
                            </div>
                            <div>
                                <label className="label-base">Existing Monthly EMIs (₹)</label>
                                <input id="business-existing-emi" type="number" placeholder="0 if none" value={form.existingEMI} onChange={e => setField('existingEMI', e.target.value)} className="input-base" />
                            </div>
                        </div>

                        {/* Financial details */}
                        <div className="grid gap-4">
                            <div>
                                <label className="label-base">Promoter CIBIL Score</label>
                                <input id="business-cibil" type="number" min="300" max="900" placeholder="700" value={form.cibilScore} onChange={e => setField('cibilScore', e.target.value)} className="input-base" />
                            </div>
                        </div>

                        {/* Enterprise Financials */}
                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Info size={14} className="text-indigo-500" /> Advanced Financials (For Bank MPBF Calculation)</h3>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="label-base">Total Assets (₹)</label>
                                    <input type="number" placeholder="Estimated if unknown" value={form.totalAssets} onChange={e => setField('totalAssets', e.target.value)} className="input-base" />
                                </div>
                                <div>
                                    <label className="label-base">Current Assets (₹)</label>
                                    <input title="Cash, Inventory, Receivables" type="number" placeholder="Short-term assets" value={form.currentAssets} onChange={e => setField('currentAssets', e.target.value)} className="input-base" />
                                </div>
                                <div>
                                    <label className="label-base">Current Liab. (₹)</label>
                                    <input title="Short-term debt, Payables" type="number" placeholder="Short-term debt" value={form.currentLiabilities} onChange={e => setField('currentLiabilities', e.target.value)} className="input-base" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Step 3: Documents ── */}
                <div className="card mb-6">
                    <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gold text-white text-xs flex items-center justify-center font-bold">3</span>
                        Financial Documents
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FileUpload id="balance-sheet" label="Balance Sheet" required hint="PDF · Required" onFileChange={setBalanceSheet} />
                        <FileUpload id="itr-pnl" label="ITR / P&L Statement" required hint="PDF · Required" onFileChange={setItrPnl} />
                        <FileUpload id="gst-returns" label="GST Returns" hint="PDF · Optional" onFileChange={setGstReturns} />
                        <FileUpload id="bank-statements" label="Bank Statements" hint="PDF · Optional" onFileChange={setBankStatements} />
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 p-4 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        {error}
                    </div>
                )}

                <button
                    id="business-loan-submit"
                    onClick={handleSubmit}
                    className="btn-primary w-full text-base"
                >
                    Check Business Eligibility →
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                    No hard credit inquiry. Safe & secure.
                </p>
                </>
                )}
            </main>
        </div>
    )
}
