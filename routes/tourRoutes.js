
const express = require("express")
const tourController = require("./../controllers/tourController")
const authController = require("./../controllers/authController")
const reviewRouter = require("./../routes/reviewRoutes")

const router = express.Router()

// router.param("id", tourController.checkID)

router.use("/:tourId/reviews", reviewRouter)

router.route("/top-5-cheap").get(tourController.aliasTopTours, tourController.getTours)

router.route("/tour-stats").get(tourController.getTourStats)
router.route("/monthly-plan/:year").get(authController.protect, authController.restrictTo("admin", "lead-guide", "guide"), tourController.getMonthlyPlan)

router.route("/")
    .get(tourController.getTours)
    .post(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.createTour)

router.route("/:id")
    .get(tourController.getTourById)
    .patch(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.patchTour)
    .delete(authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.deleteTour)



module.exports = router