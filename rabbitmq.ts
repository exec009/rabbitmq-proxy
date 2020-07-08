const amqp = require('amqplib/callback_api');
import { Creds } from './rabbitmqcreds';
export class RabbitMq {
    private connection: any;
    private publishers: { [key: string]: any; } = {};
    public constructor(private creds: Creds) {
    }
    public init(callback: () => void) {
        amqp.connect('amqp://' + this.creds.User + ':' + this.creds.Password + '@' + this.creds.Host + ':' + this.creds.Port, (error0: any, connection: any) => {
            if (error0)
            throw error0;
            this.connection = connection;
            callback();
        });
    }
    public connect(exchangeName: string, callback: (msg: any, routeKey: string) => void) {
        this.connection.createChannel((error1: any, channel: any) => {
            if (error1) {
                throw error1;
            }
            channel.assertExchange(exchangeName, 'topic', {
                durable: false,
                autoDelete: true
            });
            channel.assertQueue('', {
                    exclusive: true
                },
                (error2: any, q: any) => {
                    if (error2) {
                        throw error2;
                    }
                    // console.log(' [*] Waiting for logs. To exit press CTRL+C');
                    channel.bindQueue(q.queue, exchangeName, '*');
                    channel.consume(q.queue, function(msg: any) {
                        callback(msg.content, msg.fields.routingKey)
                    }, {
                        noAck: true
                    }
                );
            });          
        });
    }
    public publish(exchangeName: string, routingKey: string, msg: any): void {
        const key = exchangeName;
        if(this.publishers[key] !== undefined && this.publishers[key] !== null)
        {
            this.publishers[key].publish(exchangeName, routingKey, typeof msg === 'string' ? Buffer.from(msg) : msg);
        }
        else
        {
            this.connection.createChannel((error1: any, channel: any) => {
                if (error1) {
                    throw error1;
                }            
                channel.assertExchange(exchangeName, 'topic', {
                    durable: false,
                    autoDelete: true
                });
                this.publishers[key] = channel;
                this.publish(exchangeName, routingKey, msg);
            });
        }
    }
}