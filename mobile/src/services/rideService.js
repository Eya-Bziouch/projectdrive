import api from './api';

const rideService = {
    // 1. Create a new ride
    createRide: async (rideData) => {
        // rideData: { departure, destination, date, time, availableSeats, type, price, description }
        const response = await api.post('/rides', rideData);
        // Backend returns { success: true, message: '...', ride: {...} }
        return response.data.ride;
    },

    // 2. Get announced rides (Driver offers)
    getAnnouncedRides: async () => {
        const response = await api.get('/rides/driver');
        return response.data;
    },

    // 3. Get passenger demands
    getPassengerDemands: async () => {
        const response = await api.get('/rides/passenger');
        return response.data;
    },

    // 4. Get my history
    getMyHistory: async () => {
        const response = await api.get('/rides/history');
        return response.data;
    },

    // 5. Join a ride
    joinRide: async (rideId) => {
        const response = await api.post(`/rides/${rideId}/join`);
        return response.data;
    },

    getUserPublicRides: async (userId) => {
        const response = await api.get(`/rides/user/${userId}`);
        return response.data;
    },

    // 6. Get ride details
    getRideDetails: async (rideId) => {
        const response = await api.get(`/rides/${rideId}`);
        // Backend returns { success: true, ride: {...} }
        // Extract just the ride object
        return response.data.ride;
    },

    // 7. Get passengers list for a ride (creator only)
    getRidePassengers: async (rideId) => {
        const response = await api.get(`/rides/${rideId}/passengers`);
        // Backend returns { success: true, count: N, passengers: [...] }
        return response.data;
    },

    // 8. Get individual passenger details (creator only)
    getPassengerDetails: async (rideId, passengerId) => {
        const response = await api.get(`/rides/${rideId}/passengers/${passengerId}`);
        // Backend returns { success: true, passenger: {...}, rideHistory: {...} }
        return response.data;
    },

    // 9. Update a ride demand (Creator only)
    updateRide: async (rideId, updates) => {
        const response = await api.patch(`/rides/${rideId}`, updates);
        return response.data;
    },

    // 10. Leave a ride (Cancel booking)
    leaveRide: async (rideId) => {
        const response = await api.post(`/rides/${rideId}/leave`);
        return response.data;
    },

    // 11. Cancel a ride (Soft delete)
    cancelRide: async (rideId) => {
        const response = await api.put(`/rides/${rideId}/cancel`);
        return response.data;
    }
};

export default rideService;

