import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { fetchUsers, getMessages, sendMessage } from "@/app/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import useAuth from "@/hooks/useAuth";
import { LoggedInUserInterface } from "@/types/user.types";
import { MessageInterface } from "@/types/message.types";
import { useSearchParams } from "react-router";

function DashboardScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<
    LoggedInUserInterface["user"] | null
  >(null);
  const { loggedInUser } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => setMessage(""),
  });

  const { data: messages, isLoading: loadingMessages } = useQuery<
    MessageInterface[]
  >({
    queryKey: ["messages", selectedUser?.id],
    queryFn: () => (selectedUser ? getMessages(selectedUser.id) : []),
    enabled: !!selectedUser,
  });

  const handleSendMessage = () => {
    if (!selectedUser || !message) return;
    sendMessageMutation.mutate({
      receiverId: selectedUser.id,
      content: message,
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen">
      {/* User List */}
      <div className="w-1/4 border-r flex flex-col">
        <h2 className="text-lg font-bold p-4 border-b">Users</h2>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-4">
            {loadingUsers ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`p-2 cursor-pointer ${
                      selectedUser?.id === user.id ? "bg-gray-300" : ""
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    {user.name} ({user.status})
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col relative">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">
            {selectedUser ? `Chat with ${selectedUser.name}` : "Select a user"}
          </h2>
        </div>

        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-lg">
              Select a user to start conversation
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`p-2 my-1 max-w-[70%] ${
                          i % 2 === 0 ? "mr-auto" : "ml-auto"
                        }`}
                      >
                        <Skeleton className="h-12 w-full rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages?.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={`p-2 my-1 max-w-[70%] ${
                            msg.senderId === loggedInUser?.user?.id
                              ? "ml-auto bg-blue-500 text-white rounded-l-lg"
                              : "mr-auto bg-gray-300 text-black rounded-r-lg"
                          } p-3`}
                        >
                          <p>{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4 mt-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!message}>
                  Send
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
