"use client"
import dynamic from "next/dynamic"
import React from "react"

// dynamic import with ssr:false must live in a client component
const StudioClient = dynamic(() => import("@/components/StudioClient"), { ssr: false })

export default function StudioLoader() {
  return <StudioClient />
}
