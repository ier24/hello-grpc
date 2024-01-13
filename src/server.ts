import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH = "./protos/hello.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();
const helloWorldDescriptor = protoDescriptor.helloworld as any;
server.addService(helloWorldDescriptor["Greeter"].service, {
  sayHello: (call: any, callback: any) => {
    callback(null, { message: "Hello " + call.request.name });
  },
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
    console.log("Server running at http://0.0.0.0:50051");
  }
);
