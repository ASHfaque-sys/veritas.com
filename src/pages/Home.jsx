import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Home() {
    const navigate = useNavigate()

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
        }, { threshold: 0.08 })
        
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
        
        return () => observer.disconnect()
    }, [])

    return (
        <div className="bg-white text-navy font-sans overflow-x-hidden">
            <Navbar />

            {/* TICKER */}
            <div className="ticker">
                <div className="ticker-inner">
                    <span className="ticker-item">256-bit SSL Encrypted</span>
                    <span className="ticker-item">No CIBIL Pull</span>
                    <span className="ticker-item">Data Never Sold</span>
                    <span className="ticker-item">Instant Results</span>
                    <span className="ticker-item">Always Free</span>
                    <span className="ticker-item">30+ Loan Types</span>
                    <span className="ticker-item">AI-Powered Analysis</span>
                    <span className="ticker-item">256-bit SSL Encrypted</span>
                    <span className="ticker-item">No CIBIL Pull</span>
                    <span className="ticker-item">Data Never Sold</span>
                    <span className="ticker-item">Instant Results</span>
                    <span className="ticker-item">Always Free</span>
                    <span className="ticker-item">30+ Loan Types</span>
                    <span className="ticker-item">AI-Powered Analysis</span>
                </div>
            </div>

            {/* HERO */}
            <section className="hero">
                <div className="hero-left">
                    <div>
                        <div className="hero-kicker">Breaking: Know before you apply</div>
                        <h1 className="hero-headline">
                            Know<br />your<br />loan<br /><em>odds.</em>
                        </h1>
                        <p className="hero-deck">
                            Upload your documents and get an instant, AI-powered eligibility score — plus personalised tips and matched lenders.
                        </p>
                    </div>
                    <div className="hero-cta-group w-fit">
                        <button onClick={() => navigate('/personal-loan')} className="hero-btn-primary">Check My Eligibility <span>→</span></button>
                        <a href="#how-it-works" className="hero-btn-secondary">How It Works <span>↓</span></a>
                    </div>
                    <div className="hero-vol">01</div>
                </div>

                <div className="hero-right">
                    <div className="hero-right-feature">
                        <span className="feat-label">Feature · AI Analysis</span>
                        <h2 className="feat-title">Your eligibility score, calculated the way bankers do it.</h2>
                        <p className="feat-body">Veritas AI uses the same financial parameters real bank underwriters apply — DSCR, FOIR, income multiples — to give you a score out of 100 before you step into a branch. No guesswork. No surprises.</p>
                    </div>
                    <div className="trust-strip">
                        <div className="trust-item"><span className="trust-icon">🔒</span><span className="trust-text">256-bit SSL</span></div>
                        <div className="trust-item"><span className="trust-icon">🚫</span><span className="trust-text">No CIBIL Pull</span></div>
                        <div className="trust-item"><span className="trust-icon">🛡️</span><span class="trust-text">Data Never Sold</span></div>
                        <div className="trust-item"><span className="trust-icon">⚡</span><span class="trust-text">Instant Results</span></div>
                        <div className="trust-item"><span className="trust-icon">🆓</span><span class="trust-text">Always Free</span></div>
                    </div>
                </div>
            </section>

            {/* LOAN CARDS */}
            <div className="loan-section reveal">
                <button onClick={() => navigate('/personal-loan')} className="loan-col text-left">
                    <div className="loan-col-num">Section 01</div>
                    <span className="loan-col-icon">👤</span>
                    <h2 className="loan-col-title">Personal<br /><span>Loan</span></h2>
                    <p className="loan-col-body">Salaried or self-employed? Check eligibility with CIBIL score, income analysis and payslip verification.</p>
                    <ul className="loan-features">
                        <li>CIBIL Score Analysis</li>
                        <li>Income & EMI Check</li>
                        <li>Payslip + ITR Verification</li>
                    </ul>
                    <span className="loan-cta-link">Check Eligibility →</span>
                </button>

                <button onClick={() => navigate('/business-loan')} className="loan-col text-left">
                    <div className="loan-col-num">Section 02</div>
                    <span className="loan-col-icon">💼</span>
                    <h2 className="loan-col-title">Business<br /><span>Loan</span></h2>
                    <p className="loan-col-body">Term loans, working capital, LAP and more. AI reads your financials for a bank-ready eligibility score.</p>
                    <ul className="loan-features">
                        <li>8 Loan Type Categories</li>
                        <li>DSCR & Turnover Analysis</li>
                        <li>Balance Sheet + ITR Check</li>
                    </ul>
                    <span className="loan-cta-link">Check Eligibility →</span>
                </button>
            </div>

            {/* STATS */}
            <div className="stats-section reveal">
                <div className="stat-col">
                    <div className="stat-num">30+</div>
                    <div className="stat-label">Loan Types Covered</div>
                </div>
                <div className="stat-col">
                    <div className="stat-num">2min</div>
                    <div className="stat-label">Average Completion Time</div>
                </div>
                <div className="stat-col">
                    <div className="stat-num">100%</div>
                    <div className="stat-label">Free, Always</div>
                </div>
            </div>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="how-section reveal">
                <div className="how-header flex-col md:flex-row gap-4 md:gap-8">
                    <h2 className="how-title">How It Works</h2>
                    <p className="how-subtitle">Four steps to know your approval odds</p>
                </div>
                <div className="how-grid">
                    <div className="how-step">
                        <div className="how-step-ghost">01</div>
                        <span className="how-step-icon">👤</span>
                        <h4 className="how-step-title">Tell us about yourself</h4>
                        <p className="how-step-desc">Enter your income, CIBIL score, loan amount, and employment details. Takes under 2 minutes.</p>
                    </div>
                    <div className="how-step">
                        <div className="how-step-ghost">02</div>
                        <span className="how-step-icon">📤</span>
                        <h4 className="how-step-title">Upload your documents</h4>
                        <p className="how-step-desc">Optionally upload payslips, ITR, or bank statements. Our AI reads and fills your data automatically.</p>
                    </div>
                    <div className="how-step">
                        <div className="how-step-ghost">03</div>
                        <span className="how-step-icon">📊</span>
                        <h4 className="how-step-title">Get your eligibility score</h4>
                        <p className="how-step-desc">Receive an instant score out of 100, based on the same parameters real bank underwriters use.</p>
                    </div>
                    <div className="how-step">
                        <div className="how-step-ghost">04</div>
                        <span className="how-step-icon">🏦</span>
                        <h4 className="how-step-title">See matched lenders</h4>
                        <p className="how-step-desc">Get personalised bank recommendations with estimated approval rates — apply directly on their portal.</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="cta-grid-bg"></div>
                <div className="cta-glow"></div>
                <div className="cta-inner reveal">
                    <div className="cta-kicker">Free Forever</div>
                    <h2 className="cta-title">Ready to check<br />your <span>eligibility?</span></h2>
                    <p className="cta-sub">Built for Indian borrowers. Free, private, and instant.</p>
                    <div className="cta-btn-row flex-col sm:flex-row">
                        <button onClick={() => navigate('/personal-loan')} className="btn-cta-electric w-full sm:w-auto">Personal Loan →</button>
                        <button onClick={() => navigate('/business-loan')} className="btn-cta-white w-full sm:w-auto">Business Loan →</button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
