const e = require("express")
const fs = require("fs")
const AppError = require("../utils/appError")
const Tour = require("./../models/tourModel")
const catchAsync = require("./../utils/catchAsync")
const factory = require("./handlerFactory")

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))


exports.aliasTopTours = (req, res, next) => {
    req.query.limit = "5"
    req.query.sort = "-ratingsAverage,price"
    req.query.fields = "name,price,ratingsAverage,summary,difficulty"
    next()
}
exports.getTours = factory.getAll(Tour)

exports.getTourById = factory.getOne(Tour, { path: "reviews" })

exports.patchTour = factory.updateOne(Tour)

exports.deleteTour = factory.deleteOne(Tour)

exports.createTour = factory.createOne(Tour)

exports.getTourStats = catchAsync(async (req, res, next) => {

    //aggregation is a pipeline for db
    const stats = await Tour.aggregate([
        {
            //meets reqs
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            // acts as an accumulator
            //_id says no specific rulle
            //aggregation pipeline
            $group: {
                _id: { $toUpper: "$difficulty" },
                numTours: { $sum: 1 },
                numRatings: { $sum: "$ratingsQuantity" },
                avgRating: { $avg: "$ratingsAverage" },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" }
            },


        },
        {
            // 1 is ascending
            $sort: { avgPrice: 1 }

        },
        // {
        //     $match: { _id: { $ne: "EASY" } }
        // }

    ])

    res.status(200).json({
        status: "Success",
        data: stats
    })

})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1//2021
    const plan = await Tour.aggregate([
        {
            //unwind -> one tour for each of the startDates
            $unwind: "$startDates"
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                //_id isimportant for grouping
                _id: { $month: "$startDates" },
                numTourStarts: { $sum: 1 },
                //push adds to array
                tours: { $push: "$name" }
            }
        },
        {
            $addFields: { month: "$_id" }
        },
        {
            //hide field
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ])
    res.status(200).json({
        status: "Success",
        data: plan
    })
})

// tours-distance?distance=2333&center=-40,45&unit=mi
// tour-distance/233/center/-40,45/unit/mi
//tours-within/:distance/center/:latlng/unit/:unit


exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params

    const [lat, long] = latlng.split(",")

    //radians

    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1

    if (!lat || !long) {
        next(new AppError("Please provide latitude and longitude in the format lat, lng.", 400))
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } } })

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params

    const [lat, long] = latlng.split(",")

    const multiplier = unit === "mi" ? 0.000621371 : 0.001

    //radians
    if (!lat || !long) {
        next(new AppError("Please provide latitude and longitude in the format lat, lng.", 400))
    }

    //geoNear has to be the first, requires geospatial index

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [long * 1, lat * 1]
                },
                distanceField: "distance",
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }

    ])

    res.status(200).json({
        status: "success",
        data: {
            data: distances
        }
    })
})