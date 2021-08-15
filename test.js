


const dynamoClient = require('./utils/dynamoclient');

const test = async (n) => {
    const { Items } = await dynamoClient.scan({
        TableName: 'sticks',
        FilterExpression: 'utc_hour = :u',
        ExpressionAttributeValues: {
            ':u': n
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
}

