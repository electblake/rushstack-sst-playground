import { SNS } from 'aws-sdk'

const sns = new SNS()

interface DomainEvent {
  type: {
    S: string
  }
  revision: {
    N: number
  }
}

const TopicArn = process.env.TOPIC_ARN

interface HandlerEvent {
  Records: {
    eventID: string
    eventName: string
    dynamodb: {
      NewImage: DomainEvent
    }
  }[]
}

export const handler = async (event: HandlerEvent): Promise<void> => {
  const records = event.Records
  for await (const record of records) {
    console.info('Processing DynamoDB record', {
      dynamoStreamRecordEventId: record.eventID,
    })

    if (record.eventName !== 'INSERT') {
      console.info('DynamoDB event not an INSERT, skipping.')
      return
    }

    if (!record.dynamodb?.NewImage) return
    try {
      const event = record.dynamodb.NewImage as DomainEvent

      console.info('Publishing DynamoDB event to SNS.', event)

      await publishEventToSNS(sns, event)

      console.info('Finished publishing DynamoDB event to SNS.', event)
    } catch (error) {
      console.error('Error publishing DynamoDB event to SNS.', error)
      throw error
    }
  }
}

const publishEventToSNS = async (sns: SNS, event: DomainEvent): Promise<void> => {
  await sns
    .publish({
      TopicArn,
      MessageAttributes: {
        type: {
          DataType: 'String',
          StringValue: event.type.S,
        },
        revision: {
          DataType: 'Number',
          StringValue: event.revision.N.toString(),
        },
      },
      Message: JSON.stringify(event),
      MessageGroupId: 'domainEventStream1',
    })
    .promise()
}
