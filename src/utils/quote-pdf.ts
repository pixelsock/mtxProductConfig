import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from 'pdf-lib'

interface QuotePdfLineItem {
  sku: string
  description: string
  quantity: number
  details?: string[]
}

interface QuotePdfOptions {
  items: QuotePdfLineItem[]
  quoteNumber: string
  projectName?: string
  specifierInfo?: string
  preparedFor?: string
  generatedAt?: Date
  logoUrl?: string
}

const PAGE_WIDTH = 612 // Letter width (pt)
const PAGE_HEIGHT = 792 // Letter height (pt)
const PAGE_MARGIN = 40

const ADDRESS_LINES = ['Matrix Mirrors', '6464 Warren Drive', 'Norcross, GA 30093']

const NOTES = [
  'This quote is valid for 3 months following its creation.',
  'No returns on custom products or on quantities of more than five mirrors.',
  'Returns of up to five standard sized mirrors from a single order are acceptable with a 25% restocking fee and no refunds on shipping.',
  'Estimated ship dates (ESD) are subject to change.',
  'Concealed damage must be reported before installation and within 30 days of receiving.',
  'Visible damage must be reported to the carrier upon receipt.',
  'Customers are responsible for any tariffs incurred during shipping.',
  'Matrix Mirrors Warranty Statement covers parts, glass, and electrical components for five years from the date of purchase and drivers for seven years from the date of purchase.',
  'For the full Terms and Conditions and Warranty Statement, visit matrixmirrors.com or email admin@matrixmirrors.com.',
  'Residential dropship or limited access freight deliveries may incur additional shipping charges.',
  'Mirrors larger than 64" are not eligible for liftgate delivery.',
  'Please contact us if white glove delivery is needed.',
]

interface TableColumn {
  key: 'sku' | 'description' | 'quantity'
  label: string
  width: number
  align?: 'left' | 'right' | 'center'
}

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'sku', label: 'SKU', width: 150 },
  {
    key: 'description',
    label: 'Description',
    width: PAGE_WIDTH - PAGE_MARGIN * 2 - (150 + 80),
  },
  { key: 'quantity', label: 'Qty', width: 80, align: 'center' },
]

const LINE_HEIGHT = 14
const DETAIL_LINE_HEIGHT = 12
const ROW_PADDING = 6

export interface GeneratedQuotePdf {
  objectUrl: string
  cleanup: () => void
}

export async function generateQuotePdf({
  items,
  quoteNumber,
  projectName,
  specifierInfo,
  preparedFor,
  generatedAt = new Date(),
  logoUrl,
}: QuotePdfOptions): Promise<GeneratedQuotePdf> {
  if (!items.length) {
    throw new Error('At least one quote item is required to generate a PDF')
  }

  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let cursorY = PAGE_HEIGHT - PAGE_MARGIN

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const title = 'Custom Spec'
  const titleSize = 22
  const titleWidth = boldFont.widthOfTextAtSize(title, titleSize)

  // Header - title on the right
  page.drawText(title, {
    x: PAGE_WIDTH - PAGE_MARGIN - titleWidth,
    y: cursorY,
    font: boldFont,
    size: titleSize,
    color: rgb(0.15, 0.15, 0.15),
  })

  // Add logo in top-left corner, inline with title
  let logoHeight = 0
  if (logoUrl) {
    try {
      console.log('Fetching logo from:', logoUrl)
      const logoResponse = await fetch(logoUrl)

      if (!logoResponse.ok) {
        console.error('Failed to fetch logo:', logoResponse.status, logoResponse.statusText)
        throw new Error(`Failed to fetch logo: ${logoResponse.status}`)
      }

      const logoBytes = await logoResponse.arrayBuffer()
      console.log('Logo bytes length:', logoBytes.byteLength)

      // Detect image type from magic numbers (file signature)
      const byteArray = new Uint8Array(logoBytes)
      console.log('First 8 bytes:', Array.from(byteArray.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '))

      let logoImage

      // PNG signature: 89 50 4E 47 0D 0A 1A 0A
      if (byteArray[0] === 0x89 && byteArray[1] === 0x50 && byteArray[2] === 0x4E && byteArray[3] === 0x47) {
        console.log('Detected PNG format')
        logoImage = await pdfDoc.embedPng(logoBytes)
      }
      // JPEG signature: FF D8 FF
      else if (byteArray[0] === 0xFF && byteArray[1] === 0xD8 && byteArray[2] === 0xFF) {
        console.log('Detected JPEG format')
        logoImage = await pdfDoc.embedJpg(logoBytes)
      }
      // SVG signature: < or <?
      else if (byteArray[0] === 0x3C) {
        console.error('SVG format detected - not supported in PDF. Please use PNG or JPEG.')
        throw new Error('SVG format not supported. Please use PNG or JPEG logo.')
      }
      else {
        console.error('Unknown image format. First bytes:', Array.from(byteArray.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '))
        throw new Error('Unsupported image format. Please use PNG or JPEG.')
      }

      if (logoImage) {
        // Size logo to match title height
        const logoWidth = 100
        const aspectRatio = logoImage.height / logoImage.width
        logoHeight = logoWidth * aspectRatio

        console.log('Embedding logo:', { logoWidth, logoHeight, aspectRatio })

        // Position logo to align bottom with title baseline
        page.drawImage(logoImage, {
          x: PAGE_MARGIN,
          y: cursorY - logoHeight + (titleSize * 0.2),
          width: logoWidth,
          height: logoHeight,
        })
      }
    } catch (error) {
      console.error('Failed to embed logo in PDF:', error)
      // Continue without logo if it fails
    }
  }

  const headerBlockHeight = Math.max(titleSize + 20, logoHeight + 20)
  cursorY -= headerBlockHeight

  // Quote metadata (left column)
  const metadataLeft = [
    `Custom Spec #: ${quoteNumber}`,
    `Project: ${projectName || '—'}`,
    `Specifier & Location: ${specifierInfo || '—'}`,
  ]

  metadataLeft.forEach((line) => {
    page.drawText(line, {
      x: PAGE_MARGIN,
      y: cursorY,
      font: regularFont,
      size: 11,
      color: rgb(0.2, 0.2, 0.2),
    })
    cursorY -= 16
  })

  // Quote metadata (right column)
  const quoteDate = generatedAt
  const expiryDate = new Date(generatedAt)
  expiryDate.setDate(expiryDate.getDate() + 90)

  const metadataRight = [
    `Date Created: ${formatDate(quoteDate)}`,
    `Expiry Date: ${formatDate(expiryDate)}`,
    `Prepared For: ${preparedFor || '—'}`,
  ]

  let rightCursorY = PAGE_HEIGHT - PAGE_MARGIN - 24

  metadataRight.forEach((line) => {
    const textWidth = regularFont.widthOfTextAtSize(line, 11)
    page.drawText(line, {
      x: PAGE_WIDTH - PAGE_MARGIN - textWidth,
      y: rightCursorY,
      font: regularFont,
      size: 11,
      color: rgb(0.2, 0.2, 0.2),
    })
    rightCursorY -= 16
  })

  cursorY = Math.min(cursorY, rightCursorY) - 12

  page.drawLine({
    start: { x: PAGE_MARGIN, y: cursorY },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y: cursorY },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  })

  cursorY -= 24

  const addPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    cursorY = PAGE_HEIGHT - PAGE_MARGIN
  }

  const drawTableHeader = () => {
    if (cursorY - (LINE_HEIGHT + ROW_PADDING * 2) < PAGE_MARGIN) {
      addPage()
    }

    const headerTop = cursorY
    page.drawRectangle({
      x: PAGE_MARGIN,
      y: headerTop - (LINE_HEIGHT + ROW_PADDING * 2),
      width: PAGE_WIDTH - PAGE_MARGIN * 2,
      height: LINE_HEIGHT + ROW_PADDING * 2,
      color: rgb(0.92, 0.94, 0.98),
    })

    let columnX = PAGE_MARGIN

    TABLE_COLUMNS.forEach((column) => {
      const textY = headerTop - ROW_PADDING - 10
      const labelWidth = boldFont.widthOfTextAtSize(column.label, 10)
      let textX = columnX + ROW_PADDING

      if (column.align === 'right') {
        textX = columnX + column.width - ROW_PADDING - labelWidth
      } else if (column.align === 'center') {
        textX = columnX + column.width / 2 - labelWidth / 2
      }

      page.drawText(column.label, {
        x: textX,
        y: textY,
        font: boldFont,
        size: 10,
        color: rgb(0.16, 0.16, 0.16),
      })
      columnX += column.width
    })

    cursorY -= LINE_HEIGHT + ROW_PADDING * 2

    page.drawLine({
      start: { x: PAGE_MARGIN, y: cursorY },
      end: { x: PAGE_WIDTH - PAGE_MARGIN, y: cursorY },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })
  }

  drawTableHeader()

  items.forEach((item, index) => {
    const skuLines = wrapTextWithFont(item.sku || '—', boldFont, 10, TABLE_COLUMNS[0].width - ROW_PADDING * 2)
    const descriptionLines = wrapTextWithFont(
      item.description || '—',
      regularFont,
      10,
      TABLE_COLUMNS[1].width - ROW_PADDING * 2,
    )
    const quantityLines = wrapTextWithFont(
      String(item.quantity ?? 1),
      boldFont,
      10,
      TABLE_COLUMNS[2].width - ROW_PADDING * 2,
    )
    const detailsValue = (item.details || []).filter(Boolean).join(' | ')
    const detailsLines = detailsValue
      ? wrapTextWithFont(
          detailsValue,
          regularFont,
          9,
          TABLE_COLUMNS[1].width + TABLE_COLUMNS[2].width - ROW_PADDING * 2,
        )
      : []

    const primaryLineCount = Math.max(skuLines.length, descriptionLines.length, quantityLines.length, 1)
    const primaryHeight = primaryLineCount * LINE_HEIGHT
    const detailsHeight = detailsLines.length ? detailsLines.length * DETAIL_LINE_HEIGHT + 6 : 0
    const rowHeight = primaryHeight + detailsHeight + ROW_PADDING * 2

    if (cursorY - rowHeight < PAGE_MARGIN) {
      addPage()
      drawTableHeader()
    }

    const rowTop = cursorY
    const shaded = index % 2 === 0
    if (shaded) {
      page.drawRectangle({
        x: PAGE_MARGIN,
        y: rowTop - rowHeight,
        width: PAGE_WIDTH - PAGE_MARGIN * 2,
        height: rowHeight,
        color: rgb(0.97, 0.97, 0.985),
      })
    }

    let columnX = PAGE_MARGIN

    drawCellText({
      page,
      font: boldFont,
      fontSize: 10,
      lines: skuLines,
      columnX,
      columnWidth: TABLE_COLUMNS[0].width,
      top: rowTop,
      align: 'left',
    })
    columnX += TABLE_COLUMNS[0].width

    drawCellText({
      page,
      font: regularFont,
      fontSize: 10,
      lines: descriptionLines,
      columnX,
      columnWidth: TABLE_COLUMNS[1].width,
      top: rowTop,
      align: 'left',
    })
    columnX += TABLE_COLUMNS[1].width

    drawCellText({
      page,
      font: boldFont,
      fontSize: 10,
      lines: quantityLines,
      columnX,
      columnWidth: TABLE_COLUMNS[2].width,
      top: rowTop,
      align: 'center',
    })

    if (detailsLines.length) {
      const detailsStartX = PAGE_MARGIN + TABLE_COLUMNS[0].width + ROW_PADDING
      let detailY = rowTop - ROW_PADDING - primaryHeight - 6

      detailsLines.forEach((line) => {
        page.drawText(line, {
          x: detailsStartX,
          y: detailY,
          font: regularFont,
          size: 9,
          color: rgb(0.32, 0.32, 0.35),
        })
        detailY -= DETAIL_LINE_HEIGHT
      })
    }

    cursorY -= rowHeight

    page.drawLine({
      start: { x: PAGE_MARGIN, y: cursorY },
      end: { x: PAGE_WIDTH - PAGE_MARGIN, y: cursorY },
      thickness: 0.4,
      color: rgb(0.85, 0.85, 0.85),
    })
  })

  cursorY -= 24

  const totalUnits = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)

  if (cursorY - 48 < PAGE_MARGIN) {
    addPage()
  }

  cursorY = drawSummaryLines({
    page,
    cursorY,
    boldFont,
    totalItems: items.length,
    totalUnits,
  })

  cursorY -= 10

  cursorY = drawNotes({
    page,
    cursorY,
    regularFont,
    addPage,
  })

  // Add footer to all pages
  const pages = pdfDoc.getPages()
  pages.forEach((p) => {
    drawFooter(p, regularFont, boldFont)
  })

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const objectUrl = URL.createObjectURL(blob)

  const cleanup = () => {
    URL.revokeObjectURL(objectUrl)
  }

  return {
    objectUrl,
    cleanup,
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface DrawCellTextOptions {
  page: PDFPage
  font: PDFFont
  fontSize: number
  lines: string[]
  columnX: number
  columnWidth: number
  top: number
  align: 'left' | 'right' | 'center'
}

function drawCellText({
  page,
  font,
  fontSize,
  lines,
  columnX,
  columnWidth,
  top,
  align,
}: DrawCellTextOptions): void {
  const safeLines = lines.length ? lines : ['—']
  let textY = top - ROW_PADDING - fontSize

  safeLines.forEach((line) => {
    const textWidth = font.widthOfTextAtSize(line, fontSize)
    let textX = columnX + ROW_PADDING

    if (align === 'right') {
      textX = columnX + columnWidth - ROW_PADDING - textWidth
    } else if (align === 'center') {
      textX = columnX + columnWidth / 2 - textWidth / 2
    }

    page.drawText(line, {
      x: textX,
      y: textY,
      font,
      size: fontSize,
      color: rgb(0.18, 0.18, 0.18),
    })

    textY -= LINE_HEIGHT
  })
}

function wrapTextWithFont(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  if (!text) return ['']

  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      currentLine = candidate
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }

      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        const segments = splitLongWordWithFont(word, font, fontSize, maxWidth)
        segments.slice(0, -1).forEach((segment) => lines.push(segment))
        currentLine = segments[segments.length - 1] || ''
      } else {
        currentLine = word
      }
    }
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.length ? lines : ['']
}

function splitLongWordWithFont(word: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const segments: string[] = []
  let buffer = ''

  for (const char of word) {
    const test = buffer + char
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
      buffer = test
    } else {
      if (buffer) {
        segments.push(buffer)
      }
      if (font.widthOfTextAtSize(char, fontSize) > maxWidth) {
        segments.push(char)
        buffer = ''
      } else {
        buffer = char
      }
    }
  }

  if (buffer) {
    segments.push(buffer)
  }

  return segments.length ? segments : [word]
}

interface DrawSummaryOptions {
  page: PDFPage
  cursorY: number
  boldFont: PDFFont
  totalItems: number
  totalUnits: number
}

function drawSummaryLines({
  page,
  cursorY,
  boldFont,
  totalItems,
  totalUnits,
}: DrawSummaryOptions): number {
  const lines = [
    `Total Configurations: ${totalItems}`,
    `Total Units: ${totalUnits}`,
  ]

  lines.forEach((line) => {
    page.drawText(line, {
      x: PAGE_MARGIN,
      y: cursorY,
      font: boldFont,
      size: 11,
      color: rgb(0.16, 0.16, 0.16),
    })
    cursorY -= 16
  })

  return cursorY
}

interface DrawNotesOptions {
  page: PDFPage
  cursorY: number
  regularFont: PDFFont
  addPage: () => void
}

function drawNotes({ page, cursorY, regularFont, addPage }: DrawNotesOptions): number {
  const contentWidth = PAGE_WIDTH - PAGE_MARGIN * 2

  NOTES.forEach((note) => {
    const lines = wrapTextWithFont(note, regularFont, 9, contentWidth - 16)

    lines.forEach((line, index) => {
      if (cursorY - LINE_HEIGHT < PAGE_MARGIN) {
        addPage()
        cursorY = PAGE_HEIGHT - PAGE_MARGIN
      }

      page.drawText(`${index === 0 ? '- ' : '  '}${line}`, {
        x: PAGE_MARGIN,
        y: cursorY,
        font: regularFont,
        size: 9,
        color: rgb(0.28, 0.28, 0.28),
      })

      cursorY -= LINE_HEIGHT
    })

    cursorY -= 2
  })

  return cursorY
}

function drawFooter(page: PDFPage, regularFont: PDFFont, boldFont: PDFFont): void {
  // Footer text as single line: "Matrix Mirrors | 6464 Warren Drive, Norcross, GA 30093"
  const footerText = 'Matrix Mirrors | 6464 Warren Drive, Norcross, GA 30093'
  const footerSize = 9
  const footerWidth = regularFont.widthOfTextAtSize(footerText, footerSize)

  // Center the footer at the bottom of the page
  page.drawText(footerText, {
    x: (PAGE_WIDTH - footerWidth) / 2,
    y: PAGE_MARGIN / 2,
    font: regularFont,
    size: footerSize,
    color: rgb(0.4, 0.4, 0.4),
  })
}
