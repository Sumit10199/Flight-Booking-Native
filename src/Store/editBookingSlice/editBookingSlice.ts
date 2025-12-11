import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BookingState {
  booking: any | null;
}

const initialState: BookingState = {
  booking: null,
};

const editBookingSlice = createSlice({
  name: "editBooking",
  initialState,
  reducers: {
    setEditBooking: (state, action: PayloadAction<any>) => {
      state.booking = action.payload;
    },
    clearEditBooking: (state) => {
      state.booking = null;
    },
  },
});

export const { setEditBooking, clearEditBooking } = editBookingSlice.actions;
export default editBookingSlice.reducer;
