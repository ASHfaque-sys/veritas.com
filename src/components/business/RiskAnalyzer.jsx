import React, { useState, useEffect } from 'react'
import { ShieldAlert, CheckCircle2, AlertTriangle, XCircle, ListOrdered, ArrowRight } from 'lucide-react'

export default function RiskAnalyzer() {
    const [analyzing, setAnalyzing] = useState(true)
    const [riskData, setRiskData] = useState(null)

    useEffect(() => {
        const analyze = async () => {
            // Simulate processing the user's unified score profile against 4 top bank models
            setAnalyzing(true)
            await new Promise(r => setTimeout(r, 1500))

            // Mock Data Output from the rule engine
            const banks = [
                {
                    id: 1, name: 'HDFC Bank',
                    risk: 'High',
                    primary_reason: 'CIBIL (680) is below strict minimum of 700.',
                    fix_tip: 'Wait 3 months while paying current term loan on time to boost CIBIL above 700.',
                    confidence: 94
                },
                {
                    id: 2, name: 'Bajaj Finserv',
                    risk: 'Low',
                    primary_reason: null,
                    fix_tip: null,
                    confidence: 88,
                    soft_warnings: ['FOIR is at 45%, bordering internal thresholds.']
                },
                {
                    id: 3, name: 'ICICI Bank',
                    risk: 'Medium',
                    primary_reason: 'Recent EMI bounce detected in last 6 months.',
                    fix_tip: 'Provide a letter of explanation for the September bounce, proving it was technical/isolated.',
                    confidence: 75
                },
                {
                    id: 4, name: 'State Bank of India',
                    risk: 'High',
                    primary_reason: 'Business vintage (2.1 yrs) fails minimum 3-year requirement for unsecured WC.',
                    fix_tip: 'Apply for the CGTMSE backed MUDRA product instead of standard unsecured WC limit.',
                    confidence: 99
                }
            ]

            const smartOrder = [
                { rank: 1, bank: 'Bajaj Finserv', odds: 'High Probability' },
                { rank: 2, bank: 'ICICI Bank', odds: 'Requires Mitigant' }
            ]

            setRiskData({ banks, smartOrder })
            setAnalyzing(false)
        }
        analyze()
    }, [])

    if (analyzing) {
        return (
            <div className="card border-0 bg-white shadow-sm ring-1 ring-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
                <ShieldAlert className="animate-pulse text-rose-500 mb-4" size={40} />
                <h3 className="font-semibold text-gray-800 text-lg mb-1">Scanning Underwriting Vectors</h3>
                <p className="text-gray-500 text-sm">Testing your profile against hard & soft bank triggers...</p>
            </div>
        )
    }

    const RiskIcon = ({ level }) => {
        if (level === 'High') return <XCircle className="text-rose-500" size={24} />
        if (level === 'Medium') return <AlertTriangle className="text-amber-500" size={24} />
        return <CheckCircle2 className="text-emerald-500" size={24} />
    }
    const RiskColor = { High: 'bg-rose-50 border-rose-100', Medium: 'bg-amber-50 border-amber-100', Low: 'bg-emerald-50 border-emerald-100'}
    const RiskText = { High: 'text-rose-700', Medium: 'text-amber-700', Low: 'text-emerald-700'}

    return (
        <div className="space-y-6 fade-in">
             <div className="flex items-start gap-4 slide-in">
                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    <ShieldAlert className="text-rose-600" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Rejection Risk Analyzer</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Identify exactly why a bank might reject you *before* you apply and hurt your CIBIL via hard inquiries.
                    </p>
                </div>
            </div>

            <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row gap-6 md:items-center justify-between relative overflow-hidden slide-in">
                <div className="absolute -right-4 -bottom-4 opacity-10"><ListOrdered size={120}/></div>
                <div className="relative z-10 w-full md:w-1/2">
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-1.5"><ListOrdered size={14}/> Smart Apply Strategy</p>
                    <h3 className="text-xl font-bold mb-2">Optimal Application Sequence</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        To protect your CMR Credit Rank, execute applications strictly in this order to maximize approval yield while utilizing the fewest inquiries.
                    </p>
                </div>
                <div className="relative z-10 w-full md:w-1/2 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md">
                    <div className="space-y-3">
                        {riskData.smartOrder.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 bg-gray-900/40 p-3 rounded-lg">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-xs font-bold">{s.rank}</span>
                                <span className="font-semibold text-white">{s.bank}</span>
                                <ArrowRight size={14} className="text-gray-400 ml-auto" />
                                <span className="text-xs font-bold text-emerald-400">{s.odds}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 fade-in">
                {riskData.banks.map((bank, i) => (
                    <div key={i} className={`p-5 rounded-2xl border ${RiskColor[bank.risk]} relative overflow-hidden group hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <RiskIcon level={bank.risk} />
                                <h4 className={`font-bold ${RiskText[bank.risk]}`}>{bank.name}</h4>
                            </div>
                            <span className="text-xs font-bold text-gray-400">
                                {bank.confidence}% Confidence
                            </span>
                        </div>
                        
                        {bank.risk === 'Low' ? (
                            <div>
                                <p className="text-sm text-emerald-800 font-semibold mb-2">Clear to Apply</p>
                                {bank.soft_warnings?.map((w, j) => (
                                    <p key={j} className="text-xs text-gray-600 italic bg-white/50 p-2 rounded-lg border border-emerald-100">• {w}</p>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-white/60 p-3 rounded-xl border border-black/5">
                                    <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Trigger Detected</p>
                                    <p className="text-sm text-gray-800 font-medium">{bank.primary_reason}</p>
                                </div>
                                <div className="bg-white/60 p-3 rounded-xl border border-black/5">
                                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1"><AlertTriangle size={12}/> How to Fix</p>
                                    <p className="text-sm text-gray-800">{bank.fix_tip}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
