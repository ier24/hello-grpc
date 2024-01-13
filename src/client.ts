import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH = "./protos/hello.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const hello = protoDescriptor.helloworld as any;
const GreeterService = hello.Greeter;
const client = new GreeterService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

client.sayHello({ name: "Takashi!" }, (error: any, response: any) => {
  if (!error) {
    console.log("Greeting:", response.message);
  } else {
    console.error(error);
  }
});
