import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function Navbar() {
    const [user, setUser] = useState(null)

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
            <div className="nav-right">
                <Link to="/emi-calculator" className="nav-link hidden sm:block">EMI Calc</Link>
                {user ? (
                    <Link to="/dashboard" className="nav-btn">Dashboard →</Link>
                ) : (
                    <Link to="/auth" className="nav-btn">Sign In →</Link>
                )}
            </div>
        </nav>
    )
}
