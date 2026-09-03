// pdfExport.js - PDF generation using html2canvas + jsPDF
import { getTranslation } from './i18n.js';

async function exportToPDF(canvasElement, filename = 'letter.pdf') {
    try {
        // Ensure canvas is rendered at current zoom? We need original A4 size.
        // Temporarily reset zoom to 1 for capture, then restore.
        const currentTransform = canvasElement.style.transform;
        canvasElement.style.transform = 'scale(1)';
        canvasElement.style.transformOrigin = 'top left';

        // Need to wait for fonts and layout
        await document.fonts.ready;

        const canvas = await html2canvas(canvasElement, {
            scale: 2, // high resolution
            useCORS: true,
            logging: false,
            windowWidth: canvasElement.scrollWidth,
            windowHeight: canvasElement.scrollHeight
        });

        // Restore zoom
        canvasElement.style.transform = currentTransform;

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);
        return true;
    } catch (error) {
        console.error('PDF export error:', error);
        throw error;
    }
}

export { exportToPDF };
