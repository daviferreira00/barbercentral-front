import { NextRequest } from "next/server"
import { bffProxy } from "@/shared/lib/bff-proxy"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/")
  const searchParams = request.nextUrl.search
  return bffProxy(`${path}${searchParams}`, "GET")
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/")
  const contentType = request.headers.get("content-type") || ""
  if (contentType.includes("multipart/form-data")) {
    const fd = await request.formData()
    return bffProxy(path, "POST", fd)
  }
  const body = await request.json().catch(() => null)
  return bffProxy(path, "POST", body)
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
