import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MobileBottomNav from '../components/MobileBottomNav'
import { Calculator, TrendingUp, IndianRupee, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

function fmtINR(n) {
    return '₹' + Number(Math.round(n)).toLocaleString('en-IN')
}

export default function EmiCalculator() {
    const [loanAmount, setLoanAmount] = useState(500000)
    const [interestRate, setInterestRate] = useState(10.5)
    const [tenure, setTenure] = useState(36)

    const { emi, totalPayment, totalInterest, schedule } = useMemo(() => {
        const principal = loanAmount
        const r = interestRate / 100 / 12
        const n = tenure
        if (r === 0) {
            const emi = principal / n
            return { emi, totalPayment: emi * n, totalInterest: 0, schedule: [] }
        }
        const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        const totalPayment = emi * n
        const totalInterest = totalPayment - principal

        let balance = principal
        const yearlyData = []
        let year = 1
        let yearPrincipal = 0
        let yearInterest = 0

        for (let i = 1; i <= n; i++) {
            const intPaid = balance * r
            const prinPaid = emi - intPaid
            balance -= prinPaid
            yearPrincipal += prinPaid
            yearInterest += intPaid

            if (i % 12 === 0 || i === n) {
                yearlyData.push({
                    year: `Yr ${year}`,
                    principal: Math.round(yearPrincipal),
                    interest: Math.round(yearInterest),
                    balance: Math.max(0, Math.round(balance)),
                })
                year++
                yearPrincipal = 0
                yearInterest = 0
            }
        }

        return { emi, totalPayment, totalInterest, schedule: yearlyData }
    }, [loanAmount, interestRate, tenure])

    const pieData = [
        { name: 'Principal', value: loanAmount },
        { name: 'Interest', value: Math.round(totalInterest) },
    ]
    const PIE_COLORS = ['#6366f1', '#f59e0b']

    const sliders = [
        { label: 'Loan Amount', value: loanAmount, set: setLoanAmount, min: 50000, max: 10000000, step: 50000, fmt: fmtINR, minLabel: '₹50K', maxLabel: '₹1Cr' },
        { label: 'Interest Rate (p.a.)', value: interestRate, set: setInterestRate, min: 5, max: 36, step: 0.25, fmt: v => `${v.toFixed(1)}%`, minLabel: '5%', maxLabel: '36%' },
        { label: 'Loan Tenure', value: tenure, set: setTenure, min: 6, max: 360, step: 6, fmt: v => `${v} mo (${(v/12).toFixed(1)} yrs)`, minLabel: '6 mo', maxLabel: '30 yrs' },
    ]

    return (
        <div className="min-h-screen bg-cream dark:bg-gray-950 flex flex-col transition-colors duration-200">
            <Navbar />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-24 pb-24 sm:pb-10 fade-in">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Calculator size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="section-title mb-0 dark:text-white">EMI Calculator</h1>
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 ml-1">Calculate your monthly loan repayment instantly</p>

                {/* Sliders */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6 shadow-sm space-y-6">
                    {sliders.map(({ label, value, set, min, max, step, fmt, minLabel, maxLabel }) => (
                        <div key={label}>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{fmt(value)}</span>
                            </div>
                            <input
                                type="range" min={min} max={max} step={step}
                                value={value} onChange={e => set(Number(e.target.value))}
                                className="w-full accent-indigo-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                                <span>{minLabel}</span>
                                <span>{maxLabel}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Results Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { icon: <IndianRupee size={16} />, label: 'Monthly EMI', value: fmtINR(emi), color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                        { icon: <TrendingUp size={16} />, label: 'Total Interest', value: fmtINR(totalInterest), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { icon: <Clock size={16} />, label: 'Total Payment', value: fmtINR(totalPayment), color: 'text-gray-700 dark:text-gray-200', bg: 'bg-gray-50 dark:bg-gray-800' },
                    ].map(({ icon, label, value, color, bg }) => (
                        <div key={label} className={`rounded-2xl text-center py-4 px-3 border border-gray-100 dark:border-gray-700 ${bg}`}>
                            <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</p>
                            <p className={`text-base font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Pie Chart */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 mb-6 shadow-sm">
                    <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Principal vs Interest Breakdown</h2>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                </Pie>
                                <Tooltip formatter={(v) => fmtINR(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-3 shrink-0">
                            {pieData.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{d.name}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{fmtINR(d.value)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Balance Chart */}
                {schedule.length > 1 && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 mb-6 shadow-sm">
                        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Yearly Outstanding Balance</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={schedule}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '₹' + (v / 100000).toFixed(0) + 'L'} />
                                <Tooltip formatter={(v) => fmtINR(v)} />
                                <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2} dot={false} name="Balance" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Amortization Table */}
                {schedule.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 mb-8 shadow-sm">
                        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Yearly Amortization Schedule</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        {['Year', 'Principal Paid', 'Interest Paid', 'Closing Balance'].map(h => (
                                            <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule.map((row) => (
                                        <tr key={row.year} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">{row.year}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{fmtINR(row.principal)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{fmtINR(row.interest)}</td>
                                            <td className="py-3 px-4 text-sm text-indigo-600 dark:text-indigo-400 font-medium">{fmtINR(row.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="text-center">
                    <Link to="/personal-loan" className="btn-primary inline-block px-8">
                        Check Your Loan Eligibility →
                    </Link>
                </div>
            </main>
            <MobileBottomNav />
        </div>
    )
}
