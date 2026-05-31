<div align="center">
  <img src="https://angular.io/assets/images/logos/angular/angular.svg" alt="Angular Logo" width="100"/>

  # 🏭 Web Sinterização Supervisório

  **Frontend Inteligente para Controle e Monitoramento de Processos de Sinterização**

  <p align="center">
    <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-brightgreen?style=for-the-badge" alt="Status" />
  </p>

  <p align="center">
    Uma interface de usuário (UI) moderna e responsiva focada na comunicação direta com CLPs e no gerenciamento estratégico do Sinter Piloto.
  </p>
</div>

<br/>

## 📖 Sobre o Projeto

O **Web Sinterização Supervisório** é a aplicação frontend responsável por centralizar o monitoramento e o controle da planta de sinterização. Atualmente, o sistema estabelece a ponte de comunicação entre a API e o PLC, garantindo que comandos e retornos de dados ocorram em tempo real.

O objetivo principal desta ferramenta é prover uma interface rica e intuitiva para que operadores e engenheiros possam analisar os dados do processo, gerenciar testes e otimizar a produção do Sinter Piloto.

---

## ⚡ Status Atual

Nesta versão inicial, o foco principal está na estabilidade da comunicação e no monitoramento base:

- 🟢 **Monitoramento de Dados em Tempo Real:** Exibição dos dados transmitidos pelo PLC via API.
- 🛠️ **Testes de Comandos:** Interface interativa dedicada ao envio e validação de comandos para o sistema.

---

## 🚀 Roadmap e Funcionalidades Futuras

O desenvolvimento é contínuo e a plataforma evoluirá para se tornar um sistema completo de gestão. As próximas etapas incluem:

<details>
<summary><b>📊 Geração e Exibição de Relatórios</b></summary>
<br/>
Criação de relatórios detalhados com informações operacionais, alertas e opções de exportação em múltiplos formatos (PDF, Excel).
</details>

<details>
<summary><b>🔌 Integração Completa com a API</b></summary>
<br/>
Comunicação avançada consumindo endpoints complexos para cruzar dados de produção, métricas e alarmes.
</details>

<details>
<summary><b>🧪 Gestão de Sinter Piloto</b></summary>
<br/>
Módulo dedicado contendo o cadastro minucioso de matérias-primas e a interface de visualização dos resultados detalhados dos testes.
</details>

<details>
<summary><b>📈 Análises Gráficas</b></summary>
<br/>
Dashboards interativos com gráficos dinâmicos para a comparação de dados históricos, facilitando a identificação de tendências operacionais.
</details>

---

## ⚙️ Como Executar Localmente

Siga as instruções abaixo para executar a aplicação em seu ambiente de desenvolvimento:

### 📋 Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (v16 ou superior)
- [Angular CLI](https://angular.io/cli)

### 🚀 Instalação

1. **Clone este repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd web-sinterizacao-supervisorio
   ```

2. **Instale as dependências do projeto:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```

4. Acesse a aplicação no seu navegador: **`http://localhost:4200/`**

---
<div align="center">
  Desenvolvido com 💡 e muita dedicação para otimizar os processos de Sinterização.
</div>
