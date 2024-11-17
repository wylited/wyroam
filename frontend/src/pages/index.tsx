// index.tsx
'use client';
import { Sidebar } from "@/components/Sidebar"
import { Panels } from "@/components/Panels"
import { TabList } from "@/components/TabList"

export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* Display the tab list on the very left,/
          /the main content in the middle,/
          /and the sidebar on the very right/
          /*/}
      <TabList />
      <main className="flex-1 pl-12 pr-16">
        {/* flex-1 allows for the Panels to take up the majority of the screen real estate*/}
        <Panels />
      </main>
      <Sidebar />
    </div>
  );
}
