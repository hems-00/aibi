
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export interface ChartData {
    queryType: 'SQL';
    chartType: 'bar' | 'line' | 'pie' | 'area';
    data: any[];
    insight?: string;
    xAxis: string;
    yAxis: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ChartRenderer({ response }: { response: ChartData }) {
    const { chartType, data, xAxis, yAxis, insight } = response;
    
    console.log("Chart Response:", response);
    console.log("Chart Data:", data);
    console.log("XAxis:", xAxis);
    console.log("YAxis:", yAxis);

    const renderChart = () => {
        switch (chartType) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey={xAxis} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={60} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line type="monotone" dataKey={yAxis} stroke="hsl(var(--primary))" strokeWidth={3} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                            />
                            <Legend />
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey={yAxis}
                                nameKey={xAxis}
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey={xAxis} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey={yAxis} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                        </AreaChart>
                    </ResponsiveContainer>
                );
            case 'bar':
            default:
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey={xAxis} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={60} />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey={yAxis} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div className="w-full mt-4 flex flex-col gap-4">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                {renderChart()}
            </div>

            {insight && (
                <div className="bg-muted/50 p-4 rounded-xl border border-border text-sm leading-relaxed text-foreground">
                    <h4 className="font-semibold text-primary mb-2">Insights</h4>
                    <div className="whitespace-pre-wrap">{insight}</div>
                </div>
            )}
        </div>
    );
}
