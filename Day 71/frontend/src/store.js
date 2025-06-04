import { configureStore } from '@reduxjs/toolkit';
import seatBookingReducer from  "../src/Slices/seatBookingSlice";

const store = configureStore({
  reducer: {
    seatBooking: seatBookingReducer,
  },
});

export default store;
