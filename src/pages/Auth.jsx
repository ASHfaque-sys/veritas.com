import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { supabase, isSupabaseConfigured } from '../utils/supabase'
import { AlertCircle, LogIn, UserPlus } from 'lucide-react'

export default function Auth() {
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    async function handleAuth(e) {
        e.preventDefault()
        if (!isSupabaseConfigured()) {
            setError('Supabase is not configured. Please set environment variables.')
            return
        }

        setError(null)
        setMessage(null)
        setLoading(true)

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })
                if (error) throw error
                // Successful login navigates to dashboard
                navigate('/dashboard')
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    // Optionally ask for email confirmation depending on Supabase settings
                })
                if (error) throw error
                setMessage('Signup successful! You can now log in.')
                setIsLogin(true)
            }
        } catch (err) {
            setError(err.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-md mx-auto w-full px-4 sm:px-6 py-16 fade-in">
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {isLogin ? 'Welcome Back' : 'Create an Account'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isLogin 
                                ? 'Log in to view your past loan eligibility reports.' 
                                : 'Sign up to safely store and manage your loan applications.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div>
                            <label className="label-base" htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="input-base"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="label-base" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="input-base"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}
                        
                        {message && (
                            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                {message}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                isLogin ? <> <LogIn size={18} /> Sign In </> : <> <UserPlus size={18} /> Sign Up </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 mb-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={async () => {
                                await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } })
                            }}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                            Google
                        </button>
                        <button 
                            onClick={async () => {
                                await supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: window.location.origin + '/dashboard' } })
                            }}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#1877F2] border border-[#1877F2] rounded-xl text-sm font-semibold text-white hover:bg-[#166FE5] transition-colors shadow-sm"
                        >
                            <img src="https://facebook.com/favicon.ico" alt="Facebook" className="w-4 h-4 rounded-sm bg-white" />
                            Facebook
                        </button>
                        <button 
                            onClick={async () => {
                                await supabase.auth.signInWithOAuth({ provider: 'azure', options: { redirectTo: window.location.origin + '/dashboard' } })
                            }}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="w-4 h-4" />
                            Microsoft
                        </button>
                    </div>

                    <div className="mt-8 text-center pt-6 border-t border-gray-100">
                        <button 
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setError(null)
                                setMessage(null)
                            }}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up with Email" : 'Already have an account? Sign in with Email'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

