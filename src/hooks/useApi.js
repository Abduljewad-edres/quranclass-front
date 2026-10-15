import { useState, useCallback, useRef } from 'react';

/**
 * Generic hook for API calls with loading/error state.
 * Usage:
 *   const { data, loading, error, execute } = useApi(apiFn);
 *   execute(args) triggers the call.
 *
 * apiFn is stored in a ref so inline arrow functions don't
 * cause infinite re-render loops in useEffect dependencies.
 */
const useApi = (apiFn, initialData = null) => {
  const [data,    setData]    = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Keep latest apiFn without it being a useCallback/useEffect dependency
  const apiFnRef = useRef(apiFn);
  apiFnRef.current = apiFn;

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFnRef.current(...args);
      setData(res.data.data);
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // stable — never recreated

  return { data, loading, error, execute, setData };
};

export default useApi;
