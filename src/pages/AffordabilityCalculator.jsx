import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import MobileBottomNav from '../components/MobileBottomNav'
import { Calculator, IndianRupee, TrendingUp, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function fmtINR(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN')
}

export default function AffordabilityCalculator() {
    const [monthlyIncome, setMonthlyIncome] = useState(75000)
    const [existingEMI, setExistingEMI] = useState(10000)
    const [tenure, setTenure] = useState(60)
    const [interestRate, setInterestRate] = useState(12)
    const [loanType, setLoanType] = useState('personal')

    // Max EMI allowed (40% of income after existing EMIs)
    const maxFoir = loanType === 'personal' ? 0.40 : 0.50
    const disposableIncome = monthlyIncome - existingEMI
    const maxNewEMI = Math.max(0, monthlyIncome * maxFoir - existingEMI)

    // Max loan from EMI using standard formula
    const r = interestRate / 12 / 100
    const n = tenure
    const maxLoanAmount = r > 0
        ? maxNewEMI * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)))
        : maxNewEMI * n

    // Total repayment
    const totalRepayment = maxNewEMI * n
    const totalInterest = totalRepayment - maxLoanAmount

    // Chart data: compare different loan amounts
    const chartData = [50, 60, 70, 80, 90, 100].map(pct => {
        const emi = maxNewEMI * (pct / 100)
        const amt = r > 0
            ? emi * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)))
            : emi * n
        return {
            name: `${pct}%`,
            amount: Math.round(amt / 100000) * 100000,
            emi: Math.round(emi),
        }
    })

    const foir = existingEMI / monthlyIncome
    const riskColor = foir < 0.3 ? 'text-emerald-600' : foir < 0.5 ? 'text-amber-600' : 'text-red-600'

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-24 pb-24 sm:pb-10 fade-in">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                        <Calculator size={24} className="text-amber-500" />
                        Loan Affordability Calculator
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Find out the maximum loan you can safely afford based on your income.</p>
                </div>

                {/* Loan Type Toggle */}
                <div className="flex gap-2 mb-6">
                    {['personal', 'business'].map(t => (
                        <button
                            key={t}
                            onClick={() => setLoanType(t)}
                            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all capitalize ${
                                loanType === t
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            {t} Loan
                        </button>
                    ))}
                </div>

                {/* Input Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { label: 'Monthly Income', value: monthlyIncome, set: setMonthlyIncome, min: 5000, max: 1000000, step: 1000 },
                            { label: 'Existing EMI Obligations', value: existingEMI, set: setExistingEMI, min: 0, max: 500000, step: 500 },
                            { label: 'Loan Tenure (months)', value: tenure, set: setTenure, min: 6, max: 360, step: 6, suffix: ' mo' },
                            { label: 'Interest Rate (% p.a.)', value: interestRate, set: setInterestRate, min: 6, max: 36, step: 0.5, suffix: '%' },
                        ].map(({ label, value, set, min, max, step, suffix }) => (
                            <div key={label}>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                                        {suffix ? `${value}${suffix}` : fmtINR(value)}
                                    </span>
                                </div>
                                <input
                                    type="range" min={min} max={max} step={step} value={value}
                                    onChange={e => set(Number(e.target.value))}
                                    className="w-full accent-amber-500"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>{suffix ? `${min}${suffix}` : fmtINR(min)}</span>
                                    <span>{suffix ? `${max}${suffix}` : fmtINR(max)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Result Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Max Loan Amount', value: fmtINR(Math.max(0, maxLoanAmount)), color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Max Monthly EMI', value: fmtINR(maxNewEMI), color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                        { label: 'Total Interest', value: fmtINR(Math.max(0, totalInterest)), color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { label: 'Total Repayment', value: fmtINR(Math.max(0, totalRepayment)), color: 'text-gray-800 dark:text-white', bg: 'bg-gray-50 dark:bg-gray-800' },
                    ].map(({ label, value, color, bg }) => (
                        <div key={label} className={`${bg} rounded-2xl p-4 border border-gray-100 dark:border-gray-700`}>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                            <p className={`text-base font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* FOIR Status */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-6 shadow-sm flex items-start gap-3">
                    <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-0.5">
                            Current FOIR: <span className={riskColor}>{(foir * 100).toFixed(1)}%</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {foir < 0.3
                                ? '✅ Excellent! Low debt burden — banks will likely approve your loan easily.'
                                : foir < 0.5
                                ? '⚠️ Moderate debt burden. Reducing existing EMIs could unlock a larger loan.'
                                : '❌ High debt burden. Most banks require FOIR below 50%. Reduce existing debts first.'}
                        </p>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-500" />
                        Loan Amount at Different FOIR Levels
                    </h2>
                    <p className="text-xs text-gray-400 mb-4">How loan eligibility changes as a % of your maximum capacity</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} tick={{ fontSize: 10 }} />
                            <Tooltip
                                formatter={(v, name) => [
                                    name === 'amount' ? fmtINR(v) : fmtINR(v),
                                    name === 'amount' ? 'Loan Amount' : 'Monthly EMI'
                                ]}
                            />
                            <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </main>
            <MobileBottomNav />
        </div>
    )
}
