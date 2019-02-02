import { Comment} from "./comment.model";
import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable({providedIn: 'root'})
export class CommentsService {
    private comments : Comment[] = [];
    private commentsUpdated = new Subject<Comment[]>();

    getComments(){
        return this.comments;
    }

    getCommentsUpdatedListener(){
        return this.commentsUpdated.asObservable();
    }
    addComment(comment : Comment){
        this.comments.push(comment);
        this.commentsUpdated.next([...this.comments])
    }
}