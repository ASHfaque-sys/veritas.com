import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MobileBottomNav from '../components/MobileBottomNav'
import { supabase, isSupabaseConfigured } from '../utils/supabase'
import { FileText, LogOut, ArrowRight, Loader2, TrendingUp, Calculator, BarChart3, Clock, Bot } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [assessments, setAssessments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setLoading(false)
            return
        }

        async function fetchDashboard() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                if (sessionError) throw sessionError
                if (!session) { navigate('/auth'); return }
                setUser(session.user)

                const { data, error } = await supabase
                    .from('assessments')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false })

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching assessments', error)
                } else if (data) {
                    setAssessments(data)
                }
            } catch (err) {
                console.error('Dashboard setup error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()
    }, [navigate])

    async function handleLogout() {
        if (supabase) {
            await supabase.auth.signOut()
            navigate('/')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-cream dark:bg-gray-950 flex flex-col items-center justify-center">
                <Loader2 size={32} className="text-amber-500 animate-spin" />
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading dashboard...</p>
            </div>
        )
    }

    const bestScore = assessments.length > 0 ? Math.max(...assessments.map(a => a.probability_score || 0)) : null
    const latestScore = assessments.length > 0 ? assessments[0].probability_score : null

    return (
        <div className="min-h-screen bg-cream dark:bg-gray-950 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-24 pb-24 sm:pb-10 fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="section-title mb-1 dark:text-white">Your Dashboard</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Logged in as <span className="font-medium text-gray-700 dark:text-gray-300">{user?.email}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 hover:text-red-600 transition-colors text-sm font-semibold shadow-sm"
                    >
                        <LogOut size={16} />
                        Log Out
                    </button>
                </div>

                {/* Quick Stats */}
                {assessments.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { label: 'Assessments', value: assessments.length, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                            { label: 'Latest Score', value: `${latestScore}/100`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                            { label: 'Best Score', value: `${bestScore}/100`, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} className={`${bg} rounded-2xl p-4 flex flex-col gap-2 border border-gray-100 dark:border-gray-700`}>
                                <Icon size={18} className={color} />
                                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">{value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Tools */}
                <div className="card dark:bg-gray-900 dark:border-gray-700 mb-6">
                    <h2 className="font-semibold text-gray-800 dark:text-white mb-4 text-sm uppercase tracking-wider">Quick Tools</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {[
                            { label: 'AI Advisor', icon: Bot, path: '/advisor', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
                            { label: 'EMI Calculator', icon: Calculator, path: '/emi-calculator', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' },
                            { label: 'Affordability', icon: BarChart3, path: '/affordability', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
                            { label: 'Rate Tracker', icon: TrendingUp, path: '/rate-tracker', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
                            { label: 'Check Loan', icon: ArrowRight, path: '/personal-loan', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' },
                        ].map(({ label, icon: Icon, path, color }) => (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:scale-105 transition-all border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                                    <Icon size={20} />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Score History Chart */}
                {assessments.length > 1 && (
                    <div className="card dark:bg-gray-900 dark:border-gray-700 mb-6">
                        <h2 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-indigo-500" />
                            Score History
                        </h2>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={[...assessments].reverse().map((a, i) => ({
                                name: `#${i + 1}`,
                                score: a.probability_score || 0,
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v) => [`${v}/100`, 'Score']} />
                                <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="Score" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Application History Timeline */}
                <div className="card dark:bg-gray-900 dark:border-gray-700">
                    <h2 className="font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Clock size={18} className="text-indigo-500" />
                        Application History
                    </h2>

                    {assessments.length === 0 ? (
                        <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100 dark:border-gray-700">
                                <FileText size={20} className="text-gray-400" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">No assessments yet</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                                You haven't generated any loan eligibility reports yet. Start by checking your eligibility.
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button onClick={() => navigate('/personal-loan')} className="btn-primary py-2 px-4 text-xs">Personal Loan</button>
                                <button onClick={() => navigate('/business-loan')} className="btn-primary py-2 px-4 text-xs">Business Loan</button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-700" />

                            <div className="space-y-6 pl-12">
                                {assessments.map((item, idx) => {
                                    const score = item.probability_score || 0
                                    const dotColor = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                    return (
                                        <div key={item.session_id} className="relative">
                                            {/* Timeline dot */}
                                            <div className={`absolute -left-12 top-3 w-4 h-4 rounded-full ${dotColor} border-2 border-white dark:border-gray-900 shadow-sm`} />
                                            {/* Card */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-sm transition-all bg-white dark:bg-gray-800 group">
                                                <div className="flex flex-col mb-3 sm:mb-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.loan_type === 'business' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'}`}>
                                                            {item.loan_type} Loan
                                                        </span>
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                                            {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        {idx === 0 && (
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded font-bold uppercase tracking-wider">Latest</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-5">
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Score</p>
                                                            <p className={`text-base font-bold ${score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{score}/100</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Amount</p>
                                                            <p className="text-sm font-bold text-gray-800 dark:text-white">
                                                                ₹{Number(item.extracted_data?.loanAmount || 0).toLocaleString('en-IN')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/results', { state: {
                                                        loanType: item.loan_type,
                                                        score: item.probability_score,
                                                        sessionId: item.session_id,
                                                        metrics: item.extracted_data,
                                                    }})}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors border border-amber-100 dark:border-amber-800"
                                                >
                                                    View Report <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <MobileBottomNav />
        </div>
    )
}
