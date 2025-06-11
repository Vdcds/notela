import Shitlist from "@/components/Shitlist";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShitList - Notela",
  description:
    "Professional chaos management - organize your tasks and priorities",
};

const page = () => {
  return (
    <div>
      <Shitlist />
    </div>
  );
};

export default page;
