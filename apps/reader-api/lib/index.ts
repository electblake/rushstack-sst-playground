import ReaderStack from './ReaderStack'
import * as sst from '@serverless-stack/resources'
import { config as AWSConfig } from 'aws-sdk'

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

  new ReaderStack(app, 'reader-api', {
    topicParamName: `/${app.stage}/domain-events-sample-domain/eventStreamTopicArn`,
  })

  // Add more stacks
}
