import React, { useState, useEffect } from 'react';
import { MdLocationOn, MdMyLocation } from 'react-icons/md';

export default function LocationPermissionPopup({ onEnable }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-grayshade-400 rounded-lg p-8 max-w-md mx-4 border-4 border-purpleshade-400">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MdLocationOn className="text-6xl text-purpleshade-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Enable Location
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Location access is required for delivery services. Please enable location to continue.
          </p>
          
          <button
            onClick={onEnable}
            className="w-full bg-purpleshade-400 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purpleshade-500 transition-colors flex items-center justify-center"
          >
            <MdMyLocation className="mr-2" />
            Enable Location
          </button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            This is required for accurate delivery service
          </p>
        </div>
      </div>
    </div>
  );
}
