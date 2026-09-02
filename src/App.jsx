import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  // useStateはデータを覚えておく
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

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
  };

  function deleteTask(targetTask)
  {
    setTasks(tasks.filter((task) => task !== targetTask));
  }

  return (
    <div>
      <div>
        <h1>カンバンボードアプリ</h1>
      </div>

      <div style={{display: "flex", gap: "1px", justifyContent: "center"}}>
        <div style={{border: "1px solid #000", padding:"10px"}}>
          <h2>タスク</h2>

          {tasks.map((task) => (
            <div key={task}
              style={{
                color: "#000",
                border: "1px solid #000",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              {task}
              {/* アロー関数じゃないと表示された瞬間に実行される */}
              <button
                onClick={() => deleteTask(task)}
                style={{marginLeft: "10px"}}>削除</button>
              </div>
          ))}
          
          <input
            type="text"
            value={newTask}
            // eはイベントオブジェクト e.targetはイベントが発生した要素(<inpput>要素) e.target.valueは<input>の値
            onChange={(e) => setNewTask(e.target.value)} />
          <button onClick={addTask}>追加</button>
        </div>

        <div  style={{border: "1px solid #000", padding:"10px"}}>
          <h2>作業中</h2>
        </div>

        <div  style={{border: "1px solid #000", padding:"10px"}}>
          <h2>完了</h2>
        </div>
      </div>
    </div>
  );
}

export default App
