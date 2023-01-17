import { component$ } from "@builder.io/qwik";
import { FormProps } from "@builder.io/qwik-city";
import type { Comment } from "@prisma/client";
import { CommentActions } from "~/modules/comment/CommentActions/CommentActions";
import { paths } from "~/utils/paths";

type Props = {
  comment: Comment;
  deleteCommentAction: FormProps<void>["action"];
  updateCommentAction: FormProps<void>["action"];
};

export const CommentsListItem = component$<Props>((props) => {
  return (
    <div>
      <pre>{JSON.stringify(props.comment, null, 2)}</pre>
      <a class="link" href={paths.comment(props.comment.id)}>
        Show comments
      </a>
      <CommentActions
        comment={props.comment}
        deleteCommentAction={props.deleteCommentAction}
        updateCommentAction={props.updateCommentAction}
      />
    </div>
  );
});
