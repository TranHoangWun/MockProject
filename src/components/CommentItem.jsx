import React from "react";
import defaultAvatar from "../assets/images/student/student1.jpg";
import "../components/CommentItem.css"
import { formatDate } from "../utils/date";

export default function CommentItem({ cmt, user, onDelete, index }) {

    return (
        <div className="comment">
            {/* Avatar */}
            <img
                src={cmt.user?.avatar || defaultAvatar}
                alt={cmt.user?.name || "user"}
                className="comment-avatar"
            />

            {/* Nội dung */}
            <div className="comment-body">
                <div className="comment-header">
                    {/* Tên + ngày */}
                    <div className="comment-meta">
                        <strong className="comment-name">{cmt.user?.name}</strong>
                        {cmt.date && <span className="comment-date">{formatDate(cmt.date)}</span>}
                    </div>

                    {/* Xóa */}
                    {cmt.user.id === user?.id && (
                        <button
                            className="delete-comment-btn"
                            onClick={() => onDelete(index)}
                        >
                            Xóa
                        </button>
                    )}
                </div>

                {/* Nội dung bình luận */}
                <p className="comment-text">{cmt.text}</p>
            </div>
        </div>
    );
}
/* {cmt.date && (
                            <span className="comment-date">
                                {new Date(cmt.date).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </span>
                        )} */