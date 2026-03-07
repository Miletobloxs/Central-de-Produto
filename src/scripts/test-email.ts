import nodemailer from "nodemailer";

async function testEmail() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM;

  console.log("--- SMTP DIAGNOSTIC ---");
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`User: ${user}`);
  console.log(`Pass: ${pass ? "**** (defined)" : "(undefined)"}`);
  console.log(`From: ${from}`);
  console.log("-----------------------");

  if (!host || !user || !pass) {
    console.error("ERRO: Variáveis de ambiente SMTP faltando!");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  try {
    console.log("Testando conexão (verify)...");
    await transporter.verify();
    console.log("✅ Conexão SMTP estabelecida com sucesso!");

    console.log("Tentando enviar e-mail de teste...");
    const info = await transporter.sendMail({
      from: from || user,
      to: user, // Enviando para si mesmo como teste
      subject: "Teste de Conexão: Central de Produto 🚀",
      text: "Se você está lendo isso, a configuração SMTP está correta!",
      html: "<h1>Sucesso!</h1><p>A configuração SMTP da Central de Produto está funcionando corretamente.</p>",
    });

    console.log("✅ E-mail enviado com sucesso!");
    console.log("Message ID:", info.messageId);
  } catch (error: any) {
    console.error("❌ FALHA NO DIAGNÓSTICO:");
    if (error.code === 'EAUTH') {
      console.error("Erro de Autenticação (EAUTH): As credenciais estão incorretas.");
      console.error("DICA: Se estiver usando Gmail, você PRECISA de uma 'Senha de App' de 16 caracteres.");
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

testEmail();
