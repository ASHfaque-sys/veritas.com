import React, { useState } from 'react'
import { FileUp, TrendingDown, DollarSign, Activity, AlertTriangle, CheckCircle, Calculator, X } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function CashFlowAnalyzer() {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [statusText, setStatusText] = useState('')
    const [analysis, setAnalysis] = useState(null)
    const [simulatedLoans, setSimulatedLoans] = useState([])

    const fmtINR = (n) => '₹' + Number(Math.round(n)).toLocaleString('en-IN')

    const handleUpload = async (e) => {
        const uploadedFile = e.target.files[0]
        if (!uploadedFile) return
        setFile(uploadedFile)
        setLoading(true)

        // Mocking the Claude PDF parsing process
        try {
            setStatusText('Extracting transactions via Claude...')
            await new Promise(r => setTimeout(r, 1500))
            setStatusText('Calculating average monthly inflows & outflows...')
            await new Promise(r => setTimeout(r, 1000))
            setStatusText('Detecting recurring EMI signatures & bounce events...')
            await new Promise(r => setTimeout(r, 1500))

            const mockExtraction = {
                avgMonthlyInflow: 450000,
                avgMonthlyOutflow: 380000,
                netCashFlow: 70000,
                bounceCount: 1,
                bankingScore: 78,
                inflowTrend: 'positive',
                monthsAnalyzed: 6,
                declaredIncome: 450000, // For FOIR calculation
                claudeSummary: "Business shows strong cash generation with consistent daily sales credits. Core margins appear stable, but there is one recent inward return (bounce) which slightly drops the Banking Score. Overall working capital cycle appears healthy.",
                existingEmis: [
                    { id: 1, type: 'Business Term Loan', amount: 25000, bank: 'HDFC Bank', remainingMonths: 18, balance: 400000, active: true },
                    { id: 2, type: 'Machinery Loan', amount: 15000, bank: 'SBI', remainingMonths: 36, balance: 450000, active: true },
                    { id: 3, type: 'Credit Card Minimum', amount: 5000, bank: 'ICICI', remainingMonths: 0, balance: 0, active: true },
                ]
            }

            // Persist to Supabase
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('bank_statement_analyses').insert({
                    user_id: user.id,
                    statement_period_months: mockExtraction.monthsAnalyzed,
                    avg_monthly_inflow: mockExtraction.avgMonthlyInflow,
                    avg_monthly_outflow: mockExtraction.avgMonthlyOutflow,
                    net_cash_flow: mockExtraction.netCashFlow,
                    total_existing_emi_obligations: mockExtraction.existingEmis.reduce((sum, e) => sum + e.amount, 0),
                    bounce_transactions_count: mockExtraction.bounceCount,
                    banking_health_score: mockExtraction.bankingScore,
                    claude_plain_english_summary: mockExtraction.claudeSummary
                })
            }

            setAnalysis(mockExtraction)
            setSimulatedLoans(mockExtraction.existingEmis)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="card p-12 flex flex-col items-center justify-center bg-white border-0 shadow-sm ring-1 ring-gray-100">
                <RefreshCw className="animate-spin text-indigo-500 mb-4" size={32} />
                <h3 className="font-semibold text-gray-800 text-lg mb-1">Analyzing Bank Statement</h3>
                <p className="text-gray-500 text-sm">{statusText}</p>
            </div>
        )
    }

    if (!analysis) {
        return (
            <div className="card border-0 bg-white shadow-sm ring-1 ring-gray-100 slide-in">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Activity className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Cash Flow & Debt Analyzer</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload 6-12 months of bank statements to automatically extract your Banking Health Score and detect hidden EMI stacking.
                        </p>
                    </div>
                </div>

                <label className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center hover:bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileUp size={28} />
                    </div>
                    <span className="font-bold text-gray-800 mb-1">Upload Bank Statement (PDF)</span>
                    <span className="text-xs text-gray-500">Supports up to 12 months. E-statements only.</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
                </label>
            </div>
        )
    }

    // Calculations for Loan Stacking (Feature 3)
    const activeEmis = simulatedLoans.filter(l => l.active)
    const totalEmiSum = activeEmis.reduce((sum, l) => sum + l.amount, 0)
    const foirPct = Math.round((totalEmiSum / analysis.declaredIncome) * 100)

    let foirStatus = { color: 'text-emerald-500', bg: 'bg-emerald-50', message: "Strong position, most banks will approve." }
    if (foirPct > 40) foirStatus = { color: 'text-amber-500', bg: 'bg-amber-50', message: "Borderline — only select banks will approve." }
    if (foirPct > 55) foirStatus = { color: 'text-red-500', bg: 'bg-red-50', message: "High risk of rejection. Reduce existing EMIs before applying." }

    const toggleLoan = (id) => {
        setSimulatedLoans(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l))
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Cash Flow Summary Card (Feature 2) */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 card bg-white border-0 shadow-sm ring-1 ring-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity className="text-blue-500" size={20} /> Bank Statement Intelligence
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-gray-50">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">Avg Monthly Inflow</p>
                            <p className="text-xl font-bold text-gray-800">{fmtINR(analysis.avgMonthlyInflow)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">Avg Monthly Outflow</p>
                            <p className="text-xl font-bold text-gray-800">{fmtINR(analysis.avgMonthlyOutflow)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                            <p className="text-xs text-blue-600 mb-1 font-semibold">Net Cash Flow</p>
                            <p className="text-xl font-bold text-blue-900">{fmtINR(analysis.netCashFlow)}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <span className="text-blue-700 font-bold font-serif text-sm">C</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Banker's View Summary (AI Generate)</p>
                                <p className="text-sm text-gray-700 italic leading-relaxed">"{analysis.claudeSummary}"</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-white border-0 shadow-sm ring-1 ring-gray-100 p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Banking Health</p>
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" fill="none" className="stroke-gray-100" strokeWidth="12" />
                            <circle cx="64" cy="64" r="56" fill="none" className="stroke-blue-500" strokeWidth="12" strokeDasharray="351" strokeDashoffset={351 - (351 * analysis.bankingScore) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-gray-800">{analysis.bankingScore}</span>
                        </div>
                    </div>
                    {analysis.bounceCount > 0 ? (
                        <p className="text-xs text-red-500 font-semibold flex items-center justify-center gap-1">
                            <AlertTriangle size={14}/> {analysis.bounceCount} Ret/Bounce Detected
                        </p>
                    ) : (
                        <p className="text-xs text-emerald-500 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle size={14}/> Clean Trajectory
                        </p>
                    )}
                </div>
            </div>

            {/* Loan Stacking Detector & Simulator (Feature 3) */}
            <div className="card bg-white border-0 shadow-sm ring-1 ring-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Calculator className="text-indigo-500" size={20} /> Loan Stacking & FOIR Simulator
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">We detected the following recurring EMIs. Toggle them off to simulate closing the loan.</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-center border border-black/5 ${foirStatus.bg}`}>
                        <p className="text-xs font-bold uppercase tracking-wider text-black/40 mb-1">Current FOIR</p>
                        <p className={`text-3xl font-bold ${foirStatus.color}`}>{foirPct}%</p>
                    </div>
                </div>

                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-medium mb-6 ${foirStatus.bg} ${foirStatus.color}`}>
                    {foirPct > 40 ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                    {foirStatus.message}
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-semibold">
                            <tr>
                                <th className="px-4 py-3">Detected Facility</th>
                                <th className="px-4 py-3">Bank</th>
                                <th className="px-4 py-3 text-right">Monthly EMI</th>
                                <th className="px-4 py-3 text-center">Status in Simulator</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {simulatedLoans.map(loan => (
                                <tr key={loan.id} className={!loan.active ? 'bg-gray-50 opacity-50' : 'bg-white'}>
                                    <td className="px-4 py-3 font-medium text-gray-800">{loan.type}</td>
                                    <td className="px-4 py-3 text-gray-600">{loan.bank}</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">{fmtINR(loan.amount)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button 
                                            onClick={() => toggleLoan(loan.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${loan.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                        >
                                            {loan.active ? 'Simulate Closing' : 'Closed (Re-activate)'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan="2" className="px-4 py-3 text-right font-semibold text-gray-600">Total Valid Obligations:</td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">{fmtINR(totalEmiSum)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

            </div>
        </div>
    )
}
