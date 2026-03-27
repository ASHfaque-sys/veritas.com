import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { supabase, isSupabaseConfigured } from '../utils/supabase'
import { BarChart2, Users, TrendingUp, FileText, Lock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'

function fmtINR(n) {
    return '₹' + Number(Math.round(n || 0)).toLocaleString('en-IN')
}

export default function Admin() {
    const [authed, setAuthed] = useState(false)
    const [pin, setPin] = useState('')
    const [pinError, setPinError] = useState(false)
    const [assessments, setAssessments] = useState([])
    const [loading, setLoading] = useState(false)

    function handleLogin(e) {
        e.preventDefault()
        if (pin === ADMIN_PIN) {
            setAuthed(true)
            setPinError(false)
        } else {
            setPinError(true)
        }
    }

    useEffect(() => {
        if (!authed || !isSupabaseConfigured()) return
        setLoading(true)
        supabase
            .from('assessments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)
            .then(({ data }) => {
                setAssessments(data || [])
                setLoading(false)
            })
    }, [authed])

    // Stats
    const total = assessments.length
    const avgScore = total > 0 ? Math.round(assessments.reduce((s, a) => s + (a.probability_score || 0), 0) / total) : 0
    const personal = assessments.filter(a => a.loan_type === 'personal').length
    const business = assessments.filter(a => a.loan_type === 'business').length

    // Score distribution buckets
    const buckets = [
        { label: '0–39', min: 0, max: 39, count: 0 },
        { label: '40–59', min: 40, max: 59, count: 0 },
        { label: '60–74', min: 60, max: 74, count: 0 },
        { label: '75–89', min: 75, max: 89, count: 0 },
        { label: '90+',  min: 90, max: 100, count: 0 },
    ]
    assessments.forEach(a => {
        const s = a.probability_score || 0
        const b = buckets.find(b => s >= b.min && s <= b.max)
        if (b) b.count++
    })

    const pieData = [
        { name: 'Personal', value: personal },
        { name: 'Business', value: business },
    ]
    const PIE_COLORS = ['#6366f1', '#f59e0b']

    if (!authed) {
        return (
            <div className="min-h-screen bg-cream flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="card w-full max-w-sm">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                                <Lock size={22} className="text-indigo-600" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-800">Admin Access</h1>
                            <p className="text-sm text-gray-400 mt-1">Enter your PIN to continue</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input
                                type="password"
                                placeholder="Enter PIN"
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl text-center text-lg tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${pinError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                maxLength={8}
                            />
                            {pinError && <p className="text-xs text-red-500 text-center">Incorrect PIN. Try again.</p>}
                            <button type="submit" className="btn-primary w-full">Enter</button>
                        </form>
                        <p className="text-xs text-gray-400 text-center mt-4">Set PIN via VITE_ADMIN_PIN in .env (default: 1234)</p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-24 pb-10 fade-in">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <BarChart2 size={20} className="text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="section-title mb-0">Admin Dashboard</h1>
                        <p className="text-sm text-gray-400">All-time platform analytics</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Loading data...</div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            {[
                                { icon: <FileText size={18}/>, label: 'Total Assessments', value: total, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { icon: <TrendingUp size={18}/>, label: 'Avg Score', value: `${avgScore}/100`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { icon: <Users size={18}/>, label: 'Personal Loans', value: personal, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { icon: <Users size={18}/>, label: 'Business Loans', value: business, color: 'text-amber-600', bg: 'bg-amber-50' },
                            ].map(({ icon, label, value, color, bg }) => (
                                <div key={label} className={`card text-center py-5 ${bg} border-0`}>
                                    <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
                                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            {/* Score distribution */}
                            <div className="card">
                                <h2 className="font-semibold text-gray-800 mb-4">Score Distribution</h2>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={buckets}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="count" name="# Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Loan type split */}
                            <div className="card flex flex-col items-center">
                                <h2 className="font-semibold text-gray-800 mb-4 self-start">Loan Type Split</h2>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent assessments table */}
                        <div className="card">
                            <h2 className="font-semibold text-gray-800 mb-4">Recent Assessments (last 100)</h2>
                            {assessments.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">No assessments yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                                                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assessments.map((a) => (
                                                <tr key={a.session_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                    <td className="py-2 pr-4 text-gray-500 text-xs">{new Date(a.created_at).toLocaleDateString('en-IN')}</td>
                                                    <td className="py-2 pr-4">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.loan_type === 'business' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
                                                            {a.loan_type}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 pr-4">
                                                        <span className={`font-bold ${a.probability_score >= 75 ? 'text-emerald-600' : a.probability_score >= 55 ? 'text-amber-600' : 'text-red-500'}`}>
                                                            {a.probability_score ?? '—'}/100
                                                        </span>
                                                    </td>
                                                    <td className="py-2 text-gray-700 text-xs">{fmtINR(a.extracted_data?.loanAmount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
