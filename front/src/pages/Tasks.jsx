import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import { getTasks, updateTask, deleteTask } from "../api/api";

function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState("");

  const [editDescription, setEditDescription] = useState("");

  const [editError, setEditError] = useState("");

  useEffect(() => {
    let ignore = false;

    getTasks()
      .then((data) => {
        if (ignore) {
          return;
        }

        setTasks(data);

        if (data.length > 0) {
          setSelectedTask(data[0]);
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки задач:", error);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function replaceTask(updatedTask) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    );
  }

  function handleSelect(task) {
    setSelectedTask(task);
    setIsEditing(false);
    setEditError("");
  }

  async function handleToggle(task) {
    try {
      const updatedTask = await updateTask(
        task.id,
        task.title,
        task.description || "",
        !task.completed,
      );

      replaceTask(updatedTask);
      setSelectedTask((currentTask) =>
        currentTask?.id === updatedTask.id ? updatedTask : currentTask,
      );
    } catch (error) {
      console.error("Ошибка изменения статуса:", error);
    }
  }

  async function handleDelete() {
    if (!selectedTask) {
      return;
    }

    const confirmed = window.confirm(`Удалить задачу «${selectedTask.title}»?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(selectedTask.id);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== selectedTask.id),
      );

      setSelectedTask(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  }

  function handleTaskCreated(task) {
    setTasks((currentTasks) => [...currentTasks, task]);

    setSelectedTask(task);
    setShowForm(false);
  }

  function startEditing() {
    if (!selectedTask) {
      return;
    }

    setEditTitle(selectedTask.title);
    setEditDescription(selectedTask.description || "");

    setEditError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditError("");
  }

  async function saveEditing(event) {
    event.preventDefault();

    setEditError("");

    if (!editTitle.trim()) {
      setEditError("Название задачи не может быть пустым");
      return;
    }

    try {
      const updatedTask = await updateTask(
        selectedTask.id,
        editTitle.trim(),
        editDescription.trim(),
        selectedTask.completed,
      );

      replaceTask(updatedTask);
      setSelectedTask(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка редактирования:", error);

      setEditError("Не удалось сохранить изменения");
    }
  }

  function handleThemeToggle() {
    setDarkMode((current) => !current);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <div className={`app-shell ${darkMode ? "dark" : ""}`}>
      <header className="topbar">
        <div className="brand">TODO</div>

        <div className="topbar-actions">

          <a
            className="github-link"
            href="https://github.com/qweezy22/todo-list2"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        
          <button
            className="icon-button"
            onClick={handleThemeToggle}
            aria-label="Сменить тему"
          >
            {darkMode ? "☀" : "☾"}
          </button>
        
          <button className="logout-button" onClick={handleLogout}>
            ↪ Выйти
          </button>
        
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div>
              <span className="sidebar-title">Задачи</span>

              <span className="task-count">{tasks.length}</span>
            </div>

            <button
              className={`new-task-button ${showForm ? "active" : ""}`}
              onClick={() => setShowForm((value) => !value)}
              aria-label="Создать задачу"
            >
              {showForm ? "×" : "+"}
            </button>
          </div>

          <div className={`task-form-wrapper ${showForm ? "open" : ""}`}>
            <TaskForm onTaskCreated={handleTaskCreated} />
          </div>

          <div className="task-list">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={selectedTask?.id === task.id}
                onSelect={handleSelect}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </aside>

        <section className="content">
          {selectedTask ? (
            <>
              <div className="content-toolbar">
                <div className="toolbar-actions">
                  <button className="toolbar-button" onClick={startEditing}>
                    ✎ Изменить
                  </button>

                  <button
                    className="toolbar-button delete-button"
                    onClick={handleDelete}
                  >
                    Удалить
                  </button>
                </div>
              </div>

              {isEditing ? (
                <article className="note editor">
                  <form onSubmit={saveEditing}>
                    <input
                      className="title-editor"
                      value={editTitle}
                      onChange={(event) => {
                        setEditTitle(event.target.value);

                        if (editError) {
                          setEditError("");
                        }
                      }}
                    />

                    <textarea
                      className="description-editor"
                      value={editDescription}
                      onChange={(event) =>
                        setEditDescription(event.target.value)
                      }
                      placeholder="Описание"
                    />

                    {editError && (
                      <div className="form-error edit-error">{editError}</div>
                    )}

                    <div className="editor-actions">
                      <button type="submit" className="primary-button">
                        Сохранить
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelEditing}
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                </article>
              ) : (
                <article className="note">
                  <div className="note-status">
                    {selectedTask.completed ? "Выполнено" : "Не выполнено"}
                  </div>

                  <h1>{selectedTask.title}</h1>

                  <div className="note-body">
                    {selectedTask.description ? (
                      <p>{selectedTask.description}</p>
                    ) : (
                      <p className="muted">Нет описания</p>
                    )}
                  </div>

                  <div className="note-footer">
                    Обновлено{" "}
                    {new Date(
                      /Z|[+-]\d{2}:\d{2}$/.test(selectedTask.updatedAt)
                        ? selectedTask.updatedAt
                        : `${selectedTask.updatedAt}Z`,
                    ).toLocaleString("ru-RU")}
                  </div>
                </article>
              )}
            </>
          ) : (
            <div className="empty-content">
              <h2>Выбери задачу</h2>

              <p>Здесь появится её содержимое</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Tasks;
