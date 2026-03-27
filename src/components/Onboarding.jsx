import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle2, X } from 'lucide-react'

const STEPS = [
    {
        emoji: '👋',
        title: 'Welcome to Veritas AI',
        desc: "India's smartest loan eligibility checker. Know your approval odds before you apply — in under 2 minutes.",
        color: 'from-amber-400/20 to-amber-600/5',
        accent: '#C9A84C',
    },
    {
        emoji: '🔒',
        title: '100% Private & Free',
        desc: 'No hard CIBIL pull. Your credit score stays untouched. All data is encrypted and never sold.',
        color: 'from-emerald-400/20 to-emerald-600/5',
        accent: '#10b981',
    },
    {
        emoji: '📊',
        title: 'Upload Docs, Get Score',
        desc: 'Upload your payslips, ITR or bank statement. Our AI extracts data and scores your profile against real bank criteria.',
        color: 'from-indigo-400/20 to-indigo-600/5',
        accent: '#6366f1',
    },
    {
        emoji: '🏦',
        title: 'See Your Matched Lenders',
        desc: 'Get ranked bank picks with estimated approval rates. Apply directly to the best fit bank for your profile.',
        color: 'from-blue-400/20 to-blue-600/5',
        accent: '#3b82f6',
    },
]

export default function Onboarding({ onDone }) {
    const [step, setStep] = useState(0)
    const navigate = useNavigate()

    function next() {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1)
        } else {
            localStorage.setItem('vt-onboarded', 'true')
            if (onDone) onDone()
        }
    }

    function skip() {
        localStorage.setItem('vt-onboarded', 'true')
        if (onDone) onDone()
    }

    const s = STEPS[step]

    return (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 relative overflow-hidden">
                {/* Background gradient blob */}
                <div className={`absolute inset-0 bg-gradient-to-br ${s.color} pointer-events-none rounded-3xl`} />

                {/* Skip button */}
                <button
                    onClick={skip}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors z-10"
                    aria-label="Skip"
                >
                    <X size={18} />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Emoji */}
                    <div className="text-6xl mb-6 animate-bounce-slow">{s.emoji}</div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{s.title}</h2>

                    {/* Description */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">{s.desc}</p>

                    {/* Step dots */}
                    <div className="flex gap-2 mb-8">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    i === step ? 'w-6' : 'w-2 bg-gray-200 dark:bg-gray-700'
                                }`}
                                style={i === step ? { backgroundColor: s.accent } : {}}
                            />
                        ))}
                    </div>

                    {/* Next / Done button */}
                    <button
                        onClick={next}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all duration-200 active:scale-95 shadow-lg"
                        style={{ backgroundColor: s.accent }}
                    >
                        {step < STEPS.length - 1 ? (
                            <>Next <ChevronRight size={18} /></>
                        ) : (
                            <>Get Started <CheckCircle2 size={18} /></>
                        )}
                    </button>

                    {step < STEPS.length - 1 && (
                        <button onClick={skip} className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            Skip intro
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
