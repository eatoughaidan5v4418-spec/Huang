import { useState } from 'react'
import './App.css'

function App() {
  const [activeLink, setActiveLink] = useState(null)

  const links = [
    { name: 'GitHub', url: 'https://github.com', icon: '🔗' },
    { name: 'Email', url: 'mailto:your@email.com', icon: '📧' },
    { name: 'Blog', url: '#', icon: '📝' },
  ]

  return (
    <div className="container">
      <div className="card">
        <div className="avatar">
          <div className="avatar-circle">
            <span className="avatar-text">W</span>
          </div>
        </div>
        
        <h1 className="title">欢迎来到我的网页</h1>
        
        <p className="description">
          这是一个简单的个人主页，你可以在这里展示你的信息、链接和作品。
          编辑 <code>src/App.jsx</code> 来自定义内容。
        </p>
        
        <div className="links">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              className={`link-button ${activeLink === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveLink(index)}
              onMouseLeave={() => setActiveLink(null)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="link-icon">{link.icon}</span>
              <span className="link-name">{link.name}</span>
            </a>
          ))}
        </div>
      </div>
      
      <footer className="footer">
        <p>Made with ❤️ using React + Vite</p>
      </footer>
    </div>
  )
}

export default App
