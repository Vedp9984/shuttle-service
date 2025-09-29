const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTRATION LOGIC (No changes needed, it's already correct) ---
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, userType, licenseNumber } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ msg: "Please fill in all required fields." });
        }
        
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ msg: "A user with this email already exists." });
        }
        
        if (userType === 'Driver' && !licenseNumber) {
            return res.status(400).json({ msg: "License number is required for drivers." });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            passwordHash,
            phoneNumber,
            role: userType,
            licenseNumber: userType === 'Driver' ? licenseNumber : undefined,
        });

        const savedUser = await newUser.save();

        const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(201).json({
            token,
            user: { 
                id: savedUser._id, 
                email: savedUser.email, 
                role: savedUser.role 
            },
        });

    } catch (err) {
        console.error("REGISTRATION ERROR:", err);
        res.status(500).json({ msg: "Server error during registration.", error: err.message });
    }
};


// --- LOGIN LOGIC (UPDATED) ---
exports.login = async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Please provide email and password." });
        }

        // --- FIX IS HERE ---
        // Convert the incoming email to lowercase before querying the database.
        const lowercasedEmail = email.toLowerCase();
        
        // Find the user by their lowercased email and their selected role.
        const user = await User.findOne({ email: lowercasedEmail, role: userType });

        // If no user is found with that email AND role, return the error.
        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials or role mismatch." });
        }

        // If a user is found, compare the provided password with the hashed password in the database.
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            // Passwords don't match.
            return res.status(400).json({ msg: "Invalid credentials." });
        }

        // If passwords match, create the token.
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Send the token and user info back to the frontend.
        res.json({
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                role: user.role 
            },
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ msg: "Server error during login.", error: err.message });
    }
};
