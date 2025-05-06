import axios from 'axios';
import { showAlert } from './alerts';

const apiUrl = '/api/v1/users';

const { default: Stripe } = require('stripe');

const stripe = Stripe(
  'pk_test_51QJcjtGTyTn0JNvNXyn9ivFIvmcw0A496OvMdeInM7pYgePC41XqDhksmgeTbEd35iAFhx5K59IvOvkh0uu2oHtL00xbNJdTSU',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get the checkout session from API:
    const session = await axios(
      `${apiUrl}/api/v1/bookings/checkout-session/${tourId}`,
    );
    // console.log(session);
    // 2) Create checkout form + charge credit card
    // await stripe.redirectToCheckOut({
    //   sessionId: session.data.session.id,
    // });
    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
