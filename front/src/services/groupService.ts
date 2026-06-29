import api from './api';

export const obtenerGrupoPorId = async (id: string) => {
  const response = await api.get(`/grupos/${id}`);
  return response.data;
};
