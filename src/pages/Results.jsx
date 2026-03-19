import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ScoreGauge from '../components/ScoreGauge'
import MetricRow from '../components/MetricRow'
import {
    calcFoir, calcDscr, foirStatus, dscrStatus,
    getPersonalImprovements, getBusinessImprovements, getStaticBankRecs, scoreColor
} from '../utils/scoring'
import { TrendingDown, Lightbulb, Building2, MessageSquarePlus, ChevronRight, AlertCircle, Info } from 'lucide-react'
import FloatingChat from '../components/FloatingChat'

function fmtINR(n) {
    if (!n) return '—'
    return '₹' + Number(n).toLocaleString('en-IN')
}
function fmtPct(n) { return n != null ? (n * 100).toFixed(1) + '%' : '—' }

export default function Results() {
    const { state } = useLocation()
    const navigate = useNavigate()

    // Fallback if navigated directly without state (demo mode)
    const s = state || {
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

    const [bankRecs, setBankRecs] = React.useState(getStaticBankRecs(loanType, score))

    React.useEffect(() => {
        async function loadBanks() {
            try {
                const { fetchBankProducts } = await import('../utils/api')
                const dynamicBanks = await fetchBankProducts(loanType)
                if (dynamicBanks && dynamicBanks.length > 0) {
                    setBankRecs(dynamicBanks)
                }
            } catch (err) {
                console.error("Failed to load dynamic banks, falling back to static.")
            }
        }
        loadBanks()
    }, [loanType, score])

    const mainColor = scoreColor(score)

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 fade-in">
                <div className="flex justify-between items-start mb-1">
                    <h1 className="section-title">Your Eligibility Report</h1>
                    <button onClick={() => window.print()} className="no-print flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors border border-indigo-100 shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download PDF
                    </button>
                </div>
                <p className="text-sm text-gray-400 mb-8">
                    {loanType === 'personal' ? 'Personal Loan' : 'Business Loan'} · Assessed {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>

                {/* ── Score Gauge ── */}
                <div className="card mb-6 flex flex-col items-center py-8">
                    <ScoreGauge score={score} />
                    <p className="text-sm text-gray-500 mt-4 text-center max-w-xs">
                        Your profile scores <strong style={{ color: mainColor }}>{score}/100</strong> based on our real-approval AI model.
                    </p>
                </div>

                {/* ── Key Metrics ── */}
                <div className="card mb-6">
                    <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-gold">📊</span> Key Metrics
                    </h2>
                    <div className="space-y-2">
                        {loanType === 'personal' ? (
                            <>
                                <MetricRow
                                    label="CIBIL Score"
                                    value={metrics.cibil}
                                    status={metrics.cibil >= 750 ? 'green' : metrics.cibil >= 680 ? 'amber' : 'red'}
                                    note="Min. 700 for most banks"
                                />
                                <MetricRow
                                    label="FOIR (debt burden)"
                                    value={fmtPct(foir)}
                                    status={foirStatus(foir)}
                                    note="Below 40% is ideal"
                                />
                                <MetricRow
                                    label="Monthly Income"
                                    value={fmtINR(metrics.monthlyIncome)}
                                    status={metrics.monthlyIncome >= 30000 ? 'green' : metrics.monthlyIncome >= 15000 ? 'amber' : 'red'}
                                />
                                <MetricRow
                                    label="Employment Type"
                                    value={metrics.employmentType || '—'}
                                    status={['Salaried', 'Professional / Doctor'].includes(metrics.employmentType) ? 'green' : 'amber'}
                                />
                                <MetricRow
                                    label="Employer Tenure"
                                    value={`${metrics.yearsAtEmployer || 0} yr(s)`}
                                    status={metrics.yearsAtEmployer >= 2 ? 'green' : metrics.yearsAtEmployer >= 1 ? 'amber' : 'red'}
                                    note="Min. 1 year preferred"
                                />
                                <MetricRow
                                    label="Loan Amount"
                                    value={fmtINR(metrics.loanAmount)}
                                    status={metrics.loanAmount <= metrics.monthlyIncome * 20 ? 'green' : metrics.loanAmount <= metrics.monthlyIncome * 36 ? 'amber' : 'red'}
                                />
                            </>
                        ) : (
                            <>
                                <MetricRow
                                    label="Promoter CIBIL"
                                    value={metrics.cibilScore}
                                    status={metrics.cibilScore >= 720 ? 'green' : metrics.cibilScore >= 680 ? 'amber' : 'red'}
                                />
                                <MetricRow
                                    label="DSCR"
                                    value={dscr != null ? dscr.toFixed(2) : '—'}
                                    status={dscrStatus(dscr)}
                                    note="Target ≥ 1.25"
                                />
                                <MetricRow
                                    label="Annual Turnover"
                                    value={fmtINR(metrics.annualTurnover)}
                                    status={metrics.annualTurnover >= 2000000 ? 'green' : metrics.annualTurnover >= 500000 ? 'amber' : 'red'}
                                />
                                <MetricRow
                                    label="Business Vintage"
                                    value={`${metrics.yearsInBusiness || 0} yr(s)`}
                                    status={metrics.yearsInBusiness >= 3 ? 'green' : metrics.yearsInBusiness >= 2 ? 'amber' : 'red'}
                                />
                                <MetricRow
                                    label="Loan Amount"
                                    value={fmtINR(metrics.loanAmount)}
                                    status={metrics.loanAmount <= metrics.annualTurnover * 0.5 ? 'green' : metrics.loanAmount <= metrics.annualTurnover * 0.7 ? 'amber' : 'red'}
                                />
                            </>
                        )}
                    </div>
                </div>
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
                                    <div key={i} className="flex flex-col p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-card transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600 shrink-0">
                                                    {bank.bank.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{bank.bank}</p>
                                                    <p className="text-xs text-gray-400">{bank.product}</p>
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
                                                className="block w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold text-center rounded-lg transition-colors border border-indigo-100"
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
        </div>
    )
}
