// Data storage
let currentWeekStart = new Date(2025, 10, 24); // Nov 24, 2025 (Monday)
let slots = [];
let exceptions = [];
let editingSlotId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    renderWeekDisplay();
    attachEventListeners();
    updateWeekUsage();
});

// Event Listeners
function attachEventListeners() {
    // Week navigation
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderCalendar();
        renderWeekDisplay();
        renderSlotsTable();
    });

    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderCalendar();
        renderWeekDisplay();
        renderSlotsTable();
    });

    // Buttons
    document.getElementById('copyLastWeek').addEventListener('click', copyLastWeek);
    document.getElementById('bulkDeleteUnpublished').addEventListener('click', bulkDeleteUnpublished);
    document.getElementById('addSlotBtn').addEventListener('click', () => openSlotModal());
    document.getElementById('publishAllBtn').addEventListener('click', publishAll);
    document.getElementById('addExceptionBtn').addEventListener('click', openExceptionModal);

    // Modal controls
    document.getElementById('cancelSlotBtn').addEventListener('click', closeSlotModal);
    document.getElementById('slotForm').addEventListener('submit', saveSlot);
    document.getElementById('cancelExceptionBtn').addEventListener('click', closeExceptionModal);
    document.getElementById('exceptionForm').addEventListener('submit', saveException);

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = '/login.html';
    });
}

// Week Display
function renderWeekDisplay() {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const options = { month: 'short', day: 'numeric' };
    const startStr = currentWeekStart.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', options);
    const year = currentWeekStart.getFullYear();

    document.getElementById('weekDisplay').textContent = `${startStr} - ${endStr}, ${year}`;
}

// Calendar Rendering
function renderCalendar() {
    const container = document.getElementById('calendarContainer');

    // Create wrapper for scrolling
    const wrapper = document.createElement('div');
    wrapper.className = 'calendar-wrapper';

    // Create table
    const table = document.createElement('table');
    table.className = 'calendar';

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Time column header
    const timeHeader = document.createElement('th');
    timeHeader.className = 'time-header';
    timeHeader.textContent = 'Time';
    headerRow.appendChild(timeHeader);

    // Day headers
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayDates = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        dayDates.push(date);

        const th = document.createElement('th');
        th.innerHTML = `
                    <div>${days[i]}</div>
                    <div style="font-size: 12px; color: #94a3b8; font-weight: 400; margin-top: 4px;">
                        ${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                `;
        headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');

    // Time rows (7 AM to 9 PM)
    for (let hour = 7; hour <= 21; hour++) {
        const row = document.createElement('tr');

        // Time cell
        const timeCell = document.createElement('td');
        timeCell.className = 'time-cell';
        timeCell.textContent = `${hour.toString().padStart(2, '0')}:00`;
        row.appendChild(timeCell);

        // Day cells
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const cell = document.createElement('td');
            cell.className = 'day-cell';
            cell.dataset.day = days[dayIndex];
            cell.dataset.hour = hour;
            cell.dataset.date = dayDates[dayIndex].toISOString().split('T')[0];

            // Check for slots that START in this hour
            const cellSlots = getSlotsStartingInCell(days[dayIndex], hour, dayDates[dayIndex]);

            if (cellSlots.length > 0) {
                cell.classList.add('has-slots');
                cellSlots.forEach(slot => {
                    const slotDiv = createSlotElement(slot, hour);
                    cell.appendChild(slotDiv);
                });
            }

            // Add click handler for empty cells
            cell.onclick = (e) => {
                if (e.target === cell) {
                    openSlotModal(days[dayIndex], hour, dayDates[dayIndex]);
                }
            };

            row.appendChild(cell);
        }

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    wrapper.appendChild(table);
    container.innerHTML = '';
    container.appendChild(wrapper);
}

function createSlotElement(slot, cellHour) {
    const slotDiv = document.createElement('div');
    slotDiv.className = `slot ${slot.status}`;

    // Parse start time
    const [startHour, startMinute] = slot.startTime.split(':').map(Number);
    const duration = parseInt(slot.duration);

    // Calculate position and height
    const cellHeight = 80; // Height of each hour cell in pixels
    const minutesIntoHour = startMinute;
    const topPosition = (minutesIntoHour / 60) * cellHeight;
    const height = (duration / 60) * cellHeight;

    // Set position and size
    slotDiv.style.top = `${topPosition}px`;
    slotDiv.style.height = `${height}px`;

    // Content
    slotDiv.innerHTML = `
                <div class="slot-time">${slot.startTime}</div>
                <div class="slot-details">${slot.duration}m • ${slot.mode}</div>
                ${duration >= 60 ? `<div class="slot-details">${slot.capacity} students</div>` : ''}
            `;

    slotDiv.onclick = (e) => {
        e.stopPropagation();
        if (slot.status !== 'booked') {
            editSlot(slot.id);
        } else {
            showAlert('Cannot edit booked sessions', 'warning');
        }
    };

    return slotDiv;
}

function getSlotsStartingInCell(day, hour, date) {
    return slots.filter(slot => {
        // Check if slot matches the day
        if (slot.day !== day) return false;

        // Weekly recurring: hiển thị ở mọi tuần
        if (slot.recurrence === 'weekly') {
            // Chỉ cần check ngày trong tuần khớp
            const slotHour = parseInt(slot.startTime.split(':')[0]);
            return slotHour === hour;
        }

        // One-time: chỉ hiển thị ở ngày cụ thể
        if (slot.recurrence === 'once' && slot.date) {
            const slotDate = new Date(slot.date);
            const cellDate = new Date(date);
            if (slotDate.toDateString() !== cellDate.toDateString()) return false;

            const slotHour = parseInt(slot.startTime.split(':')[0]);
            return slotHour === hour;
        }

        return false;
    });
}

function getSlotsForCell(day, hour, date) {
    return getSlotsStartingInCell(day, hour, date);
}

function isSlotInCurrentWeek(slot) {
    // Weekly recurring slots xuất hiện ở mọi tuần
    if (slot.recurrence === 'weekly') {
        return true;
    }

    // One-time slots chỉ xuất hiện ở tuần cụ thể
    if (slot.date) {
        const slotDate = new Date(slot.date);
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return slotDate >= currentWeekStart && slotDate < weekEnd;
    }

    return false;
}

// Slots Table
function renderSlotsTable() {
    const tbody = document.getElementById('slotsTableBody');

    // Lọc slots: weekly recurring + one-time trong tuần này
    const weekSlots = slots.filter(slot => {
        if (slot.recurrence === 'weekly') return true;
        return isSlotInCurrentWeek(slot);
    });

    if (weekSlots.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 40px; color: #64748b;">No availability slots configured for this week</td></tr>';
        return;
    }

    tbody.innerHTML = weekSlots.map(slot => `
                <tr>
                    <td>${slot.day}</td>
                    <td>${slot.startTime}</td>
                    <td>${slot.duration} min</td>
                    <td><span class="badge ${slot.mode}">${slot.mode}</span></td>
                    <td>${slot.location || 'N/A'}</td>
                    <td>${slot.capacity}</td>
                    <td>${slot.leadTime}h</td>
                    <td>${slot.cancelWindow}h</td>
                    <td><span class="badge ${slot.published ? 'published' : 'unpublished'}">${slot.published ? 'Published' : 'Unpublished'}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn secondary" onclick="editSlot(${slot.id})">Edit</button>
                            <button class="btn danger" onclick="deleteSlot(${slot.id})">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');

    updateWeekUsage();
}

// Exceptions Table
function renderExceptionsTable() {
    const tbody = document.getElementById('exceptionsTableBody');

    if (exceptions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px; color: #64748b;">No exceptions configured</td></tr>';
        return;
    }

    tbody.innerHTML = exceptions.map(exc => `
                <tr>
                    <td>${exc.startDate} ${exc.startTime || ''} - ${exc.endDate} ${exc.endTime || ''}</td>
                    <td>${exc.reason || 'No reason provided'}</td>
                    <td>
                        <button class="btn danger" onclick="deleteException(${exc.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
}

// Modal Functions
function openSlotModal(day = '', hour = null, date = null) {
    editingSlotId = null;
    document.getElementById('slotForm').reset();

    if (day) {
        document.getElementById('slotDay').value = day;
    }
    if (hour !== null) {
        document.getElementById('startTime').value = `${hour.toString().padStart(2, '0')}:00`;
    }
    if (date) {
        document.getElementById('slotDate').value = date.toISOString().split('T')[0];
    }

    document.querySelector('#slotModal .modal-header').textContent = 'Add Availability Slot';
    document.getElementById('slotModal').classList.add('active');
}

function closeSlotModal() {
    document.getElementById('slotModal').classList.remove('active');
    editingSlotId = null;
}

function openExceptionModal() {
    document.getElementById('exceptionForm').reset();
    document.getElementById('exceptionModal').classList.add('active');
}

function closeExceptionModal() {
    document.getElementById('exceptionModal').classList.remove('active');
}

// Save Slot
function saveSlot(e) {
    e.preventDefault();

    const slotData = {
        id: editingSlotId || Date.now(),
        day: document.getElementById('slotDay').value,
        date: document.getElementById('slotDate').value || null,
        startTime: document.getElementById('startTime').value,
        duration: document.getElementById('duration').value,
        mode: document.getElementById('mode').value,
        location: document.getElementById('location').value,
        capacity: document.getElementById('capacity').value,
        leadTime: document.getElementById('leadTime').value,
        cancelWindow: document.getElementById('cancelWindow').value,
        recurrence: document.getElementById('recurrence').value,
        published: false,
        status: 'available'
    };

    // Validation
    const hour = parseInt(slotData.startTime.split(':')[0]);
    if (hour < 7 || hour >= 22) {
        showAlert('Error: Slots must be between 7:00 and 22:00', 'error');
        return;
    }

    // Check daily limit (chỉ check cho weekly recurring)
    if (slotData.recurrence === 'weekly') {
        const daySlots = slots.filter(s =>
            s.day === slotData.day &&
            s.recurrence === 'weekly'
        );
        if (daySlots.length >= 8 && !editingSlotId) {
            showAlert('Error: Maximum 8 weekly recurring slots per day reached', 'error');
            return;
        }
    }

    // Check weekly limit (chỉ check cho weekly recurring)
    if (slotData.recurrence === 'weekly') {
        const weeklySlots = slots.filter(s => s.recurrence === 'weekly');
        if (weeklySlots.length >= 30 && !editingSlotId) {
            showAlert('Error: Maximum 30 weekly recurring slots reached', 'error');
            return;
        }
    }

    if (editingSlotId) {
        const index = slots.findIndex(s => s.id === editingSlotId);
        slots[index] = slotData;
        showAlert('Slot updated successfully', 'success');
    } else {
        slots.push(slotData);
        showAlert('Slot added successfully', 'success');
    }

    renderCalendar();
    renderSlotsTable();
    closeSlotModal();
}

// Edit Slot
function editSlot(id) {
    const slot = slots.find(s => s.id === id);
    if (!slot) return;

    editingSlotId = id;
    document.getElementById('slotDay').value = slot.day;
    document.getElementById('slotDate').value = slot.date || '';
    document.getElementById('startTime').value = slot.startTime;
    document.getElementById('duration').value = slot.duration;
    document.getElementById('mode').value = slot.mode;
    document.getElementById('location').value = slot.location;
    document.getElementById('capacity').value = slot.capacity;
    document.getElementById('leadTime').value = slot.leadTime;
    document.getElementById('cancelWindow').value = slot.cancelWindow;
    document.getElementById('recurrence').value = slot.recurrence;

    document.querySelector('#slotModal .modal-header').textContent = 'Edit Availability Slot';
    document.getElementById('slotModal').classList.add('active');
}

// Delete Slot
function deleteSlot(id) {
    if (confirm('Are you sure you want to delete this slot?')) {
        slots = slots.filter(s => s.id !== id);
        showAlert('Slot deleted successfully', 'success');
        renderCalendar();
        renderSlotsTable();
    }
}

// Save Exception
function saveException(e) {
    e.preventDefault();

    const exceptionData = {
        id: Date.now(),
        startDate: document.getElementById('exceptionStartDate').value,
        endDate: document.getElementById('exceptionEndDate').value,
        startTime: document.getElementById('exceptionStartTime').value,
        endTime: document.getElementById('exceptionEndTime').value,
        reason: document.getElementById('exceptionReason').value
    };

    exceptions.push(exceptionData);
    showAlert('Exception added successfully', 'success');
    renderExceptionsTable();
    closeExceptionModal();
}

// Delete Exception
function deleteException(id) {
    if (confirm('Are you sure you want to delete this exception?')) {
        exceptions = exceptions.filter(e => e.id !== id);
        showAlert('Exception deleted successfully', 'success');
        renderExceptionsTable();
    }
}

// Copy Last Week
function copyLastWeek() {
    if (confirm('Copy all slots from last week to current week?')) {
        const lastWeekStart = new Date(currentWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const lastWeekSlots = slots.filter(slot => {
            if (slot.date) {
                const slotDate = new Date(slot.date);
                const weekEnd = new Date(lastWeekStart);
                weekEnd.setDate(weekEnd.getDate() + 7);
                return slotDate >= lastWeekStart && slotDate < weekEnd;
            }
            return false;
        });

        lastWeekSlots.forEach(slot => {
            const newSlot = { ...slot };
            newSlot.id = Date.now() + Math.random();
            if (newSlot.date) {
                const newDate = new Date(newSlot.date);
                newDate.setDate(newDate.getDate() + 7);
                newSlot.date = newDate.toISOString().split('T')[0];
            }
            newSlot.published = false;
            slots.push(newSlot);
        });

        showAlert(`${lastWeekSlots.length} slots copied from last week`, 'success');
        renderCalendar();
        renderSlotsTable();
    }
}

// Bulk Delete Unpublished
function bulkDeleteUnpublished() {
    const unpublished = slots.filter(s => {
        if (!s.published) {
            // Weekly recurring hoặc one-time trong tuần này
            if (s.recurrence === 'weekly') return true;
            return isSlotInCurrentWeek(s);
        }
        return false;
    });

    if (unpublished.length === 0) {
        showAlert('No unpublished slots to delete', 'warning');
        return;
    }

    if (confirm(`Delete ${unpublished.length} unpublished slots?`)) {
        // Xóa các slot unpublished
        const idsToDelete = unpublished.map(s => s.id);
        slots = slots.filter(s => !idsToDelete.includes(s.id));

        showAlert(`${unpublished.length} unpublished slots deleted`, 'success');
        renderCalendar();
        renderSlotsTable();
    }
}

// Publish All
function publishAll() {
    const unpublished = slots.filter(s => {
        if (!s.published) {
            if (s.recurrence === 'weekly') return true;
            return isSlotInCurrentWeek(s);
        }
        return false;
    });

    if (unpublished.length === 0) {
        showAlert('No unpublished slots to publish', 'warning');
        return;
    }

    unpublished.forEach(slot => {
        slot.published = true;
    });

    showAlert(`${unpublished.length} slots published successfully`, 'success');
    renderCalendar();
    renderSlotsTable();
}

// Update Week Usage
function updateWeekUsage() {
    const weekSlots = slots.filter(s => {
        // Đếm cả weekly recurring và one-time slots trong tuần này
        if (s.recurrence === 'weekly') return true;
        return isSlotInCurrentWeek(s);
    });
    const count = weekSlots.length;
    const usageItem = document.getElementById('weekUsageItem');

    document.getElementById('weekUsage').textContent = `${count} / 30`;

    usageItem.classList.remove('warning', 'danger');
    if (count >= 30) {
        usageItem.classList.add('danger');
    } else if (count >= 24) {
        usageItem.classList.add('warning');
    }
}

// Tab Switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tabName === 'availability') {
        document.getElementById('availabilityTab').classList.add('active');
        renderSlotsTable();
    } else if (tabName === 'exceptions') {
        document.getElementById('exceptionsTab').classList.add('active');
        renderExceptionsTable();
    }
}

// Show Alert
function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = `alert ${type} active`;

    setTimeout(() => {
        alertBox.classList.remove('active');
    }, 5000);
}

// Demo data for testing
function loadDemoData() {
    slots = [
        {
            id: 1,
            day: 'Monday',
            startTime: '09:00',
            duration: '60',
            mode: 'online',
            location: '',
            capacity: '1',
            leadTime: '24',
            cancelWindow: '12',
            recurrence: 'weekly',
            published: true,
            status: 'available'
        },
        {
            id: 2,
            day: 'Monday',
            startTime: '14:00',
            duration: '60',
            mode: 'offline',
            location: 'Room B1-101',
            capacity: '2',
            leadTime: '24',
            cancelWindow: '12',
            recurrence: 'weekly',
            published: false,
            status: 'available'
        },
        {
            id: 3,
            day: 'Wednesday',
            startTime: '10:00',
            duration: '90',
            mode: 'online',
            location: '',
            capacity: '1',
            leadTime: '48',
            cancelWindow: '24',
            recurrence: 'weekly',
            published: true,
            status: 'booked'
        }
    ];

    renderCalendar();
    renderSlotsTable();
}

// Uncomment to load demo data
loadDemoData();