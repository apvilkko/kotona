const websocket = ({ onData }) => {
  let ws = new WebSocket(`ws://${window.location.host}/ws/update`);

  const onSocketClose = () => {
    console.log("ws close, reloading");
    setTimeout(() => {
      window.location.reload(false);
    }, 1000);
  };

  const onError = e => {
    console.log("ws error", e);
    ws.close();
  };

  const onOpen = evt => {
    console.log("socket opened", evt);
  };

  const onMessage = evt => {
    if (evt && evt.data) {
      const jsonData = JSON.parse(evt.data);
      if (jsonData.id) {
        // console.log("set data from update", jsonData);
        onData(jsonData);
      }
    }
  };

  ws.addEventListener("open", onOpen);
  ws.addEventListener("message", onMessage);
  ws.addEventListener("close", onSocketClose);
  ws.addEventListener("error", onError);
  return () => {
    console.log("closing socket");
    ws.removeEventListener("close", onSocketClose);
    ws.close();
  };
};

const apiMethod = ({ method, url, data }) =>
  fetch(url, {
    method,
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  }).then(resp => {
    if (method !== "DELETE") {
      return resp.json();
    }
    return resp;
  });

const apiGet = url => apiMethod({ method: "GET", url });
const apiPost = (url, data) => apiMethod({ method: "POST", url, data });
const apiPut = (url, data) => apiMethod({ method: "PUT", url, data });
const apiDelete = url => apiMethod({ method: "DELETE", url });

export { apiGet, apiPost, apiPut, apiDelete, websocket };
