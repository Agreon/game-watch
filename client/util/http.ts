import axios from "axios";

const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL
})

export { http }
