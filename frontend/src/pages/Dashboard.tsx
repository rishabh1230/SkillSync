import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects');
        setProjects(data);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchProjects();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Dashboard
          </h1>
          <button onClick={handleLogout} className="btn-primary bg-gradient-to-r from-red-500 to-red-600">
            Logout
          </button>
        </header>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-200">Your Projects</h2>
          {projects.length === 0 ? (
            <div className="card text-center p-12">
              <p className="text-gray-400 mb-4">No projects found. Ready to start something new?</p>
              <button className="btn-primary">Create Project</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="card hover:-translate-y-2 cursor-pointer">
                  <h3 className="text-xl font-bold mb-2 text-white">{project.title}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-3">{project.description}</p>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
