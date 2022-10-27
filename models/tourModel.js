

const mongoose = require('mongoose');
const slugify = require("slugify")
const validator = require("validator")
//const User = require("./userModel")

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A our musthave a name"],
        unique: true,
        trim: true,
        maxlength: [40, "A tour name must have less or equal than 40 characters"],
        minlength: [10, "A tour name must have more or equal than 10 characters"],
        // validate: [validator.isAlpha, "Tour name must only contain characters"]
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tur must have a group size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        enum: {
            values: ["easy", "medium", "difficult"],
            message: "Difficulty is either: easy, medium, or difficult"
        }

    },

    ratingsAverage: {
        type: Number,
        default: 4.5,
        //also works for date
        min: [1, "Rating must be above 1.0"],
        max: [5, "Rating must be below 5.0"]
    },

    ratingsQuantity: {
        type: Number,
        default: 0
    },

    price: {
        type: Number,
        //array for options
        required: [true, "A tour must have a price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // this only points to current doc on New document creation
                return val < this.price
            },
            message: "Discount price {VALUE} should be below regular price"
        },
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a summary"]
    },
    description: {
        type: String,
        trim: true
    },
    slug: String,
    imageCover: {
        //not advised to store img in db but a reference to the img
        type: String,
        required: [true, "A tour must have a cover image"]
    },
    images: [String],
    createdAt: {
        type: Date,
        //converted to today's date in mongoose
        default: Date.now(),
        //deselect a field from display
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String

    },

    locations: [
        {
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
)

//virtual for handlinr fields not stored in db
tourSchema.virtual("durationWeeks").get(function () {
    //use function when you want to reference this as the caller of the function
    return this.duration / 7
})

//document middleware runs before .save() and .create() not anything else

tourSchema.pre("save", function (next) {
    //not saved to database because mot in schema
    this.slug = slugify(this.name, { lower: true })
    next()
})



// tourSchema.pre("save", function (next) {
//     console.log("Will save document...")
//     next()
// })
// // pre middleware functions are completed
//runs after document saved
// tourSchema.post("save", function (doc, next) {
//     console.log(doc)
//     next()
// })

//QUERY MIDDLEWARE
//this points to query
//all the strings that start with find
// same as "find", "findOne", "findOneand...."
tourSchema.pre(/^find/, function (next) {

    this.find({ secretTour: { $ne: true } })

    this.start = Date.now()
    next()
})

tourSchema.pre(/^find/, function (next) {
    this.populate({ path: "guides", select: "-__v -passwordChangedAt" })
    next()
})

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`)
    console.log(docs)
    next()
})

//AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
    //this point to the current aggreateion obj
    //unshift add to the beginning of an array
    this.pipeline().unshift({
        $match: { secretTour: { $ne: true } }
    })
    next()
})

module.exports = mongoose.model("Tour", tourSchema)