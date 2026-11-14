
# LifePilot AI – Personal Productivity Assistant

LifePilot AI is a web-based personal productivity assistant designed to help users organize their daily activities, manage tasks, maintain personal notes, and improve productivity with AI-powered assistance.

It combines a clean dashboard with browser-based AI to provide a simple and interactive productivity experience.

## 🌐 Live Demo

**Try LifePilot AI:** https://lifepilot-ai-lyart.vercel.app/

## ✨ Features

- **Personal Dashboard:** View your productivity overview in one place.
- **Task Management:** Add, edit, delete, search, and manage daily tasks.
- **Daily Planner:** Organize your daily activities and plan your schedule.
- **Personal Notes:** Write and save important thoughts, goals, and reminders.
- **AI Assistant:** Chat with an AI assistant for productivity suggestions and daily planning.
- **Voice Interaction:** Use supported voice features to interact with the application.
- **Productivity Overview:** Track task progress and completed activities.
- **Local Data Storage:** Save personal tasks and notes in the browser.

## 🤖 AI Integration

LifePilot uses **WebLLM** to run an AI language model directly in the user's browser.

### How it works
- Uses WebLLM for browser-based AI inference.
- Uses the Qwen2.5-0.5B-Instruct model.
- Uses WebGPU for supported devices and browsers.
- Does not require a separate paid AI API key or centralized AI inference server.

**Note:** The AI model is downloaded when it is first initialized. Initial loading may take time depending on the internet connection and device. AI functionality requires compatible browser and WebGPU support.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Website structure |
| CSS3 | Styling and responsive design |
| JavaScript | Application functionality |
| WebLLM | Browser-based AI integration |
| Qwen2.5 | AI language model |
| WebGPU | Local AI model execution |
| LocalStorage | Local data persistence |
| Vercel | Website deployment |
| GitHub | Source code management |

## 🚀 Getting Started

### Run the project locally

1. Clone this repository:

   ```bash
   git clone https://github.com/priya3636-ctrl/LifePilot-AI.git
   ```

2. Open the project folder:

   ```bash
   cd LifePilot-AI
   ```

3. Open the folder in Visual Studio Code.

4. Run the project using the VS Code Live Server extension.

5. Open the website in a compatible browser.

6. Navigate to the AI Assistant and allow time for the AI model to initialize.

## 📂 Project Structure

```text
LifePilot-AI/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## 💾 Data Storage

LifePilot uses browser LocalStorage to store personal information such as tasks and notes.

- Data remains available in the same browser and origin.
- Data is not automatically synchronized across different devices or users.
- Clearing browser storage may remove locally saved information.

## 🌍 Deployment

LifePilot AI is deployed using **Vercel** and connected to GitHub for source code management.

Every committed update to the connected GitHub branch can trigger a new deployment.

**Live Website:** https://lifepilot-ai-lyart.vercel.app/

## 🔮 Future Improvements

- Cloud-based synchronization across devices.
- Personalized productivity recommendations.
- Improved AI conversation capabilities.
- More productivity analytics and insights.
- Additional customization options.

## 👩‍💻 Developer

**Priyanka Nerusu**

Computer Science and Engineering – Data Science

Interested in Artificial Intelligence, Data Science, and Web Development.

## ⭐ Support

If you find this project interesting, consider giving the repository a star!

---

*Built with curiosity, creativity, and a passion for making everyday productivity smarter.*
