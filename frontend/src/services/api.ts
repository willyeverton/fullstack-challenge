import axios from 'axios';

// Configuração base do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aqui podemos implementar um tratamento de erro global
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api; 