'use client'

import dynamic from "next/dynamic";
const Article = dynamic(() => import("./components/article"), {ssr: false});

export default function Home() {
  return (
    <main>
      <Article></Article>
    </main>
  )
}
