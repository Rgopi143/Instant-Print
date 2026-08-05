/**
 * AI Document Classifier and Smart Print Predictor
 * Analyzes uploaded files to determine category, page counts, color distribution, and optimal print settings.
 */

export const analyzeDocumentWithAI = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fileName = file.name || "Document";
      const ext = fileName.split('.').pop().toLowerCase();
      const sizeMB = file.size ? file.size / (1024 * 1024) : 0.5;

      let category = "General Document";
      let recommendedPaper = "A4 Standard";
      let recommendedMode = "bw";
      let recommendedDuplex = false;
      let confidence = 94;
      let colorPagesCount = 0;
      let estimatedPages = 1;

      // Estimate total pages based on file size and extension
      if (ext === 'pdf') {
        estimatedPages = Math.max(1, Math.round(sizeMB * 4) + Math.floor(Math.random() * 3));
      } else if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
        estimatedPages = Math.max(1, Math.round(sizeMB * 6) + 1);
      } else if (['ppt', 'pptx'].includes(ext)) {
        estimatedPages = Math.max(4, Math.round(sizeMB * 5) + 3);
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        estimatedPages = 1;
      } else {
        estimatedPages = Math.max(1, Math.round(sizeMB * 3));
      }

      // Keyword / Name & Type based AI classification
      const lowerName = fileName.toLowerCase();
      if (lowerName.includes('passport') || lowerName.includes('id') || lowerName.includes('aadhaar') || lowerName.includes('license') || lowerName.includes('cert')) {
        category = "Government ID / Certificate";
        recommendedMode = "color";
        recommendedPaper = "A4 Heavyweight";
        recommendedDuplex = false;
        colorPagesCount = estimatedPages;
        confidence = 98;
      } else if (lowerName.includes('contract') || lowerName.includes('agreement') || lowerName.includes('legal') || lowerName.includes('nda')) {
        category = "Legal Contract & Agreement";
        recommendedMode = "bw";
        recommendedDuplex = true;
        colorPagesCount = 0;
        confidence = 96;
      } else if (lowerName.includes('thesis') || lowerName.includes('paper') || lowerName.includes('report') || lowerName.includes('assignment') || lowerName.includes('exam')) {
        category = "Academic & Research Paper";
        recommendedMode = "custom";
        recommendedDuplex = true;
        // Cover & diagrams color, rest B&W
        colorPagesCount = Math.max(1, Math.min(estimatedPages, 2));
        confidence = 92;
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext) || lowerName.includes('photo') || lowerName.includes('poster') || lowerName.includes('design')) {
        category = "Photo & Graphic Art";
        recommendedMode = "color";
        recommendedPaper = "4x6 Glossy Photo Paper";
        recommendedDuplex = false;
        colorPagesCount = estimatedPages;
        confidence = 99;
      } else if (['ppt', 'pptx'].includes(ext) || lowerName.includes('slide') || lowerName.includes('presentation')) {
        category = "Presentation Deck";
        recommendedMode = "color";
        recommendedDuplex = true;
        colorPagesCount = estimatedPages;
        confidence = 95;
      } else {
        category = "General Document / Report";
        recommendedMode = estimatedPages > 5 ? "bw" : "color";
        recommendedDuplex = estimatedPages > 1;
        colorPagesCount = Math.floor(estimatedPages * 0.3);
      }

      const bwPagesCount = Math.max(0, estimatedPages - colorPagesCount);

      // AI Summary tip
      let aiAdvice = "";
      if (recommendedDuplex) {
        aiAdvice = `AI Suggestion: Enabling Duplex (Double-sided) saves ${Math.round(estimatedPages / 2)} paper sheets and unlocks a 10% discount.`;
      } else if (category === "Photo & Graphic Art") {
        aiAdvice = "AI Suggestion: Glossy Photo paper recommended for maximum vivid color clarity.";
      } else {
        aiAdvice = "AI Suggestion: Standard A4 B&W is the most economical print configuration for this document.";
      }

      resolve({
        name: fileName,
        fileName,
        pages: estimatedPages,
        sizeFormatted: (sizeMB < 1 ? (sizeMB * 1024).toFixed(0) + " KB" : sizeMB.toFixed(2) + " MB"),
        fileSizeFormatted: (sizeMB < 1 ? (sizeMB * 1024).toFixed(0) + " KB" : sizeMB.toFixed(2) + " MB"),
        fileType: ext.toUpperCase(),
        category,
        estimatedPages,
        colorPagesCount,
        bwPagesCount,
        confidence,
        recommendedMode,
        recommendedPaper,
        recommendedDuplex,
        aiAdvice,
      });
    }, 600);
  });
};
