import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Calculator, Bot } from 'lucide-react'

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)



    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-10 h-16 flex items-center justify-between bg-void/85 backdrop-blur-md border-b border-line">
            <Link to="/" className="nav-logo">
                <div className="nav-logo-mark">V</div>
                <span className="nav-logo-name">Veritas <span>AI</span></span>
            </Link>
            <div className="nav-pill-badge hidden md:flex">Live · Real Approval Data</div>
            <div className="nav-right flex items-center gap-2">
                {/* Desktop links */}
                <Link to="/emi-calculator" className="nav-link hidden sm:flex items-center gap-1">
                    <Calculator size={14} /> EMI Calc
                </Link>
                <Link to="/rate-tracker" className="nav-link hidden md:flex items-center gap-1">
                    <TrendingUp size={14} /> Rates
                </Link>
                <Link to="/advisor" className="nav-link hidden md:flex items-center gap-1 text-indigo-500 hover:text-indigo-400">
                    <Bot size={14} /> AI Advisor
                </Link>
                <Link to="/affordability" className="nav-link hidden lg:flex items-center gap-1">
                    Affordability
                </Link>

            </div>
        </nav>
    )
}
