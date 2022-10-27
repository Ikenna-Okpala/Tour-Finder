const e = require("express")
const fs = require("fs")
const AppError = require("../utils/appError")
const Tour = require("./../models/tourModel")
const APIFeatures = require("./../utils/apiFeatures")
const catchAsync = require("./../utils/catchAsync")

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))


exports.aliasTopTours = (req, res, next) => {
    req.query.limit = "5"
    req.query.sort = "-ratingsAverage,price"
    req.query.fields = "name,price,ratingsAverage,summary,difficulty"
    next()
}
exports.getTours = catchAsync(async (req, res, next) => {

    //Execute query
    const features = new APIFeatures(Tour.find(), req.query).filter().sort()
        .limitFields()
        .paginate()
    const tours = await features.query

    //no reason for not using this
    //const tours = await Tour.find().where("duration").equals(5).where("difficulty").equals("easy")

    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours: tours
        }
    })

})

exports.getTourById = catchAsync(async (req, res, next) => {
    //Tour.findOne({_id: req.params.id})
    const tour = await Tour.findById(req.params.id)

    if (!tour) {
        return next(new AppError("no tour found with that ID", 404))
    }
    res.status(200).json({
        status: "success",
        data: {
            tour: tour
        }
    })

})


exports.createTour = catchAsync(async (req, res, next) => {

    const newTour = await Tour.create(req.body)

    res.status(201).json({
        status: "Success",
        data: {
            tour: newTour
        }
    })
    //model.protoype.save
})
exports.patchTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!newTour) {
        return next(new AppError("no tour found with that ID", 404))
    }
    // when we update a res, we send 200
    res.status(200).json({
        status: "Success",
        data: {
            tour: newTour
        }
    })


})

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)
    if (!tour) {
        return next(new AppError("no tour found with that ID", 404))
    }
    // when we delete a res, we send 204
    res.status(204).json({
        status: "Success",
        data: null
    })

})
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