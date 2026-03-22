/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                navy: {
                    DEFAULT: '#0b1629',
                    mid: '#122040',
                    light: '#1e3260',
                    dim: '#2a4080',
                },
                electric: {
                    DEFAULT: '#2563eb',
                    bright: '#3b82f6',
                    pale: '#dbeafe',
                },
                rule: {
                    DEFAULT: '#d0daf0',
                    dark: '#1e3260',
                },
                offwhite: {
                    DEFAULT: '#ffffff',
                    off: '#f4f7ff',
                    dim: '#c8d4ee',
                    faint: '#7a8fbc',
                },
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
                serif: ['"Cormorant Garamond"', 'serif'],
                sans: ['Karla', 'system-ui', 'sans-serif'],
                mono: ['"IBM Plex Mono"', 'monospace'],
                display: ['"Bebas Neue"', 'sans-serif'],
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
