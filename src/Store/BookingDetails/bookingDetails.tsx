import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlightPNR } from '../../Pages/Home1/types';


interface FlightDetails {
  details: FlightPNR | null;
  traveller: string;
}

const initialState: FlightDetails = {
  details: null,
  traveller: '',
};

const bookingDetails = createSlice({
  name: 'bookingDetails',
  initialState,
  reducers: {
    flightDetails: (state, action: PayloadAction<FlightPNR>) => {
      // Save to async storage (non-blocking)
      AsyncStorage.setItem('booking_flight', JSON.stringify(action.payload));
      state.details = action.payload;
    },
    travellerDetails: (state, action: PayloadAction<string>) => {
      AsyncStorage.setItem('traveller', action.payload);
      state.traveller = action.payload;
    },
  },
});

export const { flightDetails, travellerDetails } = bookingDetails.actions;
export default bookingDetails.reducer;
