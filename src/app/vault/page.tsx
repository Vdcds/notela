import React from "react";
import { Metadata } from "next";
import Vault from "@/components/Vault";

export const metadata: Metadata = {
  title: "Vault - Notela",
  description:
    "Browse and manage your encrypted markdown vault with vim-style navigation",
};

const page = () => {
  return (
    <div>
      <Vault />
    </div>
  );
};

export default page;
