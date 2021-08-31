import MilestoneEventsStack from './MilestoneEventsStack'
import * as sst from '@serverless-stack/resources'
import { RemovalPolicy } from '@aws-cdk/core'

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: 'nodejs12.x',
  })

  if (app.stage === 'dev') {
    app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY)
  }

  new MilestoneEventsStack(app, 'sample-milestones')

  // Add more stacks
}
