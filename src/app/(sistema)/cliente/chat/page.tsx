"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import ChatDesktop from "./ChatDesktop"
import ChatMobile from "./ChatMobile"

import { Suspense } from "react"

function ChatContent() {
	const isMobile = useIsMobile()
	if (isMobile === null) return null
	return isMobile ? <ChatMobile /> : <ChatDesktop />
}

export default function ChatPage() {
	return (
		<Suspense fallback={null}>
			<ChatContent />
		</Suspense>
	)
}
