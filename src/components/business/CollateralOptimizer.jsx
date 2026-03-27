import React, { useState } from 'react'
import { Home, Percent, Calculator, CircleDollarSign, ArrowUpRight, TrendingDown } from 'lucide-react'

const LTV_RATES = {
    'Residential Property': 0.70,
    'Commercial Property': 0.60,
    'Industrial Property': 0.50,
    'Equipment & Machinery': 0.55,
    'Fixed Deposits': 0.90,
    'Gold': 0.75
}

export default function CollateralOptimizer() {
    const [form, setForm] = useState({ type: 'Residential Property', value: '', outstanding: '', ownership: 'Sole' })
    const [result, setResult] = useState(null)

    const calculate = (e) => {
        e.preventDefault()
        const val = Number(form.value)
        const out = Number(form.outstanding) || 0

        const ltv = LTV_RATES[form.type]
        const grossEligible = val * ltv
        const netCollateralValue = Math.max(0, grossEligible - out)

        // Baseline Clean Loan (Unsecured)
        const cleanRate = 18.5
        const cleanTenure = 3 // 3 years
        const cleanAmount = 2000000 // Assumption for base calculation
        
        const calcEmi = (p, r, tYears) => {
            const monthlyRate = (r / 12) / 100
            const months = tYears * 12
            return (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
        }

        const cleanEmi = calcEmi(cleanAmount, cleanRate, cleanTenure)
        const cleanTotal = cleanEmi * (cleanTenure * 12)
        const cleanInterest = cleanTotal - cleanAmount

        // Secured Loan using Collateral
        const securedRate = 9.5
        const securedTenure = 10 // 10 years max
        const securedAmount = Math.max(cleanAmount, netCollateralValue)
        
        // Let's compare apples to apples for interest savings on the SAME requested amount
        const eqSecuredEmi = calcEmi(cleanAmount, securedRate, cleanTenure)
        const eqSecuredTotal = eqSecuredEmi * (cleanTenure * 12)
        const eqSecuredInterest = eqSecuredTotal - cleanAmount

        setResult({
            netCollateralValue,
            clean: { amount: cleanAmount, rate: cleanRate, emi: cleanEmi, interest: cleanInterest },
            secured: { amount: securedAmount, rate: securedRate, emi: eqSecuredEmi, interest: eqSecuredInterest },
            savings: cleanInterest - eqSecuredInterest,
            ltvPct: Math.round(ltv * 100)
        })
    }

    const fmtINR = (n) => '₹' + Number(Math.round(n)).toLocaleString('en-IN')

    return (
        <div className="space-y-6 fade-in">
             <div className="card bg-white border-0 shadow-sm ring-1 ring-gray-100 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <Home className="text-teal-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Collateral Impact Calculator</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Discover how pledging property or high-value assets slashes your interest rates.
                        </p>
                    </div>
                </div>

                <form onSubmit={calculate} className="grid sm:grid-cols-2 gap-5 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div>
                        <label className="label-base">Asset Category</label>
                        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-base shadow-sm">
                            {Object.keys(LTV_RATES).map(k => <option key={k}>{k}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label-base">Estimated Market Value (₹)</label>
                        <input type="number" min="100000" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="input-base shadow-sm" placeholder="e.g. 15000000" required />
                    </div>
                    <div>
                        <label className="label-base">Outstanding Loans on Asset (₹)</label>
                        <input type="number" min="0" value={form.outstanding} onChange={e => setForm({...form, outstanding: e.target.value})} className="input-base shadow-sm" placeholder="0 if fully paid" />
                    </div>
                    <div>
                        <label className="label-base">Ownership Type</label>
                        <select value={form.ownership} onChange={e => setForm({...form, ownership: e.target.value})} className="input-base shadow-sm">
                            <option>Sole Ownership</option>
                            <option>Joint with Business Partner</option>
                            <option>Company Name</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2 pt-2">
                         <button type="submit" className="btn-primary w-full bg-teal-600 hover:bg-teal-700 shadow-teal-600/20 text-base">
                             Calculate Collateral Leverage
                         </button>
                    </div>
                </form>

                {result && (
                    <div className="slide-in">
                        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <p className="text-emerald-100 text-sm font-bold tracking-wider uppercase mb-1">Total Interest Saved Over 3 Years</p>
                                <h3 className="text-4xl font-black">{fmtINR(result.savings)}</h3>
                            </div>
                            <div className="w-full md:w-auto p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                                <p className="text-xs text-white/80 mb-1">Net Usable Collateral Value ({result.ltvPct}% LTV Haircut)</p>
                                <p className="text-xl font-bold">{fmtINR(result.netCollateralValue)}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {/* Unsecured Side */}
                            <div className="p-5 border border-gray-200 rounded-2xl bg-white relative overflow-hidden">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Without Collateral (Unsecured)</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm flex items-center gap-1.5"><Percent size={14}/> Interest Rate</span>
                                        <span className="font-bold text-gray-800">{result.clean.rate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm flex items-center gap-1.5"><Calculator size={14}/> Max Eligibility</span>
                                        <span className="font-bold text-gray-800">{fmtINR(result.clean.amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm flex items-center gap-1.5"><CircleDollarSign size={14}/> Total Interest Paid</span>
                                        <span className="font-bold text-red-500">{fmtINR(result.clean.interest)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Secured Side */}
                            <div className="p-5 border-2 border-teal-500 rounded-2xl bg-teal-50/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Optimal</div>
                                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">With Your {form.type}</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-teal-100">
                                        <span className="text-gray-600 text-sm flex items-center gap-1.5"><Percent size={14}/> Interest Rate</span>
                                        <span className="font-bold text-teal-700 flex items-center gap-1">{result.secured.rate}% <TrendingDown size={14} className="text-emerald-500"/></span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-teal-100">
                                        <span className="text-gray-600 text-sm flex items-center gap-1.5"><Calculator size={14}/> Max Eligibility</span>
                                        <span className="font-bold text-teal-700 flex items-center gap-1">{fmtINR(result.secured.amount)} <ArrowUpRight size={14} className="text-emerald-500"/></span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-teal-100">
                                        <span className="text-gray-600 text-sm flex items-center gap-1.5"><CircleDollarSign size={14}/> Total Interest Paid</span>
                                        <span className="font-bold text-teal-700">{fmtINR(result.secured.interest)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-700">
                                <strong className="text-gray-900">Expert Note:</strong> By pledging {form.type}, you unlock up to 
                                <strong className="text-teal-600"> {fmtINR(result.secured.amount)}</strong> in highly affordable Capital. Most banks will secure a first charge on the property while allowing you to retain full usage.
                            </p>
                        </div>
                    </div>
                )}
             </div>
        </div>
    )
}
