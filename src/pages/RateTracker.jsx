import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import MobileBottomNav from '../components/MobileBottomNav'
import { TrendingUp, RefreshCw, Building2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Simulated historical bank rate data (in a real app, this would come from your DB)
const RATE_HISTORY = {
    personal: [
        { month: 'Oct 23', HDFC: 10.5, ICICI: 10.75, SBI: 11.0, Axis: 10.9 },
        { month: 'Nov 23', HDFC: 10.5, ICICI: 10.75, SBI: 10.85, Axis: 10.9 },
        { month: 'Dec 23', HDFC: 10.25, ICICI: 10.5, SBI: 10.85, Axis: 10.75 },
        { month: 'Jan 24', HDFC: 10.25, ICICI: 10.5, SBI: 10.75, Axis: 10.75 },
        { month: 'Feb 24', HDFC: 10.5, ICICI: 10.75, SBI: 10.75, Axis: 11.0 },
        { month: 'Mar 24', HDFC: 10.5, ICICI: 10.75, SBI: 11.0, Axis: 11.0 },
        { month: 'Apr 24', HDFC: 10.75, ICICI: 11.0, SBI: 11.0, Axis: 11.25 },
        { month: 'May 24', HDFC: 10.75, ICICI: 11.0, SBI: 11.15, Axis: 11.25 },
        { month: 'Jun 24', HDFC: 10.5, ICICI: 10.75, SBI: 11.15, Axis: 11.0 },
        { month: 'Jul 24', HDFC: 10.25, ICICI: 10.5, SBI: 11.0, Axis: 10.9 },
        { month: 'Aug 24', HDFC: 10.25, ICICI: 10.5, SBI: 10.85, Axis: 10.75 },
        { month: 'Mar 25', HDFC: 10.0, ICICI: 10.25, SBI: 10.75, Axis: 10.5 },
    ],
    business: [
        { month: 'Oct 23', HDFC: 11.0, ICICI: 11.5, SBI: 10.5, Bajaj: 14.0 },
        { month: 'Nov 23', HDFC: 11.0, ICICI: 11.5, SBI: 10.5, Bajaj: 14.0 },
        { month: 'Dec 23', HDFC: 10.75, ICICI: 11.25, SBI: 10.35, Bajaj: 13.75 },
        { month: 'Jan 24', HDFC: 10.75, ICICI: 11.25, SBI: 10.35, Bajaj: 13.75 },
        { month: 'Feb 24', HDFC: 11.0, ICICI: 11.5, SBI: 10.35, Bajaj: 14.0 },
        { month: 'Mar 24', HDFC: 11.25, ICICI: 11.75, SBI: 10.5, Bajaj: 14.25 },
        { month: 'Apr 24', HDFC: 11.5, ICICI: 12.0, SBI: 10.5, Bajaj: 14.5 },
        { month: 'May 24', HDFC: 11.5, ICICI: 12.0, SBI: 10.65, Bajaj: 14.5 },
        { month: 'Jun 24', HDFC: 11.25, ICICI: 11.75, SBI: 10.65, Bajaj: 14.25 },
        { month: 'Jul 24', HDFC: 11.0, ICICI: 11.5, SBI: 10.5, Bajaj: 14.0 },
        { month: 'Aug 24', HDFC: 10.75, ICICI: 11.25, SBI: 10.5, Bajaj: 13.75 },
        { month: 'Mar 25', HDFC: 10.5, ICICI: 11.0, SBI: 10.35, Bajaj: 13.5 },
    ]
}

const COLORS = { HDFC: '#6366f1', ICICI: '#f59e0b', SBI: '#10b981', Axis: '#3b82f6', Bajaj: '#ef4444' }

const CURRENT_RATES = {
    personal: [
        { bank: 'HDFC Bank', rate: '10.0% – 21%', best: '10.0%', max: '₹40L', trend: 'down' },
        { bank: 'ICICI Bank', rate: '10.25% – 20%', best: '10.25%', max: '₹50L', trend: 'down' },
        { bank: 'SBI', rate: '10.75% – 14%', best: '10.75%', max: '₹20L', trend: 'stable' },
        { bank: 'Axis Bank', rate: '10.5% – 22%', best: '10.5%', max: '₹40L', trend: 'down' },
        { bank: 'Bajaj Finserv', rate: '11% – 35%', best: '11%', max: '₹40L', trend: 'up' },
    ],
    business: [
        { bank: 'HDFC Bank', rate: '10.5% – 22%', best: '10.5%', max: '₹75L', trend: 'down' },
        { bank: 'ICICI Bank', rate: '11% – 25%', best: '11%', max: '₹50L', trend: 'down' },
        { bank: 'SBI', rate: '10.35% – 14%', best: '10.35%', max: '₹5Cr', trend: 'stable' },
        { bank: 'Bajaj Finserv', rate: '13.5% – 35%', best: '13.5%', max: '₹50L', trend: 'down' },
    ]
}

export default function RateTracker() {
    const [loanType, setLoanType] = useState('personal')
    const [lastUpdated] = useState('25 Mar 2025')
    const data = RATE_HISTORY[loanType]
    const banks = Object.keys(data[0]).filter(k => k !== 'month')

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-24 pb-24 sm:pb-10 fade-in">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                            <TrendingUp size={24} className="text-indigo-500" />
                            Bank Rate Tracker
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Live interest rate trends across major Indian lenders.</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <RefreshCw size={12} />
                        Updated: {lastUpdated}
                    </div>
                </div>

                {/* Toggle */}
                <div className="flex gap-2 mb-6">
                    {['personal', 'business'].map(t => (
                        <button
                            key={t}
                            onClick={() => setLoanType(t)}
                            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all capitalize ${
                                loanType === t
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            {t} Loan
                        </button>
                    ))}
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6 shadow-sm">
                    <h2 className="font-semibold text-gray-800 dark:text-white mb-4 text-sm">Interest Rate Trend (% p.a.)</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                            <Tooltip formatter={(v) => [`${v}%`, '']} />
                            <Legend />
                            {banks.map(bank => (
                                <Line
                                    key={bank}
                                    type="monotone"
                                    dataKey={bank}
                                    stroke={COLORS[bank] || '#888'}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 5 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Current Rates Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Building2 size={18} className="text-indigo-500" />
                        Current Best Rates
                    </h2>
                    <div className="space-y-3">
                        {CURRENT_RATES[loanType].map(({ bank, rate, best, max, trend }) => (
                            <div key={bank} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                        {bank.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{bank}</p>
                                        <p className="text-xs text-gray-400">Range: {rate}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{best}</span>
                                        <span className={`text-xs ${trend === 'down' ? 'text-emerald-500' : trend === 'up' ? 'text-red-500' : 'text-gray-400'}`}>
                                            {trend === 'down' ? '↓' : trend === 'up' ? '↑' : '→'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">Up to {max}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-4 text-center">* Rates are indicative starting rates. Actual rates depend on profile & lender assessment.</p>
                </div>
            </main>
            <MobileBottomNav />
        </div>
    )
}
