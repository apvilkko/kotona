import { useCallback, useState, useEffect } from "react";

const useWebsocket = () => {
  const [socket, setSocket] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [status, setStatus] = useState(null);

  const onSocketClose = useCallback(() => {
    setStatus("closed");
    console.log("ws close, reloading");
    setTimeout(() => {
      window.location.reload(false);
    }, 1000);
  });

  const onMessage = useCallback(evt => {
    if (evt && evt.data) {
      const jsonData = JSON.parse(evt.data);
      if (jsonData.id) {
        // console.log("set data from update");
        setJsonData(jsonData);
      }
    }
  });

  const onError = useCallback(
    e => {
      console.log("ws error", e);
      setStatus(`error ${e}`);
      socket.close();
    },
    [socket]
  );

  const onOpen = useCallback(evt => {
    console.log("socket opened", evt);
    setStatus("open");
  });

  useEffect(() => {
    let ws = new WebSocket(`ws://${window.location.host}/ws/update`);
    ws.addEventListener("open", onOpen);
    ws.addEventListener("message", onMessage);
    ws.addEventListener("close", onSocketClose);
    ws.addEventListener("error", onError);
    setSocket(ws);
    return () => {
      console.log("closing socket");
      ws.removeEventListener("close", onSocketClose);
      ws.close();
    };
  }, []);

  return { socket, jsonData, status };
};

export default useWebsocket;
