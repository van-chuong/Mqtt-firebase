import mqtt from "mqtt"
import admin from 'firebase-admin';

import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

const mqtt_url = "mqtt://45.117.83.198:1883/"

export const saveData = () => {
    const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://test1-5ff57-default-rtdb.firebaseio.com"
    });

    var db = admin.database();
    var ref = db.ref("sensors");
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
            const temp = JSON.parse(message)

            ref.child(temp.devEUI).set({
                deviceName: temp.deviceName,
                devEUI: temp.devEUI,
                battery: temp.object.Battery,
                smoke: temp.object.Smoke,
                type: temp.object.Type,
                time: temp.rxInfo[0].time
            })
        } catch (error) {
            console.log(error)
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

