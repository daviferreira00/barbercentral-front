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

      let ext = path.extname(file.name || "").toLowerCase()
      if (!ext || ext === ".") {
        const mime = (file.type || "").toLowerCase()
        if (mime.includes("png")) ext = ".png"
        else if (mime.includes("jpeg") || mime.includes("jpg")) ext = ".jpg"
        else if (mime.includes("webp")) ext = ".webp"
        else if (mime.includes("svg")) ext = ".svg"
        else if (mime.includes("gif")) ext = ".gif"
        else if (mime.includes("avif")) ext = ".avif"
        else if (mime.includes("bmp")) ext = ".bmp"
        else {
          // Detecta por magic numbers no buffer da imagem
          if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
            ext = ".png"
          } else if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
            ext = ".jpg"
          } else if (buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
            ext = ".gif"
          } else if (buffer.toString("utf8", 0, 100).includes("<svg")) {
            ext = ".svg"
          } else {
            ext = ".png"
          }
        }
      }

      const allowedExts = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".avif", ".bmp", ".ico"]
      if (!allowedExts.includes(ext)) {
        return NextResponse.json({ error: { message: "Formato de arquivo não suportado. Por favor, envie uma imagem PNG, JPEG, WEBP ou SVG." } }, { status: 400 })
      }

      const prefix = isLogo ? (pathParts[1] === "logo" ? "logo" : "logo_central") : isProfPhoto ? "photo" : "upload"
      const filename = `${prefix}_${Date.now()}${ext}`
      
      const uploadDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads")
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const destPath = path.join(uploadDir, filename)
      fs.writeFileSync(destPath, buffer)

      const url = `/uploads/${filename}`

      if (isLogo) {
        return NextResponse.json({ data: { logo_url: url } })
      }
      if (isAdminUpload) {
        return NextResponse.json({ data: { url: url } })
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
