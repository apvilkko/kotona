import { useCallback, useState, useEffect } from "react";

const useWebsocket = () => {
  const [socket, setSocket] = useState(
    new WebSocket(`ws://${window.location.host}/ws/update`)
  );
  const [jsonData, setJsonData] = useState(null);

  const onSocketClose = useCallback(() => {
    console.log("ws close, reloading");
    return setTimeout(() => {
      window.location.reload(false);
    }, 1000);
  });

  useEffect(() => {
    socket.addEventListener("open", evt => {
      console.log("socket opened", evt);
    });
    socket.addEventListener("message", evt => {
      if (evt && evt.data) {
        const jsonData = JSON.parse(evt.data);
        if (jsonData.id) {
          // console.log("set data from update");
          setJsonData(jsonData);
        }
      }
    });
    socket.addEventListener("close", onSocketClose);
    socket.addEventListener("error", e => {
      console.log("ws error", e);
      socket.close();
    });
    return () => {
      console.log("closing socket");
      socket.removeEventListener("close", onSocketClose);
      socket.close();
    };
  }, []);

  return { socket, jsonData };
};

export default useWebsocket;
