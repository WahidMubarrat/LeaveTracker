const { PDFParse } = require('pdf-parse');
const multer = require('multer');
const { extractHolidaysFromText, extractFromTableFormat } = require('../utils/holidayExtractor');
const Vacation = require('../models/Vacation');

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
}).single('holidayFile');

/**
 * Extract text from PDF
 */
async function extractTextFromPDF(buffer) {
    try {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        return result.text;
    } catch (error) {
        console.error('PDF Parse Error:', error);
        throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.');
    }
}

/**
 * Upload and extract holidays from file
 * POST /api/vacations/upload
 */
exports.uploadAndExtractHolidays = (req, res) => {
    upload(req, res, async (err) => {
        try {
            // Check for multer errors
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
                }
                return res.status(400).json({ message: `Upload error: ${err.message}` });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }

            // Check if file exists
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Verify requester is HR
            if (!req.user || !req.user.roles || !req.user.roles.includes('HR')) {
                return res.status(403).json({ message: 'Only HR can upload holiday files' });
            }

            const { buffer } = req.file;

            console.log('Processing file:', req.file.originalname);

            // Extract text from PDF
            const extractedText = await extractTextFromPDF(buffer);
            
            // Check if PDF has extractable text
            if (extractedText.trim().length < 50) {
                return res.status(400).json({
                    message: 'This PDF appears to be a scanned document with no text layer. Please use a PDF with selectable text or re-export your document with OCR enabled.',
                    rawText: extractedText,
                    holidays: []
                });
            }

            console.log('Extracted text length:', extractedText.length);
            console.log('Extracted text preview:', extractedText.substring(0, 500));

            // Extract holidays from text using regex
            let holidays = extractHolidaysFromText(extractedText);

            // If no holidays found with primary method, try table format extraction
            if (holidays.length === 0) {
                holidays = extractFromTableFormat(extractedText);
            }

            console.log('Extracted holidays count:', holidays.length);

            if (holidays.length === 0) {
                return res.status(200).json({
                    message: 'No holidays could be extracted from the file. The text may not contain recognizable date-holiday patterns.',
                    rawText: extractedText.substring(0, 2000), // Return preview for debugging
                    holidays: []
                });
            }

            res.json({
                message: `Successfully extracted ${holidays.length} holiday(s) from the file`,
                holidays,
                rawText: extractedText.substring(0, 2000) // Return preview for reference
            });

        } catch (error) {
            console.error('Holiday extraction error:', error);
            res.status(500).json({
                message: error.message || 'Failed to process file',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });
};

/**
 * Save multiple extracted holidays after review
 * POST /api/vacations/bulk
 */
exports.saveExtractedHolidays = async (req, res) => {
    try {
        // Verify requester is HR
        if (!req.user || !req.user.roles || !req.user.roles.includes('HR')) {
            return res.status(403).json({ message: 'Only HR can save holidays' });
        }

        const { holidays } = req.body;

        if (!Array.isArray(holidays) || holidays.length === 0) {
            return res.status(400).json({ message: 'No holidays to save' });
        }

        const results = {
            saved: [],
            skipped: [],
            errors: []
        };

        for (const holiday of holidays) {
            try {
                // Validate required fields
                if (!holiday.name || !holiday.date) {
                    results.errors.push({
                        holiday,
                        error: 'Missing required fields (name or date)'
                    });
                    continue;
                }

                const holidayDate = new Date(holiday.date);
                if (isNaN(holidayDate.getTime())) {
                    results.errors.push({
                        holiday,
                        error: 'Invalid date format'
                    });
                    continue;
                }

                // Normalize date for comparison and storage
                holidayDate.setHours(0, 0, 0, 0);
                const startOfDay = new Date(holidayDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(holidayDate);
                endOfDay.setHours(23, 59, 59, 999);

                // Check if holiday already exists on this date
                const existingHoliday = await Vacation.findOne({
                    date: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                });

                if (existingHoliday) {
                    results.skipped.push({
                        holiday,
                        reason: `Holiday already exists on this date: ${existingHoliday.name}`
                    });
                    continue;
                }

                // Create new holiday
                const newHoliday = new Vacation({
                    name: holiday.name.trim(),
                    date: holidayDate,
                    numberOfDays: Math.max(1, Number(holiday.numberOfDays) || 1)
                });

                await newHoliday.save();
                results.saved.push(newHoliday);

            } catch (error) {
                results.errors.push({
                    holiday,
                    error: error.message
                });
            }
        }

        res.status(201).json({
            message: `Processed ${holidays.length} holidays: ${results.saved.length} saved, ${results.skipped.length} skipped, ${results.errors.length} errors`,
            results
        });

    } catch (error) {
        console.error('Save holidays error:', error);
        res.status(500).json({ message: 'Failed to save holidays' });
    }
};
