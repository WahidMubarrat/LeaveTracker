/**
 * Holiday Extractor Utility
 * Uses regex patterns to extract public holiday information from text
 */

// Common date formats to match
const datePatterns = [
    // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
    // YYYY/MM/DD, YYYY-MM-DD
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
    // Month DD, YYYY or Month DDth, YYYY
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})/i,
    // DD Month YYYY
    /(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s*(\d{4})/i,
    // Short month formats: Jan 1, 2024
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})/i,
    // DD Mon YYYY
    /(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),?\s*(\d{4})/i,
    // Without year: DD Month or Month DD
    /(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)/i,
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
];

// Month name to number mapping
const monthMap = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

/**
 * Parse a date string into a Date object
 * Returns date string in YYYY-MM-DD format (local date, not UTC)
 * @param {string} dateStr - The date string to parse
 * @returns {string|null} - Date in YYYY-MM-DD format or null if invalid
 */
function parseDate(dateStr) {
    let day, month, year;

    // Try different patterns
    for (const pattern of datePatterns) {
        const match = dateStr.match(pattern);
        if (match) {
            // Check which pattern matched based on captured groups
            if (/^\d{4}$/.test(match[1])) {
                // YYYY-MM-DD format
                year = parseInt(match[1]);
                month = parseInt(match[2]);
                day = parseInt(match[3]);
            } else if (/^\d{1,2}$/.test(match[1]) && /^\d{1,2}$/.test(match[2])) {
                // DD-MM-YYYY format
                day = parseInt(match[1]);
                month = parseInt(match[2]);
                year = parseInt(match[3]);
            } else if (monthMap[match[1]?.toLowerCase()]) {
                // Month DD, YYYY format
                month = monthMap[match[1].toLowerCase()];
                day = parseInt(match[2]);
                year = parseInt(match[3]);
            } else if (monthMap[match[2]?.toLowerCase()]) {
                // DD Month YYYY format
                day = parseInt(match[1]);
                month = monthMap[match[2].toLowerCase()];
                year = parseInt(match[3]);
            }

            if (day && month && year) {
                // Validate date
                const date = new Date(year, month - 1, day);
                if (!isNaN(date.getTime()) && 
                    date.getFullYear() === year && 
                    date.getMonth() === month - 1 && 
                    date.getDate() === day) {
                    // Return formatted string instead of Date object to avoid timezone issues
                    const monthStr = month.toString().padStart(2, '0');
                    const dayStr = day.toString().padStart(2, '0');
                    return `${year}-${monthStr}-${dayStr}`;
                }
            }
        }
    }

    return null;
}

/**
 * Extract holidays from text content
 * @param {string} text - The text content to parse
 * @returns {Array} - Array of extracted holiday objects
 */
function extractHolidaysFromText(text) {
    const holidays = [];
    const lines = text.split(/\n/);
    const processedDates = new Set();

    // Try to extract year from document header (e.g., "HOLIDAYS 2026", "2026 Public Holidays")
    let defaultYear = new Date().getFullYear();
    const yearMatch = text.match(/\b(20\d{2})\b/);
    if (yearMatch) {
        defaultYear = parseInt(yearMatch[1]);
        console.log(`Detected year from document: ${defaultYear}`);
    }

    // Clean up text: remove OCR noise characters and normalize
    let cleanedText = text
        .replace(/[£€~«»©@]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[\u2010-\u2015\u2212]/g, '-'); // Normalize various dash types to hyphen

    console.log('Cleaned text preview:', cleanedText.substring(0, 300));

    // Multiple patterns to match different holiday formats
    const patterns = [
        // Pattern 1: "DD Month - Holiday Name" (most common)
        /(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*[-:]\s*([A-Za-z][A-Za-z\s'\-()&,]+?)(?=\s*\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)|\n|$)/gi,
        
        // Pattern 2: "DD/MM - Holiday Name" or "DD.MM - Holiday Name"
        /(\d{1,2})[\/\.](\d{1,2})\s*[-:]\s*([A-Za-z][A-Za-z\s'\-()&,]+?)(?=\s*\d{1,2}[\/\.]|\n|$)/gi,
        
        // Pattern 3: "Holiday Name - DD Month" (reverse format)
        /([A-Za-z][A-Za-z\s'\-()&,]{3,}?)\s*[-:]\s*(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/gi,
    ];

    // Try each pattern
    for (const pattern of patterns) {
        let match;
        pattern.lastIndex = 0; // Reset regex state
        
        while ((match = pattern.exec(cleanedText)) !== null) {
            let day, month, name;
            
            // Determine which pattern matched
            if (/^\d{1,2}$/.test(match[1]) && monthMap[match[2]?.toLowerCase()]) {
                // Pattern 1: DD Month - Name
                day = match[1];
                month = match[2];
                name = match[3];
            } else if (/^\d{1,2}$/.test(match[1]) && /^\d{1,2}$/.test(match[2])) {
                // Pattern 2: DD/MM - Name
                day = match[1];
                month = match[2];
                name = match[3];
            } else if (/^[A-Za-z]/.test(match[1]) && monthMap[match[3]?.toLowerCase()]) {
                // Pattern 3: Name - DD Month (reversed)
                name = match[1];
                day = match[2];
                month = match[3];
            } else {
                continue;
            }

            // Build date string with detected year
            const dateStr = `${day} ${month} ${defaultYear}`;
            const extractedDate = parseDate(dateStr);

            if (extractedDate) {
                // Clean up the holiday name
                let cleanedName = name
                    .replace(/^\s+|\s+$/g, '')
                    .replace(/^[-–—\|:,\.]+/, '')
                    .replace(/[-–—\|:,\.]+$/, '')
                    .replace(/^\d+[\.\)\s]+/, '')
                    .replace(/\s+/g, ' ')
                    .trim();

                // Filter: must have letters, at least 3 chars, not just numbers
                if (cleanedName.length >= 3 && /[a-zA-Z]{2,}/.test(cleanedName) && !/^\d+$/.test(cleanedName)) {
                    if (!processedDates.has(extractedDate)) {
                        processedDates.add(extractedDate);
                        console.log(`Extracted: ${cleanedName} on ${extractedDate}`);

                        holidays.push({
                            name: capitalizeWords(cleanedName.substring(0, 100)),
                            date: extractedDate,
                            numberOfDays: 1
                        });
                    }
                }
            }
        }
    }

    console.log(`Extracted ${holidays.length} holidays from patterns`);

    // Fallback: if no holidays found with patterns, try line-based extraction
    if (holidays.length === 0) {
        console.log('Pattern matching found 0 holidays, trying line-based extraction...');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.length < 5) continue;

            // Skip headers
            if (/^(date|holiday|name|serial|sl\.?no|no\.?|#|day|public|holidays?)/i.test(trimmedLine)) continue;
            if (/^[\d\s\.\-\/]+$/.test(trimmedLine)) continue;

            console.log('Processing line:', trimmedLine);

            // Try to find date in the line
            let foundHoliday = false;
            for (const pattern of datePatterns) {
                const match = trimmedLine.match(pattern);
                if (match) {
                    const fullMatch = match[0];
                    let extractedDate = parseDate(fullMatch);

                    if (!extractedDate) {
                        const dateWithYear = `${fullMatch} ${defaultYear}`;
                        extractedDate = parseDate(dateWithYear);
                    }

                    if (extractedDate) {
                        const remainingText = trimmedLine.replace(fullMatch, '').trim();
                        let cleanedName = remainingText
                            .replace(/^[\s\-–—\|:,\.]+/, '')
                            .replace(/[\s\-–—\|:,\.]+$/, '')
                            .replace(/^\d+[\.\)\s]+/, '')
                            .replace(/[£€~«»©@]/g, '')
                            .trim();

                        if (cleanedName.length >= 3 && /[a-zA-Z]{2,}/.test(cleanedName) && !/^\d+$/.test(cleanedName)) {
                            if (!processedDates.has(extractedDate)) {
                                processedDates.add(extractedDate);
                                console.log(`Line-based extraction: ${cleanedName} on ${extractedDate}`);
                                
                                holidays.push({
                                    name: capitalizeWords(cleanedName.substring(0, 100)),
                                    date: extractedDate,
                                    numberOfDays: 1
                                });
                                foundHoliday = true;
                            }
                        }
                        break;
                    }
                }
            }
            
            if (!foundHoliday) {
                console.log('No date pattern matched for line');
            }
        }
    }

    // Sort by date
    holidays.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(`Total holidays extracted: ${holidays.length}`);
    if (holidays.length > 0) {
        console.log('Sample holidays:', holidays.slice(0, 3));
    }

    return holidays;
}

/**
 * Capitalize first letter of each word
 * @param {string} str - The string to capitalize
 * @returns {string} - Capitalized string
 */
function capitalizeWords(str) {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Alternative extraction for table-like formats
 * @param {string} text - The text content to parse  
 * @returns {Array} - Array of extracted holiday objects
 */
function extractFromTableFormat(text) {
    const holidays = [];
    const lines = text.split(/\n/).filter(l => l.trim());
    const processedDates = new Set();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Look for lines that have both a date and potential holiday name
        // Try to find date in the line
        let foundDate = null;
        let dateMatch = null;

        for (const pattern of datePatterns) {
            const match = line.match(pattern);
            if (match) {
                dateMatch = match[0];
                foundDate = parseDate(dateMatch);
                if (foundDate) break;
            }
        }

        if (!foundDate) continue;

        // Extract potential name from the same line
        let potentialName = line.replace(dateMatch, '')
            .replace(/^[\s\d\.\)\-\|,;:]+/, '')
            .replace(/[\s\-\|,;:]+$/, '')
            .trim();

        // If name is too short, check adjacent lines
        if (potentialName.length < 3 || !/[a-zA-Z]{2,}/.test(potentialName)) {
            // Check previous line
            if (i > 0) {
                const prevLine = lines[i - 1].trim();
                if (prevLine.length > 3 && /[a-zA-Z]{3,}/.test(prevLine) && !datePatterns.some(p => p.test(prevLine))) {
                    potentialName = prevLine.replace(/^[\d\.\)\s]+/, '').trim();
                }
            }
            // Check next line
            if ((!potentialName || potentialName.length < 3) && i < lines.length - 1) {
                const nextLine = lines[i + 1].trim();
                if (nextLine.length > 3 && /[a-zA-Z]{3,}/.test(nextLine) && !datePatterns.some(p => p.test(nextLine))) {
                    potentialName = nextLine.replace(/^[\d\.\)\s]+/, '').trim();
                }
            }
        }

        // Validate and add
        if (potentialName && potentialName.length >= 3 && /[a-zA-Z]{3,}/.test(potentialName)) {
            const dateKey = foundDate.toISOString().split('T')[0];

            if (!processedDates.has(dateKey)) {
                processedDates.add(dateKey);
                holidays.push({
                    name: capitalizeWords(potentialName.substring(0, 100)),
                    date: dateKey,
                    numberOfDays: 1
                });
            }
        }
    }

    return holidays;
}

module.exports = {
    extractHolidaysFromText,
    extractFromTableFormat,
    parseDate
};
