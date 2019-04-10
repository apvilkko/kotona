import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import Button from "../../components/Button";
import LabeledInput from "../../components/LabeledInput";
import Loading from "../../components/Loading";
import useFetch from "../../hooks/useFetch";
import useWebSocket from "../../hooks/useWebSocket";
import throttle from "../../utils/throttle";
import isEqual from "../../utils/isEqual";
import { getColorChoices } from "./tradfri";
import ColorChanger from "./ColorChanger";

const integration = "lights/tradfri";

const StyledRange = styled("input")`
  -webkit-appearance: none !important;
  border: 1px solid white;
  background: #222;
  height: 2.5em;
  width: 15em;
`;

const entityState = entity => ({
  on: entity.on,
  brightness: Math.round(entity.brightness),
  color: entity.color
});

const EntityControl = ({ entity, className }) => {
  const { doRequest } = useFetch();
  const [request, setRequest] = useState({});
  const initState = entityState(entity);
  const [currentState, setCurrentState] = useState(initState);
  const [desiredState, setDesiredState] = useState(initState);
  const [uiState, setUiState] = useState(initState);
  const [uiRequestPending, setUiRequestPending] = useState(false);
  const [colors, setColors] = useState(getColorChoices(entity));

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

  useEffect(() => {
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
  }, [uiState]);

  // update entity data from backend
  useEffect(() => {
    const newState = entityState(entity);
    // console.log("set current from backend");
    setCurrentState(newState);
    setDesiredState(newState);
    setUiState(newState);
    const timeout = setTimeout(() => {
      setUiRequestPending(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [entity]);

  // send change request to backend
  useEffect(() => {
    if (request && request.id) {
      // console.log("request", request);
      doRequest({
        method: "post",
        url: `/api/entities/${request.id}`,
        body: { ...request, integration }
      });
      setUiRequestPending(true);
    }
  }, [request]);

  useEffect(() => {
    if (!uiRequestPending && !isEqual(desiredState, currentState)) {
      // console.log("desiredState change", desiredState);
      let handled = false;
      if (Math.abs(desiredState.brightness - currentState.brightness) > 1) {
        setRequest({ id: entity.id, dimmer: desiredState.brightness });
        handled = true;
      }
      if (!handled && desiredState.color !== currentState.color) {
        setRequest({ id: entity.id, color: desiredState.color });
        handled = true;
      }
      if (!handled && desiredState.on !== currentState.on) {
        setRequest({ id: entity.id, state: desiredState.on });
      }
    }
  }, [desiredState]);

  return (
    <div className={className}>
      <Button
        color={uiState.on ? "green" : ""}
        onClick={() => setUiState({ ...uiState, on: !uiState.on })}
      >
        {entity.name}
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

const StyledEntityControl = styled(EntityControl)`
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

export default () => {
  const [lightsOnly, setLightsOnly] = useState(true);
  const { doFetch, data, setData, isLoading } = useFetch();
  const [filtered, setFiltered] = useState([]);
  const [message, setMessage] = useState({});
  const { jsonData } = useWebSocket();

  const fetchAll = useCallback(() => {
    doFetch(`/api/entities?type=${encodeURIComponent(integration)}`);
  });

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setData(data => {
      if (data) {
        const id = jsonData.id;
        const index = data.findIndex(item => item.id === id);
        if (index > -1) {
          return [...data.slice(0, index), jsonData, ...data.slice(index + 1)];
        }
      }
      return data;
    });
  }, [jsonData]);

  useEffect(() => {
    if (data !== null) {
      setFiltered(
        lightsOnly
          ? data.filter(x => x.subtype === "light" || x.subtype === "outlet")
          : data
      );
    }
  }, [data, lightsOnly]);

  if (!data || isLoading) return <Loading />;
  return (
    <div>
      {/* <StyledFilters lightsOnly={lightsOnly} setLightsOnly={setLightsOnly} /> */}
      {filtered.map(entity => (
        <StyledEntityControl key={entity.id} entity={entity} />
      ))}
    </div>
  );
};
