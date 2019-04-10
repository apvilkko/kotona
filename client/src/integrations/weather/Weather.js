import React, { useCallback, useEffect } from "react";
import styled from "styled-components";
import ReactSVG from "react-svg";
import isEmpty from "../../utils/isEmpty";
import Loading from "../../components/Loading";
import useFetch from "../../hooks/useFetch";
import useWebSocket from "../../hooks/useWebSocket";
import getIcon from "./getIcon";

const integration = "weather/darksky";

const time = (time, timezone, omitClock) => {
  const opts = {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timezone
  };
  if (omitClock) {
    delete opts.hour;
    delete opts.minute;
  }
  return new Date(time * 1000).toLocaleString("fi", opts);
};

const Icon = ({ icon, size = "md" }) => (
  <ReactSVG
    src={getIcon(icon)}
    svgClassName={`icon icon-${size}`}
    wrapper="span"
  />
);

const Smaller = styled("small")`
  display: inline-block;
  text-align: ${p => (p.center ? "center" : "left")};
`;

const Box = ({ className, children }) => (
  <div className={className}>{children}</div>
);

const BoxColumn = styled(Box)`
  display: flex;
  flex-direction: column;
`;

const BoxRow = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
const Spacer = styled("span")`
  display: ${p => (p.vertical ? "block" : "inline-block")};
  width: 0.5ch;
  height: ${p => (p.vertical ? "1ch" : "auto")};
`;

const WeatherBox = ({ w, data, forecast, className }) => {
  return (
    <BoxColumn className={className}>
      <Smaller center>{time(data.time, w.timezone, forecast)}</Smaller>
      <BoxRow>
        <span>
          <Icon icon={data.icon} />
        </span>
        <BoxColumn>
          {forecast ? (
            <>
              <span>
                <span>{data.temperatureHigh.toFixed(0)}°</span>
                <Spacer />
                <Smaller>{data.apparentTemperatureHigh.toFixed(0)}°</Smaller>
              </span>
              <span>
                <span>{data.temperatureLow.toFixed(0)}°</span>
                <Spacer />
                <Smaller>{data.apparentTemperatureLow.toFixed(0)}°</Smaller>
              </span>
            </>
          ) : (
            <span>
              <span>{data.temperature.toFixed(0)}°</span>
              <Spacer />
              <Smaller>{data.apparentTemperature.toFixed(0)}°</Smaller>
            </span>
          )}

          <Smaller>
            <Icon icon={"wind"} size="sm" /> {data.windSpeed.toFixed(0)}
          </Smaller>
          <Smaller>{(data.humidity * 100).toFixed(0)}%</Smaller>
        </BoxColumn>
      </BoxRow>
    </BoxColumn>
  );
};

const CurrentlyComp = ({ w, className }) => (
  <WeatherBox w={w} data={w.currently} className={className} />
);
const DailyComp = ({ w, data, className }) => (
  <WeatherBox w={w} data={data} forecast className={className} />
);

const Currently = styled(CurrentlyComp)`
  width: 33vw;
  border: 0.2em solid #555;
  border-radius: 1em;
  padding: 0.2em;
`;

const Daily = styled(DailyComp)`
  width: 25vw;
  margin-right: 1rem;
  border: 0.2em solid #555;
  border-radius: 1em;
  padding: 0.1em;
`;

export default () => {
  const { doFetch, data, isLoading, setData } = useFetch();
  const { jsonData } = useWebSocket();

  const fetchAll = useCallback(() => {
    doFetch(`/api/entities?type=${encodeURIComponent(integration)}`);
  });

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setData([jsonData]);
  }, [jsonData]);

  if (isEmpty(data) || isEmpty(data[0]) || isLoading) {
    return <Loading />;
  }
  const w = data[0];

  return (
    <div>
      <Smaller>
        {w.latitude}°, {w.longitude}°
      </Smaller>
      <Spacer vertical />
      <Currently w={w} />
      <Spacer vertical />
      <BoxRow>
        {w.daily.data.map((day, i) =>
          i < 4 ? <Daily key={day.time} w={w} data={day} /> : null
        )}
      </BoxRow>
    </div>
  );
};
