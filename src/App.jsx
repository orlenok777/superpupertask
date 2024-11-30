// App.js
import React, { useState, useEffect, useRef } from "react";
import { romaRoutineTasks } from "./tasks";
import "./App.css";

const App = () => {
  // Инициализация состояний
  const [currentTask, setCurrentTask] = useState(() => {
    const saved = localStorage.getItem("currentTask");
    return saved ? JSON.parse(saved) : null;
  });
  const [taskStates, setTaskStates] = useState(() => {
    const saved = localStorage.getItem("taskStates");
    return saved ? JSON.parse(saved) : {};
  });
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem("completedTasks");
    return saved ? JSON.parse(saved) : 0;
  });
  const [carriedOverTasks, setCarriedOverTasks] = useState(() => {
    const saved = localStorage.getItem("carriedOverTasks");
    return saved ? JSON.parse(saved) : 0;
  });
  const [currentCategory, setCurrentCategory] = useState(() => {
    const saved = localStorage.getItem("currentCategory");
    return saved ? saved : "all";
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("isSoundEnabled");
    return saved ? JSON.parse(saved) : false;
  });
  const [totalPoints, setTotalPoints] = useState(() => {
    const saved = localStorage.getItem("totalPoints");
    return saved ? JSON.parse(saved) : 0;
  });
  const [collapsedTasks, setCollapsedTasks] = useState(() => {
    const saved = localStorage.getItem("collapsedTasks");
    return saved ? JSON.parse(saved) : {};
  });
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(() => {
    const saved = localStorage.getItem("isRepeatEnabled");
    return saved ? JSON.parse(saved) : false;
  });

  const speechQueue = useRef([]);
  const greenTaskRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (greenTaskRef.current) {
        const { id, message } = greenTaskRef.current;
        const state = taskStates[id];
        if (state === "green" || (state === "green" && isRepeatEnabled)) {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = "ru-RU";
          speechSynthesis.speak(utterance);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [taskStates, isRepeatEnabled]);

  useEffect(() => {
    const allStates = Object.values(taskStates);
    const greenTasks = allStates.filter(
      (state) => state === "green" || state === "highlight"
    ).length;

    const redTasks = allStates.filter((state) => state === "red").length;

    setCompletedTasks(greenTasks);
    setCarriedOverTasks(redTasks);
  }, [taskStates]);

  // Сохранение состояний в Local Storage
  useEffect(() => {
    localStorage.setItem("taskStates", JSON.stringify(taskStates));
  }, [taskStates]);

  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    localStorage.setItem("carriedOverTasks", JSON.stringify(carriedOverTasks));
  }, [carriedOverTasks]);

  useEffect(() => {
    localStorage.setItem("currentCategory", currentCategory);
  }, [currentCategory]);

  useEffect(() => {
    localStorage.setItem("isSoundEnabled", JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  useEffect(() => {
    localStorage.setItem("totalPoints", JSON.stringify(totalPoints));
  }, [totalPoints]);

  useEffect(() => {
    localStorage.setItem("currentTask", JSON.stringify(currentTask));
  }, [currentTask]);

  useEffect(() => {
    localStorage.setItem("collapsedTasks", JSON.stringify(collapsedTasks));
  }, [collapsedTasks]);

  useEffect(() => {
    localStorage.setItem("isRepeatEnabled", JSON.stringify(isRepeatEnabled));
  }, [isRepeatEnabled]);

  const handleTaskClick = (task) => {
    setCurrentTask(task);
    setTaskStates((prev) => {
      const newState = prev[task.id] === "green" ? "" : "green";
      if (newState === "green") {
        greenTaskRef.current = { ...task };
      } else {
        greenTaskRef.current = null;
      }
      return {
        ...prev,
        [task.id]: newState,
      };
    });
  };

  const handleTaskDoubleClick = (task) => {
    setTaskStates((prev) => {
      if (prev[task.id] === "green" || prev[task.id] === "highlight") {
        greenTaskRef.current = null;
      }
      return {
        ...prev,
        [task.id]: prev[task.id] === "red" ? "" : "red",
      };
    });
    // Прерываем озвучивание, если задача выделена красным
    if (taskStates[task.id] !== "red") {
      speechSynthesis.cancel();
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled((prev) => !prev);
    if (!isSoundEnabled) {
      const utterance = new SpeechSynthesisUtterance("Звук активирован");
      utterance.lang = "ru-RU";
      speechSynthesis.speak(utterance);
    }
  };

  const toggleRepeat = () => {
    setIsRepeatEnabled((prev) => !prev);
    if (!isRepeatEnabled) {
      const utterance = new SpeechSynthesisUtterance(
        "Режим повтора активирован"
      );
      utterance.lang = "ru-RU";
      speechSynthesis.speak(utterance);
    }
  };

  const stopTask = (task) => {
    if (greenTaskRef.current && greenTaskRef.current.id === task.id) {
      speechSynthesis.cancel();
      greenTaskRef.current = null;
      setTaskStates((prev) => ({
        ...prev,
        [task.id]: "",
      }));
    }
  };

  useEffect(() => {
    if (isSoundEnabled && currentTask) {
      const id = currentTask.id;
      const state = taskStates[id];
      if (state === "green") {
        const utterance = new SpeechSynthesisUtterance(
          `Молодец! Ты выполнил задачу "${currentTask.message}". Ты получаешь 10 очков. А теперь выпей воды, отожмись, поприседай, и напиши приятное сообщение родным и близким и друзьям.`
        );
        utterance.lang = "ru-RU";
        utterance.onend = () => {
          setTotalPoints((prev) => prev + 10);
        };
        speechSynthesis.speak(utterance);
      }
    }
  }, [taskStates, isSoundEnabled]);

  const handleCircleClick = (task, color) => {
    setTaskStates((prev) => ({
      ...prev,
      [task.id]: color,
    }));
  };

  const handleReset = () => {
    if (window.confirm("Вы уверены, что хотите сбросить все данные?")) {
      localStorage.clear();
      setCurrentTask(null);
      setTaskStates({});
      setCompletedTasks(0);
      setCarriedOverTasks(0);
      setCurrentCategory("all");
      setIsSoundEnabled(false);
      setTotalPoints(0);
      setCollapsedTasks({});
      setIsRepeatEnabled(false);
      speechSynthesis.cancel();
    }
  };

  const handleTaskAction = (task, action) => {
    switch (action) {
      case "postpone":
        setTaskStates((prev) => ({
          ...prev,
          [task.id]: "yellow",
        }));
        break;
      // Добавьте другие действия по необходимости
      default:
        break;
    }
  };

  const toggleCollapse = (taskId) => {
    setCollapsedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleMarkAllSubTasks = (task, color) => {
    const newStates = {};

    const markSubTasks = (task) => {
      if (task.subTasks) {
        task.subTasks.forEach((subTask) => {
          newStates[subTask.id] = color;
          // Рекурсивно отмечаем подзадачи
          markSubTasks(subTask);
        });
      }
    };

    markSubTasks(task);

    setTaskStates((prev) => ({
      ...prev,
      ...newStates,
    }));
  };

  // Функции для сворачивания и разворачивания всех подзадач остаются прежними
  const collapseAllSubtasks = () => {
    const newCollapsedTasks = {};

    const collectTaskIds = (tasks) => {
      tasks.forEach((task) => {
        if (task.subTasks && task.subTasks.length > 0) {
          newCollapsedTasks[task.id] = true;
          collectTaskIds(task.subTasks);
        }
      });
    };

    collectTaskIds(romaRoutineTasks);
    setCollapsedTasks(newCollapsedTasks);
  };

  const expandAllSubtasks = () => {
    setCollapsedTasks({});
  };

  const getStatistics = () => {
    return (
      <div className="statistics">
        <h2>Статистика выполнения задач</h2>
        <p>Выполненные задачи: {completedTasks}</p>
        <p>Перенесённые задачи на следующий день: {carriedOverTasks}</p>
        <p>Общий счет: {totalPoints} очков</p>
        <div className="statistics-bar">
          <div
            className="bar completed"
            style={{ width: `${completedTasks * 20}px` }}
          ></div>
          <div
            className="bar carried-over"
            style={{ width: `${carriedOverTasks * 20}px` }}
          ></div>
        </div>
      </div>
    );
  };

  const categories = {
    morning: "Утренние задачи",
    afternoon: "Дневные задачи",
    evening: "Вечерние задачи",
    work: "Рабочие задачи",
    personal: "Личные задачи",
    exercise: "Физическая активность",
    family: "Семейные задачи",
    cleaning: "Уборка и организация",
    all: "Все задачи",
  };

  const filteredTasks = romaRoutineTasks.filter((task) => {
    if (currentCategory === "all") return true;
    return task.category === currentCategory;
  });

  const renderTask = (task, level = 0) => {
    const id = task.id;
    const state = taskStates[id];
    const isCollapsed = collapsedTasks[id];
    const isCompleted = state === "green";

    return (
      <li key={id} className={`task-item`}>
        <div
          className="task-container"
          style={{
            marginLeft: `${level * 20}px`,
            maxWidth: `calc(100% - ${level * 20}px)`,
          }}
        >
          {task.subTasks && (
            <button
              className="collapse-button"
              onClick={() => toggleCollapse(id)}
            >
              {isCollapsed ? "▶" : "▼"}
            </button>
          )}
          <div
            className={`task-button ${state} ${isCompleted ? "completed" : ""}`}
            onClick={() => handleTaskClick(task)}
            onDoubleClick={() => handleTaskDoubleClick(task)}
          >
            {task.message}
          </div>
          {/* Панель управления внутри задачи */}
          <div className="task-controls">
            {/* Заменяем кнопки на значки */}
            {task.subTasks && (
              <button
                className="control-button"
                onClick={() => handleMarkAllSubTasks(task, "green")}
                title="Отметить все как выполненные"
              >
                ✅
              </button>
            )}
            {/* Кнопка остановить задачу */}
            <button
              className="control-button"
              onClick={() => stopTask(task)}
              title="Остановить задачу"
            >
              ⏹
            </button>
            {/* Другие значки управления */}
            <button
              className="control-button"
              onClick={() => handleCircleClick(task, "yellow")}
              title="Перенести на следующий день"
            >
              📅
            </button>
            <button
              className="control-button"
              onClick={() => handleCircleClick(task, "blue")}
              title="Отметить как важное"
            >
              ⭐
            </button>
            <button
              className="control-button"
              onClick={() => handleCircleClick(task, "red")}
              title="Отложить задачу"
            >
              ❌
            </button>
            <button
              className="control-button"
              onClick={toggleRepeat}
              title={
                isRepeatEnabled ? "Отключить повторение" : "Включить повторение"
              }
            >
              🔁
            </button>
          </div>
        </div>
        {task.subTasks && !isCollapsed && (
          <ul className="subtask-list">
            {task.subTasks.map((subTask) => renderTask(subTask, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Список задач</h1>
      <div className="category-buttons">
        {Object.entries(categories).map(([key, value]) => (
          <button
            className="category-button"
            key={key}
            onClick={() => setCurrentCategory(key)}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="control-buttons">
        <button className="sound-toggle-button" onClick={toggleSound}>
          {isSoundEnabled ? "🔇" : "🔊"}
        </button>
        <button className="reset-button" onClick={handleReset}>
          🔄
        </button>
        <button className="collapse-all-button" onClick={collapseAllSubtasks}>
          📕
        </button>
        <button className="expand-all-button" onClick={expandAllSubtasks}>
          📖
        </button>
        <button className="repeat-toggle-button" onClick={toggleRepeat}>
          {isRepeatEnabled ? "🔁 Отключить повтор" : "🔁 Включить повтор"}
        </button>
      </div>
      <ul className="task-list">
        {filteredTasks.map((task) => renderTask(task))}
      </ul>
      {getStatistics()}
    </div>
  );
};

export default App;
