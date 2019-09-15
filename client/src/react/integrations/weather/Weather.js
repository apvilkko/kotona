import React, { useCallback, useEffect } from "react";
import styled from "styled-components";
import ReactSVG from "react-svg";
import isEmpty from "../../utils/isEmpty";
import Loading from "../../components/Loading";
import Spacer from "../../components/Spacer";
import Smaller from "../../components/Smaller";
import BoxColumn from "../../components/BoxColumn";
import BoxRow from "../../components/BoxRow";
import useFetch from "../../hooks/useFetch";
import useWebSocket from "../../hooks/useWebSocket";
import getIcon from "./getIcon";
import RuuviTag from "./RuuviTag";
import WeatherChart from "./WeatherChart";
import time from "./time";

const integration = "weather/darksky";

const Icon = ({ icon, size = "md" }) => (
  <ReactSVG
    src={getIcon(icon)}
    svgClassName={`icon icon-${size}`}
    wrapper="span"
  />
);

function cap(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const Temperature = ({ amount, data, dataKey, variant = "" }) => {
  const realKey = dataKey + variant;
  const apparentKey = `apparent${cap(realKey)}`;
  const realData = data[realKey].toFixed(0);
  const apparentData = data[apparentKey].toFixed(0);
  return (
    <span>
      <span className={`temperature${amount === 2 ? "-2" : ""}`}>
        {realData}°
      </span>
      {apparentData !== realData ? (
        <>
          <Spacer />
          <Smaller>{apparentData}°</Smaller>
        </>
      ) : null}
    </span>
  );
};

const WeatherBox = ({ w, data, forecast, className }) => {
  return (
    <BoxColumn className={className}>
      <div className="box-title">{time(data.time, w.timezone, forecast)}</div>
      <BoxRow>
        <span>
          <Icon icon={data.icon} />
        </span>
        <BoxColumn>
          {forecast ? (
            <>
              <Temperature
                amount={2}
                data={data}
                dataKey="temperature"
                variant="High"
              />
              <Temperature
                amount={2}
                data={data}
                dataKey="temperature"
                variant="Low"
              />
            </>
          ) : (
            <Temperature data={data} dataKey="temperature" />
          )}
          <Smaller dimmer>
            <Icon icon={"wind"} size="sm" /> {data.windSpeed.toFixed(0)}
          </Smaller>
          <Smaller dimmer>{(data.humidity * 100).toFixed(0)}%</Smaller>
        </BoxColumn>
      </BoxRow>
    </BoxColumn>
  );
};

const StyledWeatherBox = styled(WeatherBox)`
  font-size: 1.2rem;
  line-height: 1.1;
  border: ${p => p.theme.box.border};
  border-radius: ${p => p.theme.box.borderRadius};
  padding: 0.2em;
  & svg {
    margin: -0.5rem;
  }
  .box-title {
    text-align: center;
    margin-bottom: 0.2rem;
    font-size: 0.7rem;
    color: ${p => p.theme.colors.dimmer};
  }
  .temperature {
    font-size: 1.7rem;
  }
  .temperature-2 {
    font-size: 1.5rem;
  }
`;

const CurrentlyComp = ({ w, className }) => (
  <StyledWeatherBox w={w} data={w.currently} className={className} />
);
const DailyComp = ({ w, data, className }) => (
  <StyledWeatherBox w={w} data={data} forecast className={className} />
);

const Currently = styled(CurrentlyComp)`
  width: 8em;
`;

const Daily = styled(DailyComp)`
  width: 6.5em;
  margin-right: 0.2rem;
  margin-bottom: 0.2rem;
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
    if (jsonData && jsonData.integration === integration) {
      setData([jsonData]);
    }
  }, [jsonData]);

  if (isEmpty(data) || isEmpty(data[0]) || isLoading) {
    return <Loading />;
  }
  const w = data[0];

  return (
    <div>
      <BoxRow>
        <Currently w={w} />
        <Spacer big />
        <RuuviTag jsonData={jsonData} />
      </BoxRow>
      <Spacer vertical />
      <BoxRow>
        {w.daily.data.map((day, i) =>
          i < 4 ? <Daily key={day.time} w={w} data={day} /> : null
        )}
      </BoxRow>
      <Spacer vertical />
      <WeatherChart w={w} />
      <Spacer vertical />
      <Smaller dimmer>
        {w.latitude.toFixed(4)}°, {w.longitude.toFixed(4)}°
      </Smaller>
    </div>
  );
};
