import React, { useEffect } from "react";
import Loading from "./components/Loading";
import useFetch from "./hooks/useFetch";

const CommandsContainer = ({ render, reload }) => {
  const { data, isLoading, error, doFetch } = useFetch();

  useEffect(() => {
    doFetch("/api/commands");
  }, [reload]);

  if (error) return "" + error;
  if (isLoading) return <Loading />;
  return <div>{render(data)}</div>;
};

export default CommandsContainer;
