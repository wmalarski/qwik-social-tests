import { component$, useSignal } from "@builder.io/qwik";
import type { Comment } from "@prisma/client";
import { trpc } from "~/server/trpc/serverApi";
import { CommentForm } from "../../CommentForm/CommentForm";

export const useUpdateCommentAction = trpc.comment.update.action$();

type Props = {
  comment: Comment;
};

export const UpdateCommentForm = component$<Props>((props) => {
  const isOpen = useSignal(false);

  const action = useUpdateCommentAction();

  return (
    <>
      <button
        class="btn"
        onClick$={() => {
          isOpen.value = !isOpen.value;
        }}
      >
        Edit
      </button>

      {isOpen.value && (
        <>
          <CommentForm
            initialValue={props.comment}
            isLoading={action.isRunning}
            onSubmit$={async ({ content }) => {
              await action.run({ content, id: props.comment.id });
              isOpen.value = false;
            }}
          />

          {action.status === 200 ? (
            <span>Success</span>
          ) : typeof action.status !== "undefined" ? (
            <span>Error</span>
          ) : null}
        </>
      )}
    </>
  );
});
