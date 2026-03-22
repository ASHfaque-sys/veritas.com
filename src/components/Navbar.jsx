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
        <header className="masthead">
            <span className="masthead-date">India · Est. 2024 · Free Forever</span>
            <Link to="/" className="masthead-logo block decoration-transparent hover:opacity-90 transition-opacity">
                <div className="masthead-logo-text">Veritas <span>AI</span></div>
                <div className="masthead-logo-tagline">Smart Loan Eligibility · Powered by Real Approval Data</div>
            </Link>
            <nav className="masthead-nav">
                <Link to="/emi-calculator">EMI Calc</Link>
                {user ? (
                    <Link to="/dashboard" className="nav-pill">Dashboard →</Link>
                ) : (
                    <Link to="/auth" className="nav-pill">Log In →</Link>
                )}
            </nav>
        </header>
    )
}
