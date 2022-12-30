
const Tour = require("./../models/tourModel")
const catchAsync = require("./../utils/catchAsync")
const factory = require("./handlerFactory")
const AppError = require("../utils/appError")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Booking = require("./../models/bookingModel")

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1 Get Currently bookjed tour

    const tour = await Tour.findById(req.params.tourID)
    // Create checkout session

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        success_url: `${req.protocol}://localhost:3000/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://localhost:3000/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                price_data: {
                    currency: "cad",
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    }
                },
                quantity: 1
            }
        ],
        mode: "payment"

    })
    // send to client
    res.status(200).json({
        status: "success",
        session
    })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query

    if (!tour && !user && !price) {
        return next()
    }

    await Booking.create({
        tour,
        user,
        price
    })

    res.redirect(req.originalUrl.split("?")[0])
})
exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.cancelBooking = factory.deleteOne(Booking)