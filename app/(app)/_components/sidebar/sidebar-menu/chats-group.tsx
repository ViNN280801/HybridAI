"use client";

import React from "react";

import Link from "next/link";

import { usePrivy } from "@privy-io/react-auth";

import {
  SidebarMenuItem,
  SidebarMenuButton,
  Skeleton,
  Icon,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui";

import { useUserChats } from "@/hooks";

import { useChat } from "../../../chat/_contexts/chat";
import { ChevronDown, MessageSquare } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

const ChatsGroup: React.FC = () => {
  const pathname = usePathname();

  const { isMobile, setOpenMobile } = useSidebar();

  const { ready, user } = usePrivy();

  const { chats, isLoading } = useUserChats();

  const { setChat, chatId, resetChat } = useChat();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      className="group/collapsible"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="justify-between w-full"
            isActive={pathname.includes("/chat")}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <h1 className="text-sm font-semibold">Chats</h1>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/chat">
                  <div
                    onClick={() => {
                      resetChat();
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                    className="h-fit w-fit p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-md"
                  >
                    <Icon name="Plus" />
                  </div>
                </Link>
                <ChevronDown className="h-[14px] w-[14px] transition-transform group-data-[state=open]/collapsible:rotate-180 text-neutral-500 dark:text-neutral-500" />
              </div>
            </div>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="flex-1 overflow-hidden relative flex flex-col">
            {isLoading || !ready ? (
              <Skeleton className="h-10 w-full" />
            ) : chats.length > 0 ? (
              chats.map((chat) => (
                <SidebarMenuSubItem key={chat.id}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={chat.id === chatId}
                    onClick={() => setChat(chat.id)}
                  >
                    <Link href={`/chat`}>
                      <span className="truncate">{chat.tagline}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))
            ) : user ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 pl-2">
                No chats found
              </p>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 pl-2">
                Sign in to view your chats
              </p>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default ChatsGroup;
