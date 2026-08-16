const dashboard = document.getElementById("dashboard");
const missions = document.getElementById("missions");
const missionCreator = document.getElementById("missionCreator");
const missionList = document.getElementById("missionList");


// ================================
// NAVIGATION
// ================================

function openMissions() {
    dashboard.classList.add("hidden");
    missions.classList.remove("hidden");

    loadMissions();
}

function goHome() {
    missions.classList.add("hidden");
    dashboard.classList.remove("hidden");
}

function createMission() {
    missions.classList.add("hidden");
    missionCreator.classList.remove("hidden");
}

function closeMissionCreator() {
    missionCreator.classList.add("hidden");
    missions.classList.remove("hidden");
}


// ================================
// CREATE MISSION
// ================================

function saveMission() {
    const name = document.getElementById("missionName").value.trim();
    const priority = document.getElementById("missionPriority").value;
    const deadline = document.getElementById("missionDeadline").value;

    if (name === "") {
        alert("Enter a mission name.");
        return;
    }

    let missionsData = JSON.parse(localStorage.getItem("nexusMissions")) || [];

    const newMission = {
        id: Date.now(),
        name: name,
        priority: priority,
        deadline: deadline,
        completed: false
    };

    missionsData.push(newMission);

    localStorage.setItem("nexusMissions", JSON.stringify(missionsData));

    document.getElementById("missionName").value = "";
    document.getElementById("missionPriority").value = "normal";
    document.getElementById("missionDeadline").value = "";

    missionCreator.classList.add("hidden");
    missions.classList.remove("hidden");

    loadMissions();
}


// ================================
// LOAD MISSIONS
// ================================

function loadMissions() {
    let missionsData = JSON.parse(localStorage.getItem("nexusMissions")) || [];

    if (missionsData.length === 0) {
        missionList.innerHTML = `<p>No active missions.</p>`;
        return;
    }

    missionList.innerHTML = "";

    missionsData.forEach(mission => {

        const missionElement = document.createElement("div");

        missionElement.classList.add("mission-card");

        const deadlineText = mission.deadline
            ? new Date(mission.deadline + "T00:00:00").toLocaleDateString()
            : "NO DEADLINE";

        const priorityText = mission.priority
            ? mission.priority.toUpperCase()
            : "NORMAL";

        missionElement.innerHTML = `
            <div class="mission-title">
                🎯 ${mission.name}
            </div>

            <div class="mission-info">
                <span>PRIORITY: ${priorityText}</span>
                <span>DEADLINE: ${deadlineText}</span>
            </div>

            <div class="mission-actions">
                <button onclick="completeMission(${mission.id})">
                    COMPLETE
                </button>
            </div>
        `;

        missionList.appendChild(missionElement);
    });
}


// ================================
// COMPLETE MISSION
// ================================

function completeMission(id) {
    let missionsData = JSON.parse(localStorage.getItem("nexusMissions")) || [];

    missionsData = missionsData.filter(mission => mission.id !== id);

    localStorage.setItem("nexusMissions", JSON.stringify(missionsData));

    loadMissions();
}


// ================================
// SERVICE WORKER
// ================================

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
}