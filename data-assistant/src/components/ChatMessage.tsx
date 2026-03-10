
import { Bot, User } from 'lucide-react';
import { ChartRenderer, type ChartData } from './ChartRenderer';
import { RagResponse, type RagData } from './RagResponse';
import { cn } from '@/lib/utils';

export type MessageType = {
    id: string;
    role: 'user' | 'assistant';
    content?: string;
    data?: ChartData | RagData | null;
    timestamp: Date;
};

export function ChatMessage({ message }: { message: MessageType }) {
    const isUser = message.role === 'user';

    return (
        <div className={cn(
            "flex w-full gap-3 py-4",
            isUser ? "justify-end" : "justify-start"
        )}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Bot className="w-5 h-5 text-primary" />
                </div>
            )}

            <div className={cn(
                "flex flex-col max-w-[85%] sm:max-w-[75%]",
                isUser ? "items-end" : "items-start"
            )}>
                <div className={cn(
                    "px-4 py-3 rounded-2xl shadow-sm text-sm",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm text-foreground"
                )}>
                    {/* Text Content */}
                    {message.content && (
                        <div className="whitespace-pre-wrap leading-relaxed">
                            {message.content}
                        </div>
                    )}

                    {/* Structured Data Content */}
                    {message.data && (
                        <div className="w-full mt-2">
                            {message.data.queryType === 'SQL' && <ChartRenderer response={message.data as ChartData} />}
                            {message.data.queryType === 'RAG' && <RagResponse response={message.data as RagData} />}
                        </div>
                    )}
                </div>

                <div className="text-[10px] text-muted-foreground mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                    <User className="w-5 h-5 text-secondary-foreground" />
                </div>
            )}
        </div>
    );
}
