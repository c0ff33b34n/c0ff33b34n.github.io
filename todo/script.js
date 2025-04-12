document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');

    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Function to save tasks to localStorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Function to create a new task element
    const createTaskElement = (task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(deleteBtn);

        return li;
    };

    // Function to add a new task
    const addTask = () => {
        const text = taskInput.value.trim();
        if (text) {
            const task = {
                id: Date.now(),
                text: text,
                completed: false
            };
            tasks.push(task);
            saveTasks();
            taskList.appendChild(createTaskElement(task));
            taskInput.value = '';
        }
    };

    // Function to toggle task completion
    const toggleTask = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            const taskElement = document.querySelector(`[data-id="${taskId}"]`);
            taskElement.classList.toggle('completed');
        }
    };

    // Function to delete a task
    const deleteTask = (taskId) => {
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        taskElement.style.animation = 'slideOut 0.3s ease forwards';
        
        taskElement.addEventListener('animationend', () => {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            taskElement.remove();
        });
    };

    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Render existing tasks
    tasks.forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });
}); 