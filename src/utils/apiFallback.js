import apiClient from '../api/axiosConfig';

const METHODS_WITHOUT_BODY = new Set(['get', 'delete', 'head', 'options']);

const isFallbackError = (error) => {
  const status = error?.response?.status;
  return status === 404 || status === 405;
};

const requestWithFallback = async (method, paths, options = {}) => {
  if (!Array.isArray(paths) || paths.length === 0) {
    throw new Error('requestWithFallback requires a non-empty array of paths.');
  }

  const normalizedMethod = method.toLowerCase();
  const { data, ...config } = options;
  let lastError;

  for (const path of paths) {
    try {
      if (METHODS_WITHOUT_BODY.has(normalizedMethod)) {
        const response = await apiClient[normalizedMethod](path, config);
        return response;
      }

      const response = await apiClient[normalizedMethod](path, data, config);
      return response;
    } catch (error) {
      if (isFallbackError(error)) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error(`All endpoints failed for ${method.toUpperCase()} ${paths[0]}`);
};

export default requestWithFallback;
