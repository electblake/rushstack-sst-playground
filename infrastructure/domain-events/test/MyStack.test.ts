import { expect, haveResource } from '@aws-cdk/assert'
import * as sst from '@serverless-stack/resources'
import DomainEventsStack from '../lib/DomainEventsStack'

test('Test Stack', () => {
  const app = new sst.App()
  // WHEN
  const stack = new DomainEventsStack(app, 'test-stack', {})
  // THEN
  expect(stack).to(haveResource('AWS::Lambda::Function'))
})
