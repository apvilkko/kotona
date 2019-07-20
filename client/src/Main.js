import React from "react";
import styled from "styled-components";
import CommandsContainer from "./CommandsContainer";
import Button from "./components/Button";
import useFetch from "./hooks/useFetch";

const BaseCommand = ({ command, className, runCommand }) => {
  return (
    <Button className={className} onClick={runCommand(command.id)}>
      {command.name}
    </Button>
  );
};

const Command = styled(BaseCommand)`
  padding: 1rem;
  height: 3.5rem;
`;

const commandUrl = id => `/api/commands${id ? "/" + id : ""}`;

export default () => {
  const { doRequest } = useFetch();

  const runCommand = id => () => {
    doRequest({
      url: `${commandUrl(id)}/run`,
      method: "post"
    });
  };

  const render = data => {
    if (!data) return null;
    return (
      <div>
        {data.map(command => {
          return (
            <Command
              key={command.id}
              command={command}
              runCommand={runCommand}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <CommandsContainer render={render} />
    </div>
  );
};
