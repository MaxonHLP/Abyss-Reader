import api from './api';

export interface GrupoData {
  nombre: string;
  descripcion: string;
  portada?: string;
}

// Obtener todos los grupos
export const obtenerGrupos = async () => {
  const response = await api.get('/grupos');
  return response.data;
};

// Crear un nuevo grupo
export const crearGrupo = async (formData: FormData) => {
  const response = await api.post('/grupos', formData);
  return response.data;
};

// Editar grupo
export const editarGrupo = async (id: string | number, formData: FormData) => {
  const response = await api.put(`/grupos/${id}`, formData);
  return response.data;
};

// Eliminar grupo (sin contraseña)
export const eliminarGrupo = async (id: string | number) => {
  const response = await api.delete(`/grupos/${id}`);
  return response.data;
};

// Eliminar miembro
export const eliminarMiembro = async (id: string | number) => {
  const response = await api.delete(`/miembros/${id}`);
  return response.data;
};

// Obtener todas las características en paralelo (Géneros, Demografías, Tipos)
export const obtenerCaracteristicas = async () => {
  // Promise.all permite ejecutar las tres peticiones simultáneamente
  const [generos, demografias, tipos] = await Promise.all([
    api.get('/generos'),
    api.get('/demografias'),
    api.get('/tipos')
  ]);
  
  return {
    generos: generos.data,
    demografias: demografias.data,
    tipos: tipos.data
  };
};

// Crear una nueva Característica
export const crearGenero = async (data: { nombre: string }) => {
  const response = await api.post('/generos', data);
  return response.data;
};

export const crearTipo = async (data: { nombre: string }) => {
  const response = await api.post('/tipos', data);
  return response.data;
};

export const crearDemografia = async (data: { nombre: string }) => {
  const response = await api.post('/demografias', data);
  return response.data;
};

// Editar y Eliminar
export const editarCaracteristica = async (tipo: 'generos' | 'tipos' | 'demografias', id: number, nombre: string) => {
  const response = await api.put(`/${tipo}/${id}`, { nombre });
  return response.data;
};

export const eliminarCaracteristica = async (tipo: 'generos' | 'tipos' | 'demografias', id: number) => {
  const response = await api.delete(`/${tipo}/${id}`);
  return response.data;
};
