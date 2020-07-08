export const Source: Creds = {
    Host: "SourceIp",
    Port: 5672,
    User: "",
    Password: ""
};

export const Destination: Creds = {
    Host: "DestinationIp",
    Port: 5672,
    User: "",
    Password: ""
};

export interface Creds {
    Host: string,
    Port: number,
    User: string,
    Password: string
}