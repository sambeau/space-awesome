const b = 12
const v = "0.0"

export const build = b.toString().padStart(3, "0")
export const version = v + "." + build
