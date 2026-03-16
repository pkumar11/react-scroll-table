import { useEffect, useState } from "react";

type FetchResult<T> = {
  data: T[];// Always return an array for consistency, even if the API returns a single object
  loading: boolean;
  error: string | null;
};

// Custom hook responsible only for calling the API and handling errors.
export function useFetch<T = any>(
  url?: string,
  options?: RequestInit
): FetchResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const json = (await response.json()) as T[] | T;// Handle both array and single object responses
        const payload = Array.isArray(json) ? json : [json];

        if (!cancelled) {
          setData(payload);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Unknown error while fetching data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);// Ensure loading state is updated even if the component unmounts during the fetch
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, options]);

  return { data, loading, error };
}

