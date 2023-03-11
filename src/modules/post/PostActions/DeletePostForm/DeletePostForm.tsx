import { component$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { Post } from "@prisma/client";
import { trpcAction$ } from "~/lib/qwik-trpc";
import { paths } from "~/utils/paths";

// export const useDeletePost = trpc.post.delete.action$();

export const useDeletePost = trpcAction$(() => ["trpc", "post", "delete"]);

type Props = {
  post: Post;
};

export const DeletePostForm = component$<Props>((props) => {
  const navigate = useNavigate();

  const action = useDeletePost();

  return (
    <form
      preventdefault:submit
      onSubmit$={async () => {
        await action.run({ id: props.post.id });
        navigate(paths.board);
      }}
    >
      <input type="hidden" name="id" value={props.post.id} />
      <button
        type="submit"
        class={{
          "btn btn-ghost btn-sm": true,
          loading: action.isRunning,
        }}
      >
        Remove
      </button>

      {action.value?.status === "success" ? (
        <span>Success</span>
      ) : action.value?.status === "error" ? (
        <pre>{JSON.stringify(action.value, null, 2)}</pre>
      ) : null}
    </form>
  );
});
