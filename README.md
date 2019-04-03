# Kotona

## Installation

Bind all your networked devices with MAC-IP binding in your router so they don't change even though you reboot your router.

## Integrations

### Trådfri

Build coap-client on your target machine (you need git to be setup):

```
sudo apt-get install libtool
git clone --recursive https://github.com/obgm/libcoap.git
cd libcoap
git checkout dtls
git submodule update --init --recursive
./autogen.sh
./configure --disable-documentation --disable-shared
make
sudo make install
```

Authenticate:

```
coap-client -m post -u "Client_identity" -k "$SECURITYCODE" -e '{"9090":"$USERNAME"}' "coaps://$GATEWAYIP:5684/15011/9063"
```

$SECURITYCODE is your Trådfri gateway security code, $USERNAME is freely choosable, $GATEWAYIP is your Trådfri gateway ip.

Response will contain the authentication key like so:

```
{"9091":"$KEY","9029":"1.4.0015"}
```

Then create commander/secrets.json with secrets.json.template and provide the required config.
