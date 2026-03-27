import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
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

        // Build amortization schedule (yearly summary)
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

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-24 pb-10 fade-in">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Calculator size={20} className="text-indigo-600" />
                    </div>
                    <h1 className="section-title mb-0">EMI Calculator</h1>
                </div>
                <p className="text-sm text-gray-400 mb-8 ml-1">Calculate your monthly loan repayment instantly</p>

                {/* Sliders */}
                <div className="card mb-6 space-y-6">
                    {/* Loan Amount */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-gray-700">Loan Amount</label>
                            <span className="text-sm font-bold text-indigo-600">{fmtINR(loanAmount)}</span>
                        </div>
                        <input type="range" min={50000} max={10000000} step={50000}
                            value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))}
                            className="w-full accent-indigo-600" />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>₹50K</span><span>₹1Cr</span>
                        </div>
                    </div>

                    {/* Interest Rate */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-gray-700">Interest Rate (p.a.)</label>
                            <span className="text-sm font-bold text-indigo-600">{interestRate.toFixed(1)}%</span>
                        </div>
                        <input type="range" min={5} max={36} step={0.25}
                            value={interestRate} onChange={e => setInterestRate(Number(e.target.value))}
                            className="w-full accent-indigo-600" />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>5%</span><span>36%</span>
                        </div>
                    </div>

                    {/* Tenure */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-gray-700">Loan Tenure</label>
                            <span className="text-sm font-bold text-indigo-600">{tenure} months ({(tenure / 12).toFixed(1)} yrs)</span>
                        </div>
                        <input type="range" min={6} max={360} step={6}
                            value={tenure} onChange={e => setTenure(Number(e.target.value))}
                            className="w-full accent-indigo-600" />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>6 mo</span><span>30 yrs</span>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { icon: <IndianRupee size={16} />, label: 'Monthly EMI', value: fmtINR(emi), color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { icon: <TrendingUp size={16} />, label: 'Total Interest', value: fmtINR(totalInterest), color: 'text-amber-600', bg: 'bg-amber-50' },
                        { icon: <Clock size={16} />, label: 'Total Payment', value: fmtINR(totalPayment), color: 'text-gray-700', bg: 'bg-gray-50' },
                    ].map(({ icon, label, value, color, bg }) => (
                        <div key={label} className={`card text-center py-4 px-3 ${bg} border-0`}>
                            <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
                            <p className={`text-base font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Pie Chart */}
                <div className="card mb-6">
                    <h2 className="font-semibold text-gray-800 mb-4">Principal vs Interest Breakdown</h2>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                    paddingAngle={3} dataKey="value">
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
                                        <p className="text-xs font-semibold text-gray-700">{d.name}</p>
                                        <p className="text-xs text-gray-400">{fmtINR(d.value)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Yearly Amortization line chart */}
                {schedule.length > 1 && (
                    <div className="card mb-6">
                        <h2 className="font-semibold text-gray-800 mb-4">Yearly Outstanding Balance</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={schedule}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '₹' + (v / 100000).toFixed(0) + 'L'} />
                                <Tooltip formatter={(v) => fmtINR(v)} />
                                <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2} dot={false} name="Balance" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Yearly Amortization Table */}
                {schedule.length > 0 && (
                    <div className="card mb-8">
                        <h2 className="font-semibold text-gray-800 mb-4">Yearly Amortization Schedule</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Principal Paid</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Interest Paid</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Closing Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule.map((row) => (
                                        <tr key={row.year} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{row.year}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{fmtINR(row.principal)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{fmtINR(row.interest)}</td>
                                            <td className="py-3 px-4 text-sm text-indigo-600 font-medium">{fmtINR(row.balance)}</td>
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
        </div>
    )
}
