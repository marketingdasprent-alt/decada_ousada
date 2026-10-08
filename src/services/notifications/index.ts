import "server-only";

/** SMS / WhatsApp (doc §102). Arquitetura preparada; fornecedor por decidir. */
export type NotificationChannel = "sms" | "whatsapp";

export interface NotificationProvider {
  send(channel: NotificationChannel, phone: string, message: string): Promise<void>;
}

const consoleProvider: NotificationProvider = {
  async send(channel, phone) {
    console.info(`[${channel}] mensagem → ${phone.slice(0, 4)}***${phone.slice(-2)}`);
  },
};

export const notifications = consoleProvider;
