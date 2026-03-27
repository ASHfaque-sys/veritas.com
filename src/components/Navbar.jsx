import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, TrendingUp, Calculator, Bot } from 'lucide-react'

export default function Navbar() {
    const [user, setUser] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const { dark, toggle } = useTheme()
    const navigate = useNavigate()

    useEffect(() => {
        if (!supabase) return
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
        })
        return () => subscription.unsubscribe()
    }, [])

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

                {/* Dark mode toggle */}
                <button
                    onClick={toggle}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-gray-300"
                    aria-label="Toggle dark mode"
                >
                    {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {user ? (
                    <Link to="/dashboard" className="nav-btn">Dashboard →</Link>
                ) : (
                    <Link to="/auth" className="nav-btn">Sign In →</Link>
                )}
            </div>
        </nav>
    )
}
