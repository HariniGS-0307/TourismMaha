import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasources: process.env.DATABASE_URL
      ? {
          db: {
            url: process.env.DATABASE_URL,
          },
        }
      : undefined,
  });
}

let prismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

function isPreparedStatementError(error: unknown) {
  return (
    error instanceof Error &&
    /prepared statement .* (does not exist|already exists)/i.test(error.message)
  );
}

async function resetPrismaClient() {
  try {
    await prismaClient.$disconnect();
  } catch {
    // ignore disconnect failures during recovery
  }

  prismaClient = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaClient;
  }

  return prismaClient;
}

async function runWithPreparedStatementRecovery<T>(
  operation: (client: PrismaClient) => Promise<T>,
) {
  try {
    return await operation(prismaClient);
  } catch (error) {
    if (!isPreparedStatementError(error)) {
      throw error;
    }

    const freshClient = await resetPrismaClient();
    return operation(freshClient);
  }
}

export async function withPrismaRetry<T>(
  operation: (client: PrismaClient) => Promise<T>,
) {
  return runWithPreparedStatementRecovery(operation);
}

function wrapDelegate(rootProperty: PropertyKey, value: unknown) {
  if (!value || typeof value !== "object") {
    return value;
  }

  return new Proxy(value as object, {
    get(target, property) {
      const delegateValue = Reflect.get(target, property);

      if (typeof delegateValue !== "function") {
        return delegateValue;
      }

      return async (...args: unknown[]) =>
        runWithPreparedStatementRecovery(async (client) => {
          const currentDelegate = ((client as unknown) as Record<PropertyKey, unknown>)[
            rootProperty
          ] as Record<PropertyKey, unknown>;
          const method = currentDelegate[property] as (...innerArgs: unknown[]) => Promise<unknown>;
          return method.apply(currentDelegate, args) as Promise<unknown>;
        });
    },
  });
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const value = ((prismaClient as unknown) as Record<PropertyKey, unknown>)[property];

    if (typeof value === "function") {
      return async (...args: unknown[]) =>
        runWithPreparedStatementRecovery(async (client) => {
          const method = ((client as unknown) as Record<PropertyKey, unknown>)[property] as (
            ...innerArgs: unknown[]
          ) => Promise<unknown>;
          return method.apply(client, args) as Promise<unknown>;
        });
    }

    return wrapDelegate(property, value);
  },
});
