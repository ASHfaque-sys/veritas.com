import React, { useEffect, useRef } from 'react'
import { scoreColor, scoreLabel } from '../utils/scoring'

export default function ScoreGauge({ score }) {
    const canvasRef = useRef(null)
    const color = scoreColor(score)
    const label = scoreLabel(score)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const cx = canvas.width / 2
        const cy = canvas.height / 2
        const r = 70
        const startAngle = Math.PI * 0.75
        const endAngle = Math.PI * 2.25
        const pct = score / 100

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Background arc
        ctx.beginPath()
        ctx.arc(cx, cy, r, startAngle, endAngle)
        ctx.strokeStyle = '#E5E7EB'
        ctx.lineWidth = 14
        ctx.lineCap = 'round'
        ctx.stroke()

        // Progress arc
        ctx.beginPath()
        ctx.arc(cx, cy, r, startAngle, startAngle + pct * (endAngle - startAngle))
        ctx.strokeStyle = color
        ctx.lineWidth = 14
        ctx.lineCap = 'round'
        ctx.stroke()

        // Glow effect
        ctx.shadowBlur = 16
        ctx.shadowColor = color
        ctx.beginPath()
        ctx.arc(cx, cy, r, startAngle, startAngle + pct * (endAngle - startAngle))
        ctx.strokeStyle = color + '55'
        ctx.lineWidth = 4
        ctx.stroke()
    }, [score, color])

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <canvas ref={canvasRef} width={180} height={180} />
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
                    <span className="font-serif text-4xl font-bold" style={{ color }}>{score}</span>
                    <span className="text-xs text-gray-400 font-medium">out of 100</span>
                </div>
            </div>
            <span
                className="text-sm font-semibold px-4 py-1.5 rounded-full"
                style={{ color, backgroundColor: color + '18' }}
            >
                {label}
            </span>
        </div>
    )
}
