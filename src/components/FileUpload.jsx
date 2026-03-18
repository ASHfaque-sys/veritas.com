import React, { useRef, useState } from 'react'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'

export default function FileUpload({
    id,
    label,
    required = false,
    hint = 'PDF up to 20 MB',
    onFileChange,
}) {
    const inputRef = useRef(null)
    const [file, setFile] = useState(null)
    const [dragging, setDragging] = useState(false)
    const [error, setError] = useState('')

    function handleFile(f) {
        setError('')
        if (!f) return
        if (f.type !== 'application/pdf') {
            setError('Please upload a PDF file.')
            return
        }
        if (f.size > 20 * 1024 * 1024) {
            setError('File must be under 20 MB.')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]
            setFile(f)
            onFileChange?.({ file: f, base64, name: f.name })
        }
        reader.readAsDataURL(f)
    }

    function handleDrop(e) {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files?.[0]
        if (f) handleFile(f)
    }

    function handleRemove() {
        setFile(null)
        onFileChange?.(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="w-full">
            <label className="label-base">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>

            {file ? (
                /* Success state */
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle size={20} className="text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-800 truncate">{file.name}</p>
                        <p className="text-xs text-green-600">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                        aria-label="Remove file"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                /* Upload zone */
                <div
                    id={id}
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    className={`
            relative flex flex-col items-center justify-center gap-2
            border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200
            ${dragging
                            ? 'border-gold bg-gold/5 scale-[1.01]'
                            : 'border-gray-200 hover:border-gold/60 hover:bg-gold/3 bg-cream'
                        }
          `}
                >
                    <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${dragging ? 'bg-gold text-white' : 'bg-gray-100 text-gray-400'}
            transition-all duration-200
          `}>
                        {dragging ? <Upload size={22} /> : <FileText size={22} />}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">
                            {dragging ? 'Drop it here!' : 'Click to upload or drag & drop'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={e => handleFile(e.target.files?.[0])}
                    />
                </div>
            )}

            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>
    )
}
