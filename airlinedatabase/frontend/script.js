// ============================================
// AIRLINE MANAGEMENT SYSTEM - COMPLETE JAVASCRIPT (ENGLISH)
// ============================================

const API_URL = 'http://localhost:5000/api';

// Global edit state
let editMode = {
    active: false,
    type: null,
    id: null
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    loadDashboard();
    loadPilots();
    loadCrewMembers();
    loadFlights();
    loadAircraft();
    loadAirports();
    loadMaintenance();
});

// ============================================
// NAVIGATION
// ============================================
function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    document.getElementById(`${viewName}-view`).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.nav-btn').classList.add('active');

    switch (viewName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// ============================================
// ENHANCED DASHBOARD
// ============================================
async function loadDashboard() {
    try {
        const [pilots, crew, flights, aircraft, airports, maintenance] = await Promise.all([
            fetch(`${API_URL}/pilots`).then(r => r.json()),
            fetch(`${API_URL}/crew-members`).then(r => r.json()),
            fetch(`${API_URL}/flights`).then(r => r.json()),
            fetch(`${API_URL}/aircraft`).then(r => r.json()),
            fetch(`${API_URL}/airports`).then(r => r.json()),
            fetch(`${API_URL}/maintenance`).then(r => r.json())
        ]);

        const pilotsArray = Array.isArray(pilots) ? pilots : [];
        const crewArray = Array.isArray(crew) ? crew : [];
        const flightsArray = Array.isArray(flights) ? flights : [];
        const aircraftArray = Array.isArray(aircraft) ? aircraft : [];
        const airportsArray = Array.isArray(airports) ? airports : [];
        const maintenanceArray = Array.isArray(maintenance) ? maintenance : [];

        // Update main stats
        document.getElementById('stat-pilots').textContent = pilotsArray.filter(p => p.employment_status === 'Active').length;
        document.getElementById('stat-crew').textContent = crewArray.filter(c => c.employment_status === 'Active').length;
        document.getElementById('stat-flights').textContent = flightsArray.filter(f => f.flight_status === 'Scheduled').length;
        document.getElementById('stat-aircraft').textContent = aircraftArray.filter(a => a.status === 'Operational').length;
        document.getElementById('stat-airports').textContent = airportsArray.length;
        document.getElementById('stat-maintenance').textContent = maintenanceArray.filter(m => ['InProgress', 'In Progress'].includes(m.maintenance_status)).length;

        // Upcoming scheduled flights (next 5)
        const upcomingFlights = flightsArray
            .filter(f => f.flight_status === 'Scheduled')
            .sort((a, b) => new Date(a.scheduled_departure_time) - new Date(b.scheduled_departure_time))
            .slice(0, 5);

        const upcomingHtml = upcomingFlights.length
            ? upcomingFlights.map(f => `
                <div class="data-item">
                    <strong>${f.flight_number}</strong>
                    <small>${f.departure_airport || 'N/A'} to ${f.arrival_airport || 'N/A'} | ${formatDateTime(f.scheduled_departure_time)}</small>
                </div>`).join('')
            : '<div class="data-item"><small>No scheduled flights</small></div>';

        document.getElementById('upcoming-flights').innerHTML = upcomingHtml;

        // Recent maintenance (last 5)
        const recentMaint = maintenanceArray
            .sort((a, b) => new Date(b.start_date_time) - new Date(a.start_date_time))
            .slice(0, 5);

        const maintHtml = recentMaint.length
            ? recentMaint.map(e => {
                const ac = aircraftArray.find(a => a.aircraft_id === e.aircraft_id);
                return `
                    <div class="data-item">
                        <strong>${ac ? ac.tail_number : 'N/A'}</strong>
                        <small>${e.maintenance_type} - <span class="status-badge status-${e.maintenance_status.toLowerCase().replace(' ', '-')}">${e.maintenance_status}</span></small>
                    </div>`;
            }).join('')
            : '<div class="data-item"><small>No maintenance events</small></div>';

        document.getElementById('recent-maintenance').innerHTML = maintHtml;

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

// ============================================
// PILOTS
// ============================================
async function loadPilots(){
    try{
        const response = await fetch(`${API_URL}/pilots`);
        const pilots = await response.json();
        const tbody = document.getElementById('pilots-tbody');
        tbody.innerHTML = pilots.map(pilot => `
            <tr>
                <td>${pilot.pilot_id}</td>
                <td>${pilot.first_name}</td>
                <td>${pilot.last_name}</td>
                <td>${pilot.license_number}</td>
                <td>${pilot.license_type}</td>
                <td>${parseFloat(pilot.total_flight_hours).toLocaleString()} hrs</td>
                <td>${pilot.current_rank}</td>
                <td><span class="status-badge status-${pilot.employment_status.toLowerCase()}">${pilot.employment_status}</span></td>
                <td class="action-buttons">
                    <button class="btn btn-warning btn-small" onclick="editPilot(${pilot.pilot_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deletePilot(${pilot.pilot_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading pilots:', error);
        showNotification('Error loading pilots', 'error');
    }
}

function showAddModal(type) {
    editMode = { active: false, type: type, id: null };
    if (type !== 'pilot') {
        // tu lógica para otros modales...
        return;
    }

    document.getElementById('modal-title').textContent = 'Add New Pilot';
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <form id="pilot-form">
            <div class="form-group"><label>First Name</label><input type="text" id="first_name" required></div>
            <div class="form-group"><label>Last Name</label><input type="text" id="last_name" required></div>
            <div class="form-group"><label>Date of Birth</label><input type="date" id="date_of_birth" required></div>
            <div class="form-group"><label>Gender</label>
                <select id="gender" required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group"><label>License Number</label><input type="text" id="license_number" required></div>
            <div class="form-group"><label>License Type</label>
                <select id="license_type" required>
                    <option value="">Select</option>
                    <option value="ATPL">ATPL</option>
                    <option value="CPL">CPL</option>
                    <option value="PPL">PPL</option>
                </select>
            </div>
            <div class="form-group"><label>License Expiry</label><input type="date" id="license_expiry_date" required></div>
            <div class="form-group"><label>Medical Certificate Class</label><input type="text" id="medical_certificate_class" value="A1" required></div>
            <div class="form-group"><label>Medical Certificate Expiry</label><input type="date" id="medical_certificate_expiry" required></div>
            <div class="form-group"><label>Total Flight Hours</label><input type="number" step="0.01" id="total_flight_hours" value="0" required></div>
            <div class="form-group"><label>Current Rank</label>
                <select id="current_rank" required>
                    <option value="">Select</option>
                    <option value="Captain">Captain</option>
                    <option value="First Officer">First Officer</option>
                    <option value="Second Officer">Second Officer</option>
                    <option value="Trainee">Trainee</option>
                </select>
            </div>
            <div class="form-group"><label>Employment Status</label>
                <select id="employment_status" required>
                    <option value="">Select</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="OnLeave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Retired">Retired</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Pilot</button>
            </div>
        </form>
    `;
    document.getElementById('pilot-form').onsubmit = e => { e.preventDefault(); savePilot(); };
    document.getElementById('modal').classList.add('active');
}

async function editPilot(id) {
    console.log('[editPilot] id ->', id);
    try {
        if (id === undefined || id === null || id === '') throw new Error('Invalid pilot id');
        const resp = await fetch(`${API_URL}/pilots/${encodeURIComponent(id)}`);
        if (!resp.ok) {
            const r = await readResponse(resp);
            throw new Error(r.message || `HTTP ${resp.status}`);
        }
        const pilot = await resp.json();
        console.log('[editPilot] pilot loaded', pilot);

        editMode = { active: true, type: 'pilot', id };

        // prepara valores adecuados para inputs
        const dob = toDateInputValue(pilot.date_of_birth);
        const licenseExpiry = toDateInputValue(pilot.license_expiry_date);
        const medExpiry = toDateInputValue(pilot.medical_certificate_expiry);
        const totalHoursValue = (pilot.total_flight_hours === null || pilot.total_flight_hours === undefined) ? 0 : Number(pilot.total_flight_hours);

        const modalBody = document.getElementById('modal-body');
        if (!modalBody) throw new Error('Modal body element not found (#modal-body)');

        modalBody.innerHTML = `
            <form id="pilot-form">
                <div class="form-group"><label>First Name</label><input type="text" id="first_name" value="${safeText(pilot.first_name)}" required></div>
                <div class="form-group"><label>Last Name</label><input type="text" id="last_name" value="${safeText(pilot.last_name)}" required></div>
                <div class="form-group"><label>Date of Birth</label><input type="date" id="date_of_birth" value="${escapeHtml(dob)}" required></div>
                <div class="form-group"><label>Gender</label>
                    <select id="gender" required>
                        <option value="">Select</option>
                        <option value="Male" ${pilot.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${pilot.gender === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${pilot.gender === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group"><label>License Number</label><input type="text" id="license_number" value="${safeText(pilot.license_number)}" required></div>
                <div class="form-group"><label>License Type</label>
                    <select id="license_type" required>
                        <option value="">Select</option>
                        <option value="ATPL" ${pilot.license_type === 'ATPL' ? 'selected' : ''}>ATPL</option>
                        <option value="CPL" ${pilot.license_type === 'CPL' ? 'selected' : ''}>CPL</option>
                        <option value="PPL" ${pilot.license_type === 'PPL' ? 'selected' : ''}>PPL</option>
                    </select>
                </div>
                <div class="form-group"><label>License Expiry</label><input type="date" id="license_expiry_date" value="${escapeHtml(licenseExpiry)}" required></div>
                <div class="form-group"><label>Medical Certificate Class</label><input type="text" id="medical_certificate_class" value="${safeText(pilot.medical_certificate_class ?? 'A1')}" required></div>
                <div class="form-group"><label>Medical Certificate Expiry</label><input type="date" id="medical_certificate_expiry" value="${escapeHtml(medExpiry)}" required></div>
                <div class="form-group"><label>Total Flight Hours</label><input type="number" step="0.01" id="total_flight_hours" value="${escapeHtml(String(totalHoursValue))}" required></div>
                <div class="form-group"><label>Current Rank</label>
                    <select id="current_rank" required>
                        <option value="">Select</option>
                        <option value="Captain" ${pilot.current_rank === 'Captain' ? 'selected' : ''}>Captain</option>
                        <option value="First Officer" ${pilot.current_rank === 'First Officer' ? 'selected' : ''}>First Officer</option>
                        <option value="Second Officer" ${pilot.current_rank === 'Second Officer' ? 'selected' : ''}>Second Officer</option>
                        <option value="Trainee" ${pilot.current_rank === 'Trainee' ? 'selected' : ''}>Trainee</option>
                    </select>
                </div>
                <div class="form-group"><label>Employment Status</label>
                    <select id="employment_status" required>
                        <option value="">Select</option>
                        <option value="Active" ${pilot.employment_status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${pilot.employment_status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        <option value="OnLeave" ${pilot.employment_status === 'OnLeave' ? 'selected' : ''}>On Leave</option>
                        <option value="Suspended" ${pilot.employment_status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                        <option value="Retired" ${pilot.employment_status === 'Retired' ? 'selected' : ''}>Retired</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-danger" id="modal-cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Pilot</button>
                </div>
            </form>
        `;
        document.getElementById('modal-title').textContent = 'Edit Pilot';
        document.getElementById('modal').classList.add('active');

        // attach handlers
        const form = document.getElementById('pilot-form');
        form.onsubmit = e => { e.preventDefault(); savePilot(); };
        document.getElementById('modal-cancel').onclick = () => closeModal && closeModal();
    } catch (e) {
        console.error('[editPilot] Error loading pilot:', e);
        showNotification && showNotification('Error loading pilot: ' + (e.message||e), 'error');
    }
}

async function savePilot() {
    try {
        const first_name = (document.getElementById('first_name')?.value || '').trim();
        const last_name = (document.getElementById('last_name')?.value || '').trim();
        if (!first_name || !last_name) {
            showNotification && showNotification('First and Last name are required', 'error');
            return;
        }

        const totalHoursRaw = document.getElementById('total_flight_hours')?.value;
        const total_flight_hours = totalHoursRaw === '' || totalHoursRaw === undefined ? 0 : parseFloat(totalHoursRaw);
        if (isNaN(total_flight_hours) || total_flight_hours < 0) {
            showNotification && showNotification('Total flight hours must be a valid non-negative number', 'error');
            return;
        }

        const data = {
            first_name,
            last_name,
            date_of_birth: document.getElementById('date_of_birth')?.value || null,
            gender: document.getElementById('gender')?.value || null,
            license_number: document.getElementById('license_number')?.value || null,
            license_type: document.getElementById('license_type')?.value || null,
            license_expiry_date: document.getElementById('license_expiry_date')?.value || null,
            medical_certificate_class: document.getElementById('medical_certificate_class')?.value || null,
            medical_certificate_expiry: document.getElementById('medical_certificate_expiry')?.value || null,
            total_flight_hours: total_flight_hours,
            current_rank: document.getElementById('current_rank')?.value || null,
            employment_status: document.getElementById('employment_status')?.value || null
        };

        const url = (editMode && editMode.active) ? `${API_URL}/pilots/${encodeURIComponent(editMode.id)}` : `${API_URL}/pilots`;
        const method = (editMode && editMode.active) ? 'PUT' : 'POST';
        console.log('[savePilot] method/url', method, url, 'payload', data);

        const resp = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!resp.ok) {
            const r = await readResponse(resp);
            throw new Error(r.message || `HTTP ${resp.status}`);
        }

        let result = {};
        try { result = await resp.json(); } catch (e) { result = {}; }

        showNotification && showNotification(result.message ?? (editMode.active ? 'Pilot updated' : 'Pilot created'), 'success');
        closeModal && closeModal();
        await loadPilots();
        if (typeof loadDashboard === 'function') loadDashboard();
    } catch (e) {
        console.error('[savePilot] Error saving pilot:', e);
        showNotification && showNotification(`Error saving pilot: ${e.message || e}`, 'error');
    }
}

async function deletePilot(id) {
    if (!confirm('Are you sure you want to delete this pilot?')) return;
    try {
        const resp = await fetch(`${API_URL}/pilots/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!resp.ok) {
            let text = `HTTP ${resp.status}`;
            try { const j = await resp.json(); text = j.message || JSON.stringify(j); } catch {}
            throw new Error(text);
        }
        let data = {};
        try { data = await resp.json(); } catch {}
        showNotification && showNotification(data.message ?? 'Pilot deleted', 'success');
        loadPilots();
        if (typeof loadDashboard === 'function') loadDashboard();
    } catch (e) {
        console.error('Error deleting pilot:', e);
        showNotification && showNotification('Error deleting pilot', 'error');
    }
}

// ============================================
// MODAL FACTORY (Add / Edit)
// ============================================

function showAddModal(type) {
    editMode = { active: false, type, id: null };
    const modalBody = document.getElementById('modal-body');

    switch (type) {
        case 'pilot':
            document.getElementById('modal-title').textContent = 'Add New Pilot';
            modalBody.innerHTML = pilotAddForm();
            document.getElementById('pilot-form').onsubmit = e => { e.preventDefault(); savePilot(); };
            break;
        case 'crew':
            editMode = { active: false, type: 'crew', id: null };
            showCrewModal();
            break;
        case 'flight':
            editMode = { active: false, type: 'flight', id: null };
            showFlightModal();
            break;
        case 'aircraft':
            editMode = { active: false, type: 'aircraft', id: null };
            showAircraftModal();
            break;
        case 'airport':
            showAirportModal();       // defined below
            break;
        case 'maintenance':
            showMaintenanceModal();   // defined below
            break;
    }
    document.getElementById('modal').classList.add('active');
}

function pilotAddForm() {
    return `
        <form id="pilot-form">
            <div class="form-group"><label>First Name</label><input type="text" id="first_name" required></div>
            <div class="form-group"><label>Last Name</label><input type="text" id="last_name" required></div>
            <div class="form-group"><label>Date of Birth</label><input type="date" id="date_of_birth" required></div>
            <div class="form-group"><label>Gender</label>
                <select id="gender" required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group"><label>License Number</label><input type="text" id="license_number" required></div>
            <div class="form-group"><label>License Type</label>
                <select id="license_type" required>
                    <option value="ATPL">ATPL</option>
                    <option value="CPL">CPL</option>
                    <option value="PPL">PPL</option>
                </select>
            </div>
            <div class="form-group"><label>License Expiry</label><input type="date" id="license_expiry_date" required></div>
            <div class="form-group"><label>Medical Certificate Class</label><input type="text" id="medical_certificate_class" value="A1" required></div>
            <div class="form-group"><label>Medical Certificate Expiry</label><input type="date" id="medical_certificate_expiry" required></div>
            <div class="form-group"><label>Total Flight Hours</label><input type="number" step="0.01" id="total_flight_hours" value="0" required></div>
            <div class="form-group"><label>Current Rank</label>
                <select id="current_rank" required>
                    <option value="Trainee">Trainee</option>
                    <option value="Second Officer">Second Officer</option>
                    <option value="First Officer">First Officer</option>
                    <option value="Captain">Captain</option>
                </select>
            </div>
            <div class="form-group"><label>Employment Status</label>
                <select id="employment_status" required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="OnLeave">On Leave</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Pilot</button>
            </div>
        </form>`;
}

// ============================================
// CREW MEMBERS
// ============================================

async function loadCrewMembers() {
    try {
        const response = await fetch(`${API_URL}/crew-members`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const crew = await response.json();
        const tbody = document.getElementById('crew-tbody');

        tbody.innerHTML = crew.map(c => `
            <tr>
                <td>${c.crew_member_id}</td>
                <td>${safeText(c.first_name)}</td>
                <td>${safeText(c.last_name)}</td>
                <td>${safeText(c.license_number)}</td>
                <td>${safeText(c.current_role)}</td>
                <td><span class="status-badge status-${c.employment_status.toLowerCase()}">${c.employment_status}</span></td>
                <td class="action-buttons">
                    <button class="btn btn-warning btn-small" onclick="editCrewMember(${c.crew_member_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteCrewMember(${c.crew_member_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error("Error loading crew members:", e);
        showNotification("Error loading crew members", "error");
    }
}

function showCrewModal() {
    const editing = editMode.active && editMode.type === 'crew';

    document.getElementById('modal-title').textContent = 
        editing ? 'Edit Crew Member' : 'Add Crew Member';

    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <form id="crew-form">
            <div class="form-group"><label>First Name</label>
                <input type="text" id="crew_first_name" required>
            </div>

            <div class="form-group"><label>Last Name</label>
                <input type="text" id="crew_last_name" required>
            </div>

            <div class="form-group"><label>Date of Birth</label>
                <input type="date" id="crew_date_of_birth" required>
            </div>

            <div class="form-group"><label>Gender</label>
                <select id="crew_gender" required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div class="form-group"><label>License Number</label>
                <input type="text" id="crew_license_number" required>
            </div>

            <div class="form-group"><label>License Expiry</label>
                <input type="date" id="crew_license_expiry_date" required>
            </div>

            <div class="form-group"><label>Medical Certificate Class</label>
                <input type="text" id="crew_medical_certificate_class" value="A2" required>
            </div>

            <div class="form-group"><label>Medical Certificate Expiry</label>
                <input type="date" id="crew_medical_certificate_expiry" required>
            </div>

            <div class="form-group"><label>Current Role</label>
                <select id="crew_current_role" required>
                    <option value="">Select</option>
                    <option value="Flight Assistant">Flight Assistant</option>
                    <option value="Flight Attendant">Flight Attendant</option>
                    <option value="Head Cabin Manager">Head Cabin Manager</option>
                </select>
            </div>

            <div class="form-group"><label>Employment Status</label>
                <select id="crew_employment_status" required>
                    <option value="">Select</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="OnLeave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Retired">Retired</option>
                </select>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    ${editing ? 'Update Crew Member' : 'Create Crew Member'}
                </button>
            </div>
        </form>
    `;

    document.getElementById('crew-form').onsubmit = e => {
        e.preventDefault();
        saveCrewMember();
    };

    document.getElementById('modal').classList.add('active');
}

async function editCrewMember(id) {
    try {
        const resp = await fetch(`${API_URL}/crew-members/${encodeURIComponent(id)}`);

        if (!resp.ok) {
            const r = await readResponse(resp);
            throw new Error(r.message || `HTTP ${resp.status}`);
        }

        const crew = await resp.json();

        editMode = { active: true, type: 'crew', id };

        showCrewModal();

        document.getElementById('crew_first_name').value = safeText(crew.first_name);
        document.getElementById('crew_last_name').value = safeText(crew.last_name);
        document.getElementById('crew_date_of_birth').value = toDateInputValue(crew.date_of_birth);
        document.getElementById('crew_gender').value = crew.gender;
        document.getElementById('crew_license_number').value = safeText(crew.license_number);
        document.getElementById('crew_license_expiry_date').value = toDateInputValue(crew.license_expiry_date);
        document.getElementById('crew_medical_certificate_class').value = crew.medical_certificate_class ?? "A2";
        document.getElementById('crew_medical_certificate_expiry').value = toDateInputValue(crew.medical_certificate_expiry);
        document.getElementById('crew_current_role').value = crew.current_role;
        document.getElementById('crew_employment_status').value = crew.employment_status;

    } catch (e) {
        console.error("Error loading crew member:", e);
        showNotification("Error loading crew member", "error");
    }
}

async function saveCrewMember() {
    try {
        const data = {
            first_name: document.getElementById('crew_first_name')?.value.trim(),
            last_name: document.getElementById('crew_last_name')?.value.trim(),
            date_of_birth: document.getElementById('crew_date_of_birth')?.value,
            gender: document.getElementById('crew_gender')?.value,
            license_number: document.getElementById('crew_license_number')?.value,
            license_expiry_date: document.getElementById('crew_license_expiry_date')?.value,
            medical_certificate_class: document.getElementById('crew_medical_certificate_class')?.value,
            medical_certificate_expiry: document.getElementById('crew_medical_certificate_expiry')?.value,
            current_role: document.getElementById('crew_current_role')?.value,
            employment_status: document.getElementById('crew_employment_status')?.value
        };

        if (!data.first_name || !data.last_name) {
            showNotification("First and Last name are required", "error");
            return;
        }

        const url = editMode.active
            ? `${API_URL}/crew-members/${encodeURIComponent(editMode.id)}`
            : `${API_URL}/crew-members`;

        const method = editMode.active ? 'PUT' : 'POST';

        const resp = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!resp.ok) {
            const r = await readResponse(resp);
            throw new Error(r.message || `HTTP ${resp.status}`);
        }

        const result = await resp.json();

        showNotification(
            result.message ?? (editMode.active ? "Crew member updated" : "Crew member created"),
            "success"
        );

        closeModal();
        loadCrewMembers();
        if (typeof loadDashboard === "function") loadDashboard();

    } catch (e) {
        console.error("Error saving crew member:", e);
        showNotification(`Error saving crew member: ${e.message}`, "error");
    }
}

async function deleteCrewMember(id) {
    if (!confirm("Are you sure you want to delete this crew member?")) return;

    try {
        const resp = await fetch(`${API_URL}/crew-members/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        if (!resp.ok) {
            let msg = `HTTP ${resp.status}`;
            try {
                const j = await resp.json();
                msg = j.message || JSON.stringify(j);
            } catch {}
            throw new Error(msg);
        }

        const data = await resp.json().catch(() => ({}));
        showNotification(data.message ?? "Crew member deleted", "success");

        loadCrewMembers();
        if (typeof loadDashboard === "function") loadDashboard();

    } catch (e) {
        console.error("Error deleting crew member:", e);
        showNotification("Error deleting crew member", "error");
    }
}

// ============================================
// FLIGHTS
// ============================================

async function loadFlights() {
    try {
        const resp = await fetch(`${API_URL}/flights`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const flights = await resp.json();

        const tbody = document.getElementById('flights-tbody');
        tbody.innerHTML = flights.map(f => `
            <tr>
                <td><strong>${safeText(f.flight_number)}</strong></td>
                <td>${safeText(f.departure_airport) || 'N/A'}</td>
                <td>${safeText(f.arrival_airport) || 'N/A'}</td>
                <td>${formatDateTime(f.scheduled_departure_time)}</td>
                <td>${formatDateTime(f.scheduled_arrival_time)}</td>
                <td>${safeText(f.aircraft) || 'N/A'}</td>
                <td><span class="status-badge status-${(f.flight_status||'').toLowerCase().replace(' ', '-')}">
                    ${f.flight_status || 'Unknown'}
                </span></td>
                <td class="action-buttons">
                    <button class="btn btn-warning btn-small" onclick="editFlight(${f.flight_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteFlight(${f.flight_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error("Error loading flights:", e);
        showNotification("Error loading flights", "error");
    }
}

async function showFlightModal() {
    const editing = editMode.active && editMode.type === 'flight';
    document.getElementById('modal-title').textContent = editing ? 'Edit Flight' : 'Add Flight';
    const modalBody = document.getElementById('modal-body');

    // Cargar datos para selects
    const [airports, aircrafts, pilots] = await Promise.all([
        fetch(`${API_URL}/airports`).then(r => r.json()),
        fetch(`${API_URL}/aircraft`).then(r => r.json()),
        fetch(`${API_URL}/pilots`).then(r => r.json())
    ]);

    modalBody.innerHTML = `
        <form id="flight-form">
            <div class="form-group"><label>Flight Number</label>
                <input type="text" id="flight_number" required>
            </div>
            <div class="form-group"><label>Departure Airport</label>
                <select id="departure_airport_id" required>
                    <option value="">Select Airport</option>
                    ${airports.map(a => `<option value="${a.airport_id}">${a.name} (${a.iata_code})</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label>Arrival Airport</label>
                <select id="arrival_airport_id" required>
                    <option value="">Select Airport</option>
                    ${airports.map(a => `<option value="${a.airport_id}">${a.name} (${a.iata_code})</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label>Scheduled Departure</label>
                <input type="datetime-local" id="scheduled_departure_time" required>
            </div>
            <div class="form-group"><label>Scheduled Arrival</label>
                <input type="datetime-local" id="scheduled_arrival_time" required>
            </div>
            <div class="form-group"><label>Aircraft</label>
                <select id="aircraft_id" required>
                    <option value="">Select Aircraft</option>
                    ${aircrafts.map(a => `<option value="${a.aircraft_id}">${a.tail_number} (${a.model})</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label>Pilot Commander</label>
                <select id="pilot_command_id" required>
                    <option value="">Select Pilot</option>
                    ${pilots.map(p => `<option value="${p.pilot_id}">${p.first_name} ${p.last_name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label>First Officer</label>
                <select id="pilot_first_officer_id" required>
                    <option value="">Select Pilot</option>
                    ${pilots.map(p => `<option value="${p.pilot_id}">${p.first_name} ${p.last_name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label>Flight Status</label>
                <select id="flight_status" required>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Departed">Departed</option>
                    <option value="Landed">Landed</option>
                    <option value="Delayed">Delayed</option>
                    <option value="InFlight">In Flight</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${editing ? 'Update Flight' : 'Create Flight'}</button>
            </div>
        </form>
    `;

    // Si estamos editando, llenar los valores
    if (editing && editMode.flight) {
        const f = editMode.flight;
        document.getElementById('flight_number').value = f.flight_number;
        document.getElementById('departure_airport_id').value = f.departure_airport_id;
        document.getElementById('arrival_airport_id').value = f.arrival_airport_id;
        document.getElementById('scheduled_departure_time').value = toDateInputValue(f.scheduled_departure_time);
        document.getElementById('scheduled_arrival_time').value = toDateInputValue(f.scheduled_arrival_time);
        document.getElementById('aircraft_id').value = f.aircraft_id;
        document.getElementById('pilot_command_id').value = f.pilot_command_id;
        document.getElementById('pilot_first_officer_id').value = f.pilot_first_officer_id;
        document.getElementById('flight_status').value = f.flight_status;
    }

    document.getElementById('flight-form').onsubmit = e => { e.preventDefault(); saveFlight(); };
    document.getElementById('modal').classList.add('active');
}

async function editFlight(id) {
    try {
        const resp = await fetch(`${API_URL}/flights/${encodeURIComponent(id)}`);
        if (!resp.ok) {
            const r = await readResponse(resp);
            throw new Error(r.message || `HTTP ${resp.status}`);
        }

        const flight = await resp.json();

        // Guardamos el vuelo en editMode para usarlo en el modal
        editMode = { active: true, type: 'flight', id, flight };

        // Mostramos el modal
        await showFlightModal();

    } catch (e) {
        console.error("Error loading flight:", e);
        showNotification("Error loading flight", "error");
    }
}

async function saveFlight() {
    try {
        const crewSelect = document.getElementById('crew_member_ids');
        const crew_member_ids = crewSelect
            ? Array.from(crewSelect.selectedOptions).map(o => parseInt(o.value))
            : [];

        const data = {
            flight_number: document.getElementById('flight_number').value.trim(),
            departure_airport_id: parseInt(document.getElementById('departure_airport_id').value),
            arrival_airport_id: parseInt(document.getElementById('arrival_airport_id').value),
            scheduled_departure_time: document.getElementById('scheduled_departure_time').value,
            scheduled_arrival_time: document.getElementById('scheduled_arrival_time').value,
            aircraft_id: parseInt(document.getElementById('aircraft_id').value),
            pilot_command_id: parseInt(document.getElementById('pilot_command_id').value),
            pilot_first_officer_id: parseInt(document.getElementById('pilot_first_officer_id').value),
            flight_status: document.getElementById('flight_status').value,
            crew_member_ids  // incluso si está vacío
        };

        const url = editMode.active
            ? `${API_URL}/flights/${encodeURIComponent(editMode.id)}`
            : `${API_URL}/flights`;
        const method = editMode.active ? 'PUT' : 'POST';

        const resp = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!resp.ok) {
            const r = await resp.json().catch(() => ({}));
            throw new Error(r.message || `HTTP ${resp.status}`);
        }

        const result = await resp.json().catch(() => ({}));
        showNotification(result.message ?? (editMode.active ? "Flight updated" : "Flight created"), "success");

        closeModal();
        await loadFlights();
        if (typeof loadDashboard === 'function') loadDashboard();

    } catch (e) {
        console.error("Error saving flight:", e);
        showNotification(`Error saving flight: ${e.message}`, "error");
    }
}

async function deleteFlight(id) {
    if (!confirm("Are you sure you want to delete this flight?")) return;

    try {
        const resp = await fetch(`${API_URL}/flights/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!resp.ok) {
            let msg = `HTTP ${resp.status}`;
            try { const j = await resp.json(); msg = j.message || JSON.stringify(j); } catch {}
            throw new Error(msg);
        }

        const data = await resp.json().catch(() => ({}));
        showNotification(data.message ?? "Flight deleted", "success");

        await loadFlights();
        if (typeof loadDashboard === "function") loadDashboard();

    } catch (e) {
        console.error("Error deleting flight:", e);
        showNotification("Error deleting flight", "error");
    }
}

// ============================================
// AIRCRAFT
// ============================================

async function loadAircraft() {
    try {
        const aircraft = await fetch(`${API_URL}/aircraft`).then(r => r.json());
        const tbody = document.getElementById('aircraft-tbody');
        tbody.innerHTML = aircraft.map(a => `
            <tr>
                <td><strong>${a.tail_number}</strong></td>
                <td>${a.aircraft_model}</td>
                <td>${a.manufacturer}</td>
                <td>${a.year_of_manufacture}</td>
                <td>${a.seating_capacity} pax</td>
                <td><span class="status-badge status-${a.status.toLowerCase().replace(' ', '-')}">${a.status}</span></td>
                <td>${formatDate(a.next_maintenance_date)}</td>
                <td class="action-buttons">
                    <button class="btn btn-warning btn-small" onclick="editAircraft(${a.aircraft_id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-small" onclick="deleteAircraft(${a.aircraft_id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('');
    } catch (e) { showNotification('Error loading aircraft', 'error'); }
}

async function showAircraftModal() {
    const editing = editMode.active && editMode.type === 'aircraft';
    document.getElementById('modal-title').textContent = editing ? 'Edit Aircraft' : 'Add Aircraft';
    const modalBody = document.getElementById('modal-body');

    try {
        // Cargar aeropuertos para "assigned_base_airport_id"
        const airports = await fetch(`${API_URL}/airports`).then(r => r.json());

        modalBody.innerHTML = `
            <form id="aircraft-form">
                <div class="form-group"><label>Tail Number</label>
                    <input type="text" id="tail_number" required>
                </div>
                <div class="form-group"><label>Model</label>
                    <input type="text" id="aircraft_model" required>
                </div>
                <div class="form-group"><label>Manufacturer</label>
                    <input type="text" id="manufacturer" required>
                </div>
                <div class="form-group"><label>Year of Manufacture</label>
                    <input type="number" id="year_of_manufacture" required>
                </div>
                <div class="form-group"><label>Seating Capacity</label>
                    <input type="number" id="seating_capacity" required>
                </div>
                <div class="form-group"><label>Cargo Capacity (kg)</label>
                    <input type="number" step="0.01" id="cargo_capacity" required>
                </div>
                <div class="form-group"><label>Status</label>
                    <select id="status" required>
                        <option value="Operational">Operational</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="ScheduledMaintenance">Scheduled Maintenance</option>
                        <option value="OutOfService">Out of Service</option>
                    </select>
                </div>
                <div class="form-group"><label>Last Maintenance Date</label>
                    <input type="date" id="last_maintenance_date" required>
                </div>
                <div class="form-group"><label>Next Maintenance Date</label>
                    <input type="date" id="next_maintenance_date" required>
                </div>
                <div class="form-group"><label>Assigned Base Airport</label>
                    <select id="assigned_base_airport_id" required>
                        <option value="">Select Airport</option>
                        ${airports.map(a => `<option value="${a.airport_id}">${a.name} (${a.iata_code})</option>`).join('')}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${editing ? 'Update Aircraft' : 'Create Aircraft'}</button>
                </div>
            </form>
        `;

        // Si estamos editando, rellenamos los valores
        if (editing && editMode.aircraft) {
            const a = editMode.aircraft;
            document.getElementById('tail_number').value = a.tail_number;
            document.getElementById('aircraft_model').value = a.aircraft_model;
            document.getElementById('manufacturer').value = a.manufacturer;
            document.getElementById('year_of_manufacture').value = a.year_of_manufacture;
            document.getElementById('seating_capacity').value = a.seating_capacity;
            document.getElementById('cargo_capacity').value = a.cargo_capacity;
            document.getElementById('status').value = a.status;
            document.getElementById('last_maintenance_date').value = a.last_maintenance_date;
            document.getElementById('next_maintenance_date').value = a.next_maintenance_date;
            document.getElementById('assigned_base_airport_id').value = a.assigned_base_airport_id;
        }

        document.getElementById('aircraft-form').onsubmit = e => { e.preventDefault(); saveAircraft(); };
        document.getElementById('modal').classList.add('active');

    } catch (err) {
        console.error("Error preparing aircraft modal:", err);
        showNotification("Error loading aircraft form", "error");
    }
}

async function editAircraft(id) {
    try {
        const resp = await fetch(`${API_URL}/aircraft/${encodeURIComponent(id)}`);
        if (!resp.ok) {
            const r = await resp.json().catch(() => ({}));
            throw new Error(r.message || `HTTP ${resp.status}`);
        }
        const aircraft = await resp.json();
        editMode = { active: true, type: 'aircraft', id, aircraft };
        await showAircraftModal();
    } catch (e) {
        console.error("Error loading aircraft:", e);
        showNotification("Error loading aircraft", "error");
    }
}

async function saveAircraft() {
    const data = {
        tail_number: document.getElementById('tail_number').value,
        aircraft_model: document.getElementById('aircraft_model').value,
        manufacturer: document.getElementById('manufacturer').value,
        year_of_manufacture: parseInt(document.getElementById('year_of_manufacture').value),
        seating_capacity: parseInt(document.getElementById('seating_capacity').value),
        status: document.getElementById('status').value,
        next_maintenance_date: document.getElementById('next_maintenance_date').value
    };
    try {
        const url = editMode.active ? `${API_URL}/aircraft/${editMode.id}` : `${API_URL}/aircraft`;
        const method = editMode.active ? 'PUT' : 'POST';
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await resp.json();
        showNotification(result.message, 'success');
        closeModal();
        loadAircraft();
        loadDashboard();
    } catch (e) { showNotification('Error saving aircraft', 'error'); }
}

async function deleteAircraft(id) {
    if (!confirm('Are you sure you want to delete this aircraft?')) return;
    try {
        const resp = await fetch(`${API_URL}/aircraft/${id}`, { method: 'DELETE' });
        const data = await resp.json();
        showNotification(data.message, 'success');
        loadAircraft();
    } catch (e) { showNotification('Error deleting aircraft', 'error'); }
}

// ============================================
// AIRPORTS
// ============================================

async function loadAirports() {
    try {
        const airports = await fetch(`${API_URL}/airports`).then(r => r.json());
        const tbody = document.getElementById('airports-tbody');
        tbody.innerHTML = airports.map(a => `
            <tr>
                <td><strong>${a.iata_code}</strong></td>
                <td>${a.icao_code}</td>
                <td>${a.city}</td>
                <td>${a.country}</td>
                <td>${a.number_of_runways}</td>
                <td>${a.number_of_hangars}</td>
                <td>${a.number_of_parkings}</td>
                <td class="action-buttons">
                    <button class="btn btn-warning btn-small" onclick="editAirport(${a.airport_id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-small" onclick="deleteAirport(${a.airport_id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('');
    } catch (e) { showNotification('Error loading airports', 'error'); }
}

/* ----- Add / Edit Modal ----- */
function showAirportModal() {
    document.getElementById('modal-title').textContent = editMode.active ? 'Edit Airport' : 'Add Airport';
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <form id="airport-form">
            <div class="form-group"><label>IATA Code</label><input type="text" id="iata_code" maxlength="3" required></div>
            <div class="form-group"><label>ICAO Code</label><input type="text" id="icao_code" maxlength="4" required></div>
            <div class="form-group"><label>City</label><input type="text" id="city" required></div>
            <div class="form-group"><label>Country</label><input type="text" id="country" required></div>
            <div class="form-group"><label>Number of Runways</label><input type="number" id="number_of_runways" required></div>
            <div class="form-group"><label>Number of Hangars</label><input type="number" id="number_of_hangars" required></div>
            <div class="form-group"><label>Number of Parking Stands</label><input type="number" id="number_of_parkings" required></div>
            <div class="form-actions">
                <button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${editMode.active ? 'Update' : 'Create'} Airport</button>
            </div>
        </form>`;
    document.getElementById('airport-form').onsubmit = e => { e.preventDefault(); saveAirport(); };
}

async function editAirport(id) {
    try {
        const ap = await fetch(`${API_URL}/airports/${id}`).then(r => r.json());
        editMode = { active: true, type: 'airport', id };
        showAirportModal();
        document.getElementById('iata_code').value = ap.iata_code;
        document.getElementById('icao_code').value = ap.icao_code;
        document.getElementById('city').value = ap.city;
        document.getElementById('country').value = ap.country;
        document.getElementById('number_of_runways').value = ap.number_of_runways;
        document.getElementById('number_of_hangars').value = ap.number_of_hangars;
        document.getElementById('number_of_parkings').value = ap.number_of_parkings;
    } catch (e) { showNotification('Error loading airport', 'error'); }
}

async function saveAirport() {
    const data = {
        iata_code: document.getElementById('iata_code').value.toUpperCase(),
        icao_code: document.getElementById('icao_code').value.toUpperCase(),
        city: document.getElementById('city').value,
        country: document.getElementById('country').value,
        number_of_runways: parseInt(document.getElementById('number_of_runways').value),
        number_of_hangars: parseInt(document.getElementById('number_of_hangars').value),
        number_of_parkings: parseInt(document.getElementById('number_of_parkings').value)
    };
    try {
        const url = editMode.active ? `${API_URL}/airports/${editMode.id}` : `${API_URL}/airports`;
        const method = editMode.active ? 'PUT' : 'POST';
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await resp.json();
        showNotification(result.message, 'success');
        closeModal();
        loadAirports();
    } catch (e) { showNotification('Error saving airport', 'error'); }
}

async function deleteAirport(id) {
    if (!confirm('Are you sure you want to delete this airport?')) return;
    try {
        const resp = await fetch(`${API_URL}/airports/${id}`, { method: 'DELETE' });
        const data = await resp.json();
        showNotification(data.message, 'success');
        loadAirports();
    } catch (e) { showNotification('Error deleting airport', 'error'); }
}

// ============================================
// MAINTENANCE
// ============================================

async function loadMaintenance() {
    try {
        const [maintenance, aircraft] = await Promise.all([
            fetch(`${API_URL}/maintenance`).then(r => r.json()),
            fetch(`${API_URL}/aircraft`).then(r => r.json())
        ]);
        const tbody = document.getElementById('maintenance-tbody');
        tbody.innerHTML = maintenance.map(e => {
            const ac = aircraft.find(a => a.aircraft_id === e.aircraft_id);
            return `
                <tr>
                    <td>${e.maintenance_event_id}</td>
                    <td><strong>${ac ? ac.tail_number : 'N/A'}</strong></td>
                    <td>${e.maintenance_type}</td>
                    <td>${formatDateTime(e.start_date_time)}</td>
                    <td>${e.end_date_time ? formatDateTime(e.end_date_time) : 'In progress'}</td>
                    <td><span class="status-badge status-${e.maintenance_status.toLowerCase().replace(' ', '-')}">${e.maintenance_status}</span></td>
                    <td>${e.cost ? '$' + parseFloat(e.cost).toLocaleString() : 'N/A'}</td>
                    <td class="action-buttons">
                        <button class="btn btn-warning btn-small" onclick="editMaintenance(${e.maintenance_event_id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-small" onclick="deleteMaintenance(${e.maintenance_event_id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        }).join('');
    } catch (e) { showNotification('Error loading maintenance', 'error'); }
}

/* ----- Add / Edit Modal ----- */
function showMaintenanceModal() {
    document.getElementById('modal-title').textContent = editMode.active ? 'Edit Maintenance' : 'Add Maintenance';
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <form id="maintenance-form">
            <div class="form-group"><label>Aircraft ID</label><input type="number" id="aircraft_id" required></div>
            <div class="form-group"><label>Maintenance Type</label><input type="text" id="maintenance_type" required></div>
            <div class="form-group"><label>Start Date/Time</label><input type="datetime-local" id="start_date_time" required></div>
            <div class="form-group"><label>End Date/Time (optional)</label><input type="datetime-local" id="end_date_time"></div>
            <div class="form-group"><label>Status</label>
                <select id="maintenance_status" required>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>
            <div class="form-group"><label>Cost (USD)</label><input type="number" step="0.01" id="cost"></div>
            <div class="form-actions">
                <button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${editMode.active ? 'Update' : 'Create'} Maintenance</button>
            </div>
        </form>`;
    document.getElementById('maintenance-form').onsubmit = e => { e.preventDefault(); saveMaintenance(); };
}

async function editMaintenance(id) {
    try {
        const ev = await fetch(`${API_URL}/maintenance/${id}`).then(r => r.json());
        editMode = { active: true, type: 'maintenance', id };
        showMaintenanceModal();
        document.getElementById('aircraft_id').value = ev.aircraft_id;
        document.getElementById('maintenance_type').value = ev.maintenance_type;
        document.getElementById('start_date_time').value = ev.start_date_time.slice(0,16);
        if (ev.end_date_time) document.getElementById('end_date_time').value = ev.end_date_time.slice(0,16);
        document.getElementById('maintenance_status').value = ev.maintenance_status;
        if (ev.cost) document.getElementById('cost').value = ev.cost;
    } catch (e) { showNotification('Error loading maintenance event', 'error'); }
}

async function saveMaintenance() {
    const data = {
        aircraft_id: parseInt(document.getElementById('aircraft_id').value),
        maintenance_type: document.getElementById('maintenance_type').value,
        start_date_time: document.getElementById('start_date_time').value,
        end_date_time: document.getElementById('end_date_time').value || null,
        maintenance_status: document.getElementById('maintenance_status').value,
        cost: document.getElementById('cost').value ? parseFloat(document.getElementById('cost').value) : null
    };
    try {
        const url = editMode.active ? `${API_URL}/maintenance/${editMode.id}` : `${API_URL}/maintenance`;
        const method = editMode.active ? 'PUT' : 'POST';
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await resp.json();
        showNotification(result.message, 'success');
        closeModal();
        loadMaintenance();
        loadDashboard();
    } catch (e) { showNotification('Error saving maintenance', 'error'); }
}

async function deleteMaintenance(id) {
    if (!confirm('Are you sure you want to delete this maintenance event?')) return;
    try {
        const resp = await fetch(`${API_URL}/maintenance/${id}`, { method: 'DELETE' });
        const data = await resp.json();
        showNotification(data.message, 'success');
        loadMaintenance();
    } catch (e) { showNotification('Error deleting maintenance event', 'error'); }
}

// ============================================
// REPORTS (English)
// ============================================

async function loadReports() {
    try {
        const [pilots, flights, maintenance, aircraft] = await Promise.all([
            fetch(`${API_URL}/pilots`).then(r => r.json()),
            fetch(`${API_URL}/flights`).then(r => r.json()),
            fetch(`${API_URL}/maintenance`).then(r => r.json()),
            fetch(`${API_URL}/aircraft`).then(r => r.json())
        ]);

        // Flight statistics
        document.getElementById('flight-stats').innerHTML = `
            <div class="report-item"><span>Total flights:</span><strong>${flights.length}</strong></div>
            <div class="report-item"><span>Scheduled:</span><strong>${flights.filter(f => f.flight_status === 'Scheduled').length}</strong></div>
            <div class="report-item"><span>Landed:</span><strong>${flights.filter(f => f.flight_status === 'Landed').length}</strong></div>
            <div class="report-item"><span>Cancelled:</span><strong>${flights.filter(f => f.flight_status === 'Cancelled').length}</strong></div>`;

        // Pilot statistics
        const totalHours = pilots.reduce((s, p) => s + parseFloat(p.total_flight_hours || 0), 0);
        document.getElementById('pilot-stats').innerHTML = `
            <div class="report-item"><span>Total pilots:</span><strong>${pilots.length}</strong></div>
            <div class="report-item"><span>Active pilots:</span><strong>${pilots.filter(p => p.employment_status === 'Active').length}</strong></div>
            <div class="report-item"><span>Captains:</span><strong>${pilots.filter(p => p.current_rank === 'Captain').length}</strong></div>
            <div class="report-item"><span>Total flight hours:</span><strong>${totalHours.toLocaleString()} hrs</strong></div>`;

        // Maintenance costs
        const totalCost = maintenance.reduce((s, m) => s + parseFloat(m.cost || 0), 0);
        document.getElementById('maintenance-costs').innerHTML = `
            <div class="report-item"><span>Total events:</span><strong>${maintenance.length}</strong></div>
            <div class="report-item"><span>In progress:</span><strong>${maintenance.filter(m => ['In Progress','InProgress'].includes(m.maintenance_status)).length}</strong></div>
            <div class="report-item"><span>Completed:</span><strong>${maintenance.filter(m => m.maintenance_status === 'Completed').length}</strong></div>
            <div class="report-item"><span>Total cost:</span><strong>$${totalCost.toLocaleString()}</strong></div>`;

        // Fleet status
        document.getElementById('fleet-status').innerHTML = `
            <div class="report-item"><span>Total aircraft:</span><strong>${aircraft.length}</strong></div>
            <div class="report-item"><span>Operational:</span><strong>${aircraft.filter(a => a.status === 'Operational').length}</strong></div>
            <div class="report-item"><span>In maintenance:</span><strong>${aircraft.filter(a => a.status === 'In Maintenance').length}</strong></div>
            <div class="report-item"><span>Out of service:</span><strong>${aircraft.filter(a => a.status === 'Out of Service').length}</strong></div>`;
    } catch (e) { showNotification('Error loading reports', 'error'); }
}

// ============================================
// HELPERS
// ============================================

function formatDate(dateStr) { return dateStr ? new Date(dateStr).toLocaleDateString('en-US') : 'N/A'; }
function formatDateTime(dateStr) { return dateStr ? new Date(dateStr).toLocaleString('en-US') : 'N/A'; }

function showNotification(message, type = 'success') {
    const n = document.getElementById('notification');
    n.textContent = message;
    n.className = `notification ${type} show`;
    setTimeout(() => n.classList.remove('show'), 3000);
}

function toDateInputValue(val) {
    if (!val) return '';
    // Si ya es YYYY-MM-DD, devuélvelo
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (isNaN(d)) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
}

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function safeText(v){ return escapeHtml(v ?? ''); }

async function readResponse(resp){
    try { return await resp.json(); } catch(e){
        try { return { message: await resp.text() }; } catch(e2) { return { message: 'Unknown response' }; }
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}