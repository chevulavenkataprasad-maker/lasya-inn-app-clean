import { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    checkIn: null,
    checkOut: null,
    guests: 1,
    roomType: '',
    roomId: null,
    roomName: '',
    price: 0,
    totalPrice: 0
  });

  const [selectedRoom, setSelectedRoom] = useState(null);

  // Clear booking data
  const clearBooking = () => {
    setBookingData({
      checkIn: null,
      checkOut: null,
      guests: 1,
      roomType: '',
      roomId: null,
      roomName: '',
      price: 0,
      totalPrice: 0
    });
    setSelectedRoom(null);
  };

  return (
    <BookingContext.Provider value={{
      bookingData,
      setBookingData,
      selectedRoom,
      setSelectedRoom,
      clearBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};