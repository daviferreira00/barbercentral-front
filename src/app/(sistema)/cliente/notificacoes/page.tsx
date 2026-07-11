"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plus, Edit2, Trash2, HelpCircle } from "lucide-react"

interface NotificationRule {
  id: string
  client_id: string
  name: string
  trigger_type: "booking_confirmation" | "booking_reminder" | "customer_retention"
  trigger_value: number
  trigger_unit: "hours" | "days"
  message_template: string
  channel_id: string | null
  active: boolean
  channel_name?: string
}

interface WhatsAppChannel {
  id: string
  instance_name: string
  professional_name?: string
}

export default function ClientNotificationsPage() {
  const [rules, setRules] = useState<NotificationRule[]>([])
  const [channels, setChannels] = useState<WhatsAppChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modais de Criação e Edição
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null)

  // Campos do Formulário
  const [ruleName, setRuleName] = useState("")
  const [triggerType, setTriggerType] = useState<"booking_confirmation" | "booking_reminder" | "customer_retention">("booking_reminder")
  const [triggerValue, setTriggerValue] = useState("1")
  const [triggerUnit, setTriggerUnit] = useState<"hours" | "days">("days")
  const [messageTemplate, setMessageTemplate] = useState("")
  const [selectedChannelId, setSelectedChannelId] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    const [resRules, resChannels] = await Promise.all([
      http.get<NotificationRule[]>("/cliente/notificacoes"),
      http.get<WhatsAppChannel[]>("/cliente/whatsapp")
    ])
    setLoading(false)

    if (resRules.error) {
      setError(resRules.error.message)
      return
    }

    if (resRules.data) setRules(resRules.data)
    if (resChannels.data) setChannels(resChannels.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreateModal = () => {
    setEditingRule(null)
    setRuleName("")
    setTriggerType("booking_reminder")
    setTriggerValue("1")
    setTriggerUnit("days")
    setSelectedChannelId("")
    setIsActive(true)
    setMessageTemplate(
      "Olá, {nome_cliente}!\n\nPassando para lembrar do seu agendamento no dia {data_hora} com o profissional {nome_profissional}.\n\nServiços: {nome_servico}.\n\nCaso precise cancelar, acesse: {link_cancelamento}\n\nAté logo!"
    )
    setIsRuleModalOpen(true)
  }

  const handleOpenEditModal = (rule: NotificationRule) => {
    setEditingRule(rule)
    setRuleName(rule.name)
    setTriggerType(rule.trigger_type)
    setTriggerValue(rule.trigger_value.toString())
    setTriggerUnit(rule.trigger_unit)
    setSelectedChannelId(rule.channel_id || "")
    setIsActive(rule.active)
    setMessageTemplate(rule.message_template)
    setIsRuleModalOpen(true)
  }

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleName.trim() || !messageTemplate.trim()) return

    setSaveLoading(true)
    const payload = {
      name: ruleName,
      trigger_type: triggerType,
      trigger_value: triggerType === "booking_confirmation" ? 0 : parseInt(triggerValue) || 1,
      trigger_unit: triggerUnit,
      message_template: messageTemplate,
      channel_id: selectedChannelId ? selectedChannelId : null,
      active: isActive
    }

    let res
    if (editingRule) {
      res = await http.put<NotificationRule>(`/cliente/notificacoes/${editingRule.id}`, payload)
    } else {
      res = await http.post<NotificationRule>("/cliente/notificacoes", payload)
    }
    setSaveLoading(false)

    if (res.error) {
      alert(res.error.message)
    } else {
      setIsRuleModalOpen(false)
      loadData()
    }
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta regra de notificação?")) return

    const res = await http.delete<{ ok: boolean }>(`/cliente/notificacoes/${id}`)
    if (res.error) {
      alert(res.error.message)
    } else {
      loadData()
    }
  }

  const handleToggleActive = async (rule: NotificationRule) => {
    const payload = {
      name: rule.name,
      trigger_type: rule.trigger_type,
      trigger_value: rule.trigger_value,
      trigger_unit: rule.trigger_unit,
      message_template: rule.message_template,
      channel_id: rule.channel_id,
      active: !rule.active
    }
    const res = await http.put(`/cliente/notificacoes/${rule.id}`, payload)
    if (res.error) {
      alert(res.error.message)
    } else {
      loadData()
    }
  }

  const insertPlaceholder = (tag: string) => {
    setMessageTemplate(prev => prev + tag)
  }

  const getTriggerText = (rule: NotificationRule) => {
    switch (rule.trigger_type) {
      case "booking_confirmation":
        return "Disparo Imediato ao agendar"
      case "booking_reminder":
        return `Lembrete: ${rule.trigger_value} ${rule.trigger_unit === "hours" ? "hora(s)" : "dia(s)"} antes`
      case "customer_retention":
        return `Retenção: ${rule.trigger_value} ${rule.trigger_unit === "hours" ? "hora(s)" : "dia(s)"} após último corte`
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6 w-full animate-fade-in px-1 md:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <i className="ti ti-bell-ringing text-indigo-500 text-3xl" />
            Regras de Notificações
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure o envio automático de mensagens de WhatsApp para agendamentos, lembretes ou retenção.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold h-9 text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          Nova Regra
        </Button>
      </div>

      {error && <Alert variant="error" message={error} />}

      {/* Rules list */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-xs font-bold mt-2">Buscando regras de notificações...</span>
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border">
            <i className="ti ti-bell-ringing text-slate-400 text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhuma regra de disparo configurada</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Personalize mensagens de agendamento ou crie regras para lembrar os clientes de voltarem à barbearia.
          </p>
          <Button
            onClick={handleOpenCreateModal}
            className="mt-6 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs"
          >
            Criar Minha Primeira Regra
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="hover:border-slate-300 transition-all">
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-slate-800 text-base">{rule.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        rule.trigger_type === "booking_confirmation"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : rule.trigger_type === "booking_reminder"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {rule.trigger_type === "booking_confirmation"
                        ? "Confirmação"
                        : rule.trigger_type === "booking_reminder"
                        ? "Lembrete"
                        : "Fidelização/Retenção"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {getTriggerText(rule)}
                  </p>
                  <div className="bg-slate-50 border p-3 rounded-xl text-xs text-slate-600 font-medium whitespace-pre-wrap font-sans max-w-3xl">
                    {rule.message_template}
                  </div>
                  <div className="flex gap-4 text-[10px] text-slate-400 font-semibold pt-1">
                    <span>
                      Dispositivo de Envio:{" "}
                      <strong className="text-slate-650">
                        {rule.channel_name ? rule.channel_name : "Geral (Qualquer Canal)"}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Ativa?</span>
                    <Checkbox checked={rule.active} onCheckedChange={() => handleToggleActive(rule)} />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(rule)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL FORMULÁRIO DE REGRA */}
      <Dialog open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? "Editar Regra de Notificação" : "Nova Regra de Notificação"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRule} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nome da Regra
                </label>
                <Input
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="Ex: Lembrete 24h antes"
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Dispositivo de Envio (WhatsApp)
                </label>
                <select
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
                >
                  <option value="">Geral (Enviar por qualquer canal ativo)</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.professional_name ? `${ch.professional_name} - (${ch.instance_name})` : `Geral - (${ch.instance_name})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Gatilho de Disparo
                </label>
                <select
                  value={triggerType}
                  onChange={(e: any) => setTriggerType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
                >
                  <option value="booking_confirmation">Confirmação Imediata</option>
                  <option value="booking_reminder">Lembrete antes do horário</option>
                  <option value="customer_retention">Retenção de clientes</option>
                </select>
              </div>

              {triggerType !== "booking_confirmation" && (
                <>
                  <div className="space-y-1.5 sm:col-span-1 animate-fade-in">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Quanto tempo?
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={triggerValue}
                      onChange={(e) => setTriggerValue(e.target.value)}
                      className="rounded-xl border-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1 animate-fade-in">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Unidade de tempo
                    </label>
                    <select
                      value={triggerUnit}
                      onChange={(e: any) => setTriggerUnit(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
                    >
                      <option value="hours">Hora(s)</option>
                      <option value="days">Dia(s)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-1.5 border-t pt-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  Template da Mensagem
                </label>
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                  Clique nos botões abaixo para inserir tags automáticas.
                </span>
              </div>

              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                placeholder="Escreva sua mensagem..."
                rows={5}
                required
                className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              />

              {/* Botões de Tags rápidas */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertPlaceholder("{nome_cliente}")}
                  className="h-7 text-[10px] font-bold border-indigo-100 hover:bg-indigo-50 text-indigo-700"
                >
                  + Nome Cliente
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertPlaceholder("{data_hora}")}
                  className="h-7 text-[10px] font-bold border-indigo-100 hover:bg-indigo-50 text-indigo-700"
                >
                  + Data/Hora
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertPlaceholder("{nome_profissional}")}
                  className="h-7 text-[10px] font-bold border-indigo-100 hover:bg-indigo-50 text-indigo-700"
                >
                  + Nome Barbeiro
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertPlaceholder("{nome_servico}")}
                  className="h-7 text-[10px] font-bold border-indigo-100 hover:bg-indigo-50 text-indigo-700"
                >
                  + Serviço(s)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertPlaceholder("{link_cancelamento}")}
                  className="h-7 text-[10px] font-bold border-indigo-100 hover:bg-indigo-50 text-indigo-700"
                >
                  + Link Cancelar
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                variant="outline"
                className="border-slate-200 text-slate-700 font-semibold"
                disabled={saveLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5"
                disabled={saveLoading}
              >
                {saveLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                )}
                Salvar Regra
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
