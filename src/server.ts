import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import OpenAI from "openai";

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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

server.addService(helloWorldDescriptor["ChatService"].service, {
  chat: (call: any) => {
    call.on("data", async (message: any) => {
      console.log("Received message:", message.message);
      const streamResponse = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. 必ず140字以内で返答して。",
          },
          { role: "user", content: `${message.message}` },
        ],
        stream: true,
        model: "gpt-4-1106-preview",
      });
      let reply = "";
      for await (const chunk of streamResponse) {
        const content = chunk.choices[0]?.delta?.content || "";
        reply += content;
      }
      console.log("Reply from AI:", reply);
      call.write({ message: "Reply from AI: " + reply });
    });

    call.on("end", () => {
      call.end();
    });
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
