import { LoginForm } from "./LoginForm"

async function getTenantData(tenant: string) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const res = await fetch(`${backendUrl}/api/v1/public/${tenant}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    return null;
  }
}

export default async function LoginPage({ params }: { params: { tenant: string } }) {
  const data = await getTenantData(params.tenant);
  const isCustomTenant = data && params.tenant !== "barbercentral" && params.tenant !== "barbearia-modelo";

  const logo = (isCustomTenant && (data.logo_central || data.logo_url))
    ? (data.logo_central || data.logo_url)
    : "/logo/barbercentral-logo-horizontal.svg";

  return <LoginForm logoUrl={logo} />
}
