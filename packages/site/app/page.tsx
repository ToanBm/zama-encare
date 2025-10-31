"use client";

import { useTab } from "@/contexts/TabContext";
import { Create } from "@/components/Create";
import { Admin } from "@/components/Admin";

export default function Home() {
  const { activeTab } = useTab();

  return (
    <>
      {/* Tab Content */}
      {activeTab === "healthcheck" && <Create />}
      {activeTab === "admin" && <Admin />}
    </>
  );
}
