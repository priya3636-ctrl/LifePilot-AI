
// =====================================
// LIFEPILOT - PERSONAL PRODUCTIVITY APP
// =====================================


// 1. GET HTML ELEMENTS

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

const notes = document.getElementById("notes");
const notesStatus = document.getElementById("notesStatus");


// 2. DATE FUNCTIONS

function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const today = getLocalDate();

document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

const hour = new Date().getHours();

document.getElementById("greeting").textContent =
    hour < 12 ? "Good morning!" :
    hour < 17 ? "Good afternoon!" : "Good evening!";

dueDateInput.value = today;


// 3. LOAD DATA FROM LOCALSTORAGE

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("lifePilotTasks")
    );

    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    tasks = [];
}

notes.value = localStorage.getItem("lifePilotNotes") || "";


// 4. SAVE TASKS

function saveTasks() {
    localStorage.setItem(
        "lifePilotTasks",
        JSON.stringify(tasks)
    );

    renderApp();
}


// 5. ADD NEW TASK

function addTask() {

    const name = taskInput.value.trim();

    if (!name) {
        alert("Please enter a task name.");
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        name: name,
        priority: priorityInput.value,
        category: categoryInput.value,
        dueDate: dueDateInput.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    taskInput.value = "";
    priorityInput.value = "Medium";
    categoryInput.value = "Personal";
    dueDateInput.value = today;

    saveTasks();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});


// 6. FORMAT DATE

function formatDate(dateString) {

    if (!dateString) return "No due date";

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// 7. DISPLAY TASKS

function displayTasks() {

    taskList.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase();
    const selectedFilter = filterStatus.value;

    const filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.name.toLowerCase().includes(searchTerm);

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

        // Left side
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
            "priority-badge priority-" + task.priority.toLowerCase();
        priority.textContent = task.priority;

        const category = document.createElement("span");
        category.className = "category-badge";
        category.textContent = task.category;

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

        // Right side
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

    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";
}


// 8. EDIT TASK

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

    const normalizedPriority =
        validPriority.find(
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


// 9. DELETE TASK

function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
}


// 10. UPDATE TASK

function updateTask(id, updates) {

    tasks = tasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
    );

    saveTasks();
}


// 11. UPDATE STATISTICS

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const overdue = tasks.filter(
        task =>
            !task.completed &&
            task.dueDate &&
            task.dueDate < today
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    overdueTasks.textContent = overdue;

    progressPercent.textContent = percentage + "%";
    progressBar.style.width = percentage + "%";

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


// 12. SMART PRODUCTIVITY ASSISTANT

function updateSuggestion() {

    const pending = tasks.filter(
        task => !task.completed
    );

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
            priorityRank[a.priority] - priorityRank[b.priority];

        if (priorityDifference !== 0) {
            return priorityDifference;
        }

        return (a.dueDate || "9999-12-31")
            .localeCompare(b.dueDate || "9999-12-31");
    });

    const nextTask = pending[0];

    const reason = nextTask.dueDate < today
        ? "This task is overdue."
        : nextTask.priority === "High"
            ? "This task has high priority."
            : "This is your next task based on priority and deadline.";

    suggestionText.textContent =
        `Focus on "${nextTask.name}". ${reason}`;
}


// 13. DAILY PLANNER

function updatePlanner() {

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


// 14. SEARCH AND FILTER

searchInput.addEventListener("input", displayTasks);
filterStatus.addEventListener("change", displayTasks);


// 15. AUTOMATIC NOTES SAVING

notes.addEventListener("input", function() {

    localStorage.setItem("lifePilotNotes", notes.value);

    notesStatus.textContent = "Saved successfully";
});


// 16. RENDER COMPLETE APPLICATION

function renderApp() {

    displayTasks();
    updateStatistics();
    updateSuggestion();
    updatePlanner();
}


// 17. INITIALIZE APPLICATION

renderApp();

// =====================================
// LIFEPILOT VOICE AGENT
// =====================================

const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");
const voiceMessage = document.getElementById("voiceMessage");
const voiceTranscript = document.getElementById("voiceTranscript");


// Check browser support

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;


// Voice response

function speakResponse(message) {

    if (!("speechSynthesis" in window)) {
        voiceMessage.textContent = message;
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);

    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 1;

    speechSynthesis.speak(speech);

    voiceMessage.textContent = message;
}


// Initialize voice recognition

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {

        isListening = true;

        voiceBtn.classList.add("listening");
        voiceStatus.textContent = "Listening...";
        voiceMessage.textContent = "Speak your command now.";
    };


    recognition.onresult = function (event) {

        const command =
            event.results[0][0].transcript.toLowerCase().trim();

        voiceTranscript.textContent = command;

        processVoiceCommand(command);
    };


    recognition.onerror = function (event) {

        voiceStatus.textContent = "Voice recognition issue";

        const messages = {
            "not-allowed": "Please allow microphone access in your browser.",
            "no-speech": "No speech detected. Please try again.",
            "network": "Voice recognition network error. Try again.",
            "audio-capture": "No working microphone was detected."
        };

        voiceMessage.textContent =
            messages[event.error] || "Please try speaking again.";
    };


    recognition.onend = function () {

        isListening = false;

        voiceBtn.classList.remove("listening");

        if (voiceStatus.textContent === "Listening...") {
            voiceStatus.textContent = "Ready to listen";
        }
    };

}


// 1. Add task through voice

function addTaskByVoice(command) {

    let taskName = command
        .replace(/^(please\s+)?(add|create)\s+(a\s+)?(new\s+)?task\s*/i, "")
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


// 2. Process voice commands

function processVoiceCommand(command) {

    voiceStatus.textContent = "Processing command...";

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

        filterStatus.value = "Pending";

        searchInput.value = "";

        displayTasks();

        document.getElementById("tasks").scrollIntoView({
            behavior: "smooth"
        });

        const count = tasks.filter(
            task => !task.completed
        ).length;

        speakResponse(
            "You have " + count + " pending tasks."
        );
    }

    // Show completed tasks
    else if (
        command.includes("completed task") ||
        command.includes("finished task")
    ) {

        filterStatus.value = "Completed";

        searchInput.value = "";

        displayTasks();

        document.getElementById("tasks").scrollIntoView({
            behavior: "smooth"
        });

        const count = tasks.filter(
            task => task.completed
        ).length;

        speakResponse(
            "You have completed " + count + " tasks."
        );
    }

    // Read productivity summary
    else if (
        command.includes("productivity summary") ||
        command.includes("read my summary")
    ) {

        const completed = tasks.filter(
            task => task.completed
        ).length;

        const pending = tasks.filter(
            task => !task.completed
        ).length;

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

        const count = tasks.filter(
            task => task.completed
        ).length;

        speakResponse(
            "You have completed " + count + " tasks."
        );
    }

    // Suggest next task
    else if (
        command.includes("what should i do next") ||
        command.includes("next task") ||
        command.includes("suggest a task")
    ) {

        updateSuggestion();

        speakResponse(
            suggestionText.textContent
        );
    }

    // Open notes
    else if (
        command.includes("open notes") ||
        command.includes("my notes")
    ) {

        document.getElementById("notes").scrollIntoView({
            behavior: "smooth"
        });

        speakResponse("Your personal notes are now open.");
    }

    // Open dashboard
    else if (
        command.includes("open dashboard") ||
        command.includes("show dashboard")
    ) {

        document.getElementById("dashboard").scrollIntoView({
            behavior: "smooth"
        });

        speakResponse("Your dashboard is now open.");
    }

    // Show all tasks
    else if (
        command.includes("show all tasks") ||
        command.includes("all tasks")
    ) {

        filterStatus.value = "All";

        searchInput.value = "";

        displayTasks();

        document.getElementById("tasks").scrollIntoView({
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

    voiceStatus.textContent = "Command processed";
}


// 3. Microphone button

voiceBtn.addEventListener("click", function () {

    if (!recognition) {

        voiceStatus.textContent = "Not supported";

        voiceMessage.textContent =
            "Please use Google Chrome or Microsoft Edge for voice recognition.";

        return;
    }

    if (isListening) {

        recognition.stop();

    } else {

        window.speechSynthesis.cancel();

        voiceStatus.textContent = "Starting microphone...";

        recognition.start();
    }

});

// ======================================
// LIFEPILOT - LOCAL AI CHAT CONNECTION
// ======================================

const aiInput = document.getElementById("ai-chat-input");
const aiSendButton = document.getElementById("ai-chat-send");
const aiMessages = document.getElementById("ai-chat-messages");
const aiStatus = document.getElementById("ai-chat-status");

async function sendMessageToLifePilot() {
    const message = aiInput.value.trim();

    if (!message) {
        aiStatus.textContent = "Please enter a message.";
        return;
    }

    // Display user's message
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = message;
    aiMessages.appendChild(userMessage);

    aiInput.value = "";
    aiSendButton.disabled = true;
    aiStatus.textContent = "LifePilot is thinking...";

    try {
        const response = await fetch("http://127.0.0.1:8001/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error("Backend request failed");
        }

        const data = await response.json();
        if (data.status !== "success") throw new Error(data.reply || "AI service returned an error");

        const aiReply = document.createElement("div");
        aiReply.className = "ai-message";
        aiReply.textContent = data.reply || "No reply received.";

        aiMessages.appendChild(aiReply);
        aiStatus.textContent =
            data.status === "success"
                ? "LifePilot AI is ready"
                : "AI connection needs attention.";

    } catch (error) {
        const errorMessage = document.createElement("div");
        errorMessage.className = "ai-message";
        errorMessage.textContent =
            "Unable to connect to LifePilot AI. Please check that the backend and Ollama are running.";

        aiMessages.appendChild(errorMessage);
        aiStatus.textContent = "Connection failed.";
        console.error("LifePilot AI Error:", error);

    } finally {
        aiSendButton.disabled = false;
        aiMessages.scrollTop = aiMessages.scrollHeight;
        aiInput.focus();
    }
}

// Send button click
if (aiInput && aiSendButton && aiMessages && aiStatus) {
    aiSendButton.addEventListener("click", sendMessageToLifePilot);
    aiInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") sendMessageToLifePilot();
    });
}

