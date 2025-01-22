import axios from "axios";

const instance = axios.create({
    // baseURL: "https://api.eagleart.in",
    // baseURL: "http://localhost:4010",
    baseURL: "https://api.cardpro.co.in",
    // baseURL: "https://id-card-y8ui.onrender.com",
    withCredentials: true,
    timer: 7200000, // 2 hours in milliseconds
    timerProgressBar: true,
});


export default instance;

