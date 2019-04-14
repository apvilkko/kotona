import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import LabeledInput from "../../components/LabeledInput";
import Loading from "../../components/Loading";
import BoxColumn from "../../components/BoxColumn";
import BoxRow from "../../components/BoxRow";
import useFetch from "../../hooks/useFetch";
import useWebSocket from "../../hooks/useWebSocket";
import throttle from "../../utils/throttle";
import isEqual from "../../utils/isEqual";
import { getColorChoices, COLD_WARM_COLORS } from "./tradfri";
import ColorChanger from "./ColorChanger";

const integration = "lights/tradfri";

const thumbStyle = p => `
  border: none;
  height: 1rem;
  width: 0.5rem;
  border-radius: 3px;
  background: ${p.theme.colors.accentLight};
  cursor: pointer;
`;

const InputRange = ({ className, ...rest }) => (
  <div className={className}>
    <input {...rest} />
  </div>
);

const StyledRange = styled(InputRange)`
  display: inline-block;
  width: 100%;
  & > input[type=range] {
    width: 98%;
    border: none;
    cursor: pointer;
    height: 1rem;
    &::-webkit-slider-thumb { ${p => thumbStyle(p)} }
    &::-moz-range-thumb { ${p => thumbStyle(p)}
  }
`;

const entityState = entity => ({
  on: entity.on,
  brightness: Math.round(entity.brightness),
  color: entity.color
});

const LightControl = ({ entity, className }) => {
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
    <BoxColumn className={`${className} ${uiState.on ? "light-on" : ""}`}>
      <button
        type="button"
        className="light-toggle"
        onClick={() => setUiState({ ...uiState, on: !uiState.on })}
        style={uiState.on ? { background: `#${uiState.color}` } : {}}
      >
        {entity.name}
      </button>
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
    </BoxColumn>
  );
};

const StyledLightControl = styled(LightControl)`
  margin-bottom: 0.2em;
  margin-right: 0.2em;
  display: flex;
  width: 10em;
  height: 4.3rem;
  border: ${p => p.theme.box.border};
  border-radius: ${p => p.theme.box.borderRadius};
  justify-content: flex-start;
  align-items: center;

  .color-modal-toggle-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  & .light-toggle {
    width: 100%;
    padding-top: 0.2em;
    padding-bottom: 0.1em;
    border: none;
    background: none;
    border-radius: ${p => p.theme.box.borderRadius};
  }

  & .color-modal-toggle {
    display: block;
    width: 1.2rem;
    height: 1.2rem;
    border: none;
    border-radius: ${p => p.theme.box.borderRadius};
    position: relative;

  }

  &.light-on .color-modal-toggle {
    width: 100%;
    height: 1.45rem;
    &:after {
      display: block;
      content: '';
      position: absolute;
      top: 0
      left: 0;
      height: 50%;
      width: 100%;
      z-index: -1;
      background: inherit;
    }
  }

  &.light-on .light-toggle {
    background: #${COLD_WARM_COLORS[0]};
    color: ${p => p.theme.colors.dark};
    position: relative;
    &:after {
      display: block;
      content: '';
      position: absolute;
      bottom: 0
      left: 0;
      height: 50%;
      width: 100%;
      z-index: -1;
      background: inherit;
    }
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
    <BoxRow top>
      {/* <StyledFilters lightsOnly={lightsOnly} setLightsOnly={setLightsOnly} /> */}
      {filtered.map(entity => (
        <StyledLightControl key={entity.id} entity={entity} />
      ))}
    </BoxRow>
  );
};
