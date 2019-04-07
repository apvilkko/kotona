const parseCoap = require("./parseCoap");

const observeResponse = `v:1 t:CON c:GET i:b8d0 {} [ ]
decrypt_verify(): found 24 bytes cleartext
decrypt_verify(): found 242 bytes cleartext
{"9001":"TRADFRI bulb","9054":0,"9002":1554265794,"9020":1554265801,"9019":1,"9003":65537,"5750":2,"3":{"0":"IKEA of Sweden","1":"TRADFRI bulb E27 W opal 1000lm","2":"","3":"1.2.214","6":1},"3311":[{"9003":0,"5850":0,"5851":254}]}decrypt_verify(): found 243 bytes cleartext
{"9001":"TRADFRI bulb","9054":0,"9002":1554265794,"9020":1554265801,"9019":1,"9003":65537,"5750":2,"3":{"0":"IKEA of Sweden","1":"TRADFRI bulb E27 W opal 1000lm","2":"","3":"1.2.214","6":1},"3311":[{"9003":0,"5850":1,"5851":254}]}v:1 t:CON c:GET i:b8d1 {} [ Observe:1, Uri-Path:15001, Uri-Path:65537 ]
decrypt_verify(): found 242 bytes cleartext
{"9001":"TRADFRI bulb","9054":0,"9002":1554265794,"9020":1554265801,"9019":1,"9003":65537,"5750":2,"3":{"0":"IKEA of Sweden","1":"TRADFRI bulb E27 W opal 1000lm","2":"","3":"1.2.214","6":1},"3311":[{"9003":0,"5850":1,"5851":254}]}decrypt_verify(): found 243 bytes cleartext
{"9001":"TRADFRI bulb","9054":0,"9002":1554265794,"9020":1554265801,"9019":1,"9003":65537,"5750":2,"3":{"0":"IKEA of Sweden","1":"TRADFRI bulb E27 W opal 1000lm","2":"","3":"1.2.214","6":1},"3311":[{"9003":0,"5850":0,"5851":254}]}v:1 t:CON c:GET i:b8d2 {} [ Observe:1, Uri-Path:15001, Uri-Path:65537 ]
decrypt_verify(): found 242 bytes cleartext
{"9001":"TRADFRI bulb","9054":0,"9002":1554265794,"9020":1554265801,"9019":1,"9003":65537,"5750":2,"3":{"0":"IKEA of Sweden","1":"TRADFRI bulb E27 W opal 1000lm","2":"","3":"1.2.214","6":1},"3311":[{"9003":0,"5850":0,"5851":254}]}`;

test("parseCoap", () => {
  const result = parseCoap(observeResponse);

  expect(result.length).toBe(5);
  expect(result[4][3311][0][5850]).toBe(0);
});
