/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const apiUrl = '/api/v1/users';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? `${apiUrl}/api/v1/users/updateMyPassword`
        : `${apiUrl}/api/v1/users/updateMe`;

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
