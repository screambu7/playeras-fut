/**
 * Utilidad centralizada para manejar errores de red y backend
 * Proporciona mensajes de error claros y humanos para el usuario
 */

export interface ApiError {
  message: string;
  isNetworkError: boolean;
  isTimeout: boolean;
  statusCode?: number;
}

/**
 * Detecta si un error es de red (backend no disponible)
 */
function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  // Errores de fetch/network
  if (error.message?.includes("fetch") || 
      error.message?.includes("network") ||
      error.message?.includes("Failed to fetch") ||
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND") {
    return true;
  }

  // Errores de timeout
  if (error.message?.includes("timeout") || error.name === "TimeoutError") {
    return true;
  }

  return false;
}

/**
 * Extrae mensaje de error legible del error de Medusa o red
 */
export function extractErrorMessage(error: any): string {
  if (!error) {
    return "Ha ocurrido un error inesperado";
  }

  // Error de red o backend caído
  if (isNetworkError(error)) {
    return "No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.";
  }

  // Error de timeout
  if (error.message?.includes("timeout") || error.name === "TimeoutError") {
    return "La solicitud tardó demasiado. Por favor, intenta nuevamente.";
  }

  // Error de Medusa con mensaje
  if (error.message) {
    // Mensajes de Medusa suelen venir en formato específico
    const medusaMessage = error.message;
    
    // Mensajes comunes de Medusa que podemos mejorar
    if (medusaMessage.includes("not found") || medusaMessage.includes("does not exist")) {
      return "El recurso solicitado no existe";
    }
    
    if (medusaMessage.includes("unauthorized") || medusaMessage.includes("forbidden")) {
      return "No tienes permisos para realizar esta acción";
    }
    
    if (medusaMessage.includes("validation") || medusaMessage.includes("invalid")) {
      return "Los datos proporcionados no son válidos";
    }

    return medusaMessage;
  }

  // Error genérico
  return "Ha ocurrido un error. Por favor, intenta nuevamente.";
}

/**
 * Crea un objeto ApiError estructurado
 */
export function createApiError(error: any): ApiError {
  const isNetwork = isNetworkError(error);
  const isTimeout = error?.message?.includes("timeout") || error?.name === "TimeoutError";
  
  return {
    message: extractErrorMessage(error),
    isNetworkError: isNetwork,
    isTimeout,
    statusCode: error?.response?.status || error?.status,
  };
}

/**
 * Verifica si el backend está disponible
 * Útil para mostrar mensajes preventivos
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const response = await fetch(`${baseUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000), // 3 segundos timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}
