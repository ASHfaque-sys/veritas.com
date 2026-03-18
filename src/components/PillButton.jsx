import React from 'react'

export default function PillButton({ id, label, active, onClick, className = '' }) {
    return (
        <button
            id={id}
            onClick={onClick}
            className={`pill transition-all duration-200 ${active ? 'pill-active shadow-gold' : 'pill-inactive'} ${className}`}
        >
            {label}
        </button>
    )
}
