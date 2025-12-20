import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getMessages, sendMessage } from "../api/api";
import { useAuth } from "../context/AuthContext";

const Messages = () => {
  // const { user } = useAuth(); // logged-in user
  const { user, logout, loading } = useAuth();
  const [users, setUsers] = useState([]); // list of users to chat with
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");


  // Dummy: Fetch all users (replace with API)
  useEffect(() => {
    fetch("/api/users") // make sure this route exists
      .then((res) => res.json())
      .then((data) => setUsers(data.users.filter(u => u._id !== user._id)));
  }, [user]);

  const fetchMessages = async (userId) => {
    setSelectedUser(userId);
    const res = await getMessages(userId);
    setMessages(res.messages);
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;

    await sendMessage({ to: selectedUser, text });
    setText("");
    fetchMessages(selectedUser);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 250, padding: 20 }}>
        <h2>💬 Messages</h2>
        <div style={{ display: "flex", gap: 20 }}>
          {/* User List */}
          <div style={{ width: 200, borderRight: "1px solid #ccc" }}>
            {users.map((u) => (
              <div
                key={u._id}
                style={{
                  padding: 10,
                  cursor: "pointer",
                  background: selectedUser === u._id ? "#2563eb" : "#f4f4f4",
                  color: selectedUser === u._id ? "#fff" : "#000",
                  marginBottom: 5,
                  borderRadius: 6
                }}
                onClick={() => fetchMessages(u._id)}
              >
                {u.name}
              </div>
            ))}
          </div>

          {/* Chat Box */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "80vh" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: 10, background: "#e5e7eb", borderRadius: 8 }}>
              {messages.map((m) => (
                <div
                  key={m._id}
                  style={{
                    alignSelf: m.sender === user._id ? "flex-end" : "flex-start",
                    background: m.sender === user._id ? "#2563eb" : "#fff",
                    color: m.sender === user._id ? "#fff" : "#000",
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 5,
                    maxWidth: "70%"
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", marginTop: 10, gap: 10 }}>
              <input
                style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                style={{ padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8 }}
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
