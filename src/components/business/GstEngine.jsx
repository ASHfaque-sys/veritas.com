import React, { useState } from 'react'
import { Search, Building, FileCheck, TrendingUp, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function GstEngine() {
    const [gstin, setGstin] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState(null)

    const handleCheck = async (e) => {
        e.preventDefault()
        if (!gstin || gstin.length !== 15) {
            setError('Please enter a valid 15-character GSTIN.')
            return
        }
        setError('')
        setLoading(true)
        setResult(null)

        try {
            // 1. Mock hitting the free public GST API & Return Filing endpoints
            // In production: fetch(`https://sheet.gstincheck.co.in/check/${API_KEY}/${gstin}`)
            await new Promise(r => setTimeout(r, 2000)) // network delay

            const mockApiResponse = {
                legalName: 'Acme TradeCorp Private Limited',
                businessType: 'Private Limited',
                registrationDate: '2019-04-15',
                state: 'Maharashtra',
                hsnCodes: ['9983', '8471'], // IT & Machinery
                filingStatus: 'Active',
                returnsFiled: 36,
                returnsDelayed: 4,
                estimatedTurnover: 55000000, // 5.5 Cr
            }

            // 2. Calculations
            const businessAgeMonths = Math.floor((new Date() - new Date(mockApiResponse.registrationDate)) / (1000 * 60 * 60 * 24 * 30))
            const regularityPct = Math.round(((mockApiResponse.returnsFiled - mockApiResponse.returnsDelayed) / mockApiResponse.returnsFiled) * 100)
            
            // Health Score: 30% regularity, 30% turnover baseline, 25% payment consistency (mocked via delayed), 15% age
            const scoreFiling = Math.min(30, (regularityPct / 100) * 30)
            const scoreTurnover = Math.min(30, (mockApiResponse.estimatedTurnover / 10000000) * 30) // max 30 pts at 1Cr+
            const scoreConsistency = Math.min(25, 25 - (mockApiResponse.returnsDelayed * 2))
            const scoreAge = Math.min(15, (businessAgeMonths / 36) * 15) // max 15 pts at 3+ yrs
            
            const healthScore = Math.max(0, Math.min(100, Math.round(scoreFiling + scoreTurnover + scoreConsistency + scoreAge)))

            const eligibleWc = mockApiResponse.estimatedTurnover * 0.15
            const eligibleTl = mockApiResponse.estimatedTurnover * 0.25

            const fullProfile = {
                ...mockApiResponse,
                businessAgeMonths,
                regularityPct,
                healthScore,
                eligibleWc,
                eligibleTl
            }

            // 3. Persist to Supabase
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('gst_profiles').insert({
                    user_id: user.id,
                    gstin: gstin,
                    legal_name: fullProfile.legalName,
                    business_type: fullProfile.businessType,
                    registration_date: fullProfile.registrationDate,
                    industry_hsn_sac_codes: fullProfile.hsnCodes,
                    total_turnover_estimated: fullProfile.estimatedTurnover,
                    filing_regularity_pct: fullProfile.regularityPct,
                    gst_health_score: fullProfile.healthScore,
                    raw_api_data: mockApiResponse
                })
            }

            setResult(fullProfile)
        } catch (err) {
            setError(err.message || 'Failed to fetch GST details. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const fmtINR = (n) => '₹' + Number(Math.round(n)).toLocaleString('en-IN')

    function HealthGauge({ score }) {
        const color = score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'
        return (
            <div className={`text-4xl font-bold ${color}`}>{score}<span className="text-lg text-gray-400">/100</span></div>
        )
    }

    return (
        <div className="space-y-6 slide-in">
            <div className="card border-0 bg-white shadow-sm ring-1 ring-gray-100">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <FileCheck className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">GST-Based Eligibility Engine</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Instantly analyze your business health, revenue, and filing compliance using just your GSTIN.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleCheck} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Enter 15-digit GSTIN (e.g. 27AADCB2230M1Z2)"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono uppercase"
                            value={gstin}
                            onChange={e => setGstin(e.target.value.toUpperCase())}
                            maxLength={15}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary whitespace-nowrap px-8 flex items-center gap-2"
                    >
                        {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Analyze GST Profile'}
                    </button>
                </form>
                {error && <p className="text-sm text-red-500 mt-3 flex items-center gap-1"><AlertCircle size={14}/> {error}</p>}
            </div>

            {result && (
                <div className="grid md:grid-cols-3 gap-6 fade-in">
                    {/* Primary Stats Card */}
                    <div className="md:col-span-2 card bg-white border-0 shadow-sm ring-1 ring-gray-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{result.legalName}</h3>
                                <p className="text-sm text-indigo-600 font-semibold flex items-center gap-1 mt-1">
                                    <CheckCircle2 size={14} /> GST {result.filingStatus} ({result.state})
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">GST Health Score</p>
                                <HealthGauge score={result.healthScore} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><Building size={14}/> Est. Annual Turnover</p>
                                <p className="text-xl font-bold text-gray-800">{fmtINR(result.estimatedTurnover)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><TrendingUp size={14}/> Business Vintage</p>
                                <p className="text-xl font-bold text-gray-800">{Math.floor(result.businessAgeMonths/12)} Yrs {result.businessAgeMonths%12} Mos</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-800 mb-3">Estimated Eligible Loan Amounts</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl relative overflow-hidden group hover:border-indigo-300 transition-colors">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <TrendingUp size={40} className="text-indigo-600" />
                                    </div>
                                    <p className="text-xs text-indigo-600 font-semibold mb-1">Working Capital (~15% TR)</p>
                                    <p className="text-lg font-bold text-gray-900">{fmtINR(result.eligibleWc)}</p>
                                </div>
                                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl relative overflow-hidden group hover:border-emerald-300 transition-colors">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Building size={40} className="text-emerald-600" />
                                    </div>
                                    <p className="text-xs text-emerald-600 font-semibold mb-1">Term Loan (~25% TR)</p>
                                    <p className="text-lg font-bold text-gray-900">{fmtINR(result.eligibleTl)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Insights Card */}
                    <div className="card bg-white border-0 shadow-sm ring-1 ring-gray-100 p-6 flex flex-col">
                        <h3 className="font-semibold text-gray-800 mb-4">Filing Compliance</h3>
                        <div className="flex-1 flex flex-col justify-center mb-6">
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-bold text-gray-800">{result.regularityPct}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${result.regularityPct}%`}}></div>
                            </div>
                            <p className="text-xs text-gray-500">
                                {result.returnsFiled} returns filed • {result.returnsDelayed} delayed
                            </p>
                        </div>

                        <div className="border-t border-gray-100 pt-5 mt-auto">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Top Recommended Loans</h4>
                            <div className="space-y-2">
                                {['Working Capital OD', 'Term Loan', 'PSB 59 Minutes Scheme'].map((loan, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <div className="w-5 h-5 rounded bg-white border border-gray-200 text-xs flex items-center justify-center font-bold text-gray-500">{i+1}</div>
                                        {loan}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
