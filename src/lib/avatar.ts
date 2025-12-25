type AvatarOptions = {
    background?: string
    color?: string
    size?: number
    rounded?: boolean
}

export const getAvatarUrl = (name: string, options: AvatarOptions = {}) => {
    const {
        background = "0D8ABC",
        color = "ffffff",
        size = 128,
        rounded = true,
    } = options

    const encodedName = encodeURIComponent(name)

    const params = new URLSearchParams({
        name: encodedName,
        background,
        color,
        size: size.toString(),
    })

    if (rounded) {
        params.append("rounded", "true")
    }

    return `https://ui-avatars.com/api/?${params.toString()}`
}
