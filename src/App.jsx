import { useState, useEffect } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import style from './kanban-boardStyle.module.css'

function App() {
  // useStateはデータを覚えておく
  const [tasks, setTasks] = useState(() => getLocalStorageData("tasks"));

  const [newTask, setNewTask] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskDueTime, setNewTaskDueTime] = useState("");
  const [newTaskStartDate, setNewTaskStartDate] = useState("");
  const [newTaskColor, setNewTaskColor] = useState("");

  const STATUS = {
    TODO: "todo",
    WORKING: "working",
    COMPLETED: "completed"
  };

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingStartDate, setEditingStartDate] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [editingDueTime, setEditingDueTime] = useState("");

  function getLocalStorageData(key)
  {
    const localData = localStorage.getItem(key);
    return localData ? JSON.parse(localData) : [];
  }

  // 第二引数のtasksを監視して変化があれば第一引数のlocalStorage.setItemを実行する
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks]);

  function addTask()
  {
    // newTaskの中身の文字の前後にある空白を取り除く
    if(newTask.trim() === "")
    {
      return;
    }

    const tasksLength = tasks.length;

    let nowDate = "";
    if(!newTaskStartDate)
    {
      const today = new Date();
      nowDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    }
    
    const newTaskObject = {
      id: 0 < tasksLength ? tasks[tasksLength - 1].id + 1 : 1,
      text: newTask,
      color: newTaskColor || "#FFF",
      status: STATUS.TODO,
      startDate: newTaskStartDate || nowDate,
      dueDate: newTaskDueDate || null,
      dueTime: newTaskDueTime || null
    };
    
    // スプレッド構文 ...tasksでtasksの中身すべてを展開
    setTasks([...tasks, newTaskObject]);
    setNewTask("");
    setNewTaskColor("");
    setNewTaskStartDate("");
    setNewTaskDueDate("");
    setNewTaskDueTime("");
  }

  function deleteTask(targetTaskId, setTaskState)
  {
    setTaskState((tasks) =>
      tasks.filter((task) =>
        task.id !== targetTaskId)
    );
  }

  function changeTaskStatus(targetTaskId, newStatus)
  {
    setTasks((tasks) =>
      tasks.map((task) =>
        task.id === targetTaskId ? {...task, status: newStatus} : task
      )
    );
  }

  function editTask(targetTaskId, newText, newStartDate, newDueDate, newDueTime, setTaskState)
  {
    if(newText.trim() === "")
    {
      return;
    }

    setTaskState((tasks) =>
      tasks.map((task) =>
        task.id === targetTaskId ? {...task, text: newText, startDate: newStartDate || null, dueDate: newDueDate || null, dueTime: newDueTime || null} : task
      )
    );

    setEditingTaskId(null);
    setEditingText("");
    setEditingStartDate("");
    setEditingDueDate("");
    setEditingDueTime("");
  }

  function formatDate(date)
  {
    if(!date)
    {
      return;
    }
    const [year, month, day] = date.split("-");
    return `${year}年${month}月${day}日`;
  }

  return (
    <div>
      <div>
        <h1>カンバンボードアプリ</h1>
      </div>

      <p style={{color: "#000"}}>タスクの追加</p>
      <div　style={{color: "#000", display:"flex", justifyContent:"center"}}>
        <div style={{marginBottom: "10px", textAlign: "right"}}>
          <div>
            <input
              type="text"
              value={newTask}
              placeholder='タスク名(必須)'
              // eはイベントオブジェクト e.targetはイベントが発生した要素(<inpput>要素) e.target.valueは<input>の値
              onChange={(e) => setNewTask(e.target.value)} />
          </div>

          <div>
            <span>カラーコード:</span>
            <input
              type="text"
              value={newTaskColor}
              placeholder='#ffffff'
              onChange={(e) => setNewTaskColor(e.target.value)} />
          </div>

          <div>
            <span>開始時期:</span>
            <input
              type="date"
              value={newTaskStartDate}
              onChange={(e) => setNewTaskStartDate(e.target.value)} />
          </div>

          <div>
            <span>期日:</span>
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)} />
          </div>

          <div>
            <span>期限時刻:</span>
            <input
              type="time"
              value={newTaskDueTime}
              onChange={(e) => setNewTaskDueTime(e.target.value)} />
          </div>

          <button
            style={{marginLeft: "10px"}}
            onClick={addTask}>追加
          </button>
        </div>
      </div>

      <div style={{display: "flex", gap: "1px", justifyContent: "center"}}>
        
        {/* タスク */}
        <div className={style.taskContainer}>
          <h2>タスク</h2>

          {/* タスク表示 */}
          {tasks.filter((task) => task.status === STATUS.TODO).map((task) => (
            <div key={task.id} className={style.card} style={{backgroundColor: task.color}}>
              {editingTaskId === task.id ? (
                // 複数の要素をひとまとめにするための見えない入れ物
                <>
                  <div>
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}/>
                  </div>

                  <div>
                    <span>開始時期:</span>
                    <input
                      type="date"
                      value={editingStartDate}
                      onChange={(e) => setEditingStartDate(e.target.value)} />
                  </div>

                  <div>
                    <span>期日:</span>
                    <input
                      type="date"
                      value={editingDueDate}
                      onChange={(e) => setEditingDueDate(e.target.value)} />
                  </div>

                  <div>
                    <span>期限時刻:</span>
                    <input
                      type="time"
                      value={editingDueTime}
                      onChange={(e) => setEditingDueTime(e.target.value)} />
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        editTask(task.id, editingText, editingStartDate, editingDueDate, editingDueTime, setTasks);
                      }}
                    >
                      保存
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={style.deleteContainer}>
                    <button
                      onClick={() => {
                        if(window.confirm(`「${task.text}」を削除しますか?`))
                        {
                          deleteTask(task.id, setTasks);
                        }
                      }}
                      >×
                    </button>
                  </div>
                  
                  <div>
                    {task.text}
                    {/* アロー関数じゃないと表示された瞬間に実行される */}
                    <button
                      onClick={() => {
                        changeTaskStatus(task.id, STATUS.WORKING)
                      }}
                      style={{marginLeft: "10px"}}>→
                    </button>
                  </div>

                  <div>
                    <span>開始時期:</span>
                    {formatDate(task.startDate)}
                  </div>
                  {(task.dueDate || task.dueTime) &&(
                    <div>
                      <span>期日:</span>
                      {task.dueDate && formatDate(task.dueDate)}
                      {task.dueDate && task.dueTime && " "}
                      {task.dueTime}
                    </div>
                  )}

                  <div>
                    <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditingText(task.text);
                          setEditingStartDate(task.startDate || "");
                          setEditingDueDate(task.dueDate || "");
                          setEditingDueTime(task.dueTime || "");
                        }}
                        style={{marginLeft: "10px"}}
                      >
                        編集
                    </button>
                  </div>

                </>
              )}
            </div>
          ))}
        </div>

        {/* 作業中 */}
        <div className={style.taskContainer}>
          <h2>作業中</h2>

          {/* タスク表示 */}
          {tasks.filter((task) => task.status === STATUS.WORKING).map((task) => (
            <div key={task.id} className={style.card} style={{backgroundColor: task.color}}>
              {editingTaskId === task.id ? (
                // 複数の要素をひとまとめにするための見えない入れ物
                <>
                  <div>
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}/>
                  </div>

                  <div>
                    <span>開始時期:</span>
                    <input
                      type="date"
                      value={editingStartDate}
                      onChange={(e) => setEditingStartDate(e.target.value)} />
                  </div>

                  <div>
                    <span>期日:</span>
                    <input
                      type="date"
                      value={editingDueDate}
                      onChange={(e) => setEditingDueDate(e.target.value)} />
                  </div>

                  <div>
                    <span>期限時刻:</span>
                    <input
                      type="time"
                      value={editingDueTime}
                      onChange={(e) => setEditingDueTime(e.target.value)} />
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        editTask(task.id, editingText, editingStartDate, editingDueDate, editingDueTime, setTasks);
                      }}
                    >
                      保存
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={style.deleteContainer}>
                    <button
                      onClick={() => {
                        if(window.confirm(`「${task.text}」を削除しますか?`))
                        {
                          deleteTask(task.id, setTasks);
                        }
                      }}
                      >×
                    </button>
                  </div>
                  
                  <div>
                    <button
                      onClick={() => {
                        changeTaskStatus(task.id, STATUS.TODO);
                      }}
                      style={{marginRight: "10px"}}>←
                    </button>
                    {task.text}
                    {/* アロー関数じゃないと表示された瞬間に実行される */}
                    <button
                      onClick={() => {
                        changeTaskStatus(task.id, STATUS.COMPLETED)
                      }}
                      style={{marginLeft: "10px"}}>→
                    </button>
                  </div>

                  <div>
                    <span>開始時期:</span>
                    {formatDate(task.startDate)}
                  </div>
                  {(task.dueDate || task.dueTime) &&(
                    <div>
                      <span>期日:</span>
                      {task.dueDate && formatDate(task.dueDate)}
                      {task.dueDate && task.dueTime && " "}
                      {task.dueTime}
                    </div>
                  )}

                  <div>
                    <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditingText(task.text);
                          setEditingStartDate(task.startDate || "");
                          setEditingDueDate(task.dueDate || "");
                          setEditingDueTime(task.dueTime || "");
                        }}
                        style={{marginLeft: "10px"}}
                      >
                        編集
                    </button>
                  </div>

                </>
              )}
            </div>
          ))}
        </div>


        {/* 完了 */}
        <div className={style.taskContainer}>
          <h2>完了</h2>

          {/* タスク表示 */}
          {tasks.filter((task) => task.status === STATUS.COMPLETED).map((task) => (
            <div key={task.id} className={style.card} style={{backgroundColor: task.color}}>
              {editingTaskId === task.id ? (
                // 複数の要素をひとまとめにするための見えない入れ物
                <>
                  <div>
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}/>
                  </div>

                  <div>
                    <span>開始時期:</span>
                    <input
                      type="date"
                      value={editingStartDate}
                      onChange={(e) => setEditingStartDate(e.target.value)} />
                  </div>

                  <div>
                    <span>期日:</span>
                    <input
                      type="date"
                      value={editingDueDate}
                      onChange={(e) => setEditingDueDate(e.target.value)} />
                  </div>

                  <div>
                    <span>期限時刻:</span>
                    <input
                      type="time"
                      value={editingDueTime}
                      onChange={(e) => setEditingDueTime(e.target.value)} />
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        editTask(task.id, editingText, editingStartDate, editingDueDate, editingDueTime, setTasks);
                      }}
                    >
                      保存
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={style.deleteContainer}>
                    <button
                      onClick={() => {
                        if(window.confirm(`「${task.text}」を削除しますか?`))
                        {
                          deleteTask(task.id, setTasks);
                        }
                      }}
                      >×
                    </button>
                  </div>
                  
                  <div>
                    {/* アロー関数じゃないと表示された瞬間に実行される */}
                    <button
                      onClick={() => {
                        changeTaskStatus(task.id, STATUS.WORKING)
                      }}
                      style={{marginLeft: "10px"}}>←
                    </button>
                    {task.text}
                  </div>

                  <div>
                    <span>開始時期:</span>
                    {formatDate(task.startDate)}
                  </div>
                  {(task.dueDate || task.dueTime) &&(
                    <div>
                      <span>期日:</span>
                      {task.dueDate && formatDate(task.dueDate)}
                      {task.dueDate && task.dueTime && " "}
                      {task.dueTime}
                    </div>
                  )}

                  <div>
                    <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditingText(task.text);
                          setEditingStartDate(task.startDate || "");
                          setEditingDueDate(task.dueDate || "");
                          setEditingDueTime(task.dueTime || "");
                        }}
                        style={{marginLeft: "10px"}}
                      >
                        編集
                    </button>
                  </div>

                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App
