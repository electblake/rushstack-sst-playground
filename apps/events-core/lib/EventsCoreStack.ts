import * as sst from '@serverless-stack/resources'

interface EventsCoreStackProps extends sst.StackProps {
  milestoneEventBusArn: string
}

export default class EventsCoreStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: EventsCoreStackProps) {
    super(scope, id, props)

    new sst.Api(this, '')
  }
}
