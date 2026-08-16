const dashboard = document.getElementById("dashboard");

const missions = document.getElementById("missions");

const missionCreator =
    document.getElementById("missionCreator");

const missionDetail =
    document.getElementById("missionDetail");

const missionDetailContent =
    document.getElementById("missionDetailContent");

const missionList =
    document.getElementById("missionList");

const missionCount =
    document.getElementById("missionCount");

const archive =
    document.getElementById("archive");

const archiveList =
    document.getElementById("archiveList");

const archiveCount =
    document.getElementById("archiveCount");

const activeMissionStat =
    document.getElementById("activeMissionStat");

const completionRateStat =
    document.getElementById("completionRateStat");

const nextDeadlineStat =
    document.getElementById("nextDeadlineStat");

const currentPriority =
    document.getElementById("currentPriority");

const priorityIndicator =
    document.getElementById("priorityIndicator");


let selectedMissionId = null;


// ========================================
// NAVIGATION
// ========================================

function openMissions() {

    dashboard.classList.add("hidden");

    archive.classList.add("hidden");

    missionCreator.classList.add("hidden");

    missionDetail.classList.add("hidden");

    missions.classList.remove("hidden");

    loadMissions();
}


function goHome() {

    missions.classList.add("hidden");

    missionCreator.classList.add("hidden");

    missionDetail.classList.add("hidden");

    archive.classList.add("hidden");

    dashboard.classList.remove("hidden");

    updateDashboard();
}


function createMission() {

    missions.classList.add("hidden");

    missionCreator.classList.remove("hidden");
}


function closeMissionCreator() {

    missionCreator.classList.add("hidden");

    missions.classList.remove("hidden");

    loadMissions();
}


// ========================================
// ARCHIVE
// ========================================

function openArchive() {

    dashboard.classList.add("hidden");

    missions.classList.add("hidden");

    missionCreator.classList.add("hidden");

    missionDetail.classList.add("hidden");

    archive.classList.remove("hidden");

    loadArchive();
}


function goHomeFromArchive() {

    archive.classList.add("hidden");

    dashboard.classList.remove("hidden");

    updateDashboard();
}


// ========================================
// DASHBOARD INTELLIGENCE
// ========================================

function updateDashboard() {

    const missionsData =
        JSON.parse(
            localStorage.getItem("nexusMissions")
        ) || [];


    const activeMissions =
        missionsData.filter(
            mission => !mission.completed
        );


    const completedMissions =
        missionsData.filter(
            mission => mission.completed
        );


    // ACTIVE MISSIONS

    activeMissionStat.textContent =
        String(activeMissions.length)
            .padStart(2, "0");


    // COMPLETION RATE

    let completionRate = 0;


    if (missionsData.length > 0) {

        completionRate =
            Math.round(
                (completedMissions.length /
                missionsData.length) * 100
            );

    }


    completionRateStat.textContent =
        `${completionRate}%`;


    // NEXT DEADLINE

    const missionsWithDeadlines =
        activeMissions
            .filter(
                mission => mission.deadline
            )
            .sort(
                (a, b) =>
                    new Date(a.deadline) -
                    new Date(b.deadline)
            );


    if (missionsWithDeadlines.length > 0) {

        const nextMission =
            missionsWithDeadlines[0];


        nextDeadlineStat.textContent =
            formatShortDate(
                nextMission.deadline
            );

    } else {

        nextDeadlineStat.textContent =
            "NONE";

    }


    // CURRENT PRIORITY

    updateCurrentPriority(activeMissions);
}


// ========================================
// CURRENT PRIORITY
// ========================================

function updateCurrentPriority(activeMissions) {

    if (activeMissions.length === 0) {

        currentPriority.innerHTML = `

            <strong>
                NO ACTIVE PRIORITY
            </strong>

            <p>
                Nexus is awaiting an objective.
            </p>

        `;

        priorityIndicator.textContent =
            "● STANDBY";

        priorityIndicator.dataset.priority =
            "none";

        return;
    }


    const priorityOrder = {

        critical: 4,

        high: 3,

        normal: 2,

        low: 1

    };


    const highestPriority =
        activeMissions
            .slice()
            .sort(
                (a, b) =>
                    (priorityOrder[b.priority] || 2) -
                    (priorityOrder[a.priority] || 2)
            )[0];


    const priority =
        highestPriority.priority || "normal";


    const priorityText =
        priority.toUpperCase();


    currentPriority.dataset.priority =
        priority;


    priorityIndicator.dataset.priority =
        priority;


    priorityIndicator.textContent =
        `● ${priorityText}`;


    currentPriority.innerHTML = `

        <strong>
            ${escapeHTML(highestPriority.name)}
        </strong>

        <p>
            ${priorityText} PRIORITY
            •
            ${highestPriority.progress || 0}% COMPLETE
        </p>

    `;
}


// ========================================
// CREATE MISSION
// ========================================

function saveMission() {

    const name =
        document
            .getElementById("missionName")
            .value
            .trim();


    const priority =
        document
            .getElementById("missionPriority")
            .value;


    const deadline =
        document
            .getElementById("missionDeadline")
            .value;


    if (name === "") {

        alert("Enter a mission name.");

        return;
    }


    let missionsData =
        JSON.parse(
            localStorage.getItem("nexusMissions")
        ) || [];


    const newMission = {

        id: Date.now(),

        name: name,

        priority: priority,

        deadline: deadline,

        progress: 0,

        completed: false,

        createdAt:
            new Date().toISOString()

    };


    missionsData.push(newMission);


    localStorage.setItem(
        "nexusMissions",
        JSON.stringify(missionsData)
    );


    document.getElementById(
        "missionName"
    ).value = "";


    document.getElementById(
        "missionPriority"
    ).value = "normal";


    document.getElementById(
        "missionDeadline"
    ).value = "";


    missionCreator.classList.add("hidden");

    missions.classList.remove("hidden");


    loadMissions();
}


// ========================================
// LOAD ACTIVE MISSIONS
// ========================================

function loadMissions() {

    let missionsData =
        JSON.parse(
            localStorage.getItem("nexusMissions")
        ) || [];


    const activeMissions =
        missionsData.filter(
            mission => !mission.completed
        );


    missionCount.textContent =
        String(activeMissions.length)
            .padStart(2, "0");


    if (activeMissions.length === 0) {

        missionList.innerHTML = `

            <div class="empty-state">

                <span>
                    NO ACTIVE MISSIONS
                </span>

                <p>
                    Awaiting new objectives.
                </p>

            </div>

        `;

        return;
    }


    missionList.innerHTML = "";


    activeMissions.forEach(
        mission => {

            const missionElement =
                document.createElement("div");


            missionElement.classList.add(
                "mission-card"
            );


            missionElement.dataset.priority =
                mission.priority || "normal";


            const progress =
                Number.isFinite(
                    Number(mission.progress)
                )
                    ? Number(mission.progress)
                    : 0;


            const deadlineText =
                mission.deadline
                    ? formatDate(mission.deadline)
                    : "NO DEADLINE";


            const countdown =
                getDeadlineText(
                    mission.deadline
                );


            const priorityText =
                mission.priority
                    ? mission.priority.toUpperCase()
                    : "NORMAL";


            missionElement.innerHTML = `

                <div
                    class="mission-click-area"
                    onclick="openMissionDetail(${mission.id})"
                >

                    <div class="mission-header">

                        <span class="mission-status">
                            ● ACTIVE
                        </span>

                        <span class="mission-id">
                            #${String(mission.id).slice(-4)}
                        </span>

                    </div>


                    <div class="mission-title">
                        ${escapeHTML(mission.name)}
                    </div>


                    <div class="mission-progress-section">

                        <div class="progress-header">

                            <span>
                                MISSION PROGRESS
                            </span>

                            <strong>
                                ${progress}%
                            </strong>

                        </div>


                        <div class="progress-track">

                            <div
                                class="progress-bar"
                                style="width: ${progress}%"
                            ></div>

                        </div>

                    </div>


                    <div class="mission-info">

                        <div>

                            <span>
                                PRIORITY
                            </span>

                            <strong>
                                ${priorityText}
                            </strong>

                        </div>


                        <div>

                            <span>
                                DEADLINE
                            </span>

                            <strong>
                                ${deadlineText}
                            </strong>

                        </div>


                        <div>

                            <span>
                                STATUS
                            </span>

                            <strong>
                                ${countdown}
                            </strong>

                        </div>

                    </div>

                </div>


                <div class="mission-actions">

                    <button
                        onclick="
                            event.stopPropagation();
                            completeMission(${mission.id})
                        "
                    >
                        COMPLETE MISSION
                    </button>

                </div>

            `;


            missionList.appendChild(
                missionElement
            );

        }
    );
}


// ========================================
// MISSION DETAIL
// ========================================

function openMissionDetail(id) {

    let missionsData =
        JSON.parse(
            localStorage.getItem("nexusMissions")
        ) || [];


    const mission =
        missionsData.find(
            mission => mission.id === id
        );


    if (!mission) {

        return;
    }


    selectedMissionId = id;


    missions.classList.add("hidden");

    missionDetail.classList.remove("hidden");


    renderMissionDetail(mission);
}


function renderMissionDetail(mission) {

    const progress =
        Number.isFinite(
            Number(mission.progress)
        )
            ? Number(mission.progress)
            : 0;


    const priority =
        mission.priority || "normal";


    const deadlineText =
        mission.deadline
            ? formatDate(mission.deadline)
            : "NO DEADLINE";


    const countdown =
        getDeadlineText(
            mission.deadline
        );


    const createdText =
        mission.createdAt
            ? formatDateTime(
                mission.createdAt
            )
            : "LEGACY MISSION";


    missionDetailContent.innerHTML = `

        <div
            class="mission-detail-card"
            data-priority="${priority}"
        >

            <div class="detail-top">

                <div>

                    <span class="detail-label">
                        MISSION ID
                    </span>

                    <div class="detail-id">
                        #${String(mission.id).slice(-4)}
                    </div>

                </div>


                <div class="detail-status">
                    ● ACTIVE
                </div>

            </div>


            <h2 class="detail-title">
                ${escapeHTML(mission.name)}
            </h2>


            <div class="detail-progress">

                <div class="progress-header">

                    <span>
                        OBJECTIVE PROGRESS
                    </span>

                    <strong id="detailProgressValue">
                        ${progress}%
                    </strong>

                </div>


                <input
                    id="progressSlider"
                    type="range"
                    min="0"
                    max="100"
                    value="${progress}"
                    oninput="previewProgress(this.value)"
                    onchange="updateMissionProgress(this.value)"
                >


                <div class="progress-track large">

                    <div
                        id="detailProgressBar"
                        class="progress-bar"
                        style="width: ${progress}%"
                    ></div>

                </div>

            </div>


            <div class="detail-grid">

                <div class="detail-stat">

                    <span>
                        PRIORITY
                    </span>

                    <strong>
                        ${priority.toUpperCase()}
                    </strong>

                </div>


                <div class="detail-stat">

                    <span>
                        DEADLINE
                    </span>

                    <strong>
                        ${deadlineText}
                    </strong>

                </div>


                <div class="detail-stat">

                    <span>
                        TIME STATUS
                    </span>

                    <strong>
                        ${countdown}
                    </strong>

                </div>


                <div class="detail-stat">

                    <span>
                        CREATED
                    </span>

                    <strong>
                        ${createdText}
                    </strong>

                </div>

            </div>


            <div class="detail-actions">

                <button
                    onclick="
                        completeMission(${mission.id})
                    "
                >
                    COMPLETE MISSION
                </button>

            </div>

        </div>

    `;
}


function previewProgress(value) {

    const progressValue =
        document.getElementById(
            "detailProgressValue"
        );


    const progressBar =
        document.getElementById(
            "detailProgressBar"
        );


    if (progressValue) {

        progressValue.textContent =
            `${value}%`;

    }


    if (progressBar) {

        progressBar.style.width =
            `${value}%`;

    }
}


function updateMissionProgress(value) {

    let missionsData =
        JSON.parse(
            localStorage.getItem("nexusMissions")
        ) || [];


    const mission =
        missionsData.find(
            mission => mission.id === selectedMissionId
        );


    if (!mission) {

        return;
    }


    mission.progress =
        Math.max(
            0,
            Math.min(
                100,
                Number(value)
            )
        );


    localStorage.setItem(
        "nexusMissions",
        JSON.stringify(missionsData)
    );


    loadMissions();
}


function closeMissionDetail() {

    selectedMissionId = null;

    missionDetail.classList.add("hidden");

    missions.classList.remove("hidden");

    loadMissions();
}


// ========================================
// COMPLETE MISSION
// ========================================

function completeMission(id) {

    let missionsData =
        JSON.parse(
            localStorage.getItem("nexusMissions")
        ) || [];


    const mission =
        missionsData.find(
            mission => mission.id === id
        );


    if (!mission) {

        return;
    }


    mission.progress = 100;

    mission.completed = true;

    mission.completedAt =
        new Date().toISOString();


    localStorage.setItem(
        "nexusMissions",
        JSON.stringify(missionsData)
    );


    missionDetail.classList.add("hidden");

    missions.classList.remove("hidden");

    selectedMissionId = null;


    loadMissions();
}


// ========================================
// ARCHIVE
// ========================================

function loadArchive() {

    let missionsData =
        JSON.parse(
            localStorage.getItem("nexusMissions")
        ) || [];


    const completedMissions =
        missionsData.filter(
            mission => mission.completed
        );


    archiveCount.textContent =
        String(completedMissions.length)
            .padStart(2, "0");


    if (completedMissions.length === 0) {

        archiveList.innerHTML = `

            <div class="empty-state">

                <span>
                    ARCHIVE EMPTY
                </span>

                <p>
                    Completed missions will appear here.
                </p>

            </div>

        `;

        return;
    }


    archiveList.innerHTML = "";


    completedMissions
        .slice()
        .reverse()
        .forEach(
            mission => {

                const missionElement =
                    document.createElement("div");


                missionElement.classList.add(
                    "mission-card",
                    "archived"
                );


                missionElement.dataset.priority =
                    mission.priority || "normal";


                const completedDate =
                    mission.completedAt
                        ? formatDateTime(
                            mission.completedAt
                        )
                        : "UNKNOWN";


                missionElement.innerHTML = `

                    <div class="mission-header">

                        <span class="mission-status">
                            ✓ COMPLETED
                        </span>

                        <span class="mission-id">
                            #${String(mission.id).slice(-4)}
                        </span>

                    </div>


                    <div
                        class="mission-click-area"
                        onclick="
                            openMissionDetail(${mission.id})
                        "
                    >

                        <div class="mission-title">
                            ${escapeHTML(mission.name)}
                        </div>


                        <div class="mission-progress-section">

                            <div class="progress-header">

                                <span>
                                    FINAL PROGRESS
                                </span>

                                <strong>
                                    100%
                                </strong>

                            </div>


                            <div class="progress-track">

                                <div
                                    class="progress-bar"
                                    style="width: 100%"
                                ></div>

                            </div>

                        </div>


                        <div class="mission-info">

                            <div>

                                <span>
                                    PRIORITY
                                </span>

                                <strong>
                                    ${(mission.priority || "normal").toUpperCase()}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    COMPLETED
                                </span>

                                <strong>
                                    ${completedDate}
                                </strong>

                            </div>

                        </div>

                    </div>

                `;


                archiveList.appendChild(
                    missionElement
                );

            }
        );
}


// ========================================
// DATE FUNCTIONS
// ========================================

function formatDate(dateString) {

    if (!dateString) {

        return "NO DEADLINE";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).toUpperCase();
}


function formatShortDate(dateString) {

    if (!dateString) {

        return "NONE";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short"
        }
    ).toUpperCase();
}


function formatDateTime(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).toUpperCase();
}


function getDeadlineText(deadline) {

    if (!deadline) {

        return "NO DEADLINE";
    }


    const today =
        new Date();

    today.setHours(0, 0, 0, 0);


    const target =
        new Date(
            deadline + "T00:00:00"
        );


    const difference =
        target.getTime() -
        today.getTime();


    const days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    if (days < 0) {

        return "OVERDUE";
    }


    if (days === 0) {

        return "DUE TODAY";
    }


    if (days === 1) {

        return "DUE TOMORROW";
    }


    return `${days} DAYS`;
}


// ========================================
// SECURITY
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ========================================
// INITIALISE
// ========================================

updateDashboard();


// ========================================
// SERVICE WORKER
// ========================================

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register(
        "./service-worker.js"
    );

}