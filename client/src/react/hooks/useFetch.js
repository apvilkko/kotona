import { useEffect, useState } from "react";

export default () => {
  const [data, setData] = useState(null);
  const [request, setRequest] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!request.url) {
        return;
      }
      setError(null);
      setIsLoading(true);

      try {
        const opts = {
          method: request.method,
          headers: { "Content-Type": "application/json" }
        };
        if (request.body) {
          opts.body = JSON.stringify(request.body);
        }
        const resp = await fetch(request.url, opts);
        const json = await resp.json();

        setData(json);
      } catch (err) {
        setError(err);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [request]);

  const doRequest = req => {
    setRequest(req);
  };

  const doFetch = url => {
    doRequest({ method: "get", url });
  };

  return { data, isLoading, error, doFetch, doRequest, setData };
};
