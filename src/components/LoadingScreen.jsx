import React, { useEffect, useState } from 'react'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'

const STEPS = [
    { id: 1, label: 'Reading documents', sublabel: 'Parsing uploaded PDFs…' },
    { id: 2, label: 'Extracting metrics', sublabel: 'Identifying income, EMIs, financials…' },
    { id: 3, label: 'Finding similar profiles', sublabel: 'Matching against approval database…' },
    { id: 4, label: 'Matching banks', sublabel: 'Identifying best lenders for your profile…' },
    { id: 5, label: 'Generating report', sublabel: 'Compiling your eligibility report…' },
]

export default function LoadingScreen({ onComplete }) {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        let timer
        if (current < STEPS.length) {
            timer = setTimeout(() => setCurrent(c => c + 1), 700)
        } else {
            timer = setTimeout(() => onComplete?.(), 600)
        }
        return () => clearTimeout(timer)
    }, [current, onComplete])

    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm">
                {/* Logo / Title */}
                <div className="text-center mb-10">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-700 items-center justify-center shadow-gold mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>
                    <h2 className="font-serif text-2xl text-gray-900">Analysing Your Profile</h2>
                    <p className="text-sm text-gray-500 mt-1">This takes just a few seconds…</p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                    {STEPS.map((step, idx) => {
                        const done = idx < current
                        const active = idx === current
                        const pending = idx > current

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${done ? 'bg-green-50 border-green-200 opacity-75' :
                                        active ? 'bg-white border-gold/40 shadow-card scale-[1.02]' :
                                            'bg-white/50 border-gray-100 opacity-40'
                                    }`}
                            >
                                {/* Icon */}
                                <div className="shrink-0">
                                    {done && <CheckCircle size={22} className="text-green-500" />}
                                    {active && <Loader2 size={22} className="text-gold animate-spin" />}
                                    {pending && <Circle size={22} className="text-gray-300" />}
                                </div>

                                {/* Text */}
                                <div>
                                    <p className={`text-sm font-semibold ${done ? 'text-green-700' : active ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {step.label}
                                    </p>
                                    {active && (
                                        <p className="text-xs text-gray-400 mt-0.5 slide-in">{step.sublabel}</p>
                                    )}
                                </div>

                                {/* Step number */}
                                <div className="ml-auto shrink-0">
                                    <span className={`text-xs font-bold ${done ? 'text-green-400' : active ? 'text-gold' : 'text-gray-200'}`}>
                                        {idx + 1} / {STEPS.length}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Progress bar */}
                <div className="mt-8 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: `${(current / STEPS.length) * 100}%`,
                            background: 'linear-gradient(to right, #C9A84C, #a0852e)',
                        }}
                    />
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">
                    {Math.round((current / STEPS.length) * 100)}% complete
                </p>
            </div>
        </div>
    )
}
