import React from 'react'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 mt-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                {/* Top row */}
                <div className="flex flex-col sm:flex-row justify-between gap-8 mb-8">
                    {/* Brand */}
                    <div className="max-w-xs">
                        <Link to="/" className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center shadow-sm">
                                <Zap size={16} className="text-white fill-white" />
                            </div>
                            <span className="font-serif text-lg text-gray-900">Veritas <span className="text-gold">AI</span></span>
                        </Link>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            AI-powered loan eligibility checker for India. Know your approval odds before you walk into a bank.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex gap-12">
                        <div>
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Tools</p>
                            <ul className="space-y-2">
                                <li><Link to="/personal-loan" className="text-xs text-gray-500 hover:text-gold transition-colors">Personal Loan Check</Link></li>
                                <li><Link to="/business-loan" className="text-xs text-gray-500 hover:text-gold transition-colors">Business Loan Check</Link></li>
                                <li><Link to="/emi-calculator" className="text-xs text-gray-500 hover:text-gold transition-colors">EMI Calculator</Link></li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Account</p>
                            <ul className="space-y-2">
                                <li><Link to="/dashboard" className="text-xs text-gray-500 hover:text-gold transition-colors">Dashboard</Link></li>
                                <li><Link to="/auth" className="text-xs text-gray-500 hover:text-gold transition-colors">Sign In / Register</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* RBI Disclaimer */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                        <strong>⚠️ Disclaimer:</strong> Veritas AI is an independent financial information platform and is <strong>not affiliated with any bank, NBFC, or regulated lending institution</strong>. The eligibility scores and recommendations provided are indicative only, based on self-declared data, and do not constitute a loan approval, credit facility, or financial advice. All lending decisions are solely at the discretion of the respective lenders. Veritas AI does not access your CIBIL report or any bureau data. Please verify all information with your lender. Veritas AI is not registered with the <strong>Reserve Bank of India (RBI)</strong> as a lending or credit information entity.
                    </p>
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t border-gray-100">
                    <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} Veritas AI. All rights reserved.</p>
                    <div className="flex gap-4">
                        <span className="text-[11px] text-gray-400">Your data is never sold or shared.</span>
                        <span className="text-[11px] text-gray-400">🔒 256-bit SSL encrypted</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
