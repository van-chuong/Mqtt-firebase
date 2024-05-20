import mqtt from "mqtt"
import sdk, { AppwriteException } from 'node-appwrite';

let client = new sdk.Client();

client.setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("664b503a0039576e07ef")
    .setKey("API_KEY")

const databases = new sdk.Databases(client);

const mqtt_url = "mqtt://45.117.83.198:1883/"

export const saveData = () => {
    var client = mqtt.connect(mqtt_url)
    let topicName = `application/85/device/+/event/up`

    client.on("connect", function () {
        console.log("client connect successfully")

        client.subscribe(topicName, (err, granted) => {
            if (err) {
                console.log(err, 'err');
            }

            console.log(granted, 'granted')
        })
    })

    client.on('message', async (topic, message, packet) => {
        try {
            const temp = JSON.parse(message);
        
            try {
              await databases.createDocument(
                "664b5b640000d1b66890",
                "664b5b790033201b89ab",
                temp.devEUI,
                {
                  deviceName: temp.deviceName,
                  devEUI: temp.devEUI,
                  Battery: temp.object.Battery,
                  Smoke: temp.object.Smoke,
                  Type: temp.object.Type,
                  time: temp.rxInfo[0].time,
                }
              );
              console.log('Document created successfully');
            } catch (error) {
              if (error instanceof AppwriteException && error.code === 409) {
                // Document with the requested ID already exists, update the existing document
                await databases.updateDocument(
                  "664b5b640000d1b66890",
                  "664b5b790033201b89ab",
                  temp.devEUI,
                  {
                    deviceName: temp.deviceName,
                    devEUI: temp.devEUI,
                    Battery: temp.object.Battery,
                    Smoke: temp.object.Smoke,
                    Type: temp.object.Type,
                    time: temp.rxInfo[0].time,
                  }
                );
                console.log('Document updated successfully');
              } else {
                throw error;
              }
            }
          } catch (error) {
            console.error('Error processing message:', error);
          }
    })

    client.on("packetsend", (packet) => {
        
    })

    client.on("error", function (error) {
        console.log('err: ', error)
    })

    client.on("close", function () {
        console.log("closed")
    })
}

