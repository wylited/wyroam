// index.tsx
'use client';
import { Sidebar } from "@/components/Sidebar"
import { Panels } from "@/components/Panels"
import { TabList } from "@/components/TabList"

export default function Home() {
  return (
    <div className="min-h-screen flex">
      <TabList />
      <main className="flex-1 pl-12 pr-16">
        <Panels />
      </main>
      <Sidebar />
    </div>
  );
}
