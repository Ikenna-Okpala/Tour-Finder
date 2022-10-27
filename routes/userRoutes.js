
const express = require("express")



const router = express.Router()
const userController = require("../controllers/userController")
const authController = require("../controllers/authController")

//no rest format
router.post("/signup", authController.signUp)
router.post("/login", authController.login)

router.post("/forgotPassword", authController.forgotPassword)
router.patch("/resetPassword/:token", authController.resetPassword)
router.patch("/updateMyPassword", authController.protect, authController.updatePassword)
router.patch("/updateMe", authController.protect, userController.updateMe)
router.delete("/deleteMe", authController.protect, userController.deleteMe)

//rest format
router.route("/").get(userController.getAllUsers).post(userController.createUser)

router.route("/:id").get(userController.getUser).patch(userController.patchUser).delete(userController.deleteUser)

module.exports = router