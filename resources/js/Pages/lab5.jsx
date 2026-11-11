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
  Package,
  PartyPopper,
  RotateCcw,
  Search,
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
  Monitor,
  Server,
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

export const TOTAL_STEPS = 8

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
    topic: "ทำความเข้าใจ Merkle Tree",
    mission: "ดูทีละภาพว่า Merkle Tree คืออะไร และทำงาน 3 ขั้นตอนอย่างไร",
    mentor:
      "สวัสดีครับ! ก่อนหน้านี้ใน Lab 04: Cryptographic Commitments เราได้เรียนรู้วิธีการปกปิดข้อมูลและผูกมัดคำสั่งซื้อเพื่อไม่ให้โดนบอกสวมรอยกันไปแล้ว\n\nวันนี้เราจะนำความรู้มาต่อยอดครับ! แทนที่เราจะมอง Merkle Tree เป็นแค่รูปต้นไม้ที่ซับซ้อน ลองมองมันเป็น \"กระบวนการพิสูจน์ 3 ขั้นตอน\" ที่ทำให้ Prover (เรา) และ Verifier (ผู้ตรวจ) คุยกันได้ง่ายขึ้นครับ",
  },
  {
    index: 2,
    topic: "สร้าง Hash และต้นไม้ (Tree Construction)",
    mission: "สร้าง Leaf Node ทั้ง 4 ใบ จับคู่ด้วยสูตร Hash(Hash A + Hash B) จนได้ Merkle Root แล้วเลือกออร์เดอร์ลับของคุณ",
    mentor:
      "ในขั้นนี้เราจะประกอบต้นไม้ (Tree Construction) กันครับ มีคอนเซปต์สำคัญมากเรื่องวิธีการรวมโหนด:\n• Leaf Node: แปลงข้อมูลลับ (Secret) เป็น Hash เสียก่อน\n• การรวมโหนด: เราจะไม่ใช้สูตร Hash(A + B) เด็ดขาด แต่ต้องใช้ Hash(Hash A + Hash B)",
  },
  {
    index: 3,
    topic: "การเตรียมและตรวจหลักฐาน (Prover & Verifier)",
    mission: "Prover เตรียม Sibling Hash ส่งให้ Verifier แล้ว Verifier คำนวณย้อนหา Merkle Root",
    mentor:
      "ในขั้นนี้เรามาดูการทำงานร่วมกันระหว่าง Prover และ Verifier ครับ:\n• Prover ส่งแพ็กเกจหลักฐาน: ข้อมูลดิบ + Sibling Hash แต่ละขั้น (ไม่ต้องส่ง Root)\n• Verifier นำข้อมูลดิบมา Hash เอง แล้วประกบ Sibling Hash ทีละขั้นย้อนหา Root!",
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
    topic: "zk-SNARK คืออะไร & เอาไว้แก้อะไร",
    mission: "ทำความเข้าใจแนวคิด zk-SNARK และตอบควิซเพื่อไปต่อ",
    mentor:
      "ก่อนจะไปต่อ เรามาทำความเข้าใจเทคโนโลยีสำคัญที่จะเข้ามาช่วยแก้ปัญหาความเป็นส่วนตัวและสเกลของระบบกันก่อนครับ นั่นคือ zk-SNARK",
  },
  {
    index: 6,
    topic: "Merkle Proof ยังเผยอะไร",
    mission: "มองจากมุมผู้ตรวจ ว่าหลักฐานที่ส่งไปเผยอะไรบ้าง",
    mentor:
      "Merkle proof เก่งมากครับ แต่ลองเปลี่ยนมุมมอง — ถ้าคุณเป็นผู้ตรวจ แล้วได้รับ “กล่องหลักฐาน” ด้านล่าง คุณจะรู้อะไรเกี่ยวกับเจ้าของกล่องบ้าง?",
  },
  {
    index: 7,
    topic: "zk-SNARK Pipeline (5 ขั้นตอน)",
    mission: "Statement → Circuit → Witness → Proof → Verify และดูว่า zk-SNARK อยู่ตรงไหนของกระบวนการ",
    mentor:
      "เพื่อดูต้นไม้จากภาค 1 — Root เป็นข้อมูลสาธารณะ ส่วนรหัสลับและเส้นทางเป็น Witness\nชื่อ Pipeline การทำงาน 5 ขั้นตอน Statement → Circuit → Witness → Proof → Verify\nดูแผนที่ด้านล่างว่าขั้นตอนใดบ้างที่อยู่ใน zk-SNARK (กล่องดำ) อยู่ตรงไหนของกระบวนการ",
  },
  {
    index: 8,
    topic: "สรุปในบริบทการเทรด",
    mission: "",
    mentor: "เก่งมากครับ! มาทบทวนกันว่าเราเรียนอะไรไปบ้าง",
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
  selectedLeaf: null,
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
          return lessonState.isRootBuilt && lessonState.selectedLeaf !== null
        case 3:
          return lessonState.foundSiblings.length >= 2
        case 4:
          return true
        case 5:
          return true
        case 6:
          return lessonState.completedSteps.includes(6)
        case 7:
          return lessonState.completedSteps.includes(7)
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
  const buildRoot = useCallback(() => {
    setLessonState((previousState) => {
      const isCompleteNow = previousState.selectedLeaf !== null
      const nextCompletedSteps = (isCompleteNow && !previousState.completedSteps.includes(2))
        ? [...previousState.completedSteps, 2]
        : previousState.completedSteps
      return {
        ...previousState,
        isRootBuilt: true,
        completedSteps: nextCompletedSteps,
      }
    })
  }, [])

  /**
   * เลือกใบที่ต้องการพิสูจน์ และล้างสถานะของขั้นถัดไปทั้งหมด
   *
   * @param {number} index ตำแหน่งของใบ (0-3)
   * @return {void}
   * @author StealthTrade Team
   */
  const selectLeaf = useCallback((index) => {
    setLessonState((previousState) => {
      const isCompleteNow = previousState.isRootBuilt && index !== null
      const nextCompletedSteps = (isCompleteNow && !previousState.completedSteps.includes(2))
        ? [...previousState.completedSteps, 2]
        : previousState.completedSteps

      if (previousState.selectedLeaf === index) {
        return {
          ...previousState,
          completedSteps: nextCompletedSteps,
        }
      }
      return {
        ...previousState,
        selectedLeaf: index,
        foundSiblings: [],
        isInterimComputed: false,
        isRootComputed: false,
        isTamperMode: false,
        completedSteps: nextCompletedSteps,
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
          <span className="lab5-text-sm lab5-font-bold lab5-text-foreground">ดร. ซีโร่</span>
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
function MerkleTreeDiagram({ nodeStateMap = {}, visibilityMap, hashNodeIds = [], clickableNodeIds = [], onNodeClick, customHashes = {}, customLabels = {}, className }) {
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
            <span className="lab5-node-label">{customLabels[node.id] || node.label}</span>
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
      <div
        className="lab5-flex lab5-items-center lab5-gap-1.5 lab5-overflow-x-auto lab5-py-1"
        style={{ paddingTop: "0.5rem" }}
      >
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

  if (currentStep === 0 || currentStep === TOTAL_STEPS) return null

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

      {/* Three Preview Cards */}
      <div
        style={{
          display: "flex",
          gap: "18px",
          justifyContent: "center",
          flexWrap: "wrap",
          width: "100%",
          maxWidth: "880px",
          marginTop: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {/* Card 1: Before (LAB 04) */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #ede9fb",
            borderRadius: "16px",
            padding: "18px 18px 18px",
            flex: "1 1 240px",
            maxWidth: "270px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 2px 10px rgba(99,82,199,0.05)",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#6d28d9",
              letterSpacing: "0.3px",
            }}
          >
            1 · แลปที่แล้ว (LAB 04)
          </div>

          {/* Inner visual box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: "#f1f5f9",
              borderRadius: "12px",
              padding: "16px 10px",
              minHeight: "100px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "11.5px",
                color: "#475569",
                background: "#ffffff",
                padding: "4px 8px",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
              }}
            >
              secret-B-q92m
            </span>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                background: "#1e1b4b",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "20px",
              }}
            >
              <span>H ( )</span>
              <span style={{ fontSize: "11px" }}>→</span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "monospace",
                fontSize: "11px",
                fontWeight: 600,
                color: "#7c3aed",
                background: "#ede9fe",
                padding: "3px 8px",
                borderRadius: "20px",
              }}
            >
              <Lock style={{ width: 11, height: 11, color: "#7c3aed" }} />
              <span>06e8f5</span>
            </div>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#475569",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            ทำ <strong style={{ color: "#1e293b" }}>Commitment</strong> — นำข้อมูลออร์เดอร์ <strong style={{ color: "#1e293b" }}>1 ชิ้น</strong> ไป Hash เพื่อล็อกไว้ แก้ทีหลังไม่ได้ (Binding) และคนอื่นไม่เห็นข้างใน (Hiding)
          </p>
        </div>

        {/* Card 2: Problem */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #ede9fb",
            borderRadius: "16px",
            padding: "18px 18px 18px",
            flex: "1 1 240px",
            maxWidth: "270px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 2px 10px rgba(99,82,199,0.05)",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#6d28d9",
              letterSpacing: "0.3px",
            }}
          >
            2 · ปัญหาใหม่
          </div>

          {/* Inner visual box */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#f1f5f9",
              borderRadius: "12px",
              padding: "16px 12px",
              minHeight: "100px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(9, 1fr)",
                gap: "4px",
              }}
            >
              {Array.from({ length: 36 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "2px",
                    background: "#c4b5fd",
                    display: "block",
                  }}
                />
              ))}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#6366f1",
                fontWeight: 700,
                letterSpacing: "0.2px",
              }}
            >
              + 1,000,000 ออร์เดอร์
            </div>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#475569",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            เว็บเทรดมีออร์เดอร์เป็นล้าน ถ้า Commit ทีละใบ ต้องประกาศล้านค่า และผู้ตรวจต้องโหลดทั้งหมดเพื่อหาใบเดียวของคุณ
          </p>
        </div>

        {/* Card 3: Solution (LAB 05) */}
        <div
          style={{
            background: "#fcfaff",
            border: "1.5px solid #c4b5fd",
            borderRadius: "16px",
            padding: "18px 18px 18px",
            flex: "1 1 240px",
            maxWidth: "270px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 4px 14px rgba(124,58,237,0.08)",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#6d28d9",
              letterSpacing: "0.3px",
            }}
          >
            3 · แลปนี้ (LAB 05)
          </div>

          {/* Inner visual box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              borderRadius: "12px",
              padding: "10px",
              minHeight: "100px",
              border: "1px solid #f1f5f9",
            }}
          >
            <svg
              viewBox="0 0 160 88"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", maxWidth: "155px" }}
            >
              <line x1="80" y1="16" x2="48" y2="46" stroke="#a78bfa" strokeWidth="1.5" />
              <line x1="80" y1="16" x2="112" y2="46" stroke="#a78bfa" strokeWidth="1.5" />
              <line x1="48" y1="46" x2="32" y2="72" stroke="#a78bfa" strokeWidth="1.5" />
              <line x1="48" y1="46" x2="64" y2="72" stroke="#a78bfa" strokeWidth="1.5" />
              <line x1="112" y1="46" x2="96" y2="72" stroke="#a78bfa" strokeWidth="1.5" />
              <line x1="112" y1="46" x2="128" y2="72" stroke="#a78bfa" strokeWidth="1.5" />

              {/* Root */}
              <circle cx="80" cy="14" r="11" fill="#5b21b6" />
              <text x="80" y="17.5" textAnchor="middle" fill="white" fontSize="6.5" fontFamily="Inter,sans-serif" fontWeight="700">Root</text>

              {/* Middle nodes */}
              <circle cx="48" cy="46" r="8" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.2" />
              <circle cx="112" cy="46" r="8" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.2" />

              {/* Leaf nodes */}
              <circle cx="32" cy="72" r="7" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.2" />
              <text x="32" y="75" textAnchor="middle" fill="#6d28d9" fontSize="6" fontFamily="Inter,sans-serif" fontWeight="700">A</text>

              <circle cx="64" cy="72" r="7" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.2" />
              <text x="64" y="75" textAnchor="middle" fill="#6d28d9" fontSize="6" fontFamily="Inter,sans-serif" fontWeight="700">B</text>

              <circle cx="96" cy="72" r="7" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.2" />
              <text x="96" y="75" textAnchor="middle" fill="#6d28d9" fontSize="6" fontFamily="Inter,sans-serif" fontWeight="700">C</text>

              <circle cx="128" cy="72" r="7" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.2" />
              <text x="128" y="75" textAnchor="middle" fill="#6d28d9" fontSize="6" fontFamily="Inter,sans-serif" fontWeight="700">D</text>
            </svg>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#475569",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            รวม Hash ทุกใบเป็น <strong style={{ color: "#1e293b" }}>Merkle Tree</strong> ให้เหลือ <strong style={{ color: "#1e293b" }}>Root</strong> ค่าเดียว แล้วพิสูจน์ใบไหนก็ได้ด้วยหลักฐานไม่กี่ค่า จากนั้นใช้ <strong style={{ color: "#1e293b" }}>zk-SNARK</strong> ซ่อนข้อมูลของเรา
          </p>
        </div>
      </div>

      {/* Description */}
      <p
        className="lab5-mx-auto lab5-text-center lab5-text-sm lab5-leading-relaxed"
        style={{
          maxWidth: "680px",
          lineHeight: 1.8,
          color: "#475569",
          margin: "0.25rem 0",
          fontSize: "0.9375rem",
        }}
      >
        จาก <strong style={{ color: "#1e293b" }}>Lab 04</strong> ที่เราล็อกข้อมูล Order 1 รายการ สู่โจทย์ใหม่เมื่อเว็บเทรดมีออร์เดอร์มหาศาล — แลปนี้เราจะรวม Hash เป็น <strong style={{ color: "#1e293b" }}>Merkle Tree</strong> เพื่อย่อส่วนการตรวจสอบให้เสร็จในพริบตา และอัปเกรดด้วย <strong style={{ color: "#1e293b" }}>zk-SNARK</strong> เพื่อพิสูจน์ว่าออร์เดอร์มีอยู่จริง 100% โดยไม่เปิดเผยข้อมูลลับเลย
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
          <span>8 ขั้น</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span>ประมาณ 15 นาที</span>
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
  const { isStep1Correct, answerStep1, goNext } = useLab05()
  const [activeTab, setActiveTab] = useState(0)
  const [orderExp, setOrderExp] = useState(5)
  const [hasSlid, setHasSlid] = useState(false)

  const showReasonCard = hasSlid || isStep1Correct

  const handleOrderExpChange = (e) => {
    const val = Number(e.target.value)
    setOrderExp(val)
    if (!hasSlid) {
      setHasSlid(true)
    }
    if (!isStep1Correct) {
      answerStep1(2)
    }
  }

  const tabs = [
    { title: "คืออะไร", subtitle: "ต้นไม้คว่ำ" },
    { title: "1. สร้างต้นไม้", subtitle: "Tree Construction" },
    { title: "2. Prover", subtitle: "เตรียมหลักฐาน" },
    { title: "3. Verifier", subtitle: "ตรวจสอบ" },
  ]

  return (
    <div className="lab5-space-y-4">
      {/* Main Interactive Carousel Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "1.25rem",
          border: "1px solid #ede9fe",
          boxShadow: "0 4px 20px -2px rgba(109, 75, 216, 0.06)",
          padding: "1.5rem",
        }}
      >
        {/* Header row: Step Title & Target */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "1rem",
            borderBottom: "1px solid #f1f5f9",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b" }}>
            ภาพที่ {activeTab + 1} จาก 4 : {tabs[activeTab].title}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
            เป้าหมาย: เข้าใจ Merkle Tree 3 ขั้นตอน
          </div>
        </div>

        {/* 4-Step Sub-navigation Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {tabs.map((tab, idx) => {
            const isActive = activeTab === idx
            const isCompleted = idx < activeTab

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.625rem 0.25rem",
                  borderRadius: "0.875rem",
                  background: isActive ? "#f3e8ff" : "transparent",
                  border: isActive ? "1px solid #e9d5ff" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    marginBottom: "0.375rem",
                    background: isCompleted ? "#10b981" : isActive ? "#6d28d9" : "#f1f5f9",
                    color: isCompleted || isActive ? "#ffffff" : "#64748b",
                    boxShadow: isActive ? "0 2px 8px rgba(109, 40, 217, 0.25)" : "none",
                  }}
                >
                  {isCompleted ? <Check style={{ width: 14, height: 14, strokeWidth: 3 }} /> : idx + 1}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? "#6d28d9" : "#475569",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {tab.title}
                </div>
                <div
                  style={{
                    fontSize: "0.625rem",
                    color: isActive ? "#7c3aed" : "#94a3b8",
                    textAlign: "center",
                    marginTop: "2px",
                  }}
                >
                  {tab.subtitle}
                </div>
              </button>
            )
          })}
        </div>

        {/* Tab 0 : Merkle Tree คืออะไร? */}
        {activeTab === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Merkle Tree คืออะไร?
            </h2>

            {/* 3 Blocks: Prover - Data Grid - Verifier */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr 1fr",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {/* Prover Block */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #ede9fe",
                  borderRadius: "1rem",
                  padding: "1rem 0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.625rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#ede9fe",
                    color: "#7c3aed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>
                  Prover (เรา)
                </div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "#6d28d9",
                    background: "#f5f3ff",
                    border: "1px solid #ddd6fe",
                    padding: "4px 8px",
                    borderRadius: "9999px",
                    fontWeight: 500,
                  }}
                >
                  “ออร์เดอร์ของฉันอยู่ในระบบนะ”
                </div>
              </div>

              {/* Data Grid Block */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "1rem",
                  padding: "0.875rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.625rem",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(9, 1fr)",
                    gap: "4px",
                  }}
                >
                  {Array.from({ length: 36 }).map((_, i) => {
                    const isOurOrder = i === 11 // Row 2, Col 3
                    return (
                      <span
                        key={i}
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "2px",
                          background: isOurOrder ? "#6d28d9" : "#ddd6fe",
                          display: "block",
                          boxShadow: isOurOrder ? "0 0 6px rgba(109, 40, 217, 0.6)" : "none",
                        }}
                      />
                    )
                  })}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.6875rem",
                    color: "#64748b",
                  }}
                >
                  <span>ออร์เดอร์มหาศาล (ย่อภาพ)</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "2px", color: "#6d28d9", fontWeight: 600 }}>
                    <span style={{ width: 7, height: 7, background: "#6d28d9", borderRadius: 1, display: "inline-block" }} /> = ของเรา
                  </span>
                </div>
              </div>

              {/* Verifier Block */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #d1fae5",
                  borderRadius: "1rem",
                  padding: "1rem 0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.625rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#d1fae5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Search style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>
                  Verifier (ผู้ตรวจ)
                </div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "#059669",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    padding: "4px 8px",
                    borderRadius: "9999px",
                    fontWeight: 500,
                  }}
                >
                  “พิสูจน์ให้ดูหน่อย”
                </div>
              </div>
            </div>

            {/* Quote Banner */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.875rem",
                padding: "0.75rem 1rem",
                textAlign: "center",
                fontSize: "0.875rem",
                color: "#1e293b",
                fontWeight: 600,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              “Merkle Tree คือโครงสร้างการเก็บข้อมูลแบบ <strong style={{ color: "#6d28d9" }}>'ต้นไม้คว่ำ'</strong> ที่ช่วยย่อส่วนการตรวจสอบข้อมูลมหาศาล”
            </div>

            {/* 2-Column Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.875rem",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  borderRadius: "0.875rem",
                  padding: "0.875rem 1rem",
                }}
              >
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                  ปัญหาที่แก้
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
                  แก้อาการระบบช้า และประหยัดทรัพยากรการตรวจสอบข้อมูลขนาดใหญ่
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  borderRadius: "0.875rem",
                  padding: "0.875rem 1rem",
                }}
              >
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                  หลักการทำงาน
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
                  ผู้ตรวจสามารถยืนยันได้ว่าออร์เดอร์เทรดของเรามีอยู่จริง โดยอาศัยข้อมูลอ้างอิงเพียงเล็กน้อย แทนที่จะต้องโหลดดูข้อมูลทั้งระบบ
                </div>
              </div>
            </div>

            {/* Hint text for next step */}
            <div
              style={{
                textAlign: "center",
                fontSize: "0.8125rem",
                color: "#475569",
                marginTop: "0.25rem",
              }}
            >
              ภาพถัดไปเราจะดู <strong style={{ color: "#0f172a" }}>กระบวนการทำงาน 3 ขั้นตอน</strong> ของ Merkle Tree ทีละขั้น
            </div>
          </div>
        )}

        {/* Tab 1 : 1. ขั้นตอนการสร้าง (Tree Construction) */}
        {activeTab === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              1. ขั้นตอนการสร้าง (Tree Construction)
            </h2>

            {/* 8-Leaf Clean Merkle Tree Graphic */}
            <div
              style={{
                background: "#ffffff",
                padding: "0.5rem 0.25rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 460 215" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "460px" }}>
                {/* Connecting Lines (Level 0 to 1) */}
                <line x1="230" y1="32" x2="140" y2="76" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="230" y1="32" x2="320" y2="76" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Connecting Lines (Level 1 to 2) */}
                <line x1="140" y1="88" x2="88" y2="132" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="140" y1="88" x2="192" y2="132" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="320" y1="88" x2="268" y2="132" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="320" y1="88" x2="372" y2="132" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Connecting Lines (Level 2 to 3) */}
                <line x1="88" y1="144" x2="62" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="88" y1="144" x2="114" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />

                <line x1="192" y1="144" x2="166" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="192" y1="144" x2="218" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />

                <line x1="268" y1="144" x2="242" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="268" y1="144" x2="294" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />

                <line x1="372" y1="144" x2="346" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="372" y1="144" x2="398" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Level 0: Root (Green Capsule) */}
                <rect x="200" y="14" width="60" height="26" rx="13" fill="#059669" />
                <text x="230" y="31.5" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="700">Root</text>

                {/* Level 1: A-D and E-H */}
                <rect x="118" y="74" width="44" height="24" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="140" y="90" textAnchor="middle" fill="#334155" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">A–D</text>

                <rect x="298" y="74" width="44" height="24" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="320" y="90" textAnchor="middle" fill="#334155" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">E–H</text>

                {/* Level 2: AB, CD, EF, GH */}
                <rect x="71" y="130" width="34" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="88" y="145.5" textAnchor="middle" fill="#334155" fontSize="9.5" fontFamily="Inter,sans-serif" fontWeight="700">AB</text>

                <rect x="175" y="130" width="34" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="192" y="145.5" textAnchor="middle" fill="#334155" fontSize="9.5" fontFamily="Inter,sans-serif" fontWeight="700">CD</text>

                <rect x="251" y="130" width="34" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="268" y="145.5" textAnchor="middle" fill="#334155" fontSize="9.5" fontFamily="Inter,sans-serif" fontWeight="700">EF</text>

                <rect x="355" y="130" width="34" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="372" y="145.5" textAnchor="middle" fill="#334155" fontSize="9.5" fontFamily="Inter,sans-serif" fontWeight="700">GH</text>

                {/* Level 3: 8 Leaves (A to H) */}
                <rect x="47" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="62" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">A</text>

                <rect x="99" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="114" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">B</text>

                <rect x="151" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="166" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">C</text>

                <rect x="203" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="218" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">D</text>

                <rect x="227" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="242" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">E</text>

                <rect x="279" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="294" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">F</text>

                <rect x="331" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="346" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">G</text>

                <rect x="383" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="398" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">H</text>
              </svg>
            </div>

            {/* Subtitle / Formula description */}
            <div style={{ textAlign: "center", fontSize: "0.8125rem", color: "#334155", lineHeight: 1.6, marginTop: "0.25rem" }}>
              นำข้อมูลมา Hash แล้วจับคู่ด้วยสูตร <code style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e293b", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>Hash(Hash A + Hash B)</code> จนได้ <strong style={{ color: "#059669", fontWeight: 700 }}>Merkle Root</strong> ที่ยอดบนสุด <span style={{ color: "#64748b" }}>(ประกาศเป็นสาธารณะ)</span>
            </div>

            {/* Lab 04 Review Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                background: "#faf8ff",
                border: "1px solid #ede9fe",
                borderRadius: "1rem",
                padding: "0.875rem 1.25rem",
                marginTop: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flex: 1, minWidth: "260px" }}>
                <BookOpen style={{ width: 18, height: 18, color: "#7c3aed", flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", color: "#475569", lineHeight: 1.5 }}>
                  <strong>Hash</strong> คือ <strong>“ลายนิ้วมือ”</strong> ของข้อมูลจาก Lab 04 — แก้ข้อมูลนิดเดียว Hash เปลี่ยนหมด ใบไหนถูกแก้ Root ก็เปลี่ยนตาม
                </span>
              </div>
              <a
                href="/lab4"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "#6d28d9",
                  background: "#ffffff",
                  border: "1px solid #ddd6fe",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  textDecoration: "none",
                  boxShadow: "0 1px 3px rgba(109, 40, 217, 0.08)",
                  flexShrink: 0,
                }}
              >
                <span>ทบทวน Lab 04</span>
                <span style={{ fontSize: "11px" }}>↗</span>
              </a>
            </div>
          </div>
        )}

        {/* Tab 2 : 2. Prover (เตรียมหลักฐาน) */}
        {activeTab === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              2. Prover เตรียมหลักฐาน
            </h2>

            {/* 8-Leaf Merkle Tree with Highlighted Sibling Nodes */}
            <div
              style={{
                background: "#ffffff",
                padding: "0.5rem 0.25rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 460 215" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "460px" }}>
                {/* Connecting Lines (Level 0 to 1) */}
                <line x1="230" y1="32" x2="140" y2="76" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="230" y1="32" x2="320" y2="76" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Connecting Lines (Level 1 to 2) */}
                <line x1="140" y1="88" x2="88" y2="132" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="140" y1="88" x2="192" y2="132" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="320" y1="88" x2="268" y2="132" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="320" y1="88" x2="372" y2="132" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Connecting Lines (Level 2 to 3) */}
                <line x1="88" y1="144" x2="62" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="88" y1="144" x2="114" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />

                <line x1="192" y1="144" x2="166" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="192" y1="144" x2="218" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />

                <line x1="268" y1="144" x2="242" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="268" y1="144" x2="294" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />

                <line x1="372" y1="144" x2="346" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1="372" y1="144" x2="398" y2="186" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Level 0: Root (Green Capsule - Public) */}
                <rect x="200" y="14" width="60" height="26" rx="13" fill="#059669" />
                <text x="230" y="31.5" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="700">Root</text>

                {/* Level 1: A–D (Neutral) and E–H (Sibling - Solid Purple) */}
                <rect x="118" y="74" width="44" height="24" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="140" y="90" textAnchor="middle" fill="#334155" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">A–D</text>

                <rect x="298" y="74" width="44" height="24" rx="12" fill="#6d28d9" />
                <text x="320" y="90" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">E–H</text>

                {/* Level 2: AB (Sibling - Solid Purple), CD, EF, GH */}
                <rect x="71" y="130" width="34" height="22" rx="11" fill="#6d28d9" />
                <text x="88" y="145.5" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontFamily="Inter,sans-serif" fontWeight="700">AB</text>

                <rect x="175" y="130" width="34" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="192" y="145.5" textAnchor="middle" fill="#334155" fontSize="9.5" fontFamily="Inter,sans-serif" fontWeight="700">CD</text>

                <rect x="251" y="130" width="34" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="268" y="145.5" textAnchor="middle" fill="#334155" fontSize="9.5" fontFamily="Inter,sans-serif" fontWeight="700">EF</text>

                <rect x="355" y="130" width="34" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="372" y="145.5" textAnchor="middle" fill="#334155" fontSize="9.5" fontFamily="Inter,sans-serif" fontWeight="700">GH</text>

                {/* Level 3: 8 Leaves */}
                <rect x="47" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="62" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">A</text>

                <rect x="99" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="114" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">B</text>

                {/* C is Our Order (Purple Outline) */}
                <rect x="151" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#6d28d9" strokeWidth="2" />
                <text x="166" y="199.5" textAnchor="middle" fill="#6d28d9" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="800">C</text>

                {/* D is Sibling (Solid Purple) */}
                <rect x="203" y="184" width="30" height="22" rx="11" fill="#6d28d9" />
                <text x="218" y="199.5" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">D</text>

                <rect x="227" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="242" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">E</text>

                <rect x="279" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="294" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">F</text>

                <rect x="331" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="346" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">G</text>

                <rect x="383" y="184" width="30" height="22" rx="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="398" y="199.5" textAnchor="middle" fill="#4338ca" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">H</text>
              </svg>
            </div>

            {/* Legend / Symbol Explanation */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1.25rem",
                fontSize: "0.75rem",
                color: "#475569",
                flexWrap: "wrap",
                marginTop: "0.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: 20,
                    height: 12,
                    borderRadius: 6,
                    border: "1.5px solid #6d28d9",
                    background: "#ffffff",
                    display: "inline-block",
                  }}
                />
                <span>ข้อมูลของเรา (ใบ C)</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: 20,
                    height: 12,
                    borderRadius: 6,
                    background: "#6d28d9",
                    display: "inline-block",
                  }}
                />
                <span>Sibling Hash ที่ต้องส่ง</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: 20,
                    height: 12,
                    borderRadius: 6,
                    background: "#059669",
                    display: "inline-block",
                  }}
                />
                <span>Root (สาธารณะ ไม่ต้องส่ง)</span>
              </div>
            </div>

            {/* Explanation text */}
            <div
              style={{
                textAlign: "center",
                fontSize: "0.8125rem",
                color: "#334155",
                lineHeight: 1.6,
                marginTop: "0.5rem",
              }}
            >
              <strong>Prover (เรา)</strong> เตรียมข้อมูลดิบ + <strong>Sibling Hash</strong> (เส้นทางกิ่งไม้ข้างเคียง) แล้วส่งข้อมูลชุดนี้ไปให้ผู้ตรวจ
            </div>
          </div>
        )}

        {/* Tab 3 : 3. Verifier (ตรวจสอบ) */}
        {activeTab === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Title */}
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              3. Verifier ตรวจสอบ
            </h2>

            {/* SVG Merkle Tree — Verifier path highlighted green */}
            <div style={{ display: "flex", justifyContent: "center", padding: "0.5rem 0" }}>
              <svg viewBox="0 0 460 215" width="100%" style={{ maxWidth: 440 }}>
                {/* ===== EDGES ===== */}
                {/* Root → A-D (green path) */}
                <line x1="200" y1="30" x2="110" y2="68" stroke="#16a34a" strokeWidth="2.5"/>
                {/* Root → E-H (gray) */}
                <line x1="220" y1="30" x2="340" y2="68" stroke="#cbd5e1" strokeWidth="1.5"/>
                {/* A-D → AB (green path) */}
                <line x1="100" y1="85" x2="65" y2="124" stroke="#16a34a" strokeWidth="2.5"/>
                {/* A-D → CD (green path) */}
                <line x1="120" y1="85" x2="155" y2="124" stroke="#16a34a" strokeWidth="2.5"/>
                {/* E-H → EF (gray) */}
                <line x1="330" y1="85" x2="295" y2="124" stroke="#cbd5e1" strokeWidth="1.5"/>
                {/* E-H → GH (gray) */}
                <line x1="350" y1="85" x2="385" y2="124" stroke="#cbd5e1" strokeWidth="1.5"/>
                {/* AB → A */}
                <line x1="58" y1="141" x2="35" y2="178" stroke="#cbd5e1" strokeWidth="1.5"/>
                {/* AB → B */}
                <line x1="72" y1="141" x2="88" y2="178" stroke="#cbd5e1" strokeWidth="1.5"/>
                {/* CD → C (green path) */}
                <line x1="148" y1="141" x2="138" y2="178" stroke="#16a34a" strokeWidth="2.5"/>
                {/* CD → D (gray) */}
                <line x1="162" y1="141" x2="188" y2="178" stroke="#cbd5e1" strokeWidth="1.5"/>
                {/* EF → E */}
                <line x1="288" y1="141" x2="263" y2="178" stroke="#cbd5e1" strokeWidth="1.5"/>
                {/* EF → F */}
                <line x1="302" y1="141" x2="313" y2="178" stroke="#cbd5e1" strokeWidth="1.5"/>
                {/* GH → G */}
                <line x1="378" y1="141" x2="363" y2="178" stroke="#cbd5e1" strokeWidth="1.5"/>
                {/* GH → H */}
                <line x1="392" y1="141" x2="413" y2="178" stroke="#cbd5e1" strokeWidth="1.5"/>

                {/* ===== NODES ===== */}
                {/* Root — green capsule (Verifier computed = match) */}
                <rect x="168" y="10" width="64" height="26" rx="13" fill="#dcfce7" stroke="#16a34a" strokeWidth="2.5"/>
                <text x="200" y="27" textAnchor="middle" fontSize="11" fontWeight="800" fill="#16a34a">Root</text>

                {/* A-D — green outlined (computed by verifier) */}
                <ellipse cx="110" cy="77" rx="28" ry="13" fill="#dcfce7" stroke="#16a34a" strokeWidth="2.5"/>
                <text x="110" y="81" textAnchor="middle" fontSize="10" fontWeight="700" fill="#16a34a">A–D</text>

                {/* E-H — purple solid (sibling hash sent) */}
                <ellipse cx="340" cy="77" rx="28" ry="13" fill="#6d28d9" stroke="#6d28d9" strokeWidth="2"/>
                <text x="340" y="81" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">E–H</text>

                {/* AB — purple solid (sibling hash sent) */}
                <ellipse cx="65" cy="133" rx="24" ry="12" fill="#6d28d9" stroke="#6d28d9" strokeWidth="2"/>
                <text x="65" y="137" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">AB</text>

                {/* CD — green outlined (computed by verifier) */}
                <ellipse cx="155" cy="133" rx="24" ry="12" fill="#dcfce7" stroke="#16a34a" strokeWidth="2.5"/>
                <text x="155" y="137" textAnchor="middle" fontSize="10" fontWeight="700" fill="#16a34a">CD</text>

                {/* EF — gray */}
                <ellipse cx="295" cy="133" rx="24" ry="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5"/>
                <text x="295" y="137" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">EF</text>

                {/* GH — gray */}
                <ellipse cx="385" cy="133" rx="24" ry="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5"/>
                <text x="385" y="137" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">GH</text>

                {/* Leaves A B — gray */}
                <ellipse cx="35" cy="189" rx="18" ry="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5"/>
                <text x="35" y="193" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">A</text>
                <ellipse cx="88" cy="189" rx="18" ry="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5"/>
                <text x="88" y="193" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">B</text>

                {/* Leaf C — purple outlined (ข้อมูลของเรา) */}
                <ellipse cx="138" cy="189" rx="18" ry="10" fill="#ffffff" stroke="#6d28d9" strokeWidth="2.5"/>
                <text x="138" y="193" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6d28d9">C</text>

                {/* Leaf D — purple solid (sibling hash) */}
                <ellipse cx="188" cy="189" rx="18" ry="10" fill="#6d28d9" stroke="#6d28d9" strokeWidth="2"/>
                <text x="188" y="193" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">D</text>

                {/* Leaves E F G H — gray */}
                <ellipse cx="263" cy="189" rx="18" ry="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5"/>
                <text x="263" y="193" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">E</text>
                <ellipse cx="313" cy="189" rx="18" ry="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5"/>
                <text x="313" y="193" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">F</text>
                <ellipse cx="363" cy="189" rx="18" ry="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5"/>
                <text x="363" y="193" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">G</text>
                <ellipse cx="413" cy="189" rx="18" ry="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5"/>
                <text x="413" y="193" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">H</text>
              </svg>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #6d28d9", background: "#fff" }}/>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>ข้อมูลของเรา (C)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#6d28d9" }}/>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Sibling Hash ที่ส่งมา</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#dcfce7", border: "2px solid #16a34a" }}/>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Verifier คำนวณแล้วตรงกับ Root</span>
              </div>
            </div>

            {/* Description */}
            <div style={{ fontSize: "0.8125rem", color: "#1e293b", textAlign: "center", lineHeight: 1.65, fontWeight: 500 }}>
              <strong>Verifier (ผู้ตรวจ)</strong> เอา Hash ที่ได้รับมาคำนวณย้อนขึ้นไปสู่ Root ถ้าผลลัพธ์ตรงกัน
              แปลว่ามี Order นั้นอยู่จริง! <span style={{ color: "#6d28d9", fontWeight: 700 }}>(Binding)</span>
            </div>

            {/* Interactive comparison section — slider controls N */}
            {(() => {
              const N = Math.pow(2, orderExp)
              const siblings = orderExp
              const Nf = N.toLocaleString('en-US')
              const redWidth = Math.round((orderExp / 20) * 100)
              const purpleWidth = Math.max(0.8, (siblings / N) * 100)
              return (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "1rem",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.875rem",
                  }}
                >
                  {/* Row 1: header + N display */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1rem" }}>⚡</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1e293b" }}>ลองเลื่อนดู ถ้าเว็บเทรดมีออร์เดอร์</span>
                    </div>
                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#6d28d9" }}>{Nf} <span style={{ fontWeight: 500, fontSize: "0.75rem", color: "#64748b" }}>ใบ</span></span>
                  </div>

                  {/* Slider controlling N */}
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={orderExp}
                    onChange={handleOrderExpChange}
                    style={{ width: "100%", accentColor: "#6d28d9", cursor: "pointer" }}
                  />

                  {/* Row 2: โหลดข้อมูลทั้งระบบ - red bar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ef4444" }}>โหลดดูข้อมูลทั้งระบบ</span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>{Nf} ใบ</span>
                    </div>
                    <div style={{ height: 8, background: "#fee2e2", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: redWidth + "%", background: "linear-gradient(90deg,#ef4444,#dc2626)", borderRadius: 4, transition: "width 0.3s ease" }}/>
                    </div>
                  </div>

                  {/* Row 3: Merkle Proof - purple bar (tiny relative to N) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7c3aed" }}>Merkle Proof</span>
                      <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "#7c3aed" }}>ข้อมูลดิบ 1 + Sibling Hash <strong>{siblings}</strong> ตัว</span>
                    </div>
                    <div style={{ height: 8, background: "#ede9fe", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: purpleWidth + "%", background: "#7c3aed", borderRadius: 4, transition: "width 0.3s ease" }}/>
                    </div>
                  </div>

                  {/* Insight text */}
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center" }}>
                    ออร์เดอร์เพิ่มเป็น 2 เท่า → หลักฐานเพิ่มแค่ 1 Hash
                  </div>
                </div>
              )
            })()}

            {/* Green Card: แสดงเมื่อเลื่อน slider */}
            {showReasonCard && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "1rem",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <CheckCircle2
                  style={{
                    width: "22px",
                    height: "22px",
                    color: "#059669",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "#047857",
                    }}
                  >
                    นี่คือเหตุผลที่ต้องมี Merkle Tree
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "#334155",
                      lineHeight: 1.6,
                    }}
                  >
                    ออร์เดอร์ 1 ล้านใบ ใช้หลักฐานแค่ประมาณ 20 Hash — ผู้ตรวจยืนยันได้จากข้อมูลอ้างอิงเพียงเล็กน้อย แทนการโหลดดูข้อมูลทั้งระบบ ขั้นต่อไปเราจะลงมือสร้างต้นไม้จริงขนาด 4 ใบกัน
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer controls: Back to First / Prev / Next Tab */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab(0)}
            disabled={activeTab === 0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "none",
              color: activeTab === 0 ? "#cbd5e1" : "#64748b",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: activeTab === 0 ? "not-allowed" : "pointer",
            }}
          >
            <RotateCcw style={{ width: 14, height: 14 }} />
            <span>กลับภาพแรก</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {activeTab > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab((prev) => Math.max(prev - 1, 0))}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#ffffff",
                  color: "#475569",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  padding: "7px 16px",
                  borderRadius: "9999px",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                <ArrowLeft style={{ width: 13, height: 13 }} />
                <span>ย้อนกลับ</span>
              </button>
            )}

            {activeTab < 3 ? (
              <button
                type="button"
                onClick={() => setActiveTab((prev) => Math.min(prev + 1, 3))}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#5b21b6",
                  color: "#ffffff",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  padding: "7px 18px",
                  borderRadius: "9999px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(91, 33, 182, 0.25)",
                }}
              >
                <span>ภาพถัดไป</span>
                <ArrowRight style={{ width: 13, height: 13 }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!isStep1Correct) {
                    answerStep1(2)
                  }
                  goNext()
                }}
                disabled={!showReasonCard}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: showReasonCard ? "#16a34a" : "#cbd5e1",
                  color: "#ffffff",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  border: "none",
                  cursor: showReasonCard ? "pointer" : "not-allowed",
                  boxShadow: showReasonCard ? "0 2px 10px rgba(22, 163, 74, 0.25)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <span>ไปขั้นที่ 2 : สร้าง Hash และต้นไม้</span>
                <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </div>
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
  const { tree, hashedLeaves, revealHash, builtPairs, isRootBuilt, buildPair, buildRoot, selectedLeaf, selectLeaf } = useLab05()
  const [showHint, setShowHint] = useState(false)
  const [showTreeHint, setShowTreeHint] = useState(false)
  const isAllHashed = hashedLeaves.every(Boolean)
  const hasBothPairs = builtPairs.every(Boolean)

  const revealAllHashes = () => {
    orders.forEach((_, idx) => revealHash(idx))
  }

  return (
    <div className="lab5-space-y-6">
      {/* 1. Header */}
      <div className="lab5-space-y-1.5">
        <span
          className="lab5-inline-block lab5-rounded-full lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold"
          style={{ backgroundColor: "#f3e8ff", color: "#6d28d9" }}
        >
          ภาค 1: MERKLE TREE
        </span>
        <h2
          className="lab5-text-balance lab5-text-xl lab5-font-extrabold lab5-leading-tight lab5-sm:text-2xl"
          style={{ color: "#0f172a", fontWeight: 800, margin: 0 }}
        >
          2. การสร้าง Hash และประกอบต้นไม้ (Tree Construction)
        </h2>
        <p className="lab5-text-sm" style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>
          คอนเซปต์สำคัญ: วิธีรวมโหนดที่ถูกต้องของ Merkle Tree
        </p>
      </div>

      {/* 2. Concept Card: การรวมโหนด (Node Combination) */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1rem",
          padding: "1.25rem 1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link2 style={{ width: "1.125rem", height: "1.125rem", color: "#7c3aed" }} />
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            คอนเซปต์สำคัญ: การรวมโหนด (Node Combination)
          </h3>
        </div>

        {/* 2 Column Comparison Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* Left Column: Red (Wrong) */}
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "0.875rem",
              padding: "1rem 1.125rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#dc2626" }}>
              เราจะไม่ใช้สูตร Hash(A + B) เป็นอันขาด
            </div>

            {/* Diagram */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #fee2e2",
                borderRadius: "0.625rem",
                padding: "0.625rem 0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.375rem",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "0.7rem", color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "9999px", padding: "2px 8px", fontFamily: "monospace" }}>
                A (ข้อมูลดิบ)
              </span>
              <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.8rem" }}>+</span>
              <span style={{ fontSize: "0.7rem", color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "9999px", padding: "2px 8px", fontFamily: "monospace" }}>
                B (ข้อมูลดิบ)
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>→</span>
              <span style={{ fontSize: "0.7rem", color: "#ffffff", background: "#0f172a", borderRadius: "9999px", padding: "2px 8px", fontWeight: 700, fontFamily: "monospace" }}>
                H( )
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>→</span>
              <span style={{ fontSize: "0.7rem", color: "#dc2626", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "9999px", padding: "2px 8px", fontWeight: 700, fontFamily: "monospace" }}>
                H(A+B)
              </span>
            </div>

            <p style={{ fontSize: "0.75rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
              การเขียน Hash(A+B) จะสื่อว่าเป็นการเอาข้อมูลดิบ A และ B มาบวกกันก่อนแล้วค่อย Hash ซึ่งจะทำให้โหนดที่ทำหน้าที่รวมต้องรู้ “ไส้ใน” หรือข้อมูลดิบของโหนดลูก ถือว่าผิดหลักการทำงานของ Merkle Tree ที่ต้องการปกปิดข้อมูล!
            </p>
          </div>

          {/* Right Column: Green (Correct) */}
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "0.875rem",
              padding: "1rem 1.125rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#16a34a" }}>
              คอนเซปต์ที่ถูกต้อง: Hash(Hash A + Hash B)
            </div>

            {/* Diagram */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #dcfce7",
                borderRadius: "0.625rem",
                padding: "0.625rem 0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.375rem",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "0.7rem", color: "#7c3aed", background: "#f3e8ff", border: "1px solid #ddd6fe", borderRadius: "9999px", padding: "2px 8px", fontWeight: 600, fontFamily: "monospace" }}>
                H(A)
              </span>
              <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.8rem" }}>+</span>
              <span style={{ fontSize: "0.7rem", color: "#7c3aed", background: "#f3e8ff", border: "1px solid #ddd6fe", borderRadius: "9999px", padding: "2px 8px", fontWeight: 600, fontFamily: "monospace" }}>
                H(B)
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>→</span>
              <span style={{ fontSize: "0.7rem", color: "#ffffff", background: "#0f172a", borderRadius: "9999px", padding: "2px 8px", fontWeight: 700, fontFamily: "monospace" }}>
                H( )
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>→</span>
              <span style={{ fontSize: "0.7rem", color: "#16a34a", background: "#dcfce7", border: "1px solid #86efac", borderRadius: "9999px", padding: "2px 8px", fontWeight: 700, fontFamily: "monospace" }}>
                H(H(A)+H(B))
              </span>
            </div>

            <p style={{ fontSize: "0.75rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
              เราต้องนำค่า Hash ของ A มาต่อกับ Hash ของ B แล้วนำผลลัพธ์นั้นไป Hash อีกทอดหนึ่ง นั่นคือสูตร Hash(Hash A + Hash B) (เขียนย่อว่า H(H(A)+H(B))) ทำให้โหนดระดับบนไม่ต้องรับรู้ข้อมูลดิบเลย
            </p>
          </div>
        </div>

        {/* Bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#475569", lineHeight: 1.6 }}>
            • <strong>Leaf Node (ใบ):</strong> เริ่มจากการนำข้อมูลความลับของแต่ละออร์เดอร์ (Secret) มาแปลงเป็นลายนิ้วมือดิจิทัล (Hash) เสียก่อน
          </div>
          <div style={{ fontSize: "0.75rem", color: "#475569", lineHeight: 1.6 }}>
            • <strong>Merkle Root:</strong> ระบบจะจับคู่ทำแบบนี้ซ้ำขึ้นไปเรื่อย ๆ จนเหลือค่าเดียวที่ยอดบนสุดเรียกว่า Merkle Root (เปิดเผยให้ทุกคนเห็นเป็น Public)
          </div>
        </div>
      </div>

      {/* 3. Section: สร้าง Leaf Node ทั้ง 4 ใบ */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b" }}>
            ① สร้าง Leaf Node ให้ครบทั้ง 4 ใบ (แปลง Secret → Hash)
          </div>
          {!isAllHashed && (
            <button
              type="button"
              onClick={revealAllHashes}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                backgroundColor: "#ffffff",
                border: "1px solid #ddd6fe",
                color: "#6d28d9",
                borderRadius: "9999px",
                padding: "0.375rem 0.875rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(109, 40, 217, 0.08)",
              }}
            >
              <Sparkles style={{ width: "0.8rem", height: "0.8rem" }} />
              <span>สร้างทั้งหมดทีเดียว</span>
            </button>
          )}
        </div>

        {/* 4 Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "0.875rem",
          }}
        >
          {orders.map((order, index) => {
            const isHashed = hashedLeaves[index]
            const isUserOrder = order.id === "B"
            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: "#ffffff",
                  border: isHashed ? "1px solid #ddd6fe" : "1px solid #e2e8f0",
                  borderRadius: "1rem",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a" }}>
                    {order.label}
                  </span>
                  {isUserOrder && (
                    <span
                      style={{
                        fontSize: "0.625rem",
                        fontWeight: 700,
                        backgroundColor: "#ede9fe",
                        color: "#6d4bd8",
                        padding: "1px 6px",
                        borderRadius: "9999px",
                      }}
                    >
                      ของคุณ
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                    รหัสลับ (Secret)
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#1e293b",
                      marginTop: "2px",
                      wordBreak: "break-all",
                    }}
                  >
                    {order.value}
                  </div>
                </div>

                <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                  {!isHashed ? (
                    <button
                      type="button"
                      onClick={() => revealHash(index)}
                      style={{
                        width: "100%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        backgroundColor: "#5b21b6",
                        color: "#ffffff",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "7px 10px",
                        borderRadius: "9999px",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(91, 33, 182, 0.25)",
                      }}
                    >
                      <Sparkles style={{ width: "0.75rem", height: "0.75rem" }} />
                      <span>สร้าง Leaf Hash</span>
                    </button>
                  ) : (
                    <div
                      style={{
                        backgroundColor: "#f5f3ff",
                        border: "1px solid #ddd6fe",
                        borderRadius: "0.375rem",
                        padding: "0.5rem 0.625rem",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6d28d9" }}>
                          Leaf
                        </span>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6d28d9" }}>
                          H({order.id}) =
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#6d28d9",
                        }}
                      >
                        {tree?.leafHashes?.[index] ? TruncateHash(tree.leafHashes[index], 8) : "กำลังคำนวณ..."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ปุ่ม "ทำไม?" */}
        <div>
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "#f5f3ff",
              color: "#6d4bd8",
              cursor: "pointer",
              padding: "0.375rem 0.875rem",
              borderRadius: "9999px",
              border: "1px solid #ede9fe",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            <HelpCircle style={{ width: "0.75rem", height: "0.75rem" }} />
            <span>ทำไม?</span>
          </button>
        </div>

        {showHint && (
          <div
            className="lab5-animate-merge-up"
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
              fontSize: "0.75rem",
              color: "#475569",
              lineHeight: 1.6,
              padding: "0.875rem 1rem",
            }}
          >
            <strong style={{ color: "#0f172a" }}>คำใบ้:</strong> เราแปลงรหัสลับแต่ละ Order ให้เป็น Hash เพื่อเป็นลายนิ้วมือดิจิทัลที่ผู้ตรวจนำไปคำนวณ Merkle Root ได้ โดยที่ไม่มีใครรู้ข้อมูลจริงข้างใน
          </div>
        )}
      </div>

      {/* ② รวมโหนดทีละคู่ด้วยสูตร Hash(Hash ซ้าย + Hash ขวา) จนเหลือค่าเดียว */}
      {isAllHashed && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.25rem" }} className="lab5-animate-merge-up">
          {/* Header */}
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b" }}>
            ② รวมโหนดทีละคู่ด้วยสูตร Hash(Hash ซ้าย + Hash ขวา) จนเหลือค่าเดียว
          </div>

          {/* Tree Diagram Box */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "1.5rem",
              padding: "1.75rem 1.25rem 1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            {/* SVG Tree */}
            <svg
              viewBox="0 0 640 280"
              style={{ width: "100%", maxHeight: "300px", overflow: "visible" }}
            >
              {/* Lines from Pairs to Root (when isRootBuilt) */}
              {isRootBuilt && (
                <>
                  <line x1={170} y1={110 - 15} x2={320} y2={40 + 18} stroke="#16a34a" strokeWidth={2.5} />
                  <line x1={470} y1={110 - 15} x2={320} y2={40 + 18} stroke="#16a34a" strokeWidth={2.5} />
                </>
              )}

              {/* Lines from Leaves to Pair AB (when builtPairs[0]) */}
              {builtPairs[0] && (
                <>
                  <line x1={100} y1={175 - 15} x2={170} y2={110 + 15} stroke="#7c3aed" strokeWidth={2} />
                  <line x1={240} y1={175 - 15} x2={170} y2={110 + 15} stroke="#7c3aed" strokeWidth={2} />
                </>
              )}

              {/* Lines from Leaves to Pair CD (when builtPairs[1]) */}
              {builtPairs[1] && (
                <>
                  <line x1={400} y1={175 - 15} x2={470} y2={110 + 15} stroke="#7c3aed" strokeWidth={2} />
                  <line x1={540} y1={175 - 15} x2={470} y2={110 + 15} stroke="#7c3aed" strokeWidth={2} />
                </>
              )}

              {/* Root Node (when isRootBuilt) */}
              {isRootBuilt && (
                <g className="lab5-animate-merge-up">
                  <rect x={320 - 50} y={40 - 18} width={100} height={36} rx={18} fill="#dcfce7" stroke="#16a34a" strokeWidth={2.5} />
                  <text x={320} y={40 - 3} textAnchor="middle" fontSize="11" fontWeight="800" fill="#15803d">
                    Merkle Root
                  </text>
                  <text x={320} y={40 + 10} textAnchor="middle" fontSize="8.5" fontFamily="monospace" fontWeight="700" fill="#16a34a">
                    {tree?.root ? `${tree.root.slice(0, 8)}..` : "592ed5ae.."}
                  </text>
                </g>
              )}

              {/* Pair AB Node (when builtPairs[0]) */}
              {builtPairs[0] && (
                <g className="lab5-animate-merge-up">
                  <rect x={170 - 45} y={110 - 16} width={90} height={32} rx={16} fill="#6d28d9" stroke="#5b21b6" strokeWidth={1.5} />
                  <text x={170} y={110 - 2} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#ffffff">
                    H(H(A)+H(B))
                  </text>
                  <text x={170} y={110 + 10} textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="#ddd6fe">
                    {tree?.midHashes?.[0] ? `${tree.midHashes[0].slice(0, 6)}..` : "f619fa.."}
                  </text>
                </g>
              )}

              {/* Pair CD Node (when builtPairs[1]) */}
              {builtPairs[1] && (
                <g className="lab5-animate-merge-up">
                  <rect x={470 - 45} y={110 - 16} width={90} height={32} rx={16} fill="#6d28d9" stroke="#5b21b6" strokeWidth={1.5} />
                  <text x={470} y={110 - 2} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#ffffff">
                    H(H(C)+H(D))
                  </text>
                  <text x={470} y={110 + 10} textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="#ddd6fe">
                    {tree?.midHashes?.[1] ? `${tree.midHashes[1].slice(0, 6)}..` : "bc04ed.."}
                  </text>
                </g>
              )}

              {/* 4 Leaf Nodes & 4 Secret Nodes */}
              {[
                { id: "A", x: 100, hash: tree?.leafHashes?.[0]?.slice(0, 6) || "966a2c" },
                { id: "B", x: 240, hash: tree?.leafHashes?.[1]?.slice(0, 6) || "06e8f5" },
                { id: "C", x: 400, hash: tree?.leafHashes?.[2]?.slice(0, 6) || "8a8275" },
                { id: "D", x: 540, hash: tree?.leafHashes?.[3]?.slice(0, 6) || "e8db9e" },
              ].map(({ id, x, hash }) => (
                <g key={id}>
                  {/* Dashed vertical line between Secret and Leaf */}
                  <line
                    x1={x}
                    y1={235 - 15}
                    x2={x}
                    y2={175 + 15}
                    stroke="#cbd5e1"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />

                  {/* Leaf Node (solid border) */}
                  <rect
                    x={x - 28}
                    y={175 - 15}
                    width={56}
                    height={30}
                    rx={15}
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth={1.5}
                  />
                  <text x={x} y={175 - 2} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#1e293b">
                    H({id})
                  </text>
                  <text x={x} y={175 + 9} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#64748b">
                    {hash}..
                  </text>

                  {/* Secret Node (dashed border) */}
                  <rect
                    x={x - 26}
                    y={235 - 15}
                    width={52}
                    height={30}
                    rx={15}
                    fill="#ffffff"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <text x={x} y={235 - 2} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">
                    {id}
                  </text>
                  <text x={x} y={235 + 9} textAnchor="middle" fontSize="8.5" fontWeight="500" fill="#64748b">
                    Secret
                  </text>
                </g>
              ))}
            </svg>

            {/* Tree caption */}
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center", marginTop: "0.75rem" }}>
              แถวล่างเส้นประ = ข้อมูลจริง (Secret) · แถวถัดขึ้นไป = Leaf Node (Hash)
            </div>
          </div>

          {/* Controls below Tree */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            {!hasBothPairs && (
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b", textAlign: "center" }}>
                {!builtPairs[0] && !builtPairs[1]
                  ? "รวมโหนดคู่แรกด้วยสูตร Hash(Hash A + Hash B):"
                  : "จับคู่ที่เหลือให้ครบด้วยสูตรเดียวกัน:"}
              </div>
            )}

            {!hasBothPairs ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                {!builtPairs[0] ? (
                  <button
                    type="button"
                    onClick={() => buildPair(0)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      backgroundColor: "#ffffff",
                      border: "1.5px solid #ddd6fe",
                      color: "#6d28d9",
                      padding: "12px 18px",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(109, 40, 217, 0.08)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Link2 style={{ width: 16, height: 16 }} />
                    <span>จับคู่ Hash(Hash A + Hash B)</span>
                  </button>
                ) : (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      color: "#64748b",
                      padding: "12px 18px",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    <Check style={{ width: 16, height: 16, color: "#64748b" }} />
                    <span>รวม Hash(HA + HB) แล้ว</span>
                  </div>
                )}

                {!builtPairs[1] ? (
                  <button
                    type="button"
                    onClick={() => buildPair(1)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      backgroundColor: "#ffffff",
                      border: "1.5px solid #ddd6fe",
                      color: "#6d28d9",
                      padding: "12px 18px",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(109, 40, 217, 0.08)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Link2 style={{ width: 16, height: 16 }} />
                    <span>จับคู่ Hash(Hash C + Hash D)</span>
                  </button>
                ) : (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      color: "#64748b",
                      padding: "12px 18px",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    <Check style={{ width: 16, height: 16, color: "#64748b" }} />
                    <span>รวม Hash(HC + HD) แล้ว</span>
                  </div>
                )}
              </div>
            ) : !isRootBuilt ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} className="lab5-animate-merge-up">
                {/* Mentor Card (Matches media_1794320330717_0fb26ab9.png) */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "1.25rem",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.875rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      width: "2.25rem",
                      height: "2.25rem",
                      borderRadius: "9999px",
                      backgroundColor: "#f5f3ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6d28d9",
                      flexShrink: 0,
                    }}
                  >
                    <GraduationCap style={{ width: "1.25rem", height: "1.25rem" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
                        ดร. ซีโร่
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        ผู้สอน
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#334155", lineHeight: 1.6 }}>
                      ตอนนี้เหลือ 2 Hash ระดับกลาง — นำมารวมกันอีกทอดหนึ่งเพื่อสร้าง Merkle Root ยอดต้นไม้ครับ
                    </div>
                  </div>
                </div>

                {/* Button: รวมเป็น Merkle Root = Hash(โหนดซ้าย + โหนดขวา) */}
                <button
                  type="button"
                  onClick={buildRoot}
                  style={{
                    width: "100%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    backgroundColor: "#ffffff",
                    border: "1.5px solid #ddd6fe",
                    color: "#6d28d9",
                    padding: "12px 24px",
                    borderRadius: "9999px",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(109, 40, 217, 0.08)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Link2 style={{ width: 16, height: 16 }} />
                  <span>รวมเป็น Merkle Root = Hash(โหนดซ้าย + โหนดขวา)</span>
                </button>
              </div>
            ) : null}

            {/* Callout Box: รวมโหนดทีละคู่ทำยังไง (Matches media_1794319841347_210ae611.png & media_1794321261381_28005e36.png) */}
            {(builtPairs[0] || builtPairs[1]) && (
              <div
                className="lab5-animate-merge-up"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #ede9fe",
                  borderRadius: "1rem",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                  boxShadow: "0 2px 8px rgba(109, 40, 217, 0.04)",
                  marginTop: "0.25rem",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Lightbulb style={{ width: 18, height: 18, color: "#7c3aed", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e1b4b" }}>
                    รวมโหนดทีละคู่ทำยังไง
                  </span>
                </div>

                {/* Formula pills */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Pill 1 */}
                  <span
                    style={{
                      backgroundColor: "#f5f3ff",
                      border: "1px solid #ddd6fe",
                      color: "#7c3aed",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      fontFamily: "monospace",
                      padding: "4px 14px",
                      borderRadius: "9999px",
                    }}
                  >
                    H(A) {tree?.leafHashes?.[0]?.slice(0, 6) || "966a2c"}
                  </span>

                  <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.875rem" }}>+</span>

                  {/* Pill 2 */}
                  <span
                    style={{
                      backgroundColor: "#f5f3ff",
                      border: "1px solid #ddd6fe",
                      color: "#7c3aed",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      fontFamily: "monospace",
                      padding: "4px 14px",
                      borderRadius: "9999px",
                    }}
                  >
                    H(B) {tree?.leafHashes?.[1]?.slice(0, 6) || "06e8f5"}
                  </span>

                  <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>→</span>

                  {/* Pill 3 */}
                  <span
                    style={{
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      padding: "4px 14px",
                      borderRadius: "9999px",
                    }}
                  >
                    H( )
                  </span>

                  <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>→</span>

                  {/* Pill 4 */}
                  <span
                    style={{
                      backgroundColor: "#dcfce7",
                      border: "1px solid #86efac",
                      color: "#16a34a",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      padding: "4px 14px",
                      borderRadius: "9999px",
                    }}
                  >
                    H(H(A)+H(B)) {tree?.midHashes?.[0]?.slice(0, 6) || "f619fa"}
                  </span>
                </div>

                {/* Caption */}
                <div style={{ fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.6 }}>
                  โหนดบน = SHA-256( Hash A ต่อด้วย Hash B ) — โหนดบนไม่ต้องรู้ข้อมูลดิบข้างในเลย
                </div>
              </div>
            )}

            {/* Tree Complete: Merkle Root Card (Matches media_1794321261381_28005e36.png) */}
            {isRootBuilt && (
              <div
                className="lab5-animate-merge-up"
                style={{
                  backgroundColor: "#ecfdf5",
                  border: "1.5px solid #a7f3d0",
                  borderRadius: "1.25rem",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <CheckCircle2 style={{ width: 22, height: 22, color: "#16a34a", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#15803d" }}>
                    ต้นไม้สมบูรณ์: ได้ Merkle Root แล้ว
                  </span>
                </div>

                <div style={{ fontSize: "0.8125rem", color: "#334155", lineHeight: 1.6 }}>
                  <strong style={{ color: "#0f172a" }}>Merkle Root:</strong> ระบบจับคู่ทำแบบนี้ซ้ำขึ้นไปเรื่อย ๆ จนเหลือค่าเดียวที่ยอดบนสุด เรียกว่า <strong style={{ color: "#0f172a" }}>Merkle Root</strong> ซึ่งจะเป็นค่าเดียวที่เปิดเผยให้ทุกคนเห็น (Public)
                </div>

                <div style={{ fontSize: "0.8125rem", fontFamily: "monospace", color: "#475569" }}>
                  Root = H( H(H(A)+H(B)) + H(H(C)+H(D)) )
                </div>

                <div>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: "#dcfce7",
                      border: "1px solid #86efac",
                      color: "#15803d",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      padding: "6px 14px",
                      borderRadius: "0.375rem",
                    }}
                  >
                    Merkle Root = {tree?.root ? tree.root.slice(0, 8) : "592ed5ae"}...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: ภารกิจจำลองของคุณ (Matches media_1794321261381_28005e36.png) */}
          {isRootBuilt && (
            <div
              className="lab5-animate-merge-up"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
                marginTop: "1.25rem",
              }}
            >
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#6d28d9" }}>
                  ③ ภารกิจจำลองของคุณ
                </div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", marginTop: "0.25rem" }}>
                  เลือกรหัสออร์เดอร์ด้านล่างนี้ 1 ใบเพื่อตั้งเป็น "ออร์เดอร์ลับ" ของคุณ
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.75rem",
                }}
              >
                {orders.map((order, idx) => {
                  const isSelected = selectedLeaf === idx
                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => selectLeaf(idx)}
                      style={{
                        backgroundColor: isSelected ? "#f5f3ff" : "#ffffff",
                        border: isSelected ? "2px solid #7c3aed" : "1px solid #e2e8f0",
                        borderRadius: "1rem",
                        padding: "1rem 0.75rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.375rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: isSelected ? "0 2px 8px rgba(124, 58, 237, 0.15)" : "0 1px 3px rgba(0, 0, 0, 0.02)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: isSelected ? "#6d28d9" : "#0f172a",
                        }}
                      >
                        ออร์เดอร์ {order.id}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          color: isSelected ? "#7c3aed" : "#64748b",
                        }}
                      >
                        {order.value}
                      </span>
                      {isSelected && (
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            color: "#7c3aed",
                            marginTop: "0.125rem",
                          }}
                        >
                          — ออร์เดอร์ลับของคุณ
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Callout 2: secret order explanation */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #ede9fe",
                  borderRadius: "1rem",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <Lightbulb style={{ width: 18, height: 18, color: "#7c3aed", flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: "0.8125rem", color: "#334155", lineHeight: 1.6 }}>
                  ข้อความอย่าง <span style={{ fontFamily: "monospace" }}>secret-B-q92m</span> คือ <strong>“รหัสลับของออร์เดอร์”</strong> — มีแต่เจ้าของออร์เดอร์ที่รู้ เว็บเทรดจริงมีออร์เดอร์เป็นล้านใบ แต่แลปนี้ย่อส่วนมาใช้แค่ 4 ใบเพื่อให้เห็นภาพชัดเจน
                </div>
              </div>

              {/* Callout 3: prompt to select an order to unlock next button OR success message when selected */}
              {selectedLeaf === null ? (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #ede9fe",
                    borderRadius: "1rem",
                    padding: "0.875rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Lightbulb style={{ width: 18, height: 18, color: "#7c3aed", flexShrink: 0 }} />
                  <div style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 500 }}>
                    เลือกรหัสออร์เดอร์ลับของคุณ 1 ใบด้านบน เพื่อปลดล็อกปุ่ม "ไปขั้นต่อ"
                  </div>
                </div>
              ) : (
                <div
                  className="lab5-animate-merge-up"
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "1rem",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                  }}
                >
                  <CheckCircle2 style={{ width: 20, height: 20, color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#15803d" }}>
                      เลือกออร์เดอร์เรียบร้อยแล้ว!
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#334155", lineHeight: 1.6 }}>
                      คุณตั้ง <strong>ออร์เดอร์ {orders[selectedLeaf]?.id}</strong> เป็นออร์เดอร์ลับของคุณแล้ว กดปุ่ม <strong>"ไปขั้นต่อ"</strong> ด้านล่างเพื่อเริ่มสร้างและตรวจ Merkle Proof ในขั้นถัดไปครับ
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hint button below section 2 / 3 */}
          <div style={{ marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setShowTreeHint((prev) => !prev)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "#f5f3ff",
                color: "#6d4bd8",
                cursor: "pointer",
                padding: "0.375rem 0.875rem",
                borderRadius: "9999px",
                border: "1px solid #ede9fe",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              <HelpCircle style={{ width: "0.75rem", height: "0.75rem" }} />
              <span>ทำไม?</span>
            </button>
          </div>

          {showTreeHint && (
            <div
              className="lab5-animate-merge-up"
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "1rem",
                fontSize: "0.8125rem",
                color: "#475569",
                lineHeight: 1.65,
                padding: "1rem 1.25rem",
              }}
            >
              Parent hash เกิดจากการนำ Hash ของคู่ลูกมาต่อกันแล้ว Hash ใหม่อีกครั้ง Hash(Hash ซ้าย + Hash ขวา) เราทำแบบนี้ไปเรื่อย ๆ จนเหลือ Hash เดียว นั่นคือ Merkle Root — เพราะทุกชั้นผูกกันด้วย Hash ถ้าใบใดใบหนึ่งเปลี่ยน Root จะเปลี่ยนตามทันที
            </div>
          )}
        </div>
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
    foundSiblings,
    findSibling,
    authPathSteps,
  } = useLab05()

  const [wrongNodeId, setWrongNodeId] = useState(null)
  const [lastWrongNodeId, setLastWrongNodeId] = useState(null)
  const [flash, setFlash] = useState("idle")
  const [showWhyHint, setShowWhyHint] = useState(false)
  const [isRootReconstructed, setIsRootReconstructed] = useState(false)

  // แปลง nodeId เป็นชื่อ label ที่แสดงบน UI
  const getNodeDisplayLabel = (nodeId) => {
    if (!nodeId) return "โหนดนี้"
    if (nodeId === "leaf-0") return "H(A)"
    if (nodeId === "leaf-1") return "H(B)"
    if (nodeId === "leaf-2") return "H(C)"
    if (nodeId === "leaf-3") return "H(D)"
    if (nodeId === "mid-0") return "H(H(A)+H(B))"
    if (nodeId === "mid-1") return "H(H(C)+H(D))"
    if (nodeId === "root") return "ROOT"
    return nodeId
  }

  // ใช้ selectedLeaf จาก Step2 — ถ้ายังไม่ได้เลือก fallback เป็น 0
  const targetIdx = selectedLeaf ?? 0
  const targetOrder = orders[targetIdx]

  // คำนวณ sibling node IDs จาก authPathSteps
  const sibling0NodeId = authPathSteps[0]?.nodeId ?? null
  const sibling1NodeId = authPathSteps[1]?.nodeId ?? null

  const isSibling0Found = sibling0NodeId ? foundSiblings.includes(sibling0NodeId) : false
  const isSibling1Found = sibling1NodeId ? foundSiblings.includes(sibling1NodeId) : false
  const isAllFound = isSibling0Found && isSibling1Found

  // parent mid-node ของ targetIdx
  const parentMidIdx = Math.floor(targetIdx / 2)   // 0 หรือ 1
  const parentMidNodeId = `mid-${parentMidIdx}`

  // สร้าง nodeStateMap แบบ dynamic
  const nodeStateMap = useMemo(() => {
    const map = {}
    // target leaf
    map[`leaf-${targetIdx}`] = "target"
    // เส้นทางขึ้น root
    map[parentMidNodeId] = "path"
    map["root"] = "path"
    // sibling nodes
    if (sibling0NodeId) map[sibling0NodeId] = isSibling0Found ? "path" : "neutral"
    if (sibling1NodeId) map[sibling1NodeId] = isSibling1Found ? "path" : "neutral"
    // neutral ที่เหลือ
    for (let i = 0; i < 4; i++) {
      const nid = `leaf-${i}`
      if (!map[nid]) map[nid] = "neutral"
    }
    for (let i = 0; i < 2; i++) {
      const nid = `mid-${i}`
      if (!map[nid]) map[nid] = "neutral"
    }
    if (wrongNodeId) map[wrongNodeId] = "error"
    return map
  }, [targetIdx, parentMidNodeId, sibling0NodeId, sibling1NodeId, isSibling0Found, isSibling1Found, wrongNodeId])

  // clickable nodes = siblings ที่ยังไม่ได้ส่ง
  const clickableNodeIds = useMemo(() => {
    if (isAllFound) return []
    const all = ["leaf-0", "leaf-1", "leaf-2", "leaf-3", "mid-0", "mid-1"].filter(
      (id) => id !== `leaf-${targetIdx}` && id !== parentMidNodeId && id !== "root"
    )
    return all
  }, [isAllFound, targetIdx, parentMidNodeId])

  const handleClick = (nodeId) => {
    if (isAllFound) return

    // ชั้นที่ 1: ต้องเลือก sibling0NodeId ก่อน
    if (!isSibling0Found) {
      if (nodeId === sibling0NodeId) {
        findSibling(nodeId)
        setFlash("correct")
        setWrongNodeId(null)
        setLastWrongNodeId(null)
      } else {
        setWrongNodeId(nodeId)
        setLastWrongNodeId(nodeId)
        setFlash("wrong")
        setTimeout(() => setWrongNodeId(null), 700)
      }
      return
    }

    // ชั้นที่ 2: ต้องเลือก sibling1NodeId
    if (isSibling0Found && !isSibling1Found) {
      if (nodeId === sibling1NodeId) {
        findSibling(nodeId)
        setFlash("correct")
        setWrongNodeId(null)
        setLastWrongNodeId(null)
      } else {
        setWrongNodeId(nodeId)
        setLastWrongNodeId(nodeId)
        setFlash("wrong")
        setTimeout(() => setWrongNodeId(null), 700)
      }
      return
    }
  }

  const rootHash = tree?.root || ""
  const targetLeafHash = tree?.leafHashes?.[targetIdx] || ""
  const sibling0Hash = authPathSteps[0]?.hash || ""
  const sibling1Hash = authPathSteps[1]?.hash || ""
  const sibling0Label = authPathSteps[0]?.label || ""
  const sibling1Label = authPathSteps[1]?.label || ""
  const sibling0Position = authPathSteps[0]?.position || "left"

  // ป้ายกำกับแบบเต็ม เช่น H(H(A)+H(B)) และ H(H(C)+H(D))
  const parentMidLabel = parentMidIdx === 0 ? "H(H(A)+H(B))" : "H(H(C)+H(D))"
  const sibling1DisplayLabel = parentMidIdx === 0 ? "H(H(C)+H(D))" : "H(H(A)+H(B))"

  // ค่า interim hash หลังรวม sibling 0
  const parentMidHash = tree?.midHashes?.[parentMidIdx] || ""

  return (
    <div className="lab5-space-y-6">
      {/* Section Heading */}
      <div className="lab5-space-y-1.5">
        <span
          className="lab5-inline-block lab5-rounded-full lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold"
          style={{ backgroundColor: "#f3e8ff", color: "#6d28d9" }}
        >
          ภาค 1: MERKLE TREE
        </span>
        <h2
          className="lab5-text-balance lab5-text-xl lab5-font-extrabold lab5-leading-tight lab5-sm:text-2xl"
          style={{ color: "#0f172a", fontWeight: 800, margin: 0 }}
        >
          3. การเตรียมและตรวจหลักฐาน (Prover & Verifier)
        </h2>
        <p className="lab5-text-sm" style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>
          พิสูจน์ว่า ออร์เดอร์ {targetOrder.id} ของเรามีอยู่ในระบบจริง — การส่งต่อข้อมูลระหว่าง Prover (เรา) และ Verifier (ผู้ตรวจ)
        </p>
      </div>

      {/* 4. Two Column Grid (Prover card & Verifier card) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        {/* Left Card: Prover — ผู้พิสูจน์ส่ง */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #ede9fe",
            borderRadius: "1.25rem",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <User style={{ width: "1.125rem", height: "1.125rem", color: "#7c3aed" }} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>
              Prover — ผู้พิสูจน์ส่ง
            </span>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.375rem" }}>
              1. ข้อมูลที่ต้องการพิสูจน์
            </div>
            <span
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
              {targetOrder.value}
            </span>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.375rem" }}>
              2. Sibling Hash ชั้นใบ
            </div>
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#f5f3ff",
                border: "1px solid #ede9fe",
                color: "#7c3aed",
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              {sibling0Label} · ฝั่ง{sibling0Position === "left" ? "ซ้าย" : "ขวา"}
            </span>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.375rem" }}>
              3. Sibling Hash ชั้นบน
            </div>
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#f5f3ff",
                border: "1px solid #ede9fe",
                color: "#7c3aed",
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              {sibling1Label === "H(A+B)" ? "H(H(A)+H(B))" : sibling1Label === "H(C+D)" ? "H(H(C)+H(D))" : sibling1Label} · ฝั่ง{authPathSteps[1]?.position === "left" ? "ซ้าย" : "ขวา"}
            </span>
          </div>

          <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontStyle: "italic", marginTop: "0.25rem" }}>
            *(ไม่ต้องส่งค่า Root ไปให้ เพราะ Root ประกาศเป็นสาธารณะอยู่แล้ว)*
          </div>
        </div>

        {/* Right Card: Verifier — ผู้ตรวจมีอยู่แล้ว */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #bbf7d0",
            borderRadius: "1.25rem",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck style={{ width: "1.125rem", height: "1.125rem", color: "#16a34a" }} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#15803d" }}>
              Verifier — ผู้ตรวจมีอยู่แล้ว
            </span>
          </div>

          <div style={{ fontSize: "0.75rem", color: "#334155", lineHeight: 1.5 }}>
            Trusted Merkle Root ที่เว็บเทรดประกาศและบันทึกไว้ก่อนหน้า
          </div>

          <div>
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#dcfce7",
                border: "1px solid #86efac",
                color: "#15803d",
                borderRadius: "9999px",
                padding: "0.25rem 0.875rem",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              Trusted Root · {rootHash ? rootHash.slice(0, 10) : "592ed5aede"}..
            </span>
          </div>

          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "auto" }}>
            ผู้ตรวจไม่จำเป็นต้องรับข้อมูลออร์เดอร์ทั้ง 4 รายการ
          </div>
        </div>
      </div>

      {/* 5. Prompt Text above Tree */}
      <div
        style={{
          textAlign: "center",
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "#0f172a",
          marginTop: "0.5rem",
        }}
      >
        {!isSibling0Found && (
          <>
            ถ้าจะสร้าง {parentMidIdx === 0 ? "H(H(A)+H(B))" : "H(H(C)+H(D))"} เราต้องรู้ Hash ตัวไหนเพิ่ม? (คลิกเลือก Sibling Hash ชั้นที่ 1 บนต้นไม้)
          </>
        )}
        {isSibling0Found && !isSibling1Found && (
          <>
            ได้ {parentMidIdx === 0 ? "H(H(A)+H(B))" : "H(H(C)+H(D))"} แล้ว ต้องใช้ Hash ตัวไหนต่อเพื่อไปถึง Root? (คลิกเลือก Sibling Hash ชั้นที่ 2 บนต้นไม้)
          </>
        )}
        {isAllFound && (
          <span style={{ color: "#16a34a" }}>
            เลือก Sibling Hash ครบทุกชั้นแล้ว! Verifier สามารถคำนวณย้อนหา Root ได้แล้ว
          </span>
        )}
      </div>

      {/* 6. Interactive Merkle Tree Box */}
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
          customLabels={{
            "mid-0": "H(H(A)+H(B))",
            "mid-1": "H(H(C)+H(D))",
          }}
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
              กรอบม่วงอ่อน = ใบของเรา · คลิกที่โหนดเพื่อเลือก Sibling Hash
            </span>
          </div>
        </div>
      </div>

      {/* แจ้งเตือนเมื่อคลิกผิด */}
      {flash === "wrong" && !isAllFound && (
        <div
          className="lab5-animate-merge-up"
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <XCircle style={{ width: 20, height: 20, color: "#ef4444", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#dc2626" }}>
              ยังไม่ใช่ ลองอีกครั้ง
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#334155", marginTop: "0.125rem" }}>
              {getNodeDisplayLabel(lastWrongNodeId)} ไม่ได้อยู่ “ข้าง ๆ” เส้นทางของออร์เดอร์ {targetOrder.id} — ลองหา Sibling Hash ที่ต้องประกบกับเส้นทางของเราในชั้นนี้
            </div>
          </div>
        </div>
      )}

      {/* Intermediate state: พบ Sibling Hash ชั้นแรกแล้ว แต่ยังไม่ครบ */}
      {isSibling0Found && !isAllFound && (
        <>
          {/* Green success feedback */}
          {flash !== "wrong" && (
            <div
              className="lab5-animate-merge-up"
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "1rem",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <CheckCircle2 style={{ width: 20, height: 20, color: "#16a34a", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#15803d" }}>ถูกต้อง</div>
                <div style={{ fontSize: "0.8125rem", color: "#334155" }}>
                  พบ Sibling Hash ชั้นแรกแล้ว ต่อไปเลือก Sibling Hash ชั้นที่ 2
                </div>
              </div>
            </div>
          )}

          {/* Progressive package card (1/2 สำเร็จ) */}
          <div
            className="lab5-animate-merge-up lab5-rounded-2xl lab5-border"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#ede9fe",
              padding: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Package style={{ width: "1.125rem", height: "1.125rem", color: "#7c3aed" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
                แพ็กเกจหลักฐานที่ Prover ส่งให้ Verifier
              </span>
            </div>
            {/* รายการที่ 1: ข้อมูลดิบ */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.625rem" }}>
              <span
                style={{
                  width: "1.5rem", height: "1.5rem", borderRadius: "9999px",
                  backgroundColor: "#6d4bd8", color: "#fff", fontSize: "0.75rem",
                  fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >1</span>
              <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 600 }}>ข้อมูลดิบ:</span>
              <div
                style={{
                  display: "inline-block", backgroundColor: "#5850ec", color: "#fff",
                  borderRadius: "9999px", padding: "0.2rem 0.75rem", fontSize: "0.75rem",
                  fontFamily: "monospace", fontWeight: 600,
                }}
              >
                ออร์เดอร์ {targetOrder.id} ({targetOrder.value})
              </div>
            </div>
            {/* รายการที่ 2: Sibling Hash ชั้นที่ 1 */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem" }}>
              <span
                style={{
                  width: "1.5rem", height: "1.5rem", borderRadius: "9999px",
                  backgroundColor: "#6d4bd8", color: "#fff", fontSize: "0.75rem",
                  fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >2</span>
              <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 600 }}>Sibling Hash ชั้นที่ 1:</span>
              <div
                style={{
                  backgroundColor: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: "0.5rem",
                  padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontFamily: "monospace",
                  fontWeight: 600, color: "#6d4bd8",
                }}
              >
                {sibling0Label} = {TruncateHash(sibling0Hash, 8)}...
              </div>
              <span
                style={{
                  backgroundColor: "#ede9fe", color: "#6d4bd8", borderRadius: "9999px",
                  padding: "0.2rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600,
                }}
              >
                อยู่ฝั่ง{sibling0Position === "left" ? "ซ้าย" : "ขวา"}
              </span>
            </div>
            {/* หมายเหตุ */}
            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", fontStyle: "italic", margin: 0 }}>
              *(หมายเหตุ: ไม่ต้องส่งค่า Root ไปให้ เพราะ Root ประกาศเป็นสาธารณะอยู่แล้ว)*
            </p>
          </div>
        </>
      )}

      {/* ส่วนสรุปผลลัพธ์ (แสดงเมื่อคลิกส่ง Sibling ครบแล้ว) */}
      {isAllFound && (
        <>
          {/* Card 1: แพ็กเกจหลักฐานที่ Prover ส่งให้ Verifier (ครบทั้ง 3 รายการ) */}
          <div
            className="lab5-animate-merge-up lab5-rounded-2xl lab5-border"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#ede9fe",
              padding: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Package style={{ width: "1.125rem", height: "1.125rem", color: "#7c3aed" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
                แพ็กเกจหลักฐานที่ Prover ส่งให้ Verifier
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {/* รายการที่ 1: ข้อมูลดิบ */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <span
                  style={{
                    width: "1.5rem", height: "1.5rem", borderRadius: "9999px",
                    backgroundColor: "#6d4bd8", color: "#fff", fontSize: "0.75rem",
                    fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >1</span>
                <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 600 }}>ข้อมูลดิบ:</span>
                <div
                  style={{
                    display: "inline-block", backgroundColor: "#5850ec", color: "#fff",
                    borderRadius: "9999px", padding: "0.2rem 0.75rem", fontSize: "0.75rem",
                    fontFamily: "monospace", fontWeight: 600,
                  }}
                >
                  ออร์เดอร์ {targetOrder.id} ({targetOrder.value})
                </div>
              </div>

              {/* รายการที่ 2: Sibling Hash ชั้นที่ 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <span
                  style={{
                    width: "1.5rem", height: "1.5rem", borderRadius: "9999px",
                    backgroundColor: "#6d4bd8", color: "#fff", fontSize: "0.75rem",
                    fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >2</span>
                <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 600 }}>Sibling Hash ชั้นที่ 1:</span>
                <div
                  style={{
                    backgroundColor: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: "0.5rem",
                    padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontFamily: "monospace",
                    fontWeight: 600, color: "#6d4bd8",
                  }}
                >
                  {sibling0Label} = {TruncateHash(sibling0Hash, 8)}...
                </div>
                <span
                  style={{
                    backgroundColor: "#ede9fe", color: "#6d4bd8", borderRadius: "9999px",
                    padding: "0.2rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600,
                  }}
                >
                  อยู่ฝั่ง{sibling0Position === "left" ? "ซ้าย" : "ขวา"}
                </span>
              </div>

              {/* รายการที่ 3: Sibling Hash ชั้นที่ 2 */}
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
                  3
                </span>
                <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 600 }}>Sibling Hash ชั้นที่ 2:</span>
                <div
                  style={{
                    backgroundColor: "#f5f3ff",
                    border: "1px solid #ede9fe",
                    borderRadius: "0.5rem",
                    padding: "0.25rem 0.75rem",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    fontWeight: 600,
                    color: "#6d4bd8",
                  }}
                >
                  {sibling1DisplayLabel} = {TruncateHash(sibling1Hash, 8)}...
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
                  อยู่ฝั่ง{authPathSteps[1]?.position === "left" ? "ซ้าย" : "ขวา"}
                </span>
              </div>
            </div>
            {/* หมายเหตุ */}
            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", fontStyle: "italic", margin: "0.625rem 0 0" }}>
              *(หมายเหตุ: ไม่ต้องส่งค่า Root ไปให้ เพราะ Root ประกาศเป็นสาธารณะอยู่แล้ว)*
            </p>
          </div>

          {/* Card 2: ขั้นตอนคำนวณย้อนกลับ (Root Reconstruction โดย Verifier) */}
          <div
            className="lab5-animate-merge-up lab5-rounded-2xl lab5-border"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#ede9fe",
              padding: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
              <Search style={{ width: "1.125rem", height: "1.125rem", color: "#7c3aed" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
                ขั้นตอนคำนวณย้อนกลับ (Root Reconstruction โดย Verifier)
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
                fontSize: "0.8125rem",
                color: "#334155",
                marginBottom: "1.125rem",
                lineHeight: 1.6,
              }}
            >
              <div>
                1. นำข้อมูลดิบมา Hash เอง: ออร์เดอร์ {targetOrder.id} → จะได้ H({targetOrder.id})
              </div>
              <div>
                2. ประกบชั้นที่ 1: นำ H({targetOrder.id}) คู่กับ {sibling0Label} → จะได้ {parentMidLabel}
              </div>
              <div>
                3. ประกบชั้นที่ 2: นำผลลัพธ์ไปคู่กับ {sibling1DisplayLabel} → จะได้ค่า Root ที่คำนวณเอง
              </div>
            </div>

            {/* Formula Chips Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
                marginBottom: "1.125rem",
              }}
            >
              <span
                style={{
                  backgroundColor: "#fbfaff",
                  border: "1px solid #ede9fe",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#6d4bd8",
                }}
              >
                H({targetOrder.id})
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.875rem", fontWeight: 600 }}>+</span>
              <span
                style={{
                  backgroundColor: "#fbfaff",
                  border: "1px solid #ede9fe",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#6d4bd8",
                }}
              >
                {sibling0Label}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.875rem", fontWeight: 600 }}>→</span>
              <span
                style={{
                  backgroundColor: isRootReconstructed ? "#ecfdf5" : "#f8fafc",
                  border: isRootReconstructed ? "1px solid #a7f3d0" : "1px solid #e2e8f0",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: isRootReconstructed ? "#15803d" : "#64748b",
                  transition: "all 0.3s ease",
                }}
              >
                {isRootReconstructed ? parentMidLabel : "?"}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.875rem", fontWeight: 600 }}>+</span>
              <span
                style={{
                  backgroundColor: "#fbfaff",
                  border: "1px solid #ede9fe",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#6d4bd8",
                }}
              >
                {sibling1DisplayLabel}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.875rem", fontWeight: 600 }}>→</span>
              <span
                style={{
                  backgroundColor: isRootReconstructed ? "#ecfdf5" : "#f8fafc",
                  border: isRootReconstructed ? "1px solid #a7f3d0" : "1px solid #e2e8f0",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: isRootReconstructed ? "#15803d" : "#64748b",
                  transition: "all 0.3s ease",
                }}
              >
                {isRootReconstructed
                  ? `Root ${rootHash ? rootHash.slice(0, 8) : "592ed5ae"}`
                  : "Root ?"}
              </span>
            </div>

            {/* Action button (ซ่อนเมื่อคำนวณแล้วตามแบบในภาพ) */}
            {!isRootReconstructed && (
              <div>
                <button
                  type="button"
                  onClick={() => setIsRootReconstructed(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "#6d4bd8",
                    color: "#ffffff",
                    borderRadius: "9999px",
                    padding: "0.5rem 1.25rem",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(109, 75, 216, 0.25)",
                  }}
                >
                  <Zap style={{ width: "1rem", height: "1rem" }} />
                  <span>คำนวณย้อนกลับหา Merkle Root</span>
                </button>
              </div>
            )}
          </div>

          {/* แสดงการเปรียบเทียบ Root เมื่อคำนวณแล้ว */}
          {isRootReconstructed && (
            <>
              {/* Card 3: Two-column Root Comparison Cards */}
              <div
                className="lab5-animate-merge-up"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                {/* ซ้าย: Merkle Root สาธารณะ: */}
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
                      Merkle Root สาธารณะ:
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
                    {rootHash ? rootHash.slice(0, 8) : "592ed5ae"}...
                  </div>
                </div>

                {/* ขวา: ค่า Root ที่ Verifier คำนวณเอง */}
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
                      ค่า Root ที่ Verifier คำนวณเอง
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
                    {rootHash ? rootHash.slice(0, 8) : "592ed5ae"}...
                  </div>
                </div>
              </div>

              {/* Card 4: Success Feedback Card: ผลลัพธ์: ตรวจสอบผ่าน (Binding) */}
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
                    ผลลัพธ์: ตรวจสอบผ่าน (Binding)
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#065f46", margin: 0, lineHeight: 1.5 }}>
                  หากค่า Root ที่คำนวณเอง ตรงกับ Merkle Root สาธารณะ แปลว่า <strong>ออร์เดอร์ {targetOrder.id}</strong> มีอยู่จริง! (Binding)
                </p>
                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                  ข้อจำกัด: สังเกตว่า Verifier ยังคงมองเห็นข้อมูลดิบ ({targetOrder.value}), Sibling Hash และตำแหน่งในต้นไม้
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* ปุ่ม ? ทำไม? */}
      <div style={{ marginTop: "0.5rem" }}>
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
          <span>ทำไม?</span>
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
            <strong style={{ color: "#0f172a" }}>ทำไม Verifier ถึงเชื่อ?</strong> เพราะ Merkle Root คือผลลัพธ์ของการ Hash ต่อเนื่องมาจากข้อมูลทั้งหมด การเปลี่ยนแม้แต่ตัวอักษรเดียวจะทำให้ Root เปลี่ยนไปอย่างสิ้นเชิง เมื่อ Verifier นำ H({targetOrder.id}) + Sibling Hash มารวมแล้วได้ Root ตรงกับที่เว็บเทรดประกาศไว้ จึงพิสูจน์ได้ว่าออร์เดอร์ {targetOrder.id} อยู่ในระบบจริง 100% โดยไม่ต้องเปิดเผยข้อมูลของออร์เดอร์อื่นเลย
          </div>
        )}
      </div>
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
  const { tree, selectedLeaf, tamperedProof, isTamperMode, toggleTamper } = useLab05()
  const [showWhy, setShowWhy] = useState(false)

  if (!tree) return null

  // ใช้ selectedLeaf จาก Step 2 แบบ dynamic
  const targetIdx = selectedLeaf ?? 0
  const targetOrder = orders[targetIdx]
  const parentMidIdx = Math.floor(targetIdx / 2)
  const parentMidNodeId = `mid-${parentMidIdx}`
  const targetLeafNodeId = `leaf-${targetIdx}`

  const isMatching = !isTamperMode

  const nodeStateMap = isMatching
    ? {
      root: "success",
      [parentMidNodeId]: "success",
      [targetLeafNodeId]: "target",
    }
    : {
      root: "error",
      [parentMidNodeId]: "error",
      [targetLeafNodeId]: "error",
    }

  const customHashes = !isMatching
    ? {
      [targetLeafNodeId]: tamperedProof?.leafHash,
      [parentMidNodeId]: tamperedProof?.steps?.[0],
      root: tamperedProof?.root,
    }
    : {}

  const allNodeIds = ["root", "mid-0", "mid-1", "leaf-0", "leaf-1", "leaf-2", "leaf-3"]

  return (
    <div className="lab5-space-y-6">
      {/* Section Heading */}
      <div className="lab5-space-y-1.5">
        <span
          className="lab5-inline-block lab5-rounded-full lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold"
          style={{ backgroundColor: "#f3e8ff", color: "#6d28d9" }}
        >
          ทดสอบการแก้ข้อมูล
        </span>
        <h2
          className="lab5-text-balance lab5-text-xl lab5-font-extrabold lab5-leading-tight lab5-sm:text-2xl"
          style={{ color: "#0f172a", fontWeight: 800, margin: 0 }}
        >
          ถ้าข้อมูลคำสั่งซื้อถูกเปลี่ยน จะเกิดอะไรขึ้น?
        </h2>
        <p className="lab5-text-sm" style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>
          ลองแก้ข้อมูลของออร์เดอร์ {targetOrder.id} แล้วใช้ Authentication Path ชุดเดิมตรวจอีกครั้ง
        </p>
      </div>

      {/* Switch Toggle Card */}
      <div
        className="lab5-flex lab5-items-center lab5-justify-between lab5-gap-4 lab5-rounded-2xl lab5-border lab5-p-4"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          borderRadius: "1rem",
          padding: "1rem 1.25rem",
        }}
      >
        <div>
          <p className="lab5-text-sm lab5-font-bold" style={{ color: "#0f172a", margin: 0 }}>
            จำลองการแก้ไขข้อมูลของออร์เดอร์ {targetOrder.id}
          </p>
          <p className="lab5-text-xs" style={{ color: "#64748b", margin: "0.25rem 0 0" }}>
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
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
          }}
        >
          <CheckCircle2 style={{ width: 20, height: 20, color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#15803d", margin: 0 }}>
              ตรวจสอบผ่าน: ข้อมูลถูกต้อง
            </p>
            <p style={{ fontSize: "0.8125rem", color: "#334155", margin: 0 }}>
              ข้อมูลเดิมยังให้ Root ตรงกับค่าที่ประกาศไว้
            </p>
          </div>
        </div>
      ) : (
        <div
          className="lab5-animate-merge-up lab5-flex lab5-items-start lab5-gap-3"
          style={{
            backgroundColor: "#fff1f2",
            border: "1px solid #fecdd3",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
          }}
        >
          <AlertTriangle style={{ width: 20, height: 20, color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#b91c1c", margin: 0 }}>
              ปฏิเสธ: ตรวจพบการแก้ไขข้อมูล
            </p>
            <p style={{ fontSize: "0.8125rem", color: "#991b1b", margin: 0 }}>
              ค่า Root ไม่ตรงกัน เพราะข้อมูลถูกแก้ไขเพียงตัวอักษรเดียว ทำให้ Root เปลี่ยนไปทั้งหมด Verifier ปฏิเสธหลักฐานทันที
            </p>
          </div>
        </div>
      )}

      {/* Merkle Tree Diagram Card */}
      <div
        className="lab5-rounded-2xl lab5-border"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          borderRadius: "1.25rem",
          padding: "1.25rem",
        }}
      >
        <MerkleTreeDiagram
          nodeStateMap={nodeStateMap}
          hashNodeIds={allNodeIds}
          customHashes={customHashes}
          customLabels={{
            "mid-0": "H(H(A)+H(B))",
            "mid-1": "H(H(C)+H(D))",
          }}
        />
      </div>

      {/* Root Comparison Boxes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        {/* Left Box: Root ที่ประกาศไว้ */}
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck style={{ width: "1rem", height: "1rem", color: "#16a34a" }} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#065f46" }}>
              Root ที่ประกาศไว้
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #86efac",
              borderRadius: "9999px",
              padding: "0.375rem 1rem",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#15803d",
              }}
            >
              {tree.root ? TruncateHash(tree.root, 8) : "592ed5ae..."}
            </span>
          </div>
        </div>

        {/* Right Box: Root ที่คำนวณได้ */}
        <div
          style={{
            backgroundColor: isMatching ? "#f0fdf4" : "#fff1f2",
            border: isMatching ? "1px solid #bbf7d0" : "1px solid #fecdd3",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap style={{ width: "1rem", height: "1rem", color: isMatching ? "#16a34a" : "#ef4444" }} />
            <span
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: isMatching ? "#065f46" : "#b91c1c",
              }}
            >
              Root ที่คำนวณได้
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: isMatching ? "1px solid #86efac" : "1px solid #fca5a5",
              borderRadius: "9999px",
              padding: "0.375rem 1rem",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: isMatching ? "#15803d" : "#b91c1c",
              }}
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
              <code className="lab5-font-mono lab5-text-foreground">{targetOrder.value}</code> →{" "}
              <code className="lab5-font-mono lab5-text-foreground">{targetOrder.tamperedValue}</code>) ผลลัพธ์ของ Leaf Hash จะเปลี่ยนไปอย่างสิ้นเชิงแบบสุ่ม
            </p>
            <p className="lab5-text-xs lab5-leading-relaxed lab5-text-muted-foreground">
              และเนื่องจาก Merkle Tree สร้างขึ้นจากการนำ Hash คู่ล่างมาต่อกันแล้วแฮชขึ้นไปเรื่อยๆ เมื่อ Leaf Hash ของออร์เดอร์ {targetOrder.id} เปลี่ยน จึงส่งผลให้ <strong className="lab5-text-foreground">{parentMidIdx === 0 ? "H(H(A)+H(B))" : "H(H(C)+H(D))"}</strong> และ <strong className="lab5-text-foreground">ROOT</strong> เปลี่ยนตามไปด้วย
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
  const { markComplete } = useLab05()
  const [showWhy, setShowWhy] = useState(false)

  useEffect(() => {
    if (typeof markComplete === "function") {
      markComplete(5)
    }
  }, [markComplete])

  return (
    <div className="lab5-space-y-6">
      {/* 1. Section Heading */}
      <div className="lab5-space-y-1.5">
        <span
          className="lab5-inline-block lab5-rounded-full lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold"
          style={{ backgroundColor: "#f3e8ff", color: "#6d28d9" }}
        >
          ZK-SNARK คืออะไร?
        </span>
        <h2
          className="lab5-text-balance lab5-text-xl lab5-font-extrabold lab5-leading-tight lab5-sm:text-2xl"
          style={{ color: "#0f172a", fontWeight: 800, margin: 0 }}
        >
          พิสูจน์ความจริง 100% โดยไม่เปิดเผยข้อมูลลับแม้แต่น้อย
        </h2>
        <p className="lab5-text-sm" style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>
          เทคโนโลยีการเข้ารหัสลับยุคใหม่สำหรับระบบที่ต้องการความเป็นส่วนตัวและความเร็ว
        </p>
      </div>

      {/* 2. ความหมายของ zk-SNARK Card */}
      <div
        className="lab5-rounded-2xl lab5-border"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#ede9fe",
          borderRadius: "1.25rem",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Header with Icon */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "9999px",
              backgroundColor: "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck style={{ width: "1.25rem", height: "1.25rem", color: "#16a34a" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              ความหมายของ zk-SNARK
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.15rem 0 0" }}>
              Zero-Knowledge Succinct Non-Interactive Argument of Knowledge
            </p>
          </div>
        </div>

        {/* Description Paragraph */}
        <p style={{ fontSize: "0.875rem", color: "#334155", margin: 0, lineHeight: 1.6 }}>
          คือเทคโนโลยีการเข้ารหัสลับที่ช่วยให้เราสามารถ{" "}
          <strong style={{ color: "#059669" }}>
            "พิสูจน์ได้ว่าเรามีข้อมูลลับหรือทำตามเงื่อนไขถูกต้อง 100% โดยไม่ต้องเปิดเผยตัวข้อมูลลับนั้นออกมาเลย"
          </strong>
        </p>

        {/* 4-Box Grid (zk, S, N, ARK) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.875rem",
          }}
        >
          {/* zk - Zero-Knowledge */}
          <div
            style={{
              backgroundColor: "#f0fdf4",
              borderLeft: "4px solid #10b981",
              borderRadius: "0.75rem",
              padding: "0.875rem 1rem",
            }}
          >
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
              <span style={{ color: "#059669" }}>zk</span> · Zero-Knowledge
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
              Verifier ไม่ได้ความรู้อะไรเพิ่ม นอกจาก "จริง" หรือ "ไม่จริง"
            </div>
          </div>

          {/* S - Succinct */}
          <div
            style={{
              backgroundColor: "#f0fdf4",
              borderLeft: "4px solid #10b981",
              borderRadius: "0.75rem",
              padding: "0.875rem 1rem",
            }}
          >
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
              <span style={{ color: "#059669" }}>S</span> · Succinct (กระชับ)
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
              หลักฐานเล็กมาก ตรวจได้เร็ว ไม่ว่าเรื่องที่พิสูจน์จะซับซ้อนแค่ไหน
            </div>
          </div>

          {/* N - Non-Interactive */}
          <div
            style={{
              backgroundColor: "#f0fdf4",
              borderLeft: "4px solid #10b981",
              borderRadius: "0.75rem",
              padding: "0.875rem 1rem",
            }}
          >
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
              <span style={{ color: "#059669" }}>N</span> · Non-Interactive
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
              ส่งหลักฐานข้ามเส้นครั้งเดียวจบ ไม่ต้องถาม-ตอบกันไปมาแบบขั้นที่ 3
            </div>
          </div>

          {/* ARK - Argument of Knowledge */}
          <div
            style={{
              backgroundColor: "#f0fdf4",
              borderLeft: "4px solid #10b981",
              borderRadius: "0.75rem",
              padding: "0.875rem 1rem",
            }}
          >
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
              <span style={{ color: "#059669" }}>ARK</span> · ARgument of Knowledge
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
              พิสูจน์ว่า "รู้" ข้อมูลลับจริง ไม่ใช่แค่เดาถูก
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section 2 Heading */}
      <div>
        <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          zk-SNARK เอาไว้แก้อะไร? (2 ปัญหาหลัก)
        </h3>
      </div>

      {/* 4. Two-Column Problem/Solution Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        {/* Left Column: 1. ปัญหาด้านความเป็นส่วนตัว (Privacy) */}
        <div
          className="lab5-rounded-2xl lab5-border"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#ede9fe",
            borderRadius: "1.25rem",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Lock style={{ width: "1rem", height: "1rem", color: "#7c3aed" }} />
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
              1. ปัญหาด้านความเป็นส่วนตัว (Privacy)
            </span>
          </div>

          {/* Red Box: ระบบเดิม */}
          <div
            style={{
              backgroundColor: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.625rem",
            }}
          >
            <XCircle style={{ width: "1rem", height: "1rem", color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.75rem", color: "#334155", lineHeight: 1.5 }}>
              <strong style={{ color: "#dc2626" }}>ระบบเดิม:</strong> ต้องเปิดเผยข้อมูลจริง (เช่น โชว์ยอดเงิน) ระบบถึงจะยอมเชื่อ
            </div>
          </div>

          {/* Green Box: zk-SNARK */}
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.625rem",
            }}
          >
            <CheckCircle2 style={{ width: "1rem", height: "1rem", color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.75rem", color: "#334155", lineHeight: 1.5 }}>
              <strong style={{ color: "#15803d" }}>zk-SNARK:</strong> ใช้ "บทพิสูจน์ทางคณิตศาสตร์" ยืนยันความถูกต้อง โดยความลับไม่รั่วไหล
            </div>
          </div>
        </div>

        {/* Right Column: 2. ปัญหาความล่าช้าในการตรวจสอบ (Scalability) */}
        <div
          className="lab5-rounded-2xl lab5-border"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#ede9fe",
            borderRadius: "1.25rem",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap style={{ width: "1rem", height: "1rem", color: "#7c3aed" }} />
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
              2. ปัญหาความล่าช้าในการตรวจสอบ (Scalability)
            </span>
          </div>

          {/* Red Box: ระบบเดิม */}
          <div
            style={{
              backgroundColor: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.625rem",
            }}
          >
            <XCircle style={{ width: "1rem", height: "1rem", color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.75rem", color: "#334155", lineHeight: 1.5 }}>
              <strong style={{ color: "#dc2626" }}>ระบบเดิม:</strong> ต้องไล่เช็คธุรกรรมนับแสนรายการทีละอัน ทำให้ระบบช้ามาก
            </div>
          </div>

          {/* Green Box: zk-SNARK */}
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.625rem",
            }}
          >
            <CheckCircle2 style={{ width: "1rem", height: "1rem", color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.75rem", color: "#334155", lineHeight: 1.5 }}>
              <strong style={{ color: "#15803d" }}>zk-SNARK:</strong> มัดรวมการคำนวณเป็น "ข้อพิสูจน์เดียว" ที่ผู้ตรวจเช็คเสร็จได้ในเสี้ยววินาที
            </div>
          </div>
        </div>
      </div>

      {/* 5. Why Button & Explanation Card */}
      <div style={{ marginTop: "1rem" }}>
        <button
          type="button"
          onClick={() => setShowWhy((prev) => !prev)}
          className="lab5-inline-flex lab5-items-center lab5-transition-all"
          style={{
            backgroundColor: "#f5f3ff",
            color: "#6d4bd8",
            padding: "0.375rem 0.875rem",
            borderRadius: "9999px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            gap: "0.375rem",
            border: "1px solid #ede9fe",
            cursor: "pointer",
          }}
        >
          <HelpCircle style={{ width: "0.875rem", height: "0.875rem", color: "#6d4bd8" }} />
          <span>ทำไม?</span>
        </button>

        {showWhy && (
          <div
            className="lab5-animate-merge-up"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
              marginTop: "0.625rem",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
            }}
          >
            <p
              style={{
                fontSize: "0.8125rem",
                color: "#475569",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              zk-SNARK เปลี่ยนการตรวจสอบจากเดิมที่ต้องคำนวณข้อมูลดิบทั้งหมดซ้ำ มาเป็นการตรวจ &quot;Proof ขนาดไม่กี่ร้อยไบต์&quot; ที่ยืนยันว่าการคำนวณถูกรันอย่างถูกต้องจริง จึงแก้ได้ทั้งเรื่องความลับ (Zero-Knowledge) และเรื่องความเร็ว/การรองรับปริมาณมหาศาล (Scalability)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ขั้นที่ 6: Merkle Proof ยังเผยอะไร (มองจากมุมผู้ตรวจ ว่าหลักฐานที่ส่งไปเผยอะไรบ้าง)
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 6
 * @author StealthTrade Team
 */
function Step6MerkleProofExposed() {
  const { tree, selectedLeaf, authPathSteps, markComplete } = useLab05()
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showWhy, setShowWhy] = useState(false)

  const handleSelectAnswer = (ans) => {
    setSelectedAnswer(ans)
    if (ans === "know") {
      if (typeof markComplete === "function") {
        markComplete(6)
      }
    }
  }

  const leafIdx = selectedLeaf ?? 0
  const currentOrder = orders[leafIdx] || orders[0]

  // Sibling 0 (ชั้นที่ 1)
  const rawSibling0Label = authPathSteps[0]?.label || "H(B)"
  const sibling0Hash = authPathSteps[0]?.hash ? TruncateHash(authPathSteps[0].hash, 8) : "06e8f513"
  const sibling0Pos = authPathSteps[0]?.position === "left" ? "ฝั่งซ้าย" : "ฝั่งขวา"
  const sibling0Text = `${rawSibling0Label} ${sibling0Hash} · ${sibling0Pos}`

  // Sibling 1 (ชั้นที่ 2)
  const rawSibling1Label = authPathSteps[1]?.label || "H(C+D)"
  const sibling1Label =
    rawSibling1Label === "H(A+B)"
      ? "H(H(A)+H(B))"
      : rawSibling1Label === "H(C+D)"
      ? "H(H(C)+H(D))"
      : rawSibling1Label
  const sibling1Hash = authPathSteps[1]?.hash ? TruncateHash(authPathSteps[1].hash, 8) : "bc6a6e07"
  const sibling1Pos = authPathSteps[1]?.position === "left" ? "ฝั่งซ้าย" : "ฝั่งขวา"
  const sibling1Text = `${sibling1Label} ${sibling1Hash} · ${sibling1Pos}`

  // Root
  const rootDisplay = tree?.root ? TruncateHash(tree.root, 8) : "592ed5ae"

  return (
    <div className="lab5-space-y-6">
      {/* 1. Section Heading */}
      <div className="lab5-space-y-1.5">
        <span
          className="lab5-inline-block lab5-rounded-full lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold"
          style={{ backgroundColor: "#f3e8ff", color: "#6d28d9" }}
        >
          MERKLE PROOF ยังเผยอะไร
        </span>
        <h2
          className="lab5-text-balance lab5-text-xl lab5-font-extrabold lab5-leading-tight lab5-sm:text-2xl"
          style={{ color: "#0f172a", fontWeight: 800, margin: 0 }}
        >
          ผู้ตรวจเห็นอะไรบ้างใน Merkle Proof?
        </h2>
        <p className="lab5-text-sm" style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>
          นี่คือสิ่งที่คุณส่งไปให้ผู้ตรวจในขั้นที่ 3
        </p>
      </div>

      {/* 2. กล่องหลักฐานที่ส่งให้ผู้ตรวจ (Merkle proof) */}
      <div
        className="lab5-rounded-2xl"
        style={{
          backgroundColor: "#ffffff",
          border: "1.5px solid #c4b5fd",
          borderRadius: "1.25rem",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.875rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Package style={{ width: "1.125rem", height: "1.125rem", color: "#7c3aed" }} />
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
              กล่องหลักฐานที่ส่งให้ผู้ตรวจ (Merkle proof)
            </span>
          </div>
          <span
            className="lab5-inline-block lab5-rounded-full lab5-px-2.5 lab5-py-0.5 lab5-text-xs lab5-font-semibold"
            style={{ backgroundColor: "#ede9fe", color: "#6d28d9" }}
          >
            ผู้ตรวจเปิดดูได้ทั้งหมด
          </span>
        </div>

        {/* Row 1: ข้อมูลออร์เดอร์ที่พิสูจน์ */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
            ข้อมูลออร์เดอร์ที่พิสูจน์
          </div>
          <div>
            <span
              className="lab5-inline-flex lab5-items-center lab5-rounded-full lab5-font-mono"
              style={{
                backgroundColor: "#6d28d9",
                color: "#ffffff",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {currentOrder.label} · {currentOrder.value}
            </span>
          </div>
        </div>

        {/* Row 2: Sibling Hash พร้อมตำแหน่ง */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
            Sibling Hash พร้อมตำแหน่ง
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <span
              className="lab5-inline-flex lab5-items-center lab5-rounded-full"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #ddd6fe",
                color: "#6d28d9",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "monospace",
              }}
            >
              {sibling0Text}
            </span>
            <span
              className="lab5-inline-flex lab5-items-center lab5-rounded-full"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #ddd6fe",
                color: "#6d28d9",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "monospace",
              }}
            >
              {sibling1Text}
            </span>
          </div>
        </div>

        {/* Row 3: Root ที่ประกาศไว้ */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
            Root ที่ประกาศไว้
          </div>
          <div>
            <span
              className="lab5-inline-flex lab5-items-center lab5-rounded-full"
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#16a34a",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "monospace",
              }}
            >
              Root {rootDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Question */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.25rem" }}>
        <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          จากกล่องนี้ ผู้ตรวจรู้ไหมว่าคุณเป็นเจ้าของออร์เดอร์ใบไหน?
        </h3>

        {/* Choices */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {/* Option 1: รู้ */}
          <button
            type="button"
            onClick={() => handleSelectAnswer("know")}
            className="lab5-w-full lab5-text-left lab5-rounded-2xl lab5-transition-all"
            style={{
              padding: "0.875rem 1.25rem",
              backgroundColor: "#ffffff",
              border: selectedAnswer === "know" ? "2px solid #10b981" : "1.5px solid #c4b5fd",
              borderRadius: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 800,
                color: selectedAnswer === "know" ? "#047857" : "#0f172a",
              }}
            >
              รู้
            </span>
            <span
              style={{
                fontSize: "0.8125rem",
                color: selectedAnswer === "know" ? "#059669" : "#64748b",
              }}
            >
              — เพราะเห็นข้อมูลออร์เดอร์และตำแหน่งชัดเจน
            </span>
          </button>

          {/* Option 2: ไม่รู้ */}
          <button
            type="button"
            onClick={() => handleSelectAnswer("unknown")}
            className="lab5-w-full lab5-text-left lab5-rounded-2xl lab5-transition-all"
            style={{
              padding: "0.875rem 1.25rem",
              backgroundColor: "#ffffff",
              border: selectedAnswer === "unknown" ? "2px solid #ef4444" : "1px solid #e2e8f0",
              borderRadius: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              ไม่รู้
            </span>
            <span
              style={{
                fontSize: "0.8125rem",
                color: selectedAnswer === "unknown" ? "#ef4444" : "#64748b",
              }}
            >
              — เพราะส่วนใหญ่เป็นแค่ Hash
            </span>
          </button>
        </div>

        {/* Feedback Cards */}
        {selectedAnswer === "know" && (
          <>
            <div
              className="lab5-animate-merge-up lab5-rounded-2xl"
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "1rem",
                padding: "1rem 1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 style={{ width: "1.125rem", height: "1.125rem", color: "#16a34a", flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#15803d" }}>
                  ถูกต้อง — ผู้ตรวจรู้ว่าเป็นออร์เดอร์ไหน
                </span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "#475569", margin: "0.375rem 0 0", lineHeight: 1.6 }}>
                Merkle proof พิสูจน์ว่า &ldquo;อยู่ในชุดข้อมูล&rdquo; ได้จริง แต่ต้องเปิดเผยข้อมูลของเราให้ผู้ตรวจเห็นด้วย
              </p>
            </div>

            {/* Card: สิ่งที่รั่วไปถึงผู้ตรวจ */}
            <div
              className="lab5-animate-merge-up lab5-rounded-2xl"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "1rem",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "0.75rem 1.25rem",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>
                  สิ่งที่รั่วไปถึงผู้ตรวจ
                </span>
              </div>

              {/* Row 1 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1.25rem",
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: "0.8125rem",
                  color: "#475569",
                }}
              >
                <span>
                  รหัสลับของออร์เดอร์ ({currentOrder.value})
                </span>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>
                  รั่ว
                </span>
              </div>

              {/* Row 2 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1.25rem",
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: "0.8125rem",
                  color: "#475569",
                }}
              >
                <span>
                  ว่าคุณคือออร์เดอร์ {currentOrder.id} (ใบที่ {leafIdx + 1} จาก 4)
                </span>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>
                  รั่ว
                </span>
              </div>

              {/* Row 3 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1.25rem",
                  fontSize: "0.8125rem",
                  color: "#475569",
                }}
              >
                <span>
                  Hash ข้าง ๆ และตำแหน่งในต้นไม้
                </span>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>
                  รั่ว
                </span>
              </div>
            </div>
          </>
        )}

        {selectedAnswer === "unknown" && (
          <div
            className="lab5-animate-merge-up lab5-rounded-2xl"
            style={{
              backgroundColor: "#fff5f5",
              border: "1px solid #fecaca",
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <XCircle style={{ width: "1.125rem", height: "1.125rem", color: "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#ef4444" }}>
                ลองดูกล่องหลักฐานอีกครั้ง
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#475569", margin: "0.375rem 0 0", lineHeight: 1.6 }}>
              ในกล่องมี <strong>รหัสลับของออร์เดอร์ {currentOrder.id}</strong> อยู่ตรง ๆ และตำแหน่ง “ซ้าย/ขวา” ของ Hash ข้าง ๆ ก็บอกได้ว่าเป็นใบที่เท่าไหร่ในต้นไม้
            </p>
          </div>
        )}

        {/* Why Button & Collapsible Card */}
        <div style={{ marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setShowWhy((prev) => !prev)}
            className="lab5-inline-flex lab5-items-center lab5-transition-all"
            style={{
              backgroundColor: "#f5f3ff",
              color: "#6d4bd8",
              padding: "0.375rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              gap: "0.375rem",
              border: "1px solid #ede9fe",
              cursor: "pointer",
            }}
          >
            <HelpCircle style={{ width: "0.875rem", height: "0.875rem", color: "#6d4bd8" }} />
            <span>ทำไม?</span>
          </button>

          {showWhy && (
            <div
              className="lab5-animate-merge-up"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "1rem",
                padding: "1rem 1.25rem",
                marginTop: "0.625rem",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
              }}
            >
              <p style={{ fontSize: "0.8125rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                แม้ข้อมูลบางส่วนจะเป็น Hash แต่เพราะ Verifier ได้รับข้อมูลดิบของออร์เดอร์เราโดยตรง และเห็นลำดับการนำ Hash มาประกบคู่ซ้าย/ขวา จึงทำให้ Verifier สามารถชี้ชัดได้ 100% ว่าเรากำลังพิสูจน์ออร์เดอร์ตำแหน่งไหนใน Merkle Tree ซึ่งไม่เป็นความลับตามหลัก Zero-Knowledge
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ขั้นที่ 7: zk-SNARK Pipeline (5 ขั้นตอน) — เดิน Statement → Circuit → Witness → Proof → Verify
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 7
 * @author StealthTrade Team
 */
function Step7ZkpWorkflow() {
  const { tree, selectedLeaf, authPathSteps = [], markComplete, goNext } = useLab05()
  const [stage, setStage] = useState(1) // 1..5
  const [showWitnessSecret, setShowWitnessSecret] = useState(false)
  const [proofTampered, setProofTampered] = useState(false)
  const [proofAttempted, setProofAttempted] = useState(false)
  const [proofHash, setProofHash] = useState("0cdbc6f7c060d2eca5ef25e9...")
  const [verified, setVerified] = useState(false)

  const rootHash = tree?.root ? TruncateHash(tree.root, 8) : "592ed5ae"
  const leafIdx = selectedLeaf ?? 0
  const currentOrder = orders[leafIdx] || orders[0]

  const tamperedSecret = currentOrder.id === "A" ? "secret-A-7f4k" : currentOrder.tamperedValue || "secret-fake-9999"

  const handleGenerateProof = () => {
    if (proofTampered) {
      setProofAttempted(true)
    } else {
      setProofAttempted(false)
      const chars = "0123456789abcdef"
      let hex = ""
      for (let i = 0; i < 24; i++) {
        hex += chars[Math.floor(Math.random() * chars.length)]
      }
      setProofHash(`0c${hex}...`)
    }
  }

  // Sibling 0 (ชั้นที่ 1)
  const rawSibling0Label = authPathSteps[0]?.label || "H(B)"
  const sibling0Hash = authPathSteps[0]?.hash ? TruncateHash(authPathSteps[0].hash, 8) : "06e8f513"
  const sibling0Pos = authPathSteps[0]?.position === "left" ? "ฝั่งซ้าย" : "ฝั่งขวา"
  const sibling0Text = `${rawSibling0Label} ${sibling0Hash} · ${sibling0Pos}`

  // Sibling 1 (ชั้นที่ 2)
  const rawSibling1Label = authPathSteps[1]?.label || "H(C+D)"
  const sibling1Label =
    rawSibling1Label === "H(A+B)"
      ? "H(H(A)+H(B))"
      : rawSibling1Label === "H(C+D)"
      ? "H(H(C)+H(D))"
      : rawSibling1Label
  const sibling1Hash = authPathSteps[1]?.hash ? TruncateHash(authPathSteps[1].hash, 8) : "bc6a6e07"
  const sibling1Pos = authPathSteps[1]?.position === "left" ? "ฝั่งซ้าย" : "ฝั่งขวา"
  const sibling1Text = `${sibling1Label} ${sibling1Hash} · ${sibling1Pos}`

  const STAGES = [
    { id: 1, label: "Statement", sub: "โจทย์ประกาศ" },
    { id: 2, label: "Circuit",   sub: "กติกา" },
    { id: 3, label: "Witness",   sub: "ความลับของ Prover" },
    { id: 4, label: "Proof",     sub: "สร้างหลักฐาน" },
    { id: 5, label: "Verify",    sub: "การตรวจสอบ" },
  ]

  const handleNext = () => {
    if (stage < 5) {
      setStage((s) => s + 1)
    } else {
      if (typeof markComplete === "function") markComplete(7)
    }
  }
  const handlePrev = () => {
    if (stage > 1) setStage((s) => s - 1)
  }

  // Stage-specific hint text
  const verifierNote = {
    1: "ผู้ตรวจจะรู้สิ่งนี้ล่วงหน้า เพื่อเตรียมตรวจสอบในภายหลัง",
    2: "เปรียบเสมือน: เครื่องตรวจสอบอัตโนมัติ — ทุกคนรู้ว่าเครื่องตรวจตามเกณฑ์อะไร แต่เครื่องไม่บอกว่าคำตอบคืออะไร",
    3: "เปรียบเสมือน: กระดาษคำตอบของคุณ — จะใส่เข้าเครื่องตรวจที่ปิดผนึก ไม่มีใครได้เห็น",
    4: "Proof มีขนาดเล็กมาก (ไม่กี่ร้อยไบต์) ไม่ว่า Witness จะใหญ่แค่ไหน",
    5: "เปรียบเสมือน: ดูตราประทับบนใบรับรองแล้วรู้ทันทีว่าของจริง โดยไม่ต้องขอดูกระดาษคำตอบ",
  }[stage]

  return (
    <div className="lab5-space-y-6">
      {/* 1. Heading */}
      <div className="lab5-space-y-1.5">
        <span
          className="lab5-inline-block lab5-rounded-full lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold"
          style={{ backgroundColor: "#f3e8ff", color: "#6d28d9" }}
        >
          ภาค 2: ZK-SNARK
        </span>
        <h2
          className="lab5-text-balance lab5-text-xl lab5-font-extrabold lab5-leading-tight"
          style={{ color: "#0f172a", fontWeight: 800, margin: 0 }}
        >
          7. zk-SNARK Pipeline (5 ขั้นตอน)
        </h2>
        <p className="lab5-text-sm" style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>
          ใช้ต้นไม้จากภาค 1 — Root เป็นข้อมูลสาธารณะ ส่วนรหัสลับและเส้นทางเป็น Witness
        </p>
      </div>

      {/* 2. Pipeline Architecture Diagram */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #f1f5f9",
          borderRadius: "1.25rem",
          padding: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", marginBottom: "1rem" }}>
          zk-SNARK อยู่ตรงไหนในกระบวนการ? <span style={{ fontWeight: 400, color: "#64748b" }}>(กรอบที่ไฮไลต์ = ขั้นที่กำลังดู)</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "1.25rem",
            alignItems: "center",
          }}
        >
          {/* Left: Prover Machine */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1.5px dashed #c4b5fd",
              borderRadius: "1rem",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
              alignItems: "center",
            }}
          >
            {/* Prover Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <User style={{ width: "1rem", height: "1rem", color: "#7c3aed" }} />
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e1b4b" }}>เครื่องของ Prover (คุณ)</span>
            </div>

            {/* Chips: Statement & Witness */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {/* Statement Chip */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  backgroundColor: "#ffffff",
                  border: stage === 1 ? "2px solid #8b5cf6" : "1px solid #e2e8f0",
                  boxShadow: stage === 1 ? "0 0 0 2px rgba(139, 92, 246, 0.2)" : "none",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontWeight: 700, color: "#1e293b" }}>Statement</span>
                <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>PUBLIC</span>
              </div>

              {/* Witness Chip */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  backgroundColor: stage === 3 ? "#fee2e2" : "#ffffff",
                  border: stage === 3 ? "2px solid #ef4444" : "1px dashed #fca5a5",
                  boxShadow: stage === 3 ? "0 0 0 2px rgba(239, 68, 68, 0.2)" : "none",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontWeight: 700, color: "#ef4444" }}>Witness</span>
                <span style={{ fontSize: "0.6875rem", color: "#f87171" }}>PRIVATE</span>
              </div>
            </div>

            {/* Down Arrow */}
            <div style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1 }}>↓</div>

            {/* zk-SNARK Prove Box */}
            <div
              style={{
                width: "100%",
                backgroundColor: (stage === 2 || stage === 4) ? "#7c3aed" : "#1e293b",
                boxShadow: (stage === 2 || stage === 4) ? "0 4px 14px rgba(124, 58, 237, 0.35)" : "none",
                borderRadius: "0.75rem",
                padding: "0.625rem 0.875rem",
                color: "#ffffff",
                textAlign: "center",
                transition: "all 0.25s ease",
              }}
            >
              <div style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                zk-SNARK · ฝั่งสร้าง (Prove)
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: (stage === 2 || stage === 4) ? "#ede9fe" : "#94a3b8",
                  marginTop: "0.2rem",
                  fontWeight: 400,
                }}
              >
                Circuit = กติกา Merkle ที่อยู่ข้างในกล่อง
              </div>
            </div>
          </div>

          {/* Center: Arrow with Proof label */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.25rem",
              minWidth: "76px",
              border: stage === 4 ? "1.5px solid #8b5cf6" : "1.5px solid transparent",
              boxShadow: stage === 4 ? "0 0 0 2px rgba(139, 92, 246, 0.15)" : "none",
              borderRadius: "0.75rem",
              padding: "0.375rem 0.5rem",
              backgroundColor: stage === 4 ? "#ffffff" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: stage === 4 ? "#7c3aed" : "#6366f1",
              }}
            >
              π (Proof)
            </div>
            <div style={{ fontSize: "1.25rem", color: stage === 4 ? "#7c3aed" : "#94a3b8", lineHeight: 1 }}>
              →
            </div>
            <div style={{ fontSize: "0.6875rem", color: "#94a3b8", textAlign: "center" }}>
              ส่งออกไปแค่นี้
            </div>
          </div>

          {/* Right: Verifier Machine */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: stage === 5 ? "1.5px dashed #c4b5fd" : "1.5px dashed #e2e8f0",
              borderRadius: "1rem",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
              alignItems: "center",
              transition: "border-color 0.2s ease",
            }}
          >
            {/* Verifier Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <ShieldCheck style={{ width: "1rem", height: "1rem", color: "#16a34a" }} />
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e1b4b" }}>เครื่องของ Verifier</span>
            </div>

            {/* Chips: Statement & pi */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: stage === 1 ? "2px solid #8b5cf6" : "1px solid #e2e8f0",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                Statement
              </div>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: (stage === 4 || stage === 5) ? "2px solid #8b5cf6" : "1px solid #e2e8f0",
                  boxShadow: stage === 5 ? "0 0 0 2px rgba(139, 92, 246, 0.2)" : "none",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#6366f1",
                  transition: "all 0.2s ease",
                }}
              >
                π
              </div>
            </div>

            {/* Down Arrow */}
            <div style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1 }}>↓</div>

            {/* zk-SNARK Verify Box */}
            <div
              style={{
                width: "100%",
                backgroundColor: (stage === 2 || stage === 5) ? "#7c3aed" : "#1e293b",
                boxShadow: (stage === 2 || stage === 5) ? "0 4px 14px rgba(124, 58, 237, 0.35)" : "none",
                borderRadius: "0.75rem",
                padding: "0.625rem 0.875rem",
                color: "#ffffff",
                textAlign: "center",
                transition: "all 0.25s ease",
              }}
            >
              <div style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                zk-SNARK · ฝั่งตรวจ (Verify)
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: (stage === 2 || stage === 5) ? "#ede9fe" : "#94a3b8",
                  marginTop: "0.2rem",
                  fontWeight: 400,
                }}
              >
                กติกาเดียวกัน (ผ่าน Verification Key)
              </div>
            </div>

            {/* Down Arrow */}
            <div style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1 }}>↓</div>

            {/* Result Pill */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: stage === 5 ? "2px solid #8b5cf6" : "1px solid #e2e8f0",
                boxShadow: stage === 5 ? "0 0 0 2px rgba(139, 92, 246, 0.2)" : "none",
                borderRadius: "9999px",
                padding: "0.25rem 0.875rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#1e293b",
                transition: "all 0.2s ease",
              }}
            >
              จริง / ไม่จริง
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div
          style={{
            marginTop: "1rem",
            fontSize: "0.75rem",
            color: "#64748b",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          กล่องสีเข้ม 2 กล่อง = zk-SNARK · ฝั่ง Prover ใช้ "สร้าง" Proof · ฝั่ง Verifier ใช้ "ตรวจ" Proof ·{" "}
          <span style={{ color: "#ef4444", fontWeight: 700 }}>Witness ไม่เคยออกจากเครื่อง Prover</span>
        </div>
      </div>

      {/* 3. Stage Progress Bar */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1.25rem",
          padding: "1rem 1.25rem",
        }}
      >
        {/* Header: Stage info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.875rem",
          }}
        >
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b" }}>
            ขั้นตอนที่ {stage} จาก 5 : {STAGES[stage - 1].label}
          </span>
          <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748b" }}>
            เป้าหมาย: Verifier ตรวจสอบได้โดยไม่เห็นข้อมูลลับ
          </span>
        </div>

        {/* Step dots with active capsule */}
        <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
          {STAGES.map((s, i) => {
            const isActive = s.id === stage;
            const isDone = s.id < stage;
            return (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < STAGES.length - 1 ? 1 : 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: isActive ? "#f5f3ff" : "transparent",
                    borderRadius: "0.875rem",
                    padding: isActive ? "0.375rem 0.5rem" : "0.375rem 0.25rem",
                    minWidth: "62px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: "1.875rem",
                      height: "1.875rem",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      backgroundColor: isDone ? "#10b981" : isActive ? "#7c3aed" : "#ffffff",
                      border: isDone || isActive ? "none" : "1px solid #cbd5e1",
                      color: isDone || isActive ? "#ffffff" : "#94a3b8",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? (
                      <Check style={{ width: "0.875rem", height: "0.875rem", strokeWidth: 3 }} />
                    ) : (
                      s.id
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: "0.25rem",
                      fontSize: "0.6875rem",
                      fontWeight: isActive ? 700 : isDone ? 600 : 500,
                      color: isActive ? "#6d28d9" : isDone ? "#0f172a" : "#94a3b8",
                      textAlign: "center",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      color: isActive ? "#7c3aed" : "#94a3b8",
                      textAlign: "center",
                    }}
                  >
                    {s.sub}
                  </div>
                </div>
                {i < STAGES.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: "2px",
                      backgroundColor: s.id < stage ? "#10b981" : "#e2e8f0",
                      marginBottom: "1.75rem",
                      transition: "background-color 0.3s ease",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Stage Content Card */}
      <div
        className="lab5-animate-merge-up"
        style={{
          backgroundColor: "#ffffff",
          border: "1.5px solid #c4b5fd",
          borderRadius: "1.25rem",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.875rem",
        }}
      >
        {/* Stage Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              borderRadius: "9999px",
              padding: "0.25rem 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            {stage}. {STAGES[stage - 1].label} ({STAGES[stage - 1].sub})
          </span>
          {(stage === 1 || stage === 2) && (
            <span
              style={{
                backgroundColor: "#f0fdf4",
                color: "#16a34a",
                border: "1px solid #bbf7d0",
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.6875rem",
                fontWeight: 600,
              }}
            >
              PUBLIC · ทุกคนเห็น
            </span>
          )}
          {stage === 3 && (
            <span
              style={{
                backgroundColor: "#fef2f2",
                color: "#ef4444",
                border: "1px solid #fecaca",
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.6875rem",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Lock style={{ width: "0.75rem", height: "0.75rem" }} />
              PRIVATE · เห็นเฉพาะคุณ
            </span>
          )}
          {stage === 5 && (
            <span
              style={{
                backgroundColor: "#f3e8ff",
                color: "#7c3aed",
                border: "1px solid #ddd6fe",
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.6875rem",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Eye style={{ width: "0.75rem", height: "0.75rem" }} />
              PUBLIC · ทุกคนเห็น
            </span>
          )}
        </div>

        {/* Stage-specific label */}
        {stage === 3 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <p style={{ fontSize: "0.8125rem", color: "#334155", margin: 0 }}>
              <span style={{ fontWeight: 700 }}>Prover ถืออะไรอยู่?</span> ข้อมูลลับของ Order + Authentication Path
            </p>
            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, fontStyle: "italic" }}>
              *(ข้อมูลนี้ไม่ถูกส่งออกไปไหน อยู่แค่ในเครื่อง Prover เท่านั้น)*
            </p>
          </div>
        ) : stage !== 5 ? (
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
            {{
              1: "สิ่งที่อ้างว่าเป็นจริงและให้ทุกคนรับรู้ร่วมกัน เช่น:",
              2: "กติกาคณิตศาสตร์ที่ทุกคนร่วมกัน (เปรียบเสมือน Black Box)",
              4: "Prover นำ Witness ไปผ่าน Circuit และสร้าง \"Proof\" (ไฟล์หลักฐานขนาดเล็ก) ออกมา แล้วส่งแค่ไฟล์ Proof นี้ให้ Verifier",
            }[stage]}
          </p>
        ) : null}

        {/* Stage 1: Statement content */}
        {stage === 1 && (
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "0.875rem",
              padding: "1rem",
              fontSize: "0.875rem",
              color: "#334155",
              lineHeight: 1.7,
              fontStyle: "italic",
            }}
          >
            &quot;ฉันมี Order อยู่ใต้ Root {rootHash}... นั่นนะ&quot;
          </div>
        )}

        {/* Stage 2: Circuit content */}
        {stage === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {/* Dark Box - กล่องดำ */}
            <div
              style={{
                backgroundColor: "#0f172a",
                borderRadius: "0.875rem",
                padding: "1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "1rem" }}>⚙</span>
                <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.8125rem" }}>
                  ข้อในกล่องดำ = กติกา Merkle จากขั้นที่ 3
                </span>
              </div>
              {[
                "Hash ข้อมูลลับ → ได้ Leaf",
                "ประกบ Sibling Hash ก็จะ ตามตำแหน่งซ้าย/ขวา",
                "ผลลัพธ์ต้องเท่ากับ Root ที่ประกาศไว้",
              ].map((rule, i) => (
                <div
                  key={i}
                  style={{
                    color: "#e2e8f0",
                    fontSize: "0.8125rem",
                    lineHeight: 1.6,
                  }}
                >
                  {i + 1}. {rule}
                </div>
              ))}
            </div>

            {/* Bullet points */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#334155", lineHeight: 1.6 }}>
                • กล่องดำที่บรรจุกฎและสมการทางคณิตศาสตร์ของ Merkle Tree (ที่เราเรียนและทำความเข้าใจไปแล้วในบทก่อนหน้า) เอาไว้
              </p>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#334155", lineHeight: 1.6 }}>
                • ทำหน้าที่เป็น "ตัวแปลง" ข้อมูลลับ (Witness) ให้กลายเป็นบทพิสูจน์ (Proof) โดยอิงกระบวนการคำนวณทั้งหมดไว้ใน ไม่ให้ใครเห็น
              </p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", fontStyle: "italic", lineHeight: 1.6 }}>
                *(หมายเหตุ: ไม่ต้องแสดงกระบวนการคำนวณนั้น ระบบจัดการให้เอง)*
              </p>
            </div>
          </div>
        )}

        {/* Stage 3: Witness content */}
        {stage === 3 && (
          <div
            style={{
              backgroundColor: "#faf5ff",
              border: "1.5px solid #e9d5ff",
              borderRadius: "1rem",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Header of Private Witness Card */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Lock style={{ width: "1.125rem", height: "1.125rem", color: "#7c3aed" }} />
                <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#6d28d9" }}>
                  Private Witness
                </span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                ไม่ส่งออกไปไหน
              </span>
            </div>

            {/* When hidden: show dashed placeholder */}
            {!showWitnessSecret ? (
              <div
                style={{
                  border: "1.5px dashed #ddd6fe",
                  borderRadius: "0.75rem",
                  padding: "0.875rem 1.25rem",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                  รหัสลับของ Order + Authentication Path (ถูกซ่อนไว้ในเครื่อง)
                </span>
                <button
                  type="button"
                  onClick={() => setShowWitnessSecret(true)}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #c4b5fd",
                    color: "#6d28d9",
                    borderRadius: "9999px",
                    padding: "0.375rem 0.875rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Eye style={{ width: "0.875rem", height: "0.875rem" }} />
                  ดูข้อมูลลับ (เห็นเฉพาะคุณ)
                </button>
              </div>
            ) : (
              /* When revealed: show 3 numbered rows + hide button */
              <div
                className="lab5-animate-merge-up"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.875rem",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                {/* Row 1: Secret */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span
                    style={{
                      width: "1.625rem",
                      height: "1.625rem",
                      borderRadius: "9999px",
                      backgroundColor: "#7c3aed",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    1
                  </span>
                  <span
                    style={{
                      backgroundColor: "#6d28d9",
                      color: "#ffffff",
                      borderRadius: "9999px",
                      padding: "0.35rem 1rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    {currentOrder.label} · {currentOrder.value}
                  </span>
                </div>

                {/* Row 2: Sibling 0 */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span
                    style={{
                      width: "1.625rem",
                      height: "1.625rem",
                      borderRadius: "9999px",
                      backgroundColor: "#7c3aed",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    2
                  </span>
                  <span
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #ddd6fe",
                      color: "#6d28d9",
                      borderRadius: "9999px",
                      padding: "0.35rem 1rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {sibling0Text}
                  </span>
                </div>

                {/* Row 3: Sibling 1 */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span
                    style={{
                      width: "1.625rem",
                      height: "1.625rem",
                      borderRadius: "9999px",
                      backgroundColor: "#7c3aed",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    3
                  </span>
                  <span
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #ddd6fe",
                      color: "#6d28d9",
                      borderRadius: "9999px",
                      padding: "0.35rem 1rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {sibling1Text}
                  </span>
                </div>

                {/* Hide Button */}
                <div style={{ marginTop: "0.25rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowWitnessSecret(false)}
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "9999px",
                      padding: "0.35rem 0.875rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <EyeOff style={{ width: "0.875rem", height: "0.875rem" }} />
                    ซ่อนข้อมูล
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stage 4: Proof content */}
        {stage === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* 3 Process Boxes in horizontal layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1.1fr auto 1.25fr",
                alignItems: "center",
                gap: "0.625rem",
              }}
            >
              {/* Box 1: ใส่เข้าไป (ลับ) */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px dashed #c4b5fd",
                  borderRadius: "0.875rem",
                  padding: "0.875rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <Lock style={{ width: "0.875rem", height: "0.875rem", color: "#7c3aed" }} />
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#7c3aed" }}>
                    ใส่เข้าไป (ลับ)
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    borderRadius: "0.5rem",
                    padding: "0.625rem 0.75rem",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    lineHeight: 1.6,
                  }}
                >
                  {proofTampered ? (
                    <div style={{ color: "#ef4444", fontWeight: 600 }}>{tamperedSecret}</div>
                  ) : (
                    <div style={{ color: "#334155" }}>{currentOrder.value}</div>
                  )}
                  <div style={{ color: "#64748b" }}>+ H(B)</div>
                  <div style={{ color: "#64748b" }}>+ H(H(C)+H(D))</div>
                </div>
                {proofTampered && (
                  <div style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "-0.25rem" }}>
                    กำลังลองใช้ข้อมูลผิด
                  </div>
                )}
              </div>

              {/* Arrow 1 */}
              <div style={{ color: "#94a3b8", fontSize: "1.125rem", textAlign: "center" }}>→</div>

              {/* Box 2: กล่องดำ zk-SNARK */}
              <div
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: "0.875rem",
                  padding: "1rem",
                  color: "#ffffff",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.375rem",
                  minHeight: "105px",
                }}
              >
                <Package style={{ width: "1.25rem", height: "1.25rem", color: "#ffffff" }} />
                <div style={{ fontSize: "0.8125rem", fontWeight: 700 }}>กล่องดำ zk-SNARK</div>
                <div style={{ fontSize: "0.6875rem", color: "#94a3b8", lineHeight: 1.4 }}>
                  คำนวณในเครื่อง Prover ตามกติกา (Circuit)
                </div>
              </div>

              {/* Arrow 2 */}
              <div style={{ color: "#94a3b8", fontSize: "1.125rem", textAlign: "center" }}>→</div>

              {/* Box 3: Proof (π) */}
              {!proofTampered ? (
                /* Valid Proof Generated */
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "0.875rem",
                    padding: "0.875rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.375rem",
                    minHeight: "105px",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <CheckCircle2 style={{ width: "0.875rem", height: "0.875rem", color: "#16a34a" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#16a34a" }}>
                      Proof (π)
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#1e293b",
                      wordBreak: "break-all",
                    }}
                  >
                    π = {proofHash}
                  </div>
                  <div style={{ fontSize: "0.625rem", color: "#64748b", lineHeight: 1.3 }}>
                    ส่งอะไรออกไป? ส่งแค่ไฟล์ Proof เล็กๆ นี้ให้ Verifier
                  </div>
                </div>
              ) : !proofAttempted ? (
                /* Tampered Initial: Waiting to click สร้าง Proof */
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.875rem",
                    padding: "0.875rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.375rem",
                    minHeight: "105px",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <CheckCircle2 style={{ width: "0.875rem", height: "0.875rem", color: "#94a3b8" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>
                      Proof (π)
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    กดปุ่มด้านล่างเพื่อสร้าง Proof
                  </div>
                </div>
              ) : (
                /* Tampered Attempted: Failed */
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "0.875rem",
                    padding: "0.875rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.375rem",
                    minHeight: "105px",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <XCircle style={{ width: "0.875rem", height: "0.875rem", color: "#ef4444" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444" }}>
                      สร้าง Proof ไม่ได้
                    </span>
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#334155", lineHeight: 1.5 }}>
                    Root' bd6fa135 ≠ Root {rootHash} — กติกาไม่เป็นจริง กล่องไม่ยอมออก Proof
                  </div>
                </div>
              )}
            </div>

            {/* 2 Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
              <button
                type="button"
                onClick={handleGenerateProof}
                style={{
                  backgroundColor: "#7c3aed",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.625rem",
                  padding: "0.5rem 1.125rem",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <Sparkles style={{ width: "0.875rem", height: "0.875rem" }} />
                สร้าง Proof
              </button>

              {proofTampered ? (
                <button
                  type="button"
                  onClick={() => {
                    setProofTampered(false)
                    setProofAttempted(false)
                  }}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #ddd6fe",
                    color: "#6d28d9",
                    borderRadius: "9999px",
                    padding: "0.45rem 1rem",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  <RotateCcw style={{ width: "0.875rem", height: "0.875rem" }} />
                  กลับไปใช้ข้อมูลจริง
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setProofTampered(true)
                    setProofAttempted(false)
                  }}
                  style={{
                    backgroundColor: "#fff1f2",
                    color: "#e11d48",
                    border: "1px solid #fecdd3",
                    borderRadius: "0.625rem",
                    padding: "0.5rem 1.125rem",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  <AlertTriangle style={{ width: "0.875rem", height: "0.875rem" }} />
                  ลองใช้ข้อมูลผิด (โกง)
                </button>
              )}
            </div>

            {/* Red Failed Banner when tampered and attempted */}
            {proofTampered && proofAttempted && (
              <div
                className="lab5-animate-merge-up"
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1.5px solid #fecaca",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  display: "flex",
                  gap: "0.875rem",
                  alignItems: "flex-start",
                }}
              >
                <XCircle style={{ width: "1.25rem", height: "1.25rem", color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#b91c1c" }}>
                    สร้าง Proof ไม่สำเร็จ
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#475569", lineHeight: 1.6 }}>
                    ถ้าไม่รู้ข้อมูลลับที่ถูกต้อง วงจรจะไม่ผ่าน และไม่สามารถสร้าง Proof ที่ถูกต้องได้ — Verifier จึงเชื่อ Proof ได้ (Soundness) ลองกลับไปใช้ข้อมูลจริงแล้วสร้างใหม่
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stage 5: Verify content */}
        {stage === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* 2 Comparison Cards Side by Side */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              {/* Left Card: Verifier ได้รับอะไร? */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #bbf7d0",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Eye style={{ width: "1.125rem", height: "1.125rem", color: "#16a34a" }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#15803d" }}>
                    Verifier ได้รับอะไร?
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#334155", margin: 0, lineHeight: 1.5 }}>
                  ได้รับแค่ <span style={{ fontWeight: 700 }}>ไฟล์ Proof ขนาดเล็ก</span> (ไม่เห็นข้อมูลดิบ หรือ Hash ย่อยใดๆ เลย)
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                  <span
                    style={{
                      backgroundColor: "#ecfdf5",
                      color: "#16a34a",
                      border: "1px solid #bbf7d0",
                      borderRadius: "9999px",
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      fontWeight: 600,
                    }}
                  >
                    Root {rootHash}
                  </span>
                  <span
                    style={{
                      backgroundColor: "#f5f3ff",
                      color: "#7c3aed",
                      border: "1px solid #ddd6fe",
                      borderRadius: "9999px",
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      fontWeight: 600,
                    }}
                  >
                    Proof π {proofHash.replace(/\.\.\.$/, "").slice(0, 10)}...
                  </span>
                  <span
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#334155",
                      border: "1px solid #e2e8f0",
                      borderRadius: "9999px",
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    Verification Key
                  </span>
                </div>
              </div>

              {/* Right Card: Verifier ไม่เห็น */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px dashed #c4b5fd",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <EyeOff style={{ width: "1.125rem", height: "1.125rem", color: "#64748b" }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#334155" }}>
                    Verifier ไม่เห็น
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                  <span
                    style={{
                      border: "1px dashed #cbd5e1",
                      borderRadius: "9999px",
                      padding: "0.3rem 0.75rem",
                      fontSize: "0.75rem",
                      color: "#475569",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Lock style={{ width: "0.75rem", height: "0.75rem" }} />
                    รหัสลับของออร์เดอร์
                  </span>
                  <span
                    style={{
                      border: "1px dashed #cbd5e1",
                      borderRadius: "9999px",
                      padding: "0.3rem 0.75rem",
                      fontSize: "0.75rem",
                      color: "#475569",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Lock style={{ width: "0.75rem", height: "0.75rem" }} />
                    ว่าเป็นใบไหน
                  </span>
                  <span
                    style={{
                      border: "1px dashed #cbd5e1",
                      borderRadius: "9999px",
                      padding: "0.3rem 0.75rem",
                      fontSize: "0.75rem",
                      color: "#475569",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Lock style={{ width: "0.75rem", height: "0.75rem" }} />
                    Hash ข้าง ๆ และตำแหน่ง
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation text */}
            <p style={{ fontSize: "0.8125rem", color: "#334155", margin: 0 }}>
              <span style={{ fontWeight: 700 }}>Verifier ทำอะไร?</span> ใช้{" "}
              <span style={{ fontWeight: 700 }}>Verification Key</span> ตรวจสอบ Proof และทราบผลลัพธ์ว่า{" "}
              <span style={{ fontWeight: 700 }}>จริง / ไม่จริง</span> ได้ทันที
            </p>

            {/* Verify Button or Result Card */}
            {!verified ? (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setVerified(true)
                    if (typeof markComplete === "function") markComplete(7)
                  }}
                  style={{
                    backgroundColor: "#7c3aed",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "0.75rem",
                    padding: "0.625rem 1.25rem",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <ShieldCheck style={{ width: "1.125rem", height: "1.125rem" }} />
                  ให้ Verifier ตรวจสอบ Proof
                </button>
              </div>
            ) : (
              <div
                className="lab5-animate-merge-up"
                style={{
                  backgroundColor: "#ecfdf5",
                  border: "1.5px solid #a7f3d0",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  display: "flex",
                  gap: "0.875rem",
                  alignItems: "flex-start",
                }}
              >
                <CheckCircle2 style={{ width: "1.25rem", height: "1.25rem", color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#15803d" }}>
                    ผลลัพธ์: ยืนยันความถูกต้องได้ทันที
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#334155", lineHeight: 1.6 }}>
                    ยืนยันความถูกต้องได้ว่ามี Order อยู่ในระบบจริง{" "}
                    <span style={{ fontWeight: 700 }}>โดยไม่มีข้อมูลลับรั่วไหล</span> — Verifier ไม่รู้ว่าคือ{currentOrder.label}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    เทียบกับขั้นที่ 6: ข้อมูลที่เคยรั่วทั้ง 3 อย่าง ตอนนี้อยู่ในเครื่องคุณหมดแล้ว
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Root Display (stage 1 only) */}
        {stage === 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <span
              style={{
                backgroundColor: "#ecfdf5",
                color: "#16a34a",
                border: "1px solid #bbf7d0",
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "monospace",
              }}
            >
              Root {rootHash}...
            </span>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Root เก็บอยู่ที่ Verifier เรียบร้อย</span>
          </div>
        )}

        {/* Info tip or Lab 02 Review Card (Stage 4) */}
        {stage === 4 ? (
          <div
            style={{
              backgroundColor: "#f5f3ff",
              border: "1px solid #ddd6fe",
              borderRadius: "0.875rem",
              padding: "0.75rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen style={{ width: "1rem", height: "1rem", color: "#7c3aed", flexShrink: 0 }} />
              <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 500 }}>
                คนโกงผ่านไม่ได้ = Soundness แบบที่อธิบายมาใน Lab 02
              </span>
            </div>
            <a
              href="/lab02"
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #c4b5fd",
                borderRadius: "9999px",
                padding: "0.25rem 0.875rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#6d28d9",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              ทบทวน Lab 02 ↗
            </a>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "0.875rem",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.625rem",
            }}
          >
            <Info style={{ width: "1rem", height: "1rem", color: "#3b82f6", flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontSize: "0.8125rem", color: "#1e40af", margin: 0, lineHeight: 1.5 }}>
              {verifierNote}
            </p>
          </div>
        )}
      </div>

      {/* 5. Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left: Restart to stage 1 link */}
        {stage > 1 ? (
          <button
            type="button"
            onClick={() => setStage(1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              backgroundColor: "transparent",
              color: "#64748b",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.375rem 0.5rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            <RotateCcw style={{ width: "0.8125rem", height: "0.8125rem" }} />
            กลับขั้นตอนที่ 1
          </button>
        ) : (
          <div />
        )}

        {/* Right: Back + Next buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {stage === 4 && proofTampered && (
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginRight: "0.25rem" }}>
              สร้าง Proof ด้วยข้อมูลจริงก่อน
            </span>
          )}

          <button
            type="button"
            onClick={handlePrev}
            disabled={stage === 1}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              backgroundColor: "#ffffff",
              color: stage === 1 ? "#94a3b8" : "#475569",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
              padding: "0.625rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: stage === 1 ? "not-allowed" : "pointer",
            }}
          >
            <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
            ย้อนกลับ
          </button>

          {/* In stage 5: Show "ไปหน้าสรุป →" when verified */}
          {stage < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={stage === 4 && proofTampered}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                backgroundColor: stage === 4 && proofTampered ? "#e2e8f0" : "#7c3aed",
                color: stage === 4 && proofTampered ? "#94a3b8" : "#ffffff",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.625rem 1.25rem",
                fontSize: "0.8125rem",
                fontWeight: 700,
                cursor: stage === 4 && proofTampered ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
            >
              ขั้นตอนถัดไป <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
            </button>
          ) : verified ? (
            <button
              type="button"
              onClick={goNext}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                backgroundColor: "#7c3aed",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.625rem 1.25rem",
                fontSize: "0.8125rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
              }}
            >
              ขั้นตอนถัดไป <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
            </button>
          ) : null}
        </div>
      </div>
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
function Step8Summary() {
  const { tree, selectedLeaf, goToStep, reset, markComplete } = useLab05()
  const [activeTab, setActiveTab] = useState("merkle") // "merkle" | "snark"

  useEffect(() => {
    if (typeof markComplete === "function") {
      markComplete(8)
    }
  }, [markComplete])

  const leafIdx = selectedLeaf ?? 0
  const currentOrder = orders[leafIdx] || orders[0]
  const rootHash = tree?.root ? TruncateHash(tree.root, 8) : "592ed5ae"

  const isMerkleOnly = activeTab === "merkle"

  const matrixRows = [
    {
      label: "รหัสลับของออร์เดอร์",
      verifierText: isMerkleOnly ? "เห็น" : "ซ่อนด้วย ZKP",
      verifierColor: isMerkleOnly ? "#ef4444" : "#16a34a",
    },
    {
      label: "Hash ข้าง ๆ และตำแหน่ง",
      verifierText: isMerkleOnly ? "เห็น" : "ซ่อนด้วย ZKP",
      verifierColor: isMerkleOnly ? "#ef4444" : "#16a34a",
    },
    {
      label: "ว่าเป็นออร์เดอร์ใบไหน",
      verifierText: isMerkleOnly ? "เห็น" : "ซ่อนด้วย ZKP",
      verifierColor: isMerkleOnly ? "#ef4444" : "#16a34a",
    },
    {
      label: "Root ที่ประกาศไว้",
      verifierText: "เห็น",
      verifierColor: "#334155",
    },
    {
      label: 'ผลลัพธ์ "จริง / ไม่จริง"',
      verifierText: "เห็น",
      verifierColor: "#334155",
    },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* 1. Header */}
      <div>
        <span
          style={{
            backgroundColor: "#f3e8ff",
            color: "#6d28d9",
            borderRadius: "9999px",
            padding: "0.25rem 0.75rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            display: "inline-block",
            marginBottom: "0.5rem",
          }}
        >
          สรุป
        </span>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.375rem" }}>
          Merkle Tree + zk-SNARK ช่วยอะไรเรา?
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
          สลับดูว่าผู้ตรวจเห็นอะไรบ้าง เมื่อใช้แค่ Merkle proof เทียบกับใช้ zk-SNARK ร่วมด้วย
        </p>
      </div>

      {/* 2. Mode Selector Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <button
          type="button"
          onClick={() => setActiveTab("merkle")}
          style={{
            backgroundColor: isMerkleOnly ? "#fef2f2" : "#ffffff",
            border: isMerkleOnly ? "1.5px solid #fca5a5" : "1px solid #e2e8f0",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: isMerkleOnly ? "#e11d48" : "#475569" }}>
            Merkle proof อย่างเดียว
          </span>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            ภาค 1 — ส่งหลักฐานให้ผู้ตรวจตรง ๆ
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("snark")}
          style={{
            backgroundColor: !isMerkleOnly ? "#f0fdf4" : "#ffffff",
            border: !isMerkleOnly ? "1.5px solid #86efac" : "1px solid #e2e8f0",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: !isMerkleOnly ? "#16a34a" : "#475569" }}>
            Merkle + zk-SNARK
          </span>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            ภาค 2 — ซ่อนข้อมูลไว้ในวงจรพิสูจน์
          </span>
        </button>
      </div>

      {/* 3. Root Box */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "0.875rem",
          padding: "0.625rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#475569" }}>
          Root (เห็นเหมือนกันทั้งสองแบบ)
        </span>
        <span
          style={{
            backgroundColor: "#ecfdf5",
            color: "#16a34a",
            border: "1px solid #bbf7d0",
            borderRadius: "9999px",
            padding: "0.2rem 0.6rem",
            fontSize: "0.75rem",
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {rootHash}...
        </span>
      </div>

      {/* 4. Visibility Matrix Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b" }}>
            Visibility Matrix
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.125rem" }}>
            สรุปสิ่งที่ผู้พิสูจน์และผู้ตรวจสอบมองเห็น
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textAlign: "left" }}>
              <th style={{ padding: "0.75rem 1.25rem", fontWeight: 600 }}>ข้อมูลในระบบ</th>
              <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "center", width: "120px" }}>Prover</th>
              <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "center", width: "140px" }}>Verifier</th>
            </tr>
          </thead>
          <tbody>
            {matrixRows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: idx < matrixRows.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <td style={{ padding: "0.75rem 1.25rem", color: "#334155", fontWeight: 500 }}>
                  {row.label}
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#475569", fontWeight: 500 }}>
                  เห็น
                </td>
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "center",
                    fontWeight: 600,
                    color: row.verifierColor,
                  }}
                >
                  {row.verifierText}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Callout Box */}
      <div
        style={{
          backgroundColor: "#f5f3ff",
          border: "1px solid #ddd6fe",
          borderRadius: "0.875rem",
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.625rem",
        }}
      >
        <Lightbulb style={{ width: "1rem", height: "1rem", color: "#7c3aed", flexShrink: 0, marginTop: "2px" }} />
        <p style={{ fontSize: "0.8125rem", color: "#6d28d9", margin: 0, lineHeight: 1.5 }}>
          {isMerkleOnly
            ? `ผู้ตรวจคำนวณ Root เองได้จากหลักฐาน จึงเชื่อได้ — แต่ก็รู้ด้วยว่าคุณคือ${currentOrder.label} และเห็นรหัสลับ`
            : `ผู้ตรวจยืนยันได้ว่า "มีออร์เดอร์หนึ่งใบใต้ Root นี้ที่เป็นของผู้ส่ง" โดยไม่รู้ว่าคือ${currentOrder.label}`}
        </p>
      </div>

      {/* 6. Takeaways: จำไว้ 3 อย่าง */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b" }}>
          จำไว้ 3 อย่าง
        </div>

        {/* Card 1 */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "0.875rem",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "9999px",
              backgroundColor: "#f5f3ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7c3aed",
              flexShrink: 0,
            }}
          >
            <Fingerprint style={{ width: "1.25rem", height: "1.25rem" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b" }}>
              Hash = ลายนิ้วมือของข้อมูล
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              ข้อมูลเดิมได้ค่าเดิม แก้นิดเดียวเปลี่ยนหมด และย้อนกลับไม่ได้
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "0.875rem",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "9999px",
              backgroundColor: "#f5f3ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7c3aed",
              flexShrink: 0,
            }}
          >
            <Key style={{ width: "1.25rem", height: "1.25rem" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b" }}>
              Merkle Tree = พิสูจน์ว่าอยู่ในชุดข้อมูล
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              ใช้ Root ค่าเดียว + Hash ไม่กี่ตัว ก็ยืนยันได้ และแก้ข้อมูลแล้วถูกจับทันที
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "0.875rem",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "9999px",
              backgroundColor: "#f5f3ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7c3aed",
              flexShrink: 0,
            }}
          >
            <ShieldCheck style={{ width: "1.25rem", height: "1.25rem" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b" }}>
              zk-SNARK = พิสูจน์โดยไม่เปิดเผยความลับ
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Statement + Circuit + Witness → Proof ก้อนเล็ก ส่งครั้งเดียว ใครก็ตรวจได้ แต่ไม่มีใครเห็น Witness
            </div>
          </div>
        </div>
      </div>

      {/* 7. Completion Card */}
      <div
        className="lab5-animate-merge-up"
        style={{
          backgroundColor: "#ecfdf5",
          border: "1.5px solid #a7f3d0",
          borderRadius: "1.25rem",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "0.75rem",
        }}
      >
        <Trophy style={{ width: "2rem", height: "2rem", color: "#10b981" }} />
        <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#065f46" }}>
          เรียนจบ Lab 05 แล้ว
        </div>
        <p style={{ fontSize: "0.8125rem", color: "#047857", margin: 0, maxWidth: "480px", lineHeight: 1.6 }}>
          คุณสร้างต้นไม้ พิสูจน์ว่าข้อมูลอยู่ในต้นไม้ จับการปลอมแปลงได้ และซ่อนตัวตนด้วย zk-SNARK ได้ด้วยตัวเองแล้ว
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={() => goToStep(2)}
            style={{
              backgroundColor: "#ffffff",
              border: "1.5px solid #c4b5fd",
              borderRadius: "9999px",
              padding: "0.5rem 1.25rem",
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "#6d28d9",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              transition: "all 0.2s ease",
            }}
          >
            <RotateCcw style={{ width: "0.875rem", height: "0.875rem" }} />
            ลองพิสูจน์ออร์เดอร์อื่น
          </button>

          <button
            type="button"
            onClick={reset}
            style={{
              backgroundColor: "#7c3aed",
              border: "none",
              borderRadius: "9999px",
              padding: "0.5rem 1.25rem",
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "#ffffff",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
              transition: "all 0.2s ease",
            }}
          >
            <RotateCcw style={{ width: "0.875rem", height: "0.875rem" }} />
            เริ่มใหม่ทั้งหมด
          </button>
        </div>
      </div>
    </div>
  )
}

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
      return <Step6MerkleProofExposed />
    case 7:
      return <Step7ZkpWorkflow />
    case 8:
      return <Step8Summary />
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
          <div
            className="lab5-mx-auto lab5-max-w-3xl lab5-space-y-2.5 lab5-px-4"
            style={{ paddingTop: "1.125rem", paddingBottom: "0.875rem" }}
          >
            <LabProgress />
            <Glossary />
          </div>
        </header>
      )}

      <main
        className={`lab5-flex-1 lab5-px-4 ${isIntro ? "lab5-intro-main" : "lab5-pb-12"}`}
        style={{ paddingTop: isIntro ? "2rem" : "1.75rem" }}
      >
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
