import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import Button from "./components/Button";
import LabeledInput from "./components/LabeledInput";
import useFetch from "./useFetch";
import throttle from "./throttle";
import isEqual from "./isEqual";
import { getColorChoices } from "./integrations/lights/tradfri";
import ColorChanger from "./ColorChanger";

const StyledRange = styled("input")`
  -webkit-appearance: none !important;
  border: 1px solid white;
  background: #222;
  height: 2.5em;
  width: 15em;
`;

const deviceState = device => ({
  on: device.on,
  brightness: Math.round(device.brightness),
  color: device.color
});

const DeviceControl = ({ device, setPendingReload, className }) => {
  const { doRequest, isLoading, data } = useFetch();
  const [request, setRequest] = useState({});
  const initState = deviceState(device);
  const [currentState, setCurrentState] = useState(initState);
  const [desiredState, setDesiredState] = useState(initState);
  const [uiState, setUiState] = useState(initState);
  const [uiRequestPending, setUiRequestPending] = useState(false);
  const [colors, setColors] = useState(getColorChoices(device));

  const throttled = useRef(
    throttle(newValue => {
      setDesiredState(desiredState => {
        // console.log("throttle", newValue, desiredState);
        const rounded = Math.round(newValue);
        if (rounded !== desiredState.brightness) {
          // console.log("set desired brightness", rounded);
          return {
            ...desiredState,
            brightness: rounded
          };
        }
        return desiredState;
      });
    }, 500)
  );

  useEffect(
    () => {
      // throttle dimmer control
      throttled.current(uiState.brightness);

      if (uiState.color !== desiredState.color) {
        setDesiredState({
          ...desiredState,
          color: uiState.color
        });
      }
      if (uiState.on !== desiredState.on) {
        setDesiredState({
          ...desiredState,
          on: uiState.on
        });
      }
    },
    [uiState]
  );

  // update device data from backend
  useEffect(
    () => {
      const newState = deviceState(device);
      // console.log("set current from backend");
      setCurrentState(newState);
      setDesiredState(newState);
      setUiState(newState);
      setTimeout(() => {
        setUiRequestPending(false);
      }, 400);
    },
    [device]
  );

  // send change request to backend
  useEffect(
    () => {
      if (request && request.id) {
        // console.log("request", request);
        doRequest({
          method: "post",
          url: `/api/devices/${request.id}`,
          body: request
        });
        setUiRequestPending(true);
      }
    },
    [request]
  );

  useEffect(
    () => {
      if (!uiRequestPending && !isEqual(desiredState, currentState)) {
        // console.log("desiredState change", desiredState);
        let handled = false;
        if (Math.abs(desiredState.brightness - currentState.brightness) > 1) {
          setRequest({ id: device.id, dimmer: desiredState.brightness });
          handled = true;
        }
        if (!handled && desiredState.color !== currentState.color) {
          setRequest({ id: device.id, color: desiredState.color });
          handled = true;
        }
        if (!handled && desiredState.on !== currentState.on) {
          setRequest({ id: device.id, state: desiredState.on });
        }
      }
    },
    [desiredState]
  );

  // reload data when change requests complete
  useEffect(
    () => {
      if (request.id && !isLoading) {
        setTimeout(() => {
          setPendingReload(new Date().getTime());
        }, 1000);
      }
    },
    [data, isLoading]
  );

  return (
    <div className={className}>
      <Button
        color={uiState.on ? "green" : ""}
        onClick={() => setUiState({ ...uiState, on: !uiState.on })}
      >
        {device.name}
      </Button>
      <StyledRange
        type="range"
        min="0"
        max="100"
        value={uiState.brightness}
        onChange={e => setUiState({ ...uiState, brightness: e.target.value })}
      />
      <ColorChanger
        colors={colors}
        value={uiState.color}
        handleChange={color => setUiState({ ...uiState, color })}
      />
    </div>
  );
};

const StyledDeviceControl = styled(DeviceControl)`
  margin-bottom: 0.2em;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  & > * {
    margin-left: 0.5em;
  }
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

const POLL_TIME = 15 * 1000;

let socket = null;

export default () => {
  const [lightsOnly, setLightsOnly] = useState(true);
  const { doFetch, data, setData } = useFetch();
  const [filtered, setFiltered] = useState([]);
  const [pendingReload, setPendingReload] = useState(false);
  const [message, setMessage] = useState({});

  const fetchAll = useCallback(() => {
    doFetch("/api/devices");
  });

  const openWs = useCallback(() => {
    socket = new WebSocket(`ws://${window.location.host}/ws/update`);
    socket.addEventListener("open", evt => {
      console.log("socket opened", evt);
    });
    socket.addEventListener("message", evt => {
      if (evt && evt.data) {
        const jsonData = JSON.parse(evt.data);
        if (jsonData.id) {
          // console.log("set data from update");
          setMessage(jsonData);
        }
      }
    });
    socket.addEventListener("close", () => {
      console.log("ws close, reloading");
      setTimeout(() => {
        window.location.reload(false);
      }, 1000);
    });
    socket.addEventListener("error", e => {
      console.log("ws error", e);
      socket.close();
    });
  });

  useEffect(() => {
    fetchAll();
    openWs();
  }, []);

  useEffect(
    () => {
      setData(data => {
        if (data) {
          const id = message.id;
          const index = data.findIndex(item => item.id === id);
          return [...data.slice(0, index), message, ...data.slice(index + 1)];
        }
        return data;
      });
    },
    [message]
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
