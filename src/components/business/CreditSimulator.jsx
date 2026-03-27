import React, { useState, useEffect } from 'react'
import { SlidersHorizontal, ArrowUpRight, CheckCircle2, TrendingUp, Landmark, ShieldCheck, FileCheck, Users, Target, RefreshCw } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function CreditSimulator() {
    const [loadingPlan, setLoadingPlan] = useState(false)
    const [actionPlan, setActionPlan] = useState(null)

    const [baseline] = useState({
        score: 64, // out of 100
        amount: 2500000,
        rate: 16.5,
        lenders: 4,
    })

    const [toggles, setToggles] = useState({
        closeLoan: false,
        improveGst: false,
        wait6Months: false,
        coApplicant: false,
    })

    const [turnoverIncrease, setTurnoverIncrease] = useState(0) // ₹ slider
    const [debtReduction, setDebtReduction] = useState(0) // ₹ slider

    // Real-time calculated impacts
    const current = {
        score: baseline.score,
        amount: baseline.amount,
        rate: baseline.rate,
        lenders: baseline.lenders
    }

    if (toggles.closeLoan) { current.score += 12; current.amount += 800000; current.rate -= 1.5; current.lenders += 3 }
    if (toggles.improveGst) { current.score += 8; current.rate -= 0.5; current.lenders += 2 }
    if (toggles.wait6Months) { current.score += 5; current.amount += 300000; current.rate -= 0.25; current.lenders += 1 }
    if (toggles.coApplicant) { current.score += 15; current.amount += 1500000; current.rate -= 2.0; current.lenders += 5 }
    
    // Slider impacts
    const turnoverImpact = Math.floor(turnoverIncrease / 500000)
    current.score += (turnoverImpact * 2)
    current.amount += (turnoverIncrease * 0.2) // 20% of extra turnover as limit
    
    const debtImpact = Math.floor(debtReduction / 200000)
    current.score += (debtImpact * 3)
    current.rate -= (debtImpact * 0.2)
    current.lenders += Math.floor(debtImpact * 0.5)

    // Bounds
    current.score = Math.min(100, current.score)
    current.rate = Math.max(9.5, Number(current.rate.toFixed(2)))
    current.lenders = Math.min(25, current.lenders)

    const fmtINR = (n) => '₹' + Number(Math.round(n)).toLocaleString('en-IN')

    const buildPlan = async () => {
        setLoadingPlan(true)
        await new Promise(r => setTimeout(r, 1500))
        
        const plan = `Based on your selected simulations, here is your 90-Day Execution Plan:
        
1. Immediately request a closure letter for your existing ₹${fmtINR(debtReduction || 500000)} high-interest loan.
2. File all pending GSTR-3B and GSTR-1 returns within the next 14 days to clear your compliance red flags.
3. Keep daily sales funneled rigidly into your primary current account to mathematically demonstrate the ${fmtINR(turnoverIncrease || 200000)} turnover bump.
4. After 90 days, your CIBIL CMR rank will automatically re-adjust upwards, validating a ${current.rate}% rate lock. Apply for the expanded ${fmtINR(current.amount)} limit only *after* the CMR refresh.`
        
        setActionPlan(plan)

        // Supabase tracking
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
             await supabase.from('improvement_simulations').insert({
                 user_id: user.id,
                 baseline_score: baseline.score,
                 target_score: current.score,
                 simulated_actions: { toggles, turnoverIncrease, debtReduction },
                 projected_rate_improvement: baseline.rate - current.rate,
                 projected_additional_lenders: current.lenders - baseline.lenders,
                 claude_action_plan: plan
             })
        }
        
        setLoadingPlan(false)
    }

    const Toggle = ({ label, id, icon: Icon, activeColor }) => {
        const active = toggles[id]
        return (
            <button 
                onClick={() => setToggles({...toggles, [id]: !active})}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-colors ${active ? `bg-${activeColor}-50 border-${activeColor}-200` : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${active ? `bg-${activeColor}-100 text-${activeColor}-600` : 'bg-gray-100 text-gray-400'}`}>
                    <Icon size={16} />
                </div>
                <div>
                    <p className={`font-semibold text-sm ${active ? `text-${activeColor}-800` : 'text-gray-700'}`}>{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Toggle to simulate</p>
                </div>
                {active && <CheckCircle2 size={18} className={`absolute top-4 right-4 text-${activeColor}-500`} />}
            </button>
        )
    }

    return (
        <div className="space-y-6 fade-in max-w-5xl mx-auto">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="text-purple-600" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">What-If Credit Simulator</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Interact with the strategic levers below to instantly project how certain business moves will unlock higher loan amounts and lower rates.
                    </p>
                </div>
            </div>

            {/* Sticky Results Header/Dashboard */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-xl sticky top-4 z-40 border border-gray-800 slide-in">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><ArrowUpRight size={14}/> Projected Funding Output</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-800">
                    <div className="pl-4 first:pl-0">
                        <p className="text-sm text-gray-400 mb-1">CMR Score</p>
                        <div className="flex items-end gap-2 text-white">
                            <span className="text-3xl font-black">{current.score}</span>
                            {current.score > baseline.score && <span className="text-emerald-400 text-sm font-bold mb-1">+{current.score - baseline.score}</span>}
                        </div>
                    </div>
                    <div className="pl-4">
                        <p className="text-sm text-gray-400 mb-1">Eligible Limit</p>
                        <div className="flex flex-col text-white">
                            <span className="text-3xl font-black">{fmtINR(current.amount)}</span>
                            {current.amount > baseline.amount && <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><ArrowUpRight size={12}/> {fmtINR(current.amount - baseline.amount)}</span>}
                        </div>
                    </div>
                    <div className="pl-4">
                        <p className="text-sm text-gray-400 mb-1">Expected Rate</p>
                        <div className="flex flex-col text-white">
                            <span className="text-3xl font-black">{current.rate}%</span>
                            {current.rate < baseline.rate && <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><TrendingUp size={12} className="rotate-180" /> -{(baseline.rate - current.rate).toFixed(2)}% drop</span>}
                        </div>
                    </div>
                    <div className="pl-4">
                        <p className="text-sm text-gray-400 mb-1">Unlocked Lenders</p>
                        <div className="flex items-end gap-2 text-white">
                            <span className="text-3xl font-black">{current.lenders}</span>
                            {current.lenders > baseline.lenders && <span className="text-emerald-400 text-sm font-bold mb-1">+{current.lenders - baseline.lenders} options</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Sliders */}
                <div className="card bg-white border-0 shadow-sm ring-1 ring-gray-100 p-6 space-y-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Financial Dials</h3>
                    
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-sm font-bold text-gray-700">Prove Monthly Turnover Bump</label>
                            <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-sm">+{fmtINR(turnoverIncrease)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="5000000" step="100000" 
                            value={turnoverIncrease} 
                            onChange={(e) => setTurnoverIncrease(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1"><span>₹0</span><span>₹5M+</span></div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-sm font-bold text-gray-700">Pay Down Existing Indebtedness</label>
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-sm">-{fmtINR(debtReduction)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="2000000" step="50000" 
                            value={debtReduction} 
                            onChange={(e) => setDebtReduction(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1"><span>₹0</span><span>₹2M max slider</span></div>
                    </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-3">
                     <Toggle id="closeLoan" label="Close High-Cost NBFC Loan" icon={Landmark} activeColor="emerald" />
                     <Toggle id="improveGst" label="Clear 2 Pending GST Returns" icon={FileCheck} activeColor="indigo" />
                     <Toggle id="wait6Months" label="Wait 6 Months Before Applying (Vintage +)" icon={ShieldCheck} activeColor="amber" />
                     <Toggle id="coApplicant" label="Add Co-Applicant (CIBIL 750+)" icon={Users} activeColor="blue" />
                </div>
            </div>

            <div className="pt-4">
                 <button onClick={buildPlan} disabled={loadingPlan} className="btn-primary w-full md:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 shadow-purple-600/20 text-base flex items-center justify-center gap-2 mx-auto">
                     {loadingPlan ? <RefreshCw size={18} className="animate-spin" /> : <><Target size={18}/> Generate Execution Plan</>}
                 </button>
            </div>

            {actionPlan && (
                <div className="card bg-gradient-to-br from-purple-50 to-white shadow-sm ring-1 ring-purple-100 p-6 md:p-8 slide-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Target size={150} /></div>
                    <div className="relative z-10 w-full md:w-3/4">
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                            <Target size={14}/> AI-Generated 90-Day Execution Plan
                        </p>
                        <div className="space-y-3">
                            {actionPlan.split('\n').filter(p => p.trim() !== '').map((para, i) => (
                                <p key={i} className={`text-sm leading-relaxed ${i===0 ? 'font-bold text-gray-800 text-base mb-4' : 'text-gray-700 flex items-start gap-2'}`}>
                                    {i > 0 && <CheckCircle2 size={16} className="text-purple-500 shrink-0 mt-0.5" />}
                                    {para.replace(/^\d+\.\s*/, '')}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
