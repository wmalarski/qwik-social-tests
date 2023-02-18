import { component$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { Post } from "@prisma/client";
import { trpc } from "~/server/trpc/api";
import { paths } from "~/utils/paths";

export const useDeletePost = trpc.post.delete.action$();

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

      {action.status === 200 ? (
        <span>Success</span>
      ) : typeof action.status !== "undefined" ? (
        <span>Error</span>
      ) : null}
    </form>
  );
});
