import { configureStore } from '@reduxjs/toolkit';
import seatBookingReducer from './slices/seatBookingSlice';

const store = configureStore({
  reducer: {
    seatBooking: seatBookingReducer,
  },
});

export default store;
