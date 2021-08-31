import { SQSEvent, SQSHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

interface Payload {
  [x: string]: string | number | Payload
}

interface Record {
  aggregateId: string
  revision: number
  type: string
  payload: Payload
}

const db = new DynamoDB.DocumentClient()

export const handler: SQSHandler = async (event: SQSEvent) => {
  const records = event.Records.map((row) => {
    const data = JSON.parse(JSON.parse(row.body).Message)
    return DynamoDB.Converter.unmarshall(data)
  }) as Record[]

  if (!process.env.PROJECTION_TABLE_NAME) {
    throw new Error('required value of PROJECTION_TABLE_NAME no set! check environment variables.')
  }

  const TableName = process.env.PROJECTION_TABLE_NAME as string
  console.log('> projecting records', records, 'into', TableName)

  for await (const row of records) {
    await db
      .put({
        TableName,
        Item: {
          rootId: row.aggregateId.toString(),
          id: `event-${row.type}-v${row.revision}`.toString(),
          data: row.payload,
        },
      })
      .promise()
  }

  console.log(`> wrote ${records.length} items to projection ${TableName}`)
}

export default handler
