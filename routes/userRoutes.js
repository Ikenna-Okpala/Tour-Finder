
const express = require("express")




const router = express.Router()
const userController = require("../controllers/userController")
const authController = require("../controllers/authController")

//no rest format
router.post("/signup", authController.signUp)
router.post("/login", authController.login)

router.post("/forgotPassword", authController.forgotPassword)
router.patch("/resetPassword/:token", authController.resetPassword)

//middle ware runs in sequence

router.use(authController.protect)

router.patch("/updateMyPassword", authController.updatePassword)
router.patch("/updateMe", userController.updateMe)
router.delete("/deleteMe", userController.deleteMe)

router.get("/me", userController.getMe, userController.getUser)

//rest format
router.use(authController.restrictTo("admin"))

router.route("/").get(userController.getAllUsers).post(userController.createUser)

router.route("/:id").get(userController.getUser).patch(userController.patchUser).delete(userController.deleteUser)


module.exports = router