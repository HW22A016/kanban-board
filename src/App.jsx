import { useState, useEffect } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import style from './kanban-boardStyle.module.css'

function App() {
  // useStateはデータを覚えておく
  const [tasks, setTasks] = useState(() => getLocalStorageData("tasks"));
  const [workingTasks, setWorkingTasks] = useState(() => getLocalStorageData("workingTasks"));
  const [completedTasks, setCompletedTasks] = useState(() => getLocalStorageData("completedTasks"));

  const [newTask, setNewTask] = useState("");

  const [editingTask, setEditingTask] = useState(null);
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

  useEffect(() => {
    localStorage.setItem("workingTasks", JSON.stringify(workingTasks))
  }, [workingTasks]);

  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks))
  }, [completedTasks]);

  function addTask()
  {
    // newTaskの中身の文字の前後にある空白を取り除く
    if(newTask.trim() === "")
    {
      return;
    }
    // スプレッド構文 ...tasksでtasksの中身すべてを展開
    setTasks([...tasks, newTask]);
    setNewTask("");
  }

  function deleteTask(targetTask, setTaskState)
  {
    setTaskState((tasks) => tasks.filter((task) => task !== targetTask));
  }

  function moveTask(task, setTaskState)
  {
    setTaskState((tasks) => [...tasks, task]);
  }

  function editTask(targetTask, newText, setTaskState)
  {
    if(newText.trim() === "")
    {
      return;
    }

    setTaskState((tasks) =>
      tasks.map((task) =>
        task === targetTask ? newText : task
      )
    );

    setEditingTask(null);
    setEditingText("");
  }

  return (
    <div>
      <div>
        <h1>カンバンボードアプリ</h1>
      </div>

      <div style={{marginBottom: "10px"}}>
        <p　style={{color: "#000"}}>タスクの追加</p>
        <input
              type="text"
              value={newTask}
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
          {tasks.map((task) => (
            <div key={task} className={style.card}>
              <div className={style.deleteContainer}>
                <button
                  onClick={() => {
                    if(window.confirm(`「${task}」を削除しますか?`))
                    {
                      deleteTask(task, setTasks);
                    }
                  }}
                  >×
                </button>
              </div>

              {editingTask === task ? (
                // 複数の要素をひとまとめにするための見えない入れ物
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />

                  <button
                    onClick={() => {
                      editTask(task, editingText, setTasks);
                    }}
                  >
                    保存
                  </button>
                </>
              ) : (
                <>
                  {task}

                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setEditingText(task);
                    }}
                    style={{marginLeft: "10px"}}
                  >
                    編集
                  </button>
                {/* アロー関数じゃないと表示された瞬間に実行される */}
                <button
                  onClick={() => {
                    moveTask(task, setWorkingTasks);
                    deleteTask(task, setTasks);
                  }}
                  style={{marginLeft: "10px"}}>→
                </button>
                </>
              )}
            </div>
          ))}
        </div>


        <div  className={style.taskContainer}>
          <h2>作業中</h2>

          {/* タスク表示 */}
          {workingTasks.map((task) => (
            <div key={task} className={style.card}>
              <div　className={style.deleteContainer}>
                <button
                  onClick={() => {
                    if(window.confirm(`「${task}」を削除しますか?`))
                    {
                      deleteTask(task, setWorkingTasks);
                    }
                  }}
                  >×
                </button>
              </div>
              <button
                onClick={() => {
                  moveTask(task, setTasks);
                  deleteTask(task, setWorkingTasks);
                }}
                style={{marginRight: "10px"}}>←
              </button>
              {task}
              {/* アロー関数じゃないと表示された瞬間に実行される */}
              <button
                onClick={() => {
                  moveTask(task, setCompletedTasks);
                  deleteTask(task, setWorkingTasks);
                }}
                style={{marginLeft: "10px"}}>→
              </button>
            </div>
          ))}
        </div>


        <div  className={style.taskContainer}>
          <h2>完了</h2>

          {completedTasks.map((task) => (
            <div key={task} className={style.card}>
              <div　className={style.deleteContainer}>
                <button
                  onClick={() => {
                    if(window.confirm(`「${task}」を削除しますか?`))
                    {
                      deleteTask(task, setCompletedTasks);
                    }
                  }}
                  >×
                </button>
              </div>
              <button
                onClick={() => {
                  moveTask(task, setWorkingTasks);
                  deleteTask(task, setCompletedTasks);
                }}
                style={{marginRight: "10px"}}>←
              </button>
              {task}
              {/* アロー関数じゃないと表示された瞬間に実行される */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App
