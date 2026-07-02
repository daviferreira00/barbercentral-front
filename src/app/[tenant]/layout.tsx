import React from 'react';

// Esta interface deve bater com o retorno da sua API em Go (PublicClientData)
interface TenantData {
  client_id: string;
  color_primary: string;
  color_secondary: string;
  color_button?: string;
  font_family: string;
  client_name: string;
  client_slug: string;
  // ... outros campos
}

async function getTenantData(tenant: string): Promise<TenantData | null> {
  try {
    // O backend Go deve estar rodando na porta 8080 ou ajustar conforme sua env
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const res = await fetch(`${backendUrl}/api/v1/public/${tenant}`, {
      next: { revalidate: 60 }, // Cache de 60 segundos
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('Erro ao buscar dados do tenant:', error);
    return null;
  }
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenant: string };
}) {
  const tenantData = await getTenantData(params.tenant);

  // Define as variáveis CSS. Se não encontrar o tenant, usa valores padrão
  const customStyles = {
    '--color-primary': tenantData?.color_primary || '#6366f1',
    '--color-secondary': tenantData?.color_secondary || '#d97706',
    '--color-button': tenantData?.color_button || tenantData?.color_primary || '#6366f1',
    '--font-family': tenantData?.font_family || 'Montserrat',
  } as React.CSSProperties;

  return (
    // Esse div envolve todo o conteúdo do tenant (sistema, portal, auth)
    // E propaga as variáveis CSS para os elementos filhos
    <div style={customStyles} className="tenant-wrapper min-h-screen">
      {children}
    </div>
  );
}
