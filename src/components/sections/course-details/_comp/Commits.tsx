"use client"
import React from "react";
import ClientComment from "@/components/shared/blog-details/ClientComment";
import CommentFome from "@/components/shared/forms/CommentFome";

type Props = {
  commits: any;
  courseId : any
};

const Commits : React.FC<Props> = ({ commits , courseId }) => {
    
  return (
    <div>
      {/* previous comment area  */}
      <ClientComment commits={commits} courseId={courseId} />
      {/* write comment area  */}
      <CommentFome courseId={courseId} />
    </div>
  );
};

export default Commits;
