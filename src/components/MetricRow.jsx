import React from 'react'

const colorMap = {
    green: { dot: 'dot-green', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Good' },
    amber: { dot: 'dot-amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Fair' },
    red: { dot: 'dot-red', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Poor' },
}

export default function MetricRow({ label, value, status = 'green', note }) {
    const c = colorMap[status] || colorMap.green
    return (
        <div className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border ${c.bg} ${c.border}`}>
            <div className="flex items-center gap-2.5 min-w-0">
                <span className={c.dot} />
                <div>
                    <p className="text-sm font-medium text-gray-700 leading-tight">{label}</p>
                    {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className={`text-sm font-bold ${c.text}`}>{value}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text} border ${c.border}`}>
                    {c.label}
                </span>
            </div>
        </div>
    )
}
