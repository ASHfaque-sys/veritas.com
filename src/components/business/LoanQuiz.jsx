import React, { useState } from 'react'
import { Check, Target, Zap, Clock, ChevronRight, Award } from 'lucide-react'

const QUESTIONS = [
    {
        id: 'purpose',
        q: 'What do you need the money for?',
        options: ['Working Capital', 'Buy Equipment', 'Business Expansion', 'Buy Property', 'Emergency Buffer']
    },
    {
        id: 'vintage',
        q: 'How long have you been in business?',
        options: ['Under 1 year', '1-3 years', '3-5 years', '5+ years']
    },
    {
        id: 'turnover',
        q: 'What is your average monthly turnover?',
        options: ['Under ₹1L', '₹1-5L', '₹5-25L', '₹25L+']
    },
    {
        id: 'collateral',
        q: 'Do you have assets to offer as collateral?',
        options: ['Commercial Property', 'Residential Property', 'Equipment', 'No Collateral']
    },
    {
        id: 'urgency',
        q: 'How quickly do you need the funds?',
        options: ['Within 1 week', 'Within 1 month', 'No urgency']
    },
    {
        id: 'banking',
        q: 'What is your primary banking relationship?',
        options: ['PSB (SBI/Bank of Baroda)', 'Private Bank', 'Both', 'None / Cooperative']
    }
]

export default function LoanQuiz() {
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState({})
    const [result, setResult] = useState(null)

    const handleAnswer = (val) => {
        const newAnswers = { ...answers, [QUESTIONS[step].id]: val }
        setAnswers(newAnswers)
        
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1)
        } else {
            generateRecommendation(newAnswers)
        }
    }

    const generateRecommendation = (ans) => {
        // Deterministic Decision Tree Logic
        let primary = null
        let secondary = null
        let rate = ''
        let tip = ''
        let banks = ''

        if (ans.purpose === 'Buy Equipment') {
            primary = { title: 'Equipment Finance', why: ['Asset acts as own security', 'Higher LTV possible', 'Tax benefits on depreciation'] }
            secondary = 'Term Loan'
            rate = '9.5% - 13.0%'
            banks = 'HDFC Bank, Tata Capital, SIDBI'
            tip = 'Get a proforma invoice from your equipment supplier before applying.'
        } else if (ans.collateral.includes('Property')) {
            primary = { title: 'Loan Against Property (LAP)', why: ['Lowest fixed rates', 'Longest tenure up to 15 years', 'Higher loan values unlocked'] }
            secondary = 'Working Capital OD'
            rate = '8.5% - 11.5%'
            banks = 'SBI, ICICI Bank, Axis Bank'
            tip = 'Ensure title deeds are clear and municipal taxes are fully paid.'
        } else if (ans.vintage === 'Under 1 year' || ans.turnover === 'Under ₹1L') {
             primary = { title: 'MUDRA Loan (Shishu/Kishore)', why: ['Government backed without collateral', 'Perfect for MSME starters', 'Subsidized rates'] }
             secondary = 'Personal Loan'
             rate = '8.5% - 12.0%'
             banks = 'Canara Bank, PNB, SBI'
             tip = 'Prepare a strong 1-page business plan outlining local demand.'
        } else if (ans.urgency === 'Within 1 week' && ans.collateral === 'No Collateral') {
             primary = { title: 'Unsecured Business Loan', why: ['No collateral required', 'Fastest disbursement (48 hours)', 'Minimal documentation'] }
             secondary = 'Business Credit Card'
             rate = '14.5% - 21.0%'
             banks = 'Bajaj Finserv, Lendingkart, IndusInd'
             tip = 'Keep 12 months PDF bank statements ready for digital parsing.'
        } else {
             primary = { title: 'Working Capital Overdraft', why: ['Pay interest only on utilized amount', 'Revolving credit facility', 'Perfect for inventory matching'] }
             secondary = 'Unsecured Term Loan'
             rate = '10.5% - 14.0%'
             banks = 'HDFC Bank, ICICI Bank, Kotak'
             tip = 'Route maximum daily sales credits through a single current account.'
        }

        setResult({ primary, secondary, rate, tip, banks })
    }

    const reset = () => {
        setStep(0)
        setAnswers({})
        setResult(null)
    }

    if (result) {
        return (
            <div className="card border-0 bg-white shadow-sm ring-1 ring-gray-100 p-8 slide-in max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center relative">
                        <Award size={32} />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <CheckCircle size={16} className="text-emerald-500" />
                        </div>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Optimal Recommendation</p>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">{result.primary.title}</h2>
                    <p className="text-gray-500">Based on your {answers.vintage} vintage and {answers.urgency} requirement.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                     <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Zap size={14}/> Expected Rates</p>
                          <p className="text-lg font-bold text-gray-800">{result.rate}</p>
                     </div>
                     <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Target size={14}/> Primary Targets</p>
                          <p className="text-sm font-bold text-gray-800 leading-tight">{result.banks}</p>
                     </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-3">Why this is your best option:</h3>
                    <ul className="space-y-3">
                        {result.primary.why.map((reason, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                {reason}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <ChevronRight size={14} /> The Runner Up
                    </p>
                    <p className="text-sm text-gray-700">Almost went with <span className="font-bold">{result.secondary}</span>, but {result.primary.title} fits your specific collateral and timeline better.</p>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock size={14} /> Prepare Before Applying
                    </p>
                    <p className="text-sm text-gray-700">{result.tip}</p>
                </div>

                <button onClick={reset} className="w-full mt-6 py-3 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                    Retake Quiz
                </button>
            </div>
        )
    }

    return (
        <div className="card border-0 bg-white shadow-sm ring-1 ring-gray-100 p-8 max-w-xl mx-auto fade-in">
            <div className="mb-8">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    <span>Question {step + 1} of {QUESTIONS.length}</span>
                    <span className="text-indigo-600">{Math.round(((step) / QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
                    <div 
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${((step) / QUESTIONS.length) * 100}%`}}
                    ></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{QUESTIONS[step].q}</h2>
            </div>

            <div className="space-y-3">
                {QUESTIONS[step].options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 font-medium text-gray-800 transition-all active:scale-[0.98]"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    )
}
