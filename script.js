// Navigation functions
function GoToRoutine() {
  window.location.href = "daily.routine.html";
}

function tornaAllaHome() {
  window.location.href = "index.html";
}

// Day selector - Show/hide schedules based on day
function showDay(day) {
  // Update active button
  const buttons = document.querySelectorAll('.day-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  // Hide all schedules
  document.querySelector('.schedule-gym').classList.remove('active');
  document.querySelector('.schedule-gf').classList.remove('active');

  // Show appropriate schedule
  const gymDays = ['lun', 'mar', 'ven'];
  const gfDays = ['mer', 'gio', 'sab', 'dom'];

  if (gymDays.includes(day)) {
    document.querySelector('.schedule-gym').classList.add('active');
  } else if (gfDays.includes(day)) {
    document.querySelector('.schedule-gf').classList.add('active');
  }

  // Save selected day
  localStorage.setItem('selectedDay', day);
}

// Toggle task completion
function toggleComplete(button) {
  const timeBlock = button.closest('.time-block');
  timeBlock.classList.toggle('completed');

  // Save completion state
  saveCompletionState();
}

// Save completion state to localStorage
function saveCompletionState() {
  const completed = [];
  document.querySelectorAll('.time-block.completed').forEach(block => {
    const time = block.querySelector('.time').textContent;
    const activity = block.querySelector('.activity').textContent;
    completed.push(`${time}-${activity}`);
  });

  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(`completed-${today}`, JSON.stringify(completed));
}

// Load completion state from localStorage
function loadCompletionState() {
  const today = new Date().toISOString().split('T')[0];
  const completed = JSON.parse(localStorage.getItem(`completed-${today}`) || '[]');

  document.querySelectorAll('.time-block').forEach(block => {
    const time = block.querySelector('.time')?.textContent;
    const activity = block.querySelector('.activity')?.textContent;
    if (time && activity && completed.includes(`${time}-${activity}`)) {
      block.classList.add('completed');
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Set current day
  const days = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  const today = days[new Date().getDay()];

  // Check if there's a saved day, otherwise use today
  const savedDay = localStorage.getItem('selectedDay') || today;

  // Click the appropriate day button
  const dayButtons = document.querySelectorAll('.day-btn');
  dayButtons.forEach(btn => {
    if (btn.textContent.toLowerCase() === savedDay) {
      btn.click();
    }
  });

  // Load saved completion state
  loadCompletionState();

  // Initialize programming page if we're on it
  if (window.location.pathname.includes('programming.html')) {
    initProgrammingPage();
  }

  // Initialize todo page if we're on it
  if (window.location.pathname.includes('todo.html')) {
    initTodoPage();
  }
});

// ========== PROGRAMMING TRACKER FUNCTIONS ==========

function initProgrammingPage() {
  loadTimeEntries();
  loadProjects();
  updateWeeklyProgress();
}

// Time tracking
function addTimeEntry() {
  const modal = document.getElementById('timeModal');
  modal.style.display = 'block';

  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('session-date').value = today;
}

function closeTimeModal() {
  document.getElementById('timeModal').style.display = 'none';
  document.getElementById('session-date').value = '';
  document.getElementById('session-hours').value = '';
  document.getElementById('session-topic').value = '';
}

function saveTimeEntry(event) {
  event.preventDefault();

  const date = document.getElementById('session-date').value;
  const hours = parseFloat(document.getElementById('session-hours').value);
  const topic = document.getElementById('session-topic').value;

  const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
  entries.push({ date, hours, topic });
  localStorage.setItem('timeEntries', JSON.stringify(entries));

  closeTimeModal();
  loadTimeEntries();
  updateWeeklyProgress();
}

function loadTimeEntries() {
  const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
  const container = document.getElementById('time-entries');

  if (!container) return;

  // Sort by date (newest first)
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = entries.map((entry, index) => `
    <div class="time-entry">
      <div class="entry-date">${new Date(entry.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</div>
      <div class="entry-hours">${entry.hours}h</div>
      <div class="entry-topic">${entry.topic}</div>
      <button class="delete-btn" onclick="deleteTimeEntry(${index})">×</button>
    </div>
  `).join('');
}

function deleteTimeEntry(index) {
  const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
  entries.splice(index, 1);
  localStorage.setItem('timeEntries', JSON.stringify(entries));
  loadTimeEntries();
  updateWeeklyProgress();
}

function updateWeeklyProgress() {
  const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');

  // Get current week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  // Calculate hours this week
  const weeklyHours = entries
    .filter(entry => new Date(entry.date) >= startOfWeek)
    .reduce((sum, entry) => sum + entry.hours, 0);

  const hoursElement = document.getElementById('hours-this-week');
  const progressElement = document.getElementById('progress-fill');

  if (hoursElement && progressElement) {
    hoursElement.textContent = weeklyHours.toFixed(1);
    const percentage = Math.min((weeklyHours / 7.5) * 100, 100);
    progressElement.style.width = percentage + '%';
  }
}

// Projects management
function saveProjects() {
  const checkboxes = document.querySelectorAll('#projects-list input[type="checkbox"]');
  const projects = Array.from(checkboxes).map(cb => ({
    id: cb.id,
    checked: cb.checked,
    label: cb.nextElementSibling.innerHTML
  }));

  localStorage.setItem('projects', JSON.stringify(projects));
}

function loadProjects() {
  const saved = localStorage.getItem('projects');
  if (!saved) return;

  const projects = JSON.parse(saved);
  projects.forEach(project => {
    const checkbox = document.getElementById(project.id);
    if (checkbox) {
      checkbox.checked = project.checked;
    }
  });
}

function addProject() {
  const title = prompt('Titolo del progetto:');
  if (!title) return;

  const description = prompt('Descrizione breve:');

  const projectsList = document.getElementById('projects-list');
  const newId = 'project' + Date.now();

  const projectHTML = `
    <div class="project-item">
      <input type="checkbox" id="${newId}" onchange="saveProjects()">
      <label for="${newId}">
        <strong>${title}</strong> - ${description || ''}
      </label>
    </div>
  `;

  projectsList.insertAdjacentHTML('beforeend', projectHTML);
  saveProjects();
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('timeModal');
  if (modal && event.target === modal) {
    closeTimeModal();
  }
};

// ========== TODO LIST FUNCTIONS ==========

function initTodoPage() {
  loadTasks();
  calculateTimeBox();
}

function addTask(event) {
  event.preventDefault();

  const title = document.getElementById('task-title').value;
  const priority = document.getElementById('task-priority').value;
  const duration = parseInt(document.getElementById('task-duration').value);
  const deadline = document.getElementById('task-deadline').value;

  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

  const newTask = {
    id: Date.now(),
    title,
    priority,
    duration,
    deadline,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Reset form
  document.getElementById('add-task-form').reset();

  // Reload tasks
  loadTasks();
  calculateTimeBox();
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

  // Clear all quadrants
  document.getElementById('tasks-urgent-important').innerHTML = '';
  document.getElementById('tasks-not-urgent-important').innerHTML = '';
  document.getElementById('tasks-urgent-not-important').innerHTML = '';
  document.getElementById('tasks-not-urgent-not-important').innerHTML = '';

  // Filter completed tasks
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Distribute tasks to quadrants
  activeTasks.forEach(task => {
    const taskHTML = createTaskHTML(task);
    const containerId = `tasks-${task.priority}`;
    const container = document.getElementById(containerId);
    if (container) {
      container.insertAdjacentHTML('beforeend', taskHTML);
    }
  });

  // Show completed tasks
  loadCompletedTasks(completedTasks);
}

function createTaskHTML(task) {
  const deadlineText = task.deadline
    ? new Date(task.deadline).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
    : 'Nessuna scadenza';

  return `
    <div class="task-item" data-task-id="${task.id}">
      <div class="task-content">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <span>⏱️ ${task.duration} min</span>
          <span>📅 ${deadlineText}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-btn complete" onclick="completeTask(${task.id})" title="Completa">✓</button>
        <button class="task-btn delete" onclick="deleteTask(${task.id})" title="Elimina">×</button>
      </div>
    </div>
  `;
}

function completeTask(taskId) {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const task = tasks.find(t => t.id === taskId);

  if (task) {
    task.completed = true;
    task.completedAt = new Date().toISOString();
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    calculateTimeBox();
  }
}

function deleteTask(taskId) {
  if (!confirm('Sei sicuro di voler eliminare questo task?')) return;

  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const filteredTasks = tasks.filter(t => t.id !== taskId);
  localStorage.setItem('tasks', JSON.stringify(filteredTasks));
  loadTasks();
  calculateTimeBox();
}

function loadCompletedTasks(completedTasks) {
  const container = document.getElementById('completed-tasks');
  if (!container) return;

  // Filter only today's completed tasks
  const today = new Date().toISOString().split('T')[0];
  const todayCompleted = completedTasks.filter(task => {
    if (!task.completedAt) return false;
    const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
    return completedDate === today;
  });

  if (todayCompleted.length === 0) {
    container.innerHTML = '<p class="empty-state">Nessun task completato ancora</p>';
    return;
  }

  container.innerHTML = todayCompleted.map(task => `
    <div class="completed-task">
      <div class="completed-task-title">${task.title}</div>
      <div class="completed-task-meta">
        ⏱️ ${task.duration} min • ✓ Completato ${new Date(task.completedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  `).join('');
}

function calculateTimeBox() {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const activeTasks = tasks.filter(t => !t.completed);

  // Calculate based on daily schedule
  // Available time: Morning 60min programming + Evening time (varies by day)
  const availableTime = 90; // Average available time per day (rough estimate)

  const allocatedTime = activeTasks.reduce((sum, task) => sum + task.duration, 0);
  const freeTime = Math.max(0, availableTime - allocatedTime);

  const availableEl = document.getElementById('available-time');
  const allocatedEl = document.getElementById('allocated-time');
  const freeEl = document.getElementById('free-time');

  if (availableEl) availableEl.textContent = availableTime;
  if (allocatedEl) allocatedEl.textContent = allocatedTime;
  if (freeEl) {
    freeEl.textContent = freeTime;
    freeEl.style.color = freeTime < 0 ? '#e74c3c' : '#2ecc71';
  }

  // Load today's priority tasks
  loadTodayTasks(activeTasks);
}

function loadTodayTasks(tasks) {
  const container = document.getElementById('today-tasks');
  if (!container) return;

  // Filter high priority tasks (urgent-important and not-urgent-important)
  const priorityTasks = tasks
    .filter(t => t.priority === 'urgent-important' || t.priority === 'not-urgent-important')
    .sort((a, b) => {
      // Sort by priority first, then by deadline
      if (a.priority === 'urgent-important' && b.priority !== 'urgent-important') return -1;
      if (a.priority !== 'urgent-important' && b.priority === 'urgent-important') return 1;
      if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
      return 0;
    })
    .slice(0, 5); // Show max 5 tasks

  if (priorityTasks.length === 0) {
    container.innerHTML = '<p class="empty-state">Nessun task prioritario per oggi</p>';
    return;
  }

  container.innerHTML = priorityTasks.map(task => {
    const priorityIcon = task.priority === 'urgent-important' ? '🔴' : '🟡';
    const deadlineText = task.deadline
      ? new Date(task.deadline).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
      : '';

    return `
      <div class="today-task">
        <div class="today-task-content">
          <div class="today-task-title">${priorityIcon} ${task.title}</div>
          <div class="today-task-meta">
            ⏱️ ${task.duration} min${deadlineText ? ' • 📅 ' + deadlineText : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="task-btn complete" onclick="completeTask(${task.id})">✓</button>
        </div>
      </div>
    `;
  }).join('');
}