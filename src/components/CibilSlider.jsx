import React from 'react'
import { getCibilRating } from '../utils/scoring'

export default function CibilSlider({ value, onChange }) {
    const rating = getCibilRating(value)
    const pct = ((value - 300) / 600) * 100

    // Gradient track fill
    const trackStyle = {
        background: `linear-gradient(to right, ${rating.color} 0%, ${rating.color} ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
    }

    return (
        <div className="w-full">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
                <label className="label-base">CIBIL Score</label>
                <div
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: rating.bg, color: rating.color }}
                >
                    <span className="text-xl font-bold font-sans">{value}</span>
                    <span className="text-xs opacity-75">{rating.label}</span>
                </div>
            </div>

            {/* Slider */}
            <input
                id="cibil-slider"
                type="range"
                min={300}
                max={900}
                step={5}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={trackStyle}
                className="w-full h-2 cursor-pointer rounded-full"
            />

            {/* Scale labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                <span>300<br /><span className="text-red-400">Poor</span></span>
                <span className="text-center">600<br /><span className="text-amber-400">Fair</span></span>
                <span className="text-center">750<br /><span className="text-green-400">Good</span></span>
                <span className="text-right">900<br /><span className="text-green-600">Excellent</span></span>
            </div>

            {/* Band indicators */}
            <div className="mt-3 flex gap-1 h-1 rounded-full overflow-hidden">
                <div className="flex-1 bg-red-400 rounded-l-full" />
                <div className="flex-1 bg-orange-400" />
                <div className="flex-1 bg-amber-400" />
                <div className="flex-1 bg-lime-400" />
                <div className="flex-1 bg-green-500 rounded-r-full" />
            </div>
        </div>
    )
}
