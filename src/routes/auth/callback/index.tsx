import { $, component$, useClientEffect$ } from "@builder.io/qwik";
import {
  action$,
  DocumentHead,
  useNavigate,
  zod$,
} from "@builder.io/qwik-city";
import { z } from "zod";
import { updateAuthCookies } from "~/server/auth/auth";
import { paths } from "~/utils/paths";

export const setSession = action$(
  (data, event) => {
    updateAuthCookies(data, event.cookie);

    return { status: "success" };
  },
  zod$(
    z.object({
      access_token: z.string(),
      expires_in: z.coerce.number(),
      refresh_token: z.string(),
    }).shape
  )
);

export default component$(() => {
  const navigate = useNavigate();

  const action = setSession.use();

  const handleSendSession = $(async () => {
    const hash = window.location.hash.substring(1);

    if (!hash) {
      return;
    }

    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const expires_in = params.get("expires_in");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !expires_in || !refresh_token) {
      return;
    }

    await action.execute({
      access_token,
      expires_in,
      refresh_token,
    });

    if (action.value?.status !== "success") {
      return;
    }

    navigate(paths.index);
  });

  useClientEffect$(() => {
    handleSendSession();
  });

  return (
    <div>
      <h1>
        Welcome to Qwik <span class="lightning">⚡️</span>
      </h1>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
};
