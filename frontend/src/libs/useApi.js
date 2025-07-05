import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from './apis';

export function useApiQuery(key, endpoint, options = {}) {
  const {
    params,
    token,
    queryOptions = {},
    queryFnOverride,
  } = options;

  return useQuery({
    queryKey: Array.isArray(key) ? key : [key, params],
    queryFn: queryFnOverride
      ? () => queryFnOverride(endpoint, options)
      : () => api.get(endpoint, { params, token }),
    retry: 1,
    staleTime: 1000 * 60,
    ...queryOptions,
  });
}

export function useApiMutation(method = 'post', endpoint, options = {}) {
  const {
    params,
    token,
    mutationOptions = {},
    mutationFnOverride,
  } = options;

  return useMutation({
    mutationFn: mutationFnOverride
      ? (body) => mutationFnOverride(endpoint, body, options)
      : (body) => api[method](endpoint, body, { params, token }),
    ...mutationOptions,
  });
}

 