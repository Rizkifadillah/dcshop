const User = require('../models/userModel')

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto')

// Register a user => /api/v1/register
exports.registerUser = catchAsyncErrors( async (req,res,next)=> {
    const {name, email, password} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: 'cld-sample-2',
            url: 'https://res.cloudinary.com/dwrgsiyn2/image/upload/v1667301471/cld-sample-2.jpg'
        }
    })

    sendToken(user, 200 , res)
    // const token = user.getJwtToken();

    // res.status(201).json({
    //     success: true,
    //     // user
    //     token
    // })
})

// Login user => /api/v1/login
exports.loginUser = catchAsyncErrors( async(req,res,next)=>{
    const {email,password} = req.body;

    // Check if email and password is entered by user
    if(!email || !password){
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    // Finding user in database
    const user = await User.findOne({email}).select('+password')

    if(!user){
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }
    
    // Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);
    
    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    sendToken(user, 200 , res)

    // const token = user.getJwtToken();
    // res.status(200).json({
    //     success: true,
    //     token
    // })
})

// Forget Password = /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorHandler('User not found with this email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    console.log(resetToken)

    await user.save({validateBeforeSave: false})

    // Create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`
    console.log(resetUrl)

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
    console.log(message)

    try {
        await sendEmail({
            email: user.email, 
            subject: 'ShopIT Password Recovery',
            message
        })
        console.log('send email')
        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false})

        return next(new ErrorHandler(error.message, 500))
    }
})

// Reset Password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req,res,next)=>{
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken, 
        resetPasswordExpire: {$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler('Password reset token is invalid or hash been expired', 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match', 400))
    }

    // Setup new Password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    
    sendToken(user, 200, res)
})

// Get current logged in user details => /api/v1/me
exports.getUserProfile = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

// Update / Change password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const  user = await User.findById(req.user.id).select('+password')

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldpassword)

    if(!isMatched){
        return next(new ErrorHandler('Old password is incorrect', 400));
    }

    user.password = req.body.password;
    await user.save()

    sendToken(user, 200, res)
})

// Update user profile => /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // Update avatar: TODO
    // await User.findByIdAndUpdate
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})



// Logout user => /api/v1/logout
exports.logout = catchAsyncErrors( async(req,res,next)=>{
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logged out"
    })
})
