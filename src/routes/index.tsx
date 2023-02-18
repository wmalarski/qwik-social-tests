import { component$ } from "@builder.io/qwik";
import { DocumentHead, loader$ } from "@builder.io/qwik-city";
import { ProtectedHeader } from "~/modules/layout/ProtectedHeader/ProtectedHeader";
import { PublicHeader } from "~/modules/layout/PublicHeader/PublicHeader";
import { getUserFromEvent } from "~/server/loaders";

export const useUserLoader = loader$((event) => getUserFromEvent(event));

export default component$(() => {
  const user = useUserLoader();

  return (
    <div class="flex flex-col">
      {user.value ? <ProtectedHeader /> : <PublicHeader />}
      <section class="border-b-8 border-solid border-primary p-5">
        <h1>
          Welcome to Qwik <span>⚡️</span>
        </h1>
        <pre>{JSON.stringify(user.value, null, 2)}</pre>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
};
