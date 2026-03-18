import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap } from 'lucide-react'

import { supabase } from '../utils/supabase'

export default function Navbar() {
    const location = useLocation()
    const isHome = location.pathname === '/'
    const [user, setUser] = React.useState(null)

    React.useEffect(() => {
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
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-700 flex items-center justify-center shadow-gold">
                        <Zap size={18} className="text-white fill-white" />
                    </div>
                    <span className="font-serif text-xl text-gray-900 group-hover:text-gold transition-colors">
                        Veritas <span className="text-gold">AI</span>
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    {/* Badge */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gold/8 border border-gold/25 rounded-full mr-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-semibold text-gold">
                            Powered by real approval data
                        </span>
                    </div>

                    {/* Auth Nav */}
                    {user ? (
                        <Link to="/dashboard" className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">
                            Dashboard
                        </Link>
                    ) : (
                        <Link to="/auth" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
