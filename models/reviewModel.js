const mongoose = require('mongoose');
const Tour = require("./../models/tourModel")

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review cannot be empty"]
    },

    rating: {
        type: Number,
        min: 1,
        max: 5
    },

    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },

    tour: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Tour",
            required: [true, "Review must belong to a tour"],
            unique: false
        }
    ],

    user: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Review must belong to a user"],
            unique: false
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

//query middleware 

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "name photo"
    })
    next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: "$tour",
                nrating: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ])

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nrating,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }

}

//use post
reviewSchema.post("save", function () {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour)
})

// can't use post becuase query will have executed
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.review = await this.findOne()
    next()
})

//this points to query

reviewSchema.post(/^findOneAnd/, async function () {
    //await this.findOne() query has already been exectured

    await this.review.constructor.calcAverageRatings(this.review.tour)
})

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

module.exports = mongoose.model("Review", reviewSchema)

//POST /tour/3738383/reviews
//GET /tour/3738383/reviews