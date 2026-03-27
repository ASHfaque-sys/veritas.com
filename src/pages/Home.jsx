import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Home() {
    const navigate = useNavigate()

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
        }, { threshold: 0.07 })
        
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
        
        return () => observer.disconnect()
    }, [])

    return (
        <div className="bg-void text-white font-sans overflow-x-hidden min-h-screen antialiased">
            <Navbar />

            {/* HERO */}
            <section className="hero mt-16">
                <div className="hero-grid"></div>
                <div className="hero-glow"></div>

                <div className="hero-inner">
                    <div className="hero-top block lg:grid">
                        <div className="mb-10 lg:mb-0">
                            <div className="hero-tag">⚡ Loan intelligence layer</div>
                            <h1 className="hero-headline">
                                <span className="hl-outline">Know your</span>
                                <span className="hl-lime">loan odds</span>
                                <span className="hl-outline-lime">before</span>
                                <span>you apply</span>
                            </h1>
                        </div>
                        <div className="hero-right-col">
                            <p className="hero-sub">Upload your docs. Get an AI-powered eligibility score — built on the same parameters real bank underwriters use. Free, instant, zero bureau impact.</p>
                            <div className="hero-actions">
                                <button onClick={() => navigate('/personal-loan')} className="btn-main">Check My Eligibility <span>→</span></button>
                                <a href="#how" className="btn-ghost">See how it works <span>↓</span></a>
                            </div>
                        </div>
                    </div>

                    <div className="score-strip overflow-x-auto">
                        <div className="score-item min-w-[150px]">
                            <span className="score-item-label">Loan Types</span>
                            <div className="score-item-val">30+</div>
                            <div className="score-item-sub">Covered</div>
                        </div>
                        <div className="score-divider"></div>
                        <div className="score-item min-w-[150px]">
                            <span className="score-item-label">Delivery</span>
                            <div className="score-item-val">2min</div>
                            <div className="score-item-sub">From input to score</div>
                        </div>
                        <div className="score-divider"></div>
                        <div className="score-item min-w-[150px]">
                            <span className="score-item-label">Bureau Impact</span>
                            <div className="score-item-val">Zero</div>
                            <div className="score-item-sub">No CIBIL pull</div>
                        </div>
                        <div className="score-divider"></div>
                        <div className="score-item min-w-[150px]">
                            <span className="score-item-label">Price</span>
                            <div className="score-item-val">₹0</div>
                            <div className="score-item-sub">Always free</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MARQUEE */}
            <div className="marquee-wrap">
                <div className="marquee">
                    <span className="marquee-item">256-bit SSL</span>
                    <span className="marquee-item">No CIBIL Pull</span>
                    <span className="marquee-item">Data Never Sold</span>
                    <span className="marquee-item">Instant Results</span>
                    <span className="marquee-item">Always Free</span>
                    <span className="marquee-item">30+ Loan Types</span>
                    <span className="marquee-item">AI-Powered Analysis</span>
                    <span className="marquee-item">Real Approval Data</span>
                    <span className="marquee-item">256-bit SSL</span>
                    <span className="marquee-item">No CIBIL Pull</span>
                    <span className="marquee-item">Data Never Sold</span>
                    <span className="marquee-item">Instant Results</span>
                    <span className="marquee-item">Always Free</span>
                    <span className="marquee-item">30+ Loan Types</span>
                    <span className="marquee-item">AI-Powered Analysis</span>
                    <span className="marquee-item">Real Approval Data</span>
                </div>
            </div>

            {/* LOANS */}
            <section className="loans reveal">
                <div className="section-tag">Choose your path</div>
                <h2 className="section-title">Pick your<br /><span>loan type.</span></h2>
                <div className="loan-grid grid-cols-1 md:grid-cols-2">
                    <button onClick={() => navigate('/personal-loan')} className="loan-card reveal d1 text-left w-full">
                        <div className="loan-card-num">
                            <span>REF-001</span>
                            <span className="loan-card-num-badge">Personal</span>
                        </div>
                        <div className="loan-card-icon">👤</div>
                        <div className="loan-card-title">Personal Loan</div>
                        <div className="loan-card-desc">Salaried or self-employed? Get your eligibility score in minutes — CIBIL analysis, income check, payslip parsing. No bank visit required.</div>
                        <ul className="loan-features w-full">
                            <li><span>CIBIL Score Analysis</span></li>
                            <li><span>Income & EMI Check</span></li>
                            <li><span>Payslip + ITR Verification</span></li>
                        </ul>
                        <span className="loan-cta">Check Eligibility →</span>
                    </button>

                    <button onClick={() => navigate('/business-loan')} className="loan-card reveal d2 text-left w-full">
                        <div className="loan-card-num">
                            <span>REF-002</span>
                            <span className="loan-card-num-badge">Business</span>
                        </div>
                        <div className="loan-card-icon">💼</div>
                        <div className="loan-card-title">Business Loan</div>
                        <div className="loan-card-desc">Term loans, working capital, LAP and more. Upload your financials — AI produces a bank-ready eligibility score across 8 categories.</div>
                        <ul className="loan-features w-full">
                            <li><span>8 Loan Type Categories</span></li>
                            <li><span>DSCR & Turnover Analysis</span></li>
                            <li><span>Balance Sheet + ITR Check</span></li>
                        </ul>
                        <span className="loan-cta">Check Eligibility →</span>
                    </button>
                </div>
            </section>

            {/* HOW */}
            <section id="how" className="how reveal">
                <div className="how-inner">
                    <div className="how-header flex-col md:flex-row gap-6">
                        <div>
                            <div className="section-tag">The Process</div>
                            <h2 className="section-title" style={{marginBottom: 0}}>How it<br /><span>works.</span></h2>
                        </div>
                        <div className="how-note text-left md:text-right">From zero to eligibility score in under 2 minutes.</div>
                    </div>
                    <div className="how-grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                        <div className="how-step">
                            <div className="how-step-num">01</div>
                            <span className="how-step-icon">👤</span>
                            <div className="how-step-title">Tell us about yourself</div>
                            <div className="how-step-desc">Income, CIBIL score, loan amount, employment type. The foundation of your eligibility profile.</div>
                        </div>
                        <div className="how-step">
                            <div className="how-step-num">02</div>
                            <span className="how-step-icon">📤</span>
                            <div className="how-step-title">Upload your docs</div>
                            <div className="how-step-desc">Payslips, ITR, bank statements. Our AI reads and extracts your financial data automatically.</div>
                        </div>
                        <div className="how-step">
                            <div className="how-step-num">03</div>
                            <span className="how-step-icon">📊</span>
                            <div className="how-step-title">Get your score</div>
                            <div className="how-step-desc">An eligibility score out of 100 — calibrated to real bank underwriting logic. Instant.</div>
                        </div>
                        <div className="how-step">
                            <div className="how-step-num">04</div>
                            <span className="how-step-icon">🏦</span>
                            <div className="how-step-title">See matched lenders</div>
                            <div className="how-step-desc">Ranked bank picks with estimated approval rates. Apply directly on their portal.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST */}
            <section className="trust reveal">
                <div className="section-tag">Why trust us</div>
                <h2 className="section-title" style={{marginBottom: 40}}>Built with<br /><span>zero compromise.</span></h2>
                <div className="trust-grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
                    <div className="trust-card reveal"><div className="trust-card-icon">🔒</div><div className="trust-card-title">256-bit SSL</div><div class="trust-card-desc">Bank-grade encryption on every request.</div></div>
                    <div className="trust-card reveal d1"><div className="trust-card-icon">🚫</div><div className="trust-card-title">No CIBIL Pull</div><div class="trust-card-desc">Zero hard inquiry. Your credit score stays untouched.</div></div>
                    <div className="trust-card reveal d2"><div className="trust-card-icon">🛡️</div><div className="trust-card-title">Data Never Sold</div><div class="trust-card-desc">Your financial data is never sold or shared with anyone.</div></div>
                    <div className="trust-card reveal d3"><div className="trust-card-icon">⚡</div><div className="trust-card-title">Instant Results</div><div class="trust-card-desc">Score delivered in under 2 minutes, every time.</div></div>
                    <div className="trust-card reveal d4"><div className="trust-card-icon">🆓</div><div className="trust-card-title">Always Free</div><div class="trust-card-desc">No hidden fees. No premium tiers. Free, forever.</div></div>
                </div>
            </section>

            {/* STATS */}
            <section className="stats reveal">
                <div className="stats-grid grid-cols-1 md:grid-cols-3">
                    <div className="stat-card">
                        <div className="stat-val">30+</div>
                        <div className="stat-label">Loan Types</div>
                        <div className="stat-desc">Personal, business, LAP, working capital & more.</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-val">2min</div>
                        <div className="stat-label">To Your Score</div>
                        <div className="stat-desc">From document upload to matched lenders.</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-val">₹0</div>
                        <div className="stat-label">Forever Free</div>
                        <div className="stat-desc">No fees, no catch, no premium tier.</div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <div className="cta reveal flex flex-col md:grid md:grid-cols-[1fr_auto]">
                <div className="mb-10 md:mb-0">
                    <div className="cta-kicker">Free Forever</div>
                    <h2 className="cta-title">Ready to check<br />your <span>eligibility?</span></h2>
                    <p className="cta-sub">Built for borrowers. Free, private, and instant.</p>
                </div>
                <div className="cta-right w-full md:w-auto">
                    <button onClick={() => navigate('/personal-loan')} className="btn-cta text-center w-full">Personal Loan <span>→</span></button>
                    <button onClick={() => navigate('/business-loan')} className="btn-cta-2 text-center w-full">Business Loan <span>→</span></button>
                </div>
            </div>

            <Footer />
        </div>
    )
}
