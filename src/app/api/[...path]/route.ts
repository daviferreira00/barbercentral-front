import { NextRequest, NextResponse } from "next/server"
import { bffProxy } from "@/shared/lib/bff-proxy"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/")
  const searchParams = request.nextUrl.search
  return bffProxy(`${path}${searchParams}`, "GET")
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const pathParts = params.path
  const originalPath = "/" + pathParts.join("/")

  const isLogo = pathParts[0] === "config" && (pathParts[1] === "logo" || pathParts[1] === "logo-central")
  const isAdminUpload = pathParts[0] === "admin" && pathParts[1] === "upload"
  const isProfPhoto = pathParts[0] === "professionals" && pathParts[pathParts.length - 1] === "photo"

  if (isLogo || isAdminUpload || isProfPhoto) {
    try {
      const fd = await request.formData()
      const file = fd.get("logo") || fd.get("file") || fd.get("photo")
      
      if (!file || typeof file === "string") {
        return NextResponse.json({ error: { message: "Nenhum arquivo enviado." } }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext = path.extname(file.name)
      const prefix = isLogo ? (pathParts[1] === "logo" ? "logo" : "logo_central") : isProfPhoto ? "photo" : "upload"
      const filename = `${prefix}_${Date.now()}${ext}`
      
      const uploadDir = path.join(process.cwd(), "public", "uploads")
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const destPath = path.join(uploadDir, filename)
      fs.writeFileSync(destPath, buffer)

      const url = `/uploads/${filename}`

      if (isLogo) {
        return NextResponse.json({ logo_url: url })
      }
      if (isAdminUpload) {
        return NextResponse.json({ url: url })
      }
      if (isProfPhoto) {
        // Envia a URL salva para o backend associar com o profissional no banco
        return bffProxy(originalPath, "POST", { photo_url: url })
      }
    } catch (err: any) {
      return NextResponse.json({ error: { message: "Erro ao salvar arquivo no front-end.", details: err.message } }, { status: 500 })
    }
  }

  // Comportamento padrão para outras rotas POST
  const contentType = request.headers.get("content-type") || ""
  if (contentType.includes("multipart/form-data")) {
    const fd = await request.formData()
    return bffProxy(originalPath, "POST", fd)
  }
  const body = await request.json().catch(() => null)
  return bffProxy(originalPath, "POST", body)
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/")
  const body = await request.json().catch(() => null)
  return bffProxy(path, "PUT", body)
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/")
  return bffProxy(path, "DELETE")
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/")
  const body = await request.json().catch(() => null)
  return bffProxy(path, "PATCH", body)
}
