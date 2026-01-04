TrustStack is a modular, security-aware AI backend framework designed to process user queries safely and intelligently.
The system integrates a Human Message Engine (HME) for response generation and a Restricted Monitoring Engine (RME) for safety, filtering, and policy enforcement before invoking external AI models (e.g., Gemini).

The architecture emphasizes:
Security-first query handling
Modular backend design
Extensibility for future AI engines
Clear separation of responsibilities
High-Level Architecture
Client (Frontend)
      |
      v
Express Server (server.js)
      |
      +--> RME (Restricted Monitoring Engine)
      |        - Pattern detection
      |        - Similarity threshold checks
      |        - Block / Allow decisions
      |
      +--> HME (Human Message Engine)
               - Prompt processing
               - Context handling
               - Response generation
               |
               v
           Gemini API

Project Structure
HACKOVERSE/
│
├── server.js                  # Main Express server entry point
├── package.json
├── .env                       # Environment variables (API keys, ports)
│
├── backend/
│   ├── HME/                   # Human Message Engine
│   │   ├── HMEserver.js       # HME request handler
│   │   ├── ResponseGenerator.js
│   │   └── GeminiAPI.js       # Gemini API integration
│   │
│   ├── RME/                   # Restricted Monitoring Engine
│   │   └── RMEserver.js
│
├── json_files/
│   └── reply.json             # Restricted patterns & policies
│
├── public/                    # Frontend assets (if applicable)
│
└── README.md

Core Components
1. Express Server (server.js)

Acts as the central request router.

Initializes RME and HME services.

Exposes API endpoints for frontend communication.

Loads environment variables using dotenv.

2. Restricted Monitoring Engine (RME)

Purpose:
Ensures that incoming queries comply with defined safety policies.

Key Features:

Loads restricted patterns from reply.json

Uses similarity threshold matching

Flags or blocks unsafe prompts

Acts as a gatekeeper before AI invocation

Primary File:
backend/RME/RMEserver.js

3. Human Message Engine (HME)

Purpose:
Processes approved user queries and generates intelligent responses.

Key Responsibilities:

Context construction

Prompt refinement

Response formatting

Delegating inference to Gemini

Primary Files:

HMEserver.js

ResponseGenerator.js

GeminiAPI.js

4. Gemini API Integration

Handles communication with Google Gemini.

Abstracted into its own module for easy replacement or extension.

Uses secure API key loading via .env.

Environment Variables

Create a .env file in the root directory:

PORT=3000
GEMINI_API_KEY=your_api_key_here


Important:
Never commit .env files to version control.

Installation & Setup
Prerequisites

Node.js (v18+ recommended)

npm or yarn

Steps
git clone https://github.com/your-repo/hackoverse.git
cd hackoverse
npm install


Start the server:

node server.js


or (recommended during development):

npx nodemon server.js

API Flow

Client sends a query

Server forwards query to RME

RME evaluates safety

❌ Blocked → error response

✅ Allowed → forwarded to HME

HME processes query

Gemini generates response

Final response returned to client

Security Considerations

All prompts are filtered before AI execution

Threshold-based similarity matching prevents prompt abuse

Modular engines reduce blast radius of failures

External API keys isolated in environment variables

Extensibility

You can easily:

Add new AI providers (OpenAI, Claude, local LLMs)

Extend RME with ML-based moderation

Introduce user profiling or session memory

Plug in database-backed conversation logs

Use Cases

Secure AI chatbots

Educational AI assistants

Mental health companions (e.g., Aura-Bot)

Research-grade AI moderation systems

University or enterprise AI gateways

License

This project is intended for academic and research use unless otherwise specified.
Add an explicit license if you plan to distribute publicly.

Author
Prasanna Mehkarkar
Atharva Mankar
Paresh Morankar
Disha Dubey
