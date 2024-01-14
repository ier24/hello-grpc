import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as readline from "readline";

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

const ChatService = hello.ChatService;
const chatClient = new ChatService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

const chat = chatClient.chat();

// チャットを終了する
setTimeout(() => {
  chat.end();
}, 115000);

client.sayHello({ name: "Takashi!" }, (error: any, response: any) => {
  if (!error) {
    console.log("Greeting:", response.message);
  } else {
    console.error(error);
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (line) => {
  if (line === "exit") {
    chat.end();
    rl.close();
    console.log("Chat ended by user.");
  } else {
    chat.write({ message: line });
  }
});

chat.on("data", (message: any) => {
  console.log("Received reply:", message.message);
});

chat.on("end", () => {
  rl.close();
  console.log("Chat ended.");
});
