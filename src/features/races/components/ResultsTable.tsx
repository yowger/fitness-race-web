import { useState, useEffect } from "react"
import { GripVertical } from "lucide-react"
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
}: SortableRowProps & {
    onStatusChange?: (userId: string, newStatus: RaceResult["status"]) => void
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
        finished: "bg-green-100 text-green-800",
        dnj: "bg-gray-100 text-gray-800",
        Disqualified: "bg-red-100 text-red-800",
        dnf: "bg-yellow-100 text-yellow-800",
        Pending: "bg-blue-100 text-blue-800",
    }

    return (
        <tr
            ref={setNodeRef}
            style={style}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className={`transition-colors cursor-pointer
        ${
            isSelected
                ? "bg-blue-100 ring-1 ring-blue-300"
                : hoveredRow === r.user_id
                ? "bg-blue-50"
                : "hover:bg-gray-50"
        }
    `}
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <span className="text-2xl font-light text-gray-900">
                        {index + 1}
                    </span>
                    {index < 3 && r.status === "Finished" && (
                        <span className="ml-2 text-xl">
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-700">
                        {r.bib_number}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                        {r.users.full_name}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-mono">
                    <td>{r.finish_time ? msToHMS(r.finish_time) : "-"}</td>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    value={r.status}
                    onChange={handleStatusChange}
                    className={`px-2 py-1 text-xs rounded ${
                        STATUS_COLORS[r.status] || "bg-gray-100 text-gray-800"
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
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => moveRow(index, index - 1)}
                        disabled={index === 0}
                        className={`p-2 rounded-md transition-colors ${
                            index === 0
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                        ▲
                    </button>
                    <button
                        onClick={() => moveRow(index, index + 1)}
                        disabled={index === rowsLength - 1}
                        className={`p-2 rounded-md transition-colors ${
                            index === rowsLength - 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                        ▼
                    </button>

                    <button
                        {...listeners}
                        {...attributes}
                        className="p-2 cursor-move text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <GripVertical size={16} />
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
        newStatus: RaceResult["status"]
    ) => {
        const updated = rows.map((r) =>
            r.user_id === userId ? { ...r, status: newStatus } : r
        )
        setRows(updated)
        onResultsChange?.(updated)
    }

    const sensors = useSensors(useSensor(PointerSensor))

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
                const { active, over } = event
                if (!over) return
                const oldIndex = rows.findIndex((r) => r.user_id === active.id)
                const newIndex = rows.findIndex((r) => r.user_id === over.id)
                if (oldIndex !== newIndex) moveRow(oldIndex, newIndex)
            }}
        >
            <SortableContext
                items={rows.map((r) => r.user_id)}
                strategy={verticalListSortingStrategy}
            >
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Racer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Finish Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
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
                            />
                        ))}
                    </tbody>
                </table>
            </SortableContext>
        </DndContext>
    )
}
