import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-main">
                <div className="footer-col">
                    <div className="footer-brand-name">Veritas <span>AI</span></div>
                    <p className="footer-brand-desc">AI-powered loan eligibility checker for India. Know your approval odds before you walk into a bank.</p>
                </div>
                <div className="footer-col">
                    <p className="footer-col-head">Tools</p>
                    <ul className="footer-links">
                        <li><Link to="/personal-loan">Personal Loan Check</Link></li>
                        <li><Link to="/business-loan">Business Loan Check</Link></li>
                        <li><Link to="/emi-calculator">EMI Calculator</Link></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <p className="footer-col-head">Account</p>
                    <ul className="footer-links">
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/auth">Sign In / Register</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-disclaimer">
                <p>⚠️ <strong>Disclaimer:</strong> Veritas AI is an independent financial information platform and is <strong>not affiliated with any bank, NBFC, or regulated lending institution.</strong> The eligibility scores and recommendations are indicative only, based on self-declared data, and do not constitute loan approval, credit facility, or financial advice. All lending decisions are solely at the discretion of respective lenders. Veritas AI does not access your CIBIL report or any bureau data. Veritas AI is not registered with the <strong>Reserve Bank of India (RBI)</strong> as a lending or credit information entity.</p>
            </div>

            <div className="footer-bottom">
                <span className="footer-copy">© 2026 Veritas AI. All rights reserved.</span>
                <div className="footer-security">
                    <span>🔒 256-bit SSL</span>
                    <span>🛡️ Data never sold or shared</span>
                </div>
            </div>
        </footer>
    )
}
