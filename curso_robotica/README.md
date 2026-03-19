[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)
![HTML5](https://img.shields.io/badge/HTML5-Markup-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Status](https://img.shields.io/badge/Status-Concluído-brightgreen)

# Curso Adaptativo de Robótica com Arduino

Este repositório contém o **curso adaptativo de Robótica com Arduino**, baseado em **lógica fuzzy**, desenvolvido para fins educacionais e de pesquisa. O curso utiliza **HTML/JavaScript no front-end**, **Google Apps Script no back-end** e **Google Sheets como base de dados**.

A adaptação da trilha de aprendizagem ocorre automaticamente, direcionando o estudante para **conteúdos regulares, de reforço ou de desafio**, de acordo com seu desempenho.

---

## 📦 Estrutura do Repositório

```
├── html/
│   ├── index.html
│   ├── introcao.html
│   ├── diagnostico.html
│   ├── topico01.html
│   ├── reforco01.html
│   ├── desafio01.html
│   ├── topico02.html
│   ├── reforco02.html
│   ├── desafio02.html
│   ├── topico03.html
│   ├── reforco03.html
│   ├── desafio03.html
│   ├── topico04.html
│   ├── reforco04.html
│   ├── desafio04.html
│   ├── topico05.html
│   ├── reforco05.html
│   └── desafio05.html
│
├── apps_script/
│   ├── sheet_utils.js
│   ├── routing.js
│   ├── fuzzy.js
│   ├── quizzers.js
│   ├── final.js
│   └── userx.js
│
└── robotica_arduino.xlsx
```

---

## 🗂️ Planilha Base do Curso

O arquivo **`robotica_arduino.xlsx`** é a **planilha-base do curso**.

Ela armazena:

* Dados do diagnóstico inicial
* Respostas dos quizzes
* Notas calculadas
* Resultados da inferência fuzzy
* Decisão da trilha (regular, reforço ou desafio)

⚠️ **Essa planilha é essencial para o funcionamento do sistema.**

---

## 🚀 Passo a Passo de Instalação

### 1️⃣ Upload da Planilha no Google Drive

1. Faça o upload do arquivo **`robotica_arduino.xlsx`** para o seu Google Drive
2. Abra a planilha no Google Sheets

---

### 2️⃣ Acessar o Google Apps Script

1. Com a planilha aberta, vá em:
   **Extensões → Apps Script**
2. Um novo projeto do Apps Script será aberto, **vinculado automaticamente à planilha**

---

### 3️⃣ Configurar o `sheet_utils.js`

No arquivo **`sheet_utils.js`**, localize a constante responsável pelo ID da planilha:

```javascript
const SHEET_ID = 'COLE_AQUI_O_ID_DA_PLANILHA';
```

🔹 Substitua pelo **ID da sua planilha**, que pode ser obtido na URL do Google Sheets:

```
https://docs.google.com/spreadsheets/d/ID_DA_PLANILHA/edit
```

⚠️ **Este passo é obrigatório** para que o sistema funcione corretamente.

---

### 4️⃣ Inserir os Arquivos do Apps Script e HTML no Projeto

No editor do Apps Script:

1. Crie os seguintes arquivos de script (`+ → Arquivo`):

   * sheet_utils.gs
   * routing.gs
   * fuzzy.gs
   * quizzers.gs
   * final.gs
   * userx.gs

2. Copie e cole o conteúdo correspondente de cada arquivo `.js` deste repositório

3. Em seguida, crie os arquivos HTML diretamente no Apps Script (`+ → HTML`):

   * index.html
   * introcao.html
   * diagnostico.html
   * topico01.html
   * reforco01.html
   * desafio01.html
   * topico02.html
   * reforco02.html
   * desafio02.html
   * topico03.html
   * reforco03.html
   * desafio03.html
   * topico04.html
   * reforco04.html
   * desafio04.html
   * topico05.html
   * reforco05.html
   * desafio05.html

4. Copie e cole o conteúdo de cada arquivo HTML para o respectivo arquivo criado no Apps Script

5. Salve o projeto

---

### 5️⃣ Publicar como Web App

1. Clique em **Implantar → Nova implantação**
2. Selecione **Tipo: Aplicativo da Web**
3. Configure:

   * Executar como: **Você**
   * Quem pode acessar: **Qualquer pessoa**
4. Clique em **Implantar**
5. Autorize o projeto

🔗 Guarde a **URL do Web App**, pois ela será utilizada internamente pelos arquivos HTML criados no Apps Script

---

### 6️⃣ Acesso aos Arquivos HTML

Após a publicação do Web App:

* Os arquivos HTML passam a ser servidos diretamente pelo **Google Apps Script**
* O acesso ao curso ocorre por meio da **URL do Web App**
* Não é necessário hospedar os HTMLs externamente (GitHub Pages ou servidor próprio)

---

## 🧠 Funcionamento do Sistema Adaptativo

1. O estudante acessa `index.html`
2. Realiza o **diagnóstico inicial** (`diagnostico.html`)
3. Os dados são enviados ao Apps Script
4. O motor **fuzzy** avalia:

   * Desempenho
   * Dificuldade percebida
   * Autoconfiança
5. O sistema decide automaticamente a próxima trilha:

   * Conteúdo regular
   * Reforço
   * Desafio

---

## 🎓 Finalidade Acadêmica

Este projeto foi desenvolvido para:

* Ensino de Robótica Educacional
* Pesquisa em Sistemas Adaptativos
* Estudos em Lógica Fuzzy aplicada à Educação

Pode ser utilizado, adaptado e estendido para fins educacionais e científicos.

---

## 📜 Licença

Este projeto é distribuído sob licença **CC BY 4.0**, permitindo uso, adaptação e redistribuição, desde que citada a autoria.

---

## 🤖 Uso de Inteligência Artificial

Este projeto utiliza técnicas de **lógica fuzzy** para adaptação da aprendizagem, conforme descrito nos trabalhos acadêmicos associados.
