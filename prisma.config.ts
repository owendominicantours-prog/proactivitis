import { PrismaConfig } from "@prisma/client";

const config: PrismaConfig = {
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
};

export default config;
