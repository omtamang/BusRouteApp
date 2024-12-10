import axios from "axios";

export const getPassenger = (email) => axios.get(`http://localhost:8080/passengers/${email}`)