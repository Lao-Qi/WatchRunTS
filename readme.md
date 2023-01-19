# 快速的监听并运行 ts 文件

### 所需环境

-   node
-   npm

### 所需的包

-   typescript
-   nodemon

### 开始

#### 全局安装那俩包

```git
npm i -g typescript nodemon
```

#### 初始化一个项目

```git
npm init -y
```

#### 新建 ts 文件

```ts
const test: string = "test"
console.log(test)
```

#### 在项目根目录新建 watch_run.js 文件

```js
const { exec } = require("child_process")

spawn_cmd("tsc -w index.ts")
spawn_cmd("nodemon index.js")

function spawn_cmd(cmd, avgs) {
    const process = exec(cmd, avgs)

    process.stdout.on("data", data => {
        console.log(data)
    })

    process.on("error", msg => {
        console.log(msg)
    })
}
```

#### 添加一条命令

```json
{
    ...
    "scripts": {
        ...
        "dev": "node watch_run.js"
    }
}
```

#### 效果

![](/assets/Snipaste_2023-01-19_13-28-51.png)
![](/assets/Snipaste_2023-01-19_13-30-02.png)

#### 额外

我们还可以添加一点小小的改动，比如下面这样

```js
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
```

上面的代码我们实现了让项目可以添加`tsconfig.json`文件，并且可以利用它获取 ts 解析后的文件位置，让 nodemon 可以监听
