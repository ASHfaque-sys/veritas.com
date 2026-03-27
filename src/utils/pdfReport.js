import jsPDF from 'jspdf'

function fmtINR(n) {
    if (!n || isNaN(n)) return '–'
    return '\u20B9' + Number(n).toLocaleString('en-IN')
}

function fmtPct(n) {
    if (n == null || isNaN(n)) return '–'
    return (n * 100).toFixed(1) + '%'
}

function getScoreLabel(score) {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
}

function getScoreColor(score) {
    if (score >= 80) return [16, 185, 129]   // emerald
    if (score >= 60) return [245, 158, 11]   // amber
    if (score >= 40) return [249, 115, 22]   // orange
    return [239, 68, 68]                      // red
}

export function generatePDFReport({ loanType, score, metrics, bankRecs, improvements, sessionId, foir, dscr }) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210
    const MARGIN = 18
    const CONTENT_W = W - MARGIN * 2
    let y = 0

    // ── Helpers ──
    function moveTo(newY) { y = newY }
    function addY(delta) { y += delta }

    function checkPage(needed = 20) {
        if (y + needed > 275) {
            doc.addPage()
            y = 20
        }
    }

    function drawRect(x, yy, w, h, color) {
        doc.setFillColor(...color)
        doc.roundedRect(x, yy, w, h, 3, 3, 'F')
    }

    function text(t, x, yy, opts = {}) {
        const { size = 10, bold = false, color = [30, 30, 30], align = 'left' } = opts
        doc.setFontSize(size)
        doc.setFont('helvetica', bold ? 'bold' : 'normal')
        doc.setTextColor(...color)
        doc.text(t, x, yy, { align })
    }

    function line(x1, yy, x2, color = [220, 220, 220]) {
        doc.setDrawColor(...color)
        doc.setLineWidth(0.3)
        doc.line(x1, yy, x2, yy)
    }

    // ── HEADER ──
    drawRect(0, 0, W, 42, [201, 168, 76])
    drawRect(0, 38, W, 6, [170, 130, 40])

    // Logo text
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('VERITAS AI', MARGIN, 16)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(255, 255, 230)
    doc.text("AI-Powered Loan Eligibility Platform", MARGIN, 22)

    // Report meta
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    text(`Report Date: ${dateStr}`, W - MARGIN, 12, { size: 8, align: 'right', color: [255, 255, 230] })
    text(`Session: ${sessionId || 'demo'}`, W - MARGIN, 18, { size: 7, align: 'right', color: [255, 230, 180] })
    text(`${loanType === 'personal' ? 'Personal' : 'Business'} Loan Eligibility Report`, W - MARGIN, 24, { size: 8.5, bold: true, align: 'right', color: [255, 255, 255] })

    moveTo(56)

    // ── SECTION: ELIGIBILITY SCORE ──
    const scoreColor = getScoreColor(score)
    const scoreLabel = getScoreLabel(score)

    // Score card background
    drawRect(MARGIN, y - 4, CONTENT_W, 38, [248, 248, 244])
    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(0.5)
    doc.roundedRect(MARGIN, y - 4, CONTENT_W, 38, 3, 3, 'S')

    // Score circle (simulated with square)
    drawRect(MARGIN + 6, y, 28, 28, scoreColor)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(`${score}`, MARGIN + 20, y + 12, { align: 'center' })
    doc.setFontSize(8)
    doc.text('/100', MARGIN + 20, y + 19, { align: 'center' })

    text('Eligibility Score', MARGIN + 40, y + 7, { size: 14, bold: true, color: [30, 30, 30] })
    text(scoreLabel, MARGIN + 40, y + 16, { size: 11, bold: true, color: scoreColor })
    text('Based on AI analysis of your financial profile vs. real bank underwriting criteria.', MARGIN + 40, y + 23, { size: 8, color: [100, 100, 100] })

    // Score bar
    const barX = MARGIN + 40
    const barW = CONTENT_W - 40 - 6
    drawRect(barX, y + 27, barW, 4, [230, 230, 225])
    drawRect(barX, y + 27, barW * (score / 100), 4, scoreColor)

    addY(44)

    // ── SECTION: KEY METRICS ──
    checkPage(60)
    drawRect(MARGIN, y, CONTENT_W, 7, [240, 240, 235])
    text('KEY FINANCIAL METRICS', MARGIN + 4, y + 5, { size: 9, bold: true, color: [80, 60, 20] })
    addY(11)

    const metrics_rows = loanType === 'personal' ? [
        ['CIBIL Score', metrics.cibil, metrics.cibil >= 750 ? 'green' : metrics.cibil >= 680 ? 'amber' : 'red'],
        ['Monthly Income', fmtINR(metrics.monthlyIncome), 'neutral'],
        ['Existing EMI', fmtINR(metrics.existingEMI), 'neutral'],
        ['FOIR (Debt Burden)', fmtPct(foir), foir < 0.4 ? 'green' : foir < 0.6 ? 'amber' : 'red'],
        ['Loan Amount Requested', fmtINR(metrics.loanAmount), 'neutral'],
        ['Employment Type', metrics.employmentType || '–', 'neutral'],
        ['Years at Employer', `${metrics.yearsAtEmployer || 0} yr(s)`, metrics.yearsAtEmployer >= 2 ? 'green' : 'amber'],
        ['City', metrics.city || '–', 'neutral'],
    ] : [
        ['Promoter CIBIL', metrics.cibilScore, metrics.cibilScore >= 720 ? 'green' : metrics.cibilScore >= 680 ? 'amber' : 'red'],
        ['Annual Turnover', fmtINR(metrics.annualTurnover), 'neutral'],
        ['Net Profit', fmtINR(metrics.netProfit), 'neutral'],
        ['DSCR', dscr ? dscr.toFixed(2) : '–', dscr >= 1.25 ? 'green' : dscr >= 1.0 ? 'amber' : 'red'],
        ['Business Vintage', `${metrics.yearsInBusiness || 0} yr(s)`, metrics.yearsInBusiness >= 3 ? 'green' : 'amber'],
        ['Loan Amount Requested', fmtINR(metrics.loanAmount), 'neutral'],
        ['Business Type', metrics.businessType || '–', 'neutral'],
    ]

    const statusColors = { green: [16, 185, 129], amber: [245, 158, 11], red: [239, 68, 68], neutral: [100, 100, 100] }

    metrics_rows.forEach(([label, value, status], i) => {
        checkPage(12)
        if (i % 2 === 0) drawRect(MARGIN, y - 1, CONTENT_W, 9, [252, 252, 249])
        text(label, MARGIN + 4, y + 5.5, { size: 9, color: [80, 80, 80] })
        const col = statusColors[status] || [30, 30, 30]
        text(String(value), MARGIN + CONTENT_W - 4, y + 5.5, { size: 9, bold: status !== 'neutral', color: col, align: 'right' })
        addY(9)
    })

    addY(6)

    // ── SECTION: IMPROVEMENTS ──
    if (improvements && improvements.length > 0) {
        checkPage(50)
        drawRect(MARGIN, y, CONTENT_W, 7, [255, 245, 245])
        doc.setDrawColor(220, 50, 50)
        doc.setLineWidth(0.3)
        doc.roundedRect(MARGIN, y, CONTENT_W, 7, 2, 2, 'S')
        text('FACTORS HURTING YOUR SCORE', MARGIN + 4, y + 5, { size: 9, bold: true, color: [180, 30, 30] })
        addY(12)

        improvements.slice(0, 5).forEach((item, i) => {
            checkPage(18)
            drawRect(MARGIN, y, 6, 6, [239, 68, 68])
            text(`${i + 1}`, MARGIN + 3, y + 5, { size: 7, bold: true, color: [255, 255, 255], align: 'center' })
            text(item.factor || item.tip || '', MARGIN + 10, y + 5, { size: 9, bold: true, color: [150, 30, 30] })
            addY(7)
            if (item.tip && item.factor) {
                const tipLines = doc.splitTextToSize(item.tip, CONTENT_W - 14)
                tipLines.forEach(tl => {
                    checkPage(6)
                    text(tl, MARGIN + 10, y + 4, { size: 7.5, color: [120, 60, 60] })
                    addY(5)
                })
            }
            addY(4)
        })
    }

    // ── SECTION: BANK RECOMMENDATIONS ──
    if (bankRecs && bankRecs.length > 0) {
        checkPage(60)
        drawRect(MARGIN, y, CONTENT_W, 7, [235, 240, 255])
        text('TOP BANK RECOMMENDATIONS', MARGIN + 4, y + 5, { size: 9, bold: true, color: [50, 60, 180] })
        addY(12)

        bankRecs.slice(0, 4).forEach((bank, i) => {
            checkPage(22)
            const bColors = i === 0 ? [235, 250, 240] : [248, 248, 252]
            drawRect(MARGIN, y, CONTENT_W, 18, bColors)
            doc.setDrawColor(200, 210, 240)
            doc.setLineWidth(0.2)
            doc.roundedRect(MARGIN, y, CONTENT_W, 18, 2, 2, 'S')

            // Bank initial box
            drawRect(MARGIN + 4, y + 3, 12, 12, [99, 102, 241])
            text(bank.bank ? bank.bank.charAt(0) : 'B', MARGIN + 10, y + 11, { size: 9, bold: true, color: [255, 255, 255], align: 'center' })

            text(bank.bank || '', MARGIN + 20, y + 8, { size: 9, bold: true, color: [30, 30, 30] })
            text(bank.product || '', MARGIN + 20, y + 14, { size: 7.5, color: [100, 100, 100] })
            text(bank.rate || '', W - MARGIN - 4, y + 8, { size: 9, bold: true, color: [99, 102, 241], align: 'right' })
            text(`Up to ${bank.maxAmount || '–'}`, W - MARGIN - 4, y + 14, { size: 7.5, color: [100, 100, 100], align: 'right' })

            addY(22)
        })
    }

    // ── FOOTER ──
    const pagesCount = doc.getNumberOfPages()
    for (let p = 1; p <= pagesCount; p++) {
        doc.setPage(p)
        drawRect(0, 284, W, 13, [250, 246, 235])
        line(0, 284, W, [201, 168, 76])
        text('Veritas AI · Loan Intelligence Platform · veritas-com.vercel.app', W / 2, 291, { size: 7, color: [120, 100, 50], align: 'center' })
        text(`Page ${p} of ${pagesCount}`, W - MARGIN, 291, { size: 7, color: [150, 130, 80], align: 'right' })
        text('This report is indicative only. Actual approval depends on lender assessment.', MARGIN, 291, { size: 6.5, color: [160, 140, 100] })
    }

    const filename = `Veritas-${loanType === 'personal' ? 'Personal' : 'Business'}-Loan-Report-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
}
