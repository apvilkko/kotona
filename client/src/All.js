import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import Button from "./components/Button";
import LabeledInput from "./components/LabeledInput";
import useFetch from "./useFetch";

const DeviceControl = ({ device, setPendingReload, className }) => {
  const { doRequest, isLoading, data } = useFetch();
  const [request, setRequest] = useState({});

  useEffect(
    () => {
      if (request && request.id) {
        doRequest({
          method: "post",
          url: `/api/devices/${request.id}`,
          body: { state: request.state }
        });
      }
    },
    [request]
  );

  useEffect(
    () => {
      if (request.id && !isLoading) {
        setPendingReload(new Date().getTime());
      }
    },
    [data, isLoading]
  );

  return (
    <div className={className}>
      <Button
        color={device.on ? "green" : ""}
        onClick={() => setRequest({ id: device.id, state: !device.on })}
      >
        {device.name}
      </Button>
    </div>
  );
};

const StyledDeviceControl = styled(DeviceControl)`
  margin-bottom: 0.2em;
`;

const Filters = ({ className, lightsOnly, setLightsOnly }) => (
  <div className={className}>
    <LabeledInput
      type="checkbox"
      label="lights only"
      id="lightsOnly"
      value={lightsOnly}
      checked={lightsOnly}
      handleChange={() => () => setLightsOnly(!lightsOnly)}
    />
  </div>
);

const StyledFilters = styled(Filters)`
  margin-bottom: 0.5em;
`;

const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(
    () => {
      function tick() {
        savedCallback.current();
      }

      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    },
    [delay]
  );
};

const POLL_TIME = 29 * 1000;

export default () => {
  const [lightsOnly, setLightsOnly] = useState(true);
  const { doFetch, data } = useFetch();
  const [filtered, setFiltered] = useState([]);
  const [pendingReload, setPendingReload] = useState(false);

  const fetchAll = useCallback(() => {
    doFetch("/api/devices");
  });

  useEffect(
    () => {
      fetchAll();
    },
    [pendingReload]
  );

  useInterval(() => {
    fetchAll();
  }, POLL_TIME);

  useEffect(
    () => {
      if (data !== null) {
        setFiltered(
          lightsOnly ? data.filter(x => x.subtype === "light") : data
        );
      }
    },
    [data, lightsOnly]
  );

  if (!data) return null;
  return (
    <div>
      <StyledFilters lightsOnly={lightsOnly} setLightsOnly={setLightsOnly} />
      {filtered.map(device => (
        <StyledDeviceControl
          key={device.id}
          device={device}
          setPendingReload={setPendingReload}
        />
      ))}
    </div>
  );
};
