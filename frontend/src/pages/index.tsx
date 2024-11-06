// index.tsx
'use client';
import { Sidebar } from "@/components/Sidebar"
import { Panels } from "@/components/Panels"
import { Tabs } from "@/components/Tabs"

export default function Home() {
  return (
    <div className="min-h-screen flex">
      <main className="flex-1 pr-16">
        <Panels />
      </main>
      <Sidebar />
    </div>
  )
}
