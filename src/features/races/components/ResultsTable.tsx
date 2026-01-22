import { useState, useEffect } from "react"
import { GripVertical, Trophy, Medal, Award } from "lucide-react"
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { RaceResult } from "../hooks/useRaces"

const STATUS_OPTIONS = [
    "Finished",
    "Did Not Join",
    "Disqualified",
    "DNS",
    "DNF",
]

type ResultsTableProps = {
    results: RaceResult[]
    selectedUserId?: string | null
    onResultsChange?: (updated: RaceResult[]) => void
    onRowHover?: (userId: string | null) => void
    onRowClick?: (userId: string) => void
}

interface SortableRowProps {
    r: RaceResult
    index: number
    rowsLength: number
    hoveredRow: string | null
    isSelected: boolean
    moveRow: (fromIndex: number, toIndex: number) => void
    setHoveredRow: (id: string | null) => void
    onRowHover?: (userId: string | null) => void
    onRowClick?: (userId: string) => void
}

function msToHMS(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000)

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const pad = (n: number) => n.toString().padStart(2, "0")

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function hmsToMs(value: string): number | null {
    const parts = value.split(":").map(Number)
    if (parts.some(isNaN)) return null

    let h = 0,
        m = 0,
        s = 0

    if (parts.length === 3) [h, m, s] = parts
    else if (parts.length === 2) [m, s] = parts
    else if (parts.length === 1) [s] = parts
    else return null

    if (m >= 60 || s >= 60) return null

    return (h * 3600 + m * 60 + s) * 1000
}

function SortableRow({
    r,
    index,
    hoveredRow,
    rowsLength,
    isSelected,
    moveRow,
    setHoveredRow,
    onRowHover,
    onRowClick,
    onStatusChange,
    onFinishTimeChange,
}: SortableRowProps & {
    onStatusChange?: (userId: string, newStatus: RaceResult["status"]) => void
    onFinishTimeChange?: (userId: string, finishTimeMs: number) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: r.user_id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const handleMouseEnter = () => {
        setHoveredRow(r.user_id)
        onRowHover?.(r.user_id)
    }

    const handleMouseLeave = () => {
        setHoveredRow(null)
        onRowHover?.(null)
    }

    const handleClick = () => {
        onRowClick?.(r.user_id)
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as RaceResult["status"]
        onStatusChange?.(r.user_id, newStatus)
    }

    const STATUS_COLORS: Record<string, string> = {
        Finished: "bg-green-50 text-green-700 border-green-200",
        "Did Not Join": "bg-gray-50 text-gray-700 border-gray-200",
        Disqualified: "bg-red-50 text-red-700 border-red-200",
        DNS: "bg-orange-50 text-orange-700 border-orange-200",
        DNF: "bg-yellow-50 text-yellow-700 border-yellow-200",
        Pending: "bg-blue-50 text-blue-700 border-blue-200",
    }

    const getMedalIcon = (position: number) => {
        if (r.status !== "Finished") return null

        switch (position) {
            case 0:
                return (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                        <Trophy className="w-4 h-4 text-white" />
                    </div>
                )
            case 1:
                return (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-md">
                        <Medal className="w-4 h-4 text-white" />
                    </div>
                )
            case 2:
                return (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                        <Award className="w-4 h-4 text-white" />
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <tr
            ref={setNodeRef}
            style={style}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className={`transition-all duration-200 cursor-pointer border-b border-gray-200 font-body
                ${
                    isSelected
                        ? "bg-cyan-50 ring-2 ring-cyan-500 ring-inset"
                        : hoveredRow === r.user_id
                          ? "bg-cyan-50/50"
                          : "hover:bg-gray-50"
                }
            `}
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <span className="font-display text-3xl text-zinc-900 min-w-[2rem]">
                        {index + 1}
                    </span>
                    {getMedalIcon(index)}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <span className="font-heading text-lg text-cyan-600">
                        #{r.bib_number}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <span className="font-body text-base font-semibold text-zinc-900">
                        {r.users.full_name}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9:]*"
                    placeholder="HH:MM:SS"
                    value={r.finish_time ? msToHMS(r.finish_time) : ""}
                    disabled={r.status !== "Finished"}
                    className="w-28 px-3 py-2 font-mono font-semibold text-sm rounded-lg border-2"
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9:]/g, "")
                        const ms = hmsToMs(value)
                        if (ms !== null) {
                            onFinishTimeChange?.(r.user_id, ms)
                        }
                    }}
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    value={r.status}
                    onChange={handleStatusChange}
                    className={`px-3 py-2 font-body text-sm font-semibold rounded-lg border-2 transition-all cursor-pointer hover:shadow-sm ${
                        STATUS_COLORS[r.status] ||
                        "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                >
                    {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            moveRow(index, index - 1)
                        }}
                        disabled={index === 0}
                        className={`p-2 rounded-lg transition-all ${
                            index === 0
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-cyan-100 hover:text-cyan-700 active:bg-cyan-200"
                        }`}
                        title="Move up"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            moveRow(index, index + 1)
                        }}
                        disabled={index === rowsLength - 1}
                        className={`p-2 rounded-lg transition-all ${
                            index === rowsLength - 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-cyan-100 hover:text-cyan-700 active:bg-cyan-200"
                        }`}
                        title="Move down"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>

                    <button
                        {...listeners}
                        {...attributes}
                        className="p-2 cursor-move text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all active:bg-cyan-100"
                        title="Drag to reorder"
                    >
                        <GripVertical size={18} />
                    </button>
                </div>
            </td>
        </tr>
    )
}

export function ResultsTable({
    results,
    selectedUserId,
    onResultsChange,
    onRowHover,
    onRowClick,
}: ResultsTableProps) {
    const [rows, setRows] = useState<RaceResult[]>(results)
    const [hoveredRow, setHoveredRow] = useState<string | null>(null)

    useEffect(() => {
        setRows(results)
    }, [results])

    const moveRow = (fromIndex: number, toIndex: number) => {
        console.log("moving row...", fromIndex, toIndex)

        if (toIndex < 0 || toIndex >= rows.length) return

        const updated = arrayMove(rows, fromIndex, toIndex).map((r, i) => ({
            ...r,
            position: i + 1,
        }))
        setRows(updated)
        onResultsChange?.(updated)
    }

    const handleStatusChange = (
        userId: string,
        newStatus: RaceResult["status"],
    ) => {
        const updated = rows.map((r) =>
            r.user_id === userId ? { ...r, status: newStatus } : r,
        )
        setRows(updated)
        onResultsChange?.(updated)
    }

    const handleFinishTimeChange = (userId: string, finishTime: number) => {
        const updated = rows.map((r) =>
            r.user_id === userId ? { ...r, finish_time: finishTime } : r,
        )
        setRows(updated)
        onResultsChange?.(updated)
    }

    const sensors = useSensors(useSensor(PointerSensor))

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Antonio:wght@700&family=Work+Sans:wght@400;500;600;700&display=swap');
                
                .font-display {
                    font-family: 'Antonio', sans-serif;
                    letter-spacing: -0.02em;
                }
                
                .font-heading {
                    font-family: 'Bebas Neue', sans-serif;
                    letter-spacing: 0.02em;
                }
                
                .font-body {
                    font-family: 'Work Sans', sans-serif;
                }
            `}</style>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => {
                    const { active, over } = event
                    if (!over) return
                    const oldIndex = rows.findIndex(
                        (r) => r.user_id === active.id,
                    )
                    const newIndex = rows.findIndex(
                        (r) => r.user_id === over.id,
                    )
                    if (oldIndex !== newIndex) moveRow(oldIndex, newIndex)
                }}
            >
                <SortableContext
                    items={rows.map((r) => r.user_id)}
                    strategy={verticalListSortingStrategy}
                >
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
                                <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700 uppercase tracking-wider">
                                    Position
                                </th>
                                <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700 uppercase tracking-wider">
                                    Bib
                                </th>
                                <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700 uppercase tracking-wider">
                                    Racer
                                </th>
                                <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700 uppercase tracking-wider">
                                    Finish Time
                                </th>
                                <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right font-heading text-sm text-zinc-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rows.map((r, i) => (
                                <SortableRow
                                    key={r.user_id}
                                    r={r}
                                    index={i}
                                    hoveredRow={hoveredRow}
                                    rowsLength={rows.length}
                                    isSelected={r.user_id === selectedUserId}
                                    moveRow={moveRow}
                                    setHoveredRow={setHoveredRow}
                                    onRowHover={onRowHover}
                                    onRowClick={onRowClick}
                                    onStatusChange={handleStatusChange}
                                    onFinishTimeChange={handleFinishTimeChange}
                                />
                            ))}
                        </tbody>
                    </table>
                </SortableContext>
            </DndContext>
        </>
    )
}
