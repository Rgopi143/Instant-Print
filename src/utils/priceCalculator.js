/**
 * Instant Print Price Calculation Engine (INR Currency)
 */

export const PRICING_RATES = {
  BW_PER_PAGE: 2.00,        // ₹2.00 per page
  COLOR_PER_PAGE: 6.00,     // ₹6.00 per page
  PAPER_SURCHARGE: {
    "A4 Standard": 0.00,
    "A3 Large": 5.00,       // +₹5.00 / pg
    "4x6 Glossy Photo": 10.00, // +₹10.00 / pg
  },
  DUPLEX_DISCOUNT: 0.10,   // 10% discount on duplex
  TAX_RATE: 0.05,          // 5% tax
};

/**
 * Parse page range string (e.g., "1-3, 5, 8-10") and return total pages and list of page numbers
 */
export const parsePageRanges = (rangeStr, totalDocPages) => {
  if (!rangeStr || rangeStr.trim().toLowerCase() === 'all') {
    return Array.from({ length: totalDocPages }, (_, i) => i + 1);
  }

  const pages = new Set();
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalDocPages, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          pages.add(p);
        }
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p >= 1 && p <= totalDocPages) {
        pages.add(p);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
};

export const calculatePrintPrice = ({
  totalPages = 1,
  colorMode = "color", // "color", "bw", "custom"
  customColorPages = "", // range string for color pages when in custom mode
  paperSize = "A4 Standard",
  isDuplex = false,
  copies = 1,
}) => {
  let activePagesCount = totalPages;
  let colorPages = 0;
  let bwPages = 0;

  if (colorMode === "color") {
    colorPages = totalPages;
    bwPages = 0;
  } else if (colorMode === "bw") {
    colorPages = 0;
    bwPages = totalPages;
  } else if (colorMode === "custom") {
    const selectedColorPageNums = parsePageRanges(customColorPages, totalPages);
    colorPages = selectedColorPageNums.length;
    bwPages = Math.max(0, totalPages - colorPages);
  }

  const colorSubtotal = colorPages * PRICING_RATES.COLOR_PER_PAGE;
  const bwSubtotal = bwPages * PRICING_RATES.BW_PER_PAGE;
  const printBaseSubtotal = (colorSubtotal + bwSubtotal);

  const paperSurchargeRate = PRICING_RATES.PAPER_SURCHARGE[paperSize] || 0;
  const paperSurchargeTotal = activePagesCount * paperSurchargeRate;

  let pageSubtotal = printBaseSubtotal + paperSurchargeTotal;

  // Duplex discount applies to paper / print subtotal
  const duplexSavings = isDuplex ? (pageSubtotal * PRICING_RATES.DUPLEX_DISCOUNT) : 0;
  const subtotalAfterSavings = (pageSubtotal - duplexSavings) * copies;

  const tax = subtotalAfterSavings * PRICING_RATES.TAX_RATE;
  const finalTotal = subtotalAfterSavings + tax;

  return {
    totalPages: activePagesCount,
    colorPages,
    bwPages,
    colorSubtotal: (colorSubtotal * copies).toFixed(2),
    bwSubtotal: (bwSubtotal * copies).toFixed(2),
    paperSurchargeTotal: (paperSurchargeTotal * copies).toFixed(2),
    duplexSavings: (duplexSavings * copies).toFixed(2),
    copies,
    subtotal: subtotalAfterSavings.toFixed(2),
    tax: tax.toFixed(2),
    total: finalTotal.toFixed(2),
    currency: "₹",
  };
};
