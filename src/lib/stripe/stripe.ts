import Stripe from "stripe";

//hardcoded for now
const key = "sk_test_51Qv2aPLmJyZ4WtyBYKnftNME4m4FkKx8CTnjqhKnGTeysu3E4xcgUwEILo0mOqc4nhCiVhASbnAThQEgCOjXDC0X009OV7ebjT"

export const stripe = new Stripe(key, {
    apiVersion: "2025-01-27.acacia",
    typescript: true,
});