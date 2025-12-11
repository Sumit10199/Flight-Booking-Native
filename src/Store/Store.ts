import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bookingDetailsReducer from './BookingDetails/bookingDetails';
import editBookingReducer from './editBookingSlice/editBookingSlice';


const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, bookingDetailsReducer);

export const Store = configureStore({
  reducer: {
    bookingDetails: persistedReducer,
    editBooking: editBookingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 👈 disable serializability warnings
      immutableCheck: false,    // 👈 optionally disable immutability check
    }),
});

export const persistor = persistStore(Store);
export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;

