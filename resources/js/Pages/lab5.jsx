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
  useRef,
  useState,
} from "react"
import {
  AlertTriangle,
  Wallet,
  FileText,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Contrast,
  Cpu,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Eye,
  EyeOff,
  FastForward,
  Fingerprint,
  Globe,
  GraduationCap,
  HelpCircle,
  Info,
  Key,
  Layers,
  Lightbulb,
  Link2,
  Lock,
  PartyPopper,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react"
import "../../css/lab5.css"

/**
 * รวมชื่อคลาสแบบมีเงื่อนไข (เทียบเท่า clsx/cn แบบง่าย)
 *
 * @param {...(string|boolean|null|undefined)} classNames ชื่อคลาสหรือค่าเงื่อนไข
 * @return {string} ชื่อคลาสที่ผ่านเงื่อนไขแล้ว คั่นด้วยช่องว่าง
 * @author StealthTrade Team
 */
function JoinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ")
}

/* ==========================================================================
   lib/merkle — ตรรกะ Merkle tree (SHA-256 จริงผ่าน Web Crypto API)
   ========================================================================== */

export const orders = [
  { id: "A", label: "ออร์เดอร์ A", value: "secret-A-7f3k", tamperedValue: "secret-A-7f4r" },
  { id: "B", label: "ออร์เดอร์ B", value: "secret-B-q92m", tamperedValue: "secret-B-q93n" },
  { id: "C", label: "ออร์เดอร์ C", value: "secret-C-x41d", tamperedValue: "secret-C-x42e" },
  { id: "D", label: "ออร์เดอร์ D", value: "secret-D-p80z", tamperedValue: "secret-D-p81a" },
]

/**
 * SHA-256 จริงผ่าน Web Crypto API
 *
 * @param {string} message ข้อความที่ต้องการแฮช
 * @return {Promise<string>} ค่า hash เป็น hex ตัวพิมพ์เล็ก
 * @author StealthTrade Team
 */
async function Sha256Hex(message) {
  // Use Web Crypto API if available (secure context / localhost)
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const data = new TextEncoder().encode(message)
    const digest = await window.crypto.subtle.digest("SHA-256", data)
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
  }

  // Fallback for non-secure contexts (e.g. HTTP over IP)
  let hash = 0
  for (let i = 0; i < message.length; i++) {
    hash = (hash << 5) - hash + message.charCodeAt(i)
    hash |= 0
  }
  // Create a pseudo-SHA256 hex string (64 characters)
  const hex = Math.abs(hash).toString(16).padStart(8, "0")
  return hex.repeat(8)
}

const midLabels = ["H(A+B)", "H(C+D)"]

/**
 * สร้าง Merkle tree แบบ 4 ใบด้วย SHA-256 จริง
 *
 * @param {string[]} values ข้อมูลของแต่ละใบ (ต้องมี 4 รายการ)
 * @return {Promise<{values: string[], leafHashes: string[], midHashes: string[], root: string, layers: string[][]}>} ต้นไม้ที่สร้างเสร็จแล้ว
 * @author StealthTrade Team
 */
async function BuildMerkleTree(values) {
  const leafHashes = await Promise.all(values.map((value) => Sha256Hex(value)))
  const midHashes = [
    await Sha256Hex(leafHashes[0] + leafHashes[1]),
    await Sha256Hex(leafHashes[2] + leafHashes[3]),
  ]
  const root = await Sha256Hex(midHashes[0] + midHashes[1])
  return {
    values,
    leafHashes,
    midHashes,
    root,
    layers: [leafHashes, midHashes, [root]],
  }
}

/**
 * Hash ของข้าง ๆ ที่ต้องใช้เพื่อเดินจากใบไปหา root
 *
 * @param {Object} tree ต้นไม้ที่ได้จาก BuildMerkleTree
 * @param {number} leafIndex ตำแหน่งของใบที่ต้องการพิสูจน์ (0-3)
 * @return {Array<{nodeId: string, label: string, hash: string, position: string}>} เส้นทางหลักฐานเรียงจากชั้นล่างขึ้นบน
 * @author StealthTrade Team
 */
function GetAuthenticationPath(tree, leafIndex) {
  const leafSiblingIndex = leafIndex ^ 1
  const parentIndex = leafIndex >> 1
  const midSiblingIndex = parentIndex ^ 1
  const leafIds = ["A", "B", "C", "D"]

  return [
    {
      nodeId: `leaf-${leafSiblingIndex}`,
      label: `H(${leafIds[leafSiblingIndex]})`,
      hash: tree.leafHashes[leafSiblingIndex],
      position: leafIndex % 2 === 0 ? "right" : "left",
    },
    {
      nodeId: `mid-${midSiblingIndex}`,
      label: midLabels[midSiblingIndex],
      hash: tree.midHashes[midSiblingIndex],
      position: parentIndex % 2 === 0 ? "right" : "left",
    },
  ]
}

/**
 * รวม hash สองค่าเป็น hash ใหม่ตามตำแหน่งของ sibling
 *
 * @param {string} currentHash hash ที่เราถืออยู่
 * @param {string} siblingHash hash ของ sibling
 * @param {string} position ตำแหน่งของ sibling ("left" หรือ "right")
 * @return {Promise<string>} hash ของค่าที่รวมกันแล้ว
 * @author StealthTrade Team
 */
async function CombineHashes(currentHash, siblingHash, position) {
  // `position` บอกว่า sibling อยู่ฝั่งไหน ค่าที่เราถืออยู่จึงไปอยู่อีกฝั่ง
  return position === "left"
    ? Sha256Hex(siblingHash + currentHash)
    : Sha256Hex(currentHash + siblingHash)
}

/**
 * คำนวณ root ใหม่จาก hash ของใบ + sibling hash ที่เรียงลำดับแล้ว
 *
 * @param {string} leafHash hash ของใบที่ต้องการพิสูจน์
 * @param {Array<{hash: string, position: string}>} siblings sibling hash เรียงจากชั้นล่างขึ้นบน
 * @return {Promise<{steps: string[], root: string}>} hash ของแต่ละชั้น และ root ที่คำนวณได้
 * @author StealthTrade Team
 */
async function ComputeRootFromProof(leafHash, siblings) {
  const steps = []
  let current = leafHash
  for (const sibling of siblings) {
    current = await CombineHashes(current, sibling.hash, sibling.position)
    steps.push(current)
  }
  return { steps, root: current }
}

/**
 * ตรวจว่า root ที่คำนวณได้ตรงกับ root ที่คาดหวังหรือไม่
 *
 * @param {string} computedRoot root ที่คำนวณได้
 * @param {string} expectedRoot root ที่บันทึกไว้
 * @return {boolean} true ถ้าตรงกัน
 * @author StealthTrade Team
 */
function IsInclusionValid(computedRoot, expectedRoot) {
  return computedRoot === expectedRoot
}

/**
 * จำลองการแก้ไขข้อมูลของใบที่เลือก (เปลี่ยนตัวอักษรท้ายเล็กน้อย เช่น 7f3k → 7f4r) แล้วคำนวณ Leaf Hash และ Root ใหม่ด้วยเส้นทางหลักฐานเดิม
 *
 * @param {string} tamperedValue ข้อมูลของใบหลังถูกแก้ไข
 * @param {Array<{hash: string, position: string}>} siblings sibling hash เรียงจากชั้นล่างขึ้นบน
 * @return {Promise<{value: string, leafHash: string, steps: string[], root: string}>} ผลการคำนวณจากข้อมูลที่ถูกแก้ไข
 * @author StealthTrade Team
 */
async function ComputeTamperedProof(tamperedValue, siblings) {
  const leafHash = await Sha256Hex(tamperedValue)
  const { steps, root } = await ComputeRootFromProof(leafHash, siblings)
  return { value: tamperedValue, leafHash, steps, root }
}

/**
 * ตัด hash ให้สั้นลงเพื่อแสดงผล
 *
 * @param {string} hash ค่า hash เต็ม
 * @param {number} [head=8] จำนวนตัวอักษรที่เก็บไว้ด้านหน้า
 * @return {string} hash ที่ตัดแล้วต่อท้ายด้วย "..." (สตริงว่างถ้าไม่มี hash)
 * @author StealthTrade Team
 */
function TruncateHash(hash, head = 8) {
  if (!hash) return ""
  return `${hash.slice(0, head)}...`
}

/* ==========================================================================
   context — สถานะรวมของบทเรียนทั้งหมด
   ========================================================================== */

export const TOTAL_STEPS = 9

/** ข้อมูลของแต่ละขั้น (จุดสำหรับ progress + ข้อความของผู้สอน) ขั้นที่ 0 คือบทนำ */
export const STEP_META = [
  {
    index: 0,
    topic: "บทนำ",
    mentor:
      "เราได้ส่งคำสั่งซื้อของเราไปแล้ว! แต่เอ๊ะ? เราจะแน่ใจได้ยังไงว่าคำสั่งซื้อของเราหมุนเวียนอยู่ในระบบหรือเปล่า?",
  },
  {
    index: 1,
    topic: "โจทย์ความเป็นส่วนตัว",
    mission: "เลือกออร์เดอร์ของคุณ แล้วเลือกวิธีพิสูจน์ที่ปลอดภัยที่สุด",
    mentor:
      "สวัสดีครับ! สมมติว่าคุณเพิ่งส่งคำสั่งซื้อในเว็บเทรด\nตอนนี้คุณอยากให้คนอื่นเชื่อว่า \"ออร์เดอร์ของฉันอยู่ในระบบจริง\" แต่ไม่อยากให้ใครเห็นข้อมูลออร์เดอร์ของคุณ\nเราจะแก้ปัญหานี้ไปด้วยกันทีละขั้นครับ ไม่ต้องมีพื้นฐานมาก่อนเลย",
  },
  {
    index: 2,
    topic: "สร้าง Hash และต้นไม้",
    mission: "เปลี่ยนรหัสลับเป็น Hash แล้วจับคู่ขึ้นไปจนได้ Root",
    mentor:
      "ก่อนสร้างต้นไม้ เราต้องรู้จัก \"Hash\" ก่อนครับ\nให้คิดว่า Hash คือลายนิ้วมือของข้อมูล — ข้อมูลเดียวกันได้ลายนิ้วมือเดิมเสมอ แต่ถ้าเห็นแค่ลายนิ้วมือ\nจะย้อนกลับไปรู้ข้อมูลต้นฉบับไม่ได้",
  },
  {
    index: 3,
    topic: "สร้างและตรวจ Proof",
    mentor:
      "คราวนี้คุณคือ Prover ครับ — เว็บเทรดประกาศ Root ไว้แล้ว และคุณต้องคุยกับ Verifier ให้เขาเชื่อว่าออร์เดอร์ B อยู่ในต้นไม้\nไม่ต้องส่งทุกใบ ส่งแค่ของที่ Verifier ต้องใช้คำนวณขึ้นไปหา Root ก็พอ ลองเลือกข้อความที่จะส่งทีละสเต็ปดูครับ",
  },
  {
    index: 4,
    topic: "ทดสอบการแก้ไขข้อมูล",
    mission: "ลองแอบแก้ข้อมูล แล้วดูว่าระบบจับได้หรือไม่",
    mentor:
      "ถ้ามีคนแอบแก้ข้อมูลออร์เดอร์ — แม้แต่ตัวอักษรเดียว — จะเกิดอะไรขึ้น?\nลองเปิดสวิตช์ด้านล่างดูครับ แล้วสังเกตสีของต้นไม้",
  },
  {
    index: 5,
    topic: "Merkle Proof ยังเผยอะไร",
    mission: "อ่านทุกข้อความที่ข้ามเส้นไปฝั่ง Verifier แล้วตอบคำถาม",
    mentor:
      "Merkle proof เก่งมากครับ แต่ลองเปลี่ยนมุมมอง — นี่คือบทสนทนาจากขั้นที่ 3 ทั้งหมด\nถ้าคุณเป็น Verifier ที่ได้รับข้อความเหล่านี้ คุณจะรู้อะไรเกี่ยวกับเจ้าของออร์เดอร์บ้าง?",
  },
  {
    index: 6,
    topic: "ไปป์ไลน์ zk-SNARK",
    mission: "เดินผ่าน 5 ชิ้นส่วนของ zk-SNARK ทีละขั้น จนผู้ตรวจยอมรับ",
    mentor:
      "zk-SNARK เหมือน \"เครื่องตรวจปิดผนึก\" ที่อยู่ในเครื่องของคุณครับ\nงานเกือบทั้งหมดเกิดขึ้นฝั่งซ้ายของเส้น (ในเครื่องคุณ) แล้วส่งของข้ามเส้นไปหา Verifier แค่ครั้งเดียว\nลองทำทีละชิ้นทั้ง 5 ชิ้น แล้วดูว่าข้อความไหนข้ามเส้นบ้าง",
  },
  {
    index: 7,
    topic: "พิสูจน์ว่ามีเงินพอ",
    mentor:
      "ไปป์ไลน์เดียวกันนี้ใช้พิสูจน์ได้ \"ทุกเงื่อนไข\" ครับ ไม่ใช่แค่ Merkle Tree\nลองเรื่องที่ใกล้ตัวที่สุดในเว็บเทรด: \"ฉันมีเงินพอซื้อ\" โดยไม่ต้องบอกว่ามีเงินเท่าไหร่ —\nสังเกตว่ายอดเงินไม่เคยข้ามเส้นไปเลย",
  },
  {
    index: 8,
    topic: "ทำไม zk-SNARK ถึงเหมาะกับเว็บเทรด?",
    mission: "เทียบ Lab 03 กับ zk-SNARK แล้วตอบคำถาม",
    mentor:
      "จำ Lab 03 ได้ไหมครับ? ตอนนั้นเราพิสูจน์ด้วยการถาม-ตอบหลายรอบ (Commit → Challenge → Response) ลองเล่นเป็น Prover ทั้งสองแบบ แล้วนับดูว่าต้องส่งข้อความข้ามเส้นกี่ครั้ง",
  },
  {
    index: 9,
    topic: "Merkle Tree + zk-SNARK ช่วยอะไรเรา?",
    mission: "ทบทวนสิ่งที่เรียน และดูว่าจะไปเป็นฟีเจอร์จริงไหนในเว็บเทรด",
    mentor:
      "เก่งมากครับ! มาทบทวนกันว่าเราเรียนอะไรไปบ้าง และทั้งหมดนี้จะกลายเป็นฟีเจอร์จริงตรงไหนใน Stealth Trade",
  },
]

const initialState = {
  currentStep: 0,
  completedSteps: [],
  // step 1
  step1Answer: null,
  isStep1Correct: false,
  // step 2
  hashedLeaves: [false, false, false, false],
  // step 3
  builtPairs: [false, false],
  isRootBuilt: false,
  // step 4
  selectedLeaf: 1,
  // step 5
  foundSiblings: [],
  // step 6
  isInterimComputed: false,
  isRootComputed: false,
  // step 6
  isTamperMode: false,
  // step 7 (เวิร์กโฟลว์ ZKP ขั้นย่อย 1..4)
  zkpWorkflowStage: 1,
  isZkpWorkflowDone: false,
}

const Lab05Context = createContext(null)

/**
 * Provider เก็บสถานะรวมของบทเรียน และสร้าง Merkle tree ตอนเริ่มต้น
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {React.ReactNode} props.children คอมโพเนนต์ลูกที่จะได้ใช้สถานะของบทเรียน
 * @return {JSX.Element} Provider ที่ครอบคอมโพเนนต์ลูก
 * @author StealthTrade Team
 */
export function Lab05Provider({ children }) {
  const [lessonState, setLessonState] = useState(initialState)
  const [tree, setTree] = useState(null)
  const [tamperedProof, setTamperedProof] = useState(null)

  useEffect(() => {
    let isActive = true
    BuildMerkleTree(orders.map((order) => order.value)).then((builtTree) => {
      if (isActive) setTree(builtTree)
    })
    return () => {
      isActive = false
    }
  }, [])

  const authPathSteps = useMemo(() => {
    if (!tree || lessonState.selectedLeaf === null) return []
    return GetAuthenticationPath(tree, lessonState.selectedLeaf)
  }, [tree, lessonState.selectedLeaf])

  useEffect(() => {
    if (!tree || authPathSteps.length === 0) return
    let isActive = true
    ComputeTamperedProof(orders[lessonState.selectedLeaf ?? 0].tamperedValue, authPathSteps).then((proof) => {
      if (isActive) setTamperedProof(proof)
    })
    return () => {
      isActive = false
    }
  }, [tree, authPathSteps, lessonState.selectedLeaf])

  /**
   * ตรวจว่าขั้นที่ระบุทำเสร็จแล้วหรือยัง
   *
   * @param {number} step หมายเลขขั้น (0-9)
   * @return {boolean} true ถ้าขั้นนั้นทำเสร็จแล้ว
   * @author StealthTrade Team
   */
  const isStepComplete = useCallback(
    (step) => {
      switch (step) {
        case 0:
          return true
        case 1:
          return lessonState.isStep1Correct
        case 2:
          return lessonState.hashedLeaves.every(Boolean)
        case 3:
          return lessonState.foundSiblings.length >= 2
        case 4:
          return true
        case 5:
          return true
        case 6:
          return true
        case 7:
          return lessonState.completedSteps.includes(7) || lessonState.isZkpWorkflowDone
        case 8:
          return true
        case 9:
          return true
        default:
          return false
      }
    },
    [lessonState, authPathSteps],
  )

  const canProceed = isStepComplete(lessonState.currentStep)

  /**
   * บันทึกว่าขั้นที่ระบุทำเสร็จแล้ว
   *
   * @param {number} step หมายเลขขั้น
   * @return {void}
   * @author StealthTrade Team
   */
  const markComplete = useCallback((step) => {
    setLessonState((previousState) =>
      previousState.completedSteps.includes(step)
        ? previousState
        : { ...previousState, completedSteps: [...previousState.completedSteps, step] },
    )
  }, [])

  /**
   * ไปขั้นถัดไป และบันทึกขั้นปัจจุบันว่าทำเสร็จแล้ว
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const goNext = useCallback(() => {
    setLessonState((previousState) => {
      if (previousState.currentStep >= TOTAL_STEPS) return previousState
      const nextCompletedSteps = previousState.completedSteps.includes(previousState.currentStep)
        ? previousState.completedSteps
        : [...previousState.completedSteps, previousState.currentStep]
      return {
        ...previousState,
        currentStep: previousState.currentStep + 1,
        completedSteps: nextCompletedSteps,
      }
    })
  }, [])

  /**
   * ย้อนกลับไปขั้นก่อนหน้า
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const goPrev = useCallback(() => {
    setLessonState((previousState) =>
      previousState.currentStep <= 0
        ? previousState
        : { ...previousState, currentStep: previousState.currentStep - 1 },
    )
  }, [])

  /**
   * ไปยังขั้นที่ระบุ (ได้เฉพาะบทนำ ขั้นที่ทำเสร็จแล้ว หรือขั้นปัจจุบัน)
   *
   * @param {number} step หมายเลขขั้นปลายทาง
   * @return {void}
   * @author StealthTrade Team
   */
  const goToStep = useCallback((step) => {
    setLessonState((previousState) => {
      // ไปยังบทนำ, ขั้นที่ทำเสร็จแล้ว, หรือขั้นปัจจุบันได้เท่านั้น
      if (step === previousState.currentStep) return previousState
      if (
        step !== 0 &&
        step !== previousState.currentStep &&
        !previousState.completedSteps.includes(step)
      )
        return previousState
      return { ...previousState, currentStep: step }
    })
  }, [])

  /**
   * รีเซ็ตบทเรียนกลับสู่สถานะเริ่มต้น
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const reset = useCallback(() => setLessonState(initialState), [])

  /**
   * บันทึกคำตอบของขั้นที่ 1 (ตัวเลือกที่ 1 คือคำตอบที่ถูก)
   *
   * @param {number} choice ลำดับตัวเลือกที่ผู้เรียนเลือก
   * @return {void}
   * @author StealthTrade Team
   */
  const answerStep1 = useCallback(
    (choice) => {
      const isCorrect = choice === 2
      setLessonState((previousState) => ({
        ...previousState,
        step1Answer: choice,
        isStep1Correct: isCorrect,
      }))
      if (isCorrect) markComplete(1)
    },
    [markComplete],
  )

  /**
   * เปิดเผย hash ของใบที่ระบุ
   *
   * @param {number} index ตำแหน่งของใบ (0-3)
   * @return {void}
   * @author StealthTrade Team
   */
  const revealHash = useCallback((index) => {
    setLessonState((previousState) => {
      const nextHashedLeaves = [...previousState.hashedLeaves]
      nextHashedLeaves[index] = true
      return { ...previousState, hashedLeaves: nextHashedLeaves }
    })
  }, [])

  /**
   * จับคู่ hash ของคู่ที่ระบุ
   *
   * @param {number} pair ลำดับคู่ (0 = A+B, 1 = C+D)
   * @return {void}
   * @author StealthTrade Team
   */
  const buildPair = useCallback((pair) => {
    setLessonState((previousState) => {
      const nextBuiltPairs = [...previousState.builtPairs]
      nextBuiltPairs[pair] = true
      return { ...previousState, builtPairs: nextBuiltPairs }
    })
  }, [])

  /**
   * รวมสองคู่เป็น root
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const buildRoot = useCallback(
    () => setLessonState((previousState) => ({ ...previousState, isRootBuilt: true })),
    [],
  )

  /**
   * เลือกใบที่ต้องการพิสูจน์ และล้างสถานะของขั้นถัดไปทั้งหมด
   *
   * @param {number} index ตำแหน่งของใบ (0-3)
   * @return {void}
   * @author StealthTrade Team
   */
  const selectLeaf = useCallback((index) => {
    setLessonState((previousState) => {
      // เปลี่ยนเป้าหมายแล้วต้องล้างสถานะขั้นถัดไปทั้งหมด
      if (previousState.selectedLeaf === index) return previousState
      return {
        ...previousState,
        selectedLeaf: index,
        foundSiblings: [],
        isInterimComputed: false,
        isRootComputed: false,
        isTamperMode: false,
      }
    })
  }, [])

  /**
   * ตรวจว่าโหนดที่คลิกเป็น sibling ที่อยู่บนเส้นทางหลักฐานหรือไม่ และบันทึกถ้าใช่
   *
   * @param {string} nodeId รหัสโหนดที่ผู้เรียนคลิก
   * @return {string} "wrong" ถ้าไม่ใช่ sibling บนเส้นทาง, "already" ถ้าเลือกไปแล้ว, "correct" ถ้าถูกต้อง
   * @author StealthTrade Team
   */
  const findSibling = useCallback(
    (nodeId) => {
      const isOnPath = authPathSteps.some((pathStep) => pathStep.nodeId === nodeId)
      if (!isOnPath) return "wrong"
      if (lessonState.foundSiblings.includes(nodeId)) return "already"
      setLessonState((previousState) => ({
        ...previousState,
        foundSiblings: [...previousState.foundSiblings, nodeId],
      }))
      return "correct"
    },
    [authPathSteps, lessonState.foundSiblings],
  )

  /**
   * คำนวณ hash ของคู่ (ขั้นแรกของการเดินกลับไปหา root)
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const computeInterim = useCallback(
    () => setLessonState((previousState) => ({ ...previousState, isInterimComputed: true })),
    [],
  )

  /**
   * คำนวณ root และบันทึกว่าขั้นที่ 6 ทำเสร็จแล้ว
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const computeRootStep = useCallback(() => {
    setLessonState((previousState) => ({ ...previousState, isRootComputed: true }))
    markComplete(5)
  }, [markComplete])

  const resetRootStep = useCallback(() => {
    setLessonState((previousState) => ({ ...previousState, isRootComputed: false }))
  }, [])

  /**
   * เปิด/ปิดโหมดจำลองการปลอมแปลง และบันทึกว่าขั้นที่ 6 ทำเสร็จแล้ว
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const toggleTamper = useCallback(() => {
    setLessonState((previousState) => ({
      ...previousState,
      isTamperMode: !previousState.isTamperMode,
    }))
    markComplete(6)
  }, [markComplete])

  /**
   * ไปยังขั้นย่อยของเวิร์กโฟลว์ ZKP (ขั้นที่ 7) เมื่อถึงขั้นย่อยสุดท้ายถือว่าขั้นที่ 7 ทำเสร็จแล้ว
   *
   * @param {number} stage ขั้นย่อย (1-4)
   * @return {void}
   * @author StealthTrade Team
   */
  const goToZkpStage = useCallback((stage) => {
    setLessonState((previousState) => ({
      ...previousState,
      zkpWorkflowStage: stage,
      isZkpWorkflowDone: previousState.isZkpWorkflowDone || stage === 4,
    }))
  }, [])

  const contextValue = {
    ...lessonState,
    tree,
    authPathSteps,
    tamperedProof,
    goToZkpStage,
    goNext,
    goPrev,
    goToStep,
    reset,
    markComplete,
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
    resetRootStep,
    toggleTamper,
  }

  return <Lab05Context.Provider value={contextValue}>{children}</Lab05Context.Provider>
}

/**
 * Hook สำหรับอ่านสถานะและการกระทำของบทเรียน (ต้องใช้ภายใน Lab05Provider)
 *
 * @return {Object} สถานะรวมและฟังก์ชันของบทเรียน
 * @author StealthTrade Team
 */
export function useLab05() {
  const context = useContext(Lab05Context)
  if (!context) throw new Error("useLab05 must be used within Lab05Provider")
  return context
}

/* ==========================================================================
   components — ชิ้นส่วน UI ย่อย
   ========================================================================== */

/**
 * การ์ดตัวเลือกคำตอบ
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {boolean} props.isSelected ตัวเลือกนี้ถูกเลือกอยู่หรือไม่
 * @param {string} [props.choiceState="default"] สถานะการตรวจคำตอบ ("default", "correct", "incorrect")
 * @param {boolean} props.isDisabled ปิดการกดปุ่มหรือไม่
 * @param {Function} props.onClick ฟังก์ชันที่เรียกเมื่อกด
 * @param {React.ReactNode} props.children เนื้อหาภายในการ์ด
 * @param {string} props.className ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} ปุ่มตัวเลือก
 * @author StealthTrade Team
 */
function ChoiceCard({ isSelected, choiceState = "default", isDisabled, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={isSelected}
      className={JoinClassNames(
        "lab5-choice",
        isSelected && choiceState === "default" && "lab5-choice--selected",
        choiceState === "correct" && "lab5-choice--correct",
        choiceState === "incorrect" && "lab5-choice--incorrect",
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
  incorrect: { icon: XCircle, tone: "danger" },
  failed: { icon: XCircle, tone: "danger" },
}

/**
 * การ์ดแสดงผลตอบรับหลังผู้เรียนตอบหรือทำขั้นตอนต่าง ๆ
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} props.variant ชนิดของผลตอบรับ ("correct", "success", "incorrect", "failed")
 * @param {string} props.title หัวข้อของการ์ด
 * @param {React.ReactNode} props.children คำอธิบายใต้หัวข้อ
 * @param {string} props.className ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} การ์ดผลตอบรับ
 * @author StealthTrade Team
 */
function FeedbackCard({ variant, title, children, className }) {
  const config = feedbackConfig[variant]
  const Icon = config.icon
  const isDanger = config.tone === "danger"

  return (
    <div
      role="status"
      className={JoinClassNames(
        "lab5-animate-merge-up lab5-flex lab5-items-start lab5-gap-3",
        className,
      )}
      style={{
        borderRadius: "1rem",
        padding: "1.125rem 1.25rem",
        backgroundColor: isDanger ? "#fff5f5" : "#eaf8f2",
        border: isDanger ? "1.5px solid #fecdd3" : "1.5px solid #a7f3d0",
      }}
    >
      <Icon
        className="lab5-size-5 lab5-shrink-0"
        style={{
          color: isDanger ? "#ef4444" : "#16a979",
          marginTop: "2px",
        }}
      />
      <div className="lab5-space-y-1" style={{ flex: 1 }}>
        <p
          className="lab5-text-sm lab5-font-bold"
          style={{
            color: isDanger ? "#e11d48" : "#16a979",
            margin: 0,
          }}
        >
          {title}
        </p>
        {children && (
          <div
            className="lab5-text-xs lab5-leading-relaxed"
            style={{ color: "#475569", lineHeight: 1.6 }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

const glossaryEntries = [
  { term: "Hash", def: "Hash ดิจิทัลของข้อมูล" },
  { term: "Leaf", def: "ข้อมูลที่อยู่ปลายสุดของต้นไม้ เช่น ออร์เดอร์ A" },
  { term: "Sibling Hash", def: "Hash ของข้อมูลที่อยู่ข้าง ๆ บนเส้นทางที่เรากำลังพิสูจน์" },
  { term: "Root", def: "Hash เดียวที่สรุปต้นไม้ทั้งหมด" },
  { term: "Authentication Path", def: "ชุดของ Hash ที่เราต้องใช้เพื่อเดินจากข้อมูลที่เลือกกลับไปหา Root" },
  { term: "Inclusion Proof", def: "หลักฐานที่แสดงว่าออร์เดอร์นี้อยู่ในต้นไม้" },
  { term: "ZKP", def: "พิสูจน์ว่าบางอย่างเป็นจริง โดยไม่เปิดเผยข้อมูลลับ" },
  { term: "Nullifier", def: "ค่าผูกกับบริบทเพื่อป้องกันการใช้หลักฐานหรือเจตนาทำรายการเดิมซ้ำ" },
  { term: "Proof", def: "หลักฐานที่ผู้ตรวจใช้ตรวจ ในแลปนี้เป็นภาพจำลอง" },
]

/**
 * คำศัพท์แบบยุบไว้ก่อน (ปิดโดยดีฟอลต์) อยู่ในหัว เพื่อไม่ให้ขัดจังหวะการเรียน
 * ผู้เรียนเปิดดูเองเมื่อต้องการเช็คคำศัพท์
 *
 * @return {JSX.Element} ปุ่มเปิด/ปิดพร้อมรายการคำศัพท์
 * @author StealthTrade Team
 */
function Glossary() {
  const [isOpen, setIsOpen] = useState(false)
  const glossaryRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event) => {
      if (glossaryRef.current && !glossaryRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <div ref={glossaryRef} className="lab5-relative lab5-inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((previousIsOpen) => !previousIsOpen)}
        aria-expanded={isOpen}
        className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-border lab5-border-border lab5-bg-surface lab5-px-3 lab5-py-1.5 lab5-text-xs lab5-font-semibold lab5-text-muted-foreground lab5-transition-colors lab5-hover-surface-soft"
      >
        <BookOpen className="lab5-size-3.5" />
        คำศัพท์ที่เพิ่งเจอ
        <ChevronDown className={JoinClassNames("lab5-size-3.5 lab5-transition-transform", isOpen && "lab5-rotate-180")} />
      </button>

      {isOpen && (
        <div className="lab5-animate-merge-up lab5-glossary-dropdown lab5-grid lab5-gap-2 lab5-sm:grid-cols-2">
          {glossaryEntries.map((entry) => (
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

/**
 * แสดงค่า hash แบบย่อ กดเพื่อดูค่าเต็ม และคัดลอกได้
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} props.hash ค่า hash เต็ม
 * @param {string} [props.label] ข้อความนำหน้า hash
 * @param {string} [props.tone="neutral"] โทนสี ("neutral", "primary", "success", "danger")
 * @param {string} [props.className] ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} ปุ่มแสดง hash และกล่องแสดงค่าเต็มเมื่อขยาย
 * @author StealthTrade Team
 */
function HashValue({ hash, label, tone = "neutral", className }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  /**
   * คัดลอกค่า hash เต็มลงคลิปบอร์ด และแสดงสถานะ "คัดลอกแล้ว" ชั่วครู่
   *
   * @return {Promise<void>}
   * @author StealthTrade Team
   */
  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={JoinClassNames("lab5-inline-flex lab5-flex-col lab5-gap-1", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded((previousIsExpanded) => !previousIsExpanded)}
        className={JoinClassNames("lab5-hash-toggle", hashToneClass[tone])}
        aria-expanded={isExpanded}
      >
        {label && <span className="lab5-font-sans lab5-font-semibold lab5-not-italic">{label}</span>}
        <span>{isExpanded ? "ซ่อน" : TruncateHash(hash)}</span>
      </button>

      {isExpanded && (
        <div className="lab5-animate-merge-up lab5-flex lab5-items-start lab5-gap-2 lab5-rounded-lg lab5-border lab5-border-border lab5-bg-surface lab5-p-2">
          <code className="lab5-break-all lab5-font-mono lab5-text-11 lab5-leading-relaxed lab5-text-foreground">{hash}</code>
          <button
            type="button"
            onClick={copyHash}
            className="lab5-shrink-0 lab5-rounded-md lab5-p-1 lab5-text-muted-foreground lab5-transition-colors lab5-hover-surface-soft lab5-hover-text-primary"
            aria-label="คัดลอก hash"
          >
            {isCopied ? <Check className="lab5-size-3.5 lab5-text-success" /> : <Copy className="lab5-size-3.5" />}
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * ปุ่มคำใบ้ กดเพื่อเปิด/ปิดคำอธิบาย
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} [props.label="ทำไม?"] ข้อความบนปุ่ม
 * @param {React.ReactNode} props.children เนื้อหาคำใบ้
 * @param {string} [props.className] ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} ปุ่มและกล่องคำใบ้
 * @author StealthTrade Team
 */
function HintButton({ label = "ทำไม?", children, className }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={JoinClassNames("lab5-space-y-2", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((previousIsOpen) => !previousIsOpen)}
        aria-expanded={isOpen}
        className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-px-3 lab5-py-1.5 lab5-text-xs lab5-font-semibold lab5-text-primary lab5-transition-colors lab5-hover-primary-10"
      >
        <HelpCircle className="lab5-size-3.5" />
        {label}
      </button>
      {isOpen && (
        <div className="lab5-animate-merge-up lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-3 lab5-text-sm lab5-leading-relaxed lab5-text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * หัวข้อของแต่ละขั้นในบทเรียน
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} props.sectionLabel ป้ายชื่อส่วนด้านบนหัวข้อ
 * @param {string} props.title หัวข้อหลัก
 * @param {string} [props.description] คำอธิบายใต้หัวข้อ
 * @return {JSX.Element} ส่วนหัวของบทเรียน
 * @author StealthTrade Team
 */
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

/**
 * กล่องข้อความของผู้สอน
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} props.message ข้อความที่ผู้สอนพูด
 * @return {JSX.Element} กล่องข้อความพร้อมไอคอนผู้สอน
 * @author StealthTrade Team
 */
function MentorMessage({ message }) {
  return (
    <div className="lab5-flex lab5-items-start lab5-gap-3 lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4 lab5-shadow-sm">
      <div className="lab5-flex lab5-size-10 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full lab5-bg-primary-soft lab5-text-primary">
        <GraduationCap className="lab5-size-5" />
      </div>
      <div className="lab5-min-w-0">
        <div className="lab5-flex lab5-items-baseline lab5-gap-2">
          <span className="lab5-text-sm lab5-font-bold lab5-text-foreground">ดร. ธีร์</span>
          <span className="lab5-text-xs lab5-text-muted-foreground">ผู้สอน</span>
        </div>
        <p className="lab5-mt-0.5 lab5-text-sm lab5-leading-relaxed lab5-text-foreground-80 lab5-text-pretty" style={{ whiteSpace: "pre-line" }}>{message}</p>
      </div>
    </div>
  )
}

const nodeLayouts = [
  { id: "root", label: "ROOT", centerX: 50, centerY: 12 },
  { id: "mid-0", label: "H(A+B)", centerX: 26, centerY: 44 },
  { id: "mid-1", label: "H(C+D)", centerX: 74, centerY: 44 },
  { id: "leaf-0", label: "H(A)", centerX: 12, centerY: 80 },
  { id: "leaf-1", label: "H(B)", centerX: 38, centerY: 80 },
  { id: "leaf-2", label: "H(C)", centerX: 62, centerY: 80 },
  { id: "leaf-3", label: "H(D)", centerX: 88, centerY: 80 },
]

const edges = [
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

/**
 * แผนภาพ Merkle tree พร้อมสถานะของแต่ละโหนด
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {Object<string, string>} [props.nodeStateMap={}] สถานะของแต่ละโหนด (key คือรหัสโหนด)
 * @param {Object<string, boolean>} [props.visibilityMap] การแสดง/ซ่อนของแต่ละโหนด (ไม่ระบุ = แสดงทั้งหมด)
 * @param {string[]} [props.hashNodeIds=[]] รหัสโหนดที่ต้องแสดงค่า hash
 * @param {string[]} [props.clickableNodeIds=[]] รหัสโหนดที่กดได้
 * @param {Function} [props.onNodeClick] ฟังก์ชันที่เรียกเมื่อกดโหนดที่กดได้
 * @param {string} [props.className] ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} แผนภาพต้นไม้
 * @author StealthTrade Team
 */
function MerkleTreeDiagram({ nodeStateMap = {}, visibilityMap, hashNodeIds = [], clickableNodeIds = [], onNodeClick, customHashes = {}, className }) {
  const { tree } = useLab05()

  /**
   * หาค่า hash ของโหนดที่ระบุ (ถ้าโหนดนั้นต้องแสดง hash)
   *
   * @param {string} nodeId รหัสโหนด
   * @return {string|undefined} ค่า hash หรือ undefined ถ้าไม่ต้องแสดง
   * @author StealthTrade Team
   */
  const getHashByNodeId = (nodeId) => {
    if (customHashes && customHashes[nodeId]) return customHashes[nodeId]
    if (!tree || !hashNodeIds.includes(nodeId)) return undefined
    if (nodeId === "root") return tree.root
    if (nodeId.startsWith("mid-")) return tree.midHashes[Number(nodeId.slice(4))]
    if (nodeId.startsWith("leaf-")) return tree.leafHashes[Number(nodeId.slice(5))]
    return undefined
  }

  /**
   * ตรวจว่าโหนดที่ระบุต้องแสดงหรือไม่
   *
   * @param {string} nodeId รหัสโหนด
   * @return {boolean} true ถ้าต้องแสดง
   * @author StealthTrade Team
   */
  const isVisible = (nodeId) => (visibilityMap ? visibilityMap[nodeId] !== false : true)

  /**
   * หาสถานะของโหนดที่ระบุ
   *
   * @param {string} nodeId รหัสโหนด
   * @return {string} สถานะของโหนด (ค่าเริ่มต้นคือ "neutral")
   * @author StealthTrade Team
   */
  const getNodeState = (nodeId) => nodeStateMap[nodeId] ?? "neutral"

  /**
   * หาสถานะของเส้นเชื่อมระหว่างสองโหนด
   *
   * @param {string} fromId รหัสโหนดต้นทาง
   * @param {string} toId รหัสโหนดปลายทาง
   * @return {string|boolean} "error", "active" หรือ false ถ้าเส้นไม่ต้องเน้น
   * @author StealthTrade Team
   */
  const getEdgeState = (fromId, toId) => {
    if (!isVisible(fromId) || !isVisible(toId)) return false
    const fromState = getNodeState(fromId)
    const toState = getNodeState(toId)
    const isLit = (nodeStateName) => nodeStateName === "path" || nodeStateName === "target" || nodeStateName === "success"
    const isError = (nodeStateName) => nodeStateName === "error"
    if (isError(fromState) && isError(toState)) return "error"
    return isLit(fromState) && isLit(toState) ? "active" : false
  }

  return (
    <div className={JoinClassNames("lab5-relative lab5-mx-auto lab5-h-64 lab5-w-full lab5-max-w-2xl lab5-sm:h-80", className)}>
      <svg className="lab5-absolute lab5-inset-0 lab5-h-full lab5-w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {edges.map(([fromId, toId]) => {
          const from = nodeLayouts.find((layoutNode) => layoutNode.id === fromId)
          const to = nodeLayouts.find((layoutNode) => layoutNode.id === toId)
          if (!isVisible(fromId) || !isVisible(toId)) return null
          const edgeState = getEdgeState(fromId, toId)
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={from.centerX}
              y1={from.centerY}
              x2={to.centerX}
              y2={to.centerY}
              vectorEffect="non-scaling-stroke"
              className={JoinClassNames(
                "lab5-transition-colors lab5-duration-300",
                edgeState === "active" && "lab5-stroke-primary",
                edgeState === "error" && "lab5-stroke-danger",
                !edgeState && "lab5-stroke-border",
              )}
              strokeWidth={edgeState ? 2 : 1.25}
            />
          )
        })}
      </svg>

      {nodeLayouts.map((node) => {
        if (!isVisible(node.id)) return null
        const currentNodeState = getNodeState(node.id)
        const hash = getHashByNodeId(node.id)
        const isClickable = clickableNodeIds.includes(node.id)
        const NodeElement = isClickable ? "button" : "div"
        return (
          <NodeElement
            key={node.id}
            {...(isClickable ? { type: "button", onClick: () => onNodeClick?.(node.id) } : {})}
            style={{ left: `${node.centerX}%`, top: `${node.centerY}%` }}
            className={JoinClassNames(
              "lab5-node",
              nodeStateClass[currentNodeState],
              isClickable && "lab5-node--clickable",
              (currentNodeState === "path" || currentNodeState === "success" || currentNodeState === "error") && "lab5-animate-merge-up",
            )}
          >
            <span className="lab5-node-label">{node.label}</span>
            {hash && <span className="lab5-node-hash">{TruncateHash(hash, 6)}</span>}
          </NodeElement>
        )
      })}
    </div>
  )
}

/**
 * แถบจุดแสดงความคืบหน้าของขั้นที่ 1-9 (บทนำไม่มีจุด)
 *
 * @return {JSX.Element} แถบความคืบหน้าและชื่อขั้นปัจจุบัน
 * @author StealthTrade Team
 */
function LabProgress() {
  const { currentStep, completedSteps, goToStep } = useLab05()
  // จุด progress แทนขั้นที่ 1..9 (บทนำไม่มีจุด)
  const steps = Array.from({ length: TOTAL_STEPS }, (unusedValue, index) => index + 1)

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
                className={JoinClassNames(
                  "lab5-dot",
                  isCurrent && "lab5-dot--current lab5-animate-soft-pulse",
                  isCompleted && !isCurrent && "lab5-dot--completed",
                  !isReachable && "lab5-dot--locked",
                  isReachable && !isCurrent && "lab5-dot--reachable",
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="lab5-size-3.5" />
                ) : (
                  step
                )}
              </button>
              {step < TOTAL_STEPS && (
                <span className={JoinClassNames("lab5-progress-line lab5-sm:w-5", completedSteps.includes(step) && "lab5-progress-line--done")} />
              )}
            </div>
          )
        })}
      </div>
      <p className="lab5-text-center lab5-text-xs lab5-font-medium lab5-text-muted-foreground">
        {currentStep === 0
          ? "บทนำ"
          : `${currentStep <= 4 ? "ภาค 1 · Merkle Tree" : "ภาค 2 · zk-SNARK"} · ขั้นที่ ${currentStep} · ${STEP_META[currentStep]?.topic || ""}`}
      </p>
    </div>
  )
}

/**
 * แถบปุ่มนำทางด้านล่าง (เริ่มใหม่ / ย้อนกลับ / ไปขั้นต่อ) ซ่อนในหน้าบทนำ
 *
 * @return {JSX.Element|null} แถบนำทาง หรือ null เมื่ออยู่หน้าบทนำ
 * @author StealthTrade Team
 */
function LabNavigation() {
  const { currentStep, canProceed, goNext, goPrev, reset } = useLab05()

  if (currentStep === 0) return null

  const isLast = currentStep === TOTAL_STEPS

  return (
    <div className="lab5-sticky lab5-bottom-0 lab5-z-30 lab5-border-t lab5-border-border lab5-bg-surface-85 lab5-backdrop-blur-sm">
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
            <div className="lab5-flex lab5-flex-col lab5-items-center">
              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed}
                className={JoinClassNames("lab5-nav-next", canProceed ? "lab5-nav-next--enabled" : "lab5-nav-next--disabled")}
              >
                ไปขั้นต่อ
                <ArrowRight className="lab5-size-4" />
              </button>
              {!canProceed && (
                <span className="lab5-mt-1 lab5-text-10 lab5-text-muted-foreground">
                  ทำขั้นนี้ให้เสร็จก่อนจึงไปต่อได้
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   steps — เนื้อหาแต่ละขั้นของบทเรียน
   ========================================================================== */

/**
 * หน้าบทนำของบทเรียน (ขั้นที่ 0)
 *
 * @return {JSX.Element} หน้าบทนำพร้อมปุ่มเริ่มเรียน
 * @author StealthTrade Team
 */
function StepIntro() {
  const { goNext } = useLab05()

  return (
    <div
      className="lab5-text-center"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      {/* Top Pill Tag */}
      <div>
        <span
          className="lab5-inline-flex lab5-items-center lab5-gap-2.5 lab5-rounded-full lab5-border lab5-px-4 lab5-py-1.5 lab5-font-mono lab5-font-bold lab5-uppercase"
          style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            borderColor: "#e2e8f0",
            backgroundColor: "#ffffff",
            color: "#64748b",
          }}
        >
          LAB 5 <span style={{ opacity: 0.35 }}>·</span> MERKLE TREES <span style={{ opacity: 0.35 }}>·</span> ZK-SNARK
        </span>
      </div>

      {/* Main Title & Subtitle */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        <h1
          className="lab5-text-balance lab5-text-4xl lab5-font-extrabold lab5-leading-tight lab5-sm:text-5xl"
          style={{ fontWeight: 800, margin: 0 }}
        >
          <span style={{ color: "#10b981" }}>Lab 05 — </span>
          <span style={{ color: "#544af4" }}>Merkle Trees แบบ ZKP</span>
        </h1>
        <h2
          className="lab5-text-balance lab5-text-2xl lab5-font-extrabold lab5-leading-tight lab5-sm:text-3xl"
          style={{ color: "#1e293b", fontWeight: 800, margin: 0 }}
        >
          พิสูจน์ข้อมูลโดยไม่ต้องเปิดเผยข้อมูลลับ
        </h2>
      </div>

      {/* Description */}
      <p
        className="lab5-mx-auto lab5-max-w-xl lab5-text-center lab5-text-sm lab5-leading-relaxed lab5-sm:text-base"
        style={{
          lineHeight: 1.75,
          color: "#64748b",
          margin: 0,
        }}
      >
        เว็บเทรดมี Order จำนวนมาก เราจะพิสูจน์ได้อย่างไรว่า Order
        <br />
        ของเราอยู่ในชุดข้อมูล โดยไม่ต้องเปิดเผยข้อมูลทั้งหมดให้ผู้ตรวจสอบ?
        <br />
        เรียนรู้ผ่านการสร้าง Merkle Tree แล้วต่อยอดเป็น zk-SNARK —
        <br />
        ไม่ต้องมีพื้นฐานมาก่อน
      </p>

      {/* Badges Row */}
      <div
        className="lab5-flex lab5-flex-wrap lab5-items-center lab5-justify-center"
        style={{ gap: "0.625rem", marginTop: "0.25rem" }}
      >
        <div
          className="lab5-inline-flex lab5-items-center lab5-rounded-full lab5-border lab5-px-3.5 lab5-py-1.5 lab5-text-xs lab5-font-semibold lab5-shadow-sm"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e2e8f0",
            color: "#334155",
            gap: "0.5rem",
          }}
        >
          <span>ภาค 1</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span>Merkle Tree</span>
        </div>
        <div
          className="lab5-inline-flex lab5-items-center lab5-rounded-full lab5-border lab5-px-3.5 lab5-py-1.5 lab5-text-xs lab5-font-semibold lab5-shadow-sm"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e2e8f0",
            color: "#334155",
            gap: "0.5rem",
          }}
        >
          <span>ภาค 2</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span>zk-SNARK</span>
        </div>
        <div
          className="lab5-inline-flex lab5-items-center lab5-rounded-full lab5-border lab5-px-3.5 lab5-py-1.5 lab5-text-xs lab5-font-semibold lab5-shadow-sm"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e2e8f0",
            color: "#334155",
            gap: "0.5rem",
          }}
        >
          <span>9 ขั้น</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span>ประมาณ 20 นาที</span>
        </div>
      </div>

      {/* CTA Button */}
      <div style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          onClick={goNext}
          className="lab5-inline-flex lab5-items-center lab5-rounded-full lab5-text-base lab5-font-bold lab5-text-white lab5-transition-all hover:lab5-brightness"
          style={{
            gap: "0.625rem",
            padding: "0.65rem 1.75rem",
            backgroundColor: "#5850ec",
            boxShadow: "0 4px 14px rgba(88, 80, 236, 0.35)",
            cursor: "pointer",
          }}
        >
          <span>เริ่มเรียนรู้</span>
          <ArrowRight className="lab5-size-4" style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </div>
  )
}

const step1Choices = [
  {
    title: "ส่งข้อมูลออร์เดอร์ทั้งหมด + บอกว่าฉันคือใบไหน",
    desc: "— ตรวจได้ แต่ไม่เป็นส่วนตัว",
    feedbackTitle: "ตรวจได้ แต่ไม่เป็นส่วนตัวเลย",
    feedbackDesc: (
      <span>
        ผู้ตรวจจะเห็นออร์เดอร์ของ <strong>ทุกคน</strong> และรู้ด้วยว่าคุณคือใบไหน — เหมือนต้องโชว์สมุดบัญชีทั้งเล่ม
        <br />
        เพื่อพิสูจน์ว่ามีชื่อเราอยู่บรรทัดเดียว
      </span>
    ),
  },
  {
    title: "ส่ง Root อย่างเดียว",
    desc: "— ยังพิสูจน์ไม่ได้",
    feedbackTitle: "ยังพิสูจน์ไม่ได้",
    feedbackDesc: "Root เป็นแค่ตัวแทนชุดข้อมูลใหญ่ ไม่มีอะไรบอกว่าคุณอยู่ในนั้น",
  },
  {
    title: "ส่งหลักฐานแบบ Merkle + ZKP",
    desc: "— เป้าหมายของแลปนี้",
    feedbackTitle: "ถูกต้อง นี่คือเป้าหมายของแลป",
    feedbackDesc: "เราจะเรียนเป็น 2 ภาค: ภาคแรกสร้างเครื่องมือพิสูจน์ ภาคสองเพิ่มความลับเข้าไป",
  },
]

/**
 * แผนภาพตัวอย่าง Merkle Tree สำหรับขั้นที่ 1
 *
 * @return {JSX.Element} แผนภาพ Merkle Tree พร้อมสมการและคำอธิบาย
 * @author StealthTrade Team
 */
function Step1MerklePreview() {
  // โหนดของต้นไม้ตัวอย่าง: tone = "root" (เขียวเข้ม), "solid" (ม่วงทึบ), "target" (ม่วงอ่อน), "muted" (ขาว)
  const previewNodes = [
    { label: "ROOT", x: 260, y: 22, width: 64, tone: "root" },
    { label: "H(A+B)", x: 130, y: 86, width: 64, tone: "root" },
    { label: "H(C+D)", x: 390, y: 86, width: 64, tone: "solid" },
    { label: "H(A)", x: 50, y: 158, width: 52, tone: "solid" },
    { label: "H(B)", x: 190, y: 158, width: 52, tone: "target" },
    { label: "H(C)", x: 320, y: 158, width: 52, tone: "muted" },
    { label: "H(D)", x: 460, y: 158, width: 52, tone: "muted" },
  ]
  const previewEdges = [
    { from: [260, 22], to: [130, 86], isPath: true },
    { from: [260, 22], to: [390, 86], isPath: true },
    { from: [130, 86], to: [50, 158], isPath: true },
    { from: [130, 86], to: [190, 158], isPath: true },
    { from: [390, 86], to: [320, 158], isPath: false },
    { from: [390, 86], to: [460, 158], isPath: false },
  ]
  const nodeStyle = {
    root: { fill: "#0d7a55", stroke: "#0d7a55", text: "#ffffff" },
    solid: { fill: "#6d4bd8", stroke: "#6d4bd8", text: "#ffffff" },
    target: { fill: "#f0ebff", stroke: "#6d4bd8", text: "#6d4bd8" },
    muted: { fill: "#ffffff", stroke: "#d5d9e3", text: "#25304a" },
  }

  return (
    <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4 lab5-space-y-4">
      {/* สมการหลักฐาน */}
      <div className="lab5-flex lab5-flex-wrap lab5-items-center lab5-justify-center lab5-gap-2 lab5-text-xs">
        <span className="lab5-zk-chip lab5-zk-chip--solid">ออร์เดอร์ B</span>
        <span className="lab5-font-bold lab5-text-muted-foreground">+</span>
        <span className="lab5-zk-chip lab5-zk-chip--primary" style={{ backgroundColor: "#ffffff" }}>H(A)</span>
        <span className="lab5-font-bold lab5-text-muted-foreground">+</span>
        <span className="lab5-zk-chip lab5-zk-chip--primary" style={{ backgroundColor: "#ffffff" }}>H(C+D)</span>
        <ArrowRight className="lab5-size-3.5 lab5-text-muted-foreground" />
        <span className="lab5-zk-chip lab5-zk-chip--success" style={{ borderColor: "transparent" }}>
          Root
        </span>
      </div>

      {/* แผนภาพโครงสร้างต้นไม้ Merkle */}
      <svg className="lab5-w-full" viewBox="0 0 520 180" fill="none" style={{ display: "block", maxHeight: "210px" }}>
        {previewEdges.map((edge, index) => (
          <line
            key={index}
            x1={edge.from[0]}
            y1={edge.from[1]}
            x2={edge.to[0]}
            y2={edge.to[1]}
            stroke={edge.isPath ? "#6d4bd8" : "#d5d9e3"}
            strokeWidth={edge.isPath ? 1.6 : 1.2}
          />
        ))}
        {previewNodes.map((node) => {
          const style = nodeStyle[node.tone]
          return (
            <g key={node.label}>
              <rect
                x={node.x - node.width / 2}
                y={node.y - 12}
                width={node.width}
                height="24"
                rx="12"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth="1.5"
              />
              <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" fill={style.text} fontSize="11" fontWeight="700">
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* คำอธิบายความสัมพันธ์ */}
      <div className="lab5-space-y-1.5 lab5-text-xs lab5-text-muted-foreground">
        <p>
          <span className="lab5-font-mono lab5-text-primary">H(A)</span> — จับคู่กับ Hash ของ Order B เพื่อคำนวณ{" "}
          <span className="lab5-font-mono">H(A+B)</span>
        </p>
        <p>
          <span className="lab5-font-mono lab5-text-primary">H(C+D)</span> — จับคู่กับ <span className="lab5-font-mono">H(A+B)</span>{" "}
          ที่คำนวณได้ เพื่อให้ได้ Root
        </p>
      </div>
    </div>
  )
}

/**
 * ขั้นที่ 1: ตั้งโจทย์ปัญหาและให้ผู้เรียนเลือกคำตอบ
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 1
 * @author StealthTrade Team
 */
function Step1WhyMerkle() {
  const { step1Answer, isStep1Correct, answerStep1, selectLeaf } = useLab05()
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null)
  const [showHint, setShowHint] = useState(false)

  const handleSelectOrder = (index) => {
    setSelectedOrderIndex(index)
    selectLeaf(index)
  }

  const activeOrder = selectedOrderIndex !== null ? orders[selectedOrderIndex] : null

  return (
    <div className="lab5-space-y-6">
      {/* 1. ปัญหาที่เราจะแก้ & Title */}
      <div className="lab5-space-y-2">
        <span
          className="lab5-inline-block lab5-rounded-full lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold"
          style={{ backgroundColor: "#f3e8ff", color: "#6d4bd8" }}
        >
          ปัญหาที่เราจะแก้
        </span>
        <h2
          className="lab5-text-balance lab5-text-xl lab5-font-extrabold lab5-leading-tight lab5-sm:text-2xl"
          style={{ color: "#0f172a", fontWeight: 800, margin: 0 }}
        >
          จะพิสูจน์ได้อย่างไรว่าออร์เดอร์ของเราอยู่ในระบบ โดยไม่เปิดเผยข้อมูลลับ?
        </h2>
      </div>

      {/* 2. สองการ์ดบทบาท: ผู้พิสูจน์ (Prover) & ผู้ตรวจสอบ (Verifier) */}
      <div className="lab5-grid lab5-grid-cols-1 lab5-gap-4 lab5-sm:grid-cols-2">
        {/* Prover */}
        <div
          className="lab5-flex lab5-items-start lab5-transition-all"
          style={{
            background: "linear-gradient(145deg, #ffffff 0%, #faf8ff 100%)",
            border: "1.5px solid #ede9fe",
            borderRadius: "1.125rem",
            padding: "1.25rem 1.375rem",
            gap: "1.25rem",
            boxShadow: "0 4px 20px -2px rgba(109, 75, 216, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div
            className="lab5-flex lab5-shrink-0 lab5-items-center lab5-justify-center"
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              borderRadius: "13px",
              background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
              color: "#6d4bd8",
              boxShadow: "0 2px 8px rgba(109, 75, 216, 0.16)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              marginTop: "2px",
            }}
          >
            <Users className="lab5-size-5" />
          </div>
          <div className="lab5-space-y-1.5" style={{ flex: 1, minWidth: 0 }}>
            <div className="lab5-flex lab5-items-center lab5-justify-between lab5-gap-2">
              <h3 className="lab5-text-sm lab5-font-extrabold" style={{ color: "#0f172a", margin: 0 }}>
                ผู้พิสูจน์ <span style={{ color: "#6d4bd8", fontWeight: 600 }}>(Prover)</span>
              </h3>
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  backgroundColor: "#ede9fe",
                  color: "#6d4bd8",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  letterSpacing: "0.02em",
                }}
              >
                คุณ
              </span>
            </div>
            <p className="lab5-text-xs lab5-leading-relaxed" style={{ color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              คือ <strong style={{ color: "#0f172a", fontWeight: 700 }}>"คุณ"</strong> — คนที่อ้างว่าบางอย่างเป็นจริง
              <br />
              และถือข้อมูลลับไว้
            </p>
          </div>
        </div>

        {/* Verifier */}
        <div
          className="lab5-flex lab5-items-start lab5-transition-all"
          style={{
            background: "linear-gradient(145deg, #ffffff 0%, #f4fdf8 100%)",
            border: "1.5px solid #d1fae5",
            borderRadius: "1.125rem",
            padding: "1.25rem 1.375rem",
            gap: "1.25rem",
            boxShadow: "0 4px 20px -2px rgba(16, 185, 129, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div
            className="lab5-flex lab5-shrink-0 lab5-items-center lab5-justify-center"
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              borderRadius: "13px",
              background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
              color: "#059669",
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.16)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              marginTop: "2px",
            }}
          >
            <ShieldCheck className="lab5-size-5" />
          </div>
          <div className="lab5-space-y-1.5" style={{ flex: 1, minWidth: 0 }}>
            <div className="lab5-flex lab5-items-center lab5-justify-between lab5-gap-2">
              <h3 className="lab5-text-sm lab5-font-extrabold" style={{ color: "#0f172a", margin: 0 }}>
                ผู้ตรวจสอบ <span style={{ color: "#059669", fontWeight: 600 }}>(Verifier)</span>
              </h3>
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  backgroundColor: "#d1fae5",
                  color: "#059669",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  letterSpacing: "0.02em",
                }}
              >
                ระบบ
              </span>
            </div>
            <p className="lab5-text-xs lab5-leading-relaxed" style={{ color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              คือ <strong style={{ color: "#0f172a", fontWeight: 700 }}>"ระบบ/ผู้ตรวจ"</strong> —
              <br />
              คนที่ต้องตัดสินว่าจะเชื่อคำอ้างของคุณหรือไม่
            </p>
          </div>
        </div>
      </div>

      {/* 3. Section ①: เลือกออร์เดอร์ที่เป็นของคุณ */}
      <div className="lab5-space-y-3">
        <p className="lab5-text-xs lab5-font-bold" style={{ color: "#334155", margin: 0 }}>
          ① เลือกออร์เดอร์ที่เป็นของคุณ (เลือกใบไหนก็ได้)
        </p>

        <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3 lab5-sm:grid-cols-4">
          {orders.map((order, index) => {
            const isSelected = selectedOrderIndex === index
            return (
              <button
                type="button"
                key={order.id}
                onClick={() => handleSelectOrder(index)}
                className="lab5-rounded-2xl lab5-p-4 lab5-text-center lab5-transition-all"
                style={{
                  backgroundColor: isSelected ? "#f3effe" : "#ffffff",
                  border: isSelected ? "1.5px solid #d8b4fe" : "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                <p className="lab5-text-sm lab5-font-bold" style={{ color: "#0f172a", margin: 0 }}>
                  {order.label}
                </p>
                <p
                  className="lab5-mt-1 lab5-font-mono lab5-text-xs"
                  style={{ color: "#64748b", margin: "4px 0 0 0" }}
                >
                  {order.value}
                </p>
                {isSelected && (
                  <p
                    className="lab5-font-semibold"
                    style={{ color: "#6d4bd8", margin: "6px 0 0 0", fontSize: "0.6875rem" }}
                  >
                    ← ออร์เดอร์ของคุณ
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Tip Box */}
      <div
        className="lab5-flex lab5-items-start lab5-gap-3 lab5-rounded-2xl lab5-border lab5-p-4"
        style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }}
      >
        <Lightbulb className="lab5-size-4 lab5-shrink-0" style={{ color: "#6d4bd8", marginTop: 2 }} />
        <div className="lab5-space-y-1 lab5-text-xs lab5-leading-relaxed" style={{ color: "#64748b" }}>
          <p style={{ margin: 0 }}>
            ข้อความอย่าง{" "}
            <span className="lab5-font-mono" style={{ color: "#334155" }}>
              {activeOrder ? activeOrder.value : "secret-B-q92m"}
            </span>{" "}
            คือ <strong style={{ color: "#1e293b" }}>"รหัสลับของออร์เดอร์"</strong> — มีแต่เจ้าของออร์เดอร์ที่รู้
          </p>
          <p style={{ margin: 0 }}>
            เว็บเทรดจริงมีออร์เดอร์เป็นล้านใบ แลปนี้ใช้แค่ 4 ใบเพื่อให้เห็นภาพชัด ๆ
          </p>
        </div>
      </div>

      {/* 5. Section ②: ถ้าต้องพิสูจน์ให้ผู้ตรวจเชื่อ คุณจะส่งอะไรไปให้เขา? */}
      <div className="lab5-space-y-3">
        <div className="lab5-space-y-0.5">
          <p className="lab5-text-xs lab5-font-bold" style={{ color: "#334155", margin: 0 }}>
            ② ถ้าต้องพิสูจน์ให้ผู้ตรวจเชื่อ คุณจะส่งอะไรไปให้เขา?
          </p>
          <p className="lab5-text-xs" style={{ color: "#64748b", margin: 0 }}>
            ZKP (Zero-Knowledge Proof) = พิสูจน์ว่าบางอย่างเป็นจริง โดยไม่เปิดเผยข้อมูลลับ
          </p>
        </div>

        {selectedOrderIndex === null ? (
          <div
            className="lab5-flex lab5-items-center lab5-gap-2.5 lab5-rounded-xl lab5-border lab5-px-4 lab5-py-3"
            style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}
          >
            <Lightbulb className="lab5-size-4 lab5-shrink-0" style={{ color: "#6d4bd8" }} />
            <span className="lab5-text-xs" style={{ color: "#475569" }}>
              เลือกออร์เดอร์ของคุณในข้อ ① ก่อน แล้วค่อยเลือกวิธีพิสูจน์
            </span>
          </div>
        ) : (
          <div className="lab5-space-y-3">
            {step1Choices.map((choice, index) => {
              const isSelected = step1Answer === index
              const choiceState = isSelected ? (index === 2 ? "correct" : "incorrect") : "default"
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => answerStep1(index)}
                  className="lab5-flex lab5-flex-col lab5-items-start lab5-gap-1 lab5-transition-all"
                  style={{
                    width: "100%",
                    borderRadius: "1rem",
                    padding: "1.125rem 1.25rem",
                    textAlign: "left",
                    backgroundColor: "#ffffff",
                    border: isSelected
                      ? choiceState === "correct"
                        ? "2px solid #10b981"
                        : "2px solid #a855f7"
                      : "1.5px solid #e2e8f0",
                    cursor: "pointer",
                  }}
                >
                  <span className="lab5-text-sm lab5-font-bold" style={{ color: "#0f172a" }}>
                    {choice.title}
                  </span>
                  <span
                    className="lab5-text-xs"
                    style={{
                      color:
                        choiceState === "incorrect"
                          ? "#e11d48"
                          : choiceState === "correct"
                            ? "#059669"
                            : "#64748b",
                      fontWeight: choiceState === "incorrect" || choiceState === "correct" ? 600 : 400,
                    }}
                  >
                    {choice.desc}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* ผลตอบรับคำตอบ (แสดงทันทีใต้ตัวเลือก) */}
        {step1Answer !== null && !isStep1Correct && (
          <FeedbackCard variant="incorrect" title={step1Choices[step1Answer].feedbackTitle}>
            {step1Choices[step1Answer].feedbackDesc}
          </FeedbackCard>
        )}

        {isStep1Correct && (
          <div className="lab5-animate-merge-up lab5-space-y-4">
            <FeedbackCard variant="correct" title={step1Choices[2].feedbackTitle}>
              {step1Choices[2].feedbackDesc}
            </FeedbackCard>

            <div className="lab5-grid lab5-grid-cols-1 lab5-gap-4 lab5-sm:grid-cols-2">
              {/* Card 1: ภาค 1 */}
              <div
                className="lab5-space-y-2 lab5-rounded-2xl lab5-border lab5-p-4"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      backgroundColor: "#ede9fe",
                      color: "#6d4bd8",
                      padding: "3px 10px",
                      borderRadius: "9999px",
                    }}
                  >
                    ภาค 1 · ขั้น 2–4
                  </span>
                </div>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a", margin: "6px 0 2px 0" }}>
                  Merkle Tree
                </h4>
                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                  พิสูจน์ว่า "ออร์เดอร์ของฉันอยู่ในชุดข้อมูลจริง"
                  <br />
                  โดยไม่ต้องส่งข้อมูลทั้งหมด
                </p>
              </div>

              {/* Card 2: ภาค 2 */}
              <div
                className="lab5-space-y-2 lab5-rounded-2xl lab5-border lab5-p-4"
                style={{
                  backgroundColor: "#f9f7ff",
                  borderColor: "#ede9fe",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      backgroundColor: "#ede9fe",
                      color: "#6d4bd8",
                      padding: "3px 10px",
                      borderRadius: "9999px",
                    }}
                  >
                    ภาค 2 · ขั้น 5–9
                  </span>
                </div>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a", margin: "6px 0 2px 0" }}>
                  zk-SNARK
                </h4>
                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                  ซ่อนไม่ให้ผู้ตรวจรู้ด้วยซ้ำว่าเป็นออร์เดอร์ใบไหน แต่ยังเชื่อได้ 100%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ปุ่ม "ทำไม?" */}
        <div>
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-px-3.5 lab5-py-1.5 lab5-text-xs lab5-font-semibold lab5-transition-all"
            style={{
              backgroundColor: "#f5f3ff",
              color: "#6d4bd8",
              cursor: "pointer",
            }}
          >
            <HelpCircle className="lab5-size-3.5" />
            <span>ทำไม?</span>
          </button>
        </div>

        {showHint && (
          <div
            className="lab5-animate-merge-up lab5-rounded-xl lab5-border lab5-p-3.5 lab5-text-xs"
            style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0", color: "#475569", lineHeight: 1.6 }}
          >
            <strong style={{ color: "#0f172a" }}>คำใบ้:</strong> เราต้องการพิสูจน์ว่า Order ของเราอยู่ในชุดข้อมูลจริง โดยไม่ต้องเปิดเผย Order อื่นทั้งหมด และไม่เปิดเผยตัวตนของเรา
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ขั้นที่ 2: เปลี่ยนรหัสลับเป็น Hash ให้แต่ละ Order
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 2
 * @author StealthTrade Team
 */
function Step2HashOrders() {
  const { tree, hashedLeaves, revealHash } = useLab05()
  const [playgroundInput, setPlaygroundInput] = useState("BUY 0.5 BTC")
  const [playgroundHash, setPlaygroundHash] = useState("")
  const [showHint, setShowHint] = useState(false)
  const isAllHashed = hashedLeaves.every(Boolean)

  useEffect(() => {
    let isCancelled = false
    Sha256Hex(playgroundInput).then((hash) => {
      if (!isCancelled) setPlaygroundHash(hash)
    })
    return () => {
      isCancelled = true
    }
  }, [playgroundInput])

  const revealAllHashes = () => {
    orders.forEach((_, idx) => revealHash(idx))
  }

  return (
    <div className="lab5-space-y-6">
      {/* 1. Header */}
      <div className="lab5-space-y-2">
        <span
          className="lab5-inline-block lab5-rounded-full lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold"
          style={{ backgroundColor: "#f3e8ff", color: "#6d4bd8" }}
        >
          สร้าง HASH
        </span>
        <h2
          className="lab5-text-balance lab5-text-xl lab5-font-extrabold lab5-leading-tight lab5-sm:text-2xl"
          style={{ color: "#0f172a", fontWeight: 800, margin: 0 }}
        >
          เปลี่ยนรหัสลับเป็น Hash แล้วประกอบเป็นต้นไม้
        </h2>
        <p className="lab5-text-sm lab5-leading-relaxed" style={{ color: "#64748b", margin: 0 }}>
          เราไม่เอารหัสลับไปวางในต้นไม้ตรง ๆ แต่เปลี่ยนเป็น Hash ก่อน ข้อมูลเดิมจริงไม่ถูกเปิดเผย
        </p>
      </div>

      {/* 2. Interactive Playground Box */}
      <div
        className="lab5-rounded-2xl lab5-border"
        style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", padding: "1.25rem" }}
      >
        {/* Header */}
        <div className="lab5-flex lab5-items-start" style={{ gap: "0.875rem" }}>
          <div
            className="lab5-flex lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full"
            style={{ backgroundColor: "#f5f3ff", color: "#6d4bd8", width: "2rem", height: "2rem" }}
          >
            <Fingerprint style={{ width: "1rem", height: "1rem" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <h3 className="lab5-text-sm lab5-font-bold" style={{ color: "#0f172a", margin: 0 }}>
              ลองเล่นก่อน: Hash คือ "ลายนิ้วมือของข้อมูล"
            </h3>
            <p className="lab5-text-xs" style={{ color: "#64748b", margin: 0, lineHeight: 1.55 }}>
              พิมพ์อะไรก็ได้ลงในช่อง แล้วลองเปลี่ยนแค่ 1 ตัวอักษร — สังเกตว่า Hash เปลี่ยนไปทั้งหมด
            </p>
          </div>
        </div>

        {/* Input box */}
        <div style={{ marginTop: "1rem" }}>
          <input
            type="text"
            value={playgroundInput}
            onChange={(e) => setPlaygroundInput(e.target.value)}
            className="lab5-w-full lab5-rounded-xl lab5-border lab5-font-mono lab5-text-sm lab5-transition-all"
            style={{
              borderColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              outline: "none",
              letterSpacing: "0.025em",
              padding: "0.625rem 0.875rem",
            }}
            placeholder="พิมพ์ข้อความที่ต้องการ Hash..."
          />
        </div>

        {/* Output box */}
        <div
          className="lab5-rounded-xl lab5-border"
          style={{
            backgroundColor: "#faf8ff",
            borderColor: "#ede9fe",
            padding: "0.75rem 0.875rem",
            marginTop: "0.625rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          <p className="lab5-text-xs lab5-font-bold" style={{ color: "#475569", margin: 0 }}>
            SHA-256 ของข้อความนี้
          </p>
          <p
            className="lab5-font-mono lab5-text-xs lab5-break-all"
            style={{ color: "#5850ec", fontWeight: 600, margin: 0, lineHeight: 1.6 }}
          >
            {playgroundHash || "กำลังคำนวณ..."}
          </p>
        </div>

        {/* 3 feature pills */}
        <div
          className="lab5-flex lab5-flex-wrap lab5-items-center"
          style={{ gap: "0.5rem", marginTop: "0.875rem" }}
        >
          {[
            { icon: <Check style={{ width: "0.75rem", height: "0.75rem", color: "#16a979" }} />, label: "✓ ข้อมูลเดิม → Hash เดิมเสมอ" },
            { icon: <Sparkles style={{ width: "0.75rem", height: "0.75rem", color: "#6d4bd8" }} />, label: "แก้แค่นิดเดียว → Hash เปลี่ยนหมด" },
            { icon: <Lock style={{ width: "0.75rem", height: "0.75rem", color: "#64748b" }} />, label: "ดู Hash แล้วย้อนกลับไม่ได้" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="lab5-inline-flex lab5-items-center lab5-rounded-full lab5-border"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                color: "#475569",
                fontSize: "0.6875rem",
                fontWeight: 600,
                padding: "0.3125rem 0.75rem",
                gap: "0.375rem",
              }}
            >
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Section: สร้าง Hash ให้ออร์เดอร์ทั้ง 4 ใบ */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock style={{ width: "1rem", height: "1rem", color: "#475569", flexShrink: 0 }} />
            <p className="lab5-text-xs lab5-font-bold" style={{ color: "#334155", margin: 0 }}>
              ① สร้าง Hash ให้ออร์เดอร์ทั้ง 4 ใบ
            </p>
          </div>
          {!isAllHashed && (
            <button
              type="button"
              onClick={revealAllHashes}
              className="lab5-inline-flex lab5-items-center lab5-rounded-full lab5-border lab5-text-xs lab5-font-semibold lab5-transition-all"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#ddd6fe",
                color: "#6d4bd8",
                cursor: "pointer",
                padding: "0.375rem 0.875rem",
                gap: "0.375rem",
              }}
            >
              <Sparkles style={{ width: "0.75rem", height: "0.75rem" }} />
              <span>✨ สร้างทั้งหมดทีเดียว</span>
            </button>
          )}
        </div>

        {/* 4 Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {orders.map((order, index) => {
            const isHashed = hashedLeaves[index]
            const isUserOrder = order.id === "B"
            return (
              <div
                key={order.id}
                className="lab5-rounded-2xl lab5-border lab5-transition-all"
                style={{
                  borderColor: "#e2e8f0",
                  backgroundColor: "#ffffff",
                  padding: "1rem 1.25rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <p className="lab5-text-sm lab5-font-bold" style={{ color: "#0f172a", margin: 0 }}>
                        {order.label}
                      </p>
                      {isUserOrder && (
                        <span
                          style={{
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            backgroundColor: "#ede9fe",
                            color: "#6d4bd8",
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            lineHeight: 1.6,
                          }}
                        >
                          ของคุณ
                        </span>
                      )}
                    </div>
                    <p
                      className="lab5-text-xs"
                      style={{ color: "#64748b", margin: "3px 0 0 0" }}
                    >
                      รหัสลับ: <span className="lab5-font-mono">{order.value}</span>
                    </p>
                  </div>

                  {!isHashed ? (
                    <button
                      type="button"
                      onClick={() => revealHash(index)}
                      className="lab5-inline-flex lab5-items-center lab5-rounded-full lab5-text-xs lab5-font-bold lab5-text-white lab5-transition-all"
                      style={{
                        padding: "0.5rem 1.25rem",
                        backgroundColor: "#5850ec",
                        boxShadow: "0 2px 8px rgba(88, 80, 236, 0.25)",
                        cursor: "pointer",
                        gap: "0.375rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Sparkles style={{ width: "0.75rem", height: "0.75rem" }} />
                      <span>✨ สร้าง Hash</span>
                    </button>
                  ) : (
                    <div
                      className="lab5-inline-flex lab5-items-center lab5-text-xs lab5-font-semibold"
                      style={{ color: "#16a979", gap: "0.375rem" }}
                    >
                      <Check style={{ width: "1rem", height: "1rem" }} />
                      <span>Hash แล้ว</span>
                    </div>
                  )}
                </div>

                {isHashed && tree && (
                  <div className="lab5-animate-merge-up" style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
                    <HashValue hash={tree.leafHashes[index]} label={`Hash ของ ${order.label} =`} tone="primary" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ปุ่ม "ทำไม?" */}
        <div>
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            className="lab5-inline-flex lab5-items-center lab5-rounded-full lab5-text-xs lab5-font-semibold lab5-transition-all"
            style={{
              backgroundColor: "#f5f3ff",
              color: "#6d4bd8",
              cursor: "pointer",
              padding: "0.375rem 0.875rem",
              gap: "0.375rem",
              border: "1px solid #ede9fe",
            }}
          >
            <HelpCircle style={{ width: "0.75rem", height: "0.75rem" }} />
            <span>? ทำไม?</span>
          </button>
        </div>

        {showHint && (
          <div
            className="lab5-animate-merge-up lab5-rounded-xl lab5-border lab5-text-xs"
            style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0", color: "#475569", lineHeight: 1.6, padding: "0.875rem 1rem" }}
          >
            <strong style={{ color: "#0f172a" }}>คำใบ้:</strong> เราแปลงรหัสลับแต่ละ Order ให้เป็น Hash เพื่อเป็นลายนิ้วมือดิจิทัลที่ผู้ตรวจนำไปคำนวณ Merkle Root ได้ โดยที่ไม่มีใครรู้ข้อมูลจริงข้างใน
          </div>
        )}
      </div>

      {isAllHashed && (
        <FeedbackCard variant="correct" title="ครบทั้ง 4 ใบแล้ว">
          รหัสลับของแต่ละออร์เดอร์ถูกเปลี่ยนเป็น Hash ด้วย SHA-256 แล้ว ตอนนี้เรามี Hash ครบ 4 ค่า Hash เหล่านี้คือ Input ของขั้นต่อไป — ในขั้นถัดไปเราจะจับ Hash ทีละ 2 ตัวมารวมกันเพื่อสร้าง Merkle Tree
        </FeedbackCard>
      )}
    </div>
  )
}

/**
 * ปุ่มสำหรับจับคู่ hash ในขั้นที่ 3
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} props.label ข้อความบนปุ่มก่อนจับคู่
 * @param {boolean} props.isDone จับคู่แล้วหรือยัง
 * @param {Function} props.onClick ฟังก์ชันที่เรียกเมื่อกด
 * @return {JSX.Element} ปุ่มจับคู่
 * @author StealthTrade Team
 */
function PairButton({ label, isDone, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDone}
      className={
        isDone
          ? "lab5-flex lab5-items-center lab5-justify-center lab5-gap-2 lab5-rounded-xl lab5-border-2 lab5-border-success lab5-bg-success-soft lab5-px-4 lab5-py-3 lab5-text-sm lab5-font-bold lab5-text-success"
          : "lab5-flex lab5-items-center lab5-justify-center lab5-gap-2 lab5-rounded-xl lab5-border-2 lab5-border-primary lab5-bg-surface lab5-px-4 lab5-py-3 lab5-text-sm lab5-font-bold lab5-text-primary lab5-transition-all lab5-hover-primary-soft"
      }
    >
      <Link2 className="lab5-size-4" />
      {isDone ? "รวมแล้ว" : label}
    </button>
  )
}

/**
 * ขั้นที่ 3: คุยกับ Verifier เพื่อพิสูจน์ว่า ออร์เดอร์ B อยู่ในชุดข้อมูลจริง
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 3
 * @author StealthTrade Team
 */
function Step3BuildTree() {
  const {
    tree,
    selectedLeaf,
    selectLeaf,
    foundSiblings,
    findSibling,
  } = useLab05()

  const [wrongNodeId, setWrongNodeId] = useState(null)
  const [flash, setFlash] = useState("idle")
  const [showWhyHint, setShowWhyHint] = useState(false)

  // ตรวจสอบให้แน่ใจว่าเป้าหมายคือ leaf-1 (ออร์เดอร์ B)
  useEffect(() => {
    if (selectedLeaf !== 1) {
      selectLeaf(1)
    }
  }, [selectedLeaf, selectLeaf])

  const isLeaf0Found = foundSiblings.includes("leaf-0")
  const isMid1Found = foundSiblings.includes("mid-1")
  const isAllFound = isLeaf0Found && isMid1Found

  const clickableNodeIds = useMemo(() => {
    if (isAllFound) return []
    return ["leaf-0", "leaf-2", "leaf-3", "mid-0", "mid-1"]
  }, [isAllFound])

  const handleClick = (nodeId) => {
    if (isAllFound) return
    const result = findSibling(nodeId)
    if (result === "wrong") {
      setWrongNodeId(nodeId)
      setFlash("wrong")
      setTimeout(() => setWrongNodeId(null), 700)
    } else if (result === "correct") {
      setFlash("correct")
    }
  }

  // เส้นเชื่อม root -> mid-0 -> leaf-1 ไฮไลต์สีม่วง (active)
  const nodeStateMap = {
    "leaf-1": "target",
    "mid-0": "path",
    root: "path",
    "leaf-0": isLeaf0Found ? "path" : "neutral",
    "leaf-2": "neutral",
    "leaf-3": "neutral",
    "mid-1": isMid1Found ? "path" : "neutral",
  }
  if (wrongNodeId) nodeStateMap[wrongNodeId] = "error"

  const rootHash = tree?.root || ""
  const leafHashB = tree?.leafHashes?.[1] || "06e8f51390"
  const leafHashA = tree?.leafHashes?.[0] || "9b68202511"
  const midHashCD = tree?.midHashes?.[1] || "bc04ed1144"

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="สร้างและตรวจ PROOF"
        title="คุยกับ Verifier เพื่อพิสูจน์ว่า ออร์เดอร์ B อยู่ในชุดข้อมูลจริง"
        description="บอกคำอ้าง → ส่งข้อมูลของคุณ → ส่ง Hash ข้าง ๆ (Sibling Hash) โดยคลิกบนต้นไม้ แล้ว Verifier จะคำนวณย้อนกลับไปหา Root เอง"
      />

      {/* Interactive Merkle Tree Box */}
      <div
        className="lab5-rounded-2xl lab5-border"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          padding: "1.25rem 1.25rem 1rem",
        }}
      >
        <MerkleTreeDiagram
          nodeStateMap={nodeStateMap}
          clickableNodeIds={clickableNodeIds}
          onNodeClick={handleClick}
          hashNodeIds={["leaf-0", "leaf-1", "leaf-2", "leaf-3", "mid-0", "mid-1", "root"]}
        />

        {/* แถบสถานะด้านล่างของ Merkle Tree Box */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "0.875rem",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#f5f3ff",
              borderRadius: "9999px",
              padding: "0.25rem 0.875rem 0.25rem 0.375rem",
              border: "1px solid #ede9fe",
            }}
          >
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#5850ec",
                color: "#ffffff",
                fontSize: "0.6875rem",
                fontWeight: 700,
                padding: "0.2rem 0.625rem",
                borderRadius: "9999px",
              }}
            >
              {foundSiblings.length}/2 Sibling Hash
            </span>
            <span style={{ fontSize: "0.75rem", color: "#6d4bd8", fontWeight: 500 }}>
              กรอบม่วงอ่อน = ใบของเรา · คลิกที่ไหนเพื่อส่ง
            </span>
          </div>
        </div>
      </div>

      {/* แจ้งเตือนเมื่อคลิกผิด */}
      {flash === "wrong" && !isAllFound && (
        <FeedbackCard variant="incorrect" title="ลองอีกครั้ง">
          โหนดนี้ไม่ใช่ Sibling Hash ที่ Verifier ต้องการ! ลองดูตำแหน่งของ ออร์เดอร์ B แล้วหา Hash ที่อยู่ข้าง ๆ เพื่อรวมขึ้นไปหา Root
        </FeedbackCard>
      )}

      {/* กล่องแชทโต้ตอบระหว่าง คุณ (Prover) กับ ผู้ตรวจ (Verifier) */}
      <div
        className="lab5-rounded-2xl lab5-border"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          overflow: "hidden",
        }}
      >
        {/* Header สองฝั่ง */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.875rem 1.25rem",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          {/* คุณ / Prover */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "9999px",
                backgroundColor: "#f5f3ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User style={{ width: "1rem", height: "1rem", color: "#7c3aed" }} />
            </div>
            <div>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#7c3aed" }}>คุณ</span>
              <span style={{ display: "block", fontSize: "0.6875rem", color: "#94a3b8", lineHeight: 1 }}>Prover</span>
            </div>
          </div>

          {/* ผู้ตรวจ / Verifier */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#16a34a" }}>ผู้ตรวจ</span>
              <span style={{ display: "block", fontSize: "0.6875rem", color: "#94a3b8", lineHeight: 1 }}>Verifier</span>
            </div>
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "9999px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck style={{ width: "1.125rem", height: "1.125rem", color: "#16a34a" }} />
            </div>
          </div>
        </div>

        {/* รายการข้อความแชท */}
        <div
          style={{
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* ข้อความ 1 (Prover - ซ้าย) */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", alignSelf: "flex-start", maxWidth: "88%" }}>
            <div
              style={{
                backgroundColor: "#f5f3ff",
                border: "1px solid #ede9fe",
                borderRadius: "1rem",
                padding: "0.875rem 1rem",
                flex: 1,
              }}
            >
              <p style={{ fontSize: "0.6875rem", color: "#8b5cf6", fontWeight: 600, margin: "0 0 0.25rem" }}>
                คุณ → Verifier
              </p>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.5rem" }}>
                ออร์เดอร์ B ของฉันอยู่ใต้ Root นี้
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "0.5rem",
                  padding: "0.25rem 0.625rem",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#059669",
                }}
              >
                <span>Root {rootHash ? TruncateHash(rootHash, 6) : "592ed5ae..."}</span>
              </div>
            </div>
            <div
              style={{
                width: "1.75rem",
                height: "1.75rem",
                borderRadius: "9999px",
                backgroundColor: "#7c3aed",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
            </div>
          </div>

          {/* ข้อความ 2 (Verifier - ขวา) */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", alignSelf: "flex-end", maxWidth: "88%" }}>
            <div
              style={{
                width: "1.75rem",
                height: "1.75rem",
                borderRadius: "9999px",
                backgroundColor: "#10b981",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
            </div>
            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "1rem",
                padding: "0.875rem 1rem",
                flex: 1,
              }}
            >
              <p style={{ fontSize: "0.6875rem", color: "#16a34a", fontWeight: 600, margin: "0 0 0.25rem" }}>
                Verifier → คุณ
              </p>
              <p style={{ fontSize: "0.8125rem", color: "#1e293b", margin: 0, lineHeight: 1.5 }}>
                ผมมี Root นี้อยู่แล้ว (เว็บเทรดประกาศไว้) — พิสูจน์มาสิครับ คุณจะส่งอะไรให้ผมเริ่มคำนวณ?
              </p>
            </div>
          </div>

          {/* ข้อความ 3 (Prover - ซ้าย) */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", alignSelf: "flex-start", maxWidth: "88%" }}>
            <div
              style={{
                backgroundColor: "#f5f3ff",
                border: "1px solid #ede9fe",
                borderRadius: "1rem",
                padding: "0.875rem 1rem",
                flex: 1,
              }}
            >
              <p style={{ fontSize: "0.6875rem", color: "#8b5cf6", fontWeight: 600, margin: "0 0 0.25rem" }}>
                คุณ → Verifier
              </p>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.5rem" }}>
                รหัสลับของออร์เดอร์ B
              </p>
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: "#5850ec",
                  color: "#ffffff",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                secret-B-q92m
              </div>
            </div>
            <div
              style={{
                width: "1.75rem",
                height: "1.75rem",
                borderRadius: "9999px",
                backgroundColor: "#7c3aed",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
            </div>
          </div>

          {/* ข้อความ 4 (Verifier - ขวา) */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", alignSelf: "flex-end", maxWidth: "88%" }}>
            <div
              style={{
                width: "1.75rem",
                height: "1.75rem",
                borderRadius: "9999px",
                backgroundColor: "#10b981",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
            </div>
            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "1rem",
                padding: "0.875rem 1rem",
                flex: 1,
              }}
            >
              <p style={{ fontSize: "0.6875rem", color: "#16a34a", fontWeight: 600, margin: "0 0 0.25rem" }}>
                Verifier → คุณ
              </p>
              <p style={{ fontSize: "0.8125rem", color: "#1e293b", margin: 0, lineHeight: 1.5 }}>
                ได้แล้ว ผม Hash เองได้ H(B) = {TruncateHash(leafHashB, 8)} แต่ยังขึ้นไปไม่ถึง Root ครับ — ถ้าจะสร้าง H(A+B) ผมต้องรู้ Hash ตัวไหนเพิ่ม? (คลิกโหนดบนต้นไม้เพื่อส่ง)
              </p>
            </div>
          </div>

          {/* ข้อความ 5 & 6 (เมื่อส่ง Sibling 1: H(A)) */}
          {isLeaf0Found && (
            <>
              <div className="lab5-animate-merge-up" style={{ display: "flex", alignItems: "center", gap: "0.75rem", alignSelf: "flex-start", maxWidth: "88%" }}>
                <div style={{ backgroundColor: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: "1rem", padding: "0.875rem 1rem", flex: 1 }}>
                  <p style={{ fontSize: "0.6875rem", color: "#8b5cf6", fontWeight: 600, margin: "0 0 0.25rem" }}>คุณ → Verifier</p>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.5rem" }}>ส่ง H(A) (อยู่ฝั่งซ้าย)</p>
                  <div style={{ display: "inline-block", backgroundColor: "#f5f3ff", border: "1px solid #ede9fe", color: "#6d4bd8", borderRadius: "0.5rem", padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 600 }}>
                    H(A) {TruncateHash(leafHashA, 8)}
                  </div>
                </div>
                <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "9999px", backgroundColor: "#7c3aed", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
                </div>
              </div>

              <div className="lab5-animate-merge-up" style={{ display: "flex", alignItems: "center", gap: "0.75rem", alignSelf: "flex-end", maxWidth: "88%" }}>
                <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "9999px", backgroundColor: "#10b981", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
                </div>
                <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "1rem", padding: "0.875rem 1rem", flex: 1 }}>
                  <p style={{ fontSize: "0.6875rem", color: "#16a34a", fontWeight: 600, margin: "0 0 0.25rem" }}>Verifier → คุณ</p>
                  <p style={{ fontSize: "0.8125rem", color: "#1e293b", margin: 0, lineHeight: 1.5 }}>
                    ได้ H(A+B) = {TruncateHash(tree?.midHashes?.[0] || "f619facc", 8)} แล้ว แต่ยังขาดอีกขั้นครับ — ต้องใช้ Hash ตัวไหนต่อเพื่อไปถึง Root?
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ข้อความ 7 & 8 (เมื่อส่ง Sibling 2: H(C+D)) */}
          {isMid1Found && (
            <>
              <div className="lab5-animate-merge-up" style={{ display: "flex", alignItems: "center", gap: "0.75rem", alignSelf: "flex-start", maxWidth: "88%" }}>
                <div style={{ backgroundColor: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: "1rem", padding: "0.875rem 1rem", flex: 1 }}>
                  <p style={{ fontSize: "0.6875rem", color: "#8b5cf6", fontWeight: 600, margin: "0 0 0.25rem" }}>คุณ → Verifier</p>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.5rem" }}>ส่ง H(C+D) (อยู่ฝั่งขวา)</p>
                  <div style={{ display: "inline-block", backgroundColor: "#f5f3ff", border: "1px solid #ede9fe", color: "#6d4bd8", borderRadius: "0.5rem", padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 600 }}>
                    H(C+D) {TruncateHash(midHashCD, 8)}
                  </div>
                </div>
                <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "9999px", backgroundColor: "#7c3aed", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
                </div>
              </div>

              {/* ข้อความ 8: Verifier ตรวจเอง (กล่องกรอบประสีเขียว) */}
              <div
                className="lab5-animate-merge-up"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  alignSelf: "flex-end",
                  maxWidth: "92%",
                }}
              >
                <div
                  style={{
                    width: "1.75rem",
                    height: "1.75rem",
                    borderRadius: "9999px",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck style={{ width: "1rem", height: "1rem" }} />
                </div>
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px dashed #86efac",
                    borderRadius: "1rem",
                    padding: "0.875rem 1rem",
                    flex: 1,
                  }}
                >
                  <p style={{ fontSize: "0.6875rem", color: "#16a34a", fontWeight: 700, margin: "0 0 0.25rem" }}>
                    Verifier ตรวจเอง
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "#1e293b", margin: "0 0 0.5rem", lineHeight: 1.4 }}>
                    ครบแล้ว ผมคำนวณย้อนกลับเอง — ได้ Root ตรงกันที่ประกาศไว้ ✅ ยอมรับ
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "0.375rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: "#ede9fe",
                        color: "#6d4bd8",
                        padding: "0.2rem 0.625rem",
                        borderRadius: "0.5rem",
                        fontFamily: "monospace",
                      }}
                    >
                      H(A)
                    </span>
                    <span style={{ color: "#64748b" }}>+</span>
                    <span
                      style={{
                        backgroundColor: "#ede9fe",
                        color: "#6d4bd8",
                        padding: "0.2rem 0.625rem",
                        borderRadius: "0.5rem",
                        fontFamily: "monospace",
                      }}
                    >
                      H(B)
                    </span>
                    <span style={{ color: "#64748b" }}>→</span>
                    <span
                      style={{
                        backgroundColor: "#d1fae5",
                        color: "#059669",
                        padding: "0.2rem 0.625rem",
                        borderRadius: "0.5rem",
                        fontFamily: "monospace",
                      }}
                    >
                      H(A+B)
                    </span>
                    <span style={{ color: "#64748b" }}>+</span>
                    <span
                      style={{
                        backgroundColor: "#ede9fe",
                        color: "#6d4bd8",
                        padding: "0.2rem 0.625rem",
                        borderRadius: "0.5rem",
                        fontFamily: "monospace",
                      }}
                    >
                      H(C+D)
                    </span>
                    <span style={{ color: "#64748b" }}>→</span>
                    <span
                      style={{
                        backgroundColor: "#d1fae5",
                        border: "1px solid #a7f3d0",
                        color: "#059669",
                        padding: "0.2rem 0.625rem",
                        borderRadius: "0.5rem",
                        fontFamily: "monospace",
                        fontWeight: 700,
                      }}
                    >
                      Root {rootHash ? TruncateHash(rootHash, 6) : "592ed5ae"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* แถบคำแนะนำด้านล่าง */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            padding: "0.75rem 1.25rem",
            fontSize: "0.75rem",
            color: "#6d4bd8",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <ArrowDown style={{ width: "0.875rem", height: "0.875rem", color: "#6d4bd8" }} />
          <span>
            {!isLeaf0Found && "คลิกโหนดบนต้นไม้ด้านบน เพื่อส่ง Hash ข้าง ๆ (Sibling Hash) ให้ Verifier · ส่งแล้ว 0/2"}
            {isLeaf0Found && !isMid1Found && "คลิกโหนดบนต้นไม้ด้านบน เพื่อส่ง Hash ข้าง ๆ (Sibling Hash) ให้ Verifier · ส่งแล้ว 1/2"}
            {isAllFound && "ส่งครบแล้ว 2/2 · Verifier ยืนยันความถูกต้องเรียบร้อยแล้ว"}
          </span>
        </div>

        {/* แถบสถานะ Footer: สิ่งที่ Verifier ได้รับ */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            padding: "0.75rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Eye style={{ width: "1rem", height: "1rem", color: "#64748b" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1e293b" }}>
              สิ่งที่ Verifier ได้รับ
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#059669",
                fontSize: "0.6875rem",
                fontWeight: 600,
                borderRadius: "9999px",
                padding: "0.2rem 0.625rem",
              }}
            >
              <Check style={{ width: "0.75rem", height: "0.75rem" }} />
              Root
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#059669",
                fontSize: "0.6875rem",
                fontWeight: 600,
                borderRadius: "9999px",
                padding: "0.2rem 0.625rem",
              }}
            >
              <Check style={{ width: "0.75rem", height: "0.75rem" }} />
              รหัสลับของออร์เดอร์ B
            </span>
            {isLeaf0Found && (
              <span
                className="lab5-animate-merge-up"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#059669",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  borderRadius: "9999px",
                  padding: "0.2rem 0.625rem",
                }}
              >
                <Check style={{ width: "0.75rem", height: "0.75rem" }} />
                H(A) + ฝั่งซ้าย
              </span>
            )}
            {isMid1Found && (
              <span
                className="lab5-animate-merge-up"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#059669",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  borderRadius: "9999px",
                  padding: "0.2rem 0.625rem",
                }}
              >
                <Check style={{ width: "0.75rem", height: "0.75rem" }} />
                H(C+D) + ฝั่งขวา
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ส่วนสรุปผลลัพธ์ (แสดงเมื่อคลิกส่ง Sibling ครบแล้ว) */}
      {isAllFound && (
        <>
          {/* Card 1: เส้นทางตรวจสอบสิทธิ์ (Authentication Path) ที่คุณส่งไป */}
          <div
            className="lab5-animate-merge-up lab5-rounded-2xl lab5-border"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#e2e8f0",
              padding: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
              <Key style={{ width: "1.125rem", height: "1.125rem", color: "#7c3aed" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
                เส้นทางตรวจสอบสิทธิ์ (Authentication Path) ที่คุณส่งไป
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {/* รายการที่ 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <span
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    borderRadius: "9999px",
                    backgroundColor: "#6d4bd8",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  1
                </span>
                <div
                  style={{
                    backgroundColor: "#f5f3ff",
                    border: "1px solid #ede9fe",
                    borderRadius: "0.5rem",
                    padding: "0.375rem 0.875rem",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    fontWeight: 600,
                    color: "#6d4bd8",
                  }}
                >
                  H(A) = {TruncateHash(leafHashA, 8)}
                </div>
                <span
                  style={{
                    backgroundColor: "#ede9fe",
                    color: "#6d4bd8",
                    borderRadius: "9999px",
                    padding: "0.2rem 0.625rem",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                  }}
                >
                  อยู่ฝั่งซ้าย
                </span>
              </div>

              {/* รายการที่ 2 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <span
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    borderRadius: "9999px",
                    backgroundColor: "#6d4bd8",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  2
                </span>
                <div
                  style={{
                    backgroundColor: "#f5f3ff",
                    border: "1px solid #ede9fe",
                    borderRadius: "0.5rem",
                    padding: "0.375rem 0.875rem",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    fontWeight: 600,
                    color: "#6d4bd8",
                  }}
                >
                  H(C+D) = {TruncateHash(midHashCD, 8)}
                </div>
                <span
                  style={{
                    backgroundColor: "#ede9fe",
                    color: "#6d4bd8",
                    borderRadius: "9999px",
                    padding: "0.2rem 0.625rem",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                  }}
                >
                  อยู่ฝั่งขวา
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Two-column Root Comparison Cards */}
          <div
            className="lab5-animate-merge-up"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {/* ซ้าย: Root ที่เว็บเทรดประกาศไว้ */}
            <div
              className="lab5-rounded-2xl lab5-border"
              style={{
                backgroundColor: "#f0fdf4",
                borderColor: "#bbf7d0",
                padding: "1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck style={{ width: "1rem", height: "1rem", color: "#16a34a" }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#065f46" }}>
                  Root ที่เว็บเทรดประกาศไว้
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "9999px",
                  padding: "0.375rem 0.875rem",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#047857",
                }}
              >
                {rootHash ? TruncateHash(rootHash, 8) : "592ed5ae..."}
              </div>
            </div>

            {/* ขวา: Root ที่ Verifier คำนวณจากหลักฐาน */}
            <div
              className="lab5-rounded-2xl lab5-border"
              style={{
                backgroundColor: "#f0fdf4",
                borderColor: "#bbf7d0",
                padding: "1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Zap style={{ width: "1rem", height: "1rem", color: "#16a34a" }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#065f46" }}>
                  Root ที่ Verifier คำนวณจากหลักฐาน
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "9999px",
                  padding: "0.375rem 0.875rem",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#047857",
                }}
              >
                {rootHash ? TruncateHash(rootHash, 8) : "592ed5ae..."}
              </div>
            </div>
          </div>

          {/* Card 3: Success Feedback Card: ตรวจสอบผ่าน: Root ตรงกัน */}
          <div
            className="lab5-animate-merge-up lab5-rounded-2xl lab5-border"
            style={{
              backgroundColor: "#ecfdf5",
              borderColor: "#a7f3d0",
              padding: "1.125rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 style={{ width: "1.125rem", height: "1.125rem", color: "#16a34a" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#047857" }}>
                ตรวจสอบผ่าน: Root ตรงกัน
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#065f46", margin: 0, lineHeight: 1.5 }}>
              ยืนยันได้ว่า <strong>ออร์เดอร์ B</strong> อยู่ในชุดข้อมูลจริง โดย Verifier ไม่ต้องเห็นรหัสลับของออร์เดอร์อีก 3 ใบเลย
            </p>
            <p style={{ fontSize: "0.75rem", color: "#047857", margin: 0, opacity: 0.85 }}>
              ใช้ Hash แค่ 2 ตัวแทนการส่งข้อมูลทั้ง 4 ใบ — ถ้ามี 1 ล้านออร์เดอร์ ก็ใช้แค่ประมาณ 20 ตัวเท่านั้น
            </p>
          </div>

          {/* Card 4: ปุ่ม ? ทำไม? */}
          <div style={{ marginTop: "0.25rem" }}>
            <button
              type="button"
              onClick={() => setShowWhyHint((previous) => !previous)}
              className="lab5-inline-flex lab5-items-center lab5-rounded-full lab5-text-xs lab5-font-semibold lab5-transition-colors"
              style={{
                backgroundColor: "#f5f3ff",
                color: "#6d4bd8",
                padding: "0.375rem 0.875rem",
                gap: "0.375rem",
                border: "1px solid #ede9fe",
                cursor: "pointer",
              }}
            >
              <HelpCircle style={{ width: "0.75rem", height: "0.75rem" }} />
              <span>? ทำไม?</span>
            </button>

            {showWhyHint && (
              <div
                className="lab5-animate-merge-up lab5-rounded-xl lab5-border lab5-text-xs"
                style={{
                  backgroundColor: "#f8fafc",
                  borderColor: "#e2e8f0",
                  color: "#475569",
                  lineHeight: 1.6,
                  padding: "0.875rem 1rem",
                  marginTop: "0.5rem",
                }}
              >
                <strong style={{ color: "#0f172a" }}>ทำไม Verifier ถึงเชื่อ?</strong> เพราะ Merkle Root คือผลลัพธ์ของการ Hash ต่อเนื่องมาจากข้อมูลทั้งหมด การเปลี่ยนแม้แต่ตัวอักษรเดียวจะทำให้ Root เปลี่ยนไปอย่างสิ้นเชิง เมื่อ Verifier นำ H(B) + Sibling Hash มารวมแล้วได้ Root ตรงกับที่เว็บเทรดประกาศไว้ จึงพิสูจน์ได้ว่าออร์เดอร์ B อยู่ในระบบจริง 100% โดยไม่ต้องเปิดเผยข้อมูลของออร์เดอร์อื่นเลย
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * ขั้นที่ 4: เลือก Order ที่ต้องการพิสูจน์
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 4
 * @author StealthTrade Team
 */
function Step4Tamper() {
  const { tree, selectedLeaf, selectLeaf, tamperedProof, isTamperMode, toggleTamper } = useLab05()
  const [showWhy, setShowWhy] = useState(false)

  // เลือก Order B (index 1) ตามบทเรียน
  useEffect(() => {
    if (selectedLeaf !== 1) {
      selectLeaf(1)
    }
  }, [selectedLeaf, selectLeaf])

  if (!tree) return null

  const isMatching = !isTamperMode

  const nodeStateMap = isMatching
    ? {
      root: "success",
      "mid-0": "success",
      "leaf-1": "target",
    }
    : {
      root: "error",
      "mid-0": "error",
      "leaf-1": "error",
    }

  const customHashes = !isMatching
    ? {
      "leaf-1": tamperedProof?.leafHash,
      "mid-0": tamperedProof?.steps?.[0],
      root: tamperedProof?.root,
    }
    : {}

  const allNodeIds = ["root", "mid-0", "mid-1", "leaf-0", "leaf-1", "leaf-2", "leaf-3"]

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="ทดสอบการแก้ข้อมูล"
        title="ถ้าข้อมูลคำสั่งซื้อถูกเปลี่ยน จะเกิดอะไรขึ้น?"
        description="ลองแก้ข้อมูลของออร์เดอร์ B แล้วใช้ Authentication Path ชุดเดิมตรวจอีกครั้ง"
      />

      {/* Switch Toggle Card */}
      <div
        className="lab5-flex lab5-items-center lab5-justify-between lab5-gap-4 lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4"
        style={{ borderRadius: "1rem" }}
      >
        <div>
          <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">จำลองการแก้ไขข้อมูลของออร์เดอร์ B</p>
          <p className="lab5-text-xs lab5-text-muted-foreground lab5-mt-0.5">
            ระบบจะคำนวณ Leaf Hash และ Root ใหม่จากข้อมูลจริงทันที
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isTamperMode}
          onClick={toggleTamper}
          className={JoinClassNames("lab5-switch", isTamperMode && "lab5-switch--on")}
        >
          <span className="lab5-switch-knob" />
        </button>
      </div>

      {/* Result Status Banner */}
      {isMatching ? (
        <div
          className="lab5-animate-merge-up lab5-flex lab5-items-start lab5-gap-3"
          style={{
            backgroundColor: "#ecfdf5",
            border: "1.5px solid #a7f3d0",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
          }}
        >
          <CheckCircle2 className="lab5-size-5 lab5-shrink-0" style={{ color: "#16a34a", marginTop: "2px" }} />
          <div className="lab5-space-y-0.5">
            <p className="lab5-text-sm lab5-font-bold" style={{ color: "#065f46" }}>
              ตรวจสอบผ่าน: ข้อมูลถูกต้อง
            </p>
            <p className="lab5-text-xs" style={{ color: "#047857" }}>
              ข้อมูลเดิมยังให้ Root ตรงกับค่าที่ประกาศไว้
            </p>
          </div>
        </div>
      ) : (
        <div
          className="lab5-animate-merge-up lab5-flex lab5-items-start lab5-gap-3"
          style={{
            backgroundColor: "#fff1f2",
            border: "1.5px solid #fecdd3",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
          }}
        >
          <AlertTriangle className="lab5-size-5 lab5-shrink-0" style={{ color: "#ef4444", marginTop: "2px" }} />
          <div className="lab5-space-y-0.5">
            <p className="lab5-text-sm lab5-font-bold" style={{ color: "#b91c1c" }}>
              ปฏิเสธ: ตรวจพบการแก้ไขข้อมูล
            </p>
            <p className="lab5-text-xs" style={{ color: "#991b1b" }}>
              ค่า Root ไม่ตรงกัน เพราะข้อมูลถูกแก้ไขเพียงตัวอักษรเดียว ทำให้ Root เปลี่ยนไปทั้งหมด Verifier ปฏิเสธหลักฐานทันที
            </p>
          </div>
        </div>
      )}

      {/* Merkle Tree Diagram Card */}
      <div
        className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-6"
        style={{ borderRadius: "1.25rem" }}
      >
        <MerkleTreeDiagram
          nodeStateMap={nodeStateMap}
          hashNodeIds={allNodeIds}
          customHashes={customHashes}
        />
      </div>

      {/* Root Comparison Boxes */}
      <div className="lab5-grid lab5-grid-cols-1 lab5-sm:grid-cols-2 lab5-gap-4">
        {/* Left Box: Root ที่ประกาศไว้ */}
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1.5px solid #bbf7d0",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
          }}
        >
          <div className="lab5-flex lab5-items-center lab5-gap-2">
            <ShieldCheck className="lab5-size-4" style={{ color: "#16a34a" }} />
            <span className="lab5-text-xs lab5-font-semibold" style={{ color: "#16a34a" }}>
              Root ที่ประกาศไว้
            </span>
          </div>
          <div
            className="lab5-mt-3 lab5-w-full"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #86efac",
              borderRadius: "9999px",
              padding: "0.45rem 1rem",
            }}
          >
            <span
              className="lab5-font-mono lab5-text-xs lab5-font-medium"
              style={{ color: "#15803d" }}
            >
              {tree.root ? TruncateHash(tree.root, 8) : "592ed5ae..."}
            </span>
          </div>
        </div>

        {/* Right Box: Root ที่คำนวณได้ */}
        <div
          style={{
            backgroundColor: isMatching ? "#f0fdf4" : "#fff1f2",
            border: isMatching ? "1.5px solid #bbf7d0" : "1.5px solid #fecdd3",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
          }}
        >
          <div className="lab5-flex lab5-items-center lab5-gap-2">
            <Zap className="lab5-size-4" style={{ color: isMatching ? "#16a34a" : "#ef4444" }} />
            <span
              className="lab5-text-xs lab5-font-semibold"
              style={{ color: isMatching ? "#16a34a" : "#b91c1c" }}
            >
              Root ที่คำนวณได้
            </span>
          </div>
          <div
            className="lab5-mt-3 lab5-w-full"
            style={{
              backgroundColor: "#ffffff",
              border: isMatching ? "1px solid #86efac" : "1px solid #fca5a5",
              borderRadius: "9999px",
              padding: "0.45rem 1rem",
            }}
          >
            <span
              className="lab5-font-mono lab5-text-xs lab5-font-medium"
              style={{ color: isMatching ? "#15803d" : "#b91c1c" }}
            >
              {isMatching
                ? tree.root
                  ? TruncateHash(tree.root, 8)
                  : "592ed5ae..."
                : tamperedProof?.root
                  ? TruncateHash(tamperedProof.root, 8)
                  : "e8910b4c..."}
            </span>
          </div>
        </div>
      </div>

      {/* Button ? ทำไม? */}
      <div>
        <button
          type="button"
          onClick={() => setShowWhy((previous) => !previous)}
          className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-border lab5-px-3.5 lab5-py-1.5 lab5-text-xs lab5-font-semibold lab5-transition-colors"
          style={{
            backgroundColor: "#f5f3ff",
            borderColor: "#ddd6fe",
            color: "#7c3aed",
          }}
        >
          <HelpCircle className="lab5-size-4" />
          <span>ทำไม?</span>
        </button>

        {showWhy && (
          <div
            className="lab5-animate-merge-up lab5-mt-3 lab5-rounded-2xl lab5-border lab5-p-4.5 lab5-space-y-2.5"
            style={{
              backgroundColor: "#f8fafc",
              borderColor: "#e2e8f0",
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
            }}
          >
            <p className="lab5-text-xs lab5-font-bold" style={{ color: "#6d28d9" }}>
              💡 ปรากฏการณ์ Avalanche Effect (ผลกระทบแบบหิมะถล่ม)
            </p>
            <p className="lab5-text-xs lab5-leading-relaxed lab5-text-muted-foreground">
              ในฟังก์ชันแฮชทางวิทยาการรหัสลับ (Cryptographic Hash Function เช่น SHA-256) แม้จะเปลี่ยนข้อมูลนำเข้าเพียงบิตเดียว หรือตัวอักษรเดียว (เช่น{" "}
              <code className="lab5-font-mono lab5-text-foreground">secret-B-q92m</code> →{" "}
              <code className="lab5-font-mono lab5-text-foreground">secret-B-q93n</code>) ผลลัพธ์ของ Leaf Hash จะเปลี่ยนไปอย่างสิ้นเชิงแบบสุ่ม
            </p>
            <p className="lab5-text-xs lab5-leading-relaxed lab5-text-muted-foreground">
              และเนื่องจาก Merkle Tree สร้างขึ้นจากการนำ Hash คู่ล่างมาต่อกันแล้วแฮชขึ้นไปเรื่อยๆ เมื่อ Leaf Hash ของออร์เดอร์ B เปลี่ยน จึงส่งผลให้ <strong className="lab5-text-foreground">H(A+B)</strong> และ <strong className="lab5-text-foreground">ROOT</strong> เปลี่ยนตามไปด้วย
            </p>
            <p className="lab5-text-xs lab5-leading-relaxed" style={{ color: "#16a34a" }}>
              ✨ <strong>ผลลัพธ์:</strong> Verifier ตรวจพบได้ทันทีว่าค่า Root ที่คำนวณใหม่ไม่ตรงกับค่า Root ที่บันทึกไว้ และปฏิเสธการยืนยันทันที โดยที่ Verifier ไม่จำเป็นต้องรู้เลยว่าข้อมูลของออร์เดอร์อื่นๆ คืออะไร!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ขั้นที่ 5: Merkle Proof ยังเผยอะไร
 * ทบทวนบทสนทนาการพิสูจน์เพื่อแสดงให้เห็นข้อจำกัดของ Merkle Proof (ความเป็นส่วนตัว)
 *
 * @return {JSX.Element|null} คอมโพเนนต์ขั้นที่ 5
 * @author StealthTrade Team
 */
function Step5MerkleExposed() {
  const { tree, markComplete } = useLab05()
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showWhy, setShowWhy] = useState(false)

  const handleSelectAnswer = (ans) => {
    setSelectedAnswer(ans)
    if (ans === "know") {
      if (typeof markComplete === "function") {
        markComplete(5)
      }
    }
  }

  const rootHash = tree?.root ? TruncateHash(tree.root, 8) : "592ed5ae.."
  const haHash = tree?.leafHashes?.[0] ? TruncateHash(tree.leafHashes[0], 8) : "966a2cef.."
  const hcdHash = tree?.midHashes?.[1] ? TruncateHash(tree.midHashes[1], 8) : "bc6a6e07.."

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="MERKLE PROOF ยังเผยอะไร"
        title="Verifier เห็นอะไรบ้างในบทสนทนา?"
        description="อ่านทุกข้อความที่ข้ามเส้นไปฝั่ง Verifier"
      />

      {/* Chat Container Card */}
      <div
        className="lab5-bg-surface lab5-shadow-sm"
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "1rem",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Header Bar */}
        <div
          className="lab5-flex lab5-items-center lab5-justify-between lab5-px-6 lab5-py-4"
          style={{
            borderBottom: "1px solid #f1f5f9",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Prover side (Left) */}
          <div className="lab5-flex lab5-items-center lab5-gap-2.5">
            <div
              className="lab5-flex lab5-size-10 lab5-items-center lab5-justify-center lab5-rounded-full"
              style={{ backgroundColor: "#f5f3ff", border: "1px solid #ede9fe" }}
            >
              <User className="lab5-size-5" style={{ color: "#7c3aed" }} />
            </div>
            <div>
              <p className="lab5-text-sm lab5-font-bold" style={{ color: "#7c3aed", margin: 0 }}>
                คุณ
              </p>
              <p className="lab5-text-xs lab5-font-medium" style={{ color: "#64748b", margin: 0 }}>
                Prover
              </p>
            </div>
          </div>

          {/* Verifier side (Right) */}
          <div className="lab5-flex lab5-items-center lab5-gap-2.5">
            <div className="lab5-text-right">
              <p className="lab5-text-sm lab5-font-bold" style={{ color: "#059669", margin: 0 }}>
                ผู้ตรวจ
              </p>
              <p className="lab5-text-xs lab5-font-medium" style={{ color: "#10b981", margin: 0 }}>
                Verifier
              </p>
            </div>
            <div
              className="lab5-flex lab5-size-10 lab5-items-center lab5-justify-center lab5-rounded-full"
              style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0" }}
            >
              <Shield className="lab5-size-5" style={{ color: "#059669" }} />
            </div>
          </div>
        </div>

        {/* Chat Messages Body (2-Column Grid) */}
        <div className="lab5-space-y-4 lab5-p-6" style={{ backgroundColor: "#ffffff" }}>
          {/* Row 1: Prover message (Left) */}
          <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3.5 lab5-items-center">
            <div className="lab5-flex lab5-items-center lab5-gap-2.5">
              <div
                className="lab5-flex-1 lab5-rounded-2xl lab5-p-4"
                style={{
                  backgroundColor: "#f5f3ff",
                  border: "1px solid #ede9fe",
                }}
              >
                <p className="lab5-text-xs lab5-font-medium" style={{ color: "#7c3aed", margin: 0 }}>
                  คุณ → Verifier
                </p>
                <p className="lab5-mt-1 lab5-text-sm lab5-font-semibold lab5-text-foreground" style={{ margin: "0.25rem 0 0 0" }}>
                  ออร์เดอร์ B ของฉันอยู่ใต้ Root นี้
                </p>
                <div
                  className="lab5-mt-2.5 lab5-inline-flex lab5-items-center lab5-rounded-full lab5-px-3 lab5-py-0.5"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #86efac",
                  }}
                >
                  <span className="lab5-font-mono lab5-text-xs lab5-font-medium" style={{ color: "#15803d" }}>
                    Root {rootHash}
                  </span>
                </div>
              </div>
              <div
                className="lab5-flex lab5-size-8 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full lab5-text-white lab5-shadow-sm"
                style={{ backgroundColor: "#7c3aed" }}
              >
                <ArrowRight className="lab5-size-4" />
              </div>
            </div>
            <div />
          </div>

          {/* Row 2: Verifier message (Right) */}
          <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3.5 lab5-items-center">
            <div />
            <div className="lab5-flex lab5-items-center lab5-gap-2.5">
              <div
                className="lab5-flex lab5-size-8 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full lab5-text-white lab5-shadow-sm"
                style={{ backgroundColor: "#10b981" }}
              >
                <ArrowLeft className="lab5-size-4" />
              </div>
              <div
                className="lab5-flex-1 lab5-rounded-2xl lab5-p-4"
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <p className="lab5-text-xs lab5-font-medium" style={{ color: "#059669", margin: 0 }}>
                  Verifier → คุณ
                </p>
                <p className="lab5-mt-1 lab5-text-sm lab5-font-semibold lab5-text-foreground" style={{ margin: "0.25rem 0 0 0" }}>
                  พิสูจน์มาสิครับ ส่งอะไรให้ผมเริ่มคำนวณ?
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Prover message (Left) */}
          <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3.5 lab5-items-center">
            <div className="lab5-flex lab5-items-center lab5-gap-2.5">
              <div
                className="lab5-flex-1 lab5-rounded-2xl"
                style={{
                  backgroundColor: "#f5f3ff",
                  border: "1px solid #ede9fe",
                  padding: "1rem 1.25rem",
                }}
              >
                <p className="lab5-text-xs lab5-font-semibold" style={{ color: "#7c3aed", margin: 0 }}>
                  คุณ → Verifier
                </p>
                <p className="lab5-text-sm lab5-font-bold lab5-text-foreground" style={{ margin: "0.35rem 0 0.5rem 0" }}>
                  รหัสลับของออร์เดอร์ B
                </p>
                <div>
                  <div
                    className="lab5-inline-flex lab5-items-center lab5-justify-center lab5-rounded-full"
                    style={{
                      backgroundColor: "#6d4bd8",
                      padding: "4px 14px",
                    }}
                  >
                    <span
                      className="lab5-font-mono lab5-text-xs lab5-font-bold lab5-text-white"
                      style={{ letterSpacing: "0.02em" }}
                    >
                      secret-B-q92m
                    </span>
                  </div>
                </div>
                {selectedAnswer === "know" && (
                  <div className="lab5-mt-2.5">
                    <div
                      className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full"
                      style={{
                        backgroundColor: "#fff1f2",
                        border: "1px solid #fecaca",
                        padding: "2px 10px",
                      }}
                    >
                      <AlertTriangle className="lab5-size-3" style={{ color: "#ef4444" }} />
                      <span className="lab5-font-semibold" style={{ color: "#ef4444", fontSize: "0.6875rem" }}>
                        รั่ว: รหัสลับ
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div
                className="lab5-flex lab5-size-8 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full lab5-text-white lab5-shadow-sm"
                style={{ backgroundColor: "#7c3aed" }}
              >
                <ArrowRight className="lab5-size-4" />
              </div>
            </div>
            <div />
          </div>

          {/* Row 4: Verifier message (Right) */}
          <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3.5 lab5-items-center">
            <div />
            <div className="lab5-flex lab5-items-center lab5-gap-2.5">
              <div
                className="lab5-flex lab5-size-8 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full lab5-text-white lab5-shadow-sm"
                style={{ backgroundColor: "#10b981" }}
              >
                <ArrowLeft className="lab5-size-4" />
              </div>
              <div
                className="lab5-flex-1 lab5-rounded-2xl lab5-p-4"
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <p className="lab5-text-xs lab5-font-medium" style={{ color: "#059669", margin: 0 }}>
                  Verifier → คุณ
                </p>
                <p className="lab5-mt-1 lab5-text-sm lab5-font-semibold lab5-text-foreground" style={{ margin: "0.25rem 0 0 0" }}>
                  ได้ Leaf แล้ว ต้องการ Hash ข้าง ๆ ต่อ
                </p>
              </div>
            </div>
          </div>

          {/* Row 5: Prover message (Left) */}
          <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3.5 lab5-items-center">
            <div className="lab5-flex lab5-items-center lab5-gap-2.5">
              <div
                className="lab5-flex-1 lab5-rounded-2xl"
                style={{
                  backgroundColor: "#f5f3ff",
                  border: "1px solid #ede9fe",
                  padding: "1rem 1.25rem",
                }}
              >
                <p className="lab5-text-xs lab5-font-medium" style={{ color: "#7c3aed", margin: 0 }}>
                  คุณ → Verifier
                </p>
                <p className="lab5-mt-1 lab5-text-sm lab5-font-semibold lab5-text-foreground" style={{ margin: "0.25rem 0 0 0" }}>
                  ส่ง H(A) (อยู่ฝั่งซ้าย)
                </p>
                <div>
                  <div
                    className="lab5-mt-2.5 lab5-inline-flex lab5-items-center lab5-rounded-full lab5-px-3 lab5-py-0.5"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #ddd6fe",
                    }}
                  >
                    <span className="lab5-font-mono lab5-text-xs lab5-font-medium" style={{ color: "#7c3aed" }}>
                      H(A) {haHash}
                    </span>
                  </div>
                </div>
                {selectedAnswer === "know" && (
                  <div className="lab5-mt-2.5">
                    <div
                      className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full"
                      style={{
                        backgroundColor: "#fff1f2",
                        border: "1px solid #fecaca",
                        padding: "2px 10px",
                      }}
                    >
                      <AlertTriangle className="lab5-size-3" style={{ color: "#ef4444" }} />
                      <span className="lab5-font-semibold" style={{ color: "#ef4444", fontSize: "0.6875rem" }}>
                        รั่ว: ตำแหน่ง → ใบของคุณอยู่ขวาของคู่
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div
                className="lab5-flex lab5-size-8 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full lab5-text-white lab5-shadow-sm"
                style={{ backgroundColor: "#7c3aed" }}
              >
                <ArrowRight className="lab5-size-4" />
              </div>
            </div>
            <div />
          </div>

          {/* Row 6: Prover message (Left) */}
          <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3.5 lab5-items-center">
            <div className="lab5-flex lab5-items-center lab5-gap-2.5">
              <div
                className="lab5-flex-1 lab5-rounded-2xl"
                style={{
                  backgroundColor: "#f5f3ff",
                  border: "1px solid #ede9fe",
                  padding: "1rem 1.25rem",
                }}
              >
                <p className="lab5-text-xs lab5-font-medium" style={{ color: "#7c3aed", margin: 0 }}>
                  คุณ → Verifier
                </p>
                <p className="lab5-mt-1 lab5-text-sm lab5-font-semibold lab5-text-foreground" style={{ margin: "0.25rem 0 0 0" }}>
                  ส่ง H(C+D) (อยู่ฝั่งขวา)
                </p>
                <div>
                  <div
                    className="lab5-mt-2.5 lab5-inline-flex lab5-items-center lab5-rounded-full lab5-px-3 lab5-py-0.5"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #ddd6fe",
                    }}
                  >
                    <span className="lab5-font-mono lab5-text-xs lab5-font-medium" style={{ color: "#7c3aed" }}>
                      H(C+D) {hcdHash}
                    </span>
                  </div>
                </div>
                {selectedAnswer === "know" && (
                  <div className="lab5-mt-2.5">
                    <div
                      className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full"
                      style={{
                        backgroundColor: "#fff1f2",
                        border: "1px solid #fecaca",
                        padding: "2px 10px",
                      }}
                    >
                      <AlertTriangle className="lab5-size-3" style={{ color: "#ef4444" }} />
                      <span className="lab5-font-semibold" style={{ color: "#ef4444", fontSize: "0.6875rem" }}>
                        รั่ว: ตำแหน่ง → อยู่ครึ่งซ้ายของต้นไม้
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div
                className="lab5-flex lab5-size-8 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full lab5-text-white lab5-shadow-sm"
                style={{ backgroundColor: "#7c3aed" }}
              >
                <ArrowRight className="lab5-size-4" />
              </div>
            </div>
            <div />
          </div>

          {/* Row 7: Final Verification: Verifier (Right) */}
          <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3.5 lab5-items-center">
            <div />
            <div className="lab5-flex lab5-items-center lab5-gap-2.5">
              <div
                className="lab5-flex lab5-size-8 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px dashed #86efac",
                }}
              >
                <Shield className="lab5-size-4" style={{ color: "#16a34a" }} />
              </div>
              <div
                className="lab5-flex-1 lab5-rounded-2xl lab5-p-4"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px dashed #86efac",
                }}
              >
                <p className="lab5-text-xs lab5-font-bold" style={{ color: "#059669", margin: 0 }}>
                  Verifier ตรวจเอง
                </p>
                <p className="lab5-mt-1 lab5-text-xs lab5-font-medium lab5-text-foreground" style={{ margin: "0.25rem 0 0 0" }}>
                  คำนวณย้อนกลับได้ Root ตรงกับที่ประกาศไว้ ✅ ยอมรับ
                </p>
              </div>
            </div>
          </div>

          {/* Row 8: Verifier คิดในใจ (Right) */}
          {selectedAnswer === "know" && (
            <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3.5 lab5-items-center lab5-animate-merge-up">
              <div />
              <div className="lab5-flex lab5-items-center lab5-gap-2.5">
                <div
                  className="lab5-flex lab5-size-8 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1.5px dashed #86efac",
                  }}
                >
                  <Shield className="lab5-size-4" style={{ color: "#10b981" }} />
                </div>
                <div
                  className="lab5-flex-1 lab5-rounded-2xl lab5-p-4"
                  style={{
                    backgroundColor: "#fff5f5",
                    border: "1.5px dashed #fca5a5",
                  }}
                >
                  <p className="lab5-text-xs lab5-font-bold" style={{ color: "#ef4444", margin: 0 }}>
                    Verifier คิดในใจ
                  </p>
                  <p className="lab5-mt-1.5 lab5-text-xs lab5-font-medium" style={{ margin: "0.35rem 0 0 0", color: "#334155" }}>
                    &quot;อ๋อ... คนนี้คือเจ้าของ <strong>ออร์เดอร์ B</strong> (ใบที่ 2 จาก 4) และรหัสลับคือ secret-B-q92m&quot;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div
          className="lab5-flex lab5-items-center lab5-justify-between lab5-flex-wrap lab5-gap-2.5 lab5-px-6 lab5-py-3.5"
          style={{ borderTop: "1px solid #f1f5f9", backgroundColor: "#ffffff" }}
        >
          {selectedAnswer === "know" ? (
            <div className="lab5-flex lab5-items-center lab5-flex-wrap lab5-gap-2 lab5-animate-merge-up">
              <div className="lab5-flex lab5-items-center lab5-gap-1.5 lab5-mr-1">
                <Eye className="lab5-size-4" style={{ color: "#059669" }} />
                <span className="lab5-text-xs lab5-font-bold lab5-text-foreground">
                  สิ่งที่ Verifier รู้หลังคุยจบ
                </span>
              </div>
              <span
                className="lab5-inline-flex lab5-items-center lab5-rounded-full lab5-px-2.5 lab5-py-0.5"
                style={{
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#059669",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                }}
              >
                ✓ Root
              </span>
              <span
                className="lab5-inline-flex lab5-items-center lab5-gap-1 lab5-rounded-full lab5-px-2.5 lab5-py-0.5"
                style={{
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecaca",
                  color: "#ef4444",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                }}
              >
                <AlertTriangle className="lab5-size-2.5" /> รหัสลับ
              </span>
              <span
                className="lab5-inline-flex lab5-items-center lab5-gap-1 lab5-rounded-full lab5-px-2.5 lab5-py-0.5"
                style={{
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecaca",
                  color: "#ef4444",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                }}
              >
                <AlertTriangle className="lab5-size-2.5" /> ว่าคุณคือออร์เดอร์ B
              </span>
              <span
                className="lab5-inline-flex lab5-items-center lab5-gap-1 lab5-rounded-full lab5-px-2.5 lab5-py-0.5"
                style={{
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecaca",
                  color: "#ef4444",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                }}
              >
                <AlertTriangle className="lab5-size-2.5" /> Hash ข้าง ๆ + ตำแหน่ง
              </span>
            </div>
          ) : (
            <div />
          )}

          <div className="lab5-flex lab5-items-center lab5-gap-1.5 lab5-ml-auto">
            <RotateCcw className="lab5-size-3.5" style={{ color: "#94a3b8" }} />
            <span className="lab5-text-xs lab5-font-medium" style={{ color: "#64748b" }}>
              ข้อความที่ข้ามเส้น: <strong style={{ color: "#1e293b" }}>6</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Question & Choices */}
      <div className="lab5-space-y-3">
        <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">
          จากบทสนทนานี้ Verifier รู้ไหมว่าคุณเป็นเจ้าของออร์เดอร์ใบไหน?
        </p>

        <div className="lab5-space-y-3">
          {/* Option 1: ไม่รู้ */}
          <button
            type="button"
            onClick={() => handleSelectAnswer("unknown")}
            className="lab5-w-full lab5-text-left lab5-rounded-2xl lab5-transition-all"
            style={{
              padding: "1rem 1.25rem",
              border: selectedAnswer === "unknown" ? "2px solid #ef4444" : "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              cursor: "pointer",
            }}
          >
            <p className="lab5-text-sm lab5-font-bold lab5-text-foreground" style={{ margin: 0 }}>
              ไม่รู้
            </p>
            <p
              className="lab5-text-xs"
              style={{
                margin: "0.25rem 0 0 0",
                color: selectedAnswer === "unknown" ? "#ef4444" : "#64748b",
              }}
            >
              — เพราะส่วนใหญ่เป็นแค่ Hash
            </p>
          </button>

          {/* Option 2: รู้ */}
          <button
            type="button"
            onClick={() => handleSelectAnswer("know")}
            className="lab5-w-full lab5-text-left lab5-rounded-2xl lab5-transition-all"
            style={{
              padding: "1rem 1.25rem",
              border: selectedAnswer === "know" ? "2px solid #10b981" : "1px solid #e2e8f0",
              backgroundColor: selectedAnswer === "know" ? "#ecfdf5" : "#ffffff",
              cursor: "pointer",
            }}
          >
            <p className="lab5-text-sm lab5-font-bold lab5-text-foreground" style={{ margin: 0 }}>
              รู้
            </p>
            <p
              className="lab5-text-xs"
              style={{
                margin: "0.25rem 0 0 0",
                color: selectedAnswer === "know" ? "#059669" : "#64748b",
              }}
            >
              — เพราะเห็นรหัสลับและตำแหน่งชัดเจน
            </p>
          </button>
        </div>

        {/* Feedback Display */}
        {selectedAnswer === "unknown" && (
          <div className="lab5-space-y-3 lab5-animate-merge-up">
            <div
              className="lab5-rounded-2xl"
              style={{
                backgroundColor: "#fff5f5",
                border: "1px solid #fecaca",
                padding: "1.1rem 1.25rem",
              }}
            >
              <div className="lab5-flex lab5-items-center lab5-gap-2">
                <XCircle className="lab5-size-5 lab5-shrink-0" style={{ color: "#ef4444" }} />
                <span className="lab5-text-sm lab5-font-bold" style={{ color: "#ef4444" }}>
                  ลองอ่านบทสนทนาอีกครั้ง
                </span>
              </div>
              <p
                className="lab5-text-xs lab5-leading-relaxed"
                style={{ color: "#334155", margin: "0.5rem 0 0 0" }}
              >
                คุณส่ง <strong>รหัสลับของออร์เดอร์ B</strong> ไปตรง ๆ และบอกตำแหน่ง "ซ้าย/ขวา" ของ Hash ข้าง ๆ ด้วย — แค่นี้ก็พอให้รู้ว่าเป็นใบที่เท่าไหร่ในต้นไม้
              </p>
            </div>

            {/* Hint / Why Button */}
            <div>
              <button
                type="button"
                onClick={() => setShowWhy((prev) => !prev)}
                className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-px-3.5 lab5-py-1.5 lab5-transition-all"
                style={{
                  backgroundColor: "#faf5ff",
                  border: "1px solid #e9d5ff",
                  color: "#9333ea",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <HelpCircle className="lab5-size-3.5" />
                <span>ทำไม?</span>
              </button>
            </div>

            {showWhy && (
              <div
                className="lab5-animate-merge-up lab5-rounded-2xl lab5-p-4"
                style={{
                  backgroundColor: "#faf5ff",
                  border: "1px solid #ede9fe",
                }}
              >
                <p className="lab5-text-xs lab5-leading-relaxed" style={{ color: "#6d4bd8", margin: 0 }}>
                  💡 <strong>คำอธิบาย:</strong> ใน Merkle Tree แบบปกติ เราจำเป็นต้องเปิดเผยข้อมูลใบ (Leaf) ของเราพร้อมกับส่ง Hash ข้างเคียง (Auth Path) เพื่อให้ผู้ตรวจ (Verifier) สามารถคำนวณย้อนกลับขึ้นไปหา Root ได้ ซึ่งทำให้ Verifier รู้ได้ทันทีว่าเราคือเจ้าของออร์เดอร์ใบนี้
                </p>
              </div>
            )}
          </div>
        )}

        {selectedAnswer === "know" && (
          <div className="lab5-space-y-4 lab5-animate-merge-up">
            {/* Green Success Card */}
            <div
              className="lab5-rounded-2xl lab5-p-4"
              style={{
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
              }}
            >
              <div className="lab5-flex lab5-items-center lab5-gap-2.5">
                <CheckCircle2 className="lab5-size-5 lab5-shrink-0" style={{ color: "#10b981" }} />
                <span className="lab5-text-sm lab5-font-bold" style={{ color: "#059669" }}>
                  ถูกต้อง — Verifier รู้ว่าเป็นออร์เดอร์ไหน
                </span>
              </div>
              <p
                className="lab5-mt-2 lab5-text-xs lab5-leading-relaxed"
                style={{ color: "#334155", margin: "0.5rem 0 0 0" }}
              >
                Merkle proof พิสูจน์ว่า &ldquo;อยู่ในชุดข้อมูล&rdquo; ได้จริง แต่ระหว่างคุยกัน คุณต้องส่งข้อมูลของตัวเองข้ามเส้นไปให้ Verifier เห็นด้วย
              </p>
            </div>

            {/* Target of Part 2 Card */}
            <div
              className="lab5-rounded-2xl lab5-space-y-4"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: "1.5rem",
              }}
            >
              {/* Card Header */}
              <div className="lab5-flex lab5-items-center lab5-gap-3">
                <div
                  className="lab5-flex lab5-size-10 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-2xl"
                  style={{ backgroundColor: "#f5f3ff", color: "#7c3aed" }}
                >
                  <Sparkles className="lab5-size-5" />
                </div>
                <div>
                  <p className="lab5-text-base lab5-font-bold lab5-text-foreground" style={{ margin: 0 }}>
                    เป้าหมายใหม่ของภาค 2
                  </p>
                  <p className="lab5-text-xs lab5-text-muted-foreground" style={{ margin: "0.2rem 0 0 0" }}>
                    พิสูจน์ประโยคนี้ให้ Verifier เชื่อ โดยไม่ส่งข้อความที่มีป้ายแดงข้ามเส้นไปเลยแม้แต่ชิ้นเดียว
                  </p>
                </div>
              </div>

              {/* Quote Box */}
              <div
                className="lab5-rounded-2xl lab5-text-center"
                style={{
                  border: "1px solid #ede9fe",
                  backgroundColor: "#ffffff",
                  padding: "1.25rem 1rem",
                }}
              >
                <p className="lab5-text-sm lab5-font-bold lab5-text-foreground" style={{ margin: 0 }}>
                  &ldquo;ฉันรู้รหัสลับของออร์เดอร์ <strong>1 ใบ</strong> ที่อยู่ใต้ Root{" "}
                  <span className="lab5-font-mono" style={{ color: "#7c3aed" }}>
                    {rootHash}
                  </span>{" "}
                  นี้&rdquo;
                </p>
                <p className="lab5-text-xs lab5-text-muted-foreground" style={{ margin: "0.35rem 0 0 0" }}>
                  — โดยไม่บอกว่าใบไหน และไม่บอกรหัสลับ
                </p>
              </div>

              {/* zk-SNARK intro */}
              <div>
                <p className="lab5-text-xs lab5-font-bold lab5-text-foreground" style={{ margin: 0 }}>
                  เครื่องมือที่ทำได้คือ <span style={{ color: "#7c3aed" }}>zk-SNARK</span> — ชื่อยาวแต่แปลตรงตัวแบบนี้:
                </p>
              </div>

              {/* 4 Cards (2x2 Grid) */}
              <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3">
                {/* zk */}
                <div
                  className="lab5-rounded-2xl lab5-p-3.5"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <p className="lab5-text-xs lab5-font-bold lab5-text-foreground" style={{ margin: 0 }}>
                    <span style={{ color: "#7c3aed" }}>zk</span> · Zero-Knowledge
                  </p>
                  <p className="lab5-text-xs lab5-leading-relaxed" style={{ color: "#64748b", margin: "0.35rem 0 0 0" }}>
                    Verifier ไม่ได้ความรู้อะไรเพิ่ม นอกจาก &ldquo;จริง&rdquo; หรือ &ldquo;ไม่จริง&rdquo;
                  </p>
                </div>

                {/* S */}
                <div
                  className="lab5-rounded-2xl lab5-p-3.5"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <p className="lab5-text-xs lab5-font-bold lab5-text-foreground" style={{ margin: 0 }}>
                    <span style={{ color: "#7c3aed" }}>S</span> · Succinct (กระชับ)
                  </p>
                  <p className="lab5-text-xs lab5-leading-relaxed" style={{ color: "#64748b", margin: "0.35rem 0 0 0" }}>
                    หลักฐานเล็กมาก ตรวจได้เร็ว ไม่ว่าเรื่องที่พิสูจน์จะซับซ้อนแค่ไหน
                  </p>
                </div>

                {/* N */}
                <div
                  className="lab5-rounded-2xl lab5-p-3.5"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <p className="lab5-text-xs lab5-font-bold lab5-text-foreground" style={{ margin: 0 }}>
                    <span style={{ color: "#7c3aed" }}>N</span> · Non-Interactive
                  </p>
                  <p className="lab5-text-xs lab5-leading-relaxed" style={{ color: "#64748b", margin: "0.35rem 0 0 0" }}>
                    ส่งหลักฐานข้ามเส้นครั้งเดียวจบ ไม่ต้องถาม-ตอบกันไปมาแบบขั้นที่ 3
                  </p>
                </div>

                {/* ARK */}
                <div
                  className="lab5-rounded-2xl lab5-p-3.5"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <p className="lab5-text-xs lab5-font-bold lab5-text-foreground" style={{ margin: 0 }}>
                    <span style={{ color: "#7c3aed" }}>ARK</span> · ARgument of Knowledge
                  </p>
                  <p className="lab5-text-xs lab5-leading-relaxed" style={{ color: "#64748b", margin: "0.35rem 0 0 0" }}>
                    พิสูจน์ว่า &ldquo;รู้&rdquo; ข้อมูลลับจริง ไม่ใช่แค่เดาถูก
                  </p>
                </div>
              </div>
            </div>

            {/* Hint / Why Button */}
            <div>
              <button
                type="button"
                onClick={() => setShowWhy((prev) => !prev)}
                className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-px-3.5 lab5-py-1.5 lab5-transition-all"
                style={{
                  backgroundColor: "#faf5ff",
                  border: "1px solid #e9d5ff",
                  color: "#9333ea",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <HelpCircle className="lab5-size-3.5" />
                <span>ทำไม?</span>
              </button>
            </div>

            {showWhy && (
              <div
                className="lab5-animate-merge-up lab5-rounded-2xl lab5-p-4"
                style={{
                  backgroundColor: "#faf5ff",
                  border: "1px solid #ede9fe",
                }}
              >
                <p className="lab5-text-xs lab5-leading-relaxed" style={{ color: "#6d4bd8", margin: 0 }}>
                  💡 <strong>คำอธิบาย:</strong> Merkle Proof ช่วยให้ Verifier ตรวจสอบได้ว่าข้อมูลอยู่ในชุดข้อมูลจริง แต่จำเป็นต้องเปิดเผยตำแหน่งและค่าของใบ จึงไม่สามารถรักษาความเป็นส่วนตัวได้แบบ 100% — ดังนั้นในภาคที่ 2 เราจึงนำ <strong>Zero-Knowledge Proofs (ZKP)</strong> มาผสานกับ Merkle Tree เพื่อแก้ข้อจำกัดนี้
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}



/**
 * ขั้นที่ 6: ไปป์ไลน์ zk-SNARK (เดินผ่าน 5 ชิ้นส่วนของ zk-SNARK ทีละขั้น จนผู้ตรวจยอมรับ)
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 6
 * @author StealthTrade Team
 */
function Step6ZkPipeline() {
  const { tree, selectedLeaf, markComplete } = useLab05()
  const [currentStage, setCurrentStage] = useState(1) // 1 to 5
  const [completedStages, setCompletedStages] = useState([]) // [1, 2, 3, 4, 5]
  const [sendChoice, setSendChoice] = useState("with_witness") // "with_witness" | "zk_only"
  const [isWhyOpen, setIsWhyOpen] = useState(false)

  const rootHash = tree?.root || "592ed5ae966a2cefe7485d1e4ff0b016ef3ff5b9ef18fe580325f187a4128509"
  const targetIndex = selectedLeaf ?? 1
  const targetOrder = orders[targetIndex] || orders[1]

  const PIPELINE_PARTS = [
    { id: 1, title: "Statement", sub: "โจทย์ที่จะประกาศ", action: "เขียน Statement (คำอ้างที่จะประกาศ)" },
    { id: 2, title: "Circuit", sub: "กติกาตรวจ", action: "กำหนด Circuit (กติกาตรวจ)" },
    { id: 3, title: "Witness", sub: "ข้อมูลลับ", action: "ป้อน Witness (ข้อมูลลับในเครื่อง)" },
    { id: 4, title: "Proof", sub: "หลักฐาน", action: "สร้าง Proof π (ในกล่องปิด)" },
    { id: 5, title: "Verify", sub: "ตรวจหลักฐาน", action: "ส่งข้ามเส้นไปให้ Verifier" },
  ]

  const handleNextAction = () => {
    if (currentStage === 1) {
      setCompletedStages([1])
      setCurrentStage(2)
    } else if (currentStage === 2) {
      setCompletedStages([1, 2])
      setCurrentStage(3)
    } else if (currentStage === 3) {
      setCompletedStages([1, 2, 3])
      setCurrentStage(4)
    } else if (currentStage === 4) {
      setCompletedStages([1, 2, 3, 4])
      setCurrentStage(5)
      setSendChoice("with_witness") // ขึ้นข้อความสีแดงตามภาพ 1 ก่อน
    }
  }

  const handleSendStatement = () => {
    setSendChoice("zk_only")
    setCompletedStages([1, 2, 3, 4, 5])
    if (typeof markComplete === "function") {
      markComplete(6)
    }
  }

  const handleReset = () => {
    setCurrentStage(1)
    setCompletedStages([])
    setSendChoice("with_witness")
  }

  const hasStarted = completedStages.length > 0
  const isZkAccepted = sendChoice === "zk_only"
  const crossedCount = isZkAccepted ? 1 : 2

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <LessonHeading
        sectionLabel="ไปป์ไลน์ ZK-SNARK (จำลอง)"
        title="พิสูจน์ว่าอยู่ในชุดข้อมูล โดยไม่บอกว่าเป็นใบไหน"
        description="ใช้ต้นไม้ชุดเดิมจากภาค 1 เป็นตัวอย่าง — Root เป็นข้อมูลสาธารณะ ส่วนรหัสลับและเส้นทางเป็นความลับ"
      />

      {/* 5-Step Pipeline Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1rem",
          padding: "1.25rem 1rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b" }}>
            ชิ้นที่ {currentStage} จาก 5 : {PIPELINE_PARTS[currentStage - 1].title}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
            เป้าหมาย: Verifier เชื่อ โดยไม่เห็นข้อมูลลับ
          </span>
        </div>

        {/* 5 Steps Grid — Strictly 5 Columns Side by Side */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "0.5rem",
          }}
        >
          {PIPELINE_PARTS.map((part) => {
            const isActive = currentStage === part.id
            const isDone = completedStages.includes(part.id)

            return (
              <button
                key={part.id}
                type="button"
                onClick={() => {
                  if (completedStages.includes(part.id) || completedStages.includes(part.id - 1) || part.id === 1) {
                    setCurrentStage(part.id)
                  }
                }}
                disabled={!isDone && part.id > currentStage}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.75rem 0.375rem",
                  borderRadius: "1rem",
                  backgroundColor: isActive ? "#f5f3ff" : "transparent",
                  border: isActive ? "1px solid #ddd6fe" : "1px solid transparent",
                  cursor: (isDone || part.id <= currentStage) ? "pointer" : "default",
                  transition: "all 0.15s ease",
                  textAlign: "center",
                  outline: "none",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    minWidth: "28px",
                    minHeight: "28px",
                    maxWidth: "28px",
                    maxHeight: "28px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    marginBottom: "0.375rem",
                    backgroundColor: isActive ? "#7c3aed" : isDone ? "#10b981" : "#ffffff",
                    color: isActive || isDone ? "#ffffff" : "#64748b",
                    border: isActive || isDone ? "none" : "1px solid #cbd5e1",
                    flexShrink: 0,
                  }}
                >
                  {isDone && !isActive ? (
                    <Check style={{ width: "14px", height: "14px" }} />
                  ) : (
                    part.id
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    color: isActive ? "#6d4bd8" : isDone ? "#1e293b" : "#475569",
                    lineHeight: 1.25,
                    display: "block",
                  }}
                >
                  {part.title}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: isActive ? "#7c3aed" : "#94a3b8",
                    marginTop: "0.125rem",
                    lineHeight: 1.2,
                    display: "block",
                  }}
                >
                  {part.sub}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Split Prover / Verifier Arena */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1.25rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}
      >
        {/* Split Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          {/* Prover Header (Left) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.75rem 1rem",
              backgroundColor: "rgba(124, 58, 237, 0.04)",
              borderRight: "1px dashed #e2e8f0",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                minWidth: "32px",
                minHeight: "32px",
                borderRadius: "50%",
                backgroundColor: "#f5f3ff",
                border: "1px solid #ddd6fe",
                color: "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User style={{ width: "16px", height: "16px" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 700, color: "#6d4bd8", lineHeight: 1.2 }}>
                คุณ
              </p>
              <p style={{ margin: 0, fontSize: "0.6875rem", color: "#7c3aed", lineHeight: 1.2 }}>
                Prover
              </p>
            </div>
          </div>

          {/* Verifier Header (Right) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "0.625rem",
              padding: "0.75rem 1rem",
              backgroundColor: "rgba(16, 185, 129, 0.04)",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 700, color: "#059669", lineHeight: 1.2 }}>
                ผู้ตรวจ
              </p>
              <p style={{ margin: 0, fontSize: "0.6875rem", color: "#10b981", lineHeight: 1.2 }}>
                Verifier
              </p>
            </div>
            <div
              style={{
                width: "32px",
                height: "32px",
                minWidth: "32px",
                minHeight: "32px",
                borderRadius: "50%",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: "1.5rem 1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem", minHeight: "140px" }}>
          {!hasStarted ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 1rem",
              }}
            >
              <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                ยังไม่มีข้อความ — เริ่มคุยจากปุ่มด้านล่าง
              </span>
            </div>
          ) : (
            <>
              {/* Card 1: Statement (Left aligned, dashed border) */}
              {completedStages.includes(1) && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }} className="lab5-animate-merge-up">
                  <div
                    style={{
                      flex: "0 1 480px",
                      border: "1px dashed #d8b4fe",
                      backgroundColor: "#ffffff",
                      borderRadius: "1rem",
                      padding: "1rem 1.125rem",
                      boxShadow: "0 1px 2px rgba(124, 58, 237, 0.03)",
                    }}
                  >
                    <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.6875rem", color: "#8b5cf6", fontWeight: 600 }}>
                      ในเครื่องคุณ · เตรียมไว้ประกาศ
                    </p>
                    <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.4 }}>
                      ① Statement — คำอ้างที่ทุกคนจะอ่านได้ (Public):
                    </p>
                    <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.8125rem", color: "#1e293b", lineHeight: 1.5 }}>
                      "มีออร์เดอร์ 1 ใบอยู่ใต้ Root{" "}
                      <span
                        style={{
                          backgroundColor: "#f5f3ff",
                          color: "#7c3aed",
                          fontFamily: "monospace",
                          padding: "0.125rem 0.375rem",
                          borderRadius: "0.375rem",
                          fontWeight: 600,
                        }}
                      >
                        592ed5ae..
                      </span>{" "}
                      และฉันรู้รหัสลับของมัน"
                    </p>
                    <p style={{ margin: 0, fontSize: "0.6875rem", color: "#64748b", lineHeight: 1.4 }}>
                      เปรียบเหมือนโจทย์ข้อสอบบนกระดาน — ทุกคนเห็นโจทย์ แต่ไม่มีใครเห็นคำตอบของคุณ
                    </p>
                  </div>

                  {/* Dotted Lock Circle */}
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      minWidth: "28px",
                      minHeight: "28px",
                      borderRadius: "50%",
                      border: "1px dashed #d8b4fe",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#a855f7",
                      flexShrink: 0,
                    }}
                  >
                    <Lock style={{ width: "13px", height: "13px" }} />
                  </div>
                </div>
              )}

              {/* Card 2: Circuit (Centered, solid light gray card) */}
              {completedStages.includes(2) && (
                <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0.25rem 0" }} className="lab5-animate-merge-up">
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "1rem",
                      padding: "1rem 1.25rem",
                      textAlign: "center",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b" }}>
                      ข้อตกลงร่วม · Setup ครั้งเดียว
                    </p>
                    <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.4 }}>
                      ② Circuit — กติกาตรวจที่ทั้งสองฝ่ายรู้เหมือนกัน (คือการคำนวณเดียวกับที่ Verifier ทำในขั้นที่ 3)
                    </p>

                    {/* 3 Pills in horizontal row */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "9999px",
                          padding: "0.3125rem 0.75rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#334155",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                        }}
                      >
                        1 · Hash(รหัสลับ) → Leaf
                      </span>
                      <span
                        style={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "9999px",
                          padding: "0.3125rem 0.75rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#334155",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                        }}
                      >
                        2 · รวมกับ Sibling ทีละขั้น
                      </span>
                      <span
                        style={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "9999px",
                          padding: "0.3125rem 0.75rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#334155",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                        }}
                      >
                        3 · ผลลัพธ์ต้อง = Root
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.6875rem", color: "#64748b" }}>
                      จาก Circuit ได้ Proving Key (ให้คุณ) และ Verification Key (ให้ Verifier) — ทั้งสองเป็นข้อมูลสาธารณะ
                    </p>
                  </div>
                </div>
              )}

              {/* Card 3: Witness (Left aligned, dashed border) */}
              {completedStages.includes(3) && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }} className="lab5-animate-merge-up">
                  <div
                    style={{
                      flex: "0 1 480px",
                      border: "1px dashed #d8b4fe",
                      backgroundColor: "#ffffff",
                      borderRadius: "1rem",
                      padding: "1rem 1.125rem",
                      boxShadow: "0 1px 2px rgba(124, 58, 237, 0.03)",
                    }}
                  >
                    <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.6875rem", color: "#8b5cf6", fontWeight: 600 }}>
                      ในเครื่องคุณ · ไม่ส่งออก
                    </p>
                    <p style={{ margin: "0 0 0.625rem 0", fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      ③ Witness <span style={{ fontSize: "0.875rem" }}>🔒</span> ข้อมูลลับที่ทำให้กติกาเป็นจริง
                    </p>

                    {/* Witness Pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
                      <span
                        style={{
                          backgroundColor: "#6d28d9",
                          color: "#ffffff",
                          borderRadius: "9999px",
                          padding: "0.3125rem 0.75rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          fontFamily: "monospace",
                        }}
                      >
                        secret-B-q92m
                      </span>
                      <span
                        style={{
                          backgroundColor: "#f5f3ff",
                          border: "1px solid #ddd6fe",
                          color: "#6d4bd8",
                          borderRadius: "9999px",
                          padding: "0.3125rem 0.75rem",
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                        }}
                      >
                        H(A) 966a2cef.. · ฝั่งซ้าย
                      </span>
                      <span
                        style={{
                          backgroundColor: "#f5f3ff",
                          border: "1px solid #ddd6fe",
                          color: "#6d4bd8",
                          borderRadius: "9999px",
                          padding: "0.3125rem 0.75rem",
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                        }}
                      >
                        H(C+D) bc6a6e07.. · ฝั่งขวา
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.6875rem", color: "#64748b", lineHeight: 1.4 }}>
                      นี่คือของชุดเดียวกับที่มีป้ายแดงในขั้นที่ 5 — คราวนี้มันจะไม่ข้ามเส้นไปหา Verifier เลย
                    </p>
                  </div>

                  {/* Dotted Lock Circle */}
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      minWidth: "28px",
                      minHeight: "28px",
                      borderRadius: "50%",
                      border: "1px dashed #d8b4fe",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#a855f7",
                      flexShrink: 0,
                    }}
                  >
                    <Lock style={{ width: "13px", height: "13px" }} />
                  </div>
                </div>
              )}

              {/* Card 4: Proof π (Left aligned, dashed border) */}
              {completedStages.includes(4) && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }} className="lab5-animate-merge-up">
                  <div
                    style={{
                      flex: "0 1 480px",
                      border: "1px dashed #d8b4fe",
                      backgroundColor: "#ffffff",
                      borderRadius: "1rem",
                      padding: "1rem 1.125rem",
                      boxShadow: "0 1px 2px rgba(124, 58, 237, 0.03)",
                    }}
                  >
                    <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.6875rem", color: "#8b5cf6", fontWeight: 600 }}>
                      ในเครื่องคุณ · ไม่ส่งออก
                    </p>
                    <p style={{ margin: "0 0 0.625rem 0", fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.4 }}>
                      ④ Proof π ออกมาแล้ว — วงจรตรวจกติกาครบ 3 ข้อในกล่องปิด
                    </p>

                    {/* Proof Chip */}
                    <div style={{ marginBottom: "0.625rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          backgroundColor: "#ede9fe",
                          color: "#6d4bd8",
                          border: "1px solid #ddd6fe",
                          borderRadius: "9999px",
                          padding: "0.3125rem 0.75rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          fontFamily: "monospace",
                        }}
                      >
                        π 6ac6cfa8c45750a7_
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.6875rem", color: "#64748b", lineHeight: 1.4 }}>
                      ในระบบจริงมีขนาดเล็กและคงที่ (ประมาณ 200 ไบต์) ไม่ว่าต้นไม้จะใหญ่แค่ไหน
                    </p>
                  </div>

                  {/* Dotted Lock Circle */}
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      minWidth: "28px",
                      minHeight: "28px",
                      borderRadius: "50%",
                      border: "1px dashed #d8b4fe",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#a855f7",
                      flexShrink: 0,
                    }}
                  >
                    <Lock style={{ width: "13px", height: "13px" }} />
                  </div>
                </div>
              )}

              {/* Card 5 & 6 (Only shown in Step 5) */}
              {currentStage === 5 && (
                <>
                  {!isZkAccepted ? (
                    /* RED REJECTED STATE (Image 1) */
                    <>
                      {/* Card 5: Prover sends Statement + π + Witness */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }} className="lab5-animate-merge-up">
                        <div
                          style={{
                            flex: "0 1 420px",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "1rem",
                            padding: "1rem 1.125rem",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                          }}
                        >
                          <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.6875rem", fontWeight: 700, color: "#dc2626" }}>
                            คุณ → Verifier
                          </p>
                          <p style={{ margin: "0 0 0.625rem 0", fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b" }}>
                            Statement + π + Witness
                          </p>

                          {/* Pills */}
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
                            <span
                              style={{
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                color: "#059669",
                                borderRadius: "9999px",
                                padding: "0.25rem 0.625rem",
                                fontSize: "0.6875rem",
                                fontWeight: 700,
                              }}
                            >
                              Statement
                            </span>
                            <span
                              style={{
                                backgroundColor: "#ede9fe",
                                border: "1px solid #ddd6fe",
                                color: "#6d4bd8",
                                borderRadius: "9999px",
                                padding: "0.25rem 0.625rem",
                                fontSize: "0.6875rem",
                                fontFamily: "monospace",
                                fontWeight: 600,
                              }}
                            >
                              π 6ac6cfa8c4..
                            </span>
                            <span
                              style={{
                                backgroundColor: "#6d28d9",
                                color: "#ffffff",
                                borderRadius: "9999px",
                                padding: "0.25rem 0.625rem",
                                fontSize: "0.6875rem",
                                fontFamily: "monospace",
                                fontWeight: 700,
                              }}
                            >
                              secret-B-q92m
                            </span>
                          </div>

                          {/* Status Badge */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              backgroundColor: "#fee2e2",
                              border: "1px solid #fca5a5",
                              color: "#dc2626",
                              borderRadius: "9999px",
                              padding: "0.1875rem 0.5rem",
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                            }}
                          >
                            ⚠ ถูกตีกลับ
                          </span>
                        </div>

                        {/* Right Arrow Circle (Purple) */}
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            minWidth: "28px",
                            minHeight: "28px",
                            borderRadius: "50%",
                            backgroundColor: "#7c3aed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            flexShrink: 0,
                          }}
                        >
                          <ArrowRight style={{ width: "14px", height: "14px" }} />
                        </div>
                      </div>

                      {/* Card 6: Verifier rejects */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.875rem" }} className="lab5-animate-merge-up">
                        {/* Left Arrow Circle (Green) */}
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            minWidth: "28px",
                            minHeight: "28px",
                            borderRadius: "50%",
                            backgroundColor: "#10b981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            flexShrink: 0,
                          }}
                        >
                          <ArrowLeft style={{ width: "14px", height: "14px" }} />
                        </div>

                        <div
                          style={{
                            flex: "0 1 420px",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "1rem",
                            padding: "1rem 1.125rem",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                          }}
                        >
                          <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.6875rem", fontWeight: 700, color: "#dc2626" }}>
                            Verifier → คุณ
                          </p>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "#1e293b", lineHeight: 1.55 }}>
                            หยุดก่อน! ผมไม่ต้องการ Witness ครับ — แค่ Statement + π กับ Verification Key ก็ตรวจได้แล้ว ถ้าผมเปิดดูผมจะเห็นรหัสลับของคุณทันที ผมขอไม่เปิดข้อความนี้ ส่งใหม่แค่ Statement + π พอ
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* GREEN ACCEPTED STATE (Image 2) */
                    <>
                      {/* Card 5: Prover sends Statement + Proof π */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }} className="lab5-animate-merge-up">
                        <div
                          style={{
                            flex: "0 1 420px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "1rem",
                            padding: "1rem 1.125rem",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                          }}
                        >
                          <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.6875rem", fontWeight: 700, color: "#6d4bd8" }}>
                            คุณ → Verifier
                          </p>
                          <p style={{ margin: "0 0 0.625rem 0", fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b" }}>
                            Statement + Proof π
                          </p>

                          {/* Pills */}
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
                            <span
                              style={{
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                color: "#059669",
                                borderRadius: "9999px",
                                padding: "0.25rem 0.625rem",
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                              }}
                            >
                              Statement · Root 592ed5ae
                            </span>
                            <span
                              style={{
                                backgroundColor: "#f5f3ff",
                                border: "1px solid #ddd6fe",
                                color: "#6d4bd8",
                                borderRadius: "9999px",
                                padding: "0.25rem 0.625rem",
                                fontSize: "0.6875rem",
                                fontFamily: "monospace",
                                fontWeight: 600,
                              }}
                            >
                              π 57dd064b73..
                            </span>
                          </div>
                        </div>

                        {/* Right Arrow Circle (Purple) */}
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            minWidth: "28px",
                            minHeight: "28px",
                            borderRadius: "50%",
                            backgroundColor: "#7c3aed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            flexShrink: 0,
                          }}
                        >
                          <ArrowRight style={{ width: "14px", height: "14px" }} />
                        </div>
                      </div>

                      {/* Card 6: Verifier verifies (Dashed Green Card, Image 2) */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.875rem" }} className="lab5-animate-merge-up">
                        {/* Green Dashed Circle with Shield */}
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            minWidth: "28px",
                            minHeight: "28px",
                            borderRadius: "50%",
                            border: "1px dashed #6ee7b7",
                            backgroundColor: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#059669",
                            flexShrink: 0,
                          }}
                        >
                          <ShieldCheck style={{ width: "14px", height: "14px" }} />
                        </div>

                        <div
                          style={{
                            flex: "0 1 420px",
                            backgroundColor: "#ffffff",
                            border: "1px dashed #6ee7b7",
                            borderRadius: "1rem",
                            padding: "1rem 1.125rem",
                            boxShadow: "0 1px 2px rgba(16, 185, 129, 0.05)",
                          }}
                        >
                          <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.6875rem", fontWeight: 700, color: "#059669" }}>
                            Verifier ตรวจเอง
                          </p>
                          <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <span>⑤ Verify — ตรวจด้วย Verification Key...</span>
                            <span style={{ color: "#059669" }}>✅ ยอมรับ</span>
                          </p>
                          <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.75rem", color: "#1e293b", lineHeight: 1.5 }}>
                            ผมเชื่อว่ามีออร์เดอร์ใต้ Root นี้ที่เป็นของคุณ แต่ไม่รู้ว่าใบไหน และไม่เห็นรหัสลับเลย
                          </p>
                          <p style={{ margin: 0, fontSize: "0.6875rem", color: "#64748b" }}>
                            ไม่ต้องถามกลับสักคำ — ข้อความข้ามเส้นแค่ 1 ครั้ง
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Action Bar (Stage 1-4: Next button | Stage 5: Choice buttons) */}
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#f8fafc",
            padding: "1rem 1.25rem",
          }}
        >
          {currentStage < 5 ? (
            <div>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>
                ขั้นต่อไป:
              </p>

              <button
                type="button"
                onClick={handleNextAction}
                style={{
                  width: "100%",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "9999px",
                  backgroundColor: "#7c3aed",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.625rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    minWidth: "20px",
                    minHeight: "20px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {currentStage}
                </div>
                <span>{PIPELINE_PARTS[currentStage - 1].action}</span>
                <ArrowRight style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
                <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                  พร้อมส่งแล้ว — คุณจะส่งอะไรข้ามเส้นไป?
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    fontSize: "0.6875rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  <RotateCcw style={{ width: "11px", height: "11px" }} />
                  เริ่มใหม่ตั้งแต่ขั้นที่ 1
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.625rem" }}>
                <button
                  type="button"
                  onClick={() => setSendChoice("with_witness")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    borderRadius: "9999px",
                    border: !isZkAccepted ? "1.5px solid #7c3aed" : "1px solid #ddd6fe",
                    backgroundColor: !isZkAccepted ? "#f5f3ff" : "#ffffff",
                    padding: "0.5rem 1rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#6d4bd8",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      minWidth: "18px",
                      borderRadius: "50%",
                      backgroundColor: !isZkAccepted ? "#7c3aed" : "rgba(109, 40, 217, 0.1)",
                      color: !isZkAccepted ? "#ffffff" : "#6d4bd8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.625rem",
                      fontWeight: 700,
                    }}
                  >
                    ⑤
                  </span>
                  <span>ส่ง Statement + π + Witness (ให้ชัวร์)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendStatement}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    borderRadius: "9999px",
                    border: isZkAccepted ? "1.5px solid #10b981" : "1px solid #ddd6fe",
                    backgroundColor: isZkAccepted ? "#ecfdf5" : "#ffffff",
                    padding: "0.5rem 1rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: isZkAccepted ? "#059669" : "#6d4bd8",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      minWidth: "18px",
                      borderRadius: "50%",
                      backgroundColor: isZkAccepted ? "#10b981" : "rgba(109, 40, 217, 0.1)",
                      color: isZkAccepted ? "#ffffff" : "#6d4bd8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.625rem",
                      fontWeight: 700,
                    }}
                  >
                    ⑤
                  </span>
                  <span>ส่ง Statement + π</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar (Inside card) */}
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#ffffff",
            padding: "0.875rem 1.25rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {/* Line 1 Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  marginRight: "0.25rem",
                }}
              >
                <Eye style={{ width: "14px", height: "14px", color: "#64748b" }} />
                สิ่งที่ Verifier รู้ตอนนี้
              </span>

              {/* ✓ Root */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  borderRadius: "9999px",
                  border: "1px solid #a7f3d0",
                  backgroundColor: "#ecfdf5",
                  padding: "0.25rem 0.625rem",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "#059669",
                }}
              >
                <Check style={{ width: "12px", height: "12px" }} />
                Root
              </span>

              {/* ✓ Circuit + Verification Key */}
              {completedStages.includes(2) && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    borderRadius: "9999px",
                    border: "1px solid #a7f3d0",
                    backgroundColor: "#ecfdf5",
                    padding: "0.25rem 0.625rem",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#059669",
                  }}
                >
                  <Check style={{ width: "12px", height: "12px" }} />
                  Circuit + Verification Key
                </span>
              )}

              {/* Badges that unlock when isZkAccepted (Image 2) */}
              {isZkAccepted && (
                <>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      borderRadius: "9999px",
                      border: "1px solid #a7f3d0",
                      backgroundColor: "#ecfdf5",
                      padding: "0.25rem 0.625rem",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: "#059669",
                    }}
                  >
                    <Check style={{ width: "12px", height: "12px" }} />
                    Statement
                  </span>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      borderRadius: "9999px",
                      border: "1px solid #a7f3d0",
                      backgroundColor: "#ecfdf5",
                      padding: "0.25rem 0.625rem",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: "#059669",
                    }}
                  >
                    <Check style={{ width: "12px", height: "12px" }} />
                    Proof π
                  </span>
                </>
              )}
            </div>

            {/* Line 2 Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
              {isZkAccepted && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    borderRadius: "9999px",
                    border: "1px solid #a7f3d0",
                    backgroundColor: "#ecfdf5",
                    padding: "0.25rem 0.625rem",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#059669",
                  }}
                >
                  <Check style={{ width: "12px", height: "12px" }} />
                  ผลลัพธ์: จริง
                </span>
              )}

              {/* 🔒 รหัสลับ */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  borderRadius: "9999px",
                  border: "1px dashed #cbd5e1",
                  backgroundColor: "#ffffff",
                  padding: "0.25rem 0.625rem",
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  color: "#64748b",
                }}
              >
                <Lock style={{ width: "12px", height: "12px" }} />
                รหัสลับ
              </span>

              {/* 🔒 ว่าเป็นใบไหน */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  borderRadius: "9999px",
                  border: "1px dashed #cbd5e1",
                  backgroundColor: "#ffffff",
                  padding: "0.25rem 0.625rem",
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  color: "#64748b",
                }}
              >
                <Lock style={{ width: "12px", height: "12px" }} />
                ว่าเป็นใบไหน
              </span>

              {/* 🔒 Hash ข้าง ๆ + ตำแหน่ง */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  borderRadius: "9999px",
                  border: "1px dashed #cbd5e1",
                  backgroundColor: "#ffffff",
                  padding: "0.25rem 0.625rem",
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  color: "#64748b",
                }}
              >
                <Lock style={{ width: "12px", height: "12px" }} />
                Hash ข้าง ๆ + ตำแหน่ง
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            <RotateCcw style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
            <span>
              ข้อความที่ข้ามเส้น:{" "}
              <strong style={{ color: "#1e293b", fontWeight: 700 }}>
                {crossedCount}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Green Success Banner (Appears below Arena when isZkAccepted — Matching Image 2) */}
      {isZkAccepted && (
        <div
          style={{
            borderRadius: "1rem",
            border: "1px solid #a7f3d0",
            backgroundColor: "#f0fdf4",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
          className="lab5-animate-merge-up"
        >
          <CheckCircle2 style={{ width: "20px", height: "20px", color: "#059669", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.875rem", fontWeight: 700, color: "#047857" }}>
              Verifier ยอมรับ: Proof ถูกต้อง
            </p>
            <p style={{ margin: "0 0 0.375rem 0", fontSize: "0.75rem", fontWeight: 500, color: "#065f46", lineHeight: 1.5 }}>
              Verifier เชื่อได้ว่า "มีออร์เดอร์หนึ่งใบใต้ Root นี้ที่เป็นของผู้ส่ง" — แต่ไม่รู้เลยว่าคือออร์เดอร์ B และไม่เห็นรหัสลับ
            </p>
            <p style={{ margin: 0, fontSize: "0.6875rem", color: "#047857", opacity: 0.85 }}>
              เทียบกับขั้นที่ 5: ข้อความที่ข้ามเส้นเหลือแค่ 1 ข้อความ และไม่มีป้ายแดงเลย
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          borderRadius: "9999px",
          border: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          padding: "0.625rem 1rem",
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
        }}
      >
        <AlertTriangle style={{ width: "15px", height: "15px", color: "#f59e0b", flexShrink: 0 }} />
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
          แลปนี้จำลองขั้นตอนเพื่อการเรียนรู้ — ผลตรวจมาจากการคำนวณ Hash จริงเบื้องหลัง แต่ไม่ได้สร้าง zk-SNARK ด้วยคณิตศาสตร์จริง
        </span>
      </div>

      {/* ? ทำไม? Button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={() => setIsWhyOpen(!isWhyOpen)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            borderRadius: "9999px",
            border: "1px solid #ede9fe",
            backgroundColor: "#f5f3ff",
            padding: "0.5rem 1rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#6d4bd8",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <HelpCircle style={{ width: "14px", height: "14px", color: "#7c3aed" }} />
          <span>ทำไม?</span>
          <ChevronDown
            style={{
              width: "14px",
              height: "14px",
              transform: isWhyOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.15s ease",
            }}
          />
        </button>

        {isWhyOpen && (
          <div
            style={{
              width: "100%",
              borderRadius: "1rem",
              border: "1px solid #ede9fe",
              backgroundColor: "rgba(245, 243, 255, 0.7)",
              padding: "1rem",
            }}
          >
            <h4
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#4c1d95",
              }}
            >
              ทำไม zk-SNARK ถึงเรียกว่า "เครื่องตรวจปิดผนึก"?
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem", color: "#5b21b6" }}>
              <p style={{ margin: 0 }}>
                <strong>1. Zero-Knowledge:</strong> ใน Merkle Proof แบบเดิม Verifier ต้องเห็นรหัสลับและ Sibling Hashes เพื่อคำนวณขึ้นไปหา Root แต่ zk-SNARK ให้เครื่องของคุณเป็นคนตรวจความถูกต้องเอง แล้วสร้าง <em>"หลักฐานทางคณิตศาสตร์"</em> ยืนยันว่าผลตรวจเป็นจริง โดยไม่ต้องส่งข้อมูลลับออกมา
              </p>
              <p style={{ margin: 0 }}>
                <strong>2. Succinct (กะทัดรัด):</strong> ไม่ว่าต้นไม้จะมีกี่พันใบ ตัว Proof จะมีขนาดคงที่เล็กมาก (หลักร้อยไบต์) และ Verifier ใช้เวลาตรวจสั้นมากเพียงเสี้ยววินาที
              </p>
              <p style={{ margin: 0 }}>
                <strong>3. Non-Interactive:</strong> ส่ง Proof ข้ามเส้นไปเพียงครั้งเดียว (1 ข้อความ) ผู้ตรวจก็ยืนยันได้ทันที ไม่ต้องมีการถาม-ตอบส่งกลับไปกลับมา
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


/** ขั้นย่อยของเวิร์กโฟลว์ ZKP (ขั้นที่ 7) */
const zkpWorkflowStages = [
  { title: "Root ที่ประกาศไว้", sub: "Committed Root" },
  { title: "ข้อมูลลับของผู้ใช้", sub: "Private Witness" },
  { title: "สร้าง Proof", sub: "ZK circuit (จำลอง)" },
  { title: "หลักฐาน", sub: "Proof — จำลอง" },
]

/**
 * ป้ายแคปซูลสำหรับแสดงค่า hash หรือข้อมูลสั้น ๆ
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} [props.tone="neutral"] โทนสี ("neutral", "primary", "success", "danger")
 * @param {boolean} [props.isDashed=false] ใช้เส้นขอบประหรือไม่
 * @param {string} [props.label] ข้อความตัวหนานำหน้า
 * @param {React.ReactNode} props.children เนื้อหาภายในป้าย
 * @param {string} [props.className] ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} ป้ายแคปซูล
 * @author StealthTrade Team
 */
function ZkChip({ tone = "neutral", isDashed = false, label, children, className }) {
  return (
    <span className={JoinClassNames("lab5-zk-chip", `lab5-zk-chip--${tone}`, isDashed && "lab5-zk-chip--dashed", className)}>
      {label && <span className="lab5-zk-chip-label">{label}</span>}
      {children}
    </span>
  )
}

/**
 * ป้ายแคปซูลแสดงค่า hash แบบย่อ กดเพื่อดูค่าเต็ม (และคัดลอกได้) กดอีกครั้งเพื่อย่อกลับ
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} props.hash ค่า hash เต็ม
 * @param {string} [props.tone="neutral"] โทนสี ("neutral", "white", "primary", "success", "danger")
 * @param {boolean} [props.isDashed=false] ใช้เส้นขอบประหรือไม่
 * @param {string} [props.label] ข้อความตัวหนานำหน้า
 * @param {string} [props.className] ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} ปุ่มแสดง hash
 * @author StealthTrade Team
 */
function HashChip({ hash, tone = "neutral", isDashed = false, label, className }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  /**
   * คัดลอกค่า hash เต็มลงคลิปบอร์ด และแสดงสถานะ "คัดลอกแล้ว" ชั่วครู่
   *
   * @param {React.MouseEvent} event อีเวนต์คลิก (หยุดไม่ให้ย่อ hash กลับ)
   * @return {Promise<void>}
   * @author StealthTrade Team
   */
  const copyHash = async (event) => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(hash)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  if (!hash) return null

  return (
    <span
      role="button"
      tabIndex={0}
      title={isExpanded ? "กดเพื่อย่อ" : "กดเพื่อดูค่าเต็ม"}
      aria-expanded={isExpanded}
      onClick={() => setIsExpanded((previousIsExpanded) => !previousIsExpanded)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          setIsExpanded((previousIsExpanded) => !previousIsExpanded)
        }
      }}
      className={JoinClassNames(
        "lab5-zk-chip lab5-hash-chip",
        `lab5-zk-chip--${tone}`,
        isDashed && "lab5-zk-chip--dashed",
        isExpanded && "lab5-hash-chip--expanded",
        className,
      )}
    >
      {label && <span className="lab5-zk-chip-label">{label}</span>}
      <span className="lab5-hash-chip-value">{isExpanded ? hash : TruncateHash(hash)}</span>
      {isExpanded && (
        <button type="button" onClick={copyHash} className="lab5-hash-chip-copy" aria-label="คัดลอก hash">
          {isCopied ? <Check className="lab5-size-3" /> : <Copy className="lab5-size-3" />}
        </button>
      )}
    </span>
  )
}

/**
 * หัวการ์ดที่มีไอคอนวงกลม หัวข้อ และคำอธิบาย
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {React.ComponentType} props.icon ไอคอน
 * @param {string} [props.tone="primary"] โทนของวงกลมไอคอน ("primary", "success", "neutral")
 * @param {string} props.title หัวข้อ
 * @param {string} [props.description] คำอธิบาย
 * @param {boolean} [props.isCompact=false] ใช้ขนาดเล็ก (หัวการ์ดผู้พิสูจน์/ผู้ตรวจสอบ)
 * @return {JSX.Element} หัวการ์ด
 * @author StealthTrade Team
 */
function ZkCardHeader({ icon: Icon, tone = "primary", title, description, isCompact = false }) {
  return (
    <div className={JoinClassNames("lab5-zk-card-header", isCompact && "lab5-zk-card-header--compact")}>
      <span className={JoinClassNames("lab5-zk-icon-circle", `lab5-zk-icon-circle--${tone}`)}>
        <Icon className="lab5-size-4" />
      </span>
      <div className="lab5-min-w-0">
        <p className="lab5-zk-card-title">{title}</p>
        {description && <p className="lab5-zk-card-desc">{description}</p>}
      </div>
    </div>
  )
}

/**
 * ขั้นที่ 7: เวิร์กโฟลว์ ZKP (จำลอง) — ประกาศ Root → ข้อมูลลับของผู้ใช้ → สร้าง Proof → หลักฐาน
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 7
 * @author StealthTrade Team
 */
function Step7ZkpWorkflow() {
  const { markComplete } = useLab05()
  const [balance, setBalance] = useState(42)
  const [purchaseAmount, setPurchaseAmount] = useState(10)
  const [hasSubmitted, setHasSubmitted] = useState(true)
  const [triedSufficient, setTriedSufficient] = useState(true)
  const [triedInsufficient, setTriedInsufficient] = useState(false)
  const [submissionLog, setSubmissionLog] = useState([
    { id: 1, amount: 10, balance: 42, sufficient: true, proof: '3a05a60c..' },
  ])

  const isSufficient = balance >= purchaseAmount

  const handleSubmit = () => {
    setHasSubmitted(true)
    const sufficient = balance >= purchaseAmount
    const proofHash = sufficient ? '3a05a60c..' : null
    setSubmissionLog((prev) => [
      ...prev,
      { id: prev.length + 1, amount: purchaseAmount, balance, sufficient, proof: proofHash },
    ])
    if (sufficient) {
      setTriedSufficient(true)
      if (triedInsufficient && typeof markComplete === 'function') {
        markComplete(7)
      }
    } else {
      setTriedInsufficient(true)
      if (triedSufficient && typeof markComplete === 'function') {
        markComplete(7)
      }
    }
  }

  const handleSelectCase = (b, p) => {
    setBalance(b)
    setPurchaseAmount(p)
    setHasSubmitted(true)
    const sufficient = b >= p
    const proofHash = sufficient ? '3a05a60c..' : null
    setSubmissionLog((prev) => {
      const alreadyHas = prev.some((r) => r.amount === p && r.sufficient === sufficient)
      if (alreadyHas) return prev
      return [
        ...prev,
        { id: prev.length + 1, amount: p, balance: b, sufficient, proof: proofHash },
      ]
    })
    if (sufficient) {
      setTriedSufficient(true)
      if (triedInsufficient && typeof markComplete === 'function') {
        markComplete(7)
      }
    } else {
      setTriedInsufficient(true)
      if (triedSufficient && typeof markComplete === 'function') {
        markComplete(7)
      }
    }
  }

  useEffect(() => {
    if (triedSufficient && triedInsufficient && typeof markComplete === 'function') {
      markComplete(7)
    }
  }, [triedSufficient, triedInsufficient, markComplete])

  return (
    <div className="lab5-s7-wrapper">
      {/* Header */}
      <div>
        <div className="lab5-s7-tag">ลองสร้าง PROOF เอง</div>
        <h2 className="lab5-s7-heading">พิสูจน์ว่ามีเงินพอ โดยไม่บอกยอดเงิน</h2>
        <p className="lab5-s7-desc">
          กรอกยอดเงินในกระเป๋า (ลับ) และจำนวนเงินที่จะใช้ซื้อ (สาธารณะ) แล้วกดส่ง — ลองให้ครบทั้งกรณีเงินพอและเงินไม่พอ
        </p>
      </div>

      {/* Dual Input Cards with Center Circuit */}
      <div className="lab5-s7-cards-grid">
        {/* Left Card: Witness */}
        <div className="lab5-s7-card lab5-s7-card--witness">
          <div className="lab5-s7-card-header">
            <div className="lab5-s7-card-icon lab5-s7-card-icon--purple">
              <Wallet size={20} />
            </div>
            <div>
              <div className="lab5-s7-card-title">Witness — ในเครื่องคุณ</div>
              <div className="lab5-s7-card-subtitle">ไม่ถูกส่งออกไปไหน</div>
            </div>
          </div>
          <div>
            <label className="lab5-s7-input-label">ยอดเงินในกระเป๋า (USDT)</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => {
                setBalance(Number(e.target.value) || 0)
                setHasSubmitted(false)
              }}
              className="lab5-s7-input"
            />
          </div>
          <div>
            <span className="lab5-s7-badge--private">
              <Lock size={12} /> PRIVATE · เห็นเฉพาะคุณ
            </span>
          </div>
        </div>

        {/* Center: Circuit */}
        <div className="lab5-s7-circuit">
          <div className="lab5-s7-circuit-icon">
            <Cpu size={20} />
          </div>
          <div className="lab5-s7-circuit-label">Circuit</div>
          <div className="lab5-s7-circuit-cond">ยอดเงิน ≥ จำนวนซื้อ</div>
        </div>

        {/* Right Card: Statement */}
        <div className="lab5-s7-card lab5-s7-card--statement">
          <div className="lab5-s7-card-header">
            <div className="lab5-s7-card-icon lab5-s7-card-icon--green">
              <FileText size={20} />
            </div>
            <div>
              <div className="lab5-s7-card-title">Statement — ส่งให้เว็บเทรด</div>
              <div className="lab5-s7-card-subtitle">ทุกคนเห็นได้</div>
            </div>
          </div>
          <div>
            <label className="lab5-s7-input-label">จำนวนเงินที่จะใช้ซื้อ (USDT)</label>
            <input
              type="number"
              value={purchaseAmount}
              onChange={(e) => {
                setPurchaseAmount(Number(e.target.value) || 0)
                setHasSubmitted(false)
              }}
              className="lab5-s7-input"
            />
          </div>
          <div>
            <span className="lab5-s7-badge--public">
              <Eye size={12} /> PUBLIC · ทุกคนเห็น
            </span>
          </div>
        </div>
      </div>

      {/* Presets Row */}
      <div className="lab5-s7-presets">
        <span className="lab5-s7-presets-label">ลองเร็ว ๆ:</span>
        {[
          { label: 'มี 42 · ซื้อ 10', b: 42, p: 10 },
          { label: 'มี 5 · ซื้อ 10', b: 5, p: 10 },
          { label: 'มี 10 · ซื้อ 10', b: 10, p: 10 },
        ].map((item) => {
          const isSelected = balance === item.b && purchaseAmount === item.p
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSelectCase(item.b, item.p)}
              className={`lab5-s7-preset-btn${isSelected ? ' lab5-s7-preset-btn--active' : ''}`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Arena card */}
      <div className="lab5-s7-arena">
        {/* Header: Prover / Verifier */}
        <div className="lab5-s7-arena-header">
          <div className="lab5-s7-arena-party">
            <div className="lab5-s7-arena-avatar lab5-s7-arena-avatar--prover">
              <User size={18} />
            </div>
            <div>
              <div className="lab5-s7-arena-name">คุณ</div>
              <div className="lab5-s7-arena-role">Prover</div>
            </div>
          </div>
          <div className="lab5-s7-arena-party">
            <div style={{ textAlign: 'right' }}>
              <div className="lab5-s7-arena-name lab5-s7-arena-name--verifier">ผู้ตรวจ</div>
              <div className="lab5-s7-arena-role">Verifier</div>
            </div>
            <div className="lab5-s7-arena-avatar lab5-s7-arena-avatar--verifier">
              <ShieldCheck size={18} />
            </div>
          </div>
        </div>

        {/* Arena Body — Swimlane Sequence (Matches media_1792536608390.png) */}
        <div className="lab5-s7-swimlane">
          {/* Row 1: Prover Private Local Check */}
          <div className="lab5-s7-swim-row">
            <div className="lab5-s7-swim-col--left">
              <div className={`lab5-s7-bubble-private ${!isSufficient && hasSubmitted ? 'lab5-s7-bubble-private--fail' : ''}`}>
                <div className={`lab5-s7-bubble-tag ${!isSufficient && hasSubmitted ? 'lab5-s7-bubble-tag--fail' : ''}`}>
                  ในเครื่องคุณ · ไม่ส่งออก
                </div>
                <div className="lab5-s7-bubble-text">
                  {isSufficient ? (
                    <>
                      <Lock size={13} className="lab5-s7-inline-icon" /> วงจรตรวจในเครื่อง: ยอดเงิน {balance} ≥ {purchaseAmount} ✓ → ได้ Proof π
                    </>
                  ) : (
                    <>
                      <XCircle size={13} className="lab5-s7-inline-icon lab5-s7-text-fail" /> ยอดเงิน {balance} &lt; {purchaseAmount} → สร้าง Proof ไม่ได้!
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="lab5-s7-swim-col--mid">
              <div className={`lab5-s7-mid-icon-circle ${!isSufficient && hasSubmitted ? 'lab5-s7-mid-icon-circle--fail' : 'lab5-s7-mid-icon-circle--purple'}`}>
                <Lock size={15} />
              </div>
            </div>
            <div className="lab5-s7-swim-col--right" />
          </div>

          {/* Row 2: Send Statement & Proof across boundary */}
          <div className="lab5-s7-swim-row">
            <div className="lab5-s7-swim-col--left">
              <div className="lab5-s7-bubble-send">
                <div className="lab5-s7-send-header">คุณ → Verifier</div>
                <div className="lab5-s7-send-title">ขอซื้อ {purchaseAmount} USDT</div>
                <div className="lab5-s7-send-chips">
                  <span className="lab5-s7-chip-statement">
                    Statement: จ่าย {purchaseAmount} USDT
                  </span>
                  {isSufficient ? (
                    <span className="lab5-s7-chip-proof">
                      π 3a05a60c..
                    </span>
                  ) : (
                    <span className="lab5-s7-chip-proof-fail">
                      ไม่มี Proof
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="lab5-s7-swim-col--mid">
              <div className={`lab5-s7-mid-btn-arrow ${!isSufficient && hasSubmitted ? 'lab5-s7-mid-btn-arrow--fail' : ''}`}>
                {isSufficient ? '→' : '✖'}
              </div>
            </div>
            <div className="lab5-s7-swim-col--right" />
          </div>

          {/* Row 3: Verifier Verification on Right */}
          <div className="lab5-s7-swim-row">
            <div className="lab5-s7-swim-col--left" />
            <div className="lab5-s7-swim-col--mid">
              <div className={`lab5-s7-mid-icon-circle ${!isSufficient && hasSubmitted ? 'lab5-s7-mid-icon-circle--fail' : 'lab5-s7-mid-icon-circle--green'}`}>
                {isSufficient ? <ShieldCheck size={16} /> : <Shield size={16} />}
              </div>
            </div>
            <div className="lab5-s7-swim-col--right">
              <div className={`lab5-s7-bubble-verifier ${!isSufficient && hasSubmitted ? 'lab5-s7-bubble-verifier--fail' : ''}`}>
                <div className={`lab5-s7-verifier-tag ${!isSufficient && hasSubmitted ? 'lab5-s7-verifier-tag--fail' : ''}`}>
                  Verifier ตรวจเอง
                </div>
                <div className="lab5-s7-verifier-text">
                  {isSufficient ? (
                    <>
                      ตรวจ π แล้ว <span className="lab5-s7-mark-accept">✅ ยอมรับคำสั่งซื้อ</span> — ผมรู้แค่ว่า &quot;เงินพอ&quot; ไม่รู้ว่าคุณมีเท่าไหร่
                    </>
                  ) : (
                    <>
                      ไม่ได้รับ Proof → <span className="lab5-s7-mark-reject">❌ ปฏิเสธคำสั่งซื้อ</span> — ต้องมีหลักฐานยืนยันยอดเงิน
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="lab5-s7-action-wrap">
          <button type="button" onClick={handleSubmit} className="lab5-s7-submit-btn">
            <Sparkles size={16} /> สร้าง Proof แล้วส่งคำสั่งซื้อ
          </button>
        </div>

        {/* Footer */}
        <div className="lab5-s7-footer">
          <div className="lab5-s7-footer-left">
            <span className="lab5-s7-footer-label">
              <Eye size={14} color="#16a34a" /> สิ่งที่ Verifier รู้ตอนนี้
            </span>
            <span className="lab5-s7-footer-badge--secret">
              <Lock size={12} /> ยอดเงินจริงในกระเป๋า
            </span>
            <span className="lab5-s7-footer-badge--public">
              <Check size={12} strokeWidth={2.5} /> จำนวนเงินที่จะซื้อ
            </span>
          </div>
          <div>
            <span className="lab5-s7-footer-counter">
              <RotateCcw size={13} /> ข้อความที่ข้ามเส้น: {hasSubmitted && isSufficient ? 1 : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Checklist (Matches media_1792536621314.png) */}
      <div className="lab5-s7-checklist">
        <button
          type="button"
          onClick={() => handleSelectCase(42, 10)}
          className={`lab5-s7-check-btn ${isSufficient ? 'lab5-s7-check-btn--done' : 'lab5-s7-check-btn--idle'}`}
        >
          {isSufficient ? <Check size={13} strokeWidth={2.5} /> : <span className="lab5-s7-check-circle" />}
          ลองกรณีเงินพอ
        </button>
        <button
          type="button"
          onClick={() => handleSelectCase(5, 10)}
          className={`lab5-s7-check-btn ${!isSufficient ? 'lab5-s7-check-btn--done' : 'lab5-s7-check-btn--idle'}`}
        >
          {!isSufficient ? <Check size={13} strokeWidth={2.5} /> : <span className="lab5-s7-check-circle" />}
          ลองกรณีเงินไม่พอ
        </button>
      </div>

      {/* Verifier Order Log Table (Directly below checklist, matches media_1792536621314.png) */}
      {submissionLog.length > 0 && (
        <div className="lab5-s7-verifier-table-wrap">
          <div className="lab5-s7-verifier-table-header">
            <div className="lab5-s7-verifier-table-title">มุมมองของเว็บเทรด (Verifier)</div>
            <div className="lab5-s7-verifier-table-subtitle">นี่คือทุกอย่างที่ฝั่งเว็บเทรดเห็นและบันทึกไว้</div>
          </div>
          <table className="lab5-s7-verifier-table">
            <thead>
              <tr>
                <th>คำสั่งซื้อที่ได้รับ</th>
                <th>ยอดเงินจริง</th>
                <th>ผล</th>
              </tr>
            </thead>
            <tbody>
              {submissionLog.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="lab5-s7-verifier-order-text">
                      #{row.id} ซื้อ {row.amount} USDT
                      {row.proof && <span className="lab5-s7-verifier-proof-chip"> · Proof {row.proof}</span>}
                      {!row.proof && <span style={{ color: '#94a3b8', fontSize: '11px' }}> · ไม่มี Proof</span>}
                    </span>
                  </td>
                  <td>
                    <span className="lab5-s7-verifier-hidden">
                      <Lock size={12} /> ซ่อน
                    </span>
                  </td>
                  <td>
                    <span className={`lab5-s7-verifier-result ${row.sufficient ? 'lab5-s7-verifier-result--accept' : 'lab5-s7-verifier-result--reject'}`}>
                      {row.sufficient ? 'ยอมรับ' : 'ปฏิเสธ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
/**
 * ขั้นที่ 8: ทำไม zk-SNARK ถึงเหมาะกับเว็บเทรด? (เทียบ Interactive Lab 03 กับ Non-Interactive zk-SNARK)
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 8
 * @author StealthTrade Team
 */
const S8_INTERACTIVE_ITEMS = [
  {
    id: 1,
    side: "prover",
    header: "คุณ → Verifier",
    title: "Commit รอบที่ 1 — ล็อกคำตอบไว้ก่อน แก้ทีหลังไม่ได้",
    badge: "c1 = 27366c0f..",
    badgeType: "purple",
    centerType: "arrow-purple",
  },
  {
    id: 2,
    side: "verifier",
    header: "Verifier → คุณ",
    title: (
      <>
        Challenge: ผมสุ่มได้ — ขอให้เปิดฝั่ง<strong>ซ้าย</strong>
      </>
    ),
    cardType: "challenge",
    centerType: "arrow-green",
  },
  {
    id: 3,
    side: "prover",
    header: "คุณ → Verifier",
    title: "Response: เปิดฝั่งซ้าย",
    badge: "คำตอบที่ล็อกไว้ใน c1",
    badgeType: "white",
    centerType: "arrow-purple",
  },
  {
    id: 4,
    side: "verifier",
    header: "Verifier ตรวจเอง",
    title: "✓ ตรงกับ Commit — รอบที่ 1 ผ่าน · ความมั่นใจ 50%",
    cardType: "check",
    centerType: "shield",
  },
  {
    id: 5,
    side: "prover",
    header: "คุณ → Verifier",
    title: "Commit รอบที่ 2 — ล็อกคำตอบไว้ก่อน แก้ทีหลังไม่ได้",
    badge: "c2 = ef0692ac..",
    badgeType: "purple",
    centerType: "arrow-purple",
  },
  {
    id: 6,
    side: "verifier",
    header: "Verifier → คุณ",
    title: (
      <>
        Challenge: ผมสุ่มได้ — ขอให้เปิดฝั่ง<strong>ขวา</strong>
      </>
    ),
    cardType: "challenge",
    centerType: "arrow-green",
  },
  {
    id: 7,
    side: "prover",
    header: "คุณ → Verifier",
    title: "Response: เปิดฝั่งขวา",
    badge: "คำตอบที่ล็อกไว้ใน c2",
    badgeType: "white",
    centerType: "arrow-purple",
  },
  {
    id: 8,
    side: "verifier",
    header: "Verifier ตรวจเอง",
    title: "✓ ตรงกับ Commit — รอบที่ 2 ผ่าน · ความมั่นใจ 75%",
    cardType: "check",
    centerType: "shield",
  },
]

/**
 * ขั้นที่ 8: ทำไม zk-SNARK ถึงเหมาะกับเว็บเทรด? (เทียบ Interactive Lab 03 กับ Non-Interactive zk-SNARK)
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 8
 * @author StealthTrade Team
 */
function Step8MerkleZkp() {
  const { markComplete } = useLab05()
  const [activeTab, setActiveTab] = useState("interactive") // "interactive" | "snark"
  const isInteractive = activeTab === "interactive"

  // Interactive mode states
  const [itemsCount, setItemsCount] = useState(0) // 0 to 8
  const [isFastForwarded, setIsFastForwarded] = useState(false)
  const timerRef = useRef(null)

  // zk-SNARK mode states
  const [snarkKey, setSnarkKey] = useState(0)

  const [triedInteractive, setTriedInteractive] = useState(false)
  const [triedSnark, setTriedSnark] = useState(false)

  // Quiz states
  const [quizAnswer, setQuizAnswer] = useState(null)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleQuizAnswer = (ans) => {
    setQuizAnswer(ans)
    if (ans === "snark" && typeof markComplete === "function") {
      markComplete(8)
    }
  }

  // Interactive handler: เผยทีละอัน (Prover ส่ง -> Verifier ตอบรับ)
  const handleInteractiveNext = () => {
    if (itemsCount === 0) {
      setItemsCount(1)
      timerRef.current = setTimeout(() => {
        setItemsCount(2)
      }, 350)
    } else if (itemsCount === 2) {
      setItemsCount(3)
      timerRef.current = setTimeout(() => {
        setItemsCount(4)
      }, 350)
    } else if (itemsCount === 4) {
      setItemsCount(5)
      timerRef.current = setTimeout(() => {
        setItemsCount(6)
      }, 350)
    } else if (itemsCount === 6) {
      setItemsCount(7)
      timerRef.current = setTimeout(() => {
        setItemsCount(8)
      }, 350)
    }
  }

  const handleFastForward = () => {
    setIsFastForwarded(true)
    setTriedInteractive(true)
    if (triedSnark && typeof markComplete === "function") {
      markComplete(8)
    }
  }

  const handleResetInteractive = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setItemsCount(0)
    setIsFastForwarded(false)
  }

  // SNARK replay handler (Matches media_1792538943991.png)
  const handleSnarkReplay = () => {
    setSnarkKey((k) => k + 1)
    setTriedSnark(true)
    if (triedInteractive && typeof markComplete === "function") {
      markComplete(8)
    }
  }

  useEffect(() => {
    if (!isInteractive) {
      setTriedSnark(true)
    }
  }, [isInteractive])

  useEffect(() => {
    if (triedInteractive && triedSnark && typeof markComplete === "function") {
      markComplete(8)
    }
  }, [triedInteractive, triedSnark, markComplete])

  let crossingCount = 0
  let currentConfidence = 0

  if (isInteractive) {
    if (isFastForwarded) {
      crossingCount = 30
      currentConfidence = 99.9
    } else if (itemsCount >= 8) {
      crossingCount = 6
      currentConfidence = 75
    } else if (itemsCount >= 6) {
      crossingCount = 5
      currentConfidence = 50
    } else if (itemsCount >= 4) {
      crossingCount = 3
      currentConfidence = 50
    } else if (itemsCount >= 2) {
      crossingCount = 2
      currentConfidence = 0
    } else if (itemsCount >= 1) {
      crossingCount = 1
      currentConfidence = 0
    }
  } else {
    crossingCount = 1
    currentConfidence = 100
  }

  return (
    <div className="lab5-s8-wrapper">
      {/* Header */}
      <div className="lab5-s8-header">
        <span className="lab5-s8-tag">โต้ตอบหลายรอบ VS ส่งครั้งเดียว</span>
        <h2 className="lab5-s8-title">ทำไม zk-SNARK ถึงเหมาะกับเว็บเทรด?</h2>
        <p className="lab5-s8-subtitle">กดสลับเล่นทั้งสองแบบ</p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="lab5-s8-tabs-grid">
        <button
          type="button"
          onClick={() => setActiveTab("interactive")}
          className={`lab5-s8-tab-btn ${isInteractive ? "lab5-s8-tab-btn--interactive-active" : "lab5-s8-tab-btn--idle"}`}
        >
          <span className={`lab5-s8-tab-title ${isInteractive ? "lab5-s8-tab-title--rose" : "lab5-s8-tab-title--slate"}`}>
            Interactive (Lab 03)
          </span>
          <span className="lab5-s8-tab-sub">ถาม-ตอบกันหลายรอบ</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("snark")}
          className={`lab5-s8-tab-btn ${!isInteractive ? "lab5-s8-tab-btn--snark-active" : "lab5-s8-tab-btn--idle"}`}
        >
          <span className={`lab5-s8-tab-title ${!isInteractive ? "lab5-s8-tab-title--green" : "lab5-s8-tab-title--slate"}`}>
            Non-Interactive (zk-SNARK)
          </span>
          <span className="lab5-s8-tab-sub">ส่ง Proof ครั้งเดียวจบ</span>
        </button>
      </div>

      {/* Arena Card */}
      <div className="lab5-s8-arena">
        {/* Header */}
        <div className="lab5-s8-arena-header">
          <div className="lab5-s8-arena-party">
            <div className="lab5-s8-avatar--prover">
              <User size={16} />
            </div>
            <div>
              <div className="lab5-s8-name">คุณ</div>
              <div className="lab5-s8-role">Prover</div>
            </div>
          </div>
          <div className="lab5-s8-arena-party">
            <div style={{ textAlign: "right" }}>
              <div className="lab5-s8-name lab5-s8-name--verifier">ผู้ตรวจ</div>
              <div className="lab5-s8-role">Verifier</div>
            </div>
            <div className="lab5-s8-avatar--verifier">
              <ShieldCheck size={16} />
            </div>
          </div>
        </div>

        {/* Body Messages / Swimlane (Matches media_1792538195368.png and media_1792538943991.png) */}
        {isInteractive ? (
          itemsCount === 0 ? (
            <div className="lab5-s8-placeholder" style={{ padding: "40px 20px" }}>
              ยังไม่มีข้อความ — เริ่มส่ง Commit รอบที่ 1 จากปุ่มด้านล่าง
            </div>
          ) : (
            <div className="lab5-s8-swimlane">
              {S8_INTERACTIVE_ITEMS.slice(0, itemsCount).map((item) => (
                <div key={item.id} className="lab5-animate-merge-up lab5-s8-swim-row">
                  {/* Left Column (Prover) */}
                  <div className="lab5-s8-swim-left">
                    {item.side === "prover" ? (
                      <div className="lab5-s8-card-prover">
                        <div className="lab5-s8-header-prover">{item.header}</div>
                        <div className="lab5-s8-card-title">{item.title}</div>
                        {item.badge && (
                          <div className={item.badgeType === "purple" ? "lab5-s8-chip-purple" : "lab5-s8-chip-white"}>
                            {item.badge}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Center Column (Icons) */}
                  <div className="lab5-s8-swim-mid">
                    {item.centerType === "arrow-purple" && (
                      <div className="lab5-s8-circle-arrow-purple">
                        <ArrowRight size={15} strokeWidth={2.5} />
                      </div>
                    )}
                    {item.centerType === "arrow-green" && (
                      <div className="lab5-s8-circle-arrow-green">
                        <ArrowLeft size={15} strokeWidth={2.5} />
                      </div>
                    )}
                    {item.centerType === "shield" && (
                      <div className="lab5-s8-circle-shield">
                        <ShieldCheck size={16} strokeWidth={2} />
                      </div>
                    )}
                  </div>

                  {/* Right Column (Verifier) */}
                  <div className="lab5-s8-swim-right">
                    {item.side === "verifier" ? (
                      <div
                        className={
                          item.cardType === "check"
                            ? "lab5-s8-card-verifier-check"
                            : "lab5-s8-card-verifier-challenge"
                        }
                      >
                        <div className="lab5-s8-header-verifier">{item.header}</div>
                        <div className="lab5-s8-card-title">{item.title}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div key={snarkKey} className="lab5-animate-merge-up lab5-s8-swimlane">
            {/* Row 1: Prover Statement + Proof (Matches media_1792538943991.png) */}
            <div className="lab5-animate-merge-up lab5-s8-swim-row">
              <div className="lab5-s8-swim-left">
                <div className="lab5-s8-card-prover">
                  <div className="lab5-s8-header-prover">คุณ → Verifier</div>
                  <div className="lab5-s8-card-title">📦 Statement + Proof π</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                    <div className="lab5-s8-chip-green">Statement</div>
                    <div className="lab5-s8-chip-purple">π dfc4268059..</div>
                  </div>
                </div>
              </div>
              <div className="lab5-s8-swim-mid">
                <div className="lab5-s8-circle-arrow-purple">
                  <ArrowRight size={15} strokeWidth={2.5} />
                </div>
              </div>
              <div className="lab5-s8-swim-right" />
            </div>

            {/* Row 2: Verifier Check (Matches media_1792538943991.png) */}
            <div className="lab5-animate-merge-up lab5-s8-swim-row">
              <div className="lab5-s8-swim-left" />
              <div className="lab5-s8-swim-mid">
                <div className="lab5-s8-circle-shield">
                  <ShieldCheck size={16} strokeWidth={2} />
                </div>
              </div>
              <div className="lab5-s8-swim-right">
                <div className="lab5-s8-card-verifier-check">
                  <div className="lab5-s8-header-verifier">Verifier ตรวจเอง</div>
                  <div className="lab5-s8-card-title">
                    ตรวจด้วย Verification Key ได้ทันที ✅ ยอมรับ
                  </div>
                  <div className="lab5-s8-card-subtext">
                    ไม่ต้องถามกลับ ไม่ต้องออนไลน์พร้อมกัน<br />
                    และเก็บไว้ให้ใครตรวจซ้ำย้อนหลังก็ได้
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fast-forward simulated banner */}
        {isInteractive && isFastForwarded && (
          <div className="lab5-animate-merge-up lab5-s8-fastforward-banner">
            <Zap size={16} color="#7c3aed" />
            <span>⚡ จำลองการถาม-ตอบรอบที่ 3 ถึง 10 จนครบ 10 รอบ (ส่งข้อความข้ามเส้นรวม 30 ครั้ง) → ได้ความมั่นใจ 99.9%</span>
          </div>
        )}

        {/* Action Section (Matches media_1792538195368.png and media_1792538943991.png) */}
        <div className="lab5-s8-action-section">
          <div className="lab5-s8-action-label">ตาของคุณ:</div>
          <div className="lab5-s8-action-btn-row">
            {isInteractive ? (
              <>
                {itemsCount === 0 && (
                  <button type="button" onClick={handleInteractiveNext} className="lab5-s8-btn-submit">
                    รอบที่ 1: ส่ง Commit (ล็อกคำตอบ)
                  </button>
                )}
                {itemsCount === 2 && (
                  <button type="button" onClick={handleInteractiveNext} className="lab5-s8-btn-submit">
                    รอบที่ 1: ส่ง Response (เปิดฝั่งซ้าย)
                  </button>
                )}
                {itemsCount === 4 && (
                  <button type="button" onClick={handleInteractiveNext} className="lab5-s8-btn-submit">
                    รอบที่ 2: ส่ง Commit (ล็อกคำตอบ)
                  </button>
                )}
                {itemsCount === 6 && (
                  <button type="button" onClick={handleInteractiveNext} className="lab5-s8-btn-submit">
                    รอบที่ 2: ส่ง Response (เปิดฝั่งขวา)
                  </button>
                )}
                {itemsCount === 8 && !isFastForwarded && (
                  <button type="button" onClick={handleFastForward} className="lab5-s8-btn-submit">
                    <FastForward size={14} fill="currentColor" /> เร่งเวลา: ทำอีก 8 รอบที่เหลือ
                  </button>
                )}
                {(itemsCount === 1 || itemsCount === 3 || itemsCount === 5 || itemsCount === 7) && (
                  <button type="button" disabled className="lab5-s8-btn-submit" style={{ opacity: 0.75 }}>
                    กำลังรอคำตอบจาก Verifier...
                  </button>
                )}
                {isFastForwarded && (
                  <button type="button" disabled className="lab5-s8-btn-submit" style={{ opacity: 0.85, cursor: "default" }}>
                    <Check size={14} strokeWidth={2.5} /> ทำครบ 10 รอบแล้ว (ข้ามเส้น 30 ครั้ง)
                  </button>
                )}
                {itemsCount > 0 && (
                  <button type="button" onClick={handleResetInteractive} className="lab5-s8-btn-reset">
                    <RotateCcw size={13} /> รีเซ็ต
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={handleSnarkReplay}
                className="lab5-s8-btn-snark-replay"
              >
                <RotateCcw size={13} /> ส่งใหม่อีกครั้ง
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="lab5-s8-footer">
          <div className="lab5-s8-footer-left">
            <span className="lab5-s8-footer-title">
              <Eye size={13} color="#16a34a" /> ผลตอนนี้
            </span>
            {isInteractive ? (
              <>
                <span className="lab5-s8-badge--confidence">
                  <Check size={12} strokeWidth={2.5} /> ความมั่นใจตอนนี้ {currentConfidence}%
                </span>
                <span className="lab5-s8-badge--online">
                  {currentConfidence >= 99 ? (
                    <>
                      <Check size={12} color="#16a34a" /> ตรวจสอบสำเร็จ (ไม่ต้องคุยต่อแล้ว)
                    </>
                  ) : (
                    <>
                      <Lock size={12} /> ยังต้องออนไลน์คุยกันต่อ
                    </>
                  )}
                </span>
              </>
            ) : (
              <>
                <span className="lab5-s8-badge--confidence">
                  <Check size={12} strokeWidth={2.5} /> ความมั่นใจ ~100% จากข้อความเดียว
                </span>
                <span className="lab5-s8-badge--confidence">
                  <Check size={12} strokeWidth={2.5} /> ใครก็ตรวจซ้ำได้
                </span>
              </>
            )}
          </div>
          <div>
            <span className="lab5-s8-footer-counter">
              <RotateCcw size={12} /> ข้อความที่ข้ามเส้น: {isInteractive ? crossingCount : 1}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Pill for zk-SNARK (Matches media_1792538943991.png) */}
      {!isInteractive && (
        <div className="lab5-animate-merge-up lab5-s8-snark-summary-pill">
          <Check size={14} color="#16a34a" strokeWidth={2.5} />
          <span>
            รวม <strong>1 ข้อความ</strong> · ไม่ต้องออนไลน์พร้อมกัน · ใครก็ตรวจซ้ำได้
          </span>
        </div>
      )}

      {/* Comparison Table Card */}
      <div className="lab5-s8-table-card">
        <div className="lab5-s8-table-header">ตารางเปรียบเทียบ</div>
        <table className="lab5-s8-table">
          <thead>
            <tr>
              <th>หัวข้อ</th>
              <th>Interactive (Lab 03)</th>
              <th>zk-SNARK</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ต้องคุยกันกี่ครั้ง</td>
              <td>หลายรอบ (เช่น 10 รอบ = 30 ข้อความ)</td>
              <td className="lab5-s8-cell-green">1 ข้อความ</td>
            </tr>
            <tr>
              <td>ต้องออนไลน์พร้อมกันไหม</td>
              <td>ต้อง</td>
              <td className="lab5-s8-cell-green">ไม่ต้อง</td>
            </tr>
            <tr>
              <td>ขนาดหลักฐาน</td>
              <td>โตตามจำนวนรอบ</td>
              <td className="lab5-s8-cell-green">เล็กและคงที่</td>
            </tr>
            <tr>
              <td>ความเร็วในการตรวจ</td>
              <td>ช้าตามจำนวนรอบ</td>
              <td className="lab5-s8-cell-green">เร็วมาก (เสี้ยววินาที)</td>
            </tr>
            <tr>
              <td>คนอื่นตรวจซ้ำได้ไหม</td>
              <td>ไม่ได้ — เชื่อได้เฉพาะคนที่ถามเอง</td>
              <td className="lab5-s8-cell-green">ได้ — ใครก็ตรวจได้</td>
            </tr>
            <tr>
              <td>เหมาะกับ</td>
              <td>สอนแนวคิด, ระบบที่คุยกันสด ๆ</td>
              <td>ระบบจริงอย่างเว็บเทรด, blockchain</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Quiz Section (Matches media_1792537959400.png and media_1792538943991.png) */}
      <div className="lab5-s8-quiz-section">
        <div className="lab5-s8-quiz-question">
          ถ้าเว็บเทรดต้องรับคำสั่งซื้อ 100 รายการต่อวินาที แบบไหนเหมาะกว่า?
        </div>
        <div className="lab5-s8-quiz-options">
          <button
            type="button"
            onClick={() => handleQuizAnswer("interactive")}
            className={`lab5-s8-quiz-opt ${quizAnswer === "interactive" ? "lab5-s8-quiz-opt--wrong" : ""}`}
          >
            <span className={`lab5-s8-quiz-opt-title ${quizAnswer === "interactive" ? "lab5-s8-quiz-opt-title--wrong" : ""}`}>
              Interactive
            </span>
            <span className="lab5-s8-quiz-opt-desc">
              — ถาม-ตอบกับผู้ใช้ทีละคน ทีละรอบ
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleQuizAnswer("snark")}
            className={`lab5-s8-quiz-opt ${quizAnswer === "snark" ? "lab5-s8-quiz-opt--correct" : ""}`}
          >
            <span className={`lab5-s8-quiz-opt-title ${quizAnswer === "snark" ? "lab5-s8-quiz-opt-title--correct" : ""}`}>
              zk-SNARK (Non-Interactive)
            </span>
            <span className="lab5-s8-quiz-opt-desc">
              — แนบ Proof มากับคำสั่งซื้อเลย
            </span>
          </button>
        </div>

        {/* Correct Feedback Box (Matches media_1792538943991.png) */}
        {quizAnswer === "snark" && (
          <div className="lab5-animate-merge-up lab5-s8-quiz-correct-box">
            <div className="lab5-s8-quiz-correct-header">
              <CheckCircle2 size={16} color="#16a34a" strokeWidth={2.5} />
              <span>ถูกต้อง</span>
            </div>
            <div className="lab5-s8-quiz-correct-text">
              แนบ Proof มากับคำสั่งซื้อได้ทันที เว็บเทรดตรวจได้เร็ว ไม่ต้องรอโต้ตอบ และยังเก็บไว้ให้คนอื่นตรวจย้อนหลังได้ด้วย
            </div>
          </div>
        )}

        {/* Hint Button (Shown when not answered correctly) */}
        {quizAnswer !== "snark" && (
          <div>
            <button
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
              className="lab5-s8-quiz-hint-btn"
            >
              <HelpCircle size={14} />
              <span>ทำไม?</span>
            </button>
            {showHint && (
              <div className="lab5-animate-merge-up lab5-s8-quiz-hint-box" style={{ marginTop: 8 }}>
                <strong style={{ color: "#0f172a" }}>คำอธิบาย:</strong> ระบบจริงอย่างเว็บเทรดที่ต้องประมวลผลคำสั่งซื้อปริมาณมาก (High Throughput) ไม่สามารถรอคุยโต้ตอบหลายรอบกับผู้ใช้ทีละคนได้ เพราะเซิร์ฟเวอร์จะค้างและช้ามาก การใช้ zk-SNARK (Non-Interactive) ทำให้ผู้ใช้สามารถสร้าง Proof ไว้ล่วงหน้าแล้วแนบส่งมาพร้อมคำสั่งซื้อได้ทันที เว็บเทรดแค่ตรวจ Proof ครั้งเดียวในเสี้ยววินาที จึงรองรับการสเกลได้ดีกว่ามหาศาล
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ขั้นที่ 9: Merkle Tree + zk-SNARK ช่วยอะไรเรา? (สรุป Visibility Matrix)
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 9
 * @author StealthTrade Team
 */
function Step9Efficiency() {
  const { goToStep, reset, markComplete } = useLab05()
  const [activeTab, setActiveTab] = useState("merkle") // "merkle" | "snark"

  useEffect(() => {
    if (typeof markComplete === "function") {
      markComplete(9)
    }
  }, [markComplete])

  const isMerkleOnly = activeTab === "merkle"

  // Visibility matrix data (Matches media_1792539684391.png & media_1792540323633.png)
  const matrixData = [
    {
      label: "รหัสลับของออร์เดอร์",
      prover: "เห็น",
      verifier: isMerkleOnly ? "เห็น" : "ซ่อนด้วย ZKP",
      verifierHighlight: isMerkleOnly ? "red" : "red",
    },
    {
      label: "Hash ข้าง ๆ และตำแหน่ง",
      prover: "เห็น",
      verifier: isMerkleOnly ? "เห็น" : "ซ่อนด้วย ZKP",
      verifierHighlight: isMerkleOnly ? "red" : "red",
    },
    {
      label: "ว่าเป็นออร์เดอร์ใบไหน",
      prover: "เห็น",
      verifier: isMerkleOnly ? "เห็น" : "ซ่อนด้วย ZKP",
      verifierHighlight: isMerkleOnly ? "red" : "red",
    },
    {
      label: "Root ที่ประกาศไว้",
      prover: "เห็น",
      verifier: "เห็น",
      verifierHighlight: "normal",
    },
    {
      label: 'ผลลัพธ์ "จริง / ไม่จริง"',
      prover: "เห็น",
      verifier: "เห็น",
      verifierHighlight: "normal",
    },
  ]

  return (
    <div className="lab5-s9-wrapper">
      {/* Header */}
      <div className="lab5-s9-header">
        <span className="lab5-s9-tag">สรุป</span>
        <h2 className="lab5-s9-title">Merkle Tree + zk-SNARK ช่วยอะไรเรา?</h2>
        <p className="lab5-s9-subtitle">
          สลับดูว่าผู้ตรวจเห็นอะไรบ้าง เมื่อใช้แค่ Merkle proof เทียบกับใช้ zk-SNARK ร่วมด้วย
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="lab5-s9-tabs">
        <button
          type="button"
          onClick={() => setActiveTab("merkle")}
          className={`lab5-s9-tab-btn ${isMerkleOnly ? "lab5-s9-tab-btn--active-rose" : "lab5-s9-tab-btn--idle"}`}
        >
          <span className={`lab5-s9-tab-title ${isMerkleOnly ? "lab5-s9-tab-title--rose" : "lab5-s9-tab-title--slate"}`}>
            Merkle proof อย่างเดียว
          </span>
          <span className="lab5-s9-tab-sub">ภาค 1 — ส่งหลักฐานให้ผู้ตรวจตรง ๆ</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("snark")}
          className={`lab5-s9-tab-btn ${!isMerkleOnly ? "lab5-s9-tab-btn--active-green" : "lab5-s9-tab-btn--idle"}`}
        >
          <span className={`lab5-s9-tab-title ${!isMerkleOnly ? "lab5-s9-tab-title--green" : "lab5-s9-tab-title--slate"}`}>
            Merkle + zk-SNARK
          </span>
          <span className="lab5-s9-tab-sub">ภาค 2 — ซ่อนข้อมูลไว้ในวงจรพิสูจน์</span>
        </button>
      </div>

      {/* Root Box */}
      <div className="lab5-s9-root-card">
        <span className="lab5-s9-root-label">Root (เห็นเหมือนกันทั้งสองแบบ)</span>
        <span className="lab5-s9-root-chip">592ed5ae...</span>
      </div>

      {/* Visibility Matrix Card */}
      <div className="lab5-s9-matrix-card">
        <div className="lab5-s9-matrix-header">
          <div className="lab5-s9-matrix-title">Visibility Matrix</div>
          <div className="lab5-s9-matrix-sub">สรุปสิ่งที่ผู้พิสูจน์และผู้ตรวจสอบมองเห็น</div>
        </div>
        <table className="lab5-s9-table">
          <thead>
            <tr>
              <th>ข้อมูลในระบบ</th>
              <th>Prover</th>
              <th>Verifier</th>
            </tr>
          </thead>
          <tbody>
            {matrixData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.label}</td>
                <td>{row.prover}</td>
                <td
                  className={
                    row.verifierHighlight === "red"
                      ? "lab5-s9-cell-red"
                      : row.verifierHighlight === "green"
                      ? "lab5-s9-cell-green"
                      : ""
                  }
                >
                  {row.verifier}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Callout Box */}
      <div className="lab5-s9-callout">
        <Lightbulb size={18} color="#7c3aed" style={{ flexShrink: 0 }} />
        <span className="lab5-s9-callout-text">
          {isMerkleOnly
            ? "ผู้ตรวจคำนวณ Root เองได้จากหลักฐาน จึงเชื่อได้ — แต่ก็รู้ด้วยว่าคุณคือออร์เดอร์ B และเห็นรหัสลับ"
            : 'ผู้ตรวจยืนยันได้ว่า "มีออร์เดอร์หนึ่งใบใต้ Root นี้ที่เป็นของผู้ส่ง" โดยไม่รู้ว่าคือออร์เดอร์ B'}
        </span>
      </div>

      {/* Takeaway: จำไว้ 3 อย่าง (Matches media_1792539994348.png) */}
      <div className="lab5-s9-takeaway-section">
        <h3 className="lab5-s9-takeaway-heading">จำไว้ 3 อย่าง</h3>

        {/* Card 1: Hash */}
        <div className="lab5-s9-takeaway-card">
          <div className="lab5-s9-takeaway-icon-circle">
            <Fingerprint size={20} />
          </div>
          <div className="lab5-s9-takeaway-body">
            <div className="lab5-s9-takeaway-title">Hash = ลายนิ้วมือของข้อมูล</div>
            <div className="lab5-s9-takeaway-desc">
              ข้อมูลเดิมได้ค่าเดิม แก้นิดเดียวเปลี่ยนหมด และย้อนกลับไม่ได้
            </div>
          </div>
        </div>

        {/* Card 2: Merkle Tree */}
        <div className="lab5-s9-takeaway-card">
          <div className="lab5-s9-takeaway-icon-circle">
            <Key size={20} />
          </div>
          <div className="lab5-s9-takeaway-body">
            <div className="lab5-s9-takeaway-title">Merkle Tree = พิสูจน์ว่าอยู่ในชุดข้อมูล</div>
            <div className="lab5-s9-takeaway-desc">
              ใช้ Root ค่าเดียว + Hash ไม่กี่ตัว ก็ยืนยันได้ และแก้ข้อมูลแล้วถูกจับทันที
            </div>
          </div>
        </div>

        {/* Card 3: zk-SNARK */}
        <div className="lab5-s9-takeaway-card">
          <div className="lab5-s9-takeaway-icon-circle">
            <ShieldCheck size={20} />
          </div>
          <div className="lab5-s9-takeaway-body">
            <div className="lab5-s9-takeaway-title">zk-SNARK = พิสูจน์โดยไม่เปิดเผยความลับ</div>
            <div className="lab5-s9-takeaway-desc">
              Statement + Circuit + Witness → Proof ก้อนเล็ก ส่งครั้งเดียว ใครก็ตรวจได้ แต่ไม่มีใครเห็น Witness
            </div>
          </div>
        </div>
      </div>

      {/* Real Feature Mapping: จากแลปนี้ สู่ฟีเจอร์จริงใน Stealth Trade (Cycle 2) */}
      <div className="lab5-s9-features-card">
        <div className="lab5-s9-features-header">
          จากแลปนี้ สู่ฟีเจอร์จริงใน Stealth Trade (Cycle 2)
        </div>

        {/* Row 1: Merkle Tree */}
        <div className="lab5-s9-features-row">
          <div className="lab5-s9-features-step">ขั้น 2–4 · Merkle Tree</div>
          <div className="lab5-s9-features-info">
            <div className="lab5-s9-features-title">
              <span className="lab5-s9-features-tag">C2-S6</span>
              Private Asset Ownership —
            </div>
            <div className="lab5-s9-features-desc">
              พิสูจน์ว่าถือเหรียญจริง โดยไม่โชว์รายการในกระเป๋า
            </div>
          </div>
        </div>

        {/* Row 2: Balance Proof */}
        <div className="lab5-s9-features-row">
          <div className="lab5-s9-features-step">ขั้น 7 · ยอดเงินพอ</div>
          <div className="lab5-s9-features-info">
            <div className="lab5-s9-features-title">
              <span className="lab5-s9-features-tag">C2-S5</span>
              Private Balance Proof —
            </div>
            <div className="lab5-s9-features-desc">
              พิสูจน์ว่าเงินพอ โดยไม่บอกยอดเงิน
            </div>
          </div>
        </div>

        {/* Row 3: Pipeline */}
        <div className="lab5-s9-features-row">
          <div className="lab5-s9-features-step">ขั้น 6 · ไปป์ไลน์ zk-SNARK</div>
          <div className="lab5-s9-features-info">
            <div className="lab5-s9-features-title">
              <span className="lab5-s9-features-tag">C2-S7</span>
              Private Order Validation —
            </div>
            <div className="lab5-s9-features-desc">
              รวมหลาย Proof ตรวจคำสั่งซื้อก่อนส่งเข้าตลาด
            </div>
          </div>
        </div>
      </div>

      {/* Completion Card: เรียนจบ Lab 05 • 07 แล้ว (Matches media_1792539994348.png) */}
      <div className="lab5-animate-merge-up lab5-s9-complete-card">
        <Trophy size={32} className="lab5-s9-complete-trophy" />
        <h3 className="lab5-s9-complete-title">เรียนจบ Lab 05 • 07 แล้ว</h3>
        <p className="lab5-s9-complete-desc">
          คุณสร้างต้นไม้ พิสูจน์ว่าข้อมูลอยู่ในต้นไม้ จับการปลอมแปลงได้ และซ่อนตัวตนด้วย zk-SNARK ได้ด้วยตัวเองแล้ว
        </p>
        <div className="lab5-s9-complete-btns">
          <button
            type="button"
            onClick={() => goToStep(4)}
            className="lab5-s9-btn-outline"
          >
            <RotateCcw size={14} /> ลองพิสูจน์ออร์เดอร์อื่น
          </button>
          <button
            type="button"
            onClick={reset}
            className="lab5-s9-btn-primary"
          >
            <RotateCcw size={14} /> เริ่มใหม่ทั้งหมด
          </button>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   lab-container — ประกอบทุกอย่างเข้าด้วยกัน
   ========================================================================== */

/**
 * เลือกเนื้อหาของขั้นตามหมายเลขขั้น
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {number} props.step หมายเลขขั้น (0-9)
 * @return {JSX.Element|null} เนื้อหาของขั้นนั้น หรือ null ถ้าหมายเลขไม่ถูกต้อง
 * @author StealthTrade Team
 */
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
      return <Step4Tamper />
    case 5:
      return <Step5MerkleExposed />
    case 6:
      return <Step6ZkPipeline />
    case 7:
      return <Step7ZkpWorkflow />
    case 8:
      return <Step8MerkleZkp />
    case 9:
      return <Step9Efficiency />
    default:
      return null
  }
}

/**
 * โครงหน้าของบทเรียน: ส่วนหัว (ความคืบหน้า + คำศัพท์) เนื้อหา และแถบนำทาง
 *
 * @return {JSX.Element} โครงหน้าของบทเรียน
 * @author StealthTrade Team
 */
function LabContainer() {
  const { currentStep } = useLab05()
  const isIntro = currentStep === 0

  return (
    <div className="lab5-flex lab5-min-h-dvh lab5-flex-col">
      {!isIntro && (
        <header className="lab5-sticky lab5-top-0 lab5-z-30 lab5-border-b lab5-border-border lab5-bg-surface-85 lab5-backdrop-blur-sm lab5-shadow-sm">
          <div className="lab5-mx-auto lab5-max-w-3xl lab5-space-y-2.5 lab5-px-4 lab5-py-3">
            <LabProgress />
            <Glossary />
          </div>
        </header>
      )}

      <main className={`lab5-flex-1 lab5-px-4 ${isIntro ? "lab5-intro-main" : "lab5-pt-4 lab5-pb-10"}`}>
        <div className="lab5-mx-auto lab5-flex lab5-max-w-3xl lab5-flex-col lab5-gap-6">
          {!isIntro && STEP_META[currentStep]?.mission && (
            <div
              className="lab5-rounded-2xl lab5-px-4 lab5-py-3"
              style={{
                backgroundColor: "#f5f3ff",
                border: "1px solid #ede9fe",
              }}
            >
              <p
                className="lab5-text-xs lab5-font-semibold"
                style={{ color: "#6d4bd8", margin: 0 }}
              >
                <span className="lab5-font-bold">ภารกิจ:</span> {STEP_META[currentStep].mission}
              </p>
            </div>
          )}
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

/**
 * คอมโพเนนต์หลักของ Lab 05 (Merkle Trees)
 *
 * @return {JSX.Element} หน้าบทเรียนทั้งหมดพร้อม Provider
 * @author StealthTrade Team
 */
export default function Lab5() {
  return (
    <div className="lab5">
      <Lab05Provider>
        <LabContainer />
      </Lab05Provider>
    </div>
  )
}
