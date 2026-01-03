import React, { createContext, useReducer, useContext, useCallback } from 'react';
import rideService from '../services/rideService';
import { formatError } from '../utils/errorUtils';

const RideContext = createContext();

const initialState = {
    announcedRides: [],
    passengerDemands: [],
    myRides: { hosted: [], joined: [] },
    isLoading: false,
    error: null,
    selectedRide: null,
};

const rideReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'FETCH_ANNOUNCED_RIDES_SUCCESS':
            return { ...state, announcedRides: action.payload, isLoading: false };
        case 'FETCH_PASSENGER_DEMANDS_SUCCESS':
            return { ...state, passengerDemands: action.payload, isLoading: false };
        case 'FETCH_MY_RIDES_SUCCESS':
            return { ...state, myRides: action.payload, isLoading: false };
        case 'CREATE_RIDE_SUCCESS':
            // Optimistically we could add to list, but usually better to refetch
            return { ...state, isLoading: false };
        case 'JOIN_RIDE_SUCCESS':
            // Update the selectedRide with the updated data from backend
            // Also update announcedRides if the joined ride is in that list
            const updatedRide = action.payload;
            const updatedAnnouncedRides = state.announcedRides.map(ride =>
                ride._id === updatedRide._id ? updatedRide : ride
            );
            return {
                ...state,
                isLoading: false,
                selectedRide: updatedRide,
                announcedRides: updatedAnnouncedRides
            };
        case 'SELECT_RIDE':
            return { ...state, selectedRide: action.payload };

        case 'UPDATE_RIDE_SUCCESS':
            const updatedRideItem = action.payload;

            // Helper to update a list if it contains the ride
            const updateList = (list) => (list || []).map(r => r._id === updatedRideItem._id ? updatedRideItem : r);

            return {
                ...state,
                isLoading: false,
                selectedRide: updatedRideItem,
                announcedRides: updateList(state.announcedRides),
                passengerDemands: updateList(state.passengerDemands),
                myRides: {
                    hosted: updateList(state.myRides.hosted),
                    joined: updateList(state.myRides.joined)
                }
            };
        default:
            return state;
    }
};

export const RideProvider = ({ children }) => {
    const [state, dispatch] = useReducer(rideReducer, initialState);

    const clearError = useCallback(() => {
        dispatch({ type: 'CLEAR_ERROR' });
    }, []);

    const fetchAnnouncedRides = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await rideService.getAnnouncedRides();
            // Extract rides array from the response object
            dispatch({ type: 'FETCH_ANNOUNCED_RIDES_SUCCESS', payload: response.rides || [] });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: formatError(error) });
        }
    }, []);

    const fetchPassengerDemands = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await rideService.getPassengerDemands();
            // Extract rides array from the response object
            dispatch({ type: 'FETCH_PASSENGER_DEMANDS_SUCCESS', payload: response.rides || [] });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: formatError(error) });
        }
    }, []);

    const fetchMyRideHistory = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await rideService.getMyHistory();
            // Extract history object from the response (backend returns { history: { hosted: [...], joined: [...] } })
            dispatch({ type: 'FETCH_MY_RIDES_SUCCESS', payload: response.history || { hosted: [], joined: [] } });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: formatError(error) });
        }
    }, []);

    const createRide = useCallback(async (rideData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const data = await rideService.createRide(rideData);
            dispatch({ type: 'CREATE_RIDE_SUCCESS', payload: data });
            // Refresh to ensure lists match actual backend state
            fetchMyRideHistory(); // Update my items
            fetchAnnouncedRides(); // Update public list if driver
            return data;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: formatError(error) });
            throw error;
        }
    }, [fetchMyRideHistory, fetchAnnouncedRides]); // Dependencies added

    const joinRide = useCallback(async (rideId) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await rideService.joinRide(rideId);
            // response contains { success, message, ride }
            const updatedRide = response.ride;
            dispatch({ type: 'JOIN_RIDE_SUCCESS', payload: updatedRide });
            // Optionally refetch lists for consistency
            fetchMyRideHistory();
            fetchAnnouncedRides();
            return response;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: formatError(error) });
            throw error;
        }
    }, [fetchMyRideHistory, fetchAnnouncedRides]);

    const updateRide = useCallback(async (rideId, updates) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const data = await rideService.updateRide(rideId, updates);

            // Dispatch success to update all lists synchronously
            dispatch({ type: 'UPDATE_RIDE_SUCCESS', payload: data.ride });

            // Still fetch fresh lists in background to be safe
            fetchMyRideHistory();
            fetchPassengerDemands();
            if (data.ride.type === 'DRIVER') fetchAnnouncedRides();

            return data;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: formatError(error) });
            throw error;
        }
    }, [fetchMyRideHistory, fetchPassengerDemands, fetchAnnouncedRides]);

    const leaveRide = useCallback(async (rideId) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await rideService.leaveRide(rideId);
            // After leaving, refresh lists
            // Update selected ride if it's the one we left
            if (state.selectedRide && (state.selectedRide._id === rideId || state.selectedRide.id === rideId)) {
                await selectRide(rideId);
            }
            fetchMyRideHistory(); // Update my history (Joined tab)
            fetchAnnouncedRides(); // Update available seats in public view
            dispatch({ type: 'SET_LOADING', payload: false });
            return response;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: formatError(error) });
            throw error;
        }
    }, [state.selectedRide, selectRide, fetchMyRideHistory, fetchAnnouncedRides]);

    const cancelRide = useCallback(async (rideId) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await rideService.cancelRide(rideId);
            // After cancel, refresh lists
            fetchMyRideHistory();
            fetchPassengerDemands();
            fetchAnnouncedRides();
            dispatch({ type: 'SET_LOADING', payload: false });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: formatError(error) });
            throw error;
        }
    }, [fetchMyRideHistory, fetchPassengerDemands, fetchAnnouncedRides]);


    // Enhanced selectRide with API fetch capabilities as verified in requirements
    const selectRide = useCallback(async (rideOrId) => {
        if (typeof rideOrId === 'object' && rideOrId !== null) {
            dispatch({ type: 'SELECT_RIDE', payload: rideOrId });
        } else {
            // It's an ID, so fetch the details
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                // In case we already have it in state, we might want to check there first to save a call,
                // but user explicitly asked for getRideDetails(rideId) action, so let's use the service.

                // Check in-memory first for instant feedback (optional but good UX)
                let found = state.announcedRides.find(r => r._id === rideOrId || r.id === rideOrId) ||
                    state.passengerDemands.find(r => r._id === rideOrId || r.id === rideOrId) ||
                    state.myRides.hosted.find(r => r._id === rideOrId || r.id === rideOrId) ||
                    state.myRides.joined.find(r => r._id === rideOrId || r.id === rideOrId);

                if (found) {
                    dispatch({ type: 'SELECT_RIDE', payload: found });
                    // We could still background fetch to ensure fresh data
                }

                const data = await rideService.getRideDetails(rideOrId);
                dispatch({ type: 'SELECT_RIDE', payload: data });
                dispatch({ type: 'SET_LOADING', payload: false });
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: formatError(error) });
            }
        }
    }, [state.announcedRides, state.passengerDemands, state.myRides]);

    return (
        <RideContext.Provider
            value={{
                ...state,
                fetchAnnouncedRides,
                fetchPassengerDemands,
                fetchMyRideHistory,
                createRide,
                joinRide,
                leaveRide,
                updateRide,
                cancelRide,
                selectRide,
                clearError,
            }}

        >
            {children}
        </RideContext.Provider>
    );
};

export const useRides = () => {
    const context = useContext(RideContext);
    if (!context) {
        throw new Error('useRides must be used within a RideProvider');
    }
    return context;
};

export default RideContext;
