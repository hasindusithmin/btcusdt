require('dotenv').config()
const express = require('express')
const cors = require('cors')
const WebSocket = require('ws')
const dynamoClient = require('./utils/dynamoclient');


const app = express()
const port = process.env.PORT || 5000
app.use(cors())

app.get('/', (req, res) => {
    res.status(200).json({ message: "BTCUSDT binnace stream" })
})

app.get('/retrieve', async (req, res) => {
    try {
        const { Items } = await dynamoClient.scan({
            TableName: 'sticks'
        }).promise()
        res.status(200).json(Items)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

app.get('/retrieve/onehour', async (req, res) => {
    try {
        const date = new Date();
        let hour = date.getUTCHours();
        if (hour < 1) hour += 24
        const target_hour = hour - 1;
        const { Items } = await dynamoClient.scan({
            TableName: 'sticks',
            FilterExpression: 'utc_hour = :th',
            ExpressionAttributeValues: {
                ':th': target_hour
            }
        }).promise()
        res.status(200).json(Items)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

app.get('/retrieve/twohour', async (req, res) => {
    try {
        const date = new Date();
        let hour = date.getUTCHours();
        if (hour < 2) hour += 24;
        const target_hour = hour - 2;
        const { Items } = await dynamoClient.scan({
            TableName: 'sticks',
            FilterExpression: 'utc_hour = :th',
            ExpressionAttributeValues: {
                ':th': target_hour
            }
        }).promise()
        res.status(200).json(Items)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

app.get('/retrieve/threehour', async (req, res) => {
    try {
        const date = new Date();
        let hour = date.getUTCHours();
        if (hour < 3) hour += 24;
        const target_hour = hour - 3;
        const { Items } = await dynamoClient.scan({
            TableName: 'sticks',
            FilterExpression: 'utc_hour = :th',
            ExpressionAttributeValues: {
                ':th': target_hour
            }
        }).promise()
        res.status(200).json(Items)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})


app.listen(port)



const deleteOld = async (H) => {
    try {
        let hour = H;
        if (H < 4) hour += 24;
        let target_hour = hour - 4;
        const { Items } = await dynamoClient.scan({
            TableName: 'sticks',
            FilterExpression: 'utc_hour = :th',
            ExpressionAttributeValues: {
                ':th': target_hour
            }
        }).promise()
        for (Item of Items) {
            const { event_time, utc_hour } = Item;
            dynamoClient.delete({
                TableName: 'sticks',
                Key: {
                    event_time,
                    utc_hour
                }
            }, (err, data) => { })
        }
    } catch (error) {
        console.log({ message: error.message });
    }
}
const insertNew = async ({ event_time, utc_hour, kline_time, open_price, close_price, high_price, low_price, volume }) => {
    try {
        await dynamoClient.put({
            TableName: 'sticks',
            Item: { event_time, utc_hour, kline_time, open_price, close_price, high_price, low_price, volume }
        }).promise()
    } catch (error) {
        console.log({ message: error.message });
    }
}



const btc = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_5m')
btc.onmessage = e => {
    const { E, k } = JSON.parse(e['data'])
    const d = new Date(E)
    const T = d.toString().split(' ')[4]
    const H = d.getUTCHours()
    const M = d.getUTCMinutes()
    const S = d.getSeconds()
    const { t, o, c, h, l, v } = k;
    const stick = {
        event_time: T,
        utc_hour: H,
        kline_time: t,
        open_price: o,
        close_price: c,
        high_price: h,
        low_price: l,
        volume: v
    }
    if (M == 0 && S % 5 == 0) deleteOld(H)
    insertNew(stick)
    console.log(stick);
}


