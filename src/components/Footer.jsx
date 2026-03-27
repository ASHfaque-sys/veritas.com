import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer>
            <div className="footer-inner">
                <div className="footer-top grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                    <div className="col-span-1 sm:col-span-2 md:col-span-1">
                        <div className="footer-logo-wrap">
                            <div className="footer-logo-mark">V</div>
                            <span className="footer-logo-name">Veritas <span>AI</span></span>
                        </div>
                        <p className="footer-desc">AI-powered loan eligibility checker. Know your approval odds before you walk into a bank. Free, always.</p>
                    </div>
                    <div>
                        <div className="footer-col-head">Tools</div>
                        <ul className="footer-links">
                            <li><Link to="/personal-loan">Personal Loan Check</Link></li>
                            <li><Link to="/business-loan">Business Loan Check</Link></li>
                            <li><Link to="/emi-calculator">EMI Calculator</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="footer-col-head">Account</div>
                        <ul className="footer-links">
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/auth">Sign In</Link></li>
                            <li><Link to="/auth">Register</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="footer-col-head">Legal</div>
                        <ul className="footer-links">
                            <li><Link to="/">Privacy Policy</Link></li>
                            <li><Link to="/">Terms of Use</Link></li>
                            <li><Link to="/">Disclaimer</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-disclaimer">
                    <p>⚠ <strong>Disclaimer:</strong> Veritas AI is an independent financial information platform and is <strong>not affiliated with any bank, NBFC, or regulated lending institution.</strong> Eligibility scores are indicative only, based on self-declared data, and do not constitute loan approval or financial advice. Not registered with the <strong>Reserve Bank of India (RBI)</strong> as a lending or credit entity.</p>
                </div>

                <div className="footer-bottom flex-col gap-4 sm:flex-row">
                    <span className="footer-copy">© 2026 Veritas AI · All rights reserved</span>
                    <div className="footer-seals flex-wrap justify-center">
                        <span>🔒 256-bit SSL</span>
                        <span>🛡 Data never sold</span>
                        <span>⚡ Always free</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
