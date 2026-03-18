import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CibilSlider from '../components/CibilSlider'
import FileUpload from '../components/FileUpload'
import LoadingScreen from '../components/LoadingScreen'
import { ChevronLeft, AlertCircle } from 'lucide-react'
import { calcFoir, scorePersonalLoan } from '../utils/scoring'
import { analyseDocument, saveAssessment } from '../utils/api'

const EMPLOYMENT_TYPES = ['Salaried', 'Self-Employed', 'Business Owner', 'Professional / Doctor']
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Other']

export default function PersonalLoan() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [cibil, setCibil] = useState(720)
    const [form, setForm] = useState({
        employmentType: '',
        monthlyIncome: '',
        yearsAtEmployer: '',
        city: '',
        existingEMI: '',
        loanAmount: '',
    })
    const [payslip, setPayslip] = useState(null)
    const [itr, setItr] = useState(null)

    function setField(key, val) {
        setForm(f => ({ ...f, [key]: val }))
    }

    function validate() {
        const required = ['employmentType', 'monthlyIncome', 'loanAmount']
        for (const k of required) {
            if (!form[k]) return `Please fill in all required fields.`
        }
        if (Number(form.monthlyIncome) < 10000) return 'Monthly income must be at least ₹10,000.'
        if (Number(form.loanAmount) < 50000) return 'Loan amount must be at least ₹50,000.'
        return null
    }

    async function handleSubmit() {
        setError('')
        const err = validate()
        if (err) { setError(err); return }
        setLoading(true)
    }

    async function handleAnalysisComplete() {
        try {
            // Extract from documents if available
            let extractedData = {}
            if (payslip?.base64) {
                try {
                    const r = await analyseDocument(payslip.base64, 'payslip', 'personal')
                    extractedData = { ...extractedData, payslip: r.data }
                } catch (e) { /* non-fatal */ }
            }

            // Compute score
            const numIncome = Number(form.monthlyIncome)
            const numEMI = Number(form.existingEMI) || 0
            const numLoan = Number(form.loanAmount)
            const numYears = Number(form.yearsAtEmployer) || 0

            const score = scorePersonalLoan({
                cibilScore: cibil,
                monthlyIncome: numIncome,
                existingEMI: numEMI,
                loanAmount: numLoan,
                employmentType: form.employmentType.toLowerCase().replace(/ \/ .*/, '').replace(' ', '_'),
                yearsAtEmployer: numYears,
            })
            const foir = calcFoir(numEMI, numIncome)

            const sessionData = await saveAssessment({
                loanType: 'personal',
                extractedData: { ...form, cibilScore: cibil, foir, ...extractedData },
                probabilityScore: score,
            })

            navigate('/results', {
                state: {
                    loanType: 'personal',
                    score,
                    sessionId: sessionData?.session_id,
                    metrics: {
                        cibil,
                        foir,
                        monthlyIncome: numIncome,
                        existingEMI: numEMI,
                        loanAmount: numLoan,
                        employmentType: form.employmentType,
                        yearsAtEmployer: numYears,
                        city: form.city,
                    },
                },
            })
        } catch (e) {
            setError('Analysis failed. Please try again.')
            setLoading(false)
        }
    }

    if (loading) return <LoadingScreen onComplete={handleAnalysisComplete} />

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 fade-in">
                {/* Back */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
                >
                    <ChevronLeft size={16} /> Back
                </button>

                <div className="mb-8">
                    <h1 className="section-title">Personal Loan Eligibility</h1>
                    <p className="text-sm text-gray-500 mt-1">Fill in your details and upload documents for an AI-powered assessment.</p>
                </div>

                {/* ── Step 1: CIBIL ── */}
                <div className="card mb-6">
                    <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gold text-white text-xs flex items-center justify-center font-bold">1</span>
                        Credit Score
                    </h2>
                    <CibilSlider value={cibil} onChange={setCibil} />
                </div>

                {/* ── Step 2: Form ── */}
                <div className="card mb-6">
                    <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gold text-white text-xs flex items-center justify-center font-bold">2</span>
                        Income & Employment Details
                    </h2>

                    <div className="space-y-4">
                        {/* Employment type */}
                        <div>
                            <label className="label-base">Employment Type <span className="text-red-400">*</span></label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {EMPLOYMENT_TYPES.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setField('employmentType', t)}
                                        className={`pill text-xs ${form.employmentType === t ? 'pill-active' : 'pill-inactive'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Income & Years row */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label-base">Monthly Net Income (₹) <span className="text-red-400">*</span></label>
                                <input
                                    id="monthly-income"
                                    type="number"
                                    placeholder="e.g. 75000"
                                    value={form.monthlyIncome}
                                    onChange={e => setField('monthlyIncome', e.target.value)}
                                    className="input-base"
                                />
                            </div>
                            <div>
                                <label className="label-base">Years at Current Employer</label>
                                <input
                                    id="years-at-employer"
                                    type="number"
                                    placeholder="e.g. 3"
                                    min={0}
                                    max={40}
                                    value={form.yearsAtEmployer}
                                    onChange={e => setField('yearsAtEmployer', e.target.value)}
                                    className="input-base"
                                />
                            </div>
                        </div>

                        {/* City */}
                        <div>
                            <label className="label-base">City</label>
                            <select
                                id="city"
                                value={form.city}
                                onChange={e => setField('city', e.target.value)}
                                className="input-base"
                            >
                                <option value="">Select city…</option>
                                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* EMI & Loan amount */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label-base">Existing Monthly EMIs (₹)</label>
                                <input
                                    id="existing-emi"
                                    type="number"
                                    placeholder="0 if none"
                                    value={form.existingEMI}
                                    onChange={e => setField('existingEMI', e.target.value)}
                                    className="input-base"
                                />
                            </div>
                            <div>
                                <label className="label-base">Loan Amount Needed (₹) <span className="text-red-400">*</span></label>
                                <input
                                    id="loan-amount"
                                    type="number"
                                    placeholder="e.g. 500000"
                                    value={form.loanAmount}
                                    onChange={e => setField('loanAmount', e.target.value)}
                                    className="input-base"
                                />
                            </div>
                        </div>

                        {/* Live FOIR preview */}
                        {form.monthlyIncome && form.existingEMI && (
                            <div className="p-3 bg-cream rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">FOIR (debt burden ratio)</span>
                                    <span className={`text-xs font-bold ${calcFoir(Number(form.existingEMI), Number(form.monthlyIncome)) <= 0.4
                                            ? 'text-green-600' : calcFoir(Number(form.existingEMI), Number(form.monthlyIncome)) <= 0.55
                                                ? 'text-amber-600' : 'text-red-600'
                                        }`}>
                                        {(calcFoir(Number(form.existingEMI), Number(form.monthlyIncome)) * 100).toFixed(1)}%
                                        {' '}{calcFoir(Number(form.existingEMI), Number(form.monthlyIncome)) <= 0.4 ? '✓ Good' : calcFoir(Number(form.existingEMI), Number(form.monthlyIncome)) <= 0.55 ? '⚠ Fair' : '✗ High'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Step 3: Documents ── */}
                <div className="card mb-6">
                    <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gold text-white text-xs flex items-center justify-center font-bold">3</span>
                        Documents
                        <span className="ml-auto text-xs font-normal text-gray-400">Optional but improves accuracy</span>
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FileUpload
                            id="payslip-upload"
                            label="Latest Payslip"
                            hint="PDF up to 10 MB"
                            onFileChange={setPayslip}
                        />
                        <FileUpload
                            id="itr-upload"
                            label="ITR / Form 16"
                            hint="PDF up to 10 MB"
                            onFileChange={setItr}
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 p-4 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    id="personal-loan-submit"
                    onClick={handleSubmit}
                    className="btn-primary w-full text-base"
                >
                    Check My Eligibility →
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                    No hard credit inquiry. Safe & secure.
                </p>
            </main>
        </div>
    )
}
