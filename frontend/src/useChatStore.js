import { useState, useEffect } from "react";

export function useChatStore() {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("beastmind_chats_final") || "[]");
    setChats(saved);
  }, []);

  const saveChats = (newChats) => {
    setChats(newChats);
    localStorage.setItem("beastmind_chats_final", JSON.stringify(newChats));
  };

  const createNewChat = () => {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
    saveChats([newChat, ...chats]);
    return newChat.id;
  };

  const updateChatMessages = (chatId, newMessages) => {
    const updatedChats = chats.map((chat) => {
      if (chat.id === chatId) {
        const title = newMessages[0]?.content.slice(0, 25) + "..." || "New Chat";
        return { ...chat, messages: newMessages, title };
      }
      return chat;
    });
    saveChats(updatedChats);
  };

  const deleteChat = (chatId) => {
    saveChats(chats.filter((c) => c.id !== chatId));
  };

  return { chats, createNewChat, updateChatMessages, deleteChat };
}