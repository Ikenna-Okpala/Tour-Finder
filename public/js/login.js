/*eslint-disable*/
//be included into our final bundle to make it backwards compatible
import axios from "axios"
import { showAlert } from "./alerts"


export const login = async (email, password) => {
    console.log(email)
    try {
        const res = await axios({
            method: "POST",
            url: "http://localhost:3000/api/v1/users/login",
            data: {
                email,
                password
            }
        })

        if (res.data.status === "success") {
            showAlert("success", "Logged in successfully")
            window.setTimeout(() => {
                location.assign("/")
            }, 1500)

        }
    }
    catch (error) {
        showAlert("error", error.response.data.message)
    }


}

export const logout = async () => {
    try {
        const res = await axios({
            method: "GET",
            url: "http://localhost:3000/api/v1/users/logout",

        })

        //fresh page from ther server

        if (res.data.status == "success") location.reload(true)
    }
    catch (error) {
        showAlert("error", "Error logging out! Try again")
    }
}
