import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './MessengerStyle.css';
import { 
  FaArrowLeft, 
  FaPaperPlane, 
  FaEllipsisH,
  FaEdit,
  FaSearch,
  FaFlag, 
  FaTrash,
  FaUserSlash,
  FaUserCheck,
  FaPaperclip,
  FaFile,
  FaFileAlt,
  FaFileArchive,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFilePdf
} from 'react-icons/fa';

// Hàm tiện ích để đọc/ghi localStorage
const getFromStorage = (key, defaultValue = []) => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return defaultValue;
    
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue : defaultValue;
  } catch (error) {
    console.error(`Lỗi đọc ${key} từ localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Lỗi lưu ${key} vào localStorage:`, error);
    return false;
  }
};

const Conversation = () => {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const employerId = searchParams.get('employerId');
  const jobId = searchParams.get('jobId');
  const isNewConversation = !conversationId && employerId;
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [conversation, setConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarConversations, setSidebarConversations] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  
  const messageContainerRef = useRef(null);
  
  // Sửa phương thức tạo ID hội thoại để không phụ thuộc vào job ID
  const createConversationId = () => {
    if (isNewConversation && employerId && user) {
      // Chỉ sử dụng ID của hai người dùng để tạo conversation ID
      const participantIds = [user.id, parseInt(employerId)].sort();
      return `conversation-${participantIds[0]}-${participantIds[1]}`;
    }
    return null;
  };

  const effectiveConversationId = conversationId || createConversationId();
  
  // Tải danh sách hội thoại cho sidebar
  useEffect(() => {
    if (!user) return;
    
    const loadSidebarConversations = () => {
      try {
        // Đảm bảo allConversations luôn là một mảng
        const allConversations = getFromStorage('conversations', []);
        console.log("Tải hội thoại:", allConversations.length);
        
        // Lọc hội thoại của người dùng hiện tại
        const userConversations = allConversations.filter(conv => 
          conv && Array.isArray(conv.participants) && 
          conv.participants.includes(user.id) &&
          (!conv.deletedBy || !conv.deletedBy.includes(user.id)) // Loại bỏ các hội thoại đã bị xóa bởi người dùng
        );
        
        const users = getFromStorage('users', []);
        const employerProfiles = getFromStorage('employerProfiles', {});
        
        const enrichedConversations = userConversations.map(conv => {
          // Đảm bảo conv không null/undefined trước khi truy cập properties
          if (!conv || !Array.isArray(conv.participants)) {
            return {
              id: Date.now(),
              otherParticipant: { name: "Lỗi dữ liệu" },
              lastMessagePreview: "Không thể tải tin nhắn",
              lastMessageTime: "",
              unreadCount: 0
            };
          }
          
          const otherParticipantId = conv.participants.find(id => id !== user.id);
          
          // Tìm thông tin người dùng khác trong cuộc trò chuyện
          let otherParticipantInfo = { name: "Người dùng không xác định" };
          
          // Tìm trong danh sách người dùng
          const otherUser = users.find(u => u && u.id === otherParticipantId);
          
          if (otherUser) {
            otherParticipantInfo = {
              id: otherUser.id,
              name: otherUser.profile?.fullName || otherUser.profile?.companyName || otherUser.username || "Không xác định",
              avatar: otherUser.profile?.image || null,
              role: otherUser.role || "unknown"
            };
          } else if (employerProfiles && employerProfiles[otherParticipantId]) {
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
          
          return {
            ...conv,
            messages: messages, // Đảm bảo messages luôn là một mảng
            otherParticipant: otherParticipantInfo,
            lastMessagePreview: lastMessage?.text || "Không có tin nhắn",
            lastMessageTime: formattedTime,
            unreadCount: messages.filter(m => m && !m.read && m.senderId !== user.id).length || 0
          };
        });
        
        // Sắp xếp theo thời gian tin nhắn mới nhất
        enrichedConversations.sort((a, b) => {
          const lastA = a.messages?.[a.messages.length - 1]?.timestamp || 0;
          const lastB = b.messages?.[b.messages.length - 1]?.timestamp || 0;
          return new Date(lastB) - new Date(lastA);
        });
        
        setSidebarConversations(enrichedConversations);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tin nhắn:", error);
        setSidebarConversations([]); // Đảm bảo luôn set giá trị mảng rỗng nếu có lỗi
      }
    };
    
    // Tải lần đầu
    loadSidebarConversations();
    
    // Thiết lập cập nhật định kỳ
    const intervalId = setInterval(loadSidebarConversations, 5000);
    return () => clearInterval(intervalId);
  }, [user]);
  
  // Tải hội thoại
  useEffect(() => {
    if (!user) return;
    
    if (isNewConversation && employerId) {
      initializeNewConversation();
    } else if (conversationId) {
      loadConversation();
    }
  }, [user, conversationId, employerId, jobId]);
  
  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messageContainerRef.current && conversation?.messages?.length) {
      // Đảm bảo cuộn sau khi component render
      setTimeout(() => {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [conversation?.messages]);
  
  // Add function to check if user is blocked
  const checkIfBlocked = (otherUserId) => {
    try {
      if (!user || !otherUserId) return false;
      
      const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '{}');
      const currentUserBlockList = blockedUsers[user.id] || [];
      
      return currentUserBlockList.includes(Number(otherUserId));
    } catch (error) {
      console.error('Error checking blocked status:', error);
      return false;
    }
  };

  // Add this function to check if the other user has blocked the current user
  const checkIfUserIsBlockedByOther = (otherUserId) => {
    try {
      if (!user || !otherUserId) return false;
      
      const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '{}');
      // Check if the other user has a blocklist containing the current user's ID
      const otherUserBlockList = blockedUsers[otherUserId] || [];
      
      return otherUserBlockList.includes(Number(user.id));
    } catch (error) {
      console.error('Error checking if blocked by other user:', error);
      return false;
    }
  };

  // Add a state to track if user is blocked by the other user
  const [blockedByOther, setBlockedByOther] = useState(false);

  // Add this effect to check block status when other user is loaded
  useEffect(() => {
    if (otherUser && otherUser.id) {
      const blocked = checkIfBlocked(otherUser.id);
      setIsBlocked(blocked);
    }
  }, [otherUser, user]);

  // Update the useEffect that checks block status to also check if blocked by other
  useEffect(() => {
    if (otherUser && otherUser.id && user) {
      const blocked = checkIfBlocked(otherUser.id);
      const blockedBy = checkIfUserIsBlockedByOther(otherUser.id);
      setIsBlocked(blocked);
      setBlockedByOther(blockedBy);
    }
  }, [otherUser, user]);

  // Cần sửa initializeNewConversation() để tìm và gộp hội thoại với cùng người dùng
  const initializeNewConversation = async () => {
    if (!employerId || !user) return;
    
    try {
      // Tìm thông tin nhà tuyển dụng
      const users = getFromStorage('users', []);
      const employerProfiles = getFromStorage('employerProfiles', {});
      
      let employerInfo = null;
      const employerUser = users.find(u => u.id === parseInt(employerId));
      
      if (employerUser) {
        employerInfo = {
          id: employerUser.id,
          name: employerUser.profile?.companyName || employerUser.profile?.fullName || employerUser.username,
          avatar: employerUser.profile?.image || null,
          role: employerUser.role,
          active: true
        };
      } else if (employerProfiles[employerId]) {
        employerInfo = {
          id: parseInt(employerId),
          name: employerProfiles[employerId].companyName || "Nhà tuyển dụng",
          avatar: employerProfiles[employerId].profileImage || null,
          role: "employer",
          active: true
        };
      }
      
      if (!employerInfo) {
        console.error("Không tìm thấy thông tin nhà tuyển dụng");
        navigate('/messages');
        return;
      }
      
      setOtherUser(employerInfo);
      
      // Tìm thông tin công việc nếu có
      if (jobId) {
        const contactJobCache = getFromStorage('contactJob', null);
        if (contactJobCache && contactJobCache.jobId === parseInt(jobId)) {
          setJobDetails(contactJobCache);
        } else {
          const allJobs = getFromStorage('employerJobs');
          const job = allJobs.find(j => j.id === parseInt(jobId));
          if (job) {
            setJobDetails({
              jobId: job.id,
              jobTitle: job.jobTitle || job.title,
              employerId: job.employerId,
              companyName: job.companyName || job.company
            });
          }
        }
      }
      
      // Tạo ID hội thoại chung giữa 2 người dùng (không dùng jobId)
      const participantIds = [user.id, parseInt(employerId)].sort();
      const conversationBaseId = `conversation-${participantIds[0]}-${participantIds[1]}`;
      
      // Tìm kiếm tất cả hội thoại hiện có giữa hai người
      const allConversations = getFromStorage('conversations', []);
      
      // Tìm hội thoại có chứa cả hai người dùng này
      const existingConversations = allConversations.filter(c => 
        c && c.id && c.id.startsWith(conversationBaseId)
      );
      
      // Nếu đã có ít nhất một hội thoại, sử dụng hội thoại đầu tiên
      if (existingConversations.length > 0) {
        // Sắp xếp theo thời gian tin nhắn mới nhất
        existingConversations.sort((a, b) => {
          const lastMsgA = a.messages && a.messages.length > 0 ? 
            new Date(a.messages[a.messages.length - 1].timestamp) : new Date(0);
          const lastMsgB = b.messages && b.messages.length > 0 ? 
            new Date(b.messages[b.messages.length - 1].timestamp) : new Date(0);
          return lastMsgB - lastMsgA;
        });
        
        const primaryConversation = existingConversations[0];
        
        // Thêm thông tin công việc mới nếu có
        if (jobId && !primaryConversation.jobIds) {
          primaryConversation.jobIds = [parseInt(jobId)];
        } else if (jobId && !primaryConversation.jobIds.includes(parseInt(jobId))) {
          primaryConversation.jobIds.push(parseInt(jobId));
        }
        
        // Sử dụng hội thoại đã có
        setConversation(primaryConversation);
        
        if (!conversationId) {
          navigate(`/messages/${primaryConversation.id}`);
        }
        
        // Cập nhật thông tin công việc nếu có
        if (jobId) {
          setJobDetails({
            jobId: parseInt(jobId),
            jobTitle: jobDetails?.jobTitle || null,
            employerId: parseInt(employerId)
          });
        }
      } else {
        // Tạo hội thoại mới nếu chưa có
        const newConversation = {
          id: conversationBaseId, // Sử dụng ID cơ bản không có jobId
          participants: [user.id, parseInt(employerId)],
          jobIds: jobId ? [parseInt(jobId)] : [], // Lưu danh sách jobId thay vì một jobId duy nhất
          jobTitle: jobDetails?.jobTitle || null,
          messages: [],
          createdAt: new Date().toISOString()
        };
        
        setConversation(newConversation);
        
        allConversations.push(newConversation);
        saveToStorage('conversations', allConversations);
        
        if (!conversationId) {
          navigate(`/messages/${newConversation.id}`);
        }
      }
      
      // Đồng thời, nếu có nhiều hội thoại giữa hai người, hãy gộp chúng lại
      if (existingConversations.length > 1) {
        // Giữ lại hội thoại đầu tiên và gộp tin nhắn từ các hội thoại khác
        const primaryConversation = existingConversations[0];
        const otherConversations = existingConversations.slice(1);
        
        // Thu thập tất cả các tin nhắn từ các hội thoại khác
        let allMessages = [...primaryConversation.messages];
        let allJobIds = primaryConversation.jobIds || [];
        
        otherConversations.forEach(conv => {
          // Thêm tin nhắn
          if (Array.isArray(conv.messages)) {
            allMessages = [...allMessages, ...conv.messages];
          }
          
          // Thu thập job IDs
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
        
        // Xóa các hội thoại khác
        const updatedAllConversations = allConversations.filter(c => 
          !otherConversations.some(oc => oc.id === c.id)
        );
        
        // Cập nhật lại localStorage
        saveToStorage('conversations', updatedAllConversations);
        
        // Nếu đang ở trong một trong các hội thoại đã bị gộp, chuyển hướng
        if (conversationId && otherConversations.some(c => c.id === conversationId)) {
          navigate(`/messages/${primaryConversation.id}`);
        }
      }
    } catch (error) {
      console.error("Lỗi khi khởi tạo hội thoại mới:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Tải hội thoại hiện có
  const loadConversation = () => {
    try {
      const allConversations = getFromStorage('conversations');
      const currentConversation = allConversations.find(c => c.id === conversationId);
      
      if (!currentConversation) {
        console.error("Không tìm thấy hội thoại");
        navigate('/messages');
        return;
      }
      
      setConversation(currentConversation);
      
      // Tìm thông tin người tham gia khác
      const otherParticipantId = currentConversation.participants.find(id => id !== user.id);
      
      if (otherParticipantId) {
        const users = getFromStorage('users');
        const employerProfiles = getFromStorage('employerProfiles', {});
        
        const otherParticipant = users.find(u => u.id === otherParticipantId);
        
        if (otherParticipant) {
          setOtherUser({
            id: otherParticipant.id,
            name: otherParticipant.profile?.fullName || otherParticipant.profile?.companyName || otherParticipant.username,
            avatar: otherParticipant.profile?.image || null,
            role: otherParticipant.role,
            active: true
          });
        } else if (employerProfiles[otherParticipantId]) {
          setOtherUser({
            id: otherParticipantId,
            name: employerProfiles[otherParticipantId].companyName || "Nhà tuyển dụng",
            avatar: employerProfiles[otherParticipantId].profileImage || null,
            role: "employer",
            active: true
          });
        } else {
          setOtherUser({
            id: otherParticipantId,
            name: "Người dùng không xác định",
            avatar: null,
            role: "unknown",
            active: false
          });
        }
      }
      
      // Cập nhật thông tin công việc
      if (currentConversation.jobId) {
        setJobDetails({
          jobId: currentConversation.jobId,
          jobTitle: currentConversation.jobTitle,
          employerId: otherParticipantId
        });
      }
      
      // Đánh dấu tin nhắn đã đọc
      markMessagesAsRead(currentConversation);
    } catch (error) {
      console.error("Lỗi khi tải hội thoại:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Đánh dấu tin nhắn đã đọc
  const markMessagesAsRead = (conv) => {
    if (!conv || !conv.id) return;
    
    const allConversations = getFromStorage('conversations');
    const conversationIndex = allConversations.findIndex(c => c.id === conv.id);
    
    if (conversationIndex === -1) return;
    
    let hasChanges = false;
    const updatedMessages = conv.messages.map(message => {
      if (!message.read && message.senderId !== user.id) {
        hasChanges = true;
        return { ...message, read: true };
      }
      return message;
    });
    
    if (hasChanges) {
      const updatedConversation = {
        ...conv,
        messages: updatedMessages
      };
      
      allConversations[conversationIndex] = updatedConversation;
      saveToStorage('conversations', allConversations);
      setConversation(updatedConversation);
    }
  };
  
  // Add function to handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tăng kích thước tối đa lên 100MB
      if (file.size > 100 * 1024 * 1024) {
        alert("Kích thước tệp không được vượt quá 100MB");
        return;
      }
      
      // Cảnh báo người dùng về các file lớn
      if (file.size > 20 * 1024 * 1024) {
        const confirmUpload = window.confirm(
          "File có kích thước rất lớn có thể gây khó khăn khi lưu trữ. Bạn có chắc chắn muốn tiếp tục?"
        );
        if (!confirmUpload) {
          return;
        }
      }
      
      setAttachment(file);
    }
  };

  // Helper function to compress image if needed - improved with quality settings
  const compressImage = (file, maxSize) => {
    return new Promise((resolve) => {
      // If it's not an image or already small enough, return as is
      if (!file.type.startsWith('image/') || file.size <= maxSize) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Calculate scale - larger images get more compression
          let scale = 1;
          if (file.size > 50 * 1024 * 1024) {
            scale = 0.4; // 40% size for extremely large images
          } else if (file.size > 20 * 1024 * 1024) {
            scale = 0.5; // 50% size for very large images
          } else if (file.size > 10 * 1024 * 1024) {
            scale = 0.65; // 65% size for large images
          } else {
            scale = 0.75; // 75% for medium images
          }
          
          const width = img.width * scale;
          const height = img.height * scale;
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Adjust quality based on original file size
          let quality = 0.7;
          if (file.size > 50 * 1024 * 1024) {
            quality = 0.4; // Lower quality for extremely large files
          } else if (file.size > 20 * 1024 * 1024) {
            quality = 0.5; // Lower quality for very large files
          } else if (file.size > 10 * 1024 * 1024) {
            quality = 0.6; // Medium quality for large files
          }
          
          // Convert to blob with reduced quality
          canvas.toBlob((blob) => {
            if (blob) {
              // Create a new file from the blob
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              console.log(`File compressed: ${(file.size/(1024*1024)).toFixed(2)}MB → ${(compressedFile.size/(1024*1024)).toFixed(2)}MB`);
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          }, file.type, quality);
        };
      };
    });
  };

  // Modified to handle large files better
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    const messageText = newMessage.trim();
    if ((!messageText && !attachment) || !conversation) return;
    
    // Check if either user has blocked the other
    if (isBlocked || blockedByOther) {
      alert(isBlocked 
        ? "Bạn đã chặn người dùng này. Vui lòng bỏ chặn để tiếp tục nhắn tin."
        : "Bạn không thể gửi tin nhắn cho người dùng này.");
      return;
    }
    
    try {
      // Create basic message without attachment
      let message = {
        id: Date.now(),
        text: messageText,
        senderId: user.id,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Get conversations
      const allConversations = getFromStorage('conversations', []);
      
      // If there's no attachment, send message immediately
      if (!attachment) {
        saveMessageToConversation(allConversations, message);
        return;
      }
      
      // Show sending indicator
      setNewMessage('Đang gửi tệp đính kèm...');
      
      // Process attachment - with improved handling for large files
      const processFile = async () => {
        try {
          // First compress if it's an image and large
          const processedFile = await compressImage(attachment, 5 * 1024 * 1024);
          
          // For very large files, show additional warning
          if (processedFile.size > 20 * 1024 * 1024) {
            const confirmSend = window.confirm(
              "Tệp đính kèm có kích thước rất lớn và có thể không lưu thành công. Bạn vẫn muốn tiếp tục?"
            );
            if (!confirmSend) {
              setNewMessage(messageText);
              return;
            }
          }
          
          // Convert file to base64 for storage
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const base64Data = reader.result;
              
              message.attachment = {
                name: processedFile.name,
                type: processedFile.type,
                data: base64Data,
                size: processedFile.size
              };
              
              // Try to save with attachment
              try {
                saveMessageToConversation(allConversations, message);
              } catch (storageError) {
                console.error("Lỗi lưu trữ, gửi không kèm tệp đính kèm:", storageError);
                // Send message without attachment if storage fails
                delete message.attachment;
                message.text = messageText || `[Không thể gửi tệp đính kèm "${processedFile.name}" do giới hạn lưu trữ]`;
                saveMessageToConversation(allConversations, message);
              }
            } catch (error) {
              console.error("Lỗi khi xử lý tệp đính kèm:", error);
              // Send message without attachment
              if (messageText) {
                delete message.attachment;
                saveMessageToConversation(allConversations, message);
              } else {
                alert("Không thể gửi tệp đính kèm. Vui lòng thử lại với tệp nhỏ hơn.");
                setNewMessage('');
              }
            }
          };
          
          reader.onerror = () => {
            console.error("Lỗi đọc tệp đính kèm");
            if (messageText) {
              delete message.attachment;
              saveMessageToConversation(allConversations, message);
            } else {
              alert("Không thể đọc tệp đính kèm. Vui lòng thử lại.");
              setNewMessage('');
            }
          };
          
          reader.readAsDataURL(processedFile);
        } catch (error) {
          console.error("Lỗi xử lý tệp:", error);
          if (messageText) {
            delete message.attachment;
            saveMessageToConversation(allConversations, message);
          } else {
            alert("Có lỗi xảy ra khi xử lý tệp đính kèm.");
            setNewMessage('');
          }
        }
      };
      
      processFile();
    } catch (error) {
      console.error("Lỗi chi tiết khi gửi tin nhắn:", error);
      alert("Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.");
      setNewMessage(messageText);
    }
  };

  // Helper function to save message to conversation with improved error handling
  const saveMessageToConversation = (allConversations, message) => {
    try {
      // Tìm vị trí của hội thoại hiện tại
      const conversationIndex = allConversations.findIndex(c => c && c.id === conversation.id);
      
      // Cập nhật hoặc tạo mới
      let updatedConversation;
      let updatedAllConversations;
      
      if (conversationIndex === -1) {
        // Hội thoại chưa tồn tại, tạo mới
        updatedConversation = {
          ...conversation,
          messages: [message]
        };
        updatedAllConversations = [...allConversations, updatedConversation];
      } else {
        // Hội thoại đã tồn tại, cập nhật tin nhắn
        updatedConversation = {
          ...allConversations[conversationIndex],
          messages: [...(allConversations[conversationIndex].messages || []), message]
        };
        
        // Tạo mảng mới với hội thoại đã được cập nhật
        updatedAllConversations = [...allConversations];
        updatedAllConversations[conversationIndex] = updatedConversation;
      }
      
      // Save to localStorage with chunking for large data
      try {
        // First try direct save
        localStorage.setItem('conversations', JSON.stringify(updatedAllConversations));
        
        // Update state after successful save
        setConversation(updatedConversation);
        setNewMessage('');
        setAttachment(null);
        
        // Scroll to bottom
        setTimeout(() => {
          if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
          }
        }, 100);
      } catch (storageError) {
        console.error("Lỗi khi lưu vào localStorage:", storageError);
        
        // If there was an error and we have an attachment, try to save without attachment
        if (message.attachment) {
          // Create a copy without attachment
          const messageWithoutAttachment = {...message};
          delete messageWithoutAttachment.attachment;
          messageWithoutAttachment.text = messageWithoutAttachment.text || 
            `[Đã cố gửi tệp đính kèm "${message.attachment.name}" nhưng không thành công do giới hạn lưu trữ]`;
          
          // Try again with the simpler message
          try {
            // Update the conversation with the simplified message
            if (conversationIndex === -1) {
              updatedConversation = {
                ...conversation,
                messages: [messageWithoutAttachment]
              };
              updatedAllConversations = [...allConversations, updatedConversation];
            } else {
              updatedConversation = {
                ...allConversations[conversationIndex],
                messages: [...(allConversations[conversationIndex].messages || []), messageWithoutAttachment]
              };
              updatedAllConversations = [...allConversations];
              updatedAllConversations[conversationIndex] = updatedConversation;
            }
            
            localStorage.setItem('conversations', JSON.stringify(updatedAllConversations));
            setConversation(updatedConversation);
            setNewMessage('');
            setAttachment(null);
            
            alert("Tin nhắn đã được gửi nhưng không thể lưu tệp đính kèm do giới hạn bộ nhớ.");
            
            // Scroll to bottom
            setTimeout(() => {
              if (messageContainerRef.current) {
                messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
              }
            }, 100);
          } catch (finalError) {
            console.error("Lỗi khi lưu tin nhắn đơn giản:", finalError);
            throw new Error('Không thể lưu tin nhắn vào bộ nhớ, vui lòng thử lại với nội dung ngắn hơn');
          }
        } else {
          throw new Error('Không thể lưu tin nhắn vào bộ nhớ');
        }
      }
    } catch (error) {
      console.error("Chi tiết lỗi khi lưu tin nhắn:", error);
      alert(error.message || "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.");
      throw error; // Re-throw to be caught by the calling function
    }
  };

  // Helper function to get icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FaFileImage />;
    if (fileType.includes('pdf')) return <FaFilePdf />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return <FaFileArchive />;
    if (fileType.includes('word') || fileType.includes('doc')) return <FaFileWord />;
    if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('xls')) return <FaFileExcel />;
    if (fileType.includes('powerpoint') || fileType.includes('presentation') || fileType.includes('ppt')) return <FaFilePowerpoint />;
    if (fileType.includes('text')) return <FaFileAlt />;
    return <FaFile />; // Default icon
  };

  // Format thời gian tin nhắn
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // Nếu cùng ngày, hiển thị giờ:phút
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Nếu cùng năm, hiển thị ngày/tháng và giờ:phút
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
    
    // Nếu khác năm, hiển thị đầy đủ
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Modify the handleBlockUser function to toggle between block and unblock
  const handleBlockUser = () => {
    if (!otherUser || !user) return;
    
    try {
      // Get currently blocked users
      const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '{}');
      
      // Make sure the current user has an entry
      if (!blockedUsers[user.id]) {
        blockedUsers[user.id] = [];
      }
      
      const otherUserId = Number(otherUser.id);
      
      if (isBlocked) {
        // If already blocked, unblock the user
        if (window.confirm(`Bạn có chắc chắn muốn bỏ chặn ${otherUser.name || 'người dùng này'}?`)) {
          blockedUsers[user.id] = blockedUsers[user.id].filter(id => id !== otherUserId);
          localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
          setIsBlocked(false);
          alert('Đã bỏ chặn người dùng này');
        }
      } else {
        // If not blocked, block the user
        if (window.confirm(`Bạn có chắc chắn muốn chặn ${otherUser.name || 'người dùng này'}?`)) {
          blockedUsers[user.id].push(otherUserId);
          localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
          setIsBlocked(true);
          alert('Đã chặn người dùng này');
        }
      }
    } catch (error) {
      console.error('Error toggling block status:', error);
      alert('Đã xảy ra lỗi khi thực hiện thao tác này');
    }
  };

  const handleReportConversation = () => {
    const reason = prompt(`Vui lòng nhập lý do báo cáo ${otherUser?.name || 'người dùng này'}:`);
    if (reason) {
      // Implement reporting functionality here
      alert('Đã gửi báo cáo tới admin');
    }
  };

  // Cập nhật hàm handleDeleteConversation để chỉ xóa một bên
  const handleDeleteConversation = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ cuộc trò chuyện này?')) {
      try {
        const allConversations = getFromStorage('conversations', []);
        const conversationIndex = allConversations.findIndex(c => c.id === conversation.id);
        
        if (conversationIndex !== -1) {
          // Thay vì xóa hoàn toàn, thêm ID người dùng vào mảng deletedBy
          if (!allConversations[conversationIndex].deletedBy) {
            allConversations[conversationIndex].deletedBy = [];
          }
          
          // Kiểm tra nếu người dùng đã có trong mảng deletedBy
          if (!allConversations[conversationIndex].deletedBy.includes(user.id)) {
            allConversations[conversationIndex].deletedBy.push(user.id);
          }
          
          saveToStorage('conversations', allConversations);
        }
        
        // Chuyển hướng về trang danh sách tin nhắn
        navigate('/messages');
      } catch (error) {
        console.error('Lỗi khi xóa cuộc trò chuyện:', error);
        alert('Có lỗi xảy ra khi xóa cuộc trò chuyện!');
      }
    }
  };

  // Update the message rendering to handle attachments with better file type support
  const renderMessage = (message, index) => {
    const isCurrentUser = message.senderId === user.id;
    const showAvatar = index === 0 || 
                      (index > 0 && 
                       message.senderId !== conversation.messages[index-1].senderId);
    
    return (
      <div 
        key={message.id || index} 
        className={`message ${isCurrentUser ? 'outgoing' : 'incoming'}`}
      >
        {!isCurrentUser && showAvatar && (
          <img 
            src={otherUser?.avatar || '/default-avatar.png'} 
            alt={otherUser?.name || 'User'}
            className="sender-avatar"
          />
        )}
        <div className="message-content">
          {/* Render attachment if present with better file type support */}
          {message.attachment && (
            <div className="message-attachment">
              {message.attachment.type.startsWith('image/') ? (
                <a 
                  href={message.attachment.data} 
                  download={message.attachment.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img 
                    src={message.attachment.data} 
                    alt="Attachment" 
                    className="attachment-image" 
                  />
                </a>
              ) : (
                <a 
                  href={message.attachment.data} 
                  download={message.attachment.name}
                  className="attachment-file"
                >
                  {getFileIcon(message.attachment.type)} 
                  <span className="file-name">{message.attachment.name}</span>
                </a>
              )}
            </div>
          )}
          
          {/* Only render text div if there's text */}
          {message.text && (
            <div className="message-text">{message.text}</div>
          )}
          
          <div className="message-time">
            {formatMessageTime(message.timestamp)}
            {isCurrentUser && (
              <span className="read-status">
                {message.read ? ' ✓✓' : ' ✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container my-4">
      <div className="messenger-container">
        {/* Sidebar danh sách hội thoại */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">Chats</span>
            <div className="sidebar-actions">
              <button className="sidebar-btn">
                <FaEllipsisH />
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
            {sidebarConversations
              .filter(conv => conv.otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(conv => (
                <Link 
                  to={`/messages/${conv.id}`} 
                  key={conv.id} 
                  className={`conversation-item ${conv.id === effectiveConversationId ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
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
                      <h5 className="conversation-name">{conv.otherParticipant.name}</h5>
                      <span className="conversation-time">{conv.lastMessageTime}</span>
                    </div>
                    
                    <div className="conversation-message-preview">
                      <span className="message-preview">
                        {conv.jobTitle && <span className="job-reference">{conv.jobTitle}: </span>}
                        {conv.lastMessagePreview.length > 30 
                          ? conv.lastMessagePreview.substring(0, 30) + "..." 
                          : conv.lastMessagePreview}
                      </span>
                      {conv.unreadCount > 0 && (
                        <div className="unread-badge">{conv.unreadCount}</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
        
        {/* Khu vực hiển thị tin nhắn */}
        <div className="chat-area">
          <div className="conversation-container">
            {/* Header hội thoại */}
            <div className="conversation-header">
              <button 
                className="back-button" 
                onClick={() => navigate('/messages')}
              >
                <FaArrowLeft />
              </button>
              
              <div className="conversation-title">
                <div className="user-avatar">
                  {otherUser?.avatar ? (
                    <img 
                      src={otherUser.avatar} 
                      alt={otherUser.name} 
                      className="conversation-avatar"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div className="status-indicator active"></div>
                </div>
                
                <div className="conversation-info">
                  <h4>{otherUser?.name || "Người dùng không xác định"}</h4>
                  <div className="active-status">Đang hoạt động</div>
                  {jobDetails && (
                    <div className="job-info">
                      {jobDetails.jobTitle}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="header-actions">
                <button 
                  className={`header-btn ${isBlocked ? 'unblock' : 'block'}`} 
                  title={isBlocked ? `Bỏ chặn ${otherUser?.name}` : `Chặn ${otherUser?.name}`} 
                  onClick={handleBlockUser}
                >
                  {isBlocked ? <FaUserCheck /> : <FaUserSlash />}
                </button>
                <button 
                  className="header-btn" 
                  title="Báo cáo với admin" 
                  onClick={handleReportConversation}
                >
                  <FaFlag />
                </button>
                <button 
                  className="header-btn" 
                  title="Xóa cuộc trò chuyện" 
                  onClick={handleDeleteConversation}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            {/* Container hiển thị tin nhắn */}
            <div className="message-container" ref={messageContainerRef}>
              {conversation?.messages && conversation.messages.length > 0 ? (
                conversation.messages.map((message, index) => renderMessage(message, index))
              ) : (
                <div className="no-messages">
                  {isNewConversation ? (
                    <>
                      <div style={{ fontSize: '60px', marginBottom: '20px' }}>👋</div>
                      <p>Hãy bắt đầu cuộc trò chuyện với {otherUser?.name}</p>
                    </>
                  ) : (
                    <p>Chưa có tin nhắn nào trong hội thoại này.</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Form nhập tin nhắn */}
            <form className="message-form" onSubmit={handleSendMessage}>
              {isBlocked || blockedByOther ? (
                <div className="blocked-message-container">
                  {isBlocked ? (
                    <div className="blocked-message">
                      <FaUserSlash className="blocked-icon" />
                      <p>Bạn đã chặn người dùng này. Vui lòng bỏ chặn để tiếp tục nhắn tin.</p>
                      <button 
                        type="button" 
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleBlockUser}
                      >
                        Bỏ chặn
                      </button>
                    </div>
                  ) : (
                    <div className="blocked-message">
                      <FaUserSlash className="blocked-icon" />
                      <p>Bạn không thể gửi tin nhắn cho người dùng này.</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="message-actions">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      // Mở rộng danh sách các loại file được chấp nhận
                      accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.svg"
                    />
                    <button 
                      type="button" 
                      className="action-btn"
                      onClick={() => fileInputRef.current.click()}
                      title="Đính kèm tệp (tối đa 50MB)"
                    >
                      <FaPaperclip />
                    </button>
                  </div>
                  
                  <div className="message-input-container">
                    {attachment && (
                      <div className="attachment-preview">
                        <span>{getFileIcon(attachment.type)} {attachment.name}</span>
                        <span className="file-size">({(attachment.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        <button 
                          type="button"
                          className="remove-attachment-btn"
                          onClick={() => setAttachment(null)}
                        >
                          &times;
                        </button>
                      </div>
                    )}
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Aa"
                      className="message-input"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="send-button"
                    disabled={!newMessage.trim() && !attachment}
                  >
                    <FaPaperPlane />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
