import React, { useState } from 'react'
import { FileCheck, Activity, Hexagon, Target, HandCoins, Home, ShieldAlert, Building2, SlidersHorizontal, ChevronRight } from 'lucide-react'

// Import remaining feature components
import GstEngine from './GstEngine'
import CashFlowAnalyzer from './CashFlowAnalyzer' // Covers 2 and 3
import HealthScore from './HealthScore'
import LoanQuiz from './LoanQuiz'
import MudraChecker from './MudraChecker'
import CollateralOptimizer from './CollateralOptimizer'
import RiskAnalyzer from './RiskAnalyzer'
import IndustryBenchmarks from './IndustryBenchmarks'
import CreditSimulator from './CreditSimulator'

const TOOLS = [
    { id: 'gst', name: 'GST Eligibility Engine', icon: FileCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', component: GstEngine },
    { id: 'cf', name: 'Cash Flow & Stacking', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', component: CashFlowAnalyzer },
    { id: 'health', name: '5-D Health Radar', icon: Hexagon, color: 'text-indigo-600', bg: 'bg-indigo-50', component: HealthScore },
    { id: 'quiz', name: 'Loan Type Recommender', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', component: LoanQuiz },
    { id: 'mudra', name: 'MUDRA Engine', icon: HandCoins, color: 'text-orange-600', bg: 'bg-orange-50', component: MudraChecker },
    { id: 'collateral', name: 'Collateral Optimizer', icon: Home, color: 'text-teal-600', bg: 'bg-teal-50', component: CollateralOptimizer },
    { id: 'risk', name: 'Rejection Risk Scanner', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', component: RiskAnalyzer },
    { id: 'industry', name: 'Industry Benchmarking', icon: Building2, color: 'text-slate-600', bg: 'bg-slate-100', component: IndustryBenchmarks },
    { id: 'sim', name: 'What-If Simulator', icon: SlidersHorizontal, color: 'text-purple-600', bg: 'bg-purple-50', component: CreditSimulator },
]

export default function BusinessIntelligenceDashboard() {
    const [activeTool, setActiveTool] = useState(TOOLS[0].id)

    const ActiveComponent = TOOLS.find(t => t.id === activeTool)?.component || GstEngine

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-72 shrink-0 space-y-2">
                <div className="p-4 bg-gray-900 rounded-2xl mb-4 shadow-xl">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Veritas AI Suite</p>
                     <h3 className="text-white font-bold leading-tight">Advanced Business Intelligence</h3>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm sticky top-4">
                    {TOOLS.map(tool => {
                        const active = activeTool === tool.id
                        return (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all group ${active ? 'bg-gray-50 border border-gray-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? tool.bg : 'bg-gray-50 group-hover:bg-white'} transition-colors`}>
                                        <tool.icon size={16} className={active ? tool.color : 'text-gray-400 group-hover:text-gray-600'} />
                                    </div>
                                    <span className={`text-sm font-semibold ${active ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                        {tool.name}
                                    </span>
                                </div>
                                {active && <ChevronRight size={16} className="text-gray-300" />}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                <ActiveComponent />
            </div>
        </div>
    )
}
