// backend/controllers/authController.js
const User = require('../models/User');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Register a user => /api/v1/auth/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, phoneNumber, address, role } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        phoneNumber,
        address,
        role
    });

    const token = user.getJwtToken();

    res.status(201).json({
        success: true,
        token,
        user
    });
});

// Login user => /api/v1/auth/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password is entered by user
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400));
    }

    // Finding user in database
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    // Check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    const token = user.getJwtToken();

    // Options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    res.status(200)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user
        });
});

// Logout user => /api/v1/auth/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out'
    });
});

// Get currently logged in user details => /api/v1/auth/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});