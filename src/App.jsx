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

  const [sortTypes, setSortTypes] = useState({todo: "added", working: "added", completed: "added"});

  const [taskError, setTaskError] = useState("");

  const STATUS = {
    TODO: "todo",
    WORKING: "working",
    COMPLETED: "completed"
  };

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingTaskColor, setEditingTaskColor] = useState("");
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
      setTaskError("タスク名を入力してください");
      return;
    }

    if(!newTaskDueDate && newTaskDueTime)
    {
      setTaskError("期限時刻を設定する場合は、期日も入力してください");
      return;
    }

    setTaskError("");

    const tasksLength = tasks.length;
    
    const newTaskObject = {
      id: 0 < tasksLength ? tasks[tasksLength - 1].id + 1 : 1,
      text: newTask,
      color: newTaskColor || "#FFF",
      status: STATUS.TODO,
      startDate: newTaskStartDate || getTimestamp().date,
      dueDate: newTaskDueDate || null,
      dueTime: newTaskDueTime || null,
      completedDate: null,
      completedTime: null
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
      tasks.map((task) => {
        if(task.id != targetTaskId)
        {
          return task;
        }

        if(newStatus ===STATUS.COMPLETED)
        {
          const timestamp = getTimestamp();

          return {
            ...task,
            status: newStatus,
            completedDate: timestamp.date,
            completedTime: timestamp.time
          };
        }

        return {
          ...task,
          status: newStatus,
          completedDate: null,
          completedTime: null
        };
      })
    );
  }

  function editTask(targetTaskId, newText, newColor, newStartDate, newDueDate, newDueTime, setTaskState)
  {
    if(newText.trim() === "")
    {
      return;
    }

    setTaskState((tasks) =>
      tasks.map((task) =>
        task.id === targetTaskId ? {...task, text: newText, color: newColor, startDate: newStartDate || null, dueDate: newDueDate || null, dueTime: newDueTime || null} : task
      )
    );

    setEditingTaskId(null);
    setEditingText("");
    setEditingTaskColor("");
    setEditingStartDate("");
    setEditingDueDate("");
    setEditingDueTime("");
  }

  function getTimestamp()
  {
      const today = new Date();
      const nowDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const nowTime = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;
      
      return{
        date: nowDate,
        time: nowTime
      };
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

  function isDeadline(dueDate, dueTime)
  {
    const now = new Date();

    const dueDateTime = new Date(`${dueDate}T${dueTime || "00:00"}`);

    const difference = dueDateTime - now;

    return 0 <= difference && difference <= 86400000;
  }

  function getRemainingTime(dueDate, dueTime)
  {
    const now = new Date();
    
    if(dueTime)
    {
      // 期限日時と時間を合体
      const dueDateTime = new Date(`${dueDate}T${dueTime}`);
      const difference = dueDateTime - now;

      if(difference < 0)
      {
        return "期限切れ";
      }

      let totalseconds = Math.floor(difference / 1000);

      const days = Math.floor(totalseconds / 86400);
      totalseconds -= days * 86400;

      const hours = Math.floor(totalseconds / 3600);
      totalseconds -= hours * 3600;

      const minutes = Math.floor(totalseconds / 60);
      totalseconds -= minutes * 60;

      if(0 < days)
      {
        return `${days}日${hours}時間`;
      }
      else if(0 < hours)
      {
        return `${hours}時間${minutes}分`;
      }
      else
      {
        return `${minutes}分`;
      }
    }

    const today = now;
    today.setHours(0, 0, 0, 0); // 時、分、秒、ミリ秒

    const [year, month, day] = dueDate.split("-");
    const dueDay = new Date(Number(year), Number(month) - 1, Number(day));

    const difference = dueDay - today;
    if(difference < 0)
    {
      return "期限切れ";
    }

    const totalseconds = Math.floor(difference / 1000);

    const days = Math.floor(totalseconds / 86400);

    return `${days}日`;
  }

  function sortTasks(tasks, sortType)
  {
    const sortedTasks = [...tasks];

    switch(sortType)
    {
      case "startDateAsc":
        return sortedTasks.sort((a, b) => {
          return (a.startDate || "").localeCompare(b.startDate || ""); //localeCompareは2つの文字列を比較するメソッド、返り値は-1, 0, 1
        });

      case "dueDateAsc":
        return sortedTasks.sort((a, b) => {
          // dueDateにnullが入っている時の処理
          if(!a.dueDate && !b.dueDate)
          {
             return 0;
          }
          else if(!a.dueDate)
          {
            return 1;
          }
          else if(!b.dueDate)
          {
            return -1;
          }

          // どちらもnullじゃない場合の処理
          const aDate = new Date(`${a.dueDate}T${a.dueTime || "23:59"}`);
          const bDate = new Date(`${b.dueDate}T${b.dueTime || "23:59"}`);

          // 期限切れの場合の処理
          const now = new Date();
          const aExpired = aDate < now;
          const bExpired = bDate < now;
          
          if(aExpired && !bExpired)
          {
            return 1;
          }
          else if(!aExpired && bExpired)
          {
            return -1
          }
          return aDate - bDate;
        });

      case "stringAsc":
        return sortedTasks.sort((a, b) => {
          return a.text.localeCompare(b.text, "ja");
        });

      case "completedDateAsc":
        return sortedTasks.sort((a, b) => {
          const aDate = `${a.completedDate}T${a.completedTime}`;
          const bDate = `${b.completedDate}T${b.completedTime}`;

          return new Date(aDate) - new Date(bDate);
        });

      case "added":
      default:
        return sortedTasks.sort((a, b) => a.id - b.id);
    }
  }

  return (
    <div>
      <div>
        <h1>カンバンボードアプリ</h1>
      </div>

      <div className={style.black} style={{marginBottom: "10px"}}>
        <p>タスクの追加</p>
        <div className={style.addTaskContainer}>
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
                placeholder='#FFFFFF'
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
          </div>
        </div>
        <div>
          <button
              style={{marginLeft: "10px"}}
              onClick={addTask}>追加
            </button>
        </div>
      </div>

      {taskError && (
        <p style={{ color: "red" }}>{taskError}</p>
      )}

      <div style={{display: "flex", gap: "1px", justifyContent: "center"}}>
        
        {/* タスク */}
        <div className={style.taskContainer}>
          <div style={{marginBottom: "5px"}}>
            <h2>タスク</h2>
            <span className={style.black}>並び順: </span>
            <select value={sortTypes.todo}
            // selectの選択が変更されたときに実行
              onChange={(e) => {
                setSortTypes({...sortTypes,
                  todo: e.target.value
                });
              }}>
              <option value="added">追加した順</option>
              <option value="startDateAsc">開始時期順</option>
              <option value="dueDateAsc">残り期限順</option>
              <option value="stringAsc">文字列順</option>
            </select>
          </div>

          {/* タスク表示 */}
          {sortTasks(tasks.filter((task) => task.status === STATUS.TODO), sortTypes.todo).map((task) => (
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
                    <span>カラーコード:</span>
                    <input
                      type="text"
                      value={editingTaskColor}
                      onChange={(e) => setEditingTaskColor(e.target.value)} />
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
                        editTask(task.id, editingText, editingTaskColor, editingStartDate, editingDueDate, editingDueTime, setTasks);
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
                  {task.dueDate &&(
                    <div>
                      <div>
                        <span>期日:</span>
                        {task.dueDate && formatDate(task.dueDate)}
                        {task.dueDate && task.dueTime && " "}
                        {task.dueTime}
                      </div>
                      {isDeadline(task.dueDate, task.dueTime) ?(
                      <div>
                        <span style={{background: "#FFF", color: "#F00"}}>
                          <b>残り時間:{getRemainingTime(task.dueDate, task.dueTime)}</b>
                        </span>
                      </div>
                      ) : (
                      <div>
                        <span>残り時間:{getRemainingTime(task.dueDate, task.dueTime)}</span>
                      </div>
                      )}
                    </div>
                  )}

                  <div>
                    <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditingText(task.text);
                          setEditingTaskColor(task.color || "");
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
          <div style={{marginBottom: "5px"}}>
            <h2>作業中</h2>
            <span className={style.black}>並び順: </span>
            <select value={sortTypes.working}
            // selectの選択が変更されたときに実行
              onChange={(e) => {
                setSortTypes({...sortTypes,
                  working: e.target.value
                });
              }}>
              <option value="added">追加した順</option>
              <option value="startDateAsc">開始時期順</option>
              <option value="dueDateAsc">残り期限順</option>
              <option value="stringAsc">文字列順</option>
            </select>
          </div>

          {/* タスク表示 */}
          {sortTasks(tasks.filter((task) => task.status === STATUS.WORKING), sortTypes.working).map((task) => (
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
                    <span>カラーコード:</span>
                    <input
                      type="text"
                      value={editingTaskColor}
                      onChange={(e) => setEditingTaskColor(e.target.value)} />
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
                        editTask(task.id, editingText, editingTaskColor, editingStartDate, editingDueDate, editingDueTime, setTasks);
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
                      <div>
                        <span>期日:</span>
                        {task.dueDate && formatDate(task.dueDate)}
                        {task.dueDate && task.dueTime && " "}
                        {task.dueTime}
                      </div>
                      {isDeadline(task.dueDate, task.dueTime) ?(
                      <div>
                        <span style={{background: "#FFF", color: "#F00"}}>
                          <b>残り時間:{getRemainingTime(task.dueDate, task.dueTime)}</b>
                        </span>
                      </div>
                      ) : (
                      <div>
                        <span>残り時間:{getRemainingTime(task.dueDate, task.dueTime)}</span>
                      </div>
                      )}
                    </div>
                  )}

                  <div>
                    <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditingText(task.text);
                          setEditingTaskColor(task.color || "");
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
          <div style={{marginBottom: "5px"}}>
            <h2>完了</h2>
            <span className={style.black}>並び順: </span>
            <select value={sortTypes.completed}
            // selectの選択が変更されたときに実行
              onChange={(e) => {
                setSortTypes({...sortTypes,
                  completed: e.target.value
                });
              }}>
              <option value="added">追加した順</option>
              <option value="startDateAsc">開始時期順</option>
              <option value="completedDateAsc">完了時期順</option>
            </select>
          </div>

          {/* タスク表示 */}
          {sortTasks(tasks.filter((task) => task.status === STATUS.COMPLETED), sortTypes.completed).map((task) => (
            <div key={task.id} className={style.card} style={{backgroundColor: task.color}}>
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
                <span>完了日:</span>
                {formatDate(task.completedDate)}
                <span> </span>
                {task.completedTime}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App
