import jsPDF from 'jspdf'
import { SaleEntry, FlatLogItem } from '../types'
import { parseCurrency, formatDate, formatDateShort } from '../utils/format'

export type RGB = [number, number, number]

export const ACCENT: RGB = [30, 80, 60]
export const LIGHT: RGB  = [245, 248, 245]
export const MID: RGB    = [110, 145, 125]
export const WHITE: RGB  = [255, 255, 255]

export const A4_W     = 595.28
export const A4_H     = 841.89
export const MARGIN   = 50
export const CONTENT_W = A4_W - MARGIN * 2
export const CARD_H   = 88
export const CARD_RADIUS = 6

export function drawA4Header(doc: jsPDF, title: string, subtitle: string, note: string): void {
  doc.setFillColor(...ACCENT)
  doc.rect(0, 0, A4_W, 110, 'F')

  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(title, MARGIN, 48)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(180, 220, 200)
  doc.text(subtitle, MARGIN, 68)

  doc.setFontSize(8.5)
  doc.setTextColor(130, 190, 160)
  doc.text(note, MARGIN, 85)

  doc.setDrawColor(60, 110, 85)
  doc.setLineWidth(0.75)
  doc.line(MARGIN, 118, A4_W - MARGIN, 118)
}

export function drawA4EntryCard(doc: jsPDF, entry: SaleEntry, index: number, y: number): void {
  const amt    = parseCurrency(entry.amount)
  const amtStr = 'P' + amt.toLocaleString('en-PH', { minimumFractionDigits: 2 })
  const x      = MARGIN

  doc.setFillColor(210, 225, 215)
  doc.roundedRect(x + 2, y - 4, CONTENT_W, CARD_H, CARD_RADIUS, CARD_RADIUS, 'F')

  doc.setFillColor(...WHITE)
  doc.roundedRect(x, y - 6, CONTENT_W, CARD_H, CARD_RADIUS, CARD_RADIUS, 'F')

  doc.setFillColor(...ACCENT)
  doc.roundedRect(x, y - 6, 5, CARD_H, CARD_RADIUS, CARD_RADIUS, 'F')

  doc.setFillColor(...ACCENT)
  doc.circle(x + 24, y + 16, 12, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(String(index + 1), x + 24, y + 21, { align: 'center' })

  doc.setTextColor(...ACCENT)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text((entry.label || `Sale Entry ${index + 1}`).substring(0, 40), x + 44, y + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MID)
  doc.text('Date:  ' + formatDate(entry.date), x + 44, y + 26)

  doc.setDrawColor(225, 238, 230)
  doc.setLineWidth(0.5)
  doc.line(x + 14, y + 40, x + CONTENT_W - 14, y + 40)

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(170, 195, 178)
  doc.text('Recorded sales entry', x + 44, y + 56)

  doc.setFillColor(230, 248, 238)
  doc.roundedRect(x + 44, y + 62, 72, 14, 3, 3, 'F')
  doc.setTextColor(40, 130, 80)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('CONFIRMED', x + 80, y + 72, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(...ACCENT)
  doc.text(amtStr, x + CONTENT_W - 12, y + 30, { align: 'right' })
}

export function drawA4TotalBlock(doc: jsPDF, total: number, count: number, y: number): void {
  const x = MARGIN

  doc.setDrawColor(...MID)
  doc.setLineWidth(0.75)
  doc.line(x, y, x + CONTENT_W, y)
  y += 16

  doc.setFillColor(...ACCENT)
  doc.roundedRect(x, y, CONTENT_W, 64, 8, 8, 'F')

  doc.setTextColor(145, 200, 165)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('TOTAL SALES', x + 18, y + 20)

  doc.setTextColor(170, 220, 190)
  doc.setFontSize(9)
  doc.text(`${count} ${count === 1 ? 'entry' : 'entries'} combined`, x + 18, y + 36)

  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.text(
    'P' + total.toLocaleString('en-PH', { minimumFractionDigits: 2 }),
    x + CONTENT_W - 12, y + 44, { align: 'right' }
  )
}

export function drawA4Footer(doc: jsPDF, pageNum: number, totalPages: number): void {
  const y = A4_H - 28
  doc.setDrawColor(210, 225, 215)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y - 8, A4_W - MARGIN, y - 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...MID)
  doc.text('This document is computer-generated and is for reference purposes only.', MARGIN, y)
  doc.text(`Page ${pageNum} of ${totalPages}`, A4_W - MARGIN, y, { align: 'right' })
}

export function drawTableHeader(doc: jsPDF, y: number, COL: Record<string, { x: number; w: number }>, TABLE_W: number, HEADER_H: number): number {
  const FAINT: RGB = [200, 200, 200]
  const GREY:  RGB = [100, 100, 100]

  doc.setFillColor(250, 252, 250)
  doc.rect(MARGIN, y, TABLE_W, HEADER_H, 'F')

  doc.setDrawColor(...FAINT)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y, MARGIN + TABLE_W, y)
  doc.line(MARGIN, y + HEADER_H, MARGIN + TABLE_W, y + HEADER_H)

  const labelY = y + HEADER_H / 2 + 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...GREY)

  doc.text('#',      COL.seq.x + 6,    labelY)
  doc.text('Date',   COL.date.x + 6,   labelY)
  doc.text('Label',  COL.label.x + 6,  labelY)
  doc.text('Type',   COL.type.x + 6,   labelY)
  doc.text('Note',   COL.note.x + 6,   labelY)
  doc.text('Amount', COL.amount.x + COL.amount.w - 6, labelY, { align: 'right' })

  return y + HEADER_H
}

export function drawTableRow(
  doc: jsPDF,
  entry: FlatLogItem,
  rowIndex: number,
  y: number,
  COL: Record<string, { x: number; w: number }>,
  TABLE_W: number,
  ROW_H: number
): number {
  const FAINT: RGB = [200, 200, 200]
  const BLACK: RGB = [20, 20, 20]
  const GREY:  RGB = [100, 100, 100]
  const GREEN: RGB = [30, 140, 60]
  const BGROW: RGB = [248, 250, 248]

  if (rowIndex % 2 === 0) {
    doc.setFillColor(...BGROW)
    doc.rect(MARGIN, y, TABLE_W, ROW_H, 'F')
  }

  doc.setDrawColor(...FAINT)
  doc.setLineWidth(0.4)
  doc.line(MARGIN, y + ROW_H, MARGIN + TABLE_W, y + ROW_H)

  const textY = y + ROW_H / 2 + 4

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.text(String(rowIndex + 1), COL.seq.x + 6, textY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text(formatDateShort(entry.date), COL.date.x + 6, textY)
  doc.text((entry.label || 'Sale Entry').substring(0, 22), COL.label.x + 6, textY)

  doc.setTextColor(...GREY)
  doc.text('SALE', COL.type.x + 6, textY)
  doc.text((entry.reportTitle || '—').substring(0, 16), COL.note.x + 6, textY)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GREEN)
  doc.text(
    'P' + parseCurrency(entry.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }),
    COL.amount.x + COL.amount.w - 6, textY, { align: 'right' }
  )

  return y + ROW_H
}
