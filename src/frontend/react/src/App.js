import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTasks([
        { id: 1, title: 'Sample Task', description: 'This is a sample task', completed: false },
        { id: 2, title: 'Another Task', description: 'This is another task', completed: true }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="App container mt-4">
      <header className="App-header jumbotron">
        <h1 className="display-4">AI Task Manager - React Frontend</h1>
        {loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading tasks...</span>
            </div>
            <p className="ml-2 mt-1">Loading tasks...</p>
          </div>
        ) : (
          <div>
            <h2 className="mb-4">Your Tasks</h2>
            <div className="row">
              {tasks.map(task => (
                <div key={task.id} className="col-md-6 mb-3">
                  <div className={`card ${task.completed ? 'border-success' : 'border-primary'}`}>
                    <div className="card-body">
                      <h5 className={`card-title ${task.completed ? 'text-success' : 'text-primary'}`}>{task.title}</h5>
                      <p className="card-text">{task.description}</p>
                      <p className="card-text">
                        <small className={`badge ${task.completed ? 'bg-success' : 'bg-warning'}`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </small>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;