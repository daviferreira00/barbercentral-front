"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import ProdutoDetailDesktop from "./ProdutoDetailDesktop"
import ProdutoDetailMobile from "./ProdutoDetailMobile"

export default function DetalheProdutoPage({ params }: { params: { id: string } }) {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? (
    <ProdutoDetailMobile productId={params.id} />
  ) : (
    <ProdutoDetailDesktop productId={params.id} />
  )
}
