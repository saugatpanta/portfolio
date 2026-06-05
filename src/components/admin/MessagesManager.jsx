import React, { useState, useEffect, useRef } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import gsap from "gsap";

export default function MessagesManager() {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Ref for staggered list animation
  const listRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => firebaseClient.entities.Message.list('-created_date'),
  });

  // Staggered entrance animation when messages load
  useEffect(() => {
    if (messages.length > 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.message-item');
      gsap.fromTo(items,
        { opacity: 0, y: 12, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
      );
    }
  }, [messages]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => firebaseClient.entities.Message.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => firebaseClient.entities.Message.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast.success("Message deleted successfully");
    }
  });

  const markAsRead = (message) => {
    if (!message.read) {
      updateMutation.mutate({ id: message.id, data: { ...message, read: true } });
    }
    setSelectedMessage(message);
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div>
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white/90">Messages</CardTitle>
            {unreadCount > 0 && (
              <p className="text-sm text-blue-400/70 mt-1">
                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-item flex items-start justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  message.read 
                    ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]' 
                    : 'border-blue-500/30 bg-blue-500/[0.06] hover:bg-blue-500/[0.10] shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                }`}
                onClick={() => markAsRead(message)}
              >
                <div className="flex gap-3 flex-1">
                  <div className="mt-1">
                    {message.read ? (
                      <MailOpen className="w-5 h-5 text-white/25" />
                    ) : (
                      <Mail className="w-5 h-5 text-blue-400 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${!message.read ? 'text-blue-300' : 'text-white/80'}`}>
                        {message.name}
                      </h3>
                      <span className="text-xs text-white/30">
                        {format(new Date(message.created_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm text-white/40">
                      {message.email}
                    </p>
                    {message.subject && (
                      <p className="text-sm font-medium mt-1 text-white/60">
                        {message.subject}
                      </p>
                    )}
                    <p className="text-sm text-white/35 mt-1 line-clamp-1">
                      {message.message}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(message.id);
                  }}
                  className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-center py-12 text-white/30">
                No messages yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 text-white">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white/90">Message from {selectedMessage.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/40">Email</p>
                  <p className="font-medium text-white/80">{selectedMessage.email}</p>
                </div>
                {selectedMessage.subject && (
                  <div>
                    <p className="text-sm text-white/40">Subject</p>
                    <p className="font-medium text-white/80">{selectedMessage.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-white/40">Date</p>
                  <p className="font-medium text-white/80">
                    {format(new Date(selectedMessage.created_date), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/40 mb-2">Message</p>
                  <div className="p-4 bg-white/[0.04] border border-white/10 rounded-lg">
                    <p className="whitespace-pre-wrap text-white/70">{selectedMessage.message}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <a href={`mailto:${selectedMessage.email}`}>
                    <Button className="bg-blue-600/80 hover:bg-blue-600 text-white">Reply via Email</Button>
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}