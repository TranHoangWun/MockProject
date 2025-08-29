import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './MessengerStyle.css';
import { FaSearch, FaEdit, FaEllipsisH, FaInbox, FaTrash } from 'react-icons/fa';
import { currentUsers } from "../../services/authService";

// Hàm tiện ích để đọc/ghi localStorage
const getFromStorage = (key, defaultValue = []) => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return defaultValue;
    
    const parsedValue = JSON.parse(value);
    // Nếu đang yêu cầu một mảng, đảm bảo trả về mảng
    if (Array.isArray(defaultValue) && !Array.isArray(parsedValue)) {
      return defaultValue;
    }
    return parsedValue;
  } catch (error) {
    console.error(`Lỗi đọc ${key} từ localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Lỗi lưu ${key} vào localStorage:`, error);
  }
};

const MessageCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [deletedConversations, setDeletedConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingDeleted, setViewingDeleted] = useState(false);
  
  // Tải danh sách hội thoại có tính đến việc đã xóa
  const loadConversations = () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Đảm bảo allConversations luôn là một mảng
      const allConversations = getFromStorage('conversations', []);
      
      // Lọc hội thoại của người dùng hiện tại
      const userConversations = allConversations.filter(conv => 
        conv && 
        Array.isArray(conv.participants) && 
        conv.participants.includes(user.id) &&
        // Kiểm tra xem người dùng hiện tại có trong danh sách đã xóa không
        (!conv.deletedBy || !conv.deletedBy.includes(user.id))
      );
      
      // Lọc các hội thoại đã bị người dùng xóa (cho chế độ xem tin nhắn đã xóa)
      const userDeletedConversations = allConversations.filter(conv => 
        conv && 
        Array.isArray(conv.participants) && 
        conv.participants.includes(user.id) &&
        conv.deletedBy && 
        conv.deletedBy.includes(user.id)
      );
      
      // Nhóm hội thoại theo người dùng khác để gộp chúng lại
      const conversationsByUser = {};
      
      userConversations.forEach(conv => {
        if (!conv || !Array.isArray(conv.participants)) return;
        
        // Tìm ID người dùng khác
        const otherParticipantId = conv.participants.find(id => id !== user.id);
        if (!otherParticipantId) return;
        
        // Tạo khóa đại diện cho cuộc hội thoại với người dùng này
        const userKey = `user-${otherParticipantId}`;
        
        if (!conversationsByUser[userKey]) {
          conversationsByUser[userKey] = [];
        }
        conversationsByUser[userKey].push(conv);
      });
      
      // Mảng kết quả cuối cùng
      const mergedConversations = [];
      
      // Xử lý từng nhóm hội thoại theo người dùng
      Object.values(conversationsByUser).forEach(conversations => {
        if (conversations.length === 0) return;
        
        if (conversations.length === 1) {
          // Nếu chỉ có một hội thoại, thêm vào kết quả
          mergedConversations.push(conversations[0]);
        } else {
          // Nếu có nhiều hội thoại với cùng một người, gộp chúng lại
          const primaryConversation = conversations[0];
          const otherConversations = conversations.slice(1);
          
          // Thu thập tất cả tin nhắn
          let allMessages = [...primaryConversation.messages];
          let allJobIds = primaryConversation.jobIds || [];
          
          if (primaryConversation.jobId && !allJobIds.includes(primaryConversation.jobId)) {
            allJobIds.push(primaryConversation.jobId);
          }
          
          otherConversations.forEach(conv => {
            // Gộp tin nhắn
            if (Array.isArray(conv.messages)) {
              allMessages = [...allMessages, ...conv.messages];
            }
            
            // Gộp jobIds
            if (conv.jobId && !allJobIds.includes(conv.jobId)) {
              allJobIds.push(conv.jobId);
            }
            if (Array.isArray(conv.jobIds)) {
              conv.jobIds.forEach(id => {
                if (!allJobIds.includes(id)) allJobIds.push(id);
              });
            }
          });
          
          // Sắp xếp tin nhắn theo thời gian
          allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          // Cập nhật hội thoại chính
          primaryConversation.messages = allMessages;
          primaryConversation.jobIds = allJobIds;
          
          mergedConversations.push(primaryConversation);
        }
      });
      
      // Lấy thông tin người dùng và nhà tuyển dụng
      const users = getFromStorage('users', []);
      const employerProfiles = getFromStorage('employerProfiles', {});
      
      // Làm giàu thông tin các hội thoại
      const enrichConversationInfo = (conv) => {
        if (!conv || !Array.isArray(conv.participants)) {
          return null; // Bỏ qua hội thoại không hợp lệ
        }
        
        // Tìm ID người tham gia khác
        const otherParticipantId = conv.participants.find(id => id !== user.id);
        
        // Check if this user still exists in the system
        const userStillExists = currentUsers.some(u => u.id === otherParticipantId);
        
        // Tìm thông tin người tham gia khác
        let otherParticipantInfo = { 
          name: userStillExists ? "Người dùng không xác định" : "Người dùng không xác định (đã xóa)",
          deleted: !userStillExists
        };
        
        // Tìm trong danh sách người dùng
        const otherUser = users.find(u => u && u.id === otherParticipantId);
        
        if (otherUser) {
          otherParticipantInfo = {
            id: otherUser.id,
            name: otherUser.profile?.fullName || otherUser.profile?.companyName || otherUser.username || "Không xác định",
            avatar: otherUser.profile?.image || null,
            role: otherUser.role || "unknown"
          };
        } 
        // Nếu không tìm thấy, tìm trong danh sách nhà tuyển dụng
        else if (employerProfiles && employerProfiles[otherParticipantId]) {
          otherParticipantInfo = {
            id: otherParticipantId,
            name: employerProfiles[otherParticipantId].companyName || "Nhà tuyển dụng",
            avatar: employerProfiles[otherParticipantId].profileImage || null,
            role: "employer"
          };
        }
        
        // Đảm bảo conv.messages luôn là một mảng
        const messages = Array.isArray(conv.messages) ? conv.messages : [];
        
        // Lấy tin nhắn cuối cùng
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        
        // Định dạng thời gian
        const formattedTime = lastMessage?.timestamp 
          ? new Date(lastMessage.timestamp).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
            })
          : '';
        
        // Đếm số tin nhắn chưa đọc
        const unreadCount = messages.filter(m => 
          m && !m.read && m.senderId !== user.id
        ).length || 0;
        
        return {
          ...conv,
          messages: messages,
          otherParticipant: {
            ...otherParticipantInfo,
            deleted: !userStillExists
          },
          lastMessagePreview: lastMessage?.text || "Không có tin nhắn",
          lastMessageTime: formattedTime,
          unreadCount
        };
      };
      
      const enrichedConversations = mergedConversations.map(enrichConversationInfo).filter(Boolean);
      const enrichedDeletedConversations = userDeletedConversations.map(enrichConversationInfo).filter(Boolean);
      
      // Sắp xếp theo thời gian tin nhắn mới nhất
      const sortByLastMessage = (a, b) => {
        const lastA = a.messages && a.messages.length > 0 ? a.messages[a.messages.length - 1]?.timestamp || 0 : 0;
        const lastB = b.messages && b.messages.length > 0 ? b.messages[b.messages.length - 1]?.timestamp || 0 : 0;
        return new Date(lastB) - new Date(lastA);
      };
      
      enrichedConversations.sort(sortByLastMessage);
      enrichedDeletedConversations.sort(sortByLastMessage);
      
      setConversations(enrichedConversations);
      setDeletedConversations(enrichedDeletedConversations);
      
      // Lưu lại các hội thoại đã gộp (nếu cần)
      if (mergedConversations.length !== allConversations.length) {
        saveToStorage('conversations', [...mergedConversations, ...userDeletedConversations]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tin nhắn:", error);
      setConversations([]);
      setDeletedConversations([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm khôi phục tin nhắn đã xóa
  const restoreConversation = (conversationId) => {
    try {
      const allConversations = getFromStorage('conversations', []);
      const conversationIndex = allConversations.findIndex(c => c.id === conversationId);
      
      if (conversationIndex !== -1 && allConversations[conversationIndex].deletedBy) {
        // Xóa ID người dùng khỏi mảng deletedBy
        allConversations[conversationIndex].deletedBy = 
          allConversations[conversationIndex].deletedBy.filter(id => id !== user.id);
        
        saveToStorage('conversations', allConversations);
        
        // Cập nhật UI
        loadConversations();
      }
    } catch (error) {
      console.error('Lỗi khi khôi phục tin nhắn:', error);
    }
  };

  // Tải danh sách hội thoại khi component mount
  useEffect(() => {
    if (user) {
      // Tải lần đầu
      loadConversations();
      
      // Thiết lập cập nhật định kỳ
      const intervalId = setInterval(loadConversations, 10000);
      
      // Xóa interval khi component unmount
      return () => clearInterval(intervalId);
    }
  }, [user]);
  
  // Lọc danh sách hội thoại theo từ khóa tìm kiếm
  const currentList = viewingDeleted ? deletedConversations : conversations;
  const filteredConversations = currentList.filter(conv =>
    conv.otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container my-4">
      <div className="messenger-container">
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">
              {viewingDeleted ? "Tin nhắn đã xóa" : "Chats"}
            </span>
            <div className="sidebar-actions">
              <button 
                className="sidebar-btn" 
                onClick={() => setViewingDeleted(!viewingDeleted)}
                title={viewingDeleted ? "Xem tin nhắn" : "Xem tin nhắn đã xóa"}
              >
                {viewingDeleted ? <FaInbox /> : <FaTrash />}
              </button>
              <button className="sidebar-btn" onClick={() => navigate('/messages/new')}>
                <FaEdit />
              </button>
            </div>
          </div>

          <div className="search-container">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm trong tin nhắn"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="conversation-list">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
                <div key={conv.id} className="position-relative">
                  {viewingDeleted ? (
                    <div className={`conversation-item`}>
                      <div className="avatar-container">
                        {conv.otherParticipant.avatar ? (
                          <img
                            src={conv.otherParticipant.avatar}
                            alt={conv.otherParticipant.name}
                            className="conversation-avatar"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {conv.otherParticipant.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="status-indicator"></div>
                      </div>
                      
                      <div className="conversation-details flex-grow-1">
                        <div className="conversation-header">
                          <h5 className="conversation-name">{conv.otherParticipant.name}</h5>
                          <span className="conversation-time">{conv.lastMessageTime}</span>
                        </div>
                        
                        <div className="conversation-message-preview">
                          <span className="message-preview">
                            {conv.jobTitle && <span className="job-reference">{conv.jobTitle}: </span>}
                            {conv.lastMessagePreview}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        className="btn btn-sm btn-outline-primary ms-2"
                        onClick={() => restoreConversation(conv.id)}
                        title="Khôi phục tin nhắn"
                      >
                        Khôi phục
                      </button>
                    </div>
                  ) : (
                    <Link
                      to={`/messages/${conv.id}`}
                      className={`conversation-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
                    >
                      <div className="avatar-container">
                        {conv.otherParticipant.avatar ? (
                          <img
                            src={conv.otherParticipant.avatar}
                            alt={conv.otherParticipant.name}
                            className="conversation-avatar"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {conv.otherParticipant.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="status-indicator"></div>
                      </div>
                      
                      <div className="conversation-details">
                        <div className="conversation-header">
                          <h5 className="conversation-name">
                            {conv.otherParticipant.name}
                            {conv.otherParticipant.deleted && 
                              <span className="deleted-badge"> (đã xóa)</span>
                            }
                          </h5>
                          <span className="conversation-time">{conv.lastMessageTime}</span>
                        </div>
                        
                        <div className="conversation-message-preview">
                          <span className="message-preview">
                            {conv.jobTitle && <span className="job-reference">{conv.jobTitle}: </span>}
                            {conv.lastMessagePreview}
                          </span>
                          {conv.unreadCount > 0 && (
                            <div className="unread-badge">{conv.unreadCount}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-conversations">
                <p>
                  {viewingDeleted
                    ? "Không có tin nhắn đã xóa."
                    : `Không tìm thấy cuộc trò chuyện nào${searchTerm ? ` với "${searchTerm}"` : ''}.`}
                </p>
                {!searchTerm && !viewingDeleted && user?.role === 'student' && (
                  <Link to="/student" className="btn btn-outline-primary">
                    Tìm công việc và liên hệ với nhà tuyển dụng
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="chat-area">
          <div className="no-messages text-center">
            <div style={{ fontSize: '60px', color: '#0084ff', marginBottom: '20px' }}>💬</div>
            <h4>Tin nhắn của bạn</h4>
            <p className="text-muted">Chọn một cuộc trò chuyện để xem tin nhắn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;
