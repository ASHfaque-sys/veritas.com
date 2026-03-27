import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import MobileBottomNav from '../components/MobileBottomNav'
import { supabase, isSupabaseConfigured } from '../utils/supabase'
import { Send, Bot, User, Loader2, Info } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function Advisor() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your Veritas AI Financial Advisor. I have analyzed your entire loan assessment history. How can I help you improve your approval odds today?" }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [assessments, setAssessments] = useState([])
    const messagesEndRef = useRef(null)

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    // Fetch user context on mount
    useEffect(() => {
        async function fetchContext() {
            if (!isSupabaseConfigured()) return
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(5)

            if (!error && data) {
                setAssessments(data)
            }
        }
        fetchContext()
    }, [])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = input.trim()
        setInput('')
        
        // Add user message to UI
        const newMessages = [...messages, { role: 'user', content: userMsg }]
        setMessages(newMessages)
        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            
            // Format history for the API (exclude the system-like greeting if needed, or send it)
            const chatHistory = newMessages.slice(1, -1).map(m => ({
                role: m.role,
                content: m.content
            }))

            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/advisor-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    message: userMsg,
                    chatHistory,
                    context: assessments
                })
            })

            const data = await res.json()
            
            if (!res.ok) throw new Error(data.error || 'Failed to get response')

            setMessages([...newMessages, { role: 'assistant', content: data.response }])
        } catch (err) {
            console.error('Advisor error:', err)
            setMessages([...newMessages, { role: 'assistant', content: "⚠️ Sorry, I encountered an error analyzing your data. Please try again." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-200">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-24 pb-24 sm:pb-8 flex flex-col h-screen fade-in">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">AI Underwriter</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Context-aware financial advisor</p>
                        </div>
                    </div>
                    {assessments.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-lg text-xs font-semibold">
                            <Info size={14} />
                            Analyzing {assessments.length} past assessment{assessments.length !== 1 && 's'}
                        </div>
                    )}
                </div>

                {/* Chat Container */}
                <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col overflow-hidden mb-4 sm:mb-0">
                    
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                                    msg.role === 'user' 
                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                                        : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                
                                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 ${
                                    msg.role === 'user'
                                        ? 'bg-amber-500 text-white rounded-tr-sm shadow-md'
                                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                                }`}>
                                    {msg.role === 'user' ? (
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-0.5">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask about your approval odds, FOIR, or credit profile..."
                                disabled={loading}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-2 w-10 h-10 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <MobileBottomNav />
        </div>
    )
}
