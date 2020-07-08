import { RabbitMq } from './rabbitmq';
import { Source, Destination } from './rabbitmqcreds'
import { Exchanges, ExchangeType } from './exchanges';

var sourceRabbit = new RabbitMq(Source);
var destinationRabbit = new RabbitMq(Destination);
interface MessageInterval {
    time: number,
    msg: Buffer
}
// const msgInterval: { [key: number]: any; } = {};
const msgInterval : MessageInterval[] = [];

sourceRabbit.init(() => {
    console.log('Rabbitmq connected')
    destinationRabbit.init(() => {
        Exchanges.forEach(exchange => {
            if(exchange.type == ExchangeType.Both) {
                sourceRabbit.connect(exchange.exchangeName, (msg, routeKey) => {
                    var msg1 = msg.toString();
                    if(msgInterval.map(el => el.msg).indexOf(msg1) < 0)
                    {
                        msgInterval.push({
                            time: Date.now(),
                            msg: msg1
                        });
                        destinationRabbit.publish(exchange.exchangeName, routeKey, msg);
                    }
                })
                destinationRabbit.connect(exchange.exchangeName, (msg, routeKey) => {
                    var msg1 = msg.toString();
                    if(msgInterval.map(el => el.msg).indexOf(msg1) < 0)
                    {
                        msgInterval.push({
                            time: Date.now(),
                            msg: msg1
                        });
                        sourceRabbit.publish(exchange.exchangeName, routeKey, msg);
                    }
                })
            }
            else if(exchange.type == ExchangeType.Source) {
                sourceRabbit.connect(exchange.exchangeName, (msg, routeKey) => {
                    destinationRabbit.publish(exchange.exchangeName, routeKey, msg);
                })
            }
            else if(exchange.type == ExchangeType.Destination) {
                destinationRabbit.connect(exchange.exchangeName, (msg, routeKey) => {
                    sourceRabbit.publish(exchange.exchangeName, routeKey, msg);
                })
            }
        })
    });
});
setInterval(() => {
    const dt = Date.now() - (3 * 1000);
    msgInterval.forEach((msg, index) => {
        if(msg.time < dt) {
            msgInterval.splice(index, 1);
        }
    });
}, 1000)