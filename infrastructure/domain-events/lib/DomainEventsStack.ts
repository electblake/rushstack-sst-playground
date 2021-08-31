import * as sst from '@serverless-stack/resources'
import { StreamViewType, BillingMode } from '@aws-cdk/aws-dynamodb'
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources'
import { StartingPosition } from '@aws-cdk/aws-lambda'
import { StringParameter, ParameterType } from '@aws-cdk/aws-ssm'

type DomainEventsStackProps = sst.StackProps

export default class DomainEventsStack extends sst.Stack {
  //
  public table: sst.Table
  public topic: sst.Topic
  public dispatcherFn: sst.Function

  public props: DomainEventsStackProps
  constructor(scope: sst.App, id: string, props: DomainEventsStackProps) {
    super(scope, id, props)
    this.props = props

    this.makeTable()
    this.makeTopic()
    this.makeAndRegisterDispatcher(this.topic, this.table)

    const stackName = this.artifactId.replace(`${this.stage}-`, '')

    new StringParameter(this, 'eventStoreStreamTopicArn', {
      parameterName: `/${this.stage}/${stackName}/eventStreamTopicArn`,
      stringValue: this.topic.topicArn,
      type: ParameterType.STRING,
    })

    // debugging:
    this.addOutputs({
      topicArn: {
        value: this.topic.topicArn,
      },
      artifactId: {
        value: this.artifactId,
      },
    })
  }

  makeAndRegisterDispatcher(topic: sst.Topic, table: sst.Table): sst.Function {
    this.dispatcherFn = new sst.Function(this, 'domainEventDispatcher', {
      handler: 'src/eventDispatcher.handler',
      environment: {
        TOPIC_ARN: topic.topicArn,
      },
    })
    // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-event-sources-readme.html
    this.dispatcherFn.addEventSource(
      new DynamoEventSource(table.dynamodbTable, {
        startingPosition: StartingPosition.TRIM_HORIZON,
        batchSize: 1,
        bisectBatchOnError: true,
        // onFailure: new SqsDlq(deadLetterQueue),
        retryAttempts: 10,
      })
    )
    this.dispatcherFn.attachPermissions([topic, 'grantPublish'])
    return this.dispatcherFn
  }

  makeTable(): sst.Table {
    this.table = new sst.Table(this, 'eventStore', {
      fields: {
        aggregateId: sst.TableFieldType.STRING,
        revision: sst.TableFieldType.NUMBER,
      },
      primaryIndex: {
        partitionKey: 'aggregateId',
        sortKey: 'revision',
      },
      stream: StreamViewType.NEW_IMAGE,
      dynamodbTable: {
        billingMode: BillingMode.PAY_PER_REQUEST,
        serverSideEncryption: true,
      },
    })

    return this.table
  }

  makeTopic(): sst.Topic {
    this.topic = new sst.Topic(this, 'eventStoreStream', {
      snsTopic: {
        fifo: true,
        contentBasedDeduplication: true,
      },
    })

    return this.topic
  }
}
