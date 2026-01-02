import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import { getUsersForMessaging, sendMessage, getMessages } from "../api/api";
import { Send, Search, Trash } from "lucide-react";

const socket = io("http://localhost:5000", { autoConnect: false });

const AdminMessages = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]); // ✅ Track selected messages
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  const currentUserId = user?._id || user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersForMessaging();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      setLoading(true);
      const data = await getMessages(userId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    if (!user?._id) return;

    socket.connect();
    socket.emit("join", user._id);

    const handleReceive = (message) => {
      if (!selectedUser) return;

      const senderId = message.sender?._id || message.sender;
      const receiverId = message.receiver?._id || message.receiver;

      if (
        (senderId === selectedUser && receiverId === user._id) ||
        (senderId === user._id && receiverId === selectedUser)
      ) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [user?._id, selectedUser]);

  const selectUser = (u) => {
    setSelectedUser(u._id);
    setSelectedUserName(u.fullName || u.email);
    setMessages([]);
    setSelectedMessages([]); // clear selected messages on new user
    fetchMessages(u._id);
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;

    try {
      const res = await sendMessage({ to: selectedUser, text });
      const msg = res.data;

      socket.emit("send_message", {
        senderId: msg.sender._id || msg.sender,
        receiverId: msg.receiver._id || msg.receiver,
        text: msg.text,
        _id: msg._id,
        createdAt: msg.createdAt,
      });

      setMessages((prev) => [...prev, msg]);
      setText("");
    } catch (err) {
      console.error("Send message error:", err);
      alert("Message send failed");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUserObj = users.find((u) => u._id === selectedUser);

  // ✅ Toggle message selection
  const toggleSelectMessage = (msgId) => {
    setSelectedMessages((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
  };

  // ✅ Delete selected messages
  const deleteSelectedMessages = () => {
    if (selectedMessages.length === 0) return;
    const confirmed = window.confirm("Are you sure you want to delete selected messages?");
    if (!confirmed) return;

    setMessages((prev) => prev.filter((m) => !selectedMessages.includes(m._id)));
    setSelectedMessages([]);
    // Optionally, send API request to delete from backend
    // await deleteMessagesAPI(selectedUser, selectedMessages);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f3f4f6" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 250, display: "flex" }}>
        {/* Users Sidebar */}
        <div style={{ width: 380, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#f3f4f6", padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600 }}>
                {user?.fullName?.charAt(0) || "A"}
              </div>
              <span style={{ fontWeight: 600, color: "#1f2937" }}>Admin Chat</span>
            </div>
          </div>
          <div style={{ padding: 12, background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 8, paddingBottom: 8, background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 14, outline: "none" }}
              />
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af" }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && users.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>No users found</div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u._id} onClick={() => selectUser(u)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, cursor: "pointer", background: selectedUser === u._id ? "#f3f4f6" : "#fff", borderBottom: "1px solid #f3f4f6", transition: "background 0.2s" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 18 }}>
                    {u.fullName?.charAt(0) || u.email?.charAt(0) || "U"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 600, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.fullName || u.email || "Unknown User"}</h3>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: 0, marginTop: 2 }}>{u.role}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div style={{ background: "#fff", padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 18 }}>
                    {selectedUserName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, color: "#111827", margin: 0, fontSize: 16 }}>{selectedUserName}</h3>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{selectedUserObj?.role || "user"}</p>
                  </div>
                </div>
                {/* Delete selected messages button */}
                {selectedMessages.length > 0 && (
                  <button onClick={deleteSelectedMessages} style={{ background: "#ef4444", border: "none", padding: "8px 12px", borderRadius: 6, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <Trash style={{ width: 16, height: 16 }} /> Delete
                  </button>
                )}
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map((m) => {
                  const isMe = (m.sender?._id || m.sender) === currentUserId;
                  const isSelected = selectedMessages.includes(m._id);

                  return (
                    <div
                      key={m._id}
                      onClick={() => toggleSelectMessage(m._id)}
                      style={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                        gap: 8,
                        border: isSelected ? "2px solid #2563eb" : "none",
                        borderRadius: 8,
                        padding: isSelected ? 2 : 0,
                        cursor: "pointer",
                      }}
                    >
                      {!isMe && (
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600 }}>
                          {m.sender?.fullName?.charAt(0) || "U"}
                        </div>
                      )}
                      <div style={{ maxWidth: "65%", background: isMe ? "#2563eb" : "#fff", color: isMe ? "#fff" : "#111827", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "12px 16px", boxShadow: isMe ? "0 2px 8px rgba(37, 99, 235, 0.3)" : "0 2px 8px rgba(0,0,0,0.08)" }}>
                        {!isMe && <p style={{ fontSize: 11, color: "#3b82f6", margin: "0 0 6px 0", fontWeight: 600 }}>{m.sender?.fullName || "User"}</p>}
                        <p style={{ margin: 0, fontSize: 14 }}>{m.text}</p>
                        <div style={{ fontSize: 10, color: isMe ? "rgba(255,255,255,0.75)" : "#9ca3af", textAlign: "right", marginTop: 6 }}>{formatTime(m.createdAt)}</div>
                      </div>
                      {isMe && (
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600 }}>
                          {user?.fullName?.charAt(0) || "A"}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 16, borderTop: "2px solid #e5e7eb" }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: "12px 18px", borderRadius: 24, border: "2px solid #e5e7eb", outline: "none", fontSize: 14 }}
                />
                <button onClick={handleSend} disabled={!text.trim()} style={{ padding: 12, borderRadius: "50%", border: "none", background: text.trim() ? "#2563eb" : "#e5e7eb", color: "#fff", cursor: text.trim() ? "pointer" : "not-allowed" }}>
                  <Send style={{ width: 20, height: 20 }} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 64 }}>💬</div>
              <div style={{ textAlign: "center", color: "#6b7280", fontSize: 16 }}>Select a user to start messaging</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
