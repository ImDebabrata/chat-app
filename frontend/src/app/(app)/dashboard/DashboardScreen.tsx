import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { fetchUsers } from "@/app/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import useAuth from "@/hooks/useAuth";
import { LoggedInUserInterface } from "@/types/user.types";
import { MessageInterface } from "@/types/message.types";
import { useSearchParams } from "react-router";
import { useSocket } from "@/hooks/useSocket";
import audio from "../../../assets/notification.mp3";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Menu, X, Send, Search } from "lucide-react";

function DashboardScreen() {
  const socket = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<
    LoggedInUserInterface["user"] | null
  >(null);
  const { loggedInUser } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch users
  const { data: users = [], isLoading: loadingUsers } = useQuery<
    (LoggedInUserInterface["user"] & { status: string })[],
    Error
  >({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId) {
      const user = users.find((u) => u.id === userId);
      if (user) setSelectedUser(user);
    }
    setIsInitialized(true);
  }, [users, searchParams]);

  // Update URL when user selected
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams(searchParams);
    if (selectedUser) {
      params.set("user", selectedUser.id);
    }
    // Only update if params actually changed
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedUser, isInitialized, searchParams, setSearchParams]);

  // Message
  const [messages, setMessages] = useState<MessageInterface[]>([]);

  // Load conversation history when a user is selected
  useEffect(() => {
    if (selectedUser && loggedInUser?.user) {
      // Reset messages when selecting a different user
      setMessages([]);
      
      // Fetch conversation history
      socket.emit(
        "getConversation", 
        { 
          senderId: loggedInUser.user.id, 
          receiverId: selectedUser.id 
        },
        (response: { success: boolean; data: MessageInterface[] }) => {
          if (response.success) {
            setMessages(response.data);
          }
        }
      );
      
      // Close mobile menu when user is selected on mobile
      setMobileMenuOpen(false);
    }
  }, [selectedUser, loggedInUser?.user, socket]);

  const handleSendMessage = useCallback(async () => {
    if (!selectedUser || !message.trim() || !loggedInUser?.user) return;

    const tempId = `temp-${Date.now()}`;
    // Optimistic update with temporary ID
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        content: message,
        senderId: loggedInUser.user.id,
        receiverId: selectedUser.id,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      // Wait for server acknowledgment
      const serverMessage = await socket.emitWithAck("chatMessage", {
        senderId: loggedInUser.user.id,
        receiverId: selectedUser.id,
        content: message,
      });

      // Replace temporary message with server response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...serverMessage, id: serverMessage.id } : msg
        )
      );
    } catch (error) {
      // Remove temporary message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      toast.error("Something went wrong");
      console.error("Error:->", error);
    }

    setMessage("");
  }, [loggedInUser?.user, message, selectedUser, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!loggedInUser) return;

    // Update user status to online
    socket.emit("updateStatus", {
      userId: loggedInUser.user.id,
      status: "online",
    });

    // Handle incoming messages
    socket.on("chatMessage", (newMessage: MessageInterface) => {
      // Only add the message if it's a relevant conversation and not already added
      // (either as part of the current conversation or as a temporary message)
      setMessages((prev) => {
        // If this message is already in our list (either by ID or as a temp message), don't add it
        const messageExists = prev.some(msg => 
          msg.id === newMessage.id || 
          (msg.content === newMessage.content && 
           msg.senderId === newMessage.senderId && 
           msg.receiverId === newMessage.receiverId &&
           Date.now() - new Date(msg.createdAt).getTime() < 5000) // Within 5 seconds
        );

        // Only add message if it's relevant to current conversation
        const isRelevantConversation = selectedUser && 
          ((newMessage.senderId === loggedInUser.user.id && newMessage.receiverId === selectedUser.id) ||
           (newMessage.receiverId === loggedInUser.user.id && newMessage.senderId === selectedUser.id));

        if (!messageExists && isRelevantConversation) {
          // Play notification sound if message is from the other person
          if (newMessage.senderId !== loggedInUser.user.id) {
            new Audio(audio).play().catch(() => {});
          }
          return [...prev, newMessage];
        }

        return prev;
      });
    });

    // Handle status updates
    socket.on("updateStatus", ({ userId, status }) => {
      // Update user status in the users list
      if (userId && status) {
        // This could be implemented if you want to show real-time status updates
      }
    });

    return () => {
      socket.off("chatMessage");
      socket.off("updateStatus");
    };
  }, [loggedInUser, selectedUser, socket]);

  // Function to generate user avatar
  const getUserAvatar = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // Function to format timestamp
  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Status indicator component
  const StatusIndicator = ({ status }: { status?: string }) => {
    return (
      <div 
        className={`w-3 h-3 rounded-full ${
          status === "online" ? "bg-green-500" : "bg-gray-400"
        }`}
      />
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b">
        <h1 className="text-xl font-bold text-primary">MessengerApp</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-600"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* User List Sidebar */}
      <div 
        className={`
          ${mobileMenuOpen ? 'block' : 'hidden'} 
          md:block
          md:w-80 w-full 
          border-r bg-white 
          md:h-full h-[calc(100vh-56px)]
          md:static absolute
          z-10
          overflow-hidden
        `}
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contacts</h2>
          <div className="relative">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-180px)] md:h-[calc(100vh-130px)]">
          <div className="p-2">
            {loadingUsers ? (
              <div className="space-y-3 p-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`
                      flex items-center gap-3 p-3 rounded-lg cursor-pointer
                      hover:bg-gray-100 transition-colors duration-200
                      ${selectedUser?.id === user.id ? "bg-gray-100" : ""}
                    `}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="relative">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-medium">
                        {getUserAvatar(user.name)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <StatusIndicator status={user.status} />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.status}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            {filteredUsers.length === 0 && !loadingUsers && (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Section */}
      <div className={`
        flex-1 flex flex-col 
        ${mobileMenuOpen ? 'hidden' : 'flex'} 
        md:flex
        bg-white md:border-l
        h-[calc(100vh-56px)] md:h-screen
        overflow-hidden
      `}>
        {/* Chat Header */}
        {selectedUser ? (
          <div className="border-b p-4 bg-white shadow-sm flex items-center gap-3">
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="mr-2"
              >
                <Menu size={20} />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white font-medium">
                  {getUserAvatar(selectedUser.name)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5">
                  <StatusIndicator status={selectedUser.status} />
                </div>
              </div>
              <div>
                <h2 className="text-md font-semibold text-gray-900">
                  {selectedUser.name}
                </h2>
                <p className="text-xs text-gray-500">{selectedUser.status}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-b p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </Button>
            </div>
          </div>
        )}

        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 overflow-hidden">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Send size={32} className="text-gray-400" />
            </div>
            <p className="text-xl font-medium text-gray-700 mb-2">
              Your Messages
            </p>
            <p className="text-gray-500 text-center max-w-xs">
              Select a contact to start messaging
            </p>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 bg-gray-50 overflow-y-auto">
              <div className="mx-auto p-4 space-y-4 pb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Send size={24} className="text-gray-400" />
                      </div>
                    </div>
                    <p className="text-gray-500">
                      No messages yet. Say hello to start the conversation!
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg, index) => {
                      const isCurrentUser = msg.senderId === loggedInUser?.user?.id;
                      // Check if we should show the date separator
                      const showDate = index === 0 || 
                        new Date(msg.createdAt).toDateString() !== 
                        new Date(messages[index - 1].createdAt).toDateString();
                      
                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <div className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                                {new Date(msg.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} w-full`}
                          >
                            <div className={`
                              max-w-[80%] md:max-w-[70%] 
                              ${isCurrentUser 
                                ? 'bg-primary text-white rounded-tl-4xl rounded-br-4xl rounded-tr-sm rounded-bl-sm ml-auto' 
                                : 'bg-white text-gray-800 border rounded-tr-4xl rounded-bl-4xl rounded-tl-sm rounded-br-sm shadow-sm mr-auto'
                              } 
                              p-3 px-4
                            `}>
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <div className={`
                                text-xs mt-1 
                                ${isCurrentUser ? 'text-primary-foreground/80' : 'text-gray-500'}
                              `}>
                                {formatMessageTime(msg.createdAt)}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-3 bg-white">
              <div className="flex gap-2 items-center max-w-3xl mx-auto">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  className="flex-1 py-6 px-4"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!message.trim()}
                  size="icon"
                  className="h-10 w-10 rounded-full"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardScreen;
