#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const candidateFiles = ['.env.local', '.env', '.env.example']

function findSourceFile() {
  for (const file of candidateFiles) {
    const fullPath = path.join(repoRoot, file)
    if (fs.existsSync(fullPath)) {
      return fullPath
    }
  }
  return null
}

function parseEnv(content) {
  const result = {}
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line || line.startsWith('#')) return
      const eqIndex = line.indexOf('=')
      if (eqIndex === -1) return
      const key = line.slice(0, eqIndex).trim()
      if (!key) return
      let value = line.slice(eqIndex + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      result[key] = value
    })
  return result
}

function writeEnvFile(targetPath, entries) {
  const header =
    '# 自动生成：请修改根目录 .env 并运行 `node scripts/sync-env.mjs`\n'
  const body = entries.map(([key, value]) => `${key}=${value ?? ''}`).join('\n')
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, `${header}${body}\n`, 'utf-8')
  console.log(`✓ 写入 ${path.relative(repoRoot, targetPath)}`)
}

const sourceFile = findSourceFile()

if (!sourceFile) {
  console.error(
    `未找到环境变量文件，请先创建 .env 或 .env.example（当前目录：${repoRoot}）`
  )
  process.exit(1)
}

const parsed = parseEnv(fs.readFileSync(sourceFile, 'utf-8'))
const viteEntries = Object.entries(parsed).filter(([key]) =>
  key.startsWith('VITE_')
)

if (viteEntries.length === 0) {
  console.log('源 .env 中未找到 VITE_ 前缀变量，跳过写入。')
  process.exit(0)
}

const targets = [
  path.join(repoRoot, 'frontend/.env'),
  path.join(repoRoot, 'admin/.env')
]

targets.forEach((target) => writeEnvFile(target, viteEntries))
