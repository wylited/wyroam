'use client';
import { Sidebar } from "@/components/Sidebar"
import { NodeList } from "@/lib/NodeContext.tsx"
export default function Home() {
  return (
    <div className="min-h-screen flex">
      <main className="p-8">
        <h1 className="text-3xl font-bold">Main Content</h1>
        <p className="mt-4">Your main content goes here...</p>
        <NodeList />
      </main>
      <Sidebar />
    </div>
  )
}
