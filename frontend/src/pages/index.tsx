'use client';
import { Sidebar } from "@/components/Sidebar"
export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="p-8">
        <h1 className="text-3xl font-bold">Main Content</h1>
        <p className="mt-4">Your main content goes here...</p>
      </main>
      <Sidebar />
    </div>
  )
}
