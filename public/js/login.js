/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const apiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://natours-production-1fa4.up.railway.app/api/v1/users'
    : 'http://127.0.0.1:3000/api/v1/users';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `${apiUrl}/login`,
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `${apiUrl}/logout`,
    });

    if (res.data.status === 'success') {
      console.log(res.data.status);
      showAlert('success', 'Logged out successfully!');
      location.assign('/');
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Please try again.');
  }
};
