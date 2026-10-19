import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathParts = params.path
  if (!pathParts || pathParts.length === 0) {
    return new NextResponse("Not Found", { status: 404 })
  }

  // Previne Directory Traversal
  const sanitizedParts = pathParts.map((p) => path.basename(p))
  const uploadDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads")
  const localFilePath = path.resolve(uploadDir, ...sanitizedParts)

  // 1. Tenta servir do disco local do frontend
  if (localFilePath.startsWith(path.resolve(uploadDir)) && fs.existsSync(localFilePath)) {
    try {
      const stat = fs.statSync(localFilePath)
      if (stat.isFile()) {
        const fileBuffer = fs.readFileSync(localFilePath)
        const ext = path.extname(localFilePath).toLowerCase()
        const contentType = MIME_TYPES[ext] || "application/octet-stream"

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Length": stat.size.toString(),
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        })
      }
    } catch (err) {
      console.error("[uploads route] Erro ao ler arquivo local:", err)
    }
  }

  // 2. Fallback: Se não estiver no disco do frontend, tenta buscar no backend Go
  const rawBackend = process.env.BACKEND_URL || "http://localhost:8080"
  const backendBase = rawBackend.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "")
  try {
    const backendUrl = `${backendBase}/uploads/${sanitizedParts.join("/")}`
    const backendRes = await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
    })

    if (backendRes.ok) {
      const arrayBuffer = await backendRes.arrayBuffer()
      const ext = path.extname(sanitizedParts[sanitizedParts.length - 1] || "").toLowerCase()
      const contentType = backendRes.headers.get("content-type") || MIME_TYPES[ext] || "application/octet-stream"

      // Salva localmente como cache para próximas requisições
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        if (localFilePath.startsWith(path.resolve(uploadDir))) {
          fs.writeFileSync(localFilePath, Buffer.from(arrayBuffer))
        }
      } catch (cacheErr) {
        // Silencioso se não houver permissão de escrita
      }

      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": arrayBuffer.byteLength.toString(),
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      })
    }
  } catch (err) {
    // Backend offline ou falha de conexão no fallback
  }

  return new NextResponse("Arquivo não encontrado", { status: 404 })
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const getRes = await GET(request, { params })
  return new NextResponse(null, {
    status: getRes.status,
    headers: getRes.headers,
  })
}
