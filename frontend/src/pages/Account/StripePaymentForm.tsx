import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import useColorMode from '../../hooks/useColorMode';
import { paymentService } from '../../services/api';
import { Plan } from '../../services/Plan';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

interface StripePaymentFormProps {
  plan: Plan;
  onSuccess: () => void;
  onCancel: () => void;
  paymentMethod?: string;
}

const CheckoutForm: React.FC<StripePaymentFormProps> = ({ plan, onSuccess, onCancel, paymentMethod = 'stripe' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [months, setMonths] = useState(1);
  const [isCardNumberComplete, setIsCardNumberComplete] = useState(false);
  const [isCardExpiryComplete, setIsCardExpiryComplete] = useState(false);
  const [isCardCvcComplete, setIsCardCvcComplete] = useState(false);

  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [colorMode] = useColorMode();

  const totalPrice = (parseFloat(plan.price) * months).toFixed(2);

  const areAllFieldsFilled = () => {
    return (
      cardholderName.trim() !== '' &&
      isCardNumberComplete &&
      isCardExpiryComplete &&
      isCardCvcComplete
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !user) return;

    setLoading(true);
    setError(null);

    try {
      const paymentIntentResponse = await paymentService.createPaymentIntent(
        plan.id,
        user.id,
        months,
        paymentMethod
      );

      if (!paymentIntentResponse.data) {
        throw new Error('Failed to initialize payment');
      }

      const { clientSecret, paymentId } = paymentIntentResponse.data;

      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) throw new Error("Card element missing");

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              name: cardholderName || user.name,
              email: user.email,
            },
          },
        }
      );

      if (stripeError) throw stripeError;

      if (paymentIntent?.status === 'succeeded') {
        await paymentService.confirmPayment(paymentId);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="w-full max-w-[100vw] overflow-x-hidden px-2 ">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/30 border-2 border-primary/30">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-xl sm:text-2xl">📅</span>
            </div>
            Subscription Details
          </h3>

          <div className="mb-4">
            <label className="block text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
              Duration (months)
            </label>
            <select
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg border-2 border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <option key={num} value={num}>
                  {num} month{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/30 border-2 border-primary/30">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-xl sm:text-2xl">💳</span>
            </div>
            Payment Details
          </h3>

          <div className="space-y-4 sm:space-y-5">
            <div className="relative">
              <label className="block text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 mb-2">
                Cardholder Name
              </label>
              <input
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg border-2 border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="John Doe"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
              />
            </div>

            <div className="relative">
              <label className="block text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 mb-2">
                Card Number
              </label>
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <CardNumberElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: colorMode === 'dark' ? '#ffffff' : '#1a1a1a',
                        '::placeholder': { color: colorMode === 'dark' ? '#94a3b8' : '#64748b' },
                        iconColor: '#3b82f6',
                      },
                      invalid: { color: '#ef4444' },
                    },
                  }}
                  onChange={(e) => setIsCardNumberComplete(e.complete)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              <div className="relative">
                <label className="block text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Expiration Date
                </label>
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <CardExpiryElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: colorMode === 'dark' ? '#ffffff' : '#1a1a1a',
                          '::placeholder': { color: colorMode === 'dark' ? '#94a3b8' : '#64748b' },
                          iconColor: '#3b82f6',
                        },
                        invalid: { color: '#ef4444' },
                      },
                    }}
                    onChange={(e) => setIsCardExpiryComplete(e.complete)}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 mb-2">
                  CVC
                </label>
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <CardCvcElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: colorMode === 'dark' ? '#ffffff' : '#1a1a1a',
                          '::placeholder': { color: colorMode === 'dark' ? '#94a3b8' : '#64748b' },
                          iconColor: '#3b82f6',
                        },
                        invalid: { color: '#ef4444' },
                      },
                    }}
                    onChange={(e) => setIsCardCvcComplete(e.complete)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/30 border-2 border-primary/30">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-5">
            Order Summary
          </h3>

          <div className="space-y-2.5 sm:space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Plan:</span>
              <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">{plan.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Monthly Price:</span>
              <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">${plan.price} USD</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Duration:</span>
              <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">
                {months} month{months !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="h-px bg-gray-200/50 dark:bg-gray-700 my-3 sm:my-4"></div>

            <div className="flex justify-between items-center">
              <span className="text-lg sm:text-sm font-bold text-gray-800 dark:text-gray-200">Total:</span>
              <span className="text-lg sm:text-sm font-bold text-primary">${totalPrice} USD</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 p-3 sm:p-4 rounded-lg border-2 border-red-200 dark:border-red-700">
            <p className="text-red-600 dark:text-red-400 font-medium text-sm sm:text-base">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg hover:shadow-red-500/20 transition-all duration-300 text-sm sm:text-base font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 sm:px-6 py-2 sm:py-3 bg-primary hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-sm sm:text-base font-medium disabled:opacity-50"
            disabled={loading || !areAllFieldsFilled()}
          >
            {loading ? 'Processing...' : `Pay $${totalPrice}`}
          </button>
        </div>
      </form>
    </div>
  );
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm;

