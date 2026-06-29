import api from './api';

export interface CapituloResponseDTO {
  id: number;
  numero: number;
  obraId: number;
  createdAt: string;
  updatedAt: string;
  paginasUrls: string[];
  capituloAnteriorId: number | null;
  capituloSiguienteId: number | null;
  /** Número exacto del capítulo anterior (null si no existe) */
  numeroAnterior: number | null;
  /** Número exacto del capítulo siguiente (null si no existe) */
  numeroSiguiente: number | null;
}

/**
 * Obtiene los datos de un capítulo (incluyendo las URLs de las páginas y los IDs
 * de navegación) desde el endpoint público GET /api/obras/{nombreObra}/capitulos/{numero}.
 *
 * @param nombreObra - nombre de la obra tal como aparece en la URL (con guiones o espacios)
 * @param numero     - número del capítulo
 */
export async function obtenerCapituloDeObra(
  nombreObra: string,
  numero: number
): Promise<CapituloResponseDTO> {
  const response = await api.get<CapituloResponseDTO>(
    `/obras/${nombreObra}/capitulos/${numero}`
  );
  return response.data;
}
