// tests/__helpers.ts
import { PrismaClient } from "@prisma/client";
import { ServerInfo } from "apollo-server";
import getPort, { makeRange } from "get-port";
import { GraphQLClient } from "graphql-request";
import { db } from "../api/db";
import { server } from "../api/server";

type TestContext = {
  client: GraphQLClient;
  db: PrismaClient;
};

export function createTestContext(): TestContext {
  let ctx = {} as TestContext;
  const graphqlCtx = graphqlTestContext();
  const prismaCtx = prismaTestContext();

  beforeEach(async () => {
    const client = await graphqlCtx.before();
    const db = await prismaCtx.before();

    Object.assign(ctx, {
      client,
      db,
    });
  });

  afterEach(async () => {
    await graphqlCtx.after();
    await prismaCtx.after();
  });

  return ctx;
}

function graphqlTestContext() {
  let serverInstance: ServerInfo | null = null;

  return {
    async before() {
      const port = await getPort({ port: makeRange(4000, 6000) });

      serverInstance = await server.listen({ port });
      // Close the Prisma Client connection when the Apollo Server is closed
      serverInstance.server.on("close", async () => {
        db.$disconnect();
      });

      return new GraphQLClient(`http://localhost:${port}`);
    },
    async after() {
      serverInstance?.server.close();
    },
  };
}

function prismaTestContext() {
  let prismaClient: PrismaClient | null = null;
  return {
    async before() {
      prismaClient = new PrismaClient();
      return prismaClient;
    },
    async after() {
      await prismaClient?.$disconnect();
    },
  };
}
