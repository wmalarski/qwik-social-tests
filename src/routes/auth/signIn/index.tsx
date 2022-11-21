import { component$, Resource } from "@builder.io/qwik";
import { DocumentHead, useEndpoint } from "@builder.io/qwik-city";
import { withUser } from "~/server/auth/withUser";
import { serverEnv } from "~/server/serverEnv";
import { withTrpc } from "~/server/trpc/withTrpc";
import { endpointBuilder } from "~/utils/endpointBuilder";
import { paths } from "~/utils/paths";
import { Login } from "./Login/Login";

export const onPost = endpointBuilder()
  .use(withUser())
  .use(withTrpc())
  .resolver(async ({ request, response, supabase }) => {
    const form = await request.formData();
    const email = form.get("email") as string;
    const password = form.get("password") as string | undefined;

    if (!password) {
      const otpResult = await supabase.auth.signInWithOtp({
        email,
        // TODO: replace with calculated url
        options: { emailRedirectTo: serverEnv.VITE_REDIRECT_URL },
      });
      return { otpError: otpResult.error, otpSuccess: !otpResult.error };
    }

    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error || !result.data.session) {
      return { passError: result.error };
    }

    const { updateAuthCookies } = await import("~/server/auth/auth");
    updateAuthCookies(result.data.session, response);

    throw response.redirect(paths.board);
  });

export const onGet = endpointBuilder()
  .use(withUser())
  .resolver((ev) => {
    if (ev.user) {
      throw ev.response.redirect(paths.index);
    }
  });

export default component$(() => {
  const endpoint = useEndpoint<typeof onPost>();

  return (
    <>
      <Resource
        value={endpoint}
        onResolved={(data) => (
          <Login
            passError={data?.passError}
            otpError={data?.otpError}
            otpIsSuccess={data?.otpSuccess}
          />
        )}
      />
    </>
  );
});

export const head: DocumentHead = {
  title: "Sign In - Welcome to Qwik",
};
