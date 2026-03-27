import React, { useState } from 'react'
import { ShieldCheck, HelpCircle, FileText, Landmark, RefreshCw, HandCoins, ArrowRight } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function MudraChecker() {
    const [form, setForm] = useState({ type: 'Manufacturing', purpose: 'Working Capital', amount: '', years: '' })
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const handleCheck = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
             await new Promise(r => setTimeout(r, 1000))

             const amt = Number(form.amount)
             let category = 'None'
             
             // MUDRA Logic
             if (amt <= 50000) category = 'Shishu'
             else if (amt <= 500000) category = 'Kishore'
             else if (amt <= 1000000) category = 'Tarun'
             else if (amt <= 2000000 && Number(form.years) >= 3) category = 'Tarun Plus'

             // Filter out corporates
             if (form.type === 'Private Limited' || form.type === 'Public Limited') category = 'None'

             const { data: { user } } = await supabase.auth.getUser()
             if (user) {
                 await supabase.from('mudra_eligibility_checks').insert({
                     user_id: user.id,
                     business_type: form.type,
                     loan_purpose: form.purpose,
                     years_in_business: Number(form.years),
                     requested_amount: amt,
                     eligible_category: category
                 })
             }

             setResult(category)
        } catch(e) { console.error(e) }
        finally { setLoading(false) }
    }

    const fmtINR = (n) => '₹' + Number(Math.round(n)).toLocaleString('en-IN')

    return (
        <div className="space-y-6 fade-in">
             <div className="card border-0 bg-white shadow-sm ring-1 ring-gray-100 slide-in">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                        <HandCoins className="text-orange-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">MUDRA Loan Eligibility</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Check if you qualify for the Govt. of India's collateral-free scheme for Micro Enterprises.
                        </p>
                    </div>
                </div>

                {!result ? (
                    <form onSubmit={handleCheck} className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label-base">Business Entity Type</label>
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-base" required>
                                <option>Sole Proprietorship</option>
                                <option>Partnership</option>
                                <option>LLP</option>
                                <option>Private Limited</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-base">Loan Purpose</label>
                            <select value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} className="input-base" required>
                                <option>Working Capital</option>
                                <option>Purchase Machinery</option>
                                <option>Business Vehicle</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-base">Required Amount (₹)</label>
                            <input type="number" min="10000" max="2500000" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="input-base" placeholder="Max ₹20,000,000" required />
                        </div>
                        <div>
                            <label className="label-base">Years in Business</label>
                            <input type="number" min="0" max="50" value={form.years} onChange={e => setForm({...form, years: e.target.value})} className="input-base" placeholder="0 for new business" required />
                        </div>
                        <div className="sm:col-span-2 pt-2">
                            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                                {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Check Govt. Eligibility'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="slide-in">
                        {result === 'None' ? (
                            <div className="p-6 rounded-xl bg-red-50 border border-red-100 text-center">
                                <h3 className="text-xl font-bold text-red-700 mb-2">Not Eligible for MUDRA</h3>
                                <p className="text-sm text-red-600">Your profile (either Corporate Entity or Amount exceeding Limits) does not qualify for the PMMY scheme. Explore our standard Term Loan options instead.</p>
                                <button onClick={() => setResult(null)} className="mt-4 px-6 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50">Back</button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-6 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg overflow-hidden relative">
                                    <ShieldCheck size={120} className="absolute -right-6 -bottom-6 opacity-20" />
                                    <p className="text-orange-100 text-sm font-bold tracking-widest uppercase mb-1 drop-shadow-sm">Eligible Tier Confirmed</p>
                                    <h3 className="text-4xl font-black mb-2 drop-shadow-md">Taruण ({result})</h3>
                                    <p className="text-orange-50 font-medium max-w-sm">You qualify for a collateral-free MUDRA loan up to {fmtINR(form.amount)}.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="card p-5 bg-white shadow-sm ring-1 ring-gray-100">
                                        <h4 className="font-bold flex items-center gap-2 mb-4"><Landmark className="text-orange-500" size={18}/> Top Participating PSBs</h4>
                                        <ul className="space-y-3">
                                            {['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank', 'Union Bank'].map((b, i) => (
                                                <li key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                                                    <span className="font-semibold text-gray-700">{b}</span>
                                                    <span className="text-emerald-600 font-bold">~9.5%</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="card p-5 bg-white shadow-sm ring-1 ring-gray-100">
                                        <h4 className="font-bold flex items-center gap-2 mb-4"><FileText className="text-blue-500" size={18}/> Required Documents</h4>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Proof of Identity (Aadhaar/Voter ID)</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Proof of Residence</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Proof of Business Entity/Address</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Machinery quotation (if applicable)</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 2 Passport size photos</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                    <h4 className="font-bold flex items-center gap-2 mb-3"><HelpCircle className="text-gray-400" size={18}/> Frequently Asked Questions</h4>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="font-semibold text-gray-800">Do I need to pay a processing fee?</p>
                                            <p className="text-gray-600 mt-0.5">No, banks generally waive processing fees for Shishu and Kishore loans. Tarun limits may carry a low 0.5% fee.</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Will applying affect my CIBIL?</p>
                                            <p className="text-gray-600 mt-0.5">Yes, final loan applications result in a hard inquiry. Do not blast applications to every bank simultaneously.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <a href="https://www.mudra.org.in/" target="_blank" rel="noreferrer" className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
                                        Apply via Official Udyamimetra Portal <ArrowRight size={18}/>
                                    </a>
                                    <button onClick={() => setResult(null)} className="px-6 py-3 font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                                        Reset Check
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
             </div>
        </div>
    )
}
