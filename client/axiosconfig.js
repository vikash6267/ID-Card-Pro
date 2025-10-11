import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:4010",
    // baseURL: "https://api.cardpro.co.in",


    withCredentials: true,
    timer: 7200000, // 2 hours in milliseconds
    timerProgressBar: true,
});


export default instance;

