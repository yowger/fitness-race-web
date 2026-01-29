import { useState } from "react"
import {
    Trophy,
    Medal,
    Download,
    Clock,
    TrendingUp,
    Award,
    Users,
    Search,
    Calendar,
    MapPin,
    Activity,
    X,
    Edit3,
} from "lucide-react"

import "../styles/racesCompletePage.css"
import { useParams } from "react-router-dom"
import {
    useRace,
    useResults,
    useTracking,
    type Tracking,
} from "../hooks/useRaces"
import { formatDate } from "../../../lib/time"
import { jsPDF } from "jspdf"
import { autoTable } from "jspdf-autotable"

interface RaceResults {
    id: string
    bib: string
    name: string
    time: string
    pace: string
    position: number
    splits: string[]
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371
    const toRad = (v: number) => (v * Math.PI) / 180

    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatTime(ms: number) {
    if (ms <= 0 || isNaN(ms)) return "00:00:00"

    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
    ].join(":")
}

function formatPace(secPerKm: number) {
    if (!isFinite(secPerKm)) return "-"

    const m = Math.floor(secPerKm / 60)
    const s = Math.floor(secPerKm % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
}

function computePaceAndSplits(points: Tracking[]) {
    if (points.length < 2) {
        return { pace: "–", splits: [] as string[] }
    }

    const ordered = [...points].sort(
        (a, b) =>
            new Date(a.recorded_at).getTime() -
            new Date(b.recorded_at).getTime(),
    )

    let totalDistance = 0
    const splits: number[] = []
    let nextKm = 1

    let splitStartTime = new Date(ordered[0].recorded_at).getTime()

    for (let i = 1; i < ordered.length; i++) {
        const d = haversine(
            ordered[i - 1].latitude,
            ordered[i - 1].longitude,
            ordered[i].latitude,
            ordered[i].longitude,
        )

        totalDistance += d

        if (totalDistance >= nextKm) {
            const now = new Date(ordered[i].recorded_at).getTime()
            splits.push(now - splitStartTime)
            splitStartTime = now
            nextKm++
        }
    }

    const totalTime =
        new Date(ordered.at(-1)!.recorded_at).getTime() -
        new Date(ordered[0].recorded_at).getTime()

    const paceSecPerKm =
        totalDistance > 0 ? totalTime / 1000 / totalDistance : 0

    return {
        pace: formatPace(paceSecPerKm),
        splits: splits.map((ms) => formatTime(ms)),
    }
}

function safeElapsedTime(durationMs?: number) {
    if (!durationMs || durationMs <= 0) return "N/A"
    return formatTime(durationMs)
}

export default function RaceResultsPage() {
    const { id: raceId } = useParams()
    const { data: race } = useRace(raceId!)
    const { data: results } = useResults(raceId!)
    console.log("🚀 ~ RaceResultsPage ~ results:", results)
    const { data: raceTracking } = useTracking(raceId!)

    const resultsData: RaceResults[] =
        results
            ?.map((result) => {
                const userId = result.users?.id ?? ""

                const userTracking =
                    raceTracking?.filter((t) => t.user_id === userId) ?? []

                const { pace, splits } = computePaceAndSplits(userTracking)

                return {
                    id: userId,
                    bib: String(result.bib_number ?? 0),
                    name: result.users?.full_name || "Unknown",
                    time: safeElapsedTime(result.finish_time),
                    pace,
                    position: result.position ?? 0,
                    splits,
                }
            })
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) ?? []
    // const resultsData: RaceResults[] =
    //     results?.map((result) => {
    //         const userId = result.users?.id ?? ""

    //         const userTracking =
    //             raceTracking?.filter((t) => t.user_id === userId) ?? []

    //         const { pace, splits } = computePaceAndSplits(userTracking)

    //         return {
    //             id: userId,
    //             bib: String(result.bib_number ?? 0),
    //             name: result.users?.full_name || "Unknown",
    //             time: safeElapsedTime(result.finish_time),
    //             pace,
    //             position: result.position ?? 0,
    //             splits,
    //         }
    //     }) ?? []

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRunner, setSelectedRunner] = useState<RaceResults | null>(
        null,
    )

    const filteredResults = resultsData.filter((runner) => {
        const matchesSearch =
            runner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            runner.bib.includes(searchTerm)
        return matchesSearch
    })

    const podium = resultsData
        .filter((runner) => {
            const originalResult = results?.find(
                (r) => r.users?.id === runner.id,
            )
            return originalResult?.status === "Finished"
        })
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .slice(0, 3)

    const finishedResults =
        results?.filter((r) => r.status === "Finished") ?? []

    const finishTimesInSec = finishedResults.map(
        (r) => (r.finish_time ?? 0) / 1000,
    )

    const avgTimeSec =
        finishTimesInSec.reduce((sum, t) => sum + t, 0) /
            finishTimesInSec.length || 0

    const fastestTimeSec = Math.min(...finishTimesInSec, Infinity)

    function formatSeconds(sec: number) {
        const hours = Math.floor(sec / 3600)
        const minutes = Math.floor((sec % 3600) / 60)
        const seconds = Math.floor(sec % 60)
        return [hours, minutes, seconds]
            .map((v) => String(v).padStart(2, "0"))
            .join(":")
    }

    const avgPaceSecPerKm =
        finishedResults
            .map((r) => {
                const userTracking =
                    raceTracking?.filter((t) => t.user_id === r.users?.id) ?? []
                const { pace } = computePaceAndSplits(userTracking)
                const [min, sec] = pace.split(":").map(Number)
                return min * 60 + sec
            })
            .reduce((sum, p) => sum + p, 0) / finishedResults.length || 0

    const avgPaceFormatted = formatPace(avgPaceSecPerKm)

    const finishRate = (finishedResults.length / (results?.length ?? 1)) * 100

    const statistics = {
        averageTime: formatSeconds(avgTimeSec),
        fastestTime: formatSeconds(fastestTimeSec),
        averagePace: avgPaceFormatted,
        finishRate: Number(finishRate.toFixed(1)),
    }

    function exportResults(data: RaceResults[]) {
        if (!data || data.length === 0) return

        const doc = new jsPDF("p", "pt", "a4")
        const title = "Race Results"

        // Title
        doc.setFontSize(18)
        doc.text(title, 40, 40)

        // Table headers
        const headers = ["Position", "BIB", "Runner", "Time", "Pace"]

        // Table rows
        const rows = data.map((r) => [
            r.position,
            r.bib,
            r.name,
            r.time,
            r.pace,
        ])

        // Add table
        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 60,
            theme: "grid",
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10 },
        })

        // Footer with export date
        doc.setFontSize(9)
        doc.text(
            `Exported: ${new Date().toLocaleString()}`,
            40,
            doc.internal.pageSize.getHeight() - 30,
        )

        // Save PDF
        doc.save(`race-${race?.name}.pdf`)
    }

    // old certificate
    // function downloadCertificate(
    //     runner: RaceResults,
    //     raceName: string,
    //     raceDate: string,
    // ) {
    //     const doc = new jsPDF("landscape", "pt", "a4")
    //     const width = doc.internal.pageSize.getWidth()
    //     const height = doc.internal.pageSize.getHeight()

    //     // Determine placement
    //     const is1st = runner.position === 1
    //     const is2nd = runner.position === 2
    //     const is3rd = runner.position === 3
    //     const isPodium = is1st || is2nd || is3rd

    //     // === BACKGROUND & BORDER ===
    //     if (is1st) {
    //         // Gold gradient background for 1st place
    //         doc.setFillColor(255, 250, 230) // Light gold
    //         doc.rect(0, 0, width, height, "F")

    //         // Double border
    //         doc.setDrawColor(218, 165, 32) // Goldenrod
    //         doc.setLineWidth(8)
    //         doc.rect(20, 20, width - 40, height - 40, "S")

    //         doc.setDrawColor(255, 215, 0) // Gold
    //         doc.setLineWidth(4)
    //         doc.rect(30, 30, width - 60, height - 60, "S")

    //         // Corner decorations
    //         doc.setFillColor(218, 165, 32)
    //         const cornerSize = 15
    //         // Top-left
    //         doc.circle(40, 40, cornerSize, "F")
    //         // Top-right
    //         doc.circle(width - 40, 40, cornerSize, "F")
    //         // Bottom-left
    //         doc.circle(40, height - 40, cornerSize, "F")
    //         // Bottom-right
    //         doc.circle(width - 40, height - 40, cornerSize, "F")
    //     } else if (is2nd) {
    //         // Silver gradient for 2nd place
    //         doc.setFillColor(248, 248, 255) // Ghost white
    //         doc.rect(0, 0, width, height, "F")

    //         doc.setDrawColor(192, 192, 192) // Silver
    //         doc.setLineWidth(8)
    //         doc.rect(20, 20, width - 40, height - 40, "S")

    //         doc.setDrawColor(169, 169, 169) // Dark gray
    //         doc.setLineWidth(4)
    //         doc.rect(30, 30, width - 60, height - 60, "S")

    //         // Corner decorations
    //         doc.setFillColor(192, 192, 192)
    //         const cornerSize = 15
    //         doc.circle(40, 40, cornerSize, "F")
    //         doc.circle(width - 40, 40, cornerSize, "F")
    //         doc.circle(40, height - 40, cornerSize, "F")
    //         doc.circle(width - 40, height - 40, cornerSize, "F")
    //     } else if (is3rd) {
    //         // Bronze gradient for 3rd place
    //         doc.setFillColor(255, 248, 240) // Floral white
    //         doc.rect(0, 0, width, height, "F")

    //         doc.setDrawColor(205, 127, 50) // Bronze
    //         doc.setLineWidth(8)
    //         doc.rect(20, 20, width - 40, height - 40, "S")

    //         doc.setDrawColor(184, 115, 51) // Dark bronze
    //         doc.setLineWidth(4)
    //         doc.rect(30, 30, width - 60, height - 60, "S")

    //         // Corner decorations
    //         doc.setFillColor(205, 127, 50)
    //         const cornerSize = 15
    //         doc.circle(40, 40, cornerSize, "F")
    //         doc.circle(width - 40, 40, cornerSize, "F")
    //         doc.circle(40, height - 40, cornerSize, "F")
    //         doc.circle(width - 40, height - 40, cornerSize, "F")
    //     } else {
    //         // Clean design for finishers
    //         doc.setFillColor(250, 250, 255) // Lavender blush
    //         doc.rect(0, 0, width, height, "F")

    //         doc.setDrawColor(8, 145, 178) // Cyan
    //         doc.setLineWidth(6)
    //         doc.rect(20, 20, width - 40, height - 40, "S")

    //         doc.setDrawColor(22, 163, 74) // Green
    //         doc.setLineWidth(3)
    //         doc.rect(28, 28, width - 56, height - 56, "S")
    //     }

    //     // === TOP BADGE ===
    //     if (isPodium) {
    //         let badgeColor: [number, number, number]
    //         let badgeText: string

    //         if (is1st) {
    //             badgeColor = [218, 165, 32] // Gold
    //             badgeText = "CHAMPION"
    //         } else if (is2nd) {
    //             badgeColor = [192, 192, 192] // Silver
    //             badgeText = "2ND PLACE"
    //         } else {
    //             badgeColor = [205, 127, 50] // Bronze
    //             badgeText = "3RD PLACE"
    //         }

    //         doc.setFillColor(...badgeColor)
    //         doc.roundedRect(width / 2 - 100, 50, 200, 40, 20, 20, "F")

    //         doc.setFontSize(16)
    //         doc.setTextColor(255, 255, 255)
    //         doc.setFont("helvetica", "bold")
    //         doc.text(badgeText, width / 2, 77, { align: "center" })
    //     }

    //     // === TITLE ===
    //     doc.setFontSize(36)
    //     doc.setTextColor(30, 41, 59) // Slate 800
    //     doc.setFont("times", "bold")

    //     if (isPodium) {
    //         doc.text(
    //             "CERTIFICATE OF EXCELLENCE",
    //             width / 2,
    //             isPodium ? 130 : 100,
    //             {
    //                 align: "center",
    //             },
    //         )
    //     } else {
    //         doc.text("CERTIFICATE OF ACHIEVEMENT", width / 2, 100, {
    //             align: "center",
    //         })
    //     }

    //     // === DECORATIVE LINE ===
    //     doc.setDrawColor(8, 145, 178)
    //     doc.setLineWidth(2)
    //     doc.line(
    //         width / 2 - 150,
    //         isPodium ? 145 : 115,
    //         width / 2 + 150,
    //         isPodium ? 145 : 115,
    //     )

    //     // === PRESENTED TO ===
    //     doc.setFontSize(14)
    //     doc.setTextColor(100, 116, 139) // Slate 500
    //     doc.setFont("helvetica", "normal")
    //     doc.text(
    //         "This certificate is proudly presented to",
    //         width / 2,
    //         isPodium ? 180 : 150,
    //         {
    //             align: "center",
    //         },
    //     )

    //     // === RUNNER NAME ===
    //     doc.setFontSize(48)
    //     if (is1st) {
    //         doc.setTextColor(218, 165, 32) // Gold
    //     } else if (is2nd) {
    //         doc.setTextColor(128, 128, 128) // Gray
    //     } else if (is3rd) {
    //         doc.setTextColor(205, 127, 50) // Bronze
    //     } else {
    //         doc.setTextColor(8, 145, 178) // Cyan
    //     }
    //     doc.setFont("times", "bolditalic")
    //     doc.text(runner.name, width / 2, isPodium ? 230 : 200, {
    //         align: "center",
    //     })

    //     // === NAME UNDERLINE ===
    //     doc.setDrawColor(100, 116, 139)
    //     doc.setLineWidth(1)
    //     doc.line(
    //         width / 2 - 200,
    //         isPodium ? 240 : 210,
    //         width / 2 + 200,
    //         isPodium ? 240 : 210,
    //     )

    //     // === ACHIEVEMENT TEXT ===
    //     doc.setFontSize(18)
    //     doc.setTextColor(30, 41, 59)
    //     doc.setFont("helvetica", "normal")

    //     let achievementText: string
    //     if (is1st) {
    //         achievementText =
    //             "for outstanding performance and claiming FIRST PLACE"
    //     } else if (is2nd) {
    //         achievementText =
    //             "for exceptional performance and achieving SECOND PLACE"
    //     } else if (is3rd) {
    //         achievementText =
    //             "for remarkable performance and securing THIRD PLACE"
    //     } else {
    //         achievementText = "for successfully completing the race"
    //     }

    //     doc.text(achievementText, width / 2, isPodium ? 275 : 245, {
    //         align: "center",
    //     })

    //     // === RACE INFO BOX ===
    //     const boxY = isPodium ? 310 : 280
    //     const boxHeight = 80

    //     // Box background
    //     if (is1st) {
    //         doc.setFillColor(255, 250, 230)
    //     } else if (is2nd) {
    //         doc.setFillColor(248, 248, 255)
    //     } else if (is3rd) {
    //         doc.setFillColor(255, 248, 240)
    //     } else {
    //         doc.setFillColor(240, 253, 244) // Green tint
    //     }
    //     doc.roundedRect(width / 2 - 250, boxY, 500, boxHeight, 10, 10, "F")

    //     // Box border
    //     if (is1st) {
    //         doc.setDrawColor(218, 165, 32)
    //     } else if (is2nd) {
    //         doc.setDrawColor(192, 192, 192)
    //     } else if (is3rd) {
    //         doc.setDrawColor(205, 127, 50)
    //     } else {
    //         doc.setDrawColor(8, 145, 178)
    //     }
    //     doc.setLineWidth(2)
    //     doc.roundedRect(width / 2 - 250, boxY, 500, boxHeight, 10, 10, "S")

    //     // Race name
    //     doc.setFontSize(22)
    //     doc.setTextColor(30, 41, 59)
    //     doc.setFont("helvetica", "bold")
    //     doc.text(raceName, width / 2, boxY + 30, { align: "center" })

    //     // Date
    //     doc.setFontSize(14)
    //     doc.setTextColor(100, 116, 139)
    //     doc.setFont("helvetica", "normal")
    //     doc.text(raceDate, width / 2, boxY + 52, { align: "center" })

    //     // Stats
    //     doc.setFontSize(16)
    //     doc.setTextColor(30, 41, 59)
    //     doc.setFont("helvetica", "bold")
    //     doc.text(
    //         `Finish Time: ${runner.time}  •  Avg Pace: ${runner.pace}/km`,
    //         width / 2,
    //         boxY + 72,
    //         { align: "center" },
    //     )

    //     // === POSITION BADGE (for podium) ===
    //     if (isPodium) {
    //         const badgeY = boxY + boxHeight + 30
    //         let positionBadgeColor: [number, number, number]
    //         let positionText: string

    //         if (is1st) {
    //             positionBadgeColor = [218, 165, 32]
    //             positionText = "1st PLACE"
    //         } else if (is2nd) {
    //             positionBadgeColor = [192, 192, 192]
    //             positionText = "2nd PLACE"
    //         } else {
    //             positionBadgeColor = [205, 127, 50]
    //             positionText = "3rd PLACE"
    //         }

    //         doc.setFillColor(...positionBadgeColor)
    //         doc.roundedRect(width / 2 - 80, badgeY, 160, 35, 17.5, 17.5, "F")

    //         doc.setFontSize(20)
    //         doc.setTextColor(255, 255, 255)
    //         doc.setFont("helvetica", "bold")
    //         doc.text(positionText, width / 2, badgeY + 24, { align: "center" })
    //     }

    //     // === FOOTER ===
    //     const footerY = height - 60

    //     // Issued date
    //     doc.setFontSize(11)
    //     doc.setTextColor(100, 116, 139)
    //     doc.setFont("helvetica", "italic")
    //     doc.text(
    //         `Certificate issued on ${new Date().toLocaleDateString("en-US", {
    //             month: "long",
    //             day: "numeric",
    //             year: "numeric",
    //         })}`,
    //         width / 2,
    //         footerY,
    //         { align: "center" },
    //     )

    //     // Signature line (optional)
    //     doc.setDrawColor(100, 116, 139)
    //     doc.setLineWidth(1)
    //     doc.line(width / 2 - 100, footerY - 35, width / 2 + 100, footerY - 35)

    //     doc.setFontSize(10)
    //     doc.text("Race Director", width / 2, footerY - 20, { align: "center" })

    //     // === SAVE PDF ===
    //     const fileName = `${runner.name.replace(/\s+/g, "-")}-${
    //         is1st
    //             ? "1st-Place"
    //             : is2nd
    //               ? "2nd-Place"
    //               : is3rd
    //                 ? "3rd-Place"
    //                 : "Finisher"
    //     }-Certificate.pdf`

    //     doc.save(fileName)
    // }

    const [showCertificateEditor, setShowCertificateEditor] = useState(false)
    const [certificateData, setCertificateData] = useState({
        runnerName: "",
        bibNumber: "",
        finishTime: "",
        averagePace: "",
        raceName: "",
        raceDate: "",
        venue: "",
        position: 0,
    })

    const openCertificateEditor = (runner: RaceResults) => {
        setCertificateData({
            runnerName: runner?.name || "",
            bibNumber: runner.bib,
            finishTime: runner.time,
            averagePace: runner.pace,
            raceName: race?.name || "Race",
            raceDate: formatDate(race?.start_time),
            venue: race?.routes?.start_address || "",
            position: runner.position,
        })
        setShowCertificateEditor(true)
    }

    const handleDownloadCustomCertificate = () => {
        downloadCertificate(
            {
                ...selectedRunner!,
                name: certificateData?.runnerName || "",
                bib: certificateData.bibNumber,
                time: certificateData.finishTime,
                pace: certificateData.averagePace,
                position: certificateData.position,
            },
            certificateData.raceName,
            certificateData.raceDate,
            certificateData.venue,
        )
        setShowCertificateEditor(false)
    }

    function downloadCertificate(
        runner: RaceResults,
        raceName: string,
        raceDate: string,
        venue?: string,
    ) {
        const doc = new jsPDF("landscape", "pt", "a4")
        const width = doc.internal.pageSize.getWidth()
        const height = doc.internal.pageSize.getHeight()

        const is1st = runner.position === 1
        const is2nd = runner.position === 2
        const is3rd = runner.position === 3
        const isPodium = is1st || is2nd || is3rd

        // === BACKGROUND ===
        if (is1st) {
            // Gold gradient background
            doc.setFillColor(255, 253, 245) // Warm cream
            doc.rect(0, 0, width, height, "F")

            // Decorative gradient overlay
            doc.setFillColor(255, 245, 220)
            doc.triangle(0, 0, width, 0, width, height / 3, "F")
            doc.setFillColor(255, 250, 235)
            doc.triangle(0, height, 0, height * 0.7, width / 3, height, "F")
        } else if (is2nd) {
            // Silver gradient background
            doc.setFillColor(248, 250, 252)
            doc.rect(0, 0, width, height, "F")

            doc.setFillColor(241, 245, 249)
            doc.triangle(0, 0, width, 0, width, height / 3, "F")
            doc.setFillColor(245, 247, 250)
            doc.triangle(0, height, 0, height * 0.7, width / 3, height, "F")
        } else if (is3rd) {
            // Bronze gradient background
            doc.setFillColor(255, 249, 242)
            doc.rect(0, 0, width, height, "F")

            doc.setFillColor(254, 243, 232)
            doc.triangle(0, 0, width, 0, width, height / 3, "F")
            doc.setFillColor(255, 246, 237)
            doc.triangle(0, height, 0, height * 0.7, width / 3, height, "F")
        } else {
            // Clean finisher background
            doc.setFillColor(249, 250, 251)
            doc.rect(0, 0, width, height, "F")

            doc.setFillColor(243, 244, 246)
            doc.triangle(0, 0, width, 0, width, height / 3, "F")
            doc.setFillColor(247, 248, 249)
            doc.triangle(0, height, 0, height * 0.7, width / 3, height, "F")
        }

        // === OUTER BORDER ===
        let borderColor: [number, number, number]
        if (is1st)
            borderColor = [218, 165, 32] // Gold
        else if (is2nd)
            borderColor = [156, 163, 175] // Silver/Gray
        else if (is3rd)
            borderColor = [194, 120, 3] // Bronze
        else borderColor = [8, 145, 178] // Cyan

        doc.setDrawColor(...borderColor)
        doc.setLineWidth(10)
        doc.rect(30, 30, width - 60, height - 60, "S")

        // Inner decorative border
        doc.setLineWidth(2)
        doc.rect(45, 45, width - 90, height - 90, "S")

        // === DECORATIVE CORNER ELEMENTS ===
        doc.setFillColor(...borderColor)
        const cornerSize = 20

        // Top corners
        doc.circle(45, 45, cornerSize, "F")
        doc.circle(width - 45, 45, cornerSize, "F")

        // Bottom corners
        doc.circle(45, height - 45, cornerSize, "F")
        doc.circle(width - 45, height - 45, cornerSize, "F")

        // === TOP ACHIEVEMENT BADGE ===
        if (isPodium) {
            let badgeColor: [number, number, number]
            let badgeText: string
            const badgeTextColor: [number, number, number] = [255, 255, 255]

            if (is1st) {
                badgeColor = [218, 165, 32]
                badgeText = "CHAMPION"
            } else if (is2nd) {
                badgeColor = [156, 163, 175]
                badgeText = "2ND PLACE"
            } else {
                badgeColor = [194, 120, 3]
                badgeText = "3RD PLACE"
            }

            // Badge background with shadow
            doc.setFillColor(0, 0, 0, 0.1)
            doc.roundedRect(width / 2 - 152, 72, 304, 48, 24, 24, "F")

            doc.setFillColor(...badgeColor)
            doc.roundedRect(width / 2 - 150, 70, 300, 45, 22, 22, "F")

            // Badge border
            doc.setDrawColor(255, 255, 255)
            doc.setLineWidth(3)
            doc.roundedRect(width / 2 - 150, 70, 300, 45, 22, 22, "S")

            doc.setFontSize(18)
            doc.setTextColor(...badgeTextColor)
            doc.setFont("helvetica", "bold")
            doc.text(badgeText, width / 2, 98, { align: "center" })
        }

        // === MAIN TITLE ===
        doc.setFontSize(40)
        doc.setTextColor(31, 41, 55) // Dark gray
        doc.setFont("times", "bold")

        const titleY = isPodium ? 150 : 120
        doc.text("CERTIFICATE OF", width / 2, titleY, { align: "center" })

        doc.setFontSize(48)
        if (isPodium) {
            if (is1st) doc.setTextColor(218, 165, 32)
            else if (is2nd) doc.setTextColor(107, 114, 128)
            else doc.setTextColor(194, 120, 3)
        } else {
            doc.setTextColor(8, 145, 178)
        }
        doc.text(
            isPodium ? "EXCELLENCE" : "ACHIEVEMENT",
            width / 2,
            titleY + 40,
            {
                align: "center",
            },
        )

        // === DECORATIVE DIVIDER ===
        const dividerY = titleY + 60
        doc.setDrawColor(...borderColor)
        doc.setLineWidth(3)

        // Left line
        doc.line(width / 2 - 280, dividerY, width / 2 - 50, dividerY)
        // Right line
        doc.line(width / 2 + 50, dividerY, width / 2 + 280, dividerY)

        // Center ornament
        doc.setFillColor(...borderColor)
        doc.circle(width / 2, dividerY, 8, "F")
        doc.setDrawColor(255, 255, 255)
        doc.setLineWidth(2)
        doc.circle(width / 2, dividerY, 8, "S")

        // === "PRESENTED TO" TEXT ===
        doc.setFontSize(16)
        doc.setTextColor(107, 114, 128)
        doc.setFont("helvetica", "italic")
        doc.text(
            "This certificate is proudly presented to",
            width / 2,
            dividerY + 35,
            {
                align: "center",
            },
        )

        // === RUNNER NAME ===
        doc.setFontSize(56)
        if (is1st) doc.setTextColor(218, 165, 32)
        else if (is2nd) doc.setTextColor(107, 114, 128)
        else if (is3rd) doc.setTextColor(194, 120, 3)
        else doc.setTextColor(8, 145, 178)

        doc.setFont("times", "bolditalic")
        doc.text(runner.name, width / 2, dividerY + 85, { align: "center" })

        // Elegant underline for name
        doc.setDrawColor(...borderColor)
        doc.setLineWidth(2)
        doc.line(width / 2 - 250, dividerY + 95, width / 2 + 250, dividerY + 95)

        // Double line detail
        doc.setLineWidth(1)
        doc.line(
            width / 2 - 250,
            dividerY + 100,
            width / 2 + 250,
            dividerY + 100,
        )

        // === ACHIEVEMENT TEXT ===
        doc.setFontSize(18)
        doc.setTextColor(31, 41, 55)
        doc.setFont("helvetica", "normal")

        let achievementText: string
        if (is1st) {
            achievementText =
                "for outstanding performance and claiming FIRST PLACE"
        } else if (is2nd) {
            achievementText =
                "for exceptional performance and achieving SECOND PLACE"
        } else if (is3rd) {
            achievementText =
                "for remarkable performance and securing THIRD PLACE"
        } else {
            achievementText =
                "for successfully completing the race with determination"
        }

        doc.text(achievementText, width / 2, dividerY + 135, {
            align: "center",
        })

        // === RACE DETAILS BOX ===
        const boxY = dividerY + 170
        const boxWidth = 520
        const boxHeight = venue ? 110 : 95
        const boxX = width / 2 - boxWidth / 2

        // Box shadow
        doc.setFillColor(0, 0, 0, 0.05)
        doc.roundedRect(boxX + 3, boxY + 3, boxWidth, boxHeight, 15, 15, "F")

        // Box background
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 15, 15, "F")

        // Box border
        doc.setDrawColor(...borderColor)
        doc.setLineWidth(3)
        doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 15, 15, "S")

        // Race name
        doc.setFontSize(24)
        doc.setTextColor(31, 41, 55)
        doc.setFont("helvetica", "bold")
        doc.text(raceName, width / 2, boxY + 32, { align: "center" })

        // Date
        doc.setFontSize(14)
        doc.setTextColor(107, 114, 128)
        doc.setFont("helvetica", "normal")
        doc.text(raceDate, width / 2, boxY + 52, { align: "center" })

        // Venue (if provided)
        if (venue) {
            doc.setFontSize(12)
            doc.setTextColor(107, 114, 128)
            doc.setFont("helvetica", "italic")
            doc.text(`${venue}`, width / 2, boxY + 69, { align: "center" })
        }

        // Divider line in box
        doc.setDrawColor(229, 231, 235)
        doc.setLineWidth(1)
        doc.line(
            boxX + 30,
            boxY + (venue ? 78 : 63),
            boxX + boxWidth - 30,
            boxY + (venue ? 78 : 63),
        )

        // Performance stats
        doc.setFontSize(14)
        doc.setTextColor(31, 41, 55)
        doc.setFont("helvetica", "bold")

        const statsY = boxY + (venue ? 97 : 82)

        // Finish time
        doc.text("", width / 2 - 120, statsY)
        doc.text(runner.time, width / 2 - 100, statsY)

        // Separator
        doc.setTextColor(203, 213, 225)
        doc.text("•", width / 2, statsY)

        // Pace
        doc.setTextColor(31, 41, 55)
        doc.text("", width / 2 + 50, statsY)
        doc.text(`${runner.pace} km`, width / 2 + 70, statsY)

        // === POSITION BADGE (for podium finishers) ===
        if (isPodium) {
            const positionBadgeY = boxY + boxHeight + 25
            const badgeWidth = 140
            const badgeHeight = 40

            let positionColor: [number, number, number]
            let positionText: string

            if (is1st) {
                positionColor = [218, 165, 32]
                positionText = "1ST"
            } else if (is2nd) {
                positionColor = [156, 163, 175]
                positionText = "2ND"
            } else {
                positionColor = [194, 120, 3]
                positionText = "3RD"
            }

            // Badge shadow
            doc.setFillColor(0, 0, 0, 0.1)
            doc.roundedRect(
                width / 2 - badgeWidth / 2 + 2,
                positionBadgeY + 2,
                badgeWidth,
                badgeHeight,
                20,
                20,
                "F",
            )

            // Badge background
            doc.setFillColor(...positionColor)
            doc.roundedRect(
                width / 2 - badgeWidth / 2,
                positionBadgeY,
                badgeWidth,
                badgeHeight,
                20,
                20,
                "F",
            )

            // Badge text
            doc.setFontSize(22)
            doc.setTextColor(255, 255, 255)
            doc.setFont("helvetica", "bold")
            doc.text(positionText, width / 2, positionBadgeY + 27, {
                align: "center",
            })
        }

        // === FOOTER SECTION ===
        const footerY = height - 80

        // Signature line
        doc.setDrawColor(156, 163, 175)
        doc.setLineWidth(1.5)
        const sigLineY = footerY - 25
        doc.line(width / 2 - 120, sigLineY, width / 2 + 120, sigLineY)

        // "Race Director" label
        doc.setFontSize(11)
        doc.setTextColor(107, 114, 128)
        doc.setFont("helvetica", "normal")
        // doc.text("Race Director", width / 2, sigLineY + 15, { align: "center" })

        // Issue date
        doc.setFontSize(10)
        doc.setFont("helvetica", "italic")
        doc.text(
            `Certificate issued on ${new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            })}`,
            width / 2,
            // height - 50,
            sigLineY + 15,
            { align: "center" },
        )

        // === DECORATIVE CORNER PATTERNS ===
        doc.setDrawColor(...borderColor)
        doc.setLineWidth(2)

        // Top-left corner pattern
        doc.line(60, 80, 100, 80)
        doc.line(60, 80, 60, 120)

        // Top-right corner pattern
        doc.line(width - 100, 80, width - 60, 80)
        doc.line(width - 60, 80, width - 60, 120)

        // Bottom-left corner pattern
        doc.line(60, height - 120, 60, height - 80)
        doc.line(60, height - 80, 100, height - 80)

        // Bottom-right corner pattern
        doc.line(width - 60, height - 120, width - 60, height - 80)
        doc.line(width - 100, height - 80, width - 60, height - 80)

        // === SAVE PDF ===
        const fileName = `${runner.name.replace(/\s+/g, "-")}-${
            is1st
                ? "1st-Place"
                : is2nd
                  ? "2nd-Place"
                  : is3rd
                    ? "3rd-Place"
                    : "Finisher"
        }-Certificate.pdf`

        doc.save(fileName)
    }

    return (
        <div className="min-h-screen bg-gray-50 font-body">
            <div className="relative overflow-hidden grain-texture">
                <div className="absolute inset-0 hero-gradient"></div>
                <img
                    src={race?.banner_url}
                    alt={race?.name}
                    className="w-full h-[50vh] object-cover opacity-30"
                />

                <div className="absolute inset-0 flex items-end bg-linear-to-t from-gray-50 via-transparent">
                    <div className="w-full max-w-7xl mx-auto px-6 pb-12">
                        <div className="fade-in">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="px-6 py-2 bg-green-600 text-white font-heading text-lg uppercase rounded-full">
                                    {race?.status}
                                </span>
                                <span className="px-6 py-2 bg-cyan-50 border border-cyan-600 text-cyan-700 font-heading text-lg rounded-full">
                                    {race?.routes?.distance?.toFixed(2)} km
                                </span>
                            </div>

                            <h1 className="font-display text-7xl md:text-8xl leading-none mb-4 text-zinc-900">
                                {race?.name}
                            </h1>

                            <div className="flex flex-wrap gap-6 text-zinc-600 font-body text-lg">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-cyan-600" />
                                    <span>
                                        {formatDate(race?.actual_start_time)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-cyan-600" />
                                    <span>{race?.routes?.start_address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-cyan-600" />
                                    <span>
                                        {finishedResults.length} Finishers
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Statistics Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 fade-in">
                    <div className="stat-card p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm text-center">
                        <Clock className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Average Time
                        </div>
                        <div className="font-display text-3xl text-zinc-900">
                            {statistics.averageTime}
                        </div>
                    </div>

                    <div className="stat-card p-6 bg-white border-2 border-green-200 rounded-lg shadow-sm text-center">
                        <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Fastest Time
                        </div>
                        <div className="font-display text-3xl text-green-600">
                            {statistics.fastestTime}
                        </div>
                    </div>

                    <div className="stat-card p-6 bg-white border-2 border-orange-200 rounded-lg shadow-sm text-center">
                        <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Average Pace
                        </div>
                        <div className="font-display text-3xl text-orange-600">
                            {statistics.averagePace}
                        </div>
                    </div>

                    <div className="stat-card p-6 bg-white border-2 border-purple-200 rounded-lg shadow-sm text-center">
                        <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Finish Rate
                        </div>
                        <div className="font-display text-3xl text-purple-600">
                            {statistics.finishRate}%
                        </div>
                    </div>
                </div>

                {/* Podium Section */}
                <div className="mb-16">
                    <h2 className="font-display text-5xl text-zinc-900 mb-8 text-center fade-in-delay-1">
                        Top Finishers
                    </h2>

                    <div className="flex items-end justify-center gap-8 max-w-4xl mx-auto">
                        {podium[1] && (
                            <div className="podium-2 flex-1 text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 rounded-full medal-silver flex items-center justify-center shine">
                                        <Medal className="w-12 h-12 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center font-heading text-lg">
                                        2
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-gray-300 rounded-t-2xl p-6 min-h-[280px] flex flex-col justify-between">
                                    <div>
                                        <div className="font-heading text-sm text-zinc-500 mb-1">
                                            BIB #{podium[1].bib}
                                        </div>
                                        <h3 className="font-display text-2xl text-zinc-900 mb-2">
                                            {podium[1].name}
                                        </h3>
                                        <div className="font-display text-4xl text-zinc-900 mb-1">
                                            {podium[1].time}
                                        </div>
                                        <div className="font-body text-sm text-zinc-500">
                                            {podium[1].pace} /km
                                        </div>
                                    </div>
                                    <button
                                        // onClick={() =>
                                        //     downloadCertificate(
                                        //         podium[1],
                                        //         race?.name || "Race",
                                        //         formatDate(race?.start_time)
                                        //     )
                                        // }
                                        onClick={() =>
                                            openCertificateEditor(podium[1])
                                        }
                                        className="certificate-btn mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-zinc-900 font-heading text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        CERTIFICATE
                                    </button>
                                </div>
                            </div>
                        )}

                        {podium[0] && (
                            <div className="podium-1 flex-1 text-center">
                                <div className="relative inline-block mb-4 trophy-float">
                                    <div className="w-32 h-32 rounded-full medal-gold flex items-center justify-center shine">
                                        <Trophy className="w-16 h-16 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-white border-2 border-yellow-500 rounded-full flex items-center justify-center font-heading text-xl">
                                        1
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-yellow-400 rounded-t-2xl p-6 min-h-[320px] flex flex-col justify-between shadow-lg">
                                    <div>
                                        <div className="font-heading text-sm text-zinc-500 mb-1">
                                            BIB #{podium[0].bib}
                                        </div>
                                        <h3 className="font-display text-3xl text-zinc-900 mb-2">
                                            {podium[0].name}
                                        </h3>
                                        <div className="font-display text-5xl text-yellow-600 mb-1">
                                            {podium[0].time}
                                        </div>
                                        <div className="font-body text-sm text-zinc-500">
                                            {podium[0].pace} /km
                                        </div>
                                    </div>
                                    <button
                                        // onClick={() =>
                                        //     downloadCertificate(
                                        //         podium[0],
                                        //         race?.name || "Race",
                                        //         formatDate(race?.start_time),
                                        //     )
                                        // }
                                        onClick={() =>
                                            openCertificateEditor(podium[0])
                                        }
                                        className="certificate-btn mt-4 w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-heading text-base rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        <Download className="w-4 h-4" />
                                        CERTIFICATE
                                    </button>
                                </div>
                            </div>
                        )}

                        {podium[2] && (
                            <div className="podium-3 flex-1 text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 rounded-full medal-bronze flex items-center justify-center shine">
                                        <Award className="w-12 h-12 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-orange-700 rounded-full flex items-center justify-center font-heading text-lg">
                                        3
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-orange-300 rounded-t-2xl p-6 min-h-[240px] flex flex-col justify-between">
                                    <div>
                                        <div className="font-heading text-sm text-zinc-500 mb-1">
                                            BIB #{podium[2].bib}
                                        </div>
                                        <h3 className="font-display text-2xl text-zinc-900 mb-2">
                                            {podium[2].name}
                                        </h3>
                                        <div className="font-display text-4xl text-zinc-900 mb-1">
                                            {podium[2].time}
                                        </div>
                                        <div className="font-body text-sm text-zinc-500">
                                            {podium[2].pace} /km
                                        </div>
                                    </div>
                                    <button
                                        // onClick={() =>
                                        //     downloadCertificate(
                                        //         podium[2],
                                        //         race?.name || "Race",
                                        //         formatDate(race?.start_time),
                                        //     )
                                        // }
                                        onClick={() =>
                                            openCertificateEditor(podium[2])
                                        }
                                        className="certificate-btn mt-4 w-full py-2 bg-orange-100 hover:bg-orange-200 text-orange-900 font-heading text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        CERTIFICATE
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Complete Results Section */}
                <div className="fade-in-delay-3">
                    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        {/* Search and Filter Bar */}
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or bib number..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg font-body focus:outline-none focus:border-cyan-600 transition-colors"
                                    />
                                </div>

                                <button
                                    onClick={() =>
                                        exportResults(filteredResults)
                                    }
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-heading text-lg rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    EXPORT
                                </button>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
                                <span>
                                    Showing {filteredResults.length} of{" "}
                                    {resultsData.length} results
                                </span>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            POSITION
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            BIB
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            RUNNER
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            TIME
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            PACE
                                        </th>
                                        <th className="px-6 py-4 text-center font-heading text-sm text-zinc-700">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredResults.map((runner) => (
                                        <tr
                                            key={runner.id}
                                            className="result-row border-b border-gray-200 cursor-pointer"
                                            onClick={() =>
                                                setSelectedRunner(runner)
                                            }
                                        >
                                            {/* POSITION */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-display text-2xl text-zinc-900">
                                                        {runner.position}
                                                    </span>
                                                    {runner.position <= 3 && (
                                                        <div
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                                runner.position ===
                                                                1
                                                                    ? "medal-gold"
                                                                    : runner.position ===
                                                                        2
                                                                      ? "medal-silver"
                                                                      : "medal-bronze"
                                                            }`}
                                                        >
                                                            <span className="text-white text-xs">
                                                                ★
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* BIB */}
                                            <td className="px-6 py-5">
                                                <span className="font-heading text-lg text-cyan-600">
                                                    #{runner.bib}
                                                </span>
                                            </td>

                                            {/* RUNNER */}
                                            <td className="px-6 py-5">
                                                <div className="font-body font-semibold text-zinc-900">
                                                    {runner.name}
                                                </div>
                                            </td>

                                            {/* TIME */}
                                            <td className="px-6 py-5">
                                                <span className="font-display text-xl text-zinc-900">
                                                    {runner.time}
                                                </span>
                                            </td>

                                            {/* PACE */}
                                            <td className="px-6 py-5">
                                                <span className="font-body text-zinc-700">
                                                    {runner.pace}{" "}
                                                    <span className="text-zinc-500 text-sm">
                                                        /km
                                                    </span>
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        // onClick={(e) => {
                                                        //     e.stopPropagation()
                                                        //     downloadCertificate(
                                                        //         runner,
                                                        //         race?.name ||
                                                        //             "Race",
                                                        //         formatDate(
                                                        //             race?.start_time,
                                                        //         ),
                                                        //     )
                                                        // }}
                                                        onClick={() =>
                                                            openCertificateEditor(
                                                                runner,
                                                            )
                                                        }
                                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                    >
                                                        <Download className="w-4 h-4 text-zinc-700" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Runner Detail Modal */}
                {selectedRunner && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setSelectedRunner(null)}
                    >
                        <div
                            className="bg-white border-2 border-cyan-200 rounded-lg p-8 max-w-3xl w-full shadow-2xl fade-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                            selectedRunner.position === 1
                                                ? "medal-gold"
                                                : selectedRunner.position === 2
                                                  ? "medal-silver"
                                                  : selectedRunner.position ===
                                                      3
                                                    ? "medal-bronze"
                                                    : "bg-gray-200"
                                        }`}
                                    >
                                        <span className="font-display text-2xl text-white">
                                            {selectedRunner.position}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-heading text-sm text-cyan-600 mb-1">
                                            BIB #{selectedRunner.bib}
                                        </div>
                                        <h3 className="font-display text-4xl text-zinc-900 mb-2">
                                            {selectedRunner.name}
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedRunner(null)}
                                    className="text-zinc-400 hover:text-zinc-900 text-3xl leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-lg">
                                    <div className="font-body text-sm text-zinc-600 mb-1">
                                        Finish Time
                                    </div>
                                    <div className="font-display text-3xl text-cyan-700">
                                        {selectedRunner.time}
                                    </div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
                                    <div className="font-body text-sm text-zinc-600 mb-1">
                                        Avg Pace
                                    </div>
                                    <div className="font-display text-3xl text-green-700">
                                        {selectedRunner.pace}
                                    </div>
                                </div>
                            </div>

                            {/* Splits */}
                            {selectedRunner.splits.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-heading text-xl text-zinc-900 mb-3">
                                        SPLIT TIMES
                                    </h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        {selectedRunner.splits.map(
                                            (split, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center"
                                                >
                                                    <div className="font-body text-xs text-zinc-500 mb-1">
                                                        KM {index + 1}
                                                    </div>
                                                    <div className="font-display text-xl text-zinc-900">
                                                        {split}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() =>
                                        downloadCertificate(
                                            selectedRunner,
                                            race?.name || "Race",
                                            formatDate(race?.start_time),
                                        )
                                    }
                                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-lg rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    DOWNLOAD CERTIFICATE
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showCertificateEditor && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    onClick={() => setShowCertificateEditor(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl">
                                    <Edit3 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Customize Certificate
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Edit certificate details before
                                        downloading
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCertificateEditor(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Runner Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Runner Name *
                                </label>
                                <input
                                    type="text"
                                    value={certificateData.runnerName}
                                    onChange={(e) =>
                                        setCertificateData({
                                            ...certificateData,
                                            runnerName: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                                    placeholder="Enter runner name"
                                />
                            </div>

                            {/* BIB Number */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    BIB Number *
                                </label>
                                <input
                                    type="text"
                                    value={certificateData.bibNumber}
                                    onChange={(e) =>
                                        setCertificateData({
                                            ...certificateData,
                                            bibNumber: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                                    placeholder="Enter BIB number"
                                />
                            </div>

                            {/* Row: Finish Time & Average Pace */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Finish Time *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={certificateData.finishTime}
                                            onChange={(e) =>
                                                setCertificateData({
                                                    ...certificateData,
                                                    finishTime: e.target.value,
                                                })
                                            }
                                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                                            placeholder="00:00:00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Average Pace *
                                    </label>
                                    <div className="relative">
                                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={certificateData.averagePace}
                                            onChange={(e) =>
                                                setCertificateData({
                                                    ...certificateData,
                                                    averagePace: e.target.value,
                                                })
                                            }
                                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                                            placeholder="0:00"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Race Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Race Name *
                                </label>
                                <input
                                    type="text"
                                    value={certificateData.raceName}
                                    onChange={(e) =>
                                        setCertificateData({
                                            ...certificateData,
                                            raceName: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                                    placeholder="Enter race name"
                                />
                            </div>

                            {/* Race Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Race Date *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={certificateData.raceDate}
                                        onChange={(e) =>
                                            setCertificateData({
                                                ...certificateData,
                                                raceDate: e.target.value,
                                            })
                                        }
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                                        placeholder="e.g., January 27, 2026"
                                    />
                                </div>
                            </div>

                            {/* Venue */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Venue
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={certificateData.venue}
                                        onChange={(e) =>
                                            setCertificateData({
                                                ...certificateData,
                                                venue: e.target.value,
                                            })
                                        }
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                                        placeholder="Enter venue location (optional)"
                                    />
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex gap-3">
                                <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-medium mb-1">
                                        Preview Before Download
                                    </p>
                                    <p className="text-blue-700">
                                        Make sure all information is correct.
                                        The certificate will include the
                                        position badge (
                                        {certificateData.position === 1
                                            ? "1st Place"
                                            : certificateData.position === 2
                                              ? "2nd Place"
                                              : certificateData.position === 3
                                                ? "3rd Place"
                                                : "Finisher"}
                                        ) automatically.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCertificateEditor(false)}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDownloadCustomCertificate}
                                disabled={
                                    !certificateData.runnerName ||
                                    !certificateData.bibNumber ||
                                    !certificateData.finishTime ||
                                    !certificateData.averagePace ||
                                    !certificateData.raceName ||
                                    !certificateData.raceDate
                                }
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download Certificate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
