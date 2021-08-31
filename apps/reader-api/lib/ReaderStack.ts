import * as sst from '@serverless-stack/resources'
import * as cdk from '@aws-cdk/aws-sns'
import { QueueEncryption, FifoThroughputLimit } from '@aws-cdk/aws-sqs'
import { Duration } from '@aws-cdk/core'
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources'
import { BillingMode } from '@aws-cdk/aws-dynamodb'

interface ReaderStackProps extends sst.StackProps {
  eventStreamTopicArn: string
}

export default class ReaderStack extends sst.Stack {
  public table: sst.Table
  public topic: sst.Topic
  public queue: sst.Queue
  public projectorFn: sst.Function
  public api: sst.Api

  constructor(scope: sst.App, id: string, props: ReaderStackProps) {
    super(scope, id, props)
    this.makeQueue()
    this.makeProjectionTable()
    this.importAndSubscribeTopic(props.eventStreamTopicArn, this.queue)
    // functions
    this.addReaderProjector(this.queue, this.table)
    this.addReaderApi(this.table)

    this.addOutputs({
      apiUrl: this.api.url,
    })
  }

  addReaderApi(table: sst.Table): void {
    this.api = new sst.Api(this, 'Api', {
      routes: {
        'GET /': 'src/api.handler',
      },
      defaultFunctionProps: {
        environment: {
          PROJECTION_TABLE_NAME: table.tableName,
        },
        permissions: [this.table, 'grantReadData'],
      },
    })
  }

  importAndSubscribeTopic(topicArn: string, queue: sst.Queue): void {
    // const importedTopicArn = Fn.importValue(`${this.stage}-domain-events-sample-domain--topicArn`)

    this.topic = new sst.Topic(this, 'domainTopic', {
      snsTopic: cdk.Topic.fromTopicArn(this, 'domainStreamTopic', topicArn),
    })

    // console.log(`> Subscribing queue to ${this.topic.topicArn}`)

    this.topic.addSubscribers(this, [queue])
  }

  makeQueue(): void {
    this.queue = new sst.Queue(this, 'readerProjectionQueue', {
      consumer: 'src/projector.handler',
      sqsQueue: {
        // queueName: 'reader-projector.fifo',
        retentionPeriod: Duration.days(4),
        deliveryDelay: Duration.minutes(0),
        contentBasedDeduplication: true,
        fifo: true,
        visibilityTimeout: Duration.seconds(30),
        fifoThroughputLimit: FifoThroughputLimit.PER_QUEUE,
        encryption: QueueEncryption.UNENCRYPTED,
        // deadLetterQueue: {}
      },
    })
  }

  makeProjectionTable(): void {
    this.table = new sst.Table(this, 'readerProjectionTableRev20210831', {
      fields: {
        rootId: sst.TableFieldType.STRING,
        id: sst.TableFieldType.STRING,
        revision: sst.TableFieldType.STRING,
      },
      primaryIndex: {
        partitionKey: 'rootId',
        sortKey: 'id',
      },
      dynamodbTable: {
        billingMode: BillingMode.PAY_PER_REQUEST,
        serverSideEncryption: true,
      },
    })
  }

  addReaderProjector(queue: sst.Queue, table: sst.Table): void {
    this.projectorFn = new sst.Function(this, 'readerProjectionFn', {
      handler: 'src/projector.handler',
      environment: {
        PROJECTION_TABLE_NAME: table.tableName,
        PROJECTION_TABLE_ARN: table.tableArn,
      },
    })
    // broke into 2 calls, as 1 array of touples gives a type error atm
    this.projectorFn.attachPermissions([table, 'grantReadWriteData'])
    this.projectorFn.attachPermissions([queue, 'grantReadData'])
    this.projectorFn.addEventSource(new SqsEventSource(queue.sqsQueue, {}))
  }
}
