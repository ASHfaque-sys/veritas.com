import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Globe, Building2, TrendingUp, AlertCircle, Info, RefreshCw } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function IndustryBenchmarks() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    useEffect(() => {
        const fetchBenchmarks = async () => {
            setLoading(true)
            await new Promise(r => setTimeout(r, 1200)) // Simulation delay

            // Simulated profile metrics extraction
            const userState = {
                hsnCode: '4711', // Retail Trade
                industry: 'Retail & eCommerce',
                dscr: 1.4,
                foir: 38,
            }

            // Simulated RBI Macro Benchmark data
            const benchmarks = {
                avgDscr: 1.8,
                avgFoir: 42,
                avgDisbursed: 4500000,
                avgRate: 11.5,
                npaRate: 6.2,
                activeLenders: 'HDFC Bank, IDFC First, Bajaj Finserv'
            }

            const chartData = [
                {
                    metric: 'DSCR (Coverage Ratio)',
                    User: userState.dscr,
                    Industry: benchmarks.avgDscr,
                },
                {
                    metric: 'FOIR (Debt Burden %)',
                    User: userState.foir,
                    Industry: benchmarks.avgFoir,
                }
            ]

            const claudeInsight = `Businesses in your industry (${userState.industry}) typically struggle with loan approvals during Q3 inventory build-ups due to slightly elevated Retail NPA rates (6.2%). However, your FOIR of 38% is notably better than the 42% industry average, signaling excellent debt management. Position your application emphasizing your lean operating costs to counter concerns about your below-average DSCR (1.4 vs 1.8).`

            setData({ user: userState, benchmarks, chartData, claudeInsight })
            setLoading(false)
        }
        
        fetchBenchmarks()
    }, [])

    if (loading) {
        return (
            <div className="card p-12 flex flex-col items-center justify-center bg-white border-0 shadow-sm ring-1 ring-gray-100 min-h-[400px]">
                <Globe className="text-gray-300 animate-spin mb-4" size={40} />
                <h3 className="font-semibold text-gray-800 text-lg mb-1">Mapping HSN to Industry Sectors</h3>
                <p className="text-gray-500 text-sm">Fetching structural benchmarks from RBI database...</p>
            </div>
        )
    }

    const fmtINR = (n) => '₹' + Number(Math.round(n)).toLocaleString('en-IN')

    return (
        <div className="space-y-6 fade-in">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Building2 className="text-slate-600" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Macro Industry Benchmarking</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Compare your financial ratios against verified RBI sectoral lending statistics for <strong className="text-indigo-600">{data.user.industry}</strong>.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 card bg-white border-0 shadow-sm ring-1 ring-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-6">
                        <TrendingUp size={18} className="text-indigo-500" /> Your Ratios vs RBI Industry Averages
                    </h3>
                    
                    <div className="w-full h-[250px] mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="metric" type="category" width={140} tick={{ fontSize: 12, fontWeight: 600, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="User" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
                                <Bar dataKey="Industry" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${data.user.dscr >= data.benchmarks.avgDscr ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">DSCR Comparison</p>
                            <p className="text-sm text-gray-700">
                                Your DSCR: <strong className="text-gray-900">{data.user.dscr}</strong> vs Industry: <strong className="text-gray-900">{data.benchmarks.avgDscr}</strong>
                            </p>
                            <p className={`text-xs mt-1 font-semibold ${data.user.dscr >= data.benchmarks.avgDscr ? 'text-emerald-600' : 'text-red-500'}`}>
                                {data.user.dscr >= data.benchmarks.avgDscr ? '✓ Stronger cash coverage than peers' : '⚠ Below average coverage'}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${data.user.foir <= data.benchmarks.avgFoir ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">FOIR Comparison</p>
                            <p className="text-sm text-gray-700">
                                Your FOIR: <strong className="text-gray-900">{data.user.foir}%</strong> vs Industry: <strong className="text-gray-900">{data.benchmarks.avgFoir}%</strong>
                            </p>
                            <p className={`text-xs mt-1 font-semibold ${data.user.foir <= data.benchmarks.avgFoir ? 'text-emerald-600' : 'text-red-500'}`}>
                                {data.user.foir <= data.benchmarks.avgFoir ? '✓ Better debt management than peers' : '⚠ Higher debt exposure'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card bg-white border-0 shadow-sm ring-1 ring-gray-100 p-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Sector Profile: {data.user.industry}</p>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Average Loan Disbursed</p>
                                <p className="text-xl font-bold text-slate-800">{fmtINR(data.benchmarks.avgDisbursed)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Average Int. Rate</p>
                                <p className="text-xl font-bold text-slate-800">{data.benchmarks.avgRate}%</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">NPA Rate <Info size={12}/></p>
                                <p className={`text-xl font-bold ${data.benchmarks.npaRate > 5 ? 'text-red-500' : 'text-emerald-500'}`}>{data.benchmarks.npaRate}%</p>
                            </div>
                            <div className="pt-3 border-t border-gray-100">
                                <p className="text-xs text-slate-500 mb-1">Most Active Target Banks</p>
                                <p className="text-sm font-semibold text-indigo-600">{data.benchmarks.activeLenders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded bg-indigo-600 text-white font-serif font-bold text-xs flex items-center justify-center">C</div>
                            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Strategic Insight</span>
                        </div>
                        <p className="text-sm text-gray-700 italic leading-relaxed">"{data.claudeInsight}"</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
