import { component$ } from "@builder.io/qwik";
import { FormProps } from "@builder.io/qwik-city";
import type { Comment } from "@prisma/client";
import { DeleteCommentForm } from "./DeleteCommentForm/DeleteCommentForm";
import { UpdateCommentForm } from "./UpdateCommentForm/UpdateCommentForm";

type Props = {
  comment: Comment;
  deleteCommentAction: FormProps<void>["action"];
  updateCommentAction: FormProps<void>["action"];
};

export const CommentActions = component$<Props>((props) => {
  return (
    <>
      <DeleteCommentForm
        comment={props.comment}
        action={props.deleteCommentAction}
      />
      <UpdateCommentForm
        comment={props.comment}
        action={props.updateCommentAction}
      />
    </>
  );
});
