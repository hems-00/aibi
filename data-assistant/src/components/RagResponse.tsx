
import { BookOpen } from 'lucide-react';

export interface RagData {
    queryType: 'RAG';
    answer: string;
    sources: {
        content: string;
        sectionTitle?: string;
        chunkType?: string;
        similarity?: number;
    }[];
}

export function RagResponse({ response }: { response: RagData }) {
    const { answer, sources } = response;

    return (
        <div className="w-full mt-2 flex flex-col gap-4">
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {answer}
            </div>

            {sources && sources.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        Sources used
                    </div>

                    <div className="flex flex-col gap-2">
                        {sources.map((source, index) => (
                            <div
                                key={index}
                                className="bg-muted p-3 rounded-lg border border-border/60 text-sm"
                            >
                                {source.sectionTitle && (
                                    <div className="font-medium text-foreground mb-1 text-xs">
                                        {source.sectionTitle}
                                    </div>
                                )}
                                <div className="text-muted-foreground text-xs italic line-clamp-3">
                                    "{source.content}"
                                </div>
                                {source.similarity && (
                                    <div className="mt-2 text-[10px] text-primary/70 font-medium">
                                        Relevance: {Math.round(source.similarity * 100)}%
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
