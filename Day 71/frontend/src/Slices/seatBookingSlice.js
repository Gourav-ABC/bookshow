import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch show details
export const fetchShow = createAsyncThunk(
  'seatBooking/fetchShow',
  async (showId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shows/${showId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const seatBookingSlice = createSlice({
  name: 'seatBooking',
  initialState: {
    show: null,
    selectedSeats: [],
    blockedSeats: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    toggleSeat: (state, action) => {
      const seatId = action.payload;
      if (state.selectedSeats.includes(seatId)) {
        state.selectedSeats = state.selectedSeats.filter(id => id !== seatId);
      } else {
        state.selectedSeats.push(seatId);
      }
    },
    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
    },
    blockSeat: (state, action) => {
      if (!state.blockedSeats.includes(action.payload)) {
        state.blockedSeats.push(action.payload);
      }
    },
    unblockSeat: (state, action) => {
      state.blockedSeats = state.blockedSeats.filter(id => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShow.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchShow.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.show = action.payload;
      })
      .addCase(fetchShow.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const {
  toggleSeat,
  clearSelectedSeats,
  blockSeat,
  unblockSeat
} = seatBookingSlice.actions;

export default seatBookingSlice.reducer;
