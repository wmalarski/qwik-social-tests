/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @see https://trpc.io/blog/tinyrpc-client
 */
import { $, QRL } from "@builder.io/qwik";
import { Action, ActionStore } from "@builder.io/qwik-city";
import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  inferProcedureInput,
  inferProcedureOutput,
  inferRouterInputs,
  inferRouterOutputs,
  ProcedureRouterRecord,
} from "@trpc/server";
import { TRPCResponse } from "@trpc/server/rpc";
import superjson from "superjson";
import type { AppRouter } from "~/server/trpc/router";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

type ProxyCallbackOptions = {
  path: string[];
  args: unknown[];
};

type ProxyCallback = (opts: ProxyCallbackOptions) => unknown;

type Resolver<TProcedure extends AnyProcedure> = (
  input: inferProcedureInput<TProcedure>
) => Promise<inferProcedureOutput<TProcedure>>;

type TrpcActionUtils<TProcedure extends AnyProcedure> = Omit<
  ActionStore<
    inferProcedureInput<TProcedure>,
    inferProcedureOutput<TProcedure>
  >,
  "run"
> & {
  run: QRL<Resolver<TProcedure>>;
};

type DecorateProcedure<TProcedure extends AnyProcedure> =
  TProcedure extends AnyQueryProcedure
    ? () => TrpcActionUtils<TProcedure>
    : TProcedure extends AnyMutationProcedure
    ? () => TrpcActionUtils<TProcedure>
    : never;

type DecoratedProcedureRecord<TProcedures extends ProcedureRouterRecord> = {
  [TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
    ? DecoratedProcedureRecord<TProcedures[TKey]["_def"]["record"]>
    : TProcedures[TKey] extends AnyProcedure
    ? DecorateProcedure<TProcedures[TKey]>
    : never;
};

export const useTrpcAction = (action: Action<any, any>) => {
  const actionStore = action.use();

  const createRecursiveProxy = (callback: ProxyCallback, path: string[]) => {
    const proxy: unknown = new Proxy(() => void 0, {
      apply(_1, _2, args) {
        return callback({ args, path });
      },
      get(_obj, key) {
        if (typeof key !== "string") {
          return undefined;
        }
        return createRecursiveProxy(callback, [...path, key]);
      },
    });

    return proxy;
  };
  return createRecursiveProxy((opts) => {
    const dotPath = opts.path.join(".");

    const run = $(async (input: any) => {
      const formData = new FormData();
      formData.set("path", dotPath);

      const stringifiedInput =
        input !== undefined && JSON.stringify({ json: input });

      if (stringifiedInput !== false) {
        formData.set("body", stringifiedInput);
      }

      await actionStore.run(formData);

      const json: TRPCResponse = actionStore.value;

      if (json && "error" in json) {
        throw new Error(`Error: ${json.error.message}`);
      }

      // TODO find better way to parse it
      return superjson.parse(JSON.stringify(json.result.data));
    });

    return { ...action, run };
  }, []) as DecoratedProcedureRecord<AppRouter["_def"]["record"]>;
};
