
const APIFeatures = require("./../utils/apiFeatures")
const catchAsync = require("./../utils/catchAsync")
const AppError = require("../utils/appError")

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if (!doc) {
        return next(new AppError("no document found with that ID", 404))
    }
    // when we delete a res, we send 204
    res.status(204).json({
        status: "Success",
        data: null
    })

})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!doc) {
        return next(new AppError("no tour found with that ID", 404))
    }
    // when we update a res, we send 200
    res.status(200).json({
        status: "Success",
        data: {
            data: doc
        }
    })

})

exports.createOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.create(req.body)

    res.status(201).json({
        status: "Success",
        data: {
            data: doc
        }
    })
    //model.protoype.save
})

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    //Tour.findOne({_id: req.params.id})

    let query = Model.findById(req.params.id).populate("reviews")

    if (popOptions) query = query.populate(popOptions)

    const doc = await query

    if (!doc) {
        return next(new AppError("no tour found with that ID", 404))
    }
    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })

})

exports.getAll = Model => catchAsync(async (req, res, next) => {

    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    //Execute query
    const features = new APIFeatures(Model.find(filter), req.query).filter().sort()
        .limitFields()
        .paginate()
    const doc = await features.query

    //no reason for not using this
    //const tours = await Tour.find().where("duration").equals(5).where("difficulty").equals("easy")

    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        results: doc.length,
        data: {
            data: doc
        }
    })

})