import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import useFetch from "../../hooks/useFetch";
import Spacer from "../../components/Spacer";
import Smaller from "../../components/Smaller";
import BoxRow from "../../components/BoxRow";

const integration = "weather/ruuvitag";

const getTemperature = data => {
  if (data[0] === 3) {
    const sign = data[2] > 127 ? -1 : 1;
    const value = sign === -1 ? data[2] - 128 : data[2];
    return sign * value + data[3] / 100;
  }
  return -1;
};

const getHumidity = data => {
  if (data[0] === 3) {
    return data[1] / 2;
  }
  return -1;
};

const TagComp = ({ className, item }) => {
  const [data, setData] = useState(item.data);

  useEffect(() => {
    setData(item.data.map(Number));
  }, [item]);

  return (
    <BoxRow className={className}>
      <div className="tag-name">{item.name}</div>
      <div>
        <div className="tag-temperature">
          {getTemperature(data).toFixed(1)}°
        </div>
        <Spacer />
        <Smaller dimmer>{getHumidity(data).toFixed(1)}%</Smaller>
        <Spacer />
        <Smaller dimmer>
          (
          {new Date(item.meta.updated).toLocaleString("fi", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
          )
        </Smaller>
      </div>
    </BoxRow>
  );
};

const Tag = styled(TagComp)`
  .tag-name {
    width: 5em;
    font-size: 1.1rem;
    margin-right: 1rem;
  }
  .tag-temperature {
    display: inline-block;
    width: 3em;
  }
`;

const RuuviTagComp = ({ className, jsonData }) => {
  const { doFetch, data, isLoading, setData } = useFetch();

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
          const ret = [
            ...data.slice(0, index),
            jsonData,
            ...data.slice(index + 1)
          ];
          return ret;
        }
      }
      return data;
    });
  }, [jsonData]);

  if (!data || isLoading) return null;

  return (
    <div className={className}>
      {data.map(item => (
        <Tag key={item.id} item={item} />
      ))}
    </div>
  );
};

export default styled(RuuviTagComp)`
  line-height: 1.3;
`;
