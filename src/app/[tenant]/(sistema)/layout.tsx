import SistemaLayoutClient from "./SistemaLayoutClient"

export default async function SistemaLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode
  params: { tenant: string }
}) {
  let tenantData = null
  
  if (params.tenant && params.tenant !== "barbercentral" && params.tenant !== "barbearia-modelo") {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/public/${params.tenant}`, {
        cache: "force-cache",
        next: { revalidate: 60 },
      })
      if (res.ok) {
        const json = await res.json()
        tenantData = json.data
      }
    } catch (error) {
      console.error("Error fetching tenant config for SistemaLayout", error)
    }
  }

  return (
    <SistemaLayoutClient tenantData={tenantData}>
      {children}
    </SistemaLayoutClient>
  )
}
