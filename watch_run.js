const { exec } = require("child_process")
const { readFileSync, accessSync, constants } = require("fs")
const { join, basename, parse, format } = require("path")

let package, tsconfig
try {
    accessSync(join(__dirname, "./package.json"), constants.R_OK)
    package = JSON.parse(readFileSync(join(__dirname, "./package.json"), "utf-8"))
} catch {
    throw Error("package.json file read defeat")
}

try {
    accessSync(join(__dirname, "./tsconfig.json"), constants.R_OK)
    tsconfig = JSON.parse(readFileSync(join(__dirname, "./tsconfig.json"), "utf-8"))
} catch {
    tsconfig = null
}

const js_wtahc_entry = get_js_wtahc_entry()
spawn_cmd("tsc -w")
spawn_cmd(`nodemon ${js_wtahc_entry}`)

function spawn_cmd(cmd, avgs) {
    const process = exec(cmd, avgs)

    process.stdout.on("data", data => {
        console.log(data)
    })

    process.on("error", msg => {
        console.log(msg)
    })
}

function get_js_wtahc_entry() {
    if (package.out_main) {
        return package.out_main
    }

    if (tsconfig.compilerOptions.outFile) {
        return tsconfig.compilerOptions.outFile
    }

    if (tsconfig.compilerOptions.outDir) {
        return join(tsconfig.compilerOptions.outDir, `${basename(package.main, "ts")}js`)
    }

    return format({
        ...parse(package.main),
        ext: ".js"
    })
}
