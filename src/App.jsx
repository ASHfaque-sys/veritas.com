import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PersonalLoan from './pages/PersonalLoan'
import BusinessLoan from './pages/BusinessLoan'
import Results from './pages/Results'
import Feedback from './pages/Feedback'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/personal-loan" element={<PersonalLoan />} />
                <Route path="/business-loan" element={<BusinessLoan />} />
                <Route path="/results" element={<Results />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    )
}
