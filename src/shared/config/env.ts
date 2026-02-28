const productionApiUrl = 'https://libro-backend-jx6d.onrender.com';
const localApiUrl = 'http://localhost:4000';

export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? productionApiUrl,
  apiUrlLocal: localApiUrl,
  apiUrlProduction: productionApiUrl
};
