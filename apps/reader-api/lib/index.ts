import ReaderStack from './ReaderStack'
import * as sst from '@serverless-stack/resources'
import { SSM, config as AWSConfig } from 'aws-sdk'

export default async function main(app: sst.App): Promise<void> {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: 'nodejs12.x',
    timeout: 30,
    // memorySize: 512,
    environment: {},
  })
  // set aws sdk region globally
  AWSConfig.update({ region: app.region })
  const ssm = new SSM()

  let eventStreamTopicArn
  const Name = `/${app.stage}/domain-events-sample-domain/eventStreamTopicArn`
  try {
    const req = await ssm
      .getParameter({
        Name,
      })
      .promise()
    eventStreamTopicArn = req.Parameter?.Value
  } catch (err) {
    console.error(err)
  }

  if (!eventStreamTopicArn) {
    console.error(`Could not resolve eventStreamTopic from ${Name}, see above for error details.`)
    process.exit(1)
  }

  new ReaderStack(app, 'reader-api', {
    eventStreamTopicArn,
  })

  // Add more stacks
}
