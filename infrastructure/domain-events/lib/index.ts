import DomainEventsStack from './DomainEventsStack'
import * as sst from '@serverless-stack/resources'
import { RemovalPolicy, Tags } from '@aws-cdk/core'
import { config as AWSConfig } from 'aws-sdk'

const stackId = 'sample-domain'

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: 'nodejs12.x',
  })
  AWSConfig.update({ region: app.region })
  // app.logicalPrefixedName('SampleDomain')

  if (app.stage === 'dev') {
    app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY)
  }

  // include stack(s)
  const sampleDomain = new DomainEventsStack(app, stackId, {})
  Tags.of(sampleDomain).add('AppGroup', stackId)
}
