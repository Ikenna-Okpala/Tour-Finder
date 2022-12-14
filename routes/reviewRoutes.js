const express = require("express")

const router = express.Router({ mergeParams: true })

const reviewController = require("../controllers/reviewController")
const authController = require("../controllers/authController")

router.route("/")
    .get(reviewController.getReviews)
    .post(authController.protect, authController.restrictTo("user"),
        reviewController.setTourAndUserId,
        reviewController.createReview)


router.route("/:id")
    .get(reviewController.getReview)
    .delete(reviewController.deleteReview)
    .patch(reviewController.updateReview)

module.exports = router    