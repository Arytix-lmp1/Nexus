const dashboard = document.getElementById("dashboard");
const missions = document.getElementById("missions");
const missionCreator = document.getElementById("missionCreator");
const missionDetail = document.getElementById("missionDetail");
const archive = document.getElementById("archive");

const missionDetailContent =
    document.getElementById("missionDetailContent");

const missionList =
    document.getElementById("missionList");

const missionCount =
    document.getElementById("missionCount");

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
// DATA
// ========================================

function getMissions() {

    return JSON.parse(
        localStorage.getItem("nexusMissions")
    ) || [];

}


function saveMissions(missionsData) {

    localStorage.setItem(
        "nexusMissions",
        JSON.stringify(missionsData)
    );

}


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


function closeMissionDetail() {

    selectedMissionId = null;

    missionDetail.classList.add("hidden");

    missions.classList.remove("hidden");

    loadMissions();

}


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
// PRIORITY INTELLIGENCE
// ========================================

const priorityWeights = {

    critical: 4,
    high: 3,
    normal: 2,
    low: 1

};


function getPriorityWeight(priority) {

    return priorityWeights[priority] || 2;

}


// ========================================
// DEADLINE INTELLIGENCE
// ========================================

function getDeadlineTimestamp(deadline) {

    if (!deadline) {

        return Infinity;

    }

    return new Date(
        deadline + "T00:00:00"
    ).getTime();

}


function getDaysUntilDeadline(deadline) {

    if (!deadline) {

        return null;

    }

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const target = new Date(
        deadline + "T00:00:00"
    );

    return Math.ceil(
        (
            target.getTime() -
            today.getTime()
        ) /
        (1000 * 60 * 60 * 24)
    );

}


function getDeadlineState(deadline) {

    if (!deadline) {

        return "none";

    }

    const days =
        getDaysUntilDeadline(deadline);


    if (days < 0) {

        return "overdue";

    }

    if (days === 0) {

        return "today";

    }

    if (days <= 2) {

        return "urgent";

    }

    if (days <= 7) {

        return "approaching";

    }

    return "normal";

}


function getDeadlineText(deadline) {

    if (!deadline) {

        return "NO DEADLINE";

    }

    const days =
        getDaysUntilDeadline(deadline);


    if (days < 0) {

        const overdue =
            Math.abs(days);

        return overdue === 1
            ? "1 DAY OVERDUE"
            : `${overdue} DAYS OVERDUE`;

    }

    if (days === 0) {

        return "DUE TODAY";

    }

    if (days === 1) {

        return "DUE TOMORROW";

    }

    return `${days} DAYS`;

}


function getDeadlineShortStatus(deadline) {

    if (!deadline) {

        return "NONE";

    }

    const days =
        getDaysUntilDeadline(deadline);


    if (days < 0) {

        return "OVERDUE";

    }

    if (days === 0) {

        return "TODAY";

    }

    if (days === 1) {

        return "TOMORROW";

    }

    if (days <= 7) {

        return `${days} DAYS`;

    }

    return formatShortDate(deadline);

}


// ========================================
// MISSION INTELLIGENCE
// ========================================

function calculateMissionProgress(mission) {

    ensureMissionStructure(mission);


    if (
        mission.subtasks.length === 0
    ) {

        return Number(
            mission.progress
        ) || 0;

    }


    const completed =
        mission.subtasks.filter(
            subtask =>
                subtask.completed
        ).length;


    return Math.round(
        (
            completed /
            mission.subtasks.length
        ) * 100
    );

}


function ensureMissionStructure(mission) {

    if (
        !Array.isArray(
            mission.subtasks
        )
    ) {

        mission.subtasks = [];

    }

}


function sortActiveMissions(missionsData) {

    return missionsData
        .filter(
            mission =>
                !mission.completed
        )
        .sort(
            (a, b) => {

                const priorityDifference =
                    getPriorityWeight(
                        b.priority
                    ) -
                    getPriorityWeight(
                        a.priority
                    );


                if (
                    priorityDifference !== 0
                ) {

                    return priorityDifference;

                }


                return (
                    getDeadlineTimestamp(
                        a.deadline
                    ) -
                    getDeadlineTimestamp(
                        b.deadline
                    )
                );

            }
        );

}


// ========================================
// DASHBOARD INTELLIGENCE
// ========================================

function updateDashboard() {

    const missionsData =
        getMissions();


    const activeMissions =
        missionsData.filter(
            mission =>
                !mission.completed
        );


    const completedMissions =
        missionsData.filter(
            mission =>
                mission.completed
        );


    activeMissionStat.textContent =
        String(
            activeMissions.length
        ).padStart(2, "0");


    const completionRate =
        missionsData.length === 0
            ? 0
            : Math.round(
                (
                    completedMissions.length /
                    missionsData.length
                ) * 100
            );


    completionRateStat.textContent =
        `${completionRate}%`;


    const deadlineMissions =
        activeMissions
            .filter(
                mission =>
                    mission.deadline
            )
            .sort(
                (a, b) =>
                    getDeadlineTimestamp(
                        a.deadline
                    ) -
                    getDeadlineTimestamp(
                        b.deadline
                    )
            );


    if (
        deadlineMissions.length > 0
    ) {

        nextDeadlineStat.textContent =
            getDeadlineShortStatus(
                deadlineMissions[0].deadline
            );

    } else {

        nextDeadlineStat.textContent =
            "NONE";

    }


    updateCurrentPriority(
        activeMissions
    );

}


// ========================================
// CURRENT PRIORITY
// ========================================

function updateCurrentPriority(
    activeMissions
) {

    if (
        activeMissions.length === 0
    ) {

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


    const sorted =
        sortActiveMissions(
            activeMissions
        );


    const mission =
        sorted[0];


    const priority =
        mission.priority || "normal";


    currentPriority.dataset.priority =
        priority;


    priorityIndicator.dataset.priority =
        priority;


    priorityIndicator.textContent =
        `● ${priority.toUpperCase()}`;


    currentPriority.innerHTML = `

        <strong>
            ${escapeHTML(
                mission.name
            )}
        </strong>

        <p>
            ${priority.toUpperCase()}
            •
            ${calculateMissionProgress(
                mission
            )}% COMPLETE
        </p>

    `;

}


// ========================================
// CREATE MISSION
// ========================================

function saveMission() {

    const name =
        document
            .getElementById(
                "missionName"
            )
            .value
            .trim();


    const priority =
        document
            .getElementById(
                "missionPriority"
            )
            .value;


    const deadline =
        document
            .getElementById(
                "missionDeadline"
            )
            .value;


    if (name === "") {

        alert(
            "Enter a mission name."
        );

        return;

    }


    const missionsData =
        getMissions();


    const newMission = {

        id: Date.now(),

        name: name,

        priority: priority,

        deadline: deadline,

        progress: 0,

        completed: false,

        subtasks: [],

        createdAt:
            new Date().toISOString()

    };


    missionsData.push(
        newMission
    );


    saveMissions(
        missionsData
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


    missionCreator.classList.add(
        "hidden"
    );

    missions.classList.remove(
        "hidden"
    );


    loadMissions();

}


// ========================================
// LOAD MISSIONS
// ========================================

function loadMissions() {

    const missionsData =
        getMissions();


    const activeMissions =
        sortActiveMissions(
            missionsData
        );


    missionCount.textContent =
        String(
            activeMissions.length
        ).padStart(2, "0");


    if (
        activeMissions.length === 0
    ) {

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


        updateDashboard();

        return;

    }


    missionList.innerHTML = "";


    activeMissions.forEach(
        mission => {

            ensureMissionStructure(
                mission
            );


            const progress =
                calculateMissionProgress(
                    mission
                );


            const completedSubtasks =
                mission.subtasks.filter(
                    subtask =>
                        subtask.completed
                ).length;


            const totalSubtasks =
                mission.subtasks.length;


            const deadlineState =
                getDeadlineState(
                    mission.deadline
                );


            const missionElement =
                document.createElement(
                    "div"
                );


            missionElement.classList.add(
                "mission-card"
            );


            missionElement.dataset.priority =
                mission.priority ||
                "normal";


            missionElement.dataset.deadlineState =
                deadlineState;


            missionElement.innerHTML = `

                <div
                    class="mission-click-area"
                    onclick="
                        openMissionDetail(
                            ${mission.id}
                        )
                    "
                >

                    <div class="mission-header">

                        <span class="mission-status">

                            ● ACTIVE

                        </span>

                        <span class="mission-id">

                            #${String(
                                mission.id
                            ).slice(-4)}

                        </span>

                    </div>


                    <div class="mission-title">

                        ${escapeHTML(
                            mission.name
                        )}

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
                                style="
                                    width: ${progress}%
                                "
                            ></div>

                        </div>

                    </div>


                    <div class="mission-info">

                        <div>

                            <span>
                                OBJECTIVES
                            </span>

                            <strong>
                                ${completedSubtasks}
                                /
                                ${totalSubtasks}
                            </strong>

                        </div>


                        <div>

                            <span>
                                PRIORITY
                            </span>

                            <strong>
                                ${(
                                    mission.priority ||
                                    "normal"
                                ).toUpperCase()}
                            </strong>

                        </div>


                        <div>

                            <span>
                                TIME STATUS
                            </span>

                            <strong
                                class="deadline-status"
                            >
                                ${getDeadlineText(
                                    mission.deadline
                                )}
                            </strong>

                        </div>

                    </div>

                </div>


                <div class="mission-actions">

                    <button
                        onclick="
                            event.stopPropagation();
                            completeMission(
                                ${mission.id}
                            )
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


    saveMissions(
        missionsData
    );


    updateDashboard();

}


// ========================================
// MISSION DETAIL
// ========================================

function openMissionDetail(id) {

    const missionsData =
        getMissions();


    const mission =
        missionsData.find(
            mission =>
                mission.id === id
        );


    if (!mission) {

        return;

    }


    ensureMissionStructure(
        mission
    );


    selectedMissionId = id;


    missions.classList.add(
        "hidden"
    );

    missionDetail.classList.remove(
        "hidden"
    );


    renderMissionDetail(
        mission
    );

}


function renderMissionDetail(
    mission
) {

    const progress =
        calculateMissionProgress(
            mission
        );


    const priority =
        mission.priority ||
        "normal";


    const deadlineState =
        getDeadlineState(
            mission.deadline
        );


    const completedSubtasks =
        mission.subtasks.filter(
            subtask =>
                subtask.completed
        ).length;


    const totalSubtasks =
        mission.subtasks.length;


    missionDetailContent.innerHTML = `

        <div
            class="mission-detail-card"
            data-priority="${priority}"
            data-deadline-state="${deadlineState}"
        >

            <div class="detail-top">

                <div>

                    <span class="detail-label">
                        MISSION ID
                    </span>

                    <div class="detail-id">

                        #${String(
                            mission.id
                        ).slice(-4)}

                    </div>

                </div>


                <div class="detail-status">

                    ● ACTIVE

                </div>

            </div>


            <h2 class="detail-title">

                ${escapeHTML(
                    mission.name
                )}

            </h2>


            <div class="detail-progress">

                <div class="progress-header">

                    <span>
                        OBJECTIVE PROGRESS
                    </span>

                    <strong>
                        ${progress}%
                    </strong>

                </div>


                <div class="progress-track large">

                    <div
                        class="progress-bar"
                        style="
                            width: ${progress}%
                        "
                    ></div>

                </div>


                <div class="objective-count">

                    ${completedSubtasks}
                    /
                    ${totalSubtasks}
                    OBJECTIVES COMPLETE

                </div>

            </div>


            <div class="subtask-section">

                <div class="subtask-heading">

                    <span>
                        MISSION OBJECTIVES
                    </span>

                    <span>
                        ${totalSubtasks}
                    </span>

                </div>


                <div id="subtaskList">

                    ${renderSubtasks(
                        mission
                    )}

                </div>


                <div class="subtask-creator">

                    <input
                        id="newSubtask"
                        type="text"
                        placeholder="Add objective..."
                        onkeydown="
                            if(event.key === 'Enter')
                            addSubtask()
                        "
                    >


                    <button
                        onclick="addSubtask()"
                    >
                        + ADD
                    </button>

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
                        ${
                            mission.deadline
                                ? formatDate(
                                    mission.deadline
                                )
                                : "NO DEADLINE"
                        }
                    </strong>

                </div>


                <div class="detail-stat">

                    <span>
                        TIME STATUS
                    </span>

                    <strong
                        class="deadline-status"
                    >
                        ${getDeadlineText(
                            mission.deadline
                        )}
                    </strong>

                </div>


                <div class="detail-stat">

                    <span>
                        CREATED
                    </span>

                    <strong>
                        ${
                            mission.createdAt
                                ? formatDateTime(
                                    mission.createdAt
                                )
                                : "UNKNOWN"
                        }
                    </strong>

                </div>

            </div>


            <div class="detail-actions">

                <button
                    onclick="
                        completeMission(
                            ${mission.id}
                        )
                    "
                >
                    COMPLETE MISSION
                </button>

            </div>

        </div>

    `;

}


// ========================================
// SUBTASKS
// ========================================

function renderSubtasks(
    mission
) {

    if (
        mission.subtasks.length === 0
    ) {

        return `

            <div class="subtask-empty">

                NO OBJECTIVES YET

            </div>

        `;

    }


    return mission.subtasks
        .map(
            (
                subtask,
                index
            ) => `

                <div
                    class="
                        subtask
                        ${
                            subtask.completed
                                ? "completed"
                                : ""
                        }
                    "
                >

                    <button
                        class="subtask-check"
                        onclick="
                            toggleSubtask(
                                ${index}
                            )
                        "
                    >

                        ${
                            subtask.completed
                                ? "✓"
                                : ""
                        }

                    </button>


                    <span class="subtask-name">

                        ${escapeHTML(
                            subtask.name
                        )}

                    </span>


                    <button
                        class="subtask-delete"
                        onclick="
                            deleteSubtask(
                                ${index}
                            )
                        "
                    >

                        ×

                    </button>

                </div>

            `
        )
        .join("");

}


function addSubtask() {

    const input =
        document.getElementById(
            "newSubtask"
        );


    if (!input) {

        return;

    }


    const name =
        input.value.trim();


    if (name === "") {

        return;

    }


    const missionsData =
        getMissions();


    const mission =
        missionsData.find(
            mission =>
                mission.id ===
                selectedMissionId
        );


    if (!mission) {

        return;

    }


    ensureMissionStructure(
        mission
    );


    mission.subtasks.push({

        id: Date.now(),

        name: name,

        completed: false

    });


    mission.progress =
        calculateMissionProgress(
            mission
        );


    saveMissions(
        missionsData
    );


    renderMissionDetail(
        mission
    );


    updateDashboard();

}


function toggleSubtask(index) {

    const missionsData =
        getMissions();


    const mission =
        missionsData.find(
            mission =>
                mission.id ===
                selectedMissionId
        );


    if (!mission) {

        return;

    }


    ensureMissionStructure(
        mission
    );


    if (
        !mission.subtasks[index]
    ) {

        return;

    }


    mission.subtasks[index].completed =
        !mission.subtasks[index].completed;


    mission.progress =
        calculateMissionProgress(
            mission
        );


    saveMissions(
        missionsData
    );


    renderMissionDetail(
        mission
    );


    updateDashboard();

}


function deleteSubtask(index) {

    const missionsData =
        getMissions();


    const mission =
        missionsData.find(
            mission =>
                mission.id ===
                selectedMissionId
        );


    if (!mission) {

        return;

    }


    ensureMissionStructure(
        mission
    );


    mission.subtasks.splice(
        index,
        1
    );


    mission.progress =
        calculateMissionProgress(
            mission
        );


    saveMissions(
        missionsData
    );


    renderMissionDetail(
        mission
    );


    updateDashboard();

}


// ========================================
// COMPLETE MISSION
// ========================================

function completeMission(id) {

    const missionsData =
        getMissions();


    const mission =
        missionsData.find(
            mission =>
                mission.id === id
        );


    if (!mission) {

        return;

    }


    ensureMissionStructure(
        mission
    );


    mission.progress = 100;

    mission.completed = true;

    mission.completedAt =
        new Date().toISOString();


    mission.subtasks.forEach(
        subtask => {

            subtask.completed = true;

        }
    );


    saveMissions(
        missionsData
    );


    selectedMissionId = null;


    missionDetail.classList.add(
        "hidden"
    );


    missions.classList.remove(
        "hidden"
    );


    loadMissions();

}


// ========================================
// ARCHIVE
// ========================================

function loadArchive() {

    const missionsData =
        getMissions();


    const completedMissions =
        missionsData.filter(
            mission =>
                mission.completed
        );


    archiveCount.textContent =
        String(
            completedMissions.length
        ).padStart(2, "0");


    if (
        completedMissions.length === 0
    ) {

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

                ensureMissionStructure(
                    mission
                );


                const missionElement =
                    document.createElement(
                        "div"
                    );


                missionElement.classList.add(
                    "mission-card",
                    "archived"
                );


                missionElement.dataset.priority =
                    mission.priority ||
                    "normal";


                missionElement.innerHTML = `

                    <div class="mission-header">

                        <span class="mission-status">

                            ✓ COMPLETED

                        </span>

                        <span class="mission-id">

                            #${String(
                                mission.id
                            ).slice(-4)}

                        </span>

                    </div>


                    <div
                        class="mission-click-area"
                        onclick="
                            openMissionDetail(
                                ${mission.id}
                            )
                        "
                    >

                        <div class="mission-title">

                            ${escapeHTML(
                                mission.name
                            )}

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
                                    OBJECTIVES
                                </span>

                                <strong>
                                    ${
                                        mission.subtasks
                                            .filter(
                                                subtask =>
                                                    subtask.completed
                                            )
                                            .length
                                    }
                                    /
                                    ${mission.subtasks.length}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    PRIORITY
                                </span>

                                <strong>
                                    ${(
                                        mission.priority ||
                                        "normal"
                                    ).toUpperCase()}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    COMPLETED
                                </span>

                                <strong>
                                    ${
                                        mission.completedAt
                                            ? formatDateTime(
                                                mission.completedAt
                                            )
                                            : "UNKNOWN"
                                    }
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
// DATE FORMATTING
// ========================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "NO DEADLINE";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
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


function formatShortDate(
    dateString
) {

    if (!dateString) {

        return "NONE";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short"
        }
    ).toUpperCase();

}


function formatDateTime(
    dateString
) {

    const date =
        new Date(
            dateString
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


// ========================================
// SECURITY
// ========================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// ========================================
// LIVE INTELLIGENCE REFRESH
// ========================================

function refreshNexus() {

    updateDashboard();


    if (
        !missions.classList.contains(
            "hidden"
        )
    ) {

        loadMissions();

    }


    if (
        !archive.classList.contains(
            "hidden"
        )
    ) {

        loadArchive();

    }


    if (
        selectedMissionId !== null &&
        !missionDetail.classList.contains(
            "hidden"
        )
    ) {

        const missionsData =
            getMissions();


        const mission =
            missionsData.find(
                mission =>
                    mission.id ===
                    selectedMissionId
            );


        if (mission) {

            renderMissionDetail(
                mission
            );

        }

    }

}


// ========================================
// INITIALISE
// ========================================

refreshNexus();


setInterval(
    refreshNexus,
    60000
);


if (
    "serviceWorker" in navigator
) {

    navigator.serviceWorker.register(
        "./service-worker.js"
    );

}