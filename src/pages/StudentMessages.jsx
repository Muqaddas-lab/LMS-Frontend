import React, { useEffect, useState, useRef } from "react";
import StudentSidebar from "../components/StudentSidebar";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import { getUsersForMessaging, sendMessage, getMessages, deleteMessage } from "../api/api";
import { Send, Search, Paperclip, Smile, Trash2 } from "lucide-react";

const socket = io("http://localhost:5000", { autoConnect: false });

const StudentMessages = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedAdminName, setSelectedAdminName] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]); // New state for selected messages
  const messagesEndRef = useRef(null);

  const currentUserId = user?._id || user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getUsersForMessaging();
      setAdmins(data.users || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (adminId) => {
    try {
      setLoading(true);
      const data = await getMessages(adminId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectAdmin = (admin) => {
    setSelectedAdmin(admin._id);
    setSelectedAdminName(admin.fullName || admin.email);
    setMessages([]);
    setSelectedMessages([]);
    fetchMessages(admin._id);
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedAdmin || !currentUserId) return;
    try {
      const res = await sendMessage({ to: selectedAdmin, text });
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
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedAdminObj = admins.find((a) => a._id === selectedAdmin);

  useEffect(() => {
    fetchAdmins();
    if (!currentUserId) return;

    socket.connect();
    socket.emit("join", currentUserId);

    const handleReceive = (message) => {
      const senderId = message.sender?._id || message.sender;
      const receiverId = message.receiver?._id || message.receiver;

      if (!selectedAdmin) return;

      if (
        (senderId === selectedAdmin && receiverId === currentUserId) ||
        (senderId === currentUserId && receiverId === selectedAdmin)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [currentUserId, selectedAdmin]);

  // Handle message selection for deletion
  const toggleSelectMessage = (msgId) => {
    setSelectedMessages((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
  };

  // Delete selected messages
  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    try {
      await Promise.all(selectedMessages.map((id) => deleteMessage(id)));
      setMessages((prev) => prev.filter((m) => !selectedMessages.includes(m._id)));
      setSelectedMessages([]);
    } catch (err) {
      console.error("Delete messages error:", err);
      alert("Failed to delete messages");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f3f4f6" }}>
      <StudentSidebar />

      <div style={{ flex: 1, marginLeft: 250, display: "flex" }}>
        {/* Admin Sidebar */}
        <div style={{ width: 380, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#f3f4f6", padding: 16, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600 }}>
              {user?.fullName?.charAt(0) || "S"}
            </div>
            <span style={{ fontWeight: 600, color: "#1f2937" }}>Student Chat</span>
          </div>

          <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 8, paddingBottom: 8, background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 14, outline: "none" }}
              />
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af" }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && admins.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>Loading...</div>
            ) : filteredAdmins.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>No admins found</div>
            ) : (
              filteredAdmins.map((a) => (
                <div
                  key={a._id}
                  onClick={() => selectAdmin(a)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, cursor: "pointer", background: selectedAdmin === a._id ? "#f3f4f6" : "#fff", borderBottom: "1px solid #f3f4f6", transition: "background 0.2s" }}
                  onMouseEnter={(e) => { if (selectedAdmin !== a._id) e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={(e) => { if (selectedAdmin !== a._id) e.currentTarget.style.background = "#fff"; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 18 }}>
                    {a.fullName?.charAt(0) || a.email?.charAt(0) || "A"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 600, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.fullName || a.email || "Admin"}</h3>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: 0, marginTop: 2 }}>{a.role}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>
          {selectedAdmin ? (
            <>
              <div style={{ background: "#fff", padding: 16, display: "flex", alignItems: "center", borderBottom: "2px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 18 }}>
                    {selectedAdminName?.charAt(0) || "A"}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, color: "#111827", margin: 0, fontSize: 16 }}>{selectedAdminName}</h3>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{selectedAdminObj?.role || "admin"}</p>
                  </div>
                </div>
                {selectedMessages.length > 0 && (
                  <button onClick={handleDeleteMessages} style={{ background: "#ef4444", border: "none", padding: 8, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#fff" }}>
                    <Trash2 style={{ width: 16, height: 16 }} /> Delete {selectedMessages.length}
                  </button>
                )}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map((m) => {
                  const isMe = (m.sender?._id || m.sender) === currentUserId;
                  const isSelected = selectedMessages.includes(m._id);
                  return (
                    <div
                      key={m._id}
                      style={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                        gap: 8,
                        cursor: "pointer",
                        opacity: isSelected ? 0.6 : 1,
                        border: isSelected ? "1px solid #ef4444" : "none",
                        borderRadius: 6,
                        padding: 2
                      }}
                      onClick={() => toggleSelectMessage(m._id)}
                    >
                      {!isMe && (
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600 }}>
                          {m.sender?.fullName?.charAt(0) || "U"}
                        </div>
                      )}
                      <div style={{ maxWidth: "65%", background: isMe ? "#10b981" : "#fff", color: isMe ? "#fff" : "#111827", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "12px 16px", boxShadow: isMe ? "0 2px 8px rgba(37, 99, 235, 0.3)" : "0 2px 8px rgba(0,0,0,0.08)" }}>
                        {!isMe && <p style={{ fontSize: 11, color: "#10b981", margin: "0 0 6px 0", fontWeight: 600 }}>{m.sender?.fullName || "User"}</p>}
                        <p style={{ margin: 0, fontSize: 14 }}>{m.text}</p>
                        <div style={{ fontSize: 10, color: isMe ? "rgba(255,255,255,0.75)" : "#9ca3af", textAlign: "right", marginTop: 6 }}>{formatTime(m.createdAt)}</div>
                      </div>
                      {isMe && (
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600 }}>
                          {user?.fullName?.charAt(0) || "A"}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ background: "#fff", padding: 16, borderTop: "2px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10 }}>
                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." style={{ flex: 1, padding: "12px 18px", borderRadius: 24, border: "2px solid #e5e7eb", outline: "none", fontSize: 14 }} />
                <button onClick={handleSend} disabled={!text.trim()} style={{ padding: 12, background: text.trim() ? "#10b981" : "#e5e7eb", color: "#fff", borderRadius: "50%", border: "none", cursor: text.trim() ? "pointer" : "not-allowed" }}><Send style={{ width: 20, height: 20 }} /></button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 64 }}>💬</div>
              <div style={{ textAlign: "center", color: "#6b7280", fontSize: 16 }}>Select an admin to start messaging</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMessages;
