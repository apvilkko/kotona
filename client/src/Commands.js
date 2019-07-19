import React, { useState, useEffect } from "react";
import Loading from "./components/Loading";
import Button from "./components/Button";
import useFetch from "./hooks/useFetch";
import CommandEditor from "./CommandEditor";

const CommandsContainer = ({ render, reload }) => {
  const { data, isLoading, error, doFetch } = useFetch();

  useEffect(() => {
    doFetch("/api/commands");
  }, [reload]);

  if (error) return "" + error;
  if (isLoading) return <Loading />;
  return <div>{render(data)}</div>;
};

const CommandListItem = ({ item, setEditing, remove, runCommand }) => (
  <div>
    {item.name}
    <Button onClick={() => setEditing(item.id)}>Edit</Button>
    <Button onClick={remove(item.id)}>Remove</Button>
    <Button onClick={runCommand(item.id)}>Run</Button>
  </div>
);

const CommandsList = ({ data, setEditing, remove, runCommand }) =>
  data ? (
    <div>
      <p>{JSON.stringify(data)}</p>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            <CommandListItem
              item={item}
              setEditing={setEditing}
              remove={remove}
              runCommand={runCommand}
            />
          </li>
        ))}
      </ul>
    </div>
  ) : null;

const commandUrl = id => `/api/commands${id ? "/" + id : ""}`;

export default () => {
  const [editing, setEditing] = useState(null);
  const [reload, setReload] = useState("");
  const { doRequest, isLoading } = useFetch();
  const [pendingReload, setPendingReload] = useState(false);

  useEffect(() => {
    if (!isLoading && pendingReload) {
      setPendingReload(false);
      setReload(new Date().getTime());
    }
  }, [reload, isLoading]);

  const requestReload = () => setPendingReload(true);

  const handleSave = draft => {
    doRequest({
      url: commandUrl(draft.id),
      method: draft.id ? "put" : "post",
      body: draft
    });
    requestReload();
  };

  const handleRemove = id => () => {
    doRequest({
      url: commandUrl(id),
      method: "delete"
    });
    requestReload();
  };

  const runCommand = id => () => {
    doRequest({
      url: `${commandUrl(id)}/run`,
      method: "post"
    });
  };

  return (
    <CommandsContainer
      reload={reload}
      render={data => {
        if (editing)
          return (
            <CommandEditor
              current={editing}
              currentData={
                editing === "newdata" ? {} : data.find(x => x.id === editing)
              }
              onExit={draft => {
                if (draft) {
                  handleSave(draft);
                }
                setEditing(null);
              }}
            />
          );
        return (
          <>
            <CommandsList
              data={data}
              setEditing={setEditing}
              remove={handleRemove}
              runCommand={runCommand}
            />
            <div>
              <Button onClick={() => setEditing("new")}>Add command</Button>
            </div>
          </>
        );
      }}
    />
  );
};
