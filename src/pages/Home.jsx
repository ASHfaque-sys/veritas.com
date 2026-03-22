import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { ArrowRight, User, Briefcase, Shield, TrendingUp, Star, Upload, BarChart2, Building2, CheckCircle2, Quote } from 'lucide-react'

const FEATURES = [
    { icon: <Shield size={18} />, text: 'Bank-grade security' },
    { icon: <TrendingUp size={18} />, text: 'Real approval data' },
    { icon: <Star size={18} />, text: 'AI-powered insights' },
]

const HOW_IT_WORKS = [
    {
        step: '01',
        icon: <User size={22} className="text-indigo-600" />,
        title: 'Tell us about yourself',
        desc: 'Enter your income, CIBIL score, loan amount, and employment details. Takes under 2 minutes.',
    },
    {
        step: '02',
        icon: <Upload size={22} className="text-gold" />,
        title: 'Upload your documents',
        desc: "Optionally upload payslips, ITR, or bank statements. Our AI reads them and fills your data automatically.",
    },
    {
        step: '03',
        icon: <BarChart2 size={22} className="text-emerald-600" />,
        title: 'Get your eligibility score',
        desc: 'Receive an instant eligibility score out of 100, based on the same parameters real bank underwriters use.',
    },
    {
        step: '04',
        icon: <Building2 size={22} className="text-indigo-500" />,
        title: 'See matched lenders',
        desc: 'Get personalised bank recommendations with estimated approval rates — and apply directly on their portal.',
    },
]

const TRUST_BADGES = [
    { icon: '🔒', label: '256-bit SSL' },
    { icon: '🚫', label: 'No CIBIL pull' },
    { icon: '🙅', label: 'Data never sold' },
    { icon: '⚡', label: 'Instant results' },
    { icon: '🆓', label: 'Always free' },
]

export default function Home() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Navbar />

            <main className="flex-1 w-full fade-in">
                {/* ── Hero ── */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-center">
                    <h1 className="font-serif text-4xl md:text-6xl text-gray-900 leading-tight mb-5">
                        Know your loan odds<br />
                        <span className="text-gold italic">before you apply</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
                        Upload your documents and get an instant, AI-powered eligibility score — plus personalised tips and matched lenders.
                    </p>

                    {/* Badge */}
                    <div className="flex justify-center mt-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/8 border border-gold/25 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-gold">
                                Powered by real approval data
                            </span>
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap justify-center gap-3 mt-5 mb-8">
                        {TRUST_BADGES.map((b) => (
                            <div key={b.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-sm text-gray-600 shadow-sm">
                                <span>{b.icon}</span>{b.label}
                            </div>
                        ))}
                    </div>

                    {/* Hero CTA */}
                    <div className="flex justify-center mb-16">
                        <button onClick={() => navigate('/personal-loan')}
                            className="px-8 py-3.5 bg-gold hover:bg-yellow-500 text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(217,119,6,0.5)] transition-all flex items-center gap-2 text-lg">
                            Check My Eligibility <ArrowRight size={20} />
                        </button>
                    </div>

                    {/* Loan type cards */}
                    <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        <button id="personal-loan-card" onClick={() => navigate('/personal-loan')}
                            className="group text-left bg-white rounded-xl3 border border-gray-100 shadow-card hover:shadow-hover hover:border-gold/30 transition-all duration-300 p-8 overflow-hidden relative">
                            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-gradient-to-br from-gold/10 to-gold/5 group-hover:scale-125 transition-transform duration-500" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center mb-5 group-hover:from-gold group-hover:to-gold-700 group-hover:shadow-gold transition-all duration-300">
                                    <User size={26} className="text-gold group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h2 className="font-serif text-2xl text-gray-900 mb-2">Personal Loan</h2>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">Salaried or self-employed? Check eligibility with CIBIL score, income analysis and payslip verification.</p>
                                <div className="space-y-2 mb-6">
                                    {['CIBIL score analysis', 'Income & EMI check', 'Payslip + ITR verification'].map(t => (
                                        <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold" />{t}
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

                        <button id="business-loan-card" onClick={() => navigate('/business-loan')}
                            className="group text-left bg-white rounded-xl3 border border-gray-100 shadow-card hover:shadow-hover hover:border-gold/30 transition-all duration-300 p-8 overflow-hidden relative">
                            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:scale-125 transition-transform duration-500" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center mb-5 group-hover:from-gold group-hover:to-gold-700 group-hover:shadow-gold transition-all duration-300">
                                    <Briefcase size={26} className="text-indigo-500 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h2 className="font-serif text-2xl text-gray-900 mb-2">Business Loan</h2>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">Term loans, working capital, LAP and more. AI reads your financials for a bank-ready eligibility score.</p>
                                <div className="space-y-2 mb-6">
                                    {['8 loan type categories', 'DSCR & turnover analysis', 'Balance sheet + ITR check'].map(t => (
                                        <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />{t}
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
                </section>

                {/* ── How it Works ── */}
                <section className="bg-white border-y border-gray-100 py-16">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12">
                            <p className="text-xs font-bold text-gold uppercase tracking-widest mb-2">Simple Process</p>
                            <h2 className="font-serif text-3xl md:text-4xl text-gray-900">How Veritas AI works</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {HOW_IT_WORKS.map((item, i) => (
                                <div key={i} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-indigo-50/30 transition-colors">
                                    <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gold text-white text-xs font-bold flex items-center justify-center shadow-sm">
                                        {item.step}
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">{item.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                                    {i < HOW_IT_WORKS.length - 1 && (
                                        <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-gray-200 text-xl font-bold">›</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Bottom CTA ── */}
                <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-14 text-center text-white mx-4 sm:mx-6 rounded-2xl mb-8 max-w-5xl md:mx-auto shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="absolute rounded-full border border-white" style={{ width: `${80 + i * 60}px`, height: `${80 + i * 60}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                        ))}
                    </div>
                    <div className="relative">
                        <p className="text-xs font-bold tracking-widest uppercase text-indigo-200 mb-2">Free forever</p>
                        <h2 className="font-serif text-3xl md:text-4xl mb-4">Ready to check your eligibility?</h2>
                        <p className="text-indigo-200 text-sm mb-8 max-w-md mx-auto">Built for Indian borrowers. Free, private, and instant.</p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <button onClick={() => navigate('/personal-loan')}
                                className="px-8 py-3 bg-gold hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2">
                                Personal Loan <ArrowRight size={16} />
                            </button>
                            <button onClick={() => navigate('/business-loan')}
                                className="px-8 py-3 bg-white hover:bg-gray-50 text-indigo-900 font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2">
                                Business Loan <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
