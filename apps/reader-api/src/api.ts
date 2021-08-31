import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

const db = new DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async () => {
  const TableName = process.env.PROJECTION_TABLE_NAME as string
  if (!TableName) throw new Error(`PROJECTION_TABLE_NAME is not set, check environment variables.`)

  const records = await db
    .scan({
      TableName,
      Limit: 10,
    })
    .promise()

  return {
    statusCode: 200,
    body: '<html><body><pre>' + JSON.stringify(records, null, 2) + '</pre></body></html>',
    headers: {
      'Content-Type': 'text/html',
    },
  }
}
