import jsPDF from 'jspdf'
import { SaleEntry, FlatLogItem } from '../types'
import { parseCurrency, formatDate } from '../utils/format'
import {
  LIGHT, MID, WHITE,
  A4_W, A4_H, MARGIN, CONTENT_W, CARD_H,
  drawA4Header, drawA4EntryCard, drawA4TotalBlock, drawA4Footer,
  drawTableHeader, drawTableRow,
} from './pdfDrawing'

// ── Report PDF (card layout) ────────────────────────────────────────
export function buildReportPDF(reportTitle: string, entries: SaleEntry[]): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const generatedDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  drawA4Header(
    doc,
    reportTitle || 'Sales Report',
    `Generated: ${generatedDate}`,
    `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}  ·  Official Sales Record`
  )

  const totalPages = Math.ceil((entries.length * (CARD_H + 14) + 200) / (A4_H - 200)) || 1
  let y    = 134
  let page = 1

  entries.forEach((entry, i) => {
    if (y + CARD_H + 100 > A4_H - 40 && i > 0) {
      drawA4Footer(doc, page, totalPages)
      doc.addPage('a4', 'portrait')
      page++
      doc.setFillColor(...LIGHT)
      doc.rect(0, 0, A4_W, A4_H, 'F')
      y = 50
    }
    drawA4EntryCard(doc, entry, i, y)
    y += CARD_H + 14
  })

  if (y + 100 > A4_H - 40) {
    drawA4Footer(doc, page, totalPages)
    doc.addPage('a4', 'portrait')
    page++
    doc.setFillColor(...LIGHT)
    doc.rect(0, 0, A4_W, A4_H, 'F')
    y = 50
  }

  const total = entries.reduce((s, e) => s + parseCurrency(e.amount), 0)
  drawA4TotalBlock(doc, total, entries.length, y + 10)
  drawA4Footer(doc, page, page)

  return doc
}

// ── Log Export PDF (table layout) ──────────────────────────────────
export function buildLogExportPDF(
  allEntries: FlatLogItem[],
  filterDate: string,
  filterLabel = ''
): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })

  const GREY:  [number,number,number] = [100, 100, 100]
  const FAINT: [number,number,number] = [200, 200, 200]
  const BLACK: [number,number,number] = [20,  20,  20]
  const GREEN: [number,number,number] = [30,  140, 60]

  const generatedDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const now = new Date()
  const periodLabel = filterDate
    ? formatDate(filterDate)
    : now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  const grandTotal = allEntries.reduce((s, e) => s + parseCurrency(e.amount), 0)

  const COL = {
    date:   { x: MARGIN,        w: 90  },
    label:  { x: MARGIN + 90,   w: 145 },
    type:   { x: MARGIN + 235,  w: 75  },
    note:   { x: MARGIN + 310,  w: 110 },
    amount: { x: MARGIN + 420,  w: 75  },
  }
  const TABLE_W     = CONTENT_W
  const ROW_H       = 36
  const HEADER_H    = 30
  const PAGE_BOTTOM = A4_H - 50

  let page = 1
  let y    = MARGIN

  // ── Page header block ──────────────────────────────────────
  const startPage = () => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.setTextColor(...BLACK)
    doc.text('Sales Log', MARGIN, y + 24)
    y += 38

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...GREY)
    const filterDesc = [
      filterDate  ? `Date: ${formatDate(filterDate)}` : 'All Dates',
      filterLabel ? `Name: "${filterLabel}"` : 'All Entries',
    ].join('  ·  ')
    doc.text(
      `Activity Log  ·  Generated: ${generatedDate}  ·  Period: ${periodLabel}  ·  Filter: ${filterDesc}  ·  ${allEntries.length} records`,
      MARGIN, y + 2
    )
    y += 16

    // Rule 1
    doc.setDrawColor(...FAINT)
    doc.setLineWidth(0.5)
    doc.line(MARGIN, y, MARGIN + TABLE_W, y)
    y += 14

    // TOTAL EARNED block
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GREY)
    doc.text('TOTAL EARNED', MARGIN, y)
    y += 25
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(...BLACK)
    doc.text('P' + grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 }), MARGIN, y)
    y += 10  // ← spacing after total amount

    // Rule 2 before table
    doc.setDrawColor(...FAINT)
    doc.setLineWidth(0.5)
    doc.line(MARGIN, y, MARGIN + TABLE_W, y)
    y += 12
  }

  // ── Total row ──────────────────────────────────────────────
  const drawTotalRow = () => {
    doc.setFillColor(245, 247, 245)
    doc.rect(MARGIN, y, TABLE_W, ROW_H, 'F')

    doc.setDrawColor(...FAINT)
    doc.setLineWidth(0.5)
    doc.line(MARGIN, y, MARGIN + TABLE_W, y)
    doc.line(MARGIN, y + ROW_H, MARGIN + TABLE_W, y + ROW_H)

    const textY = y + ROW_H / 2 + 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...BLACK)
    doc.text('Total', COL.note.x + 6, textY)

    doc.setTextColor(...GREEN)
    doc.text(
      'P' + grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 }),
      COL.amount.x + COL.amount.w - 6, textY, { align: 'right' }
    )
  }

  // ── Footer ────────────────────────────────────────────────
  const drawFooter = (pageNum: number, totalPg: number) => {
    const fy = A4_H - 28
    doc.setDrawColor(...FAINT)
    doc.setLineWidth(0.4)
    doc.line(MARGIN, fy - 8, MARGIN + TABLE_W, fy - 8)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GREY)
    doc.text('Sales Log — Confidential', MARGIN, fy)
    doc.text(`Page ${pageNum} of ${totalPg}`, MARGIN + TABLE_W, fy, { align: 'right' })
  }

  // ── Estimate total pages ──────────────────────────────────
  const headerBlockH  = 38 + 16 + 14 + 26 + 12
  const firstPageRows = Math.floor((PAGE_BOTTOM - MARGIN - headerBlockH - HEADER_H - ROW_H) / ROW_H)
  const remainRows    = Math.floor((PAGE_BOTTOM - MARGIN - HEADER_H - ROW_H) / ROW_H)
  let totalPages = 1
  if (allEntries.length > firstPageRows) {
    totalPages += Math.ceil((allEntries.length - firstPageRows) / remainRows)
  }

  // ── Render ────────────────────────────────────────────────
  startPage()
  y = drawTableHeader(doc, y, COL, TABLE_W, HEADER_H)

  allEntries.forEach((entry, i) => {
    if (y + ROW_H + ROW_H + 40 > PAGE_BOTTOM) {
      drawFooter(page, totalPages)
      doc.addPage('a4', 'portrait')
      page++
      y = MARGIN + 20
      y = drawTableHeader(doc, y, COL, TABLE_W, HEADER_H)
    }
    y = drawTableRow(doc, entry, i, y, COL, TABLE_W, ROW_H)
  })

  if (y + ROW_H + 40 > PAGE_BOTTOM) {
    drawFooter(page, totalPages)
    doc.addPage('a4', 'portrait')
    page++
    y = MARGIN + 20
  }
  drawTotalRow()

  drawFooter(page, page)

  return doc
}