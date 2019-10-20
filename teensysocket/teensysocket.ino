#include <Arduino.h>

#include <SPI.h>
#include <Ethernet.h>
#include <SocketIoClient.h>


SocketIoClient webSocket;

void event(const char * payload, size_t length) {
  Serial.printf("got message: %s\n", payload);
}


// Enter a MAC address of your Ethernet shield or Arduino.
byte mac[] = {   0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x02};


// Arduino's IP address, dependent on your network configuration

IPAddress ip(169, 254, 158, 133);
IPAddress server(169,254,158,134);



int pin = 13; //pin on Arduino you want to toggle
int pinVal = 0;

// Create the Ethernet client
EthernetClient client;

void setup()
{
  Ethernet.begin(mac, ip);
  Serial.begin(9600);

  delay(1000);

  Serial.println("connecting...");

  for(uint8_t t = 4; t > 0; t--) {
  Serial.printf("[SETUP] BOOT WAIT %d...\n", t);
  Serial.flush();
  delay(1000);
      }
    webSocket.on("event", event);
    webSocket.begin("my.socket-io.server");
}

void loop() {
    webSocket.loop();
}
