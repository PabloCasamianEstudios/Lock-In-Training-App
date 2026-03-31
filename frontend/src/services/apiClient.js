const formatError = (error) => {
  const msg = error.message || String(error);
  
  if (msg.includes('ECONNREFUSED')) return 'Error de conexión: El servidor no responde.';
  if (msg.includes('already registered')) return 'Este email ya está en uso por otro usuario.';
  if (msg.includes('already taken')) return 'Este nombre de usuario ya está ocupado.';
  if (msg.includes('Invalid email format')) return 'Formato de email no válido (falta @ o dominio).';
  if (msg.includes('6 characters')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('Authentication failure') || msg.includes('Usuario no encontrado')) return 'Email o contraseña incorrectos.';
  if (msg.includes('Token expired')) return 'Sesión caducada. Por favor, accede de nuevo.';
  
  return msg;
};

const apiClient = async (endpoint, { body, ...customConfig } = {}) => {
  const token = localStorage.getItem('lockin_token');
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    let data;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (parseError) {
      data = response.statusText;
    }

    if (!response.ok) {
      const errorMessage = (typeof data === 'object' ? data.message || data.error : data) || response.statusText;
      throw new Error(formatError(new Error(errorMessage)));
    }

    if (response.status === 204) {
      return null;
    }

    return data;
  } catch (error) {
    throw new Error(formatError(error));
  }
};

export default apiClient;
