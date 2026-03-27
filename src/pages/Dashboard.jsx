import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { supabase, isSupabaseConfigured } from '../utils/supabase'
import { FileText, LogOut, ArrowRight, Loader2, TrendingUp } from 'lucide-react'
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
                
                if (!session) {
                    navigate('/auth')
                    return
                }
                setUser(session.user)

                // Fetch past assessments
                const { data, error } = await supabase
                    .from('assessments')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false })

                // Ignore PGRST116 (No rows found) or similar
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
            <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
                <Loader2 size={32} className="text-gold animate-spin" />
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading dashboard...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-24 pb-10 fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="section-title mb-1">Your Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            Logged in as <span className="font-medium text-gray-700">{user?.email}</span>
                        </p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-[var(--radius)] hover:bg-gray-50 hover:text-red-600 transition-colors text-sm font-semibold shadow-sm"
                    >
                        <LogOut size={16} />
                        Log Out
                    </button>
                </div>

                {/* Score History Chart */}
                {assessments.length > 1 && (
                    <div className="card mb-8">
                        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
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
                                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} name="Score" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="card">
                    <h2 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-500" />
                        Past Loan Assessments
                    </h2>

                    {assessments.length === 0 ? (
                        <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                                <FileText size={20} className="text-gray-400" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 mb-1">No assessments yet</h3>
                            <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                                You haven't generated any loan eligibility reports yet. Start by checking your eligibility.
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button onClick={() => navigate('/personal-loan')} className="btn-primary py-2 px-4 text-xs">Personal Loan</button>
                                <button onClick={() => navigate('/business-loan')} className="btn-primary py-2 px-4 text-xs">Business Loan</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {assessments.map((item) => (
                                <div key={item.session_id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-100 rounded-xl hover:border-gold/30 hover:shadow-card transition-all group bg-white">
                                    <div className="flex flex-col mb-3 sm:mb-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.loan_type === 'business' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                {item.loan_type} Loan
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Probability</p>
                                                <p className="text-sm font-bold text-gray-800">{item.probability_score}/100</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Amount</p>
                                                <p className="text-sm font-bold text-gray-800">
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
                                        className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        View Full Report <ArrowRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
