import axios from "axios";

export const getPassenger = () => axios.get(`http://localhost:8080/passengers/info`)

export const authenticate = (userLogin) => axios.post(`http://localhost:8080/token`, userLogin)

export const signup = (passenger) => axios.post(`http://localhost:8080/passenger/signup`, passenger);

export const deleteEmail = () => axios.delete(`http://localhost:8080/passenger/delete`);

export const verifyEmail = (details) => axios.post(`http://localhost:8080/verify/code`, details);

export const resendEmail = (email) => axios.get(`http://localhost:8080/send/code/${email}`);

export const getRoutes = () => axios.get('http://localhost:8080/get-route');

export const getRouteByid = (routeId) => axios.get(`http://localhost:8080/get-route/${routeId}`);

export const getStopByRouteId = (routeId) => axios.get(`http://localhost:8080/get-route/${routeId}/stops`);

export const deleteRouteById = (routeId) => axios.delete(`http://localhost:8080/route/delete/${routeId}`);

export const addRoute = (route) => axios.post('http://localhost:8080/add-route', route);

export const updateRoute = (route, routeId) => axios.put(`http://localhost:8080/route/${routeId}`, route)