# NyayaSathi – GenAI Legal Aid & Rights Navigator

NyayaSathi is a full-stack, AI-powered web application designed to help rural citizens understand their legal rights, access government schemes, and draft simple legal documents in Hindi and regional languages. 

## Features
- **AI Legal Assistant:** ChatGPT-powered chatbot guiding users through basic legal queries.
- **Voice Support:** Speech-to-Text input for lower-literacy users and Text-to-Speech output.
- **Rights Awareness:** Categorized modules explaining rights for Farmers, Women, Labor, and Consumers.
- **Scheme Finder:** Easy access to government scheme details with eligibility and application processes.
- **Document Assistance:** Generate dynamic draft documents like Police FIRs or general complaints.

## Project Structure
```text
Legal-Aid/
├── .env
├── package.json
├── server.js
├── api/
│   ├── chatbot.js
│   ├── documents.js
│   ├── rights.js
│   └── schemes.js
├── data/
│   └── mockData.json
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- An OpenAI API Key (optional but required for true AI functionality).

### Installation
1. Clone or download this repository.
2. Open the terminal and navigate to the project directory:
   ```bash
   cd path/to/Legal-Aid
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Setup your Environment Variables:
   - Open the `.env` file in the root directory.
   - Replace `your_openai_api_key_here` with your actual OpenAI API Key.

### Running the Server
Start the application by running:
```bash
npm start
```
By default, the server will run on `http://localhost:3000`.

Open your browser and navigate to `http://localhost:3000` to start using NyayaSathi. Wait for local microphone permissions if you want to use the voice feature.
