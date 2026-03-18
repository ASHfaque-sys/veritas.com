import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../utils/supabase'

export default function FloatingChat({ context }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your Veritas AI advisor. Ask me anything about your eligibility report." }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (isOpen) scrollToBottom()
    }, [messages, isOpen])

    async function handleSend(e) {
        e.preventDefault()
        if (!input.trim() || !isSupabaseConfigured()) return

        const userMsg = { role: 'user', content: input.trim() }
        const updatedMessages = [...messages, userMsg]
        setMessages(updatedMessages)
        setInput('')
        setIsLoading(true)

        try {
            const { data, error } = await supabase.functions.invoke('chat-assistant', {
                body: { messages: updatedMessages, context },
            })
            if (error) throw error

            if (data?.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that. Please try again." }])
            }
        } catch (err) {
            console.error('Chat error:', err)
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, there was an error connecting to my servers." }])
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-all z-50 flex items-center justify-center no-print"
            >
                <MessageSquare size={24} />
            </button>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden no-print">
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Bot size={20} className="text-indigo-200" />
                    <h3 className="font-semibold text-sm">Veritas AI Advisor</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white hover:text-indigo-200 transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-gold/20 text-gold-700'}`}>
                            {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex gap-2 max-w-[85%] self-start">
                        <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-1">
                            <Bot size={12} className="text-gold-700" />
                        </div>
                        <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-gray-100 shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-gray-100 bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder={isSupabaseConfigured() ? "Ask about your eligibility..." : "Requires DB binding"} 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={isLoading || !isSupabaseConfigured()}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim() || !isSupabaseConfigured()}
                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    )
}
