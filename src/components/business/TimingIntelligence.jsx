import React, { useState, useEffect } from 'react'
import { CalendarDays, TrendingDown, Clock, MoveRight, ChevronRight, Info } from 'lucide-react'

export default function TimingIntelligence() {
    const [loading, setLoading] = useState(true)
    const [timingData, setTimingData] = useState(null)

    useEffect(() => {
        const fetchTiming = async () => {
            setLoading(true)
            await new Promise(r => setTimeout(r, 1000))

            const now = new Date()
            const currentMonth = now.getMonth() // 0-11
            
            // Build next 6 months array
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const next6Months = Array.from({length: 6}, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
                return { name: monthNames[d.getMonth()], num: d.getMonth() + 1 }
            })

            // Hardcoded timing intelligence logic based on Indian banking patterns
            const banks = [
                {
                    name: 'State Bank of India (PSB)',
                    type: 'PSB',
                    climate: 'Favorable', // It's Q4 push for PSBs
                    best_month: 3, // March
                    reasoning: 'PSBs are actively chasing annual disbursement targets before March 31st. Approval rates are historically 15-20% higher in Q4.',
                    calendar: next6Months.map(m => ({
                         month: m.name,
                         status: m.num === 3 ? 'Best' : (m.num === 1 || m.num === 2) ? 'Good' : 'Neutral'
                    }))
                },
                {
                    name: 'HDFC Bank (Private)',
                    type: 'Private',
                    climate: 'Neutral',
                    best_month: 9, // September
                    reasoning: 'Private banks heavily push disbursements in Q2 (Jul-Sep) before the festive season. Current quarter is standard operating procedure.',
                    calendar: next6Months.map(m => ({
                         month: m.name,
                         status: (m.num >= 7 && m.num <= 9) ? 'Best' : 'Neutral'
                    }))
                }
            ]

            const repoTrend = {
                current: '6.50%',
                trend: 'Dropping',
                impact: 'RBI cut benchmark rates last quarter. Banks are under competitive pressure to pass on benefits. Negotiate hard on final sanction rates.'
            }

            setTimingData({ banks, repoTrend, months: next6Months })
            setLoading(false)
        }
        
        fetchTiming()
    }, [])

    if (loading) {
        return (
            <div className="card p-12 flex flex-col items-center justify-center bg-white border-0 shadow-sm ring-1 ring-gray-100 min-h-[400px]">
                <Clock className="text-indigo-300 animate-spin mb-4" size={40} />
                <h3 className="font-semibold text-gray-800 text-lg mb-1">Analyzing Market Cycles</h3>
                <p className="text-gray-500 text-sm">Evaluating quarterly deployment data and repo trajectories...</p>
            </div>
        )
    }

    const ClimateColor = { Favorable: 'text-emerald-500 bg-emerald-50', Neutral: 'text-amber-500 bg-amber-50', Tight: 'text-rose-500 bg-rose-50' }

    return (
        <div className="space-y-6 fade-in">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <CalendarDays className="text-indigo-600" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Loan Timing Intelligence</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Identify the statistically optimal month to apply based on RBI Repo rates, seasonal banking sales targets, and festive volume pushes.
                    </p>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="w-full md:w-2/3">
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <TrendingDown size={14}/> Repo Rate Impact
                    </p>
                    <h3 className="text-xl font-bold mb-2">Macro Trend: Favorable for Borrowers</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{timingData.repoTrend.impact}</p>
                </div>
                <div className="w-full md:w-1/3 bg-white/10 p-5 rounded-xl border border-white/20 backdrop-blur-md text-center">
                    <p className="text-xs text-indigo-200 uppercase tracking-wider mb-1 font-semibold">Current RBI Repo</p>
                    <p className="text-4xl font-black text-white">{timingData.repoTrend.current}</p>
                </div>
            </div>

            <div className="space-y-4">
                {timingData.banks.map((bank, i) => (
                    <div key={i} className="card bg-white border-0 shadow-sm ring-1 ring-gray-100 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                             <div>
                                 <h4 className="text-lg font-bold text-gray-900 mb-1">{bank.name}</h4>
                                 <p className="text-sm text-gray-500 max-w-lg">{bank.reasoning}</p>
                             </div>
                             <div className={`px-4 py-2 rounded-lg font-bold border shrink-0 ${ClimateColor[bank.climate]} border-black/5`}>
                                 Climate: {bank.climate}
                             </div>
                        </div>
                        
                        <div>
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">6-Month Application Window Forecast</p>
                             <div className="flex gap-2 overflow-x-auto pb-2">
                                 {bank.calendar.map((cal, j) => (
                                      <div key={j} className={`flex-1 min-w-[80px] p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all
                                          ${cal.status === 'Best' ? 'bg-indigo-600 border-indigo-700 text-white shadow-md transform scale-105' : 
                                            cal.status === 'Good' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                                            'bg-gray-50 border-gray-100 text-gray-500'}
                                      `}>
                                          <span className={`text-xs font-bold tracking-wider ${cal.status==='Best'?'text-indigo-200':''}`}>{cal.month}</span>
                                          {cal.status === 'Best' && <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full mt-1">Optimal</span>}
                                      </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-start gap-3">
                 <Info className="text-gray-400 shrink-0 mt-0.5" size={18}/>
                 <p className="text-xs text-gray-600 leading-relaxed">
                     <strong className="text-gray-800">Pro Tip:</strong> PSBs (like SBI and PNB) operate on financial-year targets (April-March), making Jan-Mar their highest approval volume quarters. Private banks (like HDFC and ICICI) typically push aggressive consumer/SME lending ahead of the Diwali festive season (Aug-Oct).
                 </p>
            </div>
        </div>
    )
}
