import React, { useEffect, useState } from "react";
import Button from "./components/Button";
import LabeledInput from "./components/LabeledInput";
import useFetch from "./useFetch";

const DeviceControl = ({ device, setPendingReload }) => {
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
    <div>
      <Button
        color={device.on ? "green" : ""}
        onClick={() => setRequest({ id: device.id, state: !device.on })}
      >
        {device.name}
      </Button>
    </div>
  );
};

export default () => {
  const [lightsOnly, setLightsOnly] = useState(true);
  const { doFetch, data } = useFetch();
  const [filtered, setFiltered] = useState([]);
  const [pendingReload, setPendingReload] = useState(false);

  useEffect(
    () => {
      doFetch("/api/devices");
    },
    [pendingReload]
  );

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
      <LabeledInput
        type="checkbox"
        label="lights only"
        id="lightsOnly"
        value={lightsOnly}
        checked={lightsOnly}
        handleChange={() => () => setLightsOnly(!lightsOnly)}
      />
      {filtered.map(device => (
        <DeviceControl
          key={device.id}
          device={device}
          setPendingReload={setPendingReload}
        />
      ))}
    </div>
  );
};
