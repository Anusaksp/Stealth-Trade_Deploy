"use client"

/**
 * Lab 05 — Merkle Trees (พิสูจน์ว่า Order หนึ่งรายการอยู่ในชุดข้อมูลจริง)
 *
 * ไฟล์นี้รวมทุกอย่างจากโปรเจกต์ Next.js/TypeScript เดิม (context, ทุกคอมโพเนนต์,
 * ทุกขั้นของบทเรียน และตรรกะ Merkle tree) ไว้ในไฟล์ React (.jsx) เดียว
 * ทำงานเหมือนต้นฉบับ 100% — สไตล์ทั้งหมดถูกแยกไปไว้ที่ ./lab5.css
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Boxes,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Fingerprint,
  GitBranch,
  GraduationCap,
  HelpCircle,
  Link2,
  PartyPopper,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react"
import "../../css/lab5.css"

/** รวมชื่อคลาสแบบมีเงื่อนไข (เทียบเท่า clsx/cn แบบง่าย) */
function cx(...args) {
  return args.filter(Boolean).join(" ")
}

/* ==========================================================================
   lib/merkle — ตรรกะ Merkle tree (SHA-256 จริงผ่าน Web Crypto API)
   ========================================================================== */

export const orders = [
  { id: "A", label: "Order A", value: "BUY 0.2 BTC @ 68,420" },
  { id: "B", label: "Order B", value: "SELL 1.5 ETH @ 3,220" },
  { id: "C", label: "Order C", value: "BUY 500 USDT" },
  { id: "D", label: "Order D", value: "SELL 0.05 BTC @ 69,100" },
]

/** SHA-256 จริงผ่าน Web Crypto API, คืนค่าเป็น hex ตัวพิมพ์เล็ก */
async function sha256Hex(message) {
  const data = new TextEncoder().encode(message)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

const MID_LABELS = ["H(A+B)", "H(C+D)"]

/** สร้าง Merkle tree แบบ 4 ใบด้วย SHA-256 จริง */
async function buildMerkleTree(values) {
  const leafHashes = await Promise.all(values.map((v) => sha256Hex(v)))
  const midHashes = [
    await sha256Hex(leafHashes[0] + leafHashes[1]),
    await sha256Hex(leafHashes[2] + leafHashes[3]),
  ]
  const root = await sha256Hex(midHashes[0] + midHashes[1])
  return {
    values,
    leafHashes,
    midHashes,
    root,
    layers: [leafHashes, midHashes, [root]],
  }
}

/** Hash ของข้าง ๆ ที่ต้องใช้เพื่อเดินจากใบไปหา root */
function getAuthenticationPath(tree, leafIndex) {
  const leafSiblingIndex = leafIndex ^ 1
  const parentIndex = leafIndex >> 1
  const midSiblingIndex = parentIndex ^ 1
  const leafId = ["A", "B", "C", "D"]

  return [
    {
      nodeId: `leaf-${leafSiblingIndex}`,
      label: `H(${leafId[leafSiblingIndex]})`,
      hash: tree.leafHashes[leafSiblingIndex],
      position: leafIndex % 2 === 0 ? "right" : "left",
    },
    {
      nodeId: `mid-${midSiblingIndex}`,
      label: MID_LABELS[midSiblingIndex],
      hash: tree.midHashes[midSiblingIndex],
      position: parentIndex % 2 === 0 ? "right" : "left",
    },
  ]
}

async function combine(a, b, position) {
  // `position` บอกว่า sibling อยู่ฝั่งไหน ค่าที่เราถืออยู่จึงไปอยู่อีกฝั่ง
  return position === "left" ? sha256Hex(b + a) : sha256Hex(a + b)
}

/** คำนวณ root ใหม่จาก hash ของใบ + sibling hash ที่เรียงลำดับแล้ว */
async function computeRootFromProof(leafHash, siblings) {
  const steps = []
  let current = leafHash
  for (const sib of siblings) {
    current = await combine(current, sib.hash, sib.position)
    steps.push(current)
  }
  return { steps, root: current }
}

function verifyInclusion(computedRoot, expectedRoot) {
  return computedRoot === expectedRoot
}

/** สลับตัวอักษร hex ตัวแรก เพื่อจำลองว่าข้อมูลถูกปลอมแปลง (แต่ยังเป็น hex ที่ถูกต้อง) */
function tamperHash(hash) {
  const first = hash[0]
  const replacement = first === "0" ? "1" : "0"
  return replacement + hash.slice(1)
}

function truncateHash(hash, head = 8) {
  if (!hash) return ""
  return `${hash.slice(0, head)}...`
}

/* ==========================================================================
   context — สถานะรวมของบทเรียนทั้งหมด
   ========================================================================== */

export const TOTAL_STEPS = 8

/** ข้อมูลของแต่ละขั้น (จุดสำหรับ progress + ข้อความของผู้สอน) ขั้นที่ 0 คือบทนำ */
export const STEP_META = [
  {
    index: 0,
    topic: "บทนำ",
    mentor:
      "สวัสดีครับ! วันนี้เราจะพิสูจน์ว่า Order หนึ่งรายการอยู่ในชุดข้อมูล โดยไม่ต้องเปิดเผยข้อมูลทั้งหมด",
  },
  {
    index: 1,
    topic: "ปัญหาที่เราจะแก้",
    mentor:
      "ก่อนสร้างต้นไม้ เรามาดูปัญหากันก่อนครับ เราจะพิสูจน์ได้ยังไงว่า Order อยู่ในข้อมูลจริง โดยไม่ต้องเปิดเผยทุก Order?",
  },
  {
    index: 2,
    topic: "สร้างรอยประทับ",
    mentor: "ก่อนเอาข้อมูลมาจับคู่กัน เราทำให้แต่ละ Order กลายเป็นรอยประทับดิจิทัลก่อนครับ",
  },
  {
    index: 3,
    topic: "ประกอบต้นไม้",
    mentor: "ลองจับ Hash สองตัวมารวมกันครับ เราจะได้รอยประทับของ “คู่นี้”",
  },
  {
    index: 4,
    topic: "เลือกสิ่งที่จะพิสูจน์",
    mentor: "ตอนนี้เลือก Order ที่คุณอยากพิสูจน์ได้เลยครับ",
  },
  {
    index: 5,
    topic: "หา Hash ข้าง ๆ",
    mentor: "เราไม่จำเป็นต้องรู้ทุกข้อมูลแล้วครับ ลองมองหา Hash ของข้อมูลที่อยู่ข้าง ๆ Order ที่เราเลือก",
  },
  {
    index: 6,
    topic: "เดินกลับไปหา Root",
    mentor: "ตอนนี้เรามีหลักฐานครบแล้วครับ ลองเดินย้อนกลับจาก Order ไปหา Root ทีละขั้น",
  },
  {
    index: 7,
    topic: "ทดสอบการปลอมแปลง",
    mentor: "ลองเปลี่ยนข้อมูลดูครับ ถ้าข้อมูลเปลี่ยน Hash และ Root จะเปลี่ยนตามไหม?",
  },
  {
    index: 8,
    topic: "สรุปประโยชน์",
    mentor: "เห็นแล้วใช่ไหมครับว่าเราไม่ต้องเปิดเผยทุก Order เราใช้แค่ข้อมูลบนเส้นทางที่จำเป็น",
  },
]

const initialState = {
  currentStep: 0,
  completedSteps: [],
  // step 1
  step1Answer: null,
  step1Correct: false,
  // step 2
  hashedLeaves: [false, false, false, false],
  // step 3
  builtPairs: [false, false],
  builtRoot: false,
  // step 4
  selectedLeaf: null,
  // step 5
  foundSiblings: [],
  // step 6
  computedInterim: false,
  computedRoot: false,
  // step 7
  tamperMode: false,
}

const Ctx = createContext(null)

export function Lab05Provider({ children }) {
  const [state, setState] = useState(initialState)
  const [tree, setTree] = useState(null)

  useEffect(() => {
    let active = true
    buildMerkleTree(orders.map((o) => o.value)).then((t) => {
      if (active) setTree(t)
    })
    return () => {
      active = false
    }
  }, [])

  const authPath = useMemo(() => {
    if (!tree || state.selectedLeaf === null) return []
    return getAuthenticationPath(tree, state.selectedLeaf)
  }, [tree, state.selectedLeaf])

  const isStepComplete = useCallback(
    (step) => {
      switch (step) {
        case 0:
          return true
        case 1:
          return state.step1Correct
        case 2:
          return state.hashedLeaves.every(Boolean)
        case 3:
          return state.builtPairs.every(Boolean) && state.builtRoot
        case 4:
          return state.selectedLeaf !== null
        case 5:
          return authPath.length > 0 && authPath.every((s) => state.foundSiblings.includes(s.nodeId))
        case 6:
          return state.computedRoot
        case 7:
          return state.completedSteps.includes(7) || state.currentStep > 7
        case 8:
          return true
        default:
          return false
      }
    },
    [state, authPath],
  )

  const canProceed = isStepComplete(state.currentStep)

  const markComplete = useCallback((step) => {
    setState((s) =>
      s.completedSteps.includes(step) ? s : { ...s, completedSteps: [...s.completedSteps, step] },
    )
  }, [])

  const goNext = useCallback(() => {
    setState((s) => {
      if (s.currentStep >= TOTAL_STEPS) return s
      const completed = s.completedSteps.includes(s.currentStep)
        ? s.completedSteps
        : [...s.completedSteps, s.currentStep]
      return { ...s, currentStep: s.currentStep + 1, completedSteps: completed }
    })
  }, [])

  const goPrev = useCallback(() => {
    setState((s) => (s.currentStep <= 0 ? s : { ...s, currentStep: s.currentStep - 1 }))
  }, [])

  const goToStep = useCallback((step) => {
    setState((s) => {
      // ไปยังบทนำ, ขั้นที่ทำเสร็จแล้ว, หรือขั้นปัจจุบันได้เท่านั้น
      if (step === s.currentStep) return s
      if (step !== 0 && step !== s.currentStep && !s.completedSteps.includes(step)) return s
      return { ...s, currentStep: step }
    })
  }, [])

  const reset = useCallback(() => setState(initialState), [])

  const answerStep1 = useCallback((choice) => {
    const correct = choice === 1
    setState((s) => ({ ...s, step1Answer: choice, step1Correct: correct }))
    if (correct) markComplete(1)
  }, [markComplete])

  const revealHash = useCallback((index) => {
    setState((s) => {
      const hashedLeaves = [...s.hashedLeaves]
      hashedLeaves[index] = true
      return { ...s, hashedLeaves }
    })
  }, [])

  const buildPair = useCallback((pair) => {
    setState((s) => {
      const builtPairs = [...s.builtPairs]
      builtPairs[pair] = true
      return { ...s, builtPairs }
    })
  }, [])

  const buildRoot = useCallback(() => setState((s) => ({ ...s, builtRoot: true })), [])

  const selectLeaf = useCallback((index) => {
    setState((s) => {
      // เปลี่ยนเป้าหมายแล้วต้องล้างสถานะขั้นถัดไปทั้งหมด
      if (s.selectedLeaf === index) return s
      return {
        ...s,
        selectedLeaf: index,
        foundSiblings: [],
        computedInterim: false,
        computedRoot: false,
        tamperMode: false,
      }
    })
  }, [])

  const findSibling = useCallback(
    (nodeId) => {
      const isOnPath = authPath.some((s) => s.nodeId === nodeId)
      if (!isOnPath) return "wrong"
      if (state.foundSiblings.includes(nodeId)) return "already"
      setState((s) => ({ ...s, foundSiblings: [...s.foundSiblings, nodeId] }))
      return "correct"
    },
    [authPath, state.foundSiblings],
  )

  const computeInterim = useCallback(() => setState((s) => ({ ...s, computedInterim: true })), [])

  const computeRootStep = useCallback(() => {
    setState((s) => ({ ...s, computedRoot: true }))
    markComplete(6)
  }, [markComplete])

  const toggleTamper = useCallback(() => {
    setState((s) => ({ ...s, tamperMode: !s.tamperMode }))
    markComplete(7)
  }, [markComplete])

  const value = {
    ...state,
    tree,
    authPath,
    goNext,
    goPrev,
    goToStep,
    reset,
    canProceed,
    isStepComplete,
    answerStep1,
    revealHash,
    buildPair,
    buildRoot,
    selectLeaf,
    findSibling,
    computeInterim,
    computeRootStep,
    toggleTamper,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLab05() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useLab05 must be used within Lab05Provider")
  return ctx
}

/* ==========================================================================
   components — ชิ้นส่วน UI ย่อย
   ========================================================================== */

function ChoiceCard({ selected, state = "default", disabled, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cx(
        "lab5-choice",
        selected && state === "default" && "lab5-choice--selected",
        state === "correct" && "lab5-choice--correct",
        state === "incorrect" && "lab5-choice--incorrect",
        className,
      )}
    >
      {children}
    </button>
  )
}

const feedbackConfig = {
  correct: { icon: CheckCircle2, tone: "success" },
  success: { icon: CheckCircle2, tone: "success" },
  incorrect: { icon: RotateCcw, tone: "danger" },
  failed: { icon: XCircle, tone: "danger" },
}

function FeedbackCard({ variant, title, children, className }) {
  const c = feedbackConfig[variant]
  const Icon = c.icon
  return (
    <div
      role="status"
      className={cx(
        "lab5-animate-merge-up lab5-feedback",
        c.tone === "success" ? "lab5-feedback--success" : "lab5-feedback--danger",
        className,
      )}
    >
      <Icon className={cx("lab5-feedback-icon", c.tone === "success" ? "lab5-feedback-icon--success" : "lab5-feedback-icon--danger")} />
      <div className="lab5-space-y-1">
        <p className={cx("lab5-feedback-title", c.tone === "success" ? "lab5-feedback-title--success" : "lab5-feedback-title--danger")}>
          {title}
        </p>
        {children && <div className="lab5-text-sm lab5-leading-relaxed lab5-text-foreground-80">{children}</div>}
      </div>
    </div>
  )
}

const GLOSSARY_ENTRIES = [
  { term: "Hash", def: "รอยประทับดิจิทัลของข้อมูล" },
  { term: "Leaf", def: "ข้อมูลที่อยู่ปลายสุดของต้นไม้ เช่น Order A" },
  { term: "Sibling Hash", def: "Hash ของข้อมูลที่อยู่ข้าง ๆ บนเส้นทางที่เรากำลังพิสูจน์" },
  { term: "Root", def: "Hash เดียวที่สรุปต้นไม้ทั้งหมด" },
  { term: "Authentication Path", def: "ชุดของ Hash ที่เราต้องใช้เพื่อเดินจากข้อมูลที่เลือกกลับไปหา Root" },
  { term: "Inclusion Proof", def: "หลักฐานที่แสดงว่า Order นี้อยู่ในต้นไม้" },
]

/**
 * คำศัพท์แบบยุบไว้ก่อน (ปิดโดยดีฟอลต์) อยู่ในหัว เพื่อไม่ให้ขัดจังหวะการเรียน
 * ผู้เรียนเปิดดูเองเมื่อต้องการเช็คคำศัพท์
 */
function Glossary() {
  const [open, setOpen] = useState(false)

  return (
    <div className="lab5-mx-auto lab5-w-full lab5-max-w-3xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-border lab5-border-border lab5-bg-surface-soft lab5-px-3 lab5-py-1.5 lab5-text-xs lab5-font-semibold lab5-text-muted-foreground lab5-transition-colors lab5-hover-surface"
      >
        <BookOpen className="lab5-size-3.5" />
        คำศัพท์ที่เพิ่งเจอ
        <ChevronDown className={cx("lab5-size-3.5 lab5-transition-transform", open && "lab5-rotate-180")} />
      </button>

      {open && (
        <div className="lab5-animate-merge-up lab5-mt-2 lab5-grid lab5-gap-2 lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface lab5-p-3 lab5-sm:grid-cols-2">
          {GLOSSARY_ENTRIES.map((entry) => (
            <div key={entry.term} className="lab5-rounded-lg lab5-bg-surface-soft lab5-p-2.5">
              <p className="lab5-text-xs lab5-font-bold lab5-text-primary">{entry.term}</p>
              <p className="lab5-mt-0.5 lab5-text-xs lab5-leading-relaxed lab5-text-muted-foreground">{entry.def}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const hashToneClass = {
  neutral: "lab5-hash-toggle--neutral",
  primary: "lab5-hash-toggle--primary",
  success: "lab5-hash-toggle--success",
  danger: "lab5-hash-toggle--danger",
}

function HashValue({ hash, label, tone = "neutral", className }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={cx("lab5-inline-flex lab5-flex-col lab5-gap-1", className)}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className={cx("lab5-hash-toggle", hashToneClass[tone])}
        aria-expanded={expanded}
      >
        {label && <span className="lab5-font-sans lab5-font-semibold lab5-not-italic">{label}</span>}
        <span>{expanded ? "ซ่อน" : truncateHash(hash)}</span>
      </button>

      {expanded && (
        <div className="lab5-animate-merge-up lab5-flex lab5-items-start lab5-gap-2 lab5-rounded-lg lab5-border lab5-border-border lab5-bg-surface lab5-p-2">
          <code className="lab5-break-all lab5-font-mono lab5-text-11 lab5-leading-relaxed lab5-text-foreground">{hash}</code>
          <button
            type="button"
            onClick={copy}
            className="lab5-shrink-0 lab5-rounded-md lab5-p-1 lab5-text-muted-foreground lab5-transition-colors lab5-hover-surface-soft lab5-hover-text-primary"
            aria-label="คัดลอก hash"
          >
            {copied ? <Check className="lab5-size-3.5 lab5-text-success" /> : <Copy className="lab5-size-3.5" />}
          </button>
        </div>
      )}
    </div>
  )
}

function HintButton({ label = "ทำไม?", children, className }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cx("lab5-space-y-2", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-px-3 lab5-py-1.5 lab5-text-xs lab5-font-semibold lab5-text-primary lab5-transition-colors lab5-hover-primary-10"
      >
        <HelpCircle className="lab5-size-3.5" />
        {label}
      </button>
      {open && (
        <div className="lab5-animate-merge-up lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-3 lab5-text-sm lab5-leading-relaxed lab5-text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  )
}

function LessonHeading({ sectionLabel, title, description }) {
  return (
    <div className="lab5-space-y-2">
      <span className="lab5-inline-block lab5-rounded-full lab5-bg-primary-soft lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-primary">
        {sectionLabel}
      </span>
      <h2 className="lab5-text-balance lab5-text-xl lab5-font-extrabold lab5-leading-tight lab5-text-foreground lab5-sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="lab5-text-pretty lab5-text-sm lab5-leading-relaxed lab5-text-muted-foreground lab5-sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}

function MentorMessage({ message }) {
  return (
    <div className="lab5-flex lab5-items-start lab5-gap-3 lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4 lab5-shadow-sm">
      <div className="lab5-flex lab5-size-10 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full lab5-bg-primary-soft lab5-text-primary">
        <GraduationCap className="lab5-size-5" />
      </div>
      <div className="lab5-min-w-0">
        <div className="lab5-flex lab5-items-baseline lab5-gap-2">
          <span className="lab5-text-sm lab5-font-bold lab5-text-foreground">อ.มิน</span>
          <span className="lab5-text-xs lab5-text-muted-foreground">ผู้สอน</span>
        </div>
        <p className="lab5-mt-0.5 lab5-text-sm lab5-leading-relaxed lab5-text-foreground-80 lab5-text-pretty">{message}</p>
      </div>
    </div>
  )
}

const NODE_LAYOUT = [
  { id: "root", label: "ROOT", cx: 50, cy: 12 },
  { id: "mid-0", label: "H(A+B)", cx: 26, cy: 44 },
  { id: "mid-1", label: "H(C+D)", cx: 74, cy: 44 },
  { id: "leaf-0", label: "H(A)", cx: 12, cy: 80 },
  { id: "leaf-1", label: "H(B)", cx: 38, cy: 80 },
  { id: "leaf-2", label: "H(C)", cx: 62, cy: 80 },
  { id: "leaf-3", label: "H(D)", cx: 88, cy: 80 },
]

const EDGES = [
  ["root", "mid-0"],
  ["root", "mid-1"],
  ["mid-0", "leaf-0"],
  ["mid-0", "leaf-1"],
  ["mid-1", "leaf-2"],
  ["mid-1", "leaf-3"],
]

const nodeStateClass = {
  neutral: "lab5-node--neutral",
  target: "lab5-node--target",
  path: "lab5-node--path",
  success: "lab5-node--success",
  error: "lab5-node--error",
}

function MerkleTreeDiagram({ states = {}, visible, hashesFor = [], clickable = [], onNodeClick, className }) {
  const { tree } = useLab05()

  const hashFor = (id) => {
    if (!tree || !hashesFor.includes(id)) return undefined
    if (id === "root") return tree.root
    if (id.startsWith("mid-")) return tree.midHashes[Number(id.slice(4))]
    if (id.startsWith("leaf-")) return tree.leafHashes[Number(id.slice(5))]
    return undefined
  }

  const isVisible = (id) => (visible ? visible[id] !== false : true)
  const nodeState = (id) => states[id] ?? "neutral"

  const edgeActive = (a, b) => {
    if (!isVisible(a) || !isVisible(b)) return false
    const sa = nodeState(a)
    const sb = nodeState(b)
    const lit = (s) => s === "path" || s === "target" || s === "success"
    const err = (s) => s === "error"
    if (err(sa) || err(sb)) return "error"
    return lit(sa) && lit(sb) ? "active" : false
  }

  return (
    <div className={cx("lab5-relative lab5-mx-auto lab5-h-64 lab5-w-full lab5-max-w-2xl lab5-sm:h-80", className)}>
      <svg className="lab5-absolute lab5-inset-0 lab5-h-full lab5-w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {EDGES.map(([a, b]) => {
          const from = NODE_LAYOUT.find((n) => n.id === a)
          const to = NODE_LAYOUT.find((n) => n.id === b)
          if (!isVisible(a) || !isVisible(b)) return null
          const active = edgeActive(a, b)
          return (
            <line
              key={`${a}-${b}`}
              x1={from.cx}
              y1={from.cy}
              x2={to.cx}
              y2={to.cy}
              vectorEffect="non-scaling-stroke"
              className={cx(
                "lab5-transition-colors lab5-duration-300",
                active === "active" && "lab5-stroke-primary",
                active === "error" && "lab5-stroke-danger",
                !active && "lab5-stroke-border",
              )}
              strokeWidth={active ? 2 : 1.25}
            />
          )
        })}
      </svg>

      {NODE_LAYOUT.map((node) => {
        if (!isVisible(node.id)) return null
        const state = nodeState(node.id)
        const hash = hashFor(node.id)
        const isClickable = clickable.includes(node.id)
        const Comp = isClickable ? "button" : "div"
        return (
          <Comp
            key={node.id}
            {...(isClickable ? { type: "button", onClick: () => onNodeClick?.(node.id) } : {})}
            style={{ left: `${node.cx}%`, top: `${node.cy}%` }}
            className={cx(
              "lab5-node",
              nodeStateClass[state],
              isClickable && "lab5-node--clickable",
              (state === "path" || state === "success" || state === "error") && "lab5-animate-merge-up",
            )}
          >
            <span className="lab5-node-label">{node.label}</span>
            {hash && <span className="lab5-node-hash">{truncateHash(hash, 6)}</span>}
          </Comp>
        )
      })}
    </div>
  )
}

function LabProgress() {
  const { currentStep, completedSteps, goToStep } = useLab05()
  // จุด progress แทนขั้นที่ 1..8 (บทนำไม่มีจุด)
  const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1)

  return (
    <div className="lab5-flex lab5-flex-col lab5-items-center lab5-gap-2">
      <div className="lab5-flex lab5-items-center lab5-gap-1.5 lab5-overflow-x-auto lab5-py-1">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step)
          const isCurrent = currentStep === step
          const isReachable = isCompleted || isCurrent
          return (
            <div key={step} className="lab5-flex lab5-items-center lab5-gap-1.5">
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => goToStep(step)}
                aria-label={`ขั้นที่ ${step}: ${STEP_META[step].topic}`}
                aria-current={isCurrent ? "step" : undefined}
                className={cx(
                  "lab5-dot",
                  isCurrent && "lab5-dot--current lab5-animate-soft-pulse",
                  isCompleted && !isCurrent && "lab5-dot--completed",
                  !isReachable && "lab5-dot--locked",
                  isReachable && !isCurrent && "lab5-dot--reachable",
                )}
              >
                {isCompleted && !isCurrent ? <Check className="lab5-size-3.5" /> : step}
              </button>
              {step < TOTAL_STEPS && (
                <span className={cx("lab5-progress-line lab5-sm:w-5", completedSteps.includes(step) && "lab5-progress-line--done")} />
              )}
            </div>
          )
        })}
      </div>
      <p className="lab5-text-center lab5-text-xs lab5-font-medium lab5-text-muted-foreground">
        {currentStep === 0 ? "บทนำ" : `ขั้นที่ ${currentStep} · ${STEP_META[currentStep].topic}`}
      </p>
    </div>
  )
}

function LabNavigation() {
  const { currentStep, canProceed, goNext, goPrev, reset } = useLab05()

  if (currentStep === 0) return null

  const isLast = currentStep === TOTAL_STEPS

  return (
    <div className="lab5-sticky lab5-bottom-0 lab5-z-10 lab5-border-t lab5-border-border lab5-bg-surface-85 lab5-backdrop-blur-sm">
      <div className="lab5-mx-auto lab5-flex lab5-max-w-3xl lab5-items-center lab5-justify-between lab5-gap-3 lab5-px-4 lab5-py-3">
        <button type="button" onClick={reset} className="lab5-nav-reset">
          <RotateCcw className="lab5-size-4" />
          <span className="lab5-hidden lab5-sm:inline">เริ่มใหม่</span>
        </button>

        <div className="lab5-flex lab5-items-center lab5-gap-2">
          <button type="button" onClick={goPrev} className="lab5-nav-prev">
            <ArrowLeft className="lab5-size-4" />
            ย้อนกลับ
          </button>
          {!isLast && (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className={cx("lab5-nav-next", canProceed ? "lab5-nav-next--enabled" : "lab5-nav-next--disabled")}
            >
              ไปขั้นต่อ
              <ArrowRight className="lab5-size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   steps — เนื้อหาแต่ละขั้นของบทเรียน
   ========================================================================== */

function StepIntro() {
  const { goNext } = useLab05()

  return (
    <div className="lab5-space-y-8 lab5-text-center">
      <div className="lab5-space-y-3">
        <span className="lab5-inline-block lab5-rounded-full lab5-bg-primary-soft lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-primary">
          Lab 05
        </span>
        <h1 className="lab5-text-balance lab5-text-3xl lab5-font-extrabold lab5-leading-tight lab5-text-foreground lab5-sm:text-4xl">
          Merkle Trees
        </h1>
        <p className="lab5-mx-auto lab5-max-w-md lab5-text-pretty lab5-text-base lab5-leading-relaxed lab5-text-muted-foreground">
          วันนี้เราจะเรียนรู้ส่วนหนึ่งของระบบที่ใช้พิสูจน์ข้อมูล: เราจะพิสูจน์ว่า Order หนึ่งรายการ
          อยู่ในชุดข้อมูลจริง โดยไม่ต้องเปิดเผย Order อื่นทั้งหมด
        </p>
      </div>

      <div className="lab5-flex lab5-items-center lab5-justify-center lab5-gap-3 lab5-sm:gap-5">
        <IntroPill icon={<Boxes className="lab5-size-5" />} label="Orders" />
        <ArrowRight className="lab5-size-4 lab5-shrink-0 lab5-text-muted-foreground" />
        <IntroPill icon={<Fingerprint className="lab5-size-5" />} label="รอยประทับ" />
        <ArrowRight className="lab5-size-4 lab5-shrink-0 lab5-text-muted-foreground" />
        <IntroPill icon={<GitBranch className="lab5-size-5" />} label="Root" />
      </div>

      <div className="lab5-mx-auto lab5-max-w-md lab5-space-y-2">
        <p className="lab5-text-pretty lab5-text-sm lab5-leading-relaxed lab5-text-foreground-70">
          วันนี้คุณจะลองสร้างต้นไม้เอง แล้วพิสูจน์ Order หนึ่งรายการด้วย hash เพียงบางส่วน
        </p>
        <p className="lab5-text-pretty lab5-text-xs lab5-leading-relaxed lab5-text-muted-foreground">
          หมายเหตุ: นี่ไม่ใช่ ZKP ทั้งระบบ แต่เป็นกลไกพื้นฐานที่ช่วยสร้างหลักฐานการมีอยู่ของข้อมูล
        </p>
      </div>

      <button
        type="button"
        onClick={goNext}
        className="lab5-inline-flex lab5-items-center lab5-gap-2 lab5-rounded-full lab5-bg-primary lab5-px-6 lab5-py-3 lab5-text-base lab5-font-bold lab5-text-primary-foreground lab5-shadow-sm lab5-transition-all lab5-hover-brightness"
      >
        เริ่มเรียนรู้
        <ArrowRight className="lab5-size-5" />
      </button>
    </div>
  )
}

function IntroPill({ icon, label }) {
  return (
    <div className="lab5-flex lab5-flex-col lab5-items-center lab5-gap-2">
      <div className="lab5-flex lab5-size-14 lab5-items-center lab5-justify-center lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-text-primary lab5-shadow-sm">
        {icon}
      </div>
      <span className="lab5-text-xs lab5-font-semibold lab5-text-muted-foreground">{label}</span>
    </div>
  )
}

const STEP1_CHOICES = ["ต้องส่งทั้งหมด", "ไม่จำเป็น ถ้าเรามีหลักฐานที่ตรวจสอบได้"]

function Step1WhyMerkle() {
  const { step1Answer, step1Correct, answerStep1 } = useLab05()

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="ปัญหาที่เราจะแก้"
        title="เราจะพิสูจน์ได้อย่างไรว่า Order อยู่ในชุดข้อมูล?"
        description="สมมติคุณต้องการพิสูจน์ว่า Order B อยู่ในข้อมูลจริง แต่คุณไม่อยากเปิดเผย Order A, C และ D ทั้งหมด เราจะทำยังไงดี?"
      />

      <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3 lab5-sm:grid-cols-4">
        {orders.map((o) => (
          <div key={o.id} className="lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-3 lab5-text-center">
            <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">{o.label}</p>
            <p className="lab5-mt-1 lab5-font-mono lab5-text-11 lab5-leading-tight lab5-text-muted-foreground">{o.value}</p>
            {o.id === "B" && <p className="lab5-mt-1 lab5-text-11 lab5-font-semibold lab5-text-primary">← เราต้องการพิสูจน์</p>}
          </div>
        ))}
      </div>

      <p className="lab5-text-sm lab5-font-semibold lab5-text-foreground">คุณคิดว่าเราต้องส่ง Order ทั้ง 4 รายการให้คนตรวจสอบไหม?</p>

      <div className="lab5-space-y-3">
        {STEP1_CHOICES.map((choice, i) => {
          const isSelected = step1Answer === i
          const state = step1Answer === i ? (i === 1 ? "correct" : "incorrect") : "default"
          return (
            <ChoiceCard key={i} selected={isSelected} state={state} onClick={() => answerStep1(i)}>
              <span className="lab5-text-sm lab5-font-semibold lab5-text-foreground">{choice}</span>
            </ChoiceCard>
          )
        })}
      </div>

      <HintButton>ลองคิดดูว่า ถ้าเราไม่อยากเปิดเผยข้อมูลทั้งหมด เราจะพิสูจน์ได้อย่างไรโดยใช้ข้อมูลบางส่วน?</HintButton>

      {step1Answer !== null && !step1Correct && (
        <FeedbackCard variant="incorrect" title="ลองอีกครั้ง">
          ลองคิดใหม่ครับ — เราอยากเปิดเผยข้อมูลให้น้อยที่สุดเท่าที่จะทำได้
        </FeedbackCard>
      )}

      {step1Correct && (
        <FeedbackCard variant="correct" title="ถูกต้อง">
          เราไม่จำเป็นต้องเปิดเผยทุก Order เราสามารถส่ง Order ที่ต้องการพิสูจน์ + หลักฐานบางส่วน
          แล้วให้คนตรวจสอบคำนวณกลับไปหา Root ได้
        </FeedbackCard>
      )}
    </div>
  )
}

function Step2HashOrders() {
  const { tree, hashedLeaves, revealHash } = useLab05()
  const hashedCount = hashedLeaves.filter(Boolean).length
  const allHashed = hashedLeaves.every(Boolean)

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="สร้างรอยประทับ"
        title="ก่อนสร้างต้นไม้ เราต้องทำให้แต่ละ Order เป็น “รอยประทับ” ก่อน"
        description="เรามี Order A, B, C และ D — ก่อนจะเอาข้อมูลมาสร้างต้นไม้ เราต้องเปลี่ยนแต่ละ Order ให้เป็น Hash ก่อน มองว่า Hash คือ “รอยประทับดิจิทัล” ของข้อมูลก็ได้"
      />

      <MentorMessage message="ทำไปทำไม? เพราะเราจะเอา Hash เหล่านี้ไปจับคู่กันในขั้นต่อไป เพื่อสร้างต้นไม้" />

      <div className="lab5-space-y-3">
        {orders.map((order, i) => {
          const hashed = hashedLeaves[i]
          return (
            <div key={order.id} className="lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
              <div className="lab5-flex lab5-flex-wrap lab5-items-center lab5-justify-between lab5-gap-3">
                <div>
                  <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">{order.label}</p>
                  <p className="lab5-font-mono lab5-text-xs lab5-text-muted-foreground">{order.value}</p>
                </div>

                {!hashed ? (
                  <button
                    type="button"
                    onClick={() => revealHash(i)}
                    className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-bg-primary lab5-px-4 lab5-py-2 lab5-text-sm lab5-font-semibold lab5-text-primary-foreground lab5-transition-all lab5-hover-brightness"
                  >
                    <Sparkles className="lab5-size-4" />
                    สร้างรอยประทับ
                  </button>
                ) : (
                  <div className="lab5-flex lab5-items-center lab5-gap-2 lab5-text-xs lab5-font-semibold lab5-text-success">
                    <ArrowDown className="lab5-size-4" />
                    <span className="lab5-hidden lab5-sm:inline">Hash (SHA-256)</span>
                  </div>
                )}
              </div>

              {hashed && tree && (
                <div className="lab5-animate-merge-up lab5-mt-3 lab5-border-t lab5-border-border lab5-pt-3">
                  <HashValue hash={tree.leafHashes[i]} label={`รอยประทับของ ${order.label} =`} tone="primary" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {hashedCount === 1 && !allHashed && (
        <FeedbackCard variant="correct" title="รอยประทับแรกเสร็จแล้ว">
          Order นี้ถูกเปลี่ยนเป็น Hash แล้ว ถ้าข้อมูลเดิมเหมือนเดิม Hash ก็จะได้ค่าเดิม
          จุดสำคัญคือ ถ้าข้อมูลเปลี่ยนแม้เพียงเล็กน้อย Hash ที่ได้ก็จะเปลี่ยนตาม —
          ลองสร้างรอยประทับให้ Order ที่เหลือ →
        </FeedbackCard>
      )}

      {allHashed && (
        <FeedbackCard variant="correct" title="ครบทั้ง 4 ใบแล้ว">
          Order แต่ละใบถูกเปลี่ยนเป็นรอยประทับดิจิทัล (Hash) ด้วย SHA-256 แล้ว ตอนนี้เรามี Hash ของ
          Order A, B, C และ D พร้อมนำไปประกอบเป็นต้นไม้แล้ว
        </FeedbackCard>
      )}
    </div>
  )
}

function PairButton({ label, done, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={done}
      className={
        done
          ? "lab5-flex lab5-items-center lab5-justify-center lab5-gap-2 lab5-rounded-xl lab5-border-2 lab5-border-success lab5-bg-success-soft lab5-px-4 lab5-py-3 lab5-text-sm lab5-font-bold lab5-text-success"
          : "lab5-flex lab5-items-center lab5-justify-center lab5-gap-2 lab5-rounded-xl lab5-border-2 lab5-border-primary lab5-bg-surface lab5-px-4 lab5-py-3 lab5-text-sm lab5-font-bold lab5-text-primary lab5-transition-all lab5-hover-primary-soft"
      }
    >
      <Link2 className="lab5-size-4" />
      {done ? "รวมแล้ว" : label}
    </button>
  )
}

function Step3BuildTree() {
  const { builtPairs, builtRoot, buildPair, buildRoot } = useLab05()
  const firstPairDone = builtPairs[0] && !builtPairs[1]
  const bothPairs = builtPairs.every(Boolean)

  const states = {
    "leaf-0": "neutral",
    "leaf-1": "neutral",
    "leaf-2": "neutral",
    "leaf-3": "neutral",
    "mid-0": builtPairs[0] ? "path" : "neutral",
    "mid-1": builtPairs[1] ? "path" : "neutral",
    root: builtRoot ? "success" : "neutral",
  }

  const visible = {
    "mid-0": builtPairs[0],
    "mid-1": builtPairs[1],
    root: builtRoot,
  }

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="ประกอบต้นไม้"
        title="เอา Hash มาจับคู่กัน เพื่อสร้างต้นไม้"
        description="ตอนนี้เรามีรอยประทับของ Order A, B, C และ D แล้ว ขั้นต่อไป เราจะเอา Hash ทีละ 2 ตัวมารวมกัน"
      />

      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
        <MerkleTreeDiagram states={states} visible={visible} hashesFor={["leaf-0", "leaf-1", "leaf-2", "leaf-3", "mid-0", "mid-1", "root"]} />
      </div>

      {!bothPairs && (
        <div className="lab5-space-y-3">
          <p className="lab5-text-center lab5-text-sm lab5-font-medium lab5-text-foreground">คุณคิดว่า คู่แรกควรเป็นคู่ไหน?</p>
          <div className="lab5-grid lab5-gap-3 lab5-sm:grid-cols-2">
            <PairButton label="จับคู่ H(A) + H(B)" done={builtPairs[0]} onClick={() => buildPair(0)} />
            <PairButton label="จับคู่ H(C) + H(D)" done={builtPairs[1]} onClick={() => buildPair(1)} />
          </div>
        </div>
      )}

      {firstPairDone && (
        <FeedbackCard variant="correct" title="ได้ Hash ของคู่แรกแล้ว">
          เราเอา Hash ของ A และ B มารวมกัน แล้วสร้าง Hash ใหม่ที่แทน “คู่ A+B” — ทำแบบเดียวกันกับ C
          และ D ต่อได้เลย
        </FeedbackCard>
      )}

      {bothPairs && !builtRoot && (
        <div className="lab5-animate-merge-up lab5-space-y-3">
          <FeedbackCard variant="correct" title="ครบทั้งสองคู่แล้ว">ตอนนี้เรามี Hash ที่แทนข้อมูลเป็นคู่แล้ว</FeedbackCard>
          <MentorMessage message="ตอนนี้เรายังมี 2 Hash — ถ้าอยากได้ Hash เดียวที่สรุปข้อมูลทั้ง 4 Order เราต้องรวม 2 คู่นี้อีกครั้ง" />
          <button
            type="button"
            onClick={buildRoot}
            className="lab5-mx-auto lab5-flex lab5-items-center lab5-gap-2 lab5-rounded-full lab5-bg-primary lab5-px-6 lab5-py-3 lab5-text-sm lab5-font-bold lab5-text-primary-foreground lab5-shadow-sm lab5-transition-all lab5-hover-brightness"
          >
            <Link2 className="lab5-size-4" />
            รวม H(A+B) + H(C+D) เป็น Root
          </button>
        </div>
      )}

      <HintButton>
        Parent hash เกิดจากการนำ Hash ของคู่ลูกมารวมกันแล้วสร้างรอยประทับใหม่ เราจับคู่แบบนี้ไปเรื่อย
        ๆ จนเหลือ Hash เดียว นั่นคือ Root
      </HintButton>

      {builtRoot && (
        <FeedbackCard variant="correct" title="ต้นไม้สมบูรณ์แล้ว">
          <p>
            Root คือ Hash เดียวที่สรุปข้อมูลทั้งหมดในต้นไม้ — เราเรียกมันว่า{" "}
            <span className="lab5-font-semibold">Root (Merkle Root)</span> ถ้าข้อมูลใบใดใบหนึ่งเปลี่ยน
            Root ก็จะเปลี่ยนตามทันที
          </p>
          <p className="lab5-mt-2 lab5-font-mono lab5-text-xs lab5-text-foreground-60">
            Order → Hash → จับเป็นคู่ → Hash ใหม่ → รวมต่อ → Root
          </p>
        </FeedbackCard>
      )}
    </div>
  )
}

function Step4SelectTarget() {
  const { selectedLeaf, selectLeaf } = useLab05()

  const states = selectedLeaf !== null ? { [`leaf-${selectedLeaf}`]: "target" } : {}

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="เลือกสิ่งที่จะพิสูจน์"
        title="ตอนนี้เราจะลองพิสูจน์ Order หนึ่งรายการ"
        description="เลือก Order หนึ่งรายการที่คุณอยากพิสูจน์ว่า “อยู่ในต้นไม้นี้จริง”"
      />

      <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3 lab5-sm:grid-cols-4">
        {orders.map((order, i) => (
          <ChoiceCard key={order.id} selected={selectedLeaf === i} onClick={() => selectLeaf(i)} className="lab5-text-center">
            <div className="lab5-flex lab5-flex-col lab5-items-center lab5-gap-1">
              <Target className={cx("lab5-size-5", selectedLeaf === i ? "lab5-text-primary" : "lab5-text-muted-foreground")} />
              <span className="lab5-text-sm lab5-font-bold lab5-text-foreground">{order.label}</span>
              <span className="lab5-font-mono lab5-text-10 lab5-leading-tight lab5-text-muted-foreground">{order.value}</span>
            </div>
          </ChoiceCard>
        ))}
      </div>

      {selectedLeaf !== null && (
        <div className="lab5-animate-merge-up lab5-space-y-2 lab5-text-center">
          <p className="lab5-text-sm lab5-font-semibold lab5-text-primary">
            คุณเลือก {orders[selectedLeaf].label} — ต่อไปเราจะหาหลักฐานที่จำเป็นเพื่อเดินจาก{" "}
            {orders[selectedLeaf].label} กลับไปหา Root
          </p>
          <div className="lab5-mx-auto lab5-inline-flex lab5-flex-col lab5-items-center lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-px-4 lab5-py-2">
            <span className="lab5-text-xs lab5-text-muted-foreground">ข้อมูลที่เรากำลังพิสูจน์</span>
            <span className="lab5-text-xs lab5-font-semibold lab5-text-foreground">Target: {orders[selectedLeaf].label}</span>
          </div>
        </div>
      )}

      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
        <MerkleTreeDiagram states={states} />
      </div>
    </div>
  )
}

function Step5AuthPath() {
  const { selectedLeaf, authPath, foundSiblings, findSibling } = useLab05()
  const [wrongNode, setWrongNode] = useState(null)
  const [flash, setFlash] = useState("idle")

  if (selectedLeaf === null) return null

  const complete = authPath.length > 0 && authPath.every((s) => foundSiblings.includes(s.nodeId))
  // เรียงตามลำดับที่คลิกจริง (ไม่ใช่ลำดับใน authPath) เพื่อให้คำอธิบายตรงกับสิ่งที่ผู้เรียนทำ
  const orderedFound = foundSiblings.map((id) => authPath.find((s) => s.nodeId === id)).filter(Boolean)

  const parentIndex = selectedLeaf >> 1
  const parentLabel = parentIndex === 0 ? "H(A+B)" : "H(C+D)"
  const targetLabel = orders[selectedLeaf].label

  const states = {
    [`leaf-${selectedLeaf}`]: "target",
  }
  for (const id of foundSiblings) states[id] = "path"
  // ให้เส้นทางไปหา parent สว่างขึ้นเมื่อเจอ sibling แล้ว เพื่อให้เห็นการเดินขึ้น
  if (foundSiblings.length >= 1) states[`mid-${selectedLeaf >> 1}`] = "path"
  if (complete) states.root = "path"
  if (wrongNode) states[wrongNode] = "error"

  const clickable = ["leaf-0", "leaf-1", "leaf-2", "leaf-3", "mid-0", "mid-1"].filter(
    (id) => id !== `leaf-${selectedLeaf}` && !foundSiblings.includes(id),
  )

  const handleClick = (id) => {
    const result = findSibling(id)
    if (result === "wrong") {
      setWrongNode(id)
      setFlash("wrong")
      setTimeout(() => setWrongNode(null), 700)
    } else if (result === "correct") {
      setFlash("correct")
    }
  }

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="หา Hash ข้าง ๆ"
        title={`เรามี ${targetLabel} แล้ว แต่ยังขาดอะไร?`}
        description={`ตอนนี้เรารู้ Hash ของ ${targetLabel} แล้ว ถ้าเราต้องการคำนวณต่อขึ้นไปหา Root เราต้องรู้ “Hash ของข้อมูลข้าง ๆ” ด้วย`}
      />

      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
        <MerkleTreeDiagram states={states} clickable={clickable} onNodeClick={handleClick} />
      </div>

      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
        <p className="lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-muted-foreground">
          {complete ? "เส้นทางหลักฐาน (Authentication Path)" : "หลักฐานที่ต้องหา"}
        </p>
        {orderedFound.length === 0 ? (
          <p className="lab5-mt-2 lab5-text-sm lab5-text-muted-foreground">
            ยังไม่ได้เลือก — ลองคลิก Hash ที่อยู่ข้าง ๆ {targetLabel} บนต้นไม้ด้านบน
          </p>
        ) : (
          <ol className="lab5-mt-2 lab5-space-y-2">
            {orderedFound.map((s, i) => (
              <li key={s.nodeId} className="lab5-flex lab5-items-center lab5-gap-2">
                <span className="lab5-flex lab5-size-5 lab5-items-center lab5-justify-center lab5-rounded-full lab5-bg-primary lab5-text-11 lab5-font-bold lab5-text-primary-foreground">
                  {i + 1}
                </span>
                <HashValue hash={s.hash} label={`${s.label} =`} tone="primary" />
              </li>
            ))}
          </ol>
        )}
      </div>

      <HintButton>
        เราต้องการเฉพาะ Hash ที่อยู่ข้าง ๆ เส้นทางที่เดินจาก {targetLabel} ไปหา Root ไม่ใช่ทุก Hash
        ในต้นไม้
      </HintButton>

      {flash === "wrong" && !complete && (
        <FeedbackCard variant="incorrect" title="ลองอีกครั้ง">
          ลองดูตำแหน่งของ Order ที่เรากำลังพิสูจน์อีกครั้ง เราต้องหา Hash ที่อยู่ “ข้าง ๆ เส้นทาง”
          ของมัน
        </FeedbackCard>
      )}

      {orderedFound.length === 1 && !complete && (
        <FeedbackCard variant="correct" title="ถูกต้อง">
          {orderedFound[0].label} คือ Hash ของข้อมูลที่อยู่ข้าง ๆ {targetLabel} เราเรียกสิ่งนี้ว่า{" "}
          <span className="lab5-font-semibold lab5-text-primary">Sibling Hash</span> — เมื่อได้ {parentLabel}{" "}
          แล้ว เรายังต้องใช้ Hash ของคู่ไหนเพื่อไปถึง Root?
        </FeedbackCard>
      )}

      {complete && (
        <FeedbackCard variant="correct" title="ครบเส้นทางแล้ว">
          ตอนนี้เรามี Hash ที่จำเป็นครบแล้ว Hash เหล่านี้รวมกันเป็น{" "}
          <span className="lab5-font-semibold lab5-text-primary">เส้นทางหลักฐาน (Authentication Path)</span>{" "}
          — เราจะใช้แค่นี้เพื่อคำนวณกลับไปหา Root
        </FeedbackCard>
      )}
    </div>
  )
}

function Step6RebuildRoot() {
  const { tree, selectedLeaf, authPath, computedInterim, computedRoot, computeInterim, computeRootStep } = useLab05()

  if (selectedLeaf === null || !tree || authPath.length < 2) return null

  const parentIndex = selectedLeaf >> 1
  const interimHash = tree.midHashes[parentIndex]
  const leafSibling = authPath[0]
  const midSibling = authPath[1]
  const targetId = orders[selectedLeaf].id
  const targetLabel = orders[selectedLeaf].label
  const pairLabel = parentIndex === 0 ? "A+B" : "C+D"

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="เดินกลับไปหา Root"
        title="ลองคำนวณกลับไปหา Root"
        description={`เรามี ${targetLabel} และ Hash ของข้อมูลข้าง ๆ ที่จำเป็นครบแล้ว ทีนี้ลองใช้หลักฐานนี้คำนวณกลับขึ้นไปทีละขั้น`}
      />

      <div className="lab5-grid lab5-gap-4 lab5-lg:grid-cols-3fr">
        {/* Target */}
        <div className="lab5-rounded-2xl lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-p-4">
          <p className="lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-primary">Order ที่เรากำลังพิสูจน์</p>
          <p className="lab5-text-10 lab5-font-medium lab5-text-primary-70">(Target)</p>
          <p className="lab5-mt-1 lab5-text-sm lab5-font-bold lab5-text-foreground">{targetLabel}</p>
          <div className="lab5-mt-2">
            <HashValue hash={tree.leafHashes[selectedLeaf]} label={`H(${targetId}) =`} tone="primary" />
          </div>
        </div>

        {/* Compute steps */}
        <div className="lab5-space-y-3 lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
          <div className="lab5-space-y-2">
            <p className="lab5-text-sm lab5-font-semibold lab5-text-foreground">
              ขั้นแรก: ใช้ Hash ของ {targetLabel} และ Hash ของข้อมูลที่อยู่ข้าง ๆ ({leafSibling.label})
              เพื่อสร้าง Hash ของคู่ {pairLabel}
            </p>
            <p className="lab5-font-mono lab5-text-xs lab5-text-muted-foreground">
              {leafSibling.position === "left" ? `${leafSibling.label} + H(${targetId})` : `H(${targetId}) + ${leafSibling.label}`}
            </p>
            {!computedInterim ? (
              <button
                type="button"
                onClick={computeInterim}
                className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-bg-primary lab5-px-4 lab5-py-2 lab5-text-sm lab5-font-semibold lab5-text-primary-foreground lab5-transition-all lab5-hover-brightness"
              >
                <Calculator className="lab5-size-4" />
                คำนวณขั้นแรก
              </button>
            ) : (
              <div className="lab5-animate-merge-up lab5-space-y-1">
                <ArrowDown className="lab5-mb-1 lab5-size-4 lab5-text-success" />
                <HashValue hash={interimHash} label={`${parentIndex === 0 ? "H(A+B)" : "H(C+D)"} =`} tone="success" />
                <p className="lab5-text-xs lab5-text-muted-foreground">ได้ Hash ของคู่ {pairLabel} แล้ว</p>
              </div>
            )}
          </div>

          {computedInterim && (
            <div className="lab5-animate-merge-up lab5-space-y-2 lab5-border-t lab5-border-border lab5-pt-3">
              <p className="lab5-text-sm lab5-font-semibold lab5-text-foreground">
                ขั้นต่อไป: เอา Hash ของคู่ {pairLabel} มารวมกับ {midSibling.label} เพื่อสร้าง Root
              </p>
              <p className="lab5-font-mono lab5-text-xs lab5-text-muted-foreground">
                {midSibling.position === "left"
                  ? `${midSibling.label} + ${parentIndex === 0 ? "H(A+B)" : "H(C+D)"}`
                  : `${parentIndex === 0 ? "H(A+B)" : "H(C+D)"} + ${midSibling.label}`}
              </p>
              {!computedRoot ? (
                <button
                  type="button"
                  onClick={computeRootStep}
                  className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-bg-primary lab5-px-4 lab5-py-2 lab5-text-sm lab5-font-semibold lab5-text-primary-foreground lab5-transition-all lab5-hover-brightness"
                >
                  <Calculator className="lab5-size-4" />
                  คำนวณ Root
                </button>
              ) : (
                <div className="lab5-animate-merge-up lab5-space-y-1">
                  <ArrowDown className="lab5-mb-1 lab5-size-4 lab5-text-success" />
                  <HashValue hash={tree.root} label="Root ที่เราคำนวณได้ =" tone="success" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Committed root */}
        <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
          <p className="lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-muted-foreground">Root ที่บันทึกไว้</p>
          <p className="lab5-text-10 lab5-font-medium lab5-text-muted-foreground-70">(Committed Root)</p>
          <div className="lab5-mt-2">
            <HashValue hash={tree.root} tone={computedRoot ? "success" : "neutral"} />
          </div>
        </div>
      </div>

      {computedRoot && (
        <FeedbackCard variant="success" title="✓ Root ทั้งสองค่าเหมือนกัน">
          <p>
            แปลว่าเราสามารถใช้หลักฐานที่มีคำนวณกลับไปยัง Root เดิมได้ จึงยืนยันได้ว่า{" "}
            <span className="lab5-font-semibold">{targetLabel} อยู่ในต้นไม้นี้จริง</span>
          </p>
          <p className="lab5-mt-2 lab5-text-xs lab5-text-foreground-70">
            การพิสูจน์แบบนี้เรียกว่า <span className="lab5-font-semibold">Inclusion Proof</span> หรือ
            “หลักฐานว่า Order นี้อยู่ในต้นไม้”
          </p>
        </FeedbackCard>
      )}
    </div>
  )
}

function Step7Tamper() {
  const { tree, selectedLeaf, authPath, tamperMode, toggleTamper } = useLab05()
  const [tamperedRoot, setTamperedRoot] = useState(null)

  const midSibling = authPath[1]

  useEffect(() => {
    let active = true
    if (!tree || selectedLeaf === null || authPath.length < 2) return
    const tamperedSiblings = [authPath[0], { ...midSibling, hash: tamperHash(midSibling.hash) }]
    computeRootFromProof(tree.leafHashes[selectedLeaf], tamperedSiblings).then((res) => {
      if (active) setTamperedRoot(res.root)
    })
    return () => {
      active = false
    }
  }, [tree, selectedLeaf, authPath, midSibling])

  if (selectedLeaf === null || !tree) return null

  const shownRoot = tamperMode && tamperedRoot ? tamperedRoot : tree.root
  const matches = !tamperMode
  const targetLabel = orders[selectedLeaf].label

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="ทดสอบการปลอมแปลง"
        title="ถ้า Order ถูกเปลี่ยน เราจะจับได้ไหม?"
        description={`ลองสมมติว่ามีคนแอบเปลี่ยนข้อมูลของ Order ในฝั่ง ${midSibling?.label} เล็กน้อย แล้วดูว่าเราจับได้ไหม`}
      />

      <div className="lab5-flex lab5-items-center lab5-justify-between lab5-gap-4 lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
        <div>
          <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">ดัดแปลงข้อมูลฝั่ง {midSibling?.label}</p>
          <p className="lab5-text-xs lab5-text-muted-foreground">ลองสวิตช์เพื่อจำลองว่ามีคนแก้ไขข้อมูลเพียงเล็กน้อยฝั่งนี้</p>
        </div>
        <button type="button" role="switch" aria-checked={tamperMode} onClick={toggleTamper} className={cx("lab5-switch", tamperMode && "lab5-switch--on")}>
          <span className="lab5-switch-knob" />
        </button>
      </div>

      {tamperMode && (
        <div className="lab5-animate-merge-up lab5-rounded-2xl lab5-border lab5-border-danger-30 lab5-bg-danger-soft-40 lab5-p-4">
          <p className="lab5-text-center lab5-text-xs lab5-font-semibold lab5-uppercase lab5-tracking-wide lab5-text-danger">สิ่งที่เกิดขึ้น</p>
          <div className="lab5-mt-2 lab5-flex lab5-flex-col lab5-items-center lab5-gap-1 lab5-text-sm lab5-text-foreground">
            <span>ข้อมูลของ Order เปลี่ยน</span>
            <span className="lab5-text-muted-foreground">↓</span>
            <span>Hash ของ Order นั้นเปลี่ยน</span>
            <span className="lab5-text-muted-foreground">↓</span>
            <span>Hash ของคู่นั้นเปลี่ยน</span>
            <span className="lab5-text-muted-foreground">↓</span>
            <span className="lab5-font-semibold lab5-text-danger">Root ที่คำนวณใหม่เปลี่ยน</span>
          </div>
        </div>
      )}

      <div className="lab5-grid lab5-gap-3 lab5-sm:grid-cols-2">
        <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
          <p className="lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-muted-foreground">Root ที่คำนวณใหม่</p>
          <p className="lab5-text-10 lab5-font-medium lab5-text-muted-foreground-70">(Computed Root)</p>
          <div className="lab5-mt-2">
            <HashValue hash={shownRoot} tone={matches ? "success" : "danger"} />
          </div>
        </div>
        <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
          <p className="lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-muted-foreground">Root ที่บันทึกไว้ตั้งแต่ต้น</p>
          <p className="lab5-text-10 lab5-font-medium lab5-text-muted-foreground-70">(Committed Root)</p>
          <div className="lab5-mt-2">
            <HashValue hash={tree.root} tone="neutral" />
          </div>
        </div>
      </div>

      {matches ? (
        <FeedbackCard variant="success" title="✓ ตรงกัน">
          ตอนนี้ Hash ทุกตัวถูกต้อง Root ที่คำนวณใหม่จึงเท่ากับ Root ที่บันทึกไว้ตั้งแต่ต้น —{" "}
          {targetLabel} ได้รับการพิสูจน์แล้ว
        </FeedbackCard>
      ) : (
        <FeedbackCard variant="incorrect" title="✗ Root ไม่ตรงกัน">
          <span className="lab5-inline-flex lab5-items-center lab5-gap-1.5">
            <AlertTriangle className="lab5-size-4 lab5-shrink-0" />
            หลักฐานจึงตรวจสอบไม่ผ่าน
          </span>{" "}
          — แค่เปลี่ยนข้อมูลต้นทางเพียงเล็กน้อย Hash ที่เกี่ยวข้องจะเปลี่ยนตาม ทำให้ Root เปลี่ยนด้วย
          การดัดแปลงข้อมูลจึงถูกตรวจจับได้ทันที นี่คือหัวใจความปลอดภัยของ Merkle Tree
        </FeedbackCard>
      )}
    </div>
  )
}

function Step8Efficiency() {
  const { selectedLeaf, authPath, reset, goToStep } = useLab05()

  const targetLabel = selectedLeaf !== null ? orders[selectedLeaf].label : "Order A"
  const proofItems = selectedLeaf !== null ? [targetLabel, ...authPath.map((s) => `Hash ของ ${s.label}`)] : [targetLabel]

  return (
    <div className="lab5-space-y-6">
      <LessonHeading sectionLabel="สรุปประโยชน์" title="แล้วมันช่วยอะไรเรา?" />

      <div className="lab5-grid lab5-gap-4 lab5-sm:grid-cols-2">
        <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
          <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">ต้องเปิดเผยทุกอย่าง</p>
          <ul className="lab5-mt-2 lab5-space-y-1.5">
            {orders.map((o) => (
              <li key={o.id} className="lab5-rounded-lg lab5-bg-surface lab5-px-3 lab5-py-1.5 lab5-text-sm lab5-text-foreground">
                {o.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="lab5-rounded-2xl lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-p-4">
          <p className="lab5-text-sm lab5-font-bold lab5-text-primary">พิสูจน์ {targetLabel} ด้วย Merkle Tree</p>
          <ul className="lab5-mt-2 lab5-space-y-1.5">
            {proofItems.map((item) => (
              <li key={item} className="lab5-rounded-lg lab5-bg-surface lab5-px-3 lab5-py-1.5 lab5-text-sm lab5-text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="lab5-text-center lab5-text-pretty lab5-text-sm lab5-leading-relaxed lab5-text-foreground-80">
        เราไม่จำเป็นต้องเปิดเผยข้อมูลของ Order อื่นทั้งหมด เราใช้แค่ข้อมูลที่อยู่บนเส้นทางกลับไปหา Root
        เท่านั้น
      </p>

      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4 lab5-text-center">
        <p className="lab5-text-pretty lab5-text-sm lab5-leading-relaxed lab5-text-foreground-80">
          ยิ่งต้นไม้ใหญ่ เส้นทางที่ต้องใช้ก็เพิ่มทีละชั้นเท่านั้น ไม่ต้องส่งข้อมูลทุก Order ทั้งหมด —
          ต้นไม้ใหญ่ขึ้น แต่หลักฐานหนึ่งรายการไม่จำเป็นต้องโตเท่ากับข้อมูลทั้งหมด
        </p>
        <p className="lab5-mt-1 lab5-text-xs lab5-text-muted-foreground">
          ทางเทคนิคเรียกขนาดของหลักฐานนี้ว่า <span className="lab5-font-mono">O(log n)</span>
        </p>
      </div>

      <div className="lab5-flex lab5-flex-col lab5-items-center lab5-gap-4 lab5-rounded-2xl lab5-border lab5-border-success-30 lab5-bg-success-soft lab5-p-6 lab5-text-center">
        <PartyPopper className="lab5-size-8 lab5-text-success" />
        <div>
          <p className="lab5-text-lg lab5-font-extrabold lab5-text-foreground">เรียนจบ Lab 05 แล้ว</p>
          <p className="lab5-mt-1 lab5-text-pretty lab5-text-sm lab5-leading-relaxed lab5-text-foreground-70">
            คุณสร้างต้นไม้ พิสูจน์การมีอยู่ของข้อมูล และตรวจจับการปลอมแปลงได้ด้วยตัวเองแล้ว
          </p>
        </div>
        <div className="lab5-flex lab5-flex-wrap lab5-justify-center lab5-gap-3">
          <button
            type="button"
            onClick={() => goToStep(4)}
            className="lab5-inline-flex lab5-items-center lab5-gap-2 lab5-rounded-full lab5-border lab5-border-primary-30 lab5-bg-surface lab5-px-4 lab5-py-2 lab5-text-sm lab5-font-semibold lab5-text-primary lab5-transition-colors lab5-hover-primary-soft"
          >
            ลองพิสูจน์ Order อื่น
          </button>
          <button
            type="button"
            onClick={reset}
            className="lab5-inline-flex lab5-items-center lab5-gap-2 lab5-rounded-full lab5-border lab5-border-border lab5-bg-surface lab5-px-4 lab5-py-2 lab5-text-sm lab5-font-semibold lab5-text-muted-foreground lab5-transition-colors lab5-hover-surface-soft"
          >
            <RotateCcw className="lab5-size-4" />
            เริ่มใหม่ทั้งหมด
          </button>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   lab-container — ประกอบทุกอย่างเข้าด้วยกัน
   ========================================================================== */

function StepContent({ step }) {
  switch (step) {
    case 0:
      return <StepIntro />
    case 1:
      return <Step1WhyMerkle />
    case 2:
      return <Step2HashOrders />
    case 3:
      return <Step3BuildTree />
    case 4:
      return <Step4SelectTarget />
    case 5:
      return <Step5AuthPath />
    case 6:
      return <Step6RebuildRoot />
    case 7:
      return <Step7Tamper />
    case 8:
      return <Step8Efficiency />
    default:
      return null
  }
}

function LabContainer() {
  const { currentStep } = useLab05()
  const isIntro = currentStep === 0

  return (
    <div className="lab5-flex lab5-min-h-dvh lab5-flex-col">
      {!isIntro && (
        <header className="lab5-sticky lab5-top-0 lab5-z-10 lab5-border-b lab5-border-border lab5-bg-surface-85 lab5-px-4 lab5-py-3 lab5-backdrop-blur-sm">
          <div className="lab5-mx-auto lab5-max-w-3xl lab5-space-y-2">
            <LabProgress />
            <Glossary />
          </div>
        </header>
      )}

      <main className="lab5-flex-1 lab5-px-4 lab5-py-6 lab5-sm:py-10">
        <div className="lab5-mx-auto lab5-flex lab5-max-w-3xl lab5-flex-col lab5-gap-6">
          {!isIntro && <MentorMessage message={STEP_META[currentStep].mentor} />}
          {/* รีเมานต์เนื้อหาขั้นใหม่ทุกครั้งที่เปลี่ยน เพื่อให้แอนิเมชันเข้าเล่นซ้ำ */}
          <div key={currentStep} className="lab5-animate-merge-up">
            <StepContent step={currentStep} />
          </div>
        </div>
      </main>

      <LabNavigation />
    </div>
  )
}

/* ==========================================================================
   Lab5 — คอมโพเนนต์หลักที่ export ออกไปใช้งาน
   ========================================================================== */

export default function Lab5() {
  return (
    <div className="lab5">
      <Lab05Provider>
        <LabContainer />
      </Lab05Provider>
    </div>
  )
}
