import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Calculator, LayoutDashboard, Search, Bot } from 'lucide-react'

const tabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Check', path: '/personal-loan' },
    { icon: Bot, label: 'Advisor', path: '/advisor' },
    { icon: Calculator, label: 'EMI', path: '/emi-calculator' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
]

export default function MobileBottomNav() {
    const navigate = useNavigate()
    const { pathname } = useLocation()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 safe-bottom">
            <div className="flex items-stretch h-16">
                {tabs.map(({ icon: Icon, label, path }) => {
                    const active = pathname === path
                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-200 ${
                                active
                                    ? 'text-amber-500'
                                    : 'text-gray-400 dark:text-gray-500'
                            }`}
                        >
                            <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${active ? 'bg-amber-50 dark:bg-amber-900/30' : ''}`}>
                                <Icon size={active ? 22 : 20} strokeWidth={active ? 2.5 : 1.8} />
                                {active && (
                                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                                )}
                            </div>
                            <span className={active ? 'text-amber-500' : ''}>{label}</span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
