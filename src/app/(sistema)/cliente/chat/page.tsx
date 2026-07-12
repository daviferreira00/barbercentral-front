"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import ChatDesktop from "./ChatDesktop"
import ChatMobile from "./ChatMobile"

export default function ChatPage() {
	const isMobile = useIsMobile()
	if (isMobile === null) return null
	return isMobile ? <ChatMobile /> : <ChatDesktop />
}
