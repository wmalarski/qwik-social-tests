import { component$ } from "@builder.io/qwik";
import { trpc } from "~/server/trpc/serverApi";
import { CommentForm } from "../CommentForm/CommentForm";

export const useCreateComment = trpc.comment.create.action$();

type Props = {
  parentId: string | null;
  postId: string;
};

export const CreateCommentForm = component$<Props>((props) => {
  const action = useCreateComment();

  return (
    <div>
      <CommentForm
        isLoading={action.isRunning}
        onSubmit$={({ content }) => {
          action.run({
            content,
            parentId: props.parentId,
            postId: props.postId,
          });
        }}
      />

      {action.status === 200 ? (
        <span>Success</span>
      ) : typeof action.status !== "undefined" ? (
        <span>Error</span>
      ) : null}
    </div>
  );
});
