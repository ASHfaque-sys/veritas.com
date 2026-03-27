import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from './utils/supabase'
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/Home'
import PersonalLoan from './pages/PersonalLoan'
import BusinessLoan from './pages/BusinessLoan'
import Results from './pages/Results'
import Feedback from './pages/Feedback'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import EmiCalculator from './pages/EmiCalculator'
import Admin from './pages/Admin'
import AffordabilityCalculator from './pages/AffordabilityCalculator'
import RateTracker from './pages/RateTracker'
import Onboarding from './components/Onboarding'

// Shows a spinner while we check the session
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-cream dark:bg-gray-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-400 font-medium">Loading…</p>
            </div>
        </div>
    )
}

// Wraps any route — redirects to /auth if not signed in
function ProtectedRoute({ user, loading, children }) {
    if (loading) return <LoadingScreen />
    if (!user) return <Navigate to="/auth" replace />
    return children
}

export default function App() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showOnboarding, setShowOnboarding] = useState(false)

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setLoading(false)
            return
        }
        // Get current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null)
            setLoading(false)
            // Show onboarding for new sessions
            if (session?.user && !localStorage.getItem('vt-onboarded')) {
                setShowOnboarding(true)
            }
        })
        // Listen for sign-in / sign-out
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
            if (session?.user && !localStorage.getItem('vt-onboarded')) {
                setShowOnboarding(true)
            }
        })
        return () => subscription.unsubscribe()
    }, [])

    const protect = (element) => (
        <ProtectedRoute user={user} loading={loading}>
            {element}
        </ProtectedRoute>
    )

    return (
        <ThemeProvider>
            <BrowserRouter>
                {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
                <Routes>
                    {/* Public route — login/register */}
                    <Route path="/auth" element={<Auth />} />

                    {/* All other routes require sign-in */}
                    <Route path="/"                      element={protect(<Home />)} />
                    <Route path="/personal-loan"         element={protect(<PersonalLoan />)} />
                    <Route path="/business-loan"         element={protect(<BusinessLoan />)} />
                    <Route path="/results"               element={protect(<Results />)} />
                    <Route path="/feedback"              element={protect(<Feedback />)} />
                    <Route path="/dashboard"             element={protect(<Dashboard />)} />
                    <Route path="/emi-calculator"        element={protect(<EmiCalculator />)} />
                    <Route path="/admin"                 element={protect(<Admin />)} />
                    <Route path="/affordability"         element={protect(<AffordabilityCalculator />)} />
                    <Route path="/rate-tracker"          element={protect(<RateTracker />)} />

                    {/* Catch-all → home (will redirect to /auth if not signed in) */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}
