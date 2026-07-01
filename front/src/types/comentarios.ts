// Tipos para el sistema de comentarios anidados de Abyss Reader

export interface Comentario {
  id: number;
  autorNombre: string;
  autorAvatar: string | null;
  contenido: string;
  fechaCreacion: string; // ISO string desde Spring
  eliminado: boolean;
  respuestas: Comentario[]; // Recursivo
}

export interface ComentariosPage {
  content: Comentario[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  number: number; // número de página actual
}
