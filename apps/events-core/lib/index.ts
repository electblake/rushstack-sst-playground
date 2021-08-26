import EventsCoreStack from './EventsCoreStack'
import * as sst from '@serverless-stack/resources'

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: 'nodejs12.x',
  })

  new EventsCoreStack(app, 'events-core', {
    milestoneEventBusArn: 'arn:aws:events:1234',
  })

  // Add more stacks
}
