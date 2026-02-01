const express = require('express');
const router = express.Router();
const FieldConfig = require('../models/FieldConfig');
const DailyData = require('../models/DailyData');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/fields
// @desc    Get all field configurations
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const fields = await FieldConfig.find().sort({ order: 1 });
        res.status(200).json({
            success: true,
            data: fields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/fields
// @desc    Create new field configuration
// @access  Private/Owner
router.post('/', protect, authorize('owner'), async (req, res) => {
    try {
        const { fieldName, fieldType, options, required, order } = req.body;

        const field = await FieldConfig.create({
            fieldName,
            fieldType,
            options,
            required,
            order: order || 0,
            isDefault: false
        });

        res.status(201).json({
            success: true,
            message: 'Field created successfully',
            data: field
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/fields/:id
// @desc    Update field configuration
// @access  Private/Owner
router.put('/:id', protect, authorize('owner'), async (req, res) => {
    try {
        const field = await FieldConfig.findById(req.params.id);

        if (!field) {
            return res.status(404).json({
                success: false,
                message: 'Field not found'
            });
        }

        const oldFieldName = field.fieldName;
        const newFieldName = req.body.fieldName;

        const updatedField = await FieldConfig.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // If field name changed, rename keys in DailyData
        if (newFieldName && oldFieldName !== newFieldName) {
            await DailyData.updateMany(
                { [oldFieldName]: { $exists: true } },
                { $rename: { [oldFieldName]: newFieldName } }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Field updated successfully',
            data: updatedField
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/fields/:id
// @desc    Delete field configuration
// @access  Private/Owner
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
    try {
        const field = await FieldConfig.findById(req.params.id);

        if (!field) {
            return res.status(404).json({
                success: false,
                message: 'Field not found'
            });
        }

        await field.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Field deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
