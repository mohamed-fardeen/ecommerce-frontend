import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import api from "../services/axiosConfig";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthenticateProvider";
import { MdLocationOn, MdHome, MdApartment, MdBusiness } from "react-icons/md";
import LocationPermissionPopup from "../components/LocationPermissionPopup";
import LocationMap from "../components/LocationMap";

function DeliveryLocation() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);

  const formik = useFormik({
    initialValues: {
      streetAddress: "",
      apartment: "",
      landmark: "",
      city: "",
      state: "",
      postalCode: "",
      country: ""
    },
    validate: (values) => {
      const errors = {};
      if (!values.streetAddress) errors.streetAddress = "Street address is required";
      if (!values.city) errors.city = "City is required";
      if (!values.state) errors.state = "State is required";
      if (!values.postalCode) errors.postalCode = "Postal code is required";
      if (!values.country) errors.country = "Country is required";
      return errors;
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // Save address to address collection
        const addressData = {
          addressLine1: values.streetAddress,
          addressLine2: values.apartment || '',
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country
        };
        
        const addressResponse = await api.post("/address", addressData);
        
        if (addressResponse.status === 201) {
          const savedAddress = addressResponse.data;
          
          toast.success("Delivery location saved successfully!", { duration: 4000 });
          formik.resetForm();
          
          // Create merged location object (coordinates already saved from GPS)
          const newLocation = {
            ...savedAddress,
            coordinates: currentCoordinates ? {
              lat: currentCoordinates.lat,
              lng: currentCoordinates.lng
            } : null
          };
          setSelectedLocation(newLocation);
        }
      } catch (error) {
        toast.error("Failed to save delivery location", { duration: 4000 });
        console.error("Error saving location:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleProceedToCheckout = () => {
    if (!selectedLocation) {
      toast.error("Please select or add a delivery location", { duration: 4000 });
      return;
    }
    // Store selected location in sessionStorage for checkout
    sessionStorage.setItem('selectedDeliveryLocation', JSON.stringify(selectedLocation));
    navigate('/checkout-confirmation');
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleEnableLocation = () => {
    setShowLocationPopup(false);
    setShowMap(true);
  };

  const handleLocationConfirm = async (coordinates) => {
    setCurrentCoordinates(coordinates);
    setShowMap(false); // Close map when confirm button is clicked
    
    // Save coordinates to coordinates collection
    try {
      const coordinatesData = {
        lat: coordinates.lat,
        lng: coordinates.lng
      };
      
      await api.post("/coordinates", coordinatesData);
      console.log("GPS coordinates saved successfully");
      toast.success('Location selected! Please fill in address details.', { duration: 4000 });
    } catch (error) {
      console.error("Error saving coordinates:", error);
      toast.error('Error saving location. Please try again.', { duration: 4000 });
    }
  };

  return (
    <>
      {/* Location Permission Popup */}
      {showLocationPopup && (
        <LocationPermissionPopup 
          onEnable={handleEnableLocation}
        />
      )}
      
      {/* Location Map */}
      {showMap && (
        <LocationMap 
          onLocationConfirm={handleLocationConfirm}
          initialPosition={currentCoordinates}
        />
      )}
      
      <div className="wrapper">
        <div className="max-w-2xl mx-auto py-14">
          {/* Add New Location Form */}
          <div className="bg-lightColor-100 dark:bg-grayshade-400 border-4 border-lightColor-300 dark:border-grayshade-300 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-purpleshade-400 mb-6 flex items-center">
              <MdLocationOn className="mr-2" />
              Add Delivery Location
            </h2>
            
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="form-section">
                <label htmlFor="streetAddress">Street Address *</label>
                <input
                  id="streetAddress"
                  name="streetAddress"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.streetAddress}
                  placeholder="123 Main Street"
                />
                {formik.touched.streetAddress && formik.errors.streetAddress && (
                  <span className="text-red-500">{formik.errors.streetAddress}</span>
                )}
              </div>

              <div className="form-section">
                <label htmlFor="apartment">Apartment, Suite, etc. (optional)</label>
                <input
                  id="apartment"
                  name="apartment"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.apartment}
                  placeholder="Apt 4B, Suite 100"
                />
              </div>

              <div className="form-section">
                <label htmlFor="landmark">Landmark (optional)</label>
                <input
                  id="landmark"
                  name="landmark"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.landmark}
                  placeholder="Near City Mall"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-section">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.city}
                    placeholder="New York"
                  />
                  {formik.touched.city && formik.errors.city && (
                    <span className="text-red-500">{formik.errors.city}</span>
                  )}
                </div>

                <div className="form-section">
                  <label htmlFor="state">State *</label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.state}
                    placeholder="NY"
                  />
                  {formik.touched.state && formik.errors.state && (
                    <span className="text-red-500">{formik.errors.state}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-section">
                  <label htmlFor="postalCode">Postal Code *</label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.postalCode}
                    placeholder="10001"
                  />
                  {formik.touched.postalCode && formik.errors.postalCode && (
                    <span className="text-red-500">{formik.errors.postalCode}</span>
                  )}
                </div>

                <div className="form-section">
                  <label htmlFor="country">Country *</label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.country}
                    placeholder="United States"
                  />
                  {formik.touched.country && formik.errors.country && (
                    <span className="text-red-500">{formik.errors.country}</span>
                  )}
                </div>
              </div>

              <div className="form-section">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="button px-6 py-3 w-full"
                >
                  {isLoading ? "Saving..." : "Save Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Proceed to Checkout Section */}
      <div className="wrapper mt-8">
        <div className="bg-lightColor-100 dark:bg-grayshade-400 border-4 border-lightColor-300 dark:border-grayshade-300 rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              {selectedLocation ? (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Delivering to:</p>
                  <p className="font-semibold">{selectedLocation.streetAddress}, {selectedLocation.city}</p>
                </div>
              ) : (
                <p className="text-red-500">Please select a delivery location</p>
              )}
            </div>
            <button
              onClick={handleProceedToCheckout}
              disabled={!selectedLocation}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                selectedLocation
                  ? 'bg-purpleshade-400 text-white hover:bg-purpleshade-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeliveryLocation;
