import { useCartCunsumer } from "../contexts/CartProvider";
import AddToCart from "../components/AddToCart";
import api from "../services/axiosConfig";
import { useAuth } from "../contexts/AuthenticateProvider";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";

export default function CheckoutConfirmation() {
  const { cartState, dispatch } = useCartCunsumer();
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  useEffect(() => {
    // Check if delivery location is selected
    const savedLocation = sessionStorage.getItem('selectedDeliveryLocation');
    if (!savedLocation) {
      navigate('/delivery-location');
      return;
    }
    setDeliveryLocation(JSON.parse(savedLocation));
  }, [navigate]);

  const processOrder = async () => {
    if (isProcessingOrder) return;
    
    setIsProcessingOrder(true);
    try {
      const orderData = {
        ...cartState,
        userInfo,
        deliveryLocation
      };
      
      const res = await api.post("/order", orderData);
      console.log('Order placed successfully:', res);
      
      dispatch({ type: "CLEAR" });
      sessionStorage.removeItem('selectedDeliveryLocation');
      
      // Show success message and navigate
      alert('Order placed successfully! Redirecting to home...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
      setIsProcessingOrder(false);
    }
  };

  if (!deliveryLocation) {
    return <div className="wrapper text-center py-20">Loading...</div>;
  }

  return (
    <div className="wrapper">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-purpleshade-400 mb-8">Order Confirmation</h1>
        
        <div className="max-w-2xl mx-auto bg-lightColor-100 dark:bg-grayshade-400 border-4 border-lightColor-300 dark:border-grayshade-300 rounded-lg p-8">
          
          {/* Delivery Location Display */}
          <div className="mb-8 p-4 bg-purpleshade-50 dark:bg-purpleshade-900 rounded-lg border border-purpleshade-300">
            <div className="flex items-center mb-4">
              <MdLocationOn className="mr-2 text-purpleshade-400 text-xl" />
              <p className="font-semibold text-purpleshade-400 text-lg">Delivery Location</p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{deliveryLocation.streetAddress}</p>
            {deliveryLocation.apartment && (
              <p className="text-gray-700 dark:text-gray-300 mb-2">{deliveryLocation.apartment}</p>
            )}
            {deliveryLocation.landmark && (
              <p className="text-gray-700 dark:text-gray-300 mb-2">Landmark: {deliveryLocation.landmark}</p>
            )}
            <p className="text-gray-700 dark:text-gray-300">
              {deliveryLocation.city}, {deliveryLocation.state} {deliveryLocation.postalCode}
            </p>
            <p className="text-gray-700 dark:text-gray-300">{deliveryLocation.country}</p>
          </div>

          {/* Order Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              {cartState.addedProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-grayshade-300">
                  <div>
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {product.quantity}</p>
                  </div>
                  <p className="font-semibold">${product.price * product.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 dark:border-grayshade-300 pt-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-semibold">Order Total:</p>
              <p className="text-2xl font-bold text-purpleshade-400">${cartState.totalPrice}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg">Total Items:</p>
              <p className="text-lg">{cartState.ordersCount}</p>
            </div>
          </div>

          {/* Place Order Button */}
          <div className="mt-8 text-center">
            <button
              onClick={processOrder}
              disabled={isProcessingOrder}
              className="bg-purpleshade-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purpleshade-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingOrder ? 'Processing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
