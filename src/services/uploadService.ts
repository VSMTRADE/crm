import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const uploadAvatar = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post(`${API_URL}/api/users/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.avatarUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};
