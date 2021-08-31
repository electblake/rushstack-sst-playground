import { expect, haveResource } from '@aws-cdk/assert'
import * as sst from '@serverless-stack/resources'
import ReaderStack from '../lib/ReaderStack'

test('Test Stack', () => {
  const app = new sst.App()
  // WHEN
  const stack = new ReaderStack(app, 'test-stack')
  // THEN
  expect(stack).to(haveResource('AWS::Lambda::Function'))
  expect(stack).to(haveResource('AWS::SQS::Queue'))
})
