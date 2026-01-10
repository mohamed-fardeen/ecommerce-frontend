import React, { useState, useEffect, useRef } from 'react';
import { MdMyLocation, MdCheck } from 'react-icons/md';

export default function LocationMap({ onLocationConfirm, initialPosition }) {
  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null); // Store map instance to prevent re-initialization

  useEffect(() => {
    // Load Leaflet dynamically
    const loadMap = async () => {
      try {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          // Initialize map after Leaflet loads
          if (mapRef.current && !mapLoaded && !mapInstanceRef.current) {
            const L = window.L;
            
            // Create map
            const map = L.map(mapRef.current).setView([initialPosition?.lat || 28.6139, initialPosition?.lng || 77.2090], 15);
            mapInstanceRef.current = map; // Store map instance
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Add marker
            const marker = L.marker([initialPosition?.lat || 28.6139, initialPosition?.lng || 77.2090], {
              draggable: true
            }).addTo(map);
            
            markerRef.current = marker;
            
            // Handle marker drag
            marker.on('dragend', (e) => {
              const position = e.target.getLatLng();
              // Update marker position state
            });
            
            // Handle map click
            map.on('click', (e) => {
              const position = e.latlng;
              marker.setLatLng(position);
            });
            
            setMapLoaded(true);
          }
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error('Map loading error:', error);
      }
    };

    loadMap();
  }, [initialPosition, mapLoaded]);

  const getCurrentLocation = () => {
    console.log('🔍 Get Current Location button clicked');
    console.log('Starting GPS detection...');
    setIsLocating(true);
    
    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    console.log('Geolocation supported, requesting position...');
    
    // Check if we're on HTTPS (required for some browsers)
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
      console.warn('Warning: GPS may not work on HTTP. Some browsers require HTTPS for geolocation.');
    }

    // Try getCurrentPosition with better error handling
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('GPS Success!', position);
          console.log('Coordinates:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy
          });
          
          const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setIsLocating(false);
          
          // Update map if loaded
          if (mapRef.current && markerRef.current && mapInstanceRef.current) {
            const map = mapInstanceRef.current; // Use stored map instance
            map.setView([currentPos.lat, currentPos.lng], 16);
            markerRef.current.setLatLng([currentPos.lat, currentPos.lng]);
          }
          
          // Show success message
          const successMessage = document.createElement('div');
          successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
          successMessage.innerHTML = `✓ GPS Location detected! Accuracy: ${Math.round(position.coords.accuracy)}m`;
          document.body.appendChild(successMessage);
          
          setTimeout(() => {
            if (successMessage.parentNode) {
              successMessage.parentNode.removeChild(successMessage);
            }
          }, 4000);
        },
        (error) => {
          console.error('GPS Error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          setIsLocating(false);
          
          let errorMessage = 'Unable to get your location.';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your device GPS.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            case error.UNKNOWN_ERROR:
              errorMessage = 'An unknown error occurred while getting location.';
              break;
          }
          
          alert(`${errorMessage}\n\nError Code: ${error.code}\nDetails: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // Increased to 30 seconds
          maximumAge: 60000 // Allow 1 minute cached location
        }
      );
    } catch (error) {
      console.error('GPS API Error:', error);
      setIsLocating(false);
      alert('GPS API error: ' + error.message);
    }
  };

  const handleConfirm = () => {
    console.log('✅ Confirm Location button clicked');
    const defaultLocation = initialPosition || { lat: 28.6139, lng: 77.2090 };
    console.log('Using default location:', defaultLocation);
    onLocationConfirm(defaultLocation);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-grayshade-400 rounded-lg max-w-4xl w-full mx-4 h-[600px] border-4 border-purpleshade-400 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-grayshade-300">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Select Your Delivery Location
            </h3>
            <div className="flex gap-2">
              <button
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="bg-purpleshade-400 text-white p-2 rounded-lg hover:bg-purpleshade-500 transition-colors disabled:opacity-50"
                title="Get Current Location"
              >
                <MdMyLocation className="text-xl" />
              </button>
              <button
                onClick={handleConfirm}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <MdCheck className="mr-2" />
                Confirm Location
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Drag the marker or click on the map to set your exact delivery location
          </p>
        </div>
        
        <div 
          ref={mapRef} 
          className="h-[500px] w-full"
          style={{ backgroundColor: '#f0f0f0' }}
        >
          {!mapLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purpleshade-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading map...</p>
              </div>
            </div>
          )}
        </div>
        
        {isLocating && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white dark:bg-grayshade-400 rounded-lg p-4 shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purpleshade-400 mx-auto"></div>
              <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">Getting your location...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
