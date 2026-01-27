import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopicDetail from "./pages/topicDetail";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { UserProvider } from "./contexts/UserContext";
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/theme/:themeId" element={<TopicDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/create-post" element={
            <PrivateRoute>
              <CreatePost />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;