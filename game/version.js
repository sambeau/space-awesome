const b = 40
const v = "0.1"

export const build = b.toString().padStart( 3, "0" )
export const version = v + "." + build
