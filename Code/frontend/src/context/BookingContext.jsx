import React, { createContext, useContext, useState } from "react";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [booking, setBooking] = useState(null);

  const selectBooking = (bookingData) => setBooking(bookingData);
  const clearBooking = () => setBooking(null);

  return (
    <BookingContext.Provider value={{ booking, selectBooking, clearBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  return useContext(BookingContext);
};
