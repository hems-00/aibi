import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, X, MessageSquare, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { ChatMessage, type MessageType } from './ChatMessage';
import { cn } from '@/lib/utils';
import type { ChartData } from './ChartRenderer';
import type { RagData } from './RagResponse';

export function ChatInterface() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<MessageType[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I can help you analyze your data. Upload a file on the main page, and then ask me questions about it.',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: MessageType = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/query', {
                question: userMessage.content,
            });

            const assistantMessage: MessageType = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                data: response.data as (ChartData | RagData),
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error: unknown) {
            console.error("Chat API Error:", error);

            let errorText = "Something went wrong while processing your request.";

            if (axios.isAxiosError(error)) {
                errorText =
                    error.response?.data?.message ||
                    error.response?.data?.error?.message ||
                    error.message;
            } else if (error instanceof Error) {
                errorText = error.message;
            }

            const errorMessage: MessageType = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `⚠️ ${errorText}`,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center z-50 animate-in zoom-in"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            )}

            {/* Chat Window Container */}
            <div
                className={cn(
                    "fixed z-50 transition-all duration-300 ease-in-out bg-background border border-border shadow-2xl overflow-hidden flex flex-col",
                    isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-10 pointer-events-none",
                    isExpanded
                        ? "inset-4 md:inset-10 rounded-2xl"
                        : "bottom-6 right-6 w-[90vw] md:w-[450px] h-[80vh] md:h-[600px] rounded-2xl"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            AI
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground text-sm">Data Assistant</h3>
                            <p className="text-xs text-green-500 font-medium">Online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                        >
                            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Message Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-background/50 flex flex-col gap-2">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}

                    {isLoading && (
                        <div className="flex justify-start py-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mr-3">
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            </div>
                            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5 min-h-[40px]">
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-card border-t border-border">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything about your data..."
                            className="w-full bg-background border border-border outline-none pl-4 pr-12 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-foreground placeholder:text-muted-foreground shadow-sm"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
