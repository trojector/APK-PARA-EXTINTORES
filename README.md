# 🧯 Extintores Juazeiro

Aplicativo Android para gerenciamento de extintores, empresas, clientes, recargas, manutenções, orçamentos e controle de vencimentos.

O **Extintores Juazeiro** foi desenvolvido para facilitar o gerenciamento operacional de empresas que trabalham com venda, inspeção, manutenção e recarga de extintores de incêndio.

---

## 📱 Aplicativo

**Nome:** Extintores Juazeiro  
**Plataforma:** Android  
**Status:** ✅ Aplicativo funcional / em evolução

O aplicativo foi desenvolvido com foco em uma interface simples, moderna e prática para uso no dia a dia.

---

## 🚀 Funcionalidades

### 🧯 Gestão de Extintores

- Cadastro de extintores
- Identificação por código/plaqueta
- Tipo do extintor
- Capacidade
- Fabricante
- Número de fabricação
- Ano de fabricação
- Localização
- Data da última recarga
- Próxima recarga
- Status do equipamento
- Histórico de serviços

### 🏢 Empresas e Clientes

- Cadastro de empresas
- Cadastro de clientes
- Dados de contato
- CNPJ/CPF
- Telefone
- WhatsApp
- E-mail
- Endereço
- Equipamentos vinculados à empresa

### 🔧 Recargas e Manutenções

Controle dos serviços realizados nos equipamentos:

- Recarga
- Manutenção
- Inspeção
- Retirada
- Entrega
- Ordem de serviço
- Histórico de atendimento
- Status do serviço

### 📅 Controle de Vencimentos

O sistema permite acompanhar os equipamentos de acordo com a situação da recarga:

- 🔴 Vencidos
- 🟠 Vencendo em breve
- 🟡 Próximos do vencimento
- 🟢 Regulares

O objetivo é facilitar o contato com os clientes antes do vencimento da recarga.

### 💰 Orçamentos

Criação e gerenciamento de:

- Orçamento de recarga
- Orçamento de manutenção
- Orçamento de venda
- Produtos
- Serviços
- Quantidades
- Valores
- Descontos
- Total do orçamento

### 🔳 QR Code

Cada equipamento pode receber uma identificação por QR Code.

A leitura do código pode permitir consultar rapidamente os dados do extintor, facilitando inspeções e atendimentos em campo.

### 📊 Dashboard

Painel principal com indicadores do sistema, incluindo:

- Total de extintores
- Extintores vencidos
- Extintores próximos do vencimento
- Recargas
- Manutenções
- Orçamentos
- Empresas cadastradas

### 📱 WhatsApp

Possibilidade de utilizar os dados cadastrados para facilitar o contato com clientes e empresas.

Exemplo de mensagem:

> Olá! Identificamos que um dos extintores da sua empresa está próximo do vencimento da recarga. A Extintores Juazeiro está à disposição para realizar o atendimento.

### 📄 Relatórios

Estrutura preparada para geração de relatórios relacionados a:

- Extintores
- Clientes
- Empresas
- Recargas
- Manutenções
- Orçamentos
- Vencimentos
- Serviços realizados

---

## 🛠️ Tecnologias

O aplicativo utiliza tecnologias do ecossistema Android, incluindo:

- **Android**
- **Kotlin**
- **Jetpack Compose**
- **Material 3**
- **Android Studio**
- **Gradle**

---

## 🏗️ Estrutura do aplicativo

A organização do projeto segue uma arquitetura preparada para evolução:

```text
ExtintoresJuazeiro/
│
├── app/
│   └── src/
│       └── main/
│           ├── java/
│           │   └── ...
│           ├── res/
│           └── AndroidManifest.xml
│
├── gradle/
├── build.gradle
├── settings.gradle
└── README.md
```

---

## 📲 Instalação

### APK

Para instalar uma versão de teste:

1. Baixe o arquivo APK.
2. Transfira para o celular Android.
3. Abra o arquivo.
4. Autorize a instalação quando solicitado.
5. Instale o aplicativo.

Exemplo:

```text
app-debug.apk
```

Para distribuição pública, recomenda-se utilizar uma versão **Release assinada**.

---

## 💻 Desenvolvimento no Android Studio

Para desenvolver o projeto:

```bash
git clone URL_DO_REPOSITORIO
```

Abra o projeto no **Android Studio**.

Aguarde o Gradle sincronizar e execute o aplicativo em:

- Emulador Android
- Celular Android conectado via USB

Para gerar o APK de teste:

```bash
./gradlew assembleDebug
```

O APK normalmente será gerado em:

```text
app/build/outputs/apk/debug/app-debug.apk
```

Para uma versão de distribuição, gere um APK Release assinado pelo Android Studio.

---

## 🔐 Segurança

Nunca publique no GitHub:

```text
API Keys
Tokens
Senhas
Credenciais de banco de dados
Chaves privadas
Keystore de assinatura
Arquivos .env com informações reais
Credenciais de APIs
```

Utilize variáveis de ambiente e mecanismos seguros para armazenar informações confidenciais.

---

## 🗺️ Roadmap

### Sistema

- [x] Interface Android
- [x] Dashboard
- [x] Navegação
- [x] Gestão de extintores
- [x] Gestão de clientes
- [x] Gestão de empresas
- [x] Controle de serviços
- [x] Orçamentos
- [x] Controle de vencimentos

### Próximas evoluções

- [ ] Banco de dados completo
- [ ] Sincronização em nuvem
- [ ] Login e autenticação
- [ ] Backup automático
- [ ] QR Code avançado
- [ ] Notificações automáticas
- [ ] Relatórios em PDF
- [ ] Assinatura digital
- [ ] Integração completa com WhatsApp
- [ ] Controle financeiro avançado
- [ ] Painel administrativo web
- [ ] Multiusuário
- [ ] Permissões por usuário
- [ ] Publicação na Google Play

---

## 🎨 Identidade

**EXTINTORES JUAZEIRO**

Sistema desenvolvido para auxiliar na gestão de equipamentos e serviços relacionados à segurança contra incêndio.

```text
🧯 EXTINTORES JUAZEIRO

Gestão de extintores
Recargas
Manutenção
Orçamentos
Vencimentos
Clientes
Empresas
```

---

## 📸 Screenshots

Adicione aqui imagens das telas do aplicativo:

```text
screenshots/
├── dashboard.png
├── extintores.png
├── empresas.png
├── orcamentos.png
├── vencimentos.png
└── qr-code.png
```

Exemplo no GitHub:

```markdown
![Dashboard](screenshots/dashboard.png)
```

---

## 📦 Versão

**Versão atual:** 1.0.0

O projeto está em desenvolvimento contínuo e novas funcionalidades serão adicionadas conforme a evolução do sistema.

---

## 👨‍💻 Projeto

**Extintores Juazeiro**

Aplicativo Android para gestão operacional de empresas e profissionais que trabalham com extintores de incêndio.

---

## 📄 Licença

Este projeto é propriedade da **Extintores Juazeiro**.

A utilização, cópia, distribuição ou modificação do código deve respeitar os termos definidos pelo proprietário do projeto.

---

### 🧯 Extintores Juazeiro

**Controle seus extintores. Organize seus serviços. Acompanhe seus clientes.**
