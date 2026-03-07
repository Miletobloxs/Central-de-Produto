import nodemailer from "nodemailer";

class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      console.log(`[SMTP] Inicializando transportador: ${host}:${port} (Usuário: ${user})`);
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user,
          pass,
        },
      });
    } else {
      console.warn("[SMTP] Configurações ausentes no .env:", {
        host: !!host,
        user: !!user,
        pass: !!pass,
      });
    }
  }

  async sendInviteEmail(email: string, inviteLink: string, roleLabel: string) {
    const from = process.env.MAIL_FROM || '"Central de Produto" <noreply@bloxs.com.br>';
    
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f9fafb; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin: 0;">Bloxs <span style="color: #2563eb;">Central de Produto</span></h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">Você foi convidado!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Olá, você foi convidado para se juntar ao time da Bloxs na plataforma Central de Produto com o cargo de <strong>${roleLabel}</strong>.
          </p>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 16px; transition: background-color 0.2s;">
              Aceitar Convite e Acessar
            </a>
          </div>
          
          <div style="padding: 16px; background-color: #eff6ff; border-radius: 12px; border: 1px solid #dbeafe;">
            <p style="color: #1e40af; font-size: 12px; margin: 0; line-height: 1.5;">
              <strong>Atenção:</strong> Este convite é válido por <strong>24 horas</strong> e está vinculado estritamente ao e-mail <strong>${email}</strong>.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 32px;">
          <p style="color: #9ca3af; font-size: 12px;">
            Este é um e-mail automático da Central de Produto Bloxs. Por favor, não responda.
          </p>
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: email,
          subject: "Convite: Central de Produto Bloxs 🚀",
          html,
        });
        console.log(`E-mail de convite enviado para ${email}`);
        return true;
      } catch (error) {
        console.error("Erro ao enviar e-mail via SMTP:", error);
        throw error;
      }
    } else {
      console.warn("SMTP não configurado. Link de convite gerado:");
      console.warn(`EMAIL: ${email}`);
      console.warn(`LINK: ${inviteLink}`);
      return false;
    }
  }
}

export const mailService = new MailService();
