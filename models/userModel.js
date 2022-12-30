const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name"]
    },
    email: {
        type: String,
        required: [true, "Please ptovide your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo: { type: String, default: "default.jpg" },
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            //This only wors for save (on create and save)
            validator: function (el) {
                return el === this.password
            },
            message: "Passwords are not the same!"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    //cryprography, 12 -> CPU Intensity cost
    this.password = await bcrypt.hash(this.password, 12)
    //delete password confirm field
    this.passwordConfirm = undefined
    next()

})

//reg expression for starts with find
userSchema.pre(/^find/, function (next) {
    //this points to query
    this.find({ active: { $ne: false } })
    next()
})

userSchema.pre("save", function (next) {
    //new documents do not need to go through
    if (!this.isModified("password") || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.methods.correctPassword = async function (candidatePassowrd, userPassword) {
    return await bcrypt.compare(candidatePassowrd, userPassword)
}
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        //convert to int
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp < changedTimestamp
    }
    return false;
}
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex")

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken
}

module.exports = mongoose.model("User", userSchema)
//Data modelling unstructured data to structured data