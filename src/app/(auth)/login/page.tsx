import { LoginForm } from "./LoginForm"

// Sem subdomínio não há como saber a barbearia antes do login — sempre a logo
// genérica do Barber Central.
export default function LoginPage() {
  return <LoginForm logoUrl="/logo/barbercentral-logo-horizontal.svg" />
}
