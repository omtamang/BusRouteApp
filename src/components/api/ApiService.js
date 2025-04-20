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

export const getStops = () => axios.get(`http://localhost:8080/get-stops`)

export const deleteStopById = (stopId) => axios.delete(`http://localhost:8080/stop/delete/${stopId}`)

export const addStop = (stop, routeId) => axios.post(`http://localhost:8080/add-stops/${routeId}`, stop)

export const updateStop = (stop, routeId, stopId) => axios.put(`http://localhost:8080/stop/${stopId}/update/${routeId}`, stop)

export const getUsers = () => axios.get('http://localhost:8080/get-users')

export const deleteUser = (passengerId) => axios.delete(`http://localhost:8080/delete-user/${passengerId}`)

export const addUser = (passenger) => axios.post(`http://localhost:8080/add-user`, passenger)

export const updateUser = (passenger, passengerId) => axios.put(`http://localhost:8080/update-user/${passengerId}`, passenger)

export const getBusByRouteId = (routeId) => axios.get(`http://localhost:8080/get-route/${routeId}/buses`)

export const getBus = () => axios.get("http://localhost:8080/get-bus")

export const addBus = (bus, routeId) => axios.post(`http://localhost:8080/add-bus/${routeId}`, bus)

export const deleteBus = (busId) => axios.delete(`http://localhost:8080/bus/delete/${busId}`)

export const updateBus = (bus, routeId, busId) => axios.put(`http://localhost:8080/bus/${busId}/update/${routeId}`, bus)

export const getReminder = (email) => axios.get(`http://localhost:8080/getNotification/${email}`)

export const setReminder = (routeId, stopId, email, reminder) => axios.post(`http://localhost:8080/setReminder/${routeId}/${stopId}/${email}`, reminder)

export const updateReminder = (routeId, stopId, email, notificationId, reminder) => axios.put(`http://localhost:8080/updateReminder/${routeId}/${stopId}/${email}/${notificationId}`, reminder)
