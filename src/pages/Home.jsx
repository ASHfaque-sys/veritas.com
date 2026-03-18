import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ArrowRight, User, Briefcase, Shield, TrendingUp, Star } from 'lucide-react'

const FEATURES = [
    { icon: <Shield size={18} />, text: 'Bank-grade security' },
    { icon: <TrendingUp size={18} />, text: 'Real approval data' },
    { icon: <Star size={18} />, text: 'AI-powered insights' },
]

export default function Home() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Navbar />

            {/* Hero */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 md:py-20 fade-in">
                {/* Headline */}
                <div className="text-center mb-14">
                    <h1 className="font-serif text-4xl md:text-6xl text-gray-900 leading-tight mb-5">
                        Know your loan odds<br />
                        <span className="text-gold italic">before you apply</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
                        Upload your documents and get an instant, AI-powered eligibility score — plus personalised tips and matched lenders.
                    </p>

                    {/* Feature chips */}
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-sm text-gray-600 shadow-sm">
                                <span className="text-gold">{f.icon}</span>
                                {f.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cards */}
                <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Personal Loan Card */}
                    <button
                        id="personal-loan-card"
                        onClick={() => navigate('/personal-loan')}
                        className="group text-left bg-white rounded-xl3 border border-gray-100 shadow-card hover:shadow-hover hover:border-gold/30 transition-all duration-300 p-8 overflow-hidden relative"
                    >
                        {/* Decorative circle */}
                        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-gradient-to-br from-gold/10 to-gold/5 group-hover:scale-125 transition-transform duration-500" />

                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center mb-5 group-hover:from-gold group-hover:to-gold-700 group-hover:shadow-gold transition-all duration-300">
                                <User size={26} className="text-gold group-hover:text-white transition-colors duration-300" />
                            </div>

                            <h2 className="font-serif text-2xl text-gray-900 mb-2">Personal Loan</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                Salaried or self-employed? Check eligibility with CIBIL score, income analysis and payslip verification.
                            </p>

                            <div className="space-y-2 mb-6">
                                {['CIBIL score analysis', 'Income & EMI check', 'Payslip + ITR verification'].map(t => (
                                    <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                                        {t}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400">Loan range</p>
                                    <p className="text-sm font-semibold text-gray-700">₹50K – ₹50 Lakh</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold group-hover:shadow-gold transition-all duration-300">
                                    <ArrowRight size={18} className="text-gold group-hover:text-white transition-colors duration-300" />
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Business Loan Card */}
                    <button
                        id="business-loan-card"
                        onClick={() => navigate('/business-loan')}
                        className="group text-left bg-white rounded-xl3 border border-gray-100 shadow-card hover:shadow-hover hover:border-gold/30 transition-all duration-300 p-8 overflow-hidden relative"
                    >
                        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:scale-125 transition-transform duration-500" />

                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center mb-5 group-hover:from-gold group-hover:to-gold-700 group-hover:shadow-gold transition-all duration-300">
                                <Briefcase size={26} className="text-indigo-500 group-hover:text-white transition-colors duration-300" />
                            </div>

                            <h2 className="font-serif text-2xl text-gray-900 mb-2">Business Loan</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                Term loans, working capital, LAP and more. AI reads your financials for a bank-ready eligibility score.
                            </p>

                            <div className="space-y-2 mb-6">
                                {['8 loan type categories', 'DSCR & turnover analysis', 'Balance sheet + ITR check'].map(t => (
                                    <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                        {t}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400">Loan range</p>
                                    <p className="text-sm font-semibold text-gray-700">₹5 Lakh – ₹10 Cr</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-gold group-hover:shadow-gold transition-all duration-300">
                                    <ArrowRight size={18} className="text-indigo-500 group-hover:text-white transition-colors duration-300" />
                                </div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-gray-400 mt-10">
                    Your data is processed securely and never shared with third parties without consent.
                </p>
            </main>
        </div>
    )
}
