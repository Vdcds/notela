import NewNote from "@/components/NewNote";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "NewNote - Notela",
  description:
    "Create and edit markdown documents with vim-style navigation and live preview",
};

const page = () => {
  return (
    <div>
      <NewNote />
    </div>
  );
};

export default page;
