/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                void: '#0d0d0d',
                near: '#141414',
                surface: '#1c1c1c',
                lift: '#242424',
                lime: {
                    DEFAULT: '#c8f135',
                    2: '#a8d420',
                    dim: '#3a4a0a',
                },
                white: '#f5f5f0',
                muted: '#888880',
                faint: '#333330',
                orange: '#ff6b35',
                line: '#2a2a2a',
                gold: {
                    50: '#fdf8ee',
                    100: '#f9f0d6',
                    200: '#f2dfac',
                    300: '#e8c876',
                    400: '#d9a94a',
                    DEFAULT: '#C9A84C',
                    500: '#C9A84C',
                    600: '#b08a32',
                    700: '#8d6a26',
                    800: '#6f5220',
                    900: '#5a421c',
                },
                cream: {
                    DEFAULT: '#FAFAF7',
                    50: '#FAFAF7',
                    100: '#F4F4EF',
                    200: '#EAEAE2',
                },
                success: '#22c55e',
                warning: '#f59e0b',
                danger: '#ef4444',
            },
            fontFamily: {
                sans: ['Epilogue', 'system-ui', 'sans-serif'],
                display: ['Syne', 'sans-serif'],
                mono: ['"Syne Mono"', 'monospace'],
                serif: ['"Cormorant Garamond"', 'serif'],
            },
            borderRadius: {
                xl2: '1.25rem',
                xl3: '1.5rem',
            },
            boxShadow: {
                card: '0 4px 24px rgba(0,0,0,0.06)',
                hover: '0 8px 40px rgba(0,0,0,0.12)',
                gold: '0 4px 24px rgba(201,168,76,0.25)',
            },
        },
    },
    plugins: [],
}
