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

  const STATUS = {
    TODO: "todo",
    WORKING: "working",
    COMPLETED: "completed"
  };

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");

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
    
    const newTaskObject = {
      id: 0 < tasksLength ? tasks[tasksLength - 1].id + 1 : 1,
      text: newTask,
      status: STATUS.TODO
    };
    
    // スプレッド構文 ...tasksでtasksの中身すべてを展開
    setTasks([...tasks, newTaskObject]);
    setNewTask("");
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

  function editTask(targetTaskId, newText, setTaskState)
  {
    if(newText.trim() === "")
    {
      return;
    }

    setTaskState((tasks) =>
      tasks.map((task) =>
        task.id === targetTaskId ? {...task, text: newText} : task
      )
    );

    setEditingTaskId(null);
    setEditingText("");
  }

  return (
    <div>
      <div>
        <h1>カンバンボードアプリ</h1>
      </div>

      <div style={{marginBottom: "10px"}}>
        <p style={{color: "#000"}}>タスクの追加</p>
        <input
              type="text"
              value={newTask}
              placeholder='タスク名(必須)'
              // eはイベントオブジェクト e.targetはイベントが発生した要素(<inpput>要素) e.target.valueは<input>の値
              onChange={(e) => setNewTask(e.target.value)} />
        <button
          style={{marginLeft: "10px"}}
          onClick={addTask}>追加
        </button>
      </div>

      <div style={{display: "flex", gap: "1px", justifyContent: "center"}}>
        <div className={style.taskContainer}>
          <h2>タスク</h2>

          {/* タスク表示 */}
          {tasks.filter((task) => task.status === STATUS.TODO).map((task) => (
            <div key={task.id} className={style.card}>
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

              {editingTaskId === task.id ? (
                // 複数の要素をひとまとめにするための見えない入れ物
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />

                  <div>
                    <button
                      onClick={() => {
                        editTask(task.id, editingText, setTasks);
                      }}
                    >
                      保存
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {task.text}

                  {/* アロー関数じゃないと表示された瞬間に実行される */}
                  <button
                    onClick={() => {
                      changeTaskStatus(task.id, STATUS.WORKING)
                    }}
                    style={{marginLeft: "10px"}}>→
                  </button>

                  <div>
                    <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditingText(task.text);
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


        <div  className={style.taskContainer}>
          <h2>作業中</h2>

          {/* タスク表示 */}
          {tasks.filter((task) => task.status === STATUS.WORKING).map((task) => (
            <div key={task.id} className={style.card}>
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
                  changeTaskStatus(task.id, STATUS.COMPLETED);
                }}
                style={{marginLeft: "10px"}}>→
              </button>
            </div>
          ))}
        </div>


        <div  className={style.taskContainer}>
          <h2>完了</h2>

          {tasks.filter((task) => task.status === STATUS.COMPLETED).map((task) => (
            <div key={task.id} className={style.card}>
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
              <button
                onClick={() => {
                  changeTaskStatus(task.id, STATUS.WORKING);
                }}
                style={{marginRight: "10px"}}>←
              </button>
              {task.text}
              {/* アロー関数じゃないと表示された瞬間に実行される */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App
