const dashboard = document.getElementById("dashboard");
const missions = document.getElementById("missions");
const missionCreator = document.getElementById("missionCreator");
const missionList = document.getElementById("missionList");

function openMissions() {
    dashboard.classList.add("hidden");
    missions.classList.remove("hidden");
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

function saveMission() {
    const name = document.getElementById("missionName").value;

    if (name === "") {
        alert("Enter a mission name.");
        return;
    }

    missionList.innerHTML = `<p>🎯 ${name}</p>`;

    missionCreator.classList.add("hidden");
    missions.classList.remove("hidden");
}