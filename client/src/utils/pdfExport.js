import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export a section to PDF
 * @param {string} sectionId - The ID of the DOM element to export
 * @param {string} fileName - The name for the PDF file
 * @param {object} metadata - Optional metadata (period, date, department, etc.)
 */
export const exportSectionToPDF = async (sectionId, fileName, metadata = {}) => {
    try {
        const element = document.getElementById(sectionId);
        
        if (!element) {
            console.error(`Element with ID "${sectionId}" not found`);
            alert(`Section not found. Please try again.`);
            return;
        }

        // Show loading indicator
        const originalCursor = document.body.style.cursor;
        document.body.style.cursor = 'wait';

        // Wait a bit for any animations/charts to settle
        await new Promise(resolve => setTimeout(resolve, 300));

        // Capture the element as canvas with enhanced options
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
            onclone: (clonedDoc) => {
                // Ensure all charts are visible in the clone
                const clonedElement = clonedDoc.getElementById(sectionId);
                if (clonedElement) {
                    clonedElement.style.display = 'block';
                }
            }
        });

        // Validate canvas
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            throw new Error('Canvas capture failed - invalid dimensions');
        }

        // Convert to data URL with error handling
        let imgData;
        try {
            imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG for better compatibility
        } catch (e) {
            console.error('toDataURL failed:', e);
            throw new Error('Failed to convert canvas to image');
        }

        // Validate data URL
        if (!imgData || imgData === 'data:,' || imgData.length < 100) {
            throw new Error('Invalid image data generated');
        }

        // Get canvas dimensions
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Add metadata header if provided
        let yPos = 10;
        if (metadata && Object.keys(metadata).length > 0) {
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            
            if (metadata.title) {
                pdf.setFontSize(14);
                pdf.setTextColor(0);
                pdf.text(metadata.title, 10, yPos);
                yPos += 8;
            }
            
            pdf.setFontSize(9);
            pdf.setTextColor(100);
            
            if (metadata.period) {
                pdf.text(`Period: ${metadata.period}`, 10, yPos);
                yPos += 5;
            }
            if (metadata.date) {
                pdf.text(`Date: ${metadata.date}`, 10, yPos);
                yPos += 5;
            }
            if (metadata.department) {
                pdf.text(`Department: ${metadata.department}`, 10, yPos);
                yPos += 5;
            }
            
            yPos += 5; // Extra spacing before content
        }

        // Add the canvas image
        let heightLeft = imgHeight;
        let position = yPos;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - position);

        // Add new pages if content is longer than one page
        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Save the PDF
        pdf.save(`${fileName}.pdf`);

        // Restore cursor
        document.body.style.cursor = originalCursor;

    } catch (error) {
        console.error('Error generating PDF:', error);
        document.body.style.cursor = 'default';
        alert(`Failed to generate PDF: ${error.message || 'Unknown error'}. Please try again.`);
    }
};

/**
 * Generate a filename based on metadata
 * @param {string} section - Section name
 * @param {object} metadata - Metadata object
 * @returns {string} - Generated filename
 */
export const generateFileName = (section, metadata = {}) => {
    const parts = [];
    
    if (metadata.department && metadata.department !== 'all') {
        parts.push(metadata.department.replace(/\s+/g, '_'));
    }
    
    parts.push(section.replace(/\s+/g, '_'));
    
    if (metadata.period) {
        parts.push(metadata.period);
    }
    
    if (metadata.date) {
        parts.push(metadata.date.replace(/\s+/g, '_'));
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    parts.push(timestamp);
    
    return parts.join('_');
};
