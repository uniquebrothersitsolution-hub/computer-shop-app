const express = require('express');
const router = express.Router();
const DailyData = require('../models/DailyData');
const { protect, authorize, checkDateAccess } = require('../middleware/auth');

// @route   GET /api/data
// @desc    Get data entries (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};

        // Employees cannot view any data
        if (req.user.role === 'employee') {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }

        // Owner can filter by date range
        if (req.query.startDate || req.query.endDate) {
            query.date = {};
            if (req.query.startDate) {
                query.date.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.date.$lte = new Date(req.query.endDate);
            }
        }

        const data = await DailyData.find(query)
            .populate('enteredBy', 'username email')
            .sort({ date: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/data
// @desc    Create new data entry
// @access  Private (Employee: today only, Owner: any date)
router.post('/', protect, checkDateAccess, async (req, res) => {
    try {
        // Set date to today if not provided
        let entryDate = req.body.date ? new Date(req.body.date) : new Date();
        entryDate.setHours(0, 0, 0, 0);

        // Prepare data (exclude potential protected fields)
        const { date, enteredBy, ...dynamicData } = req.body;

        // Create data entry
        const dataEntry = await DailyData.create({
            ...dynamicData,
            date: entryDate,
            enteredBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Data entry created successfully',
            data: dataEntry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/data/:id
// @desc    Update data entry
// @access  Private/Owner only
router.put('/:id', protect, authorize('owner'), async (req, res) => {
    try {
        let dataEntry = await DailyData.findById(req.params.id);

        if (!dataEntry) {
            return res.status(404).json({
                success: false,
                message: 'Data entry not found'
            });
        }

        const { date, enteredBy, ...dynamicData } = req.body;

        dataEntry = await DailyData.findByIdAndUpdate(
            req.params.id,
            {
                ...dynamicData,
                date: date ? new Date(date) : dataEntry.date
            },
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Data entry updated successfully',
            data: dataEntry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/data/:id
// @desc    Delete data entry
// @access  Private/Owner only
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
    try {
        const dataEntry = await DailyData.findById(req.params.id);

        if (!dataEntry) {
            return res.status(404).json({
                success: false,
                message: 'Data entry not found'
            });
        }

        await dataEntry.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Data entry deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/data/stats
// @desc    Get statistics (Owner only)
// @access  Private/Owner
router.get('/stats', protect, authorize('owner'), async (req, res) => {
    try {
        const stats = await DailyData.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: { $multiply: ['$quantity', '$price'] } },
                    totalEntries: { $sum: 1 },
                    avgSale: { $avg: { $multiply: ['$quantity', '$price'] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || { totalSales: 0, totalEntries: 0, avgSale: 0 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
