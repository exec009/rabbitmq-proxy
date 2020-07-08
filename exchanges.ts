export interface Exchange {
    exchangeName: string;
    type: ExchangeType;
}
export enum ExchangeType {
    Both,
    Source,
    Destination
}
export const Exchanges: Exchange[] = [
    { exchangeName: "test", type: ExchangeType.Both }
];
