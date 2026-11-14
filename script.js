// =============================================
// LIFEPILOT - PERSONAL PRODUCTIVITY APPLICATION
// =============================================


// =============================================
// 1. WEBLLM BROWSER AI ENGINE
// =============================================

let lifePilotEnginePromise = null;

async function getLifePilotEngine(onProgress) {
    if (!navigator.gpu) {
        throw new Error(
            "WebGPU is not supported by this browser or device."
        );
    }

    if (!lifePilotEnginePromise) {
        lifePilotEnginePromise = (async () => {
            const webllm = await import(
                "https://esm.run/@mlc-ai/web-llm"
            );

            return await webllm.CreateMLCEngine(
                "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
                {
                    initProgressCallback: (progress) => {
                        if (onProgress) {
                            onProgress(
                                progress.text || "Loading AI model..."
                            );
                        }
                    }
                }
            );
        })().catch((error) => {
            lifePilotEnginePromise = null;
            throw error;
        });
    }

    return await lifePilotEnginePromise;
}


// =============================================
// 2. GET HTML ELEMENTS
// =============================================

const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priority");
const categoryInput = document.getElementById("category");
const dueDateInput = document.getElementById("dueDate");

const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const overdueTasks = document.getElementById("overdueTasks");

const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const progressMessage = document.getElementById("progressMessage");

const suggestionText = document.getElementById("suggestionText");
const todayPlanner = document.getElementById("todayPlanner");

const notes = document.getElementById("notesInput");
const notesStatus = document.getElementById("notesStatus");

const aiInput = document.getElementById("ai-chat-input");
const aiSendButton = document.getElementById("ai-chat-send");
const aiMessages = document.getElementById("ai-chat-messages");
const aiStatus = document.getElementById("ai-chat-status");


// =============================================
// 3. DATE FUNCTIONS
// =============================================

function getLocalDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const today = getLocalDate();

const todayElement = document.getElementById("today");
const greetingElement = document.getElementById("greeting");

if (todayElement) {
    todayElement.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

if (greetingElement) {
    const hour = new Date().getHours();

    greetingElement.textContent =
        hour < 12 ? "Good morning!" :
        hour < 17 ? "Good afternoon!" :
        "Good evening!";
}

if (dueDateInput) {
    dueDateInput.value = today;
}


// =============================================
// 4. LOAD TASKS FROM LOCAL STORAGE
// =============================================

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("lifePilotTasks")
    );

    tasks = Array.isArray(savedTasks) ? savedTasks : [];

} catch (error) {
    console.error("Unable to load tasks:", error);
    tasks = [];
}


// =============================================
// 5. SAVE TASKS
// =============================================

function saveTasks() {
    try {
        localStorage.setItem(
            "lifePilotTasks",
            JSON.stringify(tasks)
        );

        renderApp();

    } catch (error) {
        console.error("Unable to save tasks:", error);
        alert("Unable to save your tasks in this browser.");
    }
}


// =============================================
// 6. ADD TASK
// =============================================

function addTask() {
    if (!taskInput) return;

    const name = taskInput.value.trim();

    if (!name) {
        alert("Please enter a task name.");
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now().toString() +
            Math.random().toString(16).slice(2),

        name: name,
        priority: priorityInput ? priorityInput.value : "Medium",
        category: categoryInput ? categoryInput.value : "Personal",
        dueDate: dueDateInput ? dueDateInput.value : today,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    taskInput.value = "";

    if (priorityInput) priorityInput.value = "Medium";
    if (categoryInput) categoryInput.value = "Personal";
    if (dueDateInput) dueDateInput.value = today;

    saveTasks();
}

if (addTaskBtn) {
    addTaskBtn.addEventListener("click", addTask);
}

if (taskInput) {
    taskInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            addTask();
        }
    });
}


// =============================================
// 7. FORMAT DATE
// =============================================

function formatDate(dateString) {
    if (!dateString) return "No due date";

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// =============================================
// 8. DISPLAY TASKS
// =============================================

function displayTasks() {
    if (!taskList) return;

    taskList.innerHTML = "";

    const searchTerm = searchInput
        ? searchInput.value.toLowerCase()
        : "";

    const selectedFilter = filterStatus
        ? filterStatus.value
        : "All";

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.name
            .toLowerCase()
            .includes(searchTerm);

        const matchesStatus =
            selectedFilter === "All" ||
            (selectedFilter === "Pending" && !task.completed) ||
            (selectedFilter === "Completed" && task.completed);

        return matchesSearch && matchesStatus;
    });

    filteredTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const left = document.createElement("div");
        left.className = "task-left";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            updateTask(task.id, {
                completed: checkbox.checked
            });
        });

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("h3");
        title.textContent = task.name;

        const priority = document.createElement("span");
        priority.className =
            "priority-badge priority-" +
            (task.priority || "Medium").toLowerCase();

        priority.textContent = task.priority || "Medium";

        const category = document.createElement("span");
        category.className = "category-badge";
        category.textContent = task.category || "Personal";

        title.appendChild(priority);
        title.appendChild(category);

        const info = document.createElement("p");
        info.textContent = "Due: " + formatDate(task.dueDate);

        if (!task.completed && task.dueDate && task.dueDate < today) {
            info.textContent += " • OVERDUE";
            info.classList.add("overdue-label");
        }

        details.appendChild(title);
        details.appendChild(info);

        left.appendChild(checkbox);
        left.appendChild(details);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        item.appendChild(left);
        item.appendChild(actions);

        taskList.appendChild(item);
    });

    const emptyMessage = document.getElementById("emptyMessage");

    if (emptyMessage) {
        emptyMessage.style.display =
            filteredTasks.length === 0 ? "block" : "none";
    }
}


// =============================================
// 9. EDIT TASK
// =============================================

function editTask(id) {
    const task = tasks.find(item => item.id === id);

    if (!task) return;

    const newName = prompt("Edit your task:", task.name);

    if (newName === null) return;

    if (!newName.trim()) {
        alert("Task name cannot be empty.");
        return;
    }

    const newPriority = prompt(
        "Enter priority: High, Medium or Low",
        task.priority
    );

    if (newPriority === null) return;

    const validPriority = ["High", "Medium", "Low"];

    const normalizedPriority = validPriority.find(
        item => item.toLowerCase() === newPriority.trim().toLowerCase()
    );

    if (!normalizedPriority) {
        alert("Please enter High, Medium or Low.");
        return;
    }

    task.name = newName.trim();
    task.priority = normalizedPriority;

    saveTasks();
}


// =============================================
// 10. DELETE TASK
// =============================================

function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
}


// =============================================
// 11. UPDATE TASK
// =============================================

function updateTask(id, updates) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, ...updates }
            : task
    );

    saveTasks();
}


// =============================================
// 12. UPDATE DASHBOARD STATISTICS
// =============================================

function updateStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const overdue = tasks.filter(task =>
        !task.completed &&
        task.dueDate &&
        task.dueDate < today
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    if (totalTasks) totalTasks.textContent = total;
    if (completedTasks) completedTasks.textContent = completed;
    if (pendingTasks) pendingTasks.textContent = pending;
    if (overdueTasks) overdueTasks.textContent = overdue;

    if (progressPercent) {
        progressPercent.textContent = percentage + "%";
    }

    if (progressBar) {
        progressBar.style.width = percentage + "%";
    }

    if (progressMessage) {
        if (total === 0) {
            progressMessage.textContent =
                "Start adding tasks to track your progress.";

        } else if (percentage === 100) {
            progressMessage.textContent =
                "Excellent! You completed all your tasks.";

        } else {
            progressMessage.textContent =
                `${completed} out of ${total} tasks completed. Keep going!`;
        }
    }
}


// =============================================
// 13. SMART PRODUCTIVITY SUGGESTION
// =============================================

function updateSuggestion() {
    if (!suggestionText) return;

    const pending = tasks.filter(task => !task.completed);

    if (pending.length === 0) {
        suggestionText.textContent = tasks.length === 0
            ? "Add your first task. I'll suggest what to focus on."
            : "Amazing! You have completed all your tasks.";

        return;
    }

    const priorityRank = {
        High: 1,
        Medium: 2,
        Low: 3
    };

    pending.sort((a, b) => {
        const aOverdue = a.dueDate && a.dueDate < today;
        const bOverdue = b.dueDate && b.dueDate < today;

        if (aOverdue !== bOverdue) {
            return aOverdue ? -1 : 1;
        }

        const priorityDifference =
            (priorityRank[a.priority] || 2) -
            (priorityRank[b.priority] || 2);

        if (priorityDifference !== 0) {
            return priorityDifference;
        }

        return (a.dueDate || "9999-12-31")
            .localeCompare(b.dueDate || "9999-12-31");
    });

    const nextTask = pending[0];

    const reason = nextTask.dueDate && nextTask.dueDate < today
        ? "This task is overdue."
        : nextTask.priority === "High"
            ? "This task has high priority."
            : "This is your next task based on priority and deadline.";

    suggestionText.textContent =
        `Focus on "${nextTask.name}". ${reason}`;
}


// =============================================
// 14. DAILY PLANNER
// =============================================

function updatePlanner() {
    if (!todayPlanner) return;

    todayPlanner.innerHTML = "";

    const todaysTasks = tasks.filter(
        task => task.dueDate === today
    );

    if (todaysTasks.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No activities scheduled for today.";

        todayPlanner.appendChild(message);
        return;
    }

    todaysTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "planner-item";

        const title = document.createElement("strong");
        title.textContent = task.name;

        const details = document.createElement("small");
        details.textContent =
            `${task.category} • ${task.priority} Priority • ` +
            (task.completed ? "Completed" : "Pending");

        item.appendChild(title);
        item.appendChild(details);

        todayPlanner.appendChild(item);
    });
}


// =============================================
// 15. SEARCH AND FILTER
// =============================================

if (searchInput) {
    searchInput.addEventListener("input", displayTasks);
}

if (filterStatus) {
    filterStatus.addEventListener("change", displayTasks);
}


// =============================================
// 16. PERSONAL NOTES - AUTO SAVE
// =============================================

if (notes && notesStatus) {
    try {
        notes.value = localStorage.getItem("lifePilotNotes") || "";
    } catch (error) {
        console.error("Unable to load notes:", error);
        notesStatus.textContent = "Unable to load notes";
    }

    notes.addEventListener("input", function() {
        try {
            localStorage.setItem("lifePilotNotes", notes.value);
            notesStatus.textContent = "Saved locally";
        } catch (error) {
            notesStatus.textContent = "Unable to save";
            console.error("Unable to save notes:", error);
        }
    });
}


// =============================================
// 17. RENDER COMPLETE APPLICATION
// =============================================

function renderApp() {
    displayTasks();
    updateStatistics();
    updateSuggestion();
    updatePlanner();
}


// =============================================
// 18. INITIALIZE APPLICATION
// =============================================

renderApp();


// =============================================
// LIFEPILOT VOICE AGENT
// =============================================

const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");
const voiceMessage = document.getElementById("voiceMessage");
const voiceTranscript = document.getElementById("voiceTranscript");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;


// =============================================
// 19. SPEAK RESPONSE
// =============================================

function speakResponse(message) {
    if (voiceMessage) {
        voiceMessage.textContent = message;
    }

    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);

    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}


// =============================================
// 20. INITIALIZE VOICE RECOGNITION
// =============================================

if (SpeechRecognition) {
    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
        isListening = true;

        if (voiceBtn) voiceBtn.classList.add("listening");
        if (voiceStatus) voiceStatus.textContent = "Listening...";
        if (voiceMessage) voiceMessage.textContent = "Speak your command now.";
    };

    recognition.onresult = function(event) {
        const command =
            event.results[0][0].transcript.toLowerCase().trim();

        if (voiceTranscript) {
            voiceTranscript.textContent = command;
        }

        processVoiceCommand(command);
    };

    recognition.onerror = function(event) {
        if (voiceStatus) {
            voiceStatus.textContent = "Voice recognition issue";
        }

        const messages = {
            "not-allowed": "Please allow microphone access in your browser.",
            "no-speech": "No speech detected. Please try again.",
            "network": "Voice recognition network error. Try again.",
            "audio-capture": "No working microphone was detected."
        };

        if (voiceMessage) {
            voiceMessage.textContent =
                messages[event.error] || "Please try speaking again.";
        }
    };

    recognition.onend = function() {
        isListening = false;

        if (voiceBtn) {
            voiceBtn.classList.remove("listening");
        }

        if (voiceStatus && voiceStatus.textContent === "Listening...") {
            voiceStatus.textContent = "Ready to listen";
        }
    };
}


// =============================================
// 21. ADD TASK USING VOICE
// =============================================

function addTaskByVoice(command) {
    const taskName = command
        .replace(
            /^(please\s+)?(add|create)\s+(a\s+)?(new\s+)?task\s*/i,
            ""
        )
        .replace(/^to\s+/i, "")
        .trim();

    if (!taskName || taskName === "task") {
        speakResponse("Please say the name of the task.");
        return;
    }

    const newTask = {
        id: Date.now().toString() +
            Math.random().toString(16).slice(2),

        name: taskName,
        priority: "Medium",
        category: "Personal",
        dueDate: getLocalDate(),
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    saveTasks();

    speakResponse(
        "Your task " + taskName + " has been added successfully."
    );
}


// =============================================
// 22. PROCESS VOICE COMMANDS
// =============================================

function processVoiceCommand(command) {
    if (voiceStatus) {
        voiceStatus.textContent = "Processing command...";
    }

    // Add task
    if (
        command.startsWith("add task") ||
        command.startsWith("add a task") ||
        command.startsWith("create task") ||
        command.startsWith("create a task")
    ) {
        addTaskByVoice(command);
    }

    // Show pending tasks
    else if (
        command.includes("pending task") ||
        command.includes("show my pending")
    ) {
        if (filterStatus) filterStatus.value = "Pending";
        if (searchInput) searchInput.value = "";

        displayTasks();

        document.getElementById("tasks")?.scrollIntoView({
            behavior: "smooth"
        });

        const count = tasks.filter(task => !task.completed).length;

        speakResponse("You have " + count + " pending tasks.");
    }

    // Show completed tasks
    else if (
        command.includes("completed task") ||
        command.includes("finished task")
    ) {
        if (filterStatus) filterStatus.value = "Completed";
        if (searchInput) searchInput.value = "";

        displayTasks();

        document.getElementById("tasks")?.scrollIntoView({
            behavior: "smooth"
        });

        const count = tasks.filter(task => task.completed).length;

        speakResponse("You have completed " + count + " tasks.");
    }

    // Productivity summary
    else if (
        command.includes("productivity summary") ||
        command.includes("read my summary")
    ) {
        const completed = tasks.filter(task => task.completed).length;
        const pending = tasks.filter(task => !task.completed).length;

        speakResponse(
            "Your productivity summary. " +
            "You have " + tasks.length + " total tasks. " +
            completed + " completed tasks and " +
            pending + " pending tasks."
        );
    }

    // Count completed tasks
    else if (
        command.includes("how many") &&
        (command.includes("completed") || command.includes("finished"))
    ) {
        const count = tasks.filter(task => task.completed).length;

        speakResponse("You have completed " + count + " tasks.");
    }

    // Suggest next task
    else if (
        command.includes("what should i do next") ||
        command.includes("next task") ||
        command.includes("suggest a task")
    ) {
        updateSuggestion();

        speakResponse(
            suggestionText
                ? suggestionText.textContent
                : "Please add a task first."
        );
    }

    // Open notes
    else if (
        command.includes("open notes") ||
        command.includes("my notes")
    ) {
        document.getElementById("notes")?.scrollIntoView({
            behavior: "smooth"
        });

        speakResponse("Your personal notes are now open.");
    }

    // Open dashboard
    else if (
        command.includes("open dashboard") ||
        command.includes("show dashboard")
    ) {
        document.getElementById("dashboard")?.scrollIntoView({
            behavior: "smooth"
        });

        speakResponse("Your dashboard is now open.");
    }

    // Show all tasks
    else if (
        command.includes("show all tasks") ||
        command.includes("all tasks")
    ) {
        if (filterStatus) filterStatus.value = "All";
        if (searchInput) searchInput.value = "";

        displayTasks();

        document.getElementById("tasks")?.scrollIntoView({
            behavior: "smooth"
        });

        speakResponse("Here are all your tasks.");
    }

    // Help
    else if (
        command.includes("help") ||
        command.includes("commands")
    ) {
        speakResponse(
            "You can ask me to add a task, show pending tasks, " +
            "read your productivity summary, suggest your next task, " +
            "or open your notes."
        );
    }

    // Unknown command
    else {
        speakResponse(
            "Sorry, I did not understand that command. " +
            "Please try saying add a task or show pending tasks."
        );
    }

    if (voiceStatus) {
        voiceStatus.textContent = "Command processed";
    }
}


// =============================================
// 23. MICROPHONE BUTTON
// =============================================

if (voiceBtn) {
    voiceBtn.addEventListener("click", function() {
        if (!recognition) {
            if (voiceStatus) {
                voiceStatus.textContent = "Not supported";
            }

            if (voiceMessage) {
                voiceMessage.textContent =
                    "Please use Google Chrome or Microsoft Edge for voice recognition.";
            }

            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            window.speechSynthesis?.cancel();

            if (voiceStatus) {
                voiceStatus.textContent = "Starting microphone...";
            }

            try {
                recognition.start();
            } catch (error) {
                console.error("Microphone error:", error);

                if (voiceStatus) {
                    voiceStatus.textContent = "Unable to start microphone";
                }
            }
        }
    });
}


// =============================================
// LIFEPILOT - WEBLLM AI CHAT
// =============================================

let chatHistory = [
    {
        role: "system",
        content:
            "You are LifePilot, a friendly personal productivity assistant. " +
            "Help users manage tasks, plan their day, organize notes, " +
            "improve productivity, and stay focused. " +
            "Give clear, practical, concise and encouraging answers."
    }
];


// =============================================
// 24. DISPLAY CHAT MESSAGE
// =============================================

function addChatMessage(message, className) {
    if (!aiMessages) return;

    const messageElement = document.createElement("div");

    messageElement.className = className;
    messageElement.textContent = message;

    aiMessages.appendChild(messageElement);

    aiMessages.scrollTop = aiMessages.scrollHeight;
}


// =============================================
// 25. SEND MESSAGE TO WEBLLM
// =============================================

async function sendMessageToLifePilot() {
    if (!aiInput || !aiSendButton || !aiMessages || !aiStatus) {
        console.error("AI chat HTML elements are missing.");
        return;
    }

    const message = aiInput.value.trim();

    if (!message) {
        aiStatus.textContent = "Please enter a message.";
        return;
    }

    addChatMessage(message, "user-message");

    aiInput.value = "";
    aiSendButton.disabled = true;

    aiStatus.textContent = "Preparing LifePilot AI...";

    try {
        // Load the AI model in the visitor's browser
        const engine = await getLifePilotEngine((progressText) => {
            aiStatus.textContent =
                progressText || "Loading AI model...";
        });

        aiStatus.textContent = "LifePilot is generating a response...";

        chatHistory.push({
            role: "user",
            content: message
        });

        const response = await engine.chat.completions.create({
            messages: chatHistory,
            temperature: 0.7,
            max_tokens: 300
        });

        const aiReply =
            response.choices?.[0]?.message?.content ||
            "Sorry, I couldn't generate a response.";

        chatHistory.push({
            role: "assistant",
            content: aiReply
        });

        addChatMessage(aiReply, "ai-message");

        aiStatus.textContent = "LifePilot AI is ready";

    } catch (error) {
        console.error("LifePilot AI Error:", error);

        // Remove the failed user message from chat history
        if (
            chatHistory.length > 1 &&
            chatHistory[chatHistory.length - 1].role === "user"
        ) {
            chatHistory.pop();
        }

        let errorMessage =
            "Unable to start LifePilot AI. Please try again.";

        if (!navigator.gpu) {
            errorMessage =
                "Your browser or device does not support WebGPU. " +
                "Try a compatible version of Chrome or Edge on a supported device.";
        } else if (
            error.message &&
            error.message.toLowerCase().includes("memory")
        ) {
            errorMessage =
                "Your device may not have enough available memory to load this AI model.";
        } else {
            errorMessage +=
                " Check your internet connection and try again.";
        }

        addChatMessage(errorMessage, "ai-message");

        aiStatus.textContent = "AI connection needs attention.";

    } finally {
        aiSendButton.disabled = false;
        aiMessages.scrollTop = aiMessages.scrollHeight;
        aiInput.focus();
    }
}


// =============================================
// 26. AI CHAT BUTTON AND ENTER KEY
// =============================================

if (aiInput && aiSendButton && aiMessages && aiStatus) {
    aiSendButton.addEventListener(
        "click",
        sendMessageToLifePilot
    );

    aiInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessageToLifePilot();
        }
    });

    aiStatus.textContent =
        "AI will load on your device when you send your first message.";
}
