import { app } from "./app";
import { env } from "./config/env";
import { healthCheck } from "./lib/db";

async function bootstrap() {
  try {
    await healthCheck();
    const host = "0.0.0.0";
    app.listen(env.port, host, () => {
      const displayHost = host;
      const url = env.publicUrl || `http://${displayHost}:${env.port}`;
      console.log(`🚀 API ready on ${url}`);
    });
  } catch (error) {
    console.error("数据库连接失败", error);
    process.exit(1);
  }
}

bootstrap();
