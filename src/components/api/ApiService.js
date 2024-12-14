import axios from "axios";

export const getPassenger = (email) => axios.get(`http://localhost:8080/passengers/${email}`)

export const authenticate = (userLogin) => axios.post("http://localhost:8080/token", userLogin)

export const signup = (passenger) => axios.post("http://localhost:8080/passenger/signup", passenger);