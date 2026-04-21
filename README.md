# ⚡️ Aura Studio

**Professional AI-Powered Artistic Portrait Studio**

Aura Studio is an enterprise-grade creative platform that leverages cutting-edge AI models (Google Gemini) and a robust backend (Supabase) to generate high-fidelity, cinematic artistic portraits. Designed with a minimalist, "glamour-first" aesthetic, it provides artists and creators with professional tools for image generation, enhancement, and portfolio management.

---

## ✨ Key Features

- 🎨 **Advanced Image Generation**: Utilizing Gemini 3.1 Flash and Gemini 2.5 Flash for hyper-realistic artistic results.
- 🪄 **AI Prompt Enhancement**: Smart art direction that transforms simple ideas into professional cinematic prompts.
- 🖼️ **Reference-Based Creation**: Support for image-to-image workflows to maintain structural consistency.
- 📂 **Personal Gallery & History**: Persistent storage of generated works using Supabase and PostgreSQL.
- 🛡️ **Role-Based Access Control**: Integrated administrative tools for content management.
- 📱 **PWA Ready**: Installable on any device for a native-like experience.
- 🌙 **Cinematic UI**: A custom-designed interface optimized for focus and artistic workflow.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4, Framer Motion
- **AI Engine**: Google Gemini API (@google/genai)
- **Backend & Auth**: Supabase (PostgreSQL, Storage, Auth)
- **UI Components**: Radix UI, Lucide Icons, Shadcn/UI
- **State Management**: React Context API with custom hooks

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A [Supabase](https://supabase.com/) account
- A [Google AI Studio](https://aistudio.google.com/) API Key (for Gemini)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aura-studio.git
   cd aura-studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the `.env.example` file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

4. **Initialize Supabase:**
   Run the SQL provided in `supabase_setup.sql` in your Supabase SQL Editor to create the necessary tables, storage buckets, and security policies.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 📝 Environment Variables

The application requires the following environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anonymous Key |
| `GEMINI_API_KEY` | Your Google Gemini API Key |

---

## 🏗️ Structure

```text
├── src/
│   ├── components/     # UI Components (layout, auth, sidebar)
│   ├── contexts/       # React Contexts (auth, history, characters)
│   ├── hooks/          # Custom processing hooks
│   ├── lib/            # External service clients (Gemini, Supabase)
│   ├── types/          # TypeScript definitions
│   └── main.tsx        # Application entry point
├── public/             # Static assets and PWA manifest
└── index.html          # HTML entry point
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

Developed with ❤️ for the creative community.
