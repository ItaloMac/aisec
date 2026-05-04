import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageCircle, Smartphone, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type Channel = "system" | "whatsapp" | "app";

type NotificationSettings = {
  channels: Record<Channel, boolean>;
  whatsapp: { phone: string; apiKey: string };
  app: { deviceToken: string };
  triggers: {
    critical: boolean;
    warning: boolean;
    daily: boolean;
  };
  recipients: string;
};

const STORAGE_KEY = "aisec.notifications";

const defaults: NotificationSettings = {
  channels: { system: true, whatsapp: false, app: false },
  whatsapp: { phone: "", apiKey: "" },
  app: { deviceToken: "" },
  triggers: { critical: true, warning: true, daily: false },
  recipients: "",
};

export const Route = createFileRoute("/_app/notificacoes")({
  component: NotificacoesPage,
});

function NotificacoesPage() {
  const [s, setS] = useState<NotificationSettings>(defaults);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setS({ ...defaults, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    toast.success("Configurações salvas", {
      description: "Suas preferências de notificação foram atualizadas.",
    });
  };

  const test = (channel: Channel) => {
    if (!s.channels[channel]) {
      toast.error("Canal desativado", { description: "Ative o canal antes de testar." });
      return;
    }
    const labels: Record<Channel, string> = {
      system: "Sistema",
      whatsapp: "WhatsApp",
      app: "Aplicativo",
    };
    toast.success(`Teste enviado via ${labels[channel]}`, {
      description: "Notificação de teste disparada com sucesso.",
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Notificações</h1>
        <p className="text-muted-foreground text-sm">
          Configure como e quando receber alertas de infrações de EPI.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Canais de envio</CardTitle>
          <CardDescription>Habilite os meios pelos quais o AISEC vai notificar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ChannelRow
            icon={<Bell className="w-5 h-5 text-primary" />}
            title="Notificação no sistema"
            description="Toasts e modais dentro do painel AISEC."
            enabled={s.channels.system}
            onToggle={(v) => setS({ ...s, channels: { ...s.channels, system: v } })}
            onTest={() => test("system")}
          />

          <Separator />

          <ChannelRow
            icon={<MessageCircle className="w-5 h-5 text-[#25D366]" />}
            title="WhatsApp"
            description="Mensagens via API do WhatsApp Business."
            enabled={s.channels.whatsapp}
            onToggle={(v) => setS({ ...s, channels: { ...s.channels, whatsapp: v } })}
            onTest={() => test("whatsapp")}
          >
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="wpp-phone">Número (com DDI)</Label>
                <Input
                  id="wpp-phone"
                  placeholder="+55 11 90000-0000"
                  value={s.whatsapp.phone}
                  onChange={(e) => setS({ ...s, whatsapp: { ...s.whatsapp, phone: e.target.value } })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wpp-key">Token / API Key</Label>
                <Input
                  id="wpp-key"
                  type="password"
                  placeholder="••••••••"
                  value={s.whatsapp.apiKey}
                  onChange={(e) => setS({ ...s, whatsapp: { ...s.whatsapp, apiKey: e.target.value } })}
                />
              </div>
            </div>
          </ChannelRow>

          <Separator />

          <ChannelRow
            icon={<Smartphone className="w-5 h-5 text-accent" />}
            title="Notificação via aplicativo"
            description="Push notifications no app mobile AISEC."
            enabled={s.channels.app}
            onToggle={(v) => setS({ ...s, channels: { ...s.channels, app: v } })}
            onTest={() => test("app")}
          >
            <div className="pt-2 space-y-1.5">
              <Label htmlFor="dev-token">Device Token</Label>
              <Input
                id="dev-token"
                placeholder="Token do dispositivo registrado"
                value={s.app.deviceToken}
                onChange={(e) => setS({ ...s, app: { ...s.app, deviceToken: e.target.value } })}
              />
            </div>
          </ChannelRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gatilhos</CardTitle>
          <CardDescription>Quando o AISEC deve disparar notificações.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TriggerRow
            label="Infração crítica (alerta vermelho)"
            badge={<Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" /> Crítico</Badge>}
            enabled={s.triggers.critical}
            onToggle={(v) => setS({ ...s, triggers: { ...s.triggers, critical: v } })}
          />
          <TriggerRow
            label="Aviso (zona amarela/laranja)"
            badge={<Badge variant="secondary">Atenção</Badge>}
            enabled={s.triggers.warning}
            onToggle={(v) => setS({ ...s, triggers: { ...s.triggers, warning: v } })}
          />
          <TriggerRow
            label="Resumo diário de conformidade"
            badge={<Badge variant="outline">Diário</Badge>}
            enabled={s.triggers.daily}
            onToggle={(v) => setS({ ...s, triggers: { ...s.triggers, daily: v } })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Destinatários adicionais</CardTitle>
          <CardDescription>E-mails ou IDs de supervisores, separados por vírgula.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="supervisor@empresa.com, gerente@empresa.com"
            value={s.recipients}
            onChange={(e) => setS({ ...s, recipients: e.target.value })}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setS(defaults)}>Restaurar padrão</Button>
        <Button onClick={save}><Save className="w-4 h-4" /> Salvar configurações</Button>
      </div>
    </div>
  );
}

function ChannelRow({
  icon, title, description, enabled, onToggle, onTest, children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  onTest: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-md bg-muted grid place-content-center shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{title}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={onTest} disabled={!enabled}>Testar</Button>
              <Switch checked={enabled} onCheckedChange={onToggle} />
            </div>
          </div>
          {enabled && children}
        </div>
      </div>
    </div>
  );
}

function TriggerRow({
  label, badge, enabled, onToggle,
}: {
  label: string;
  badge: React.ReactNode;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {badge}
        <span className="text-sm">{label}</span>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}
