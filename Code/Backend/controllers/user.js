const User = require('../models/User');

// give fetch id and role using email
exports.getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        // Convert email to lowercase for consistent querying
        const lowercasedEmail = email.toLowerCase();

        const user = await User.findOne({ email: lowercasedEmail }).select('_id role');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ id: user._id, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user.', details: error.message });
    }
};