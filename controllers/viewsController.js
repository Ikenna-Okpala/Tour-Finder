
const Tour = require("./../models/tourModel")
const catchAsync = require("./../utils/catchAsync")
const AppError = require("./../utils/appError")
const User = require("./../models/userModel")
const Booking = require("./../models/bookingModel")

exports.getOverview = catchAsync(async (req, res) => {

    //1) GET YOUR DATA
    const tours = await Tour.find()

    //2) Build Template
    //3) Render Data

    res.status(200).render("overview", {

        title: "All Tours",
        tours
    })
})

exports.getTour = catchAsync(async (req, res, next) => {

    // get data for requested tour

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({ path: "reviews", fields: "review rating user" })

    // build templates

    // Render template using data

    if (!tour) {
        return next(new AppError("There is no tour with that name.", 404))
    }

    res.status(200)
        .render("tour", {
            title: `${tour.name} Tour`,
            tour
        })
})

exports.getLoginForm = (req, res) => {
    res.status(200).render("login", {
        title: "Log into your account"
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render("account", {
        title: "Your account"
    })
    console.log("hit")
}

exports.updateUserData = catchAsync(async (req, res) => {
    const newUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    })

    res.status(200).render("account", {
        title: "Your account",
        user: newUser
    })
})

exports.getMyTours = catchAsync(async (req, res, next) => {
    // Find All Bookings

    const bookings = await Booking.find({})
    // Find Tours with returned id

    const tourIDs = bookings.map(booking => booking.tour)

    console.log(tourIDs)

    const tours = await Tour.find({ _id: { $in: tourIDs } })

    res.status(200).render("overview", {
        title: "My Tours",
        tours
    })
})