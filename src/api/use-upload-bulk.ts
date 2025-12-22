import { useState } from "react"

interface UploadResult {
    url: string
    public_id: string
    format: string
    resource_type: string
}

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env
    .VITE_CLOUDINARY_CLOUD_UPLOAD_PRESET

export function useCloudinaryBulkUpload() {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [results, setResults] = useState<UploadResult[]>([])

    const upload = async (files: File | File[]) => {
        setUploading(true)
        setError(null)
        setResults([])

        try {
            const fileArray = Array.isArray(files) ? files : [files]

            const uploads = await Promise.all(
                fileArray.map(async (file) => {
                    const formData = new FormData()
                    formData.append("file", file)
                    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

                    const res = await fetch(
                        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
                        { method: "POST", body: formData }
                    )

                    if (!res.ok) throw new Error("Upload failed")
                    return await res.json()
                })
            )

            const mapped = uploads.map((data) => ({
                url: data.secure_url,
                public_id: data.public_id,
                format: data.format,
                resource_type: data.resource_type,
            }))

            setResults(mapped)
            return mapped
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload error")
            throw err
        } finally {
            setUploading(false)
        }
    }

    return { upload, uploading, error, results }
}
