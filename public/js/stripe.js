const stripe = Stripe('pk_test_51M75VkLASYKZWPdABclD8no2Iet2iJGc3Ggcm6oyRO4kq2YM0Vl1MqejIbmPdelnJsw5xezTDwEE4yrHIsJnOJVs00DKTOVLpx')
import axios from "axios"
import { showAlert } from "./alerts"

export const bookTour = async tourId => {
    try {


        // get cceckout session from endpoint

        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`
        )
        // create checkout form + charge card

        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    }
    catch (error) {
        showAlert("error", error)
    }
}

