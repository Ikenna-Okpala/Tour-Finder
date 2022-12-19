
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const factory = require("./handlerFactory")


const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key)) {
            newObj[key] = obj[key]
        }
    })
    return newObj
}

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user posts password data

    //2) Update user document

    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates. Please use /updateMyPassword.", 400))
    }
    const filteredBody = filterObj(req.body, "name", "email")
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true })

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: "Error",
        message: "This route is not yet defined"
    })
}

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

exports.deleteUser = factory.deleteOne(User)
exports.getAllUsers = factory.getAll(User)
// do not update passwords with this
exports.patchUser = factory.updateOne(User)
exports.getUser = factory.getOne(User)
