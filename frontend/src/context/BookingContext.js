'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [vehicle, setVehicleState] = useState(null);
  const [selectedServices, setSelectedServicesState] = useState([]);
  const [selectedPackage, setSelectedPackageState] = useState(null);
  const [bookingDetails, setBookingDetailsState] = useState({
    date: '',
    time: '',
    serviceCenter: '',
    pickupOption: '',
    name: '',
    email: '',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync state from localStorage on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedVehicle = localStorage.getItem('booking_flow_vehicle');
      const storedServices = localStorage.getItem('booking_flow_services');
      const storedPackage = localStorage.getItem('booking_flow_package');
      const storedDetails = localStorage.getItem('booking_flow_details');

      if (storedVehicle) {
        try { setVehicleState(JSON.parse(storedVehicle)); } catch (e) { console.error(e); }
      }
      if (storedServices) {
        try { setSelectedServicesState(JSON.parse(storedServices)); } catch (e) { console.error(e); }
      }
      if (storedPackage) {
        try {
          const parsed = JSON.parse(storedPackage);
          setSelectedPackageState(parsed);
        } catch (e) { console.error(e); }
      }
      if (storedDetails) {
        try { setBookingDetailsState(JSON.parse(storedDetails)); } catch (e) { console.error(e); }
      }
      setIsLoaded(true);
    }
  }, []);

  const setVehicle = (val) => {
    setVehicleState(val);
    if (val) {
      localStorage.setItem('booking_flow_vehicle', JSON.stringify(val));
    } else {
      localStorage.removeItem('booking_flow_vehicle');
    }
  };

  const setSelectedServices = (val) => {
    setSelectedServicesState(val);
    localStorage.setItem('booking_flow_services', JSON.stringify(val));
    if (val.length > 0) {
      localStorage.setItem('booking_flow_service', JSON.stringify(val[0]));
    } else {
      localStorage.removeItem('booking_flow_service');
    }
  };

  const setSelectedPackage = (val) => {
    setSelectedPackageState(val);
    localStorage.setItem('booking_flow_package', JSON.stringify(val));
  };

  const setBookingDetails = (val) => {
    const updated = typeof val === 'function' ? val(bookingDetails) : val;
    setBookingDetailsState(updated);
    localStorage.setItem('booking_flow_details', JSON.stringify(updated));
  };

  const clearBookingData = () => {
    setVehicleState(null);
    setSelectedServicesState([]);
    setSelectedPackage(null);
    setBookingDetailsState({
      date: '',
      time: '',
      serviceCenter: '',
      pickupOption: '',
      name: '',
      email: '',
    });
    localStorage.removeItem('booking_flow_vehicle');
    localStorage.removeItem('booking_flow_services');
    localStorage.removeItem('booking_flow_service');
    localStorage.removeItem('booking_flow_package');
    localStorage.removeItem('booking_flow_estimated_price');
    localStorage.removeItem('booking_flow_details');
  };

  return (
    <BookingContext.Provider
      value={{
        vehicle,
        setVehicle,
        selectedServices,
        setSelectedServices,
        selectedPackage,
        setSelectedPackage,
        bookingDetails,
        setBookingDetails,
        clearBookingData,
        isLoaded,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
