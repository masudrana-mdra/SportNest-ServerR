const Facility = require('../models/Facility');

exports.createFacility = async (req, res) => {
    try {
        const newFacility = new Facility({ ...req.body, owner_email: req.user.email });
        await newFacility.save();
        res.status(201).json({ success: true, message: 'Facility created successfully', facility: newFacility });
    } catch (error) {
        res.status(500).json({ message: 'Error creating facility', error: error.message });
    }
};

exports.updateFacility = async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility) return res.status(404).json({ message: 'Facility not found' });
        
        if (facility.owner_email !== req.user.email && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this facility' });
        }

        const updatedFacility = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, message: 'Facility updated successfully', facility: updatedFacility });
    } catch (error) {
        res.status(500).json({ message: 'Error updating facility', error: error.message });
    }
};

exports.deleteFacility = async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility) return res.status(404).json({ message: 'Facility not found' });

        if (facility.owner_email !== req.user.email && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this facility' });
        }

        await Facility.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Facility deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting facility', error: error.message });
    }
};

exports.getAllFacilities = async (req, res) => {
    try {
        // Search & Filter with $regex and $in
        const { search, sport_type } = req.query;
        let query = {};
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (sport_type) {
            // sport_type can be a comma-separated list
            const types = sport_type.split(',');
            query.facility_type = { $in: types };
        }

        const facilities = await Facility.find(query);
        res.status(200).json({ success: true, facilities });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching facilities', error: error.message });
    }
};

exports.getMyFacilities = async (req, res) => {
    try {
        const facilities = await Facility.find({ owner_email: req.user.email });
        res.status(200).json({ success: true, facilities });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your facilities', error: error.message });
    }
};

exports.getFacilityById = async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility) return res.status(404).json({ message: 'Facility not found' });
        res.status(200).json({ success: true, facility });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching facility', error: error.message });
    }
};
