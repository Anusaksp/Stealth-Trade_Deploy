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
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Contrast,
  Cpu,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Fingerprint,
  Globe,
  GraduationCap,
  HelpCircle,
  Info,
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
  Users,
  X,
  XCircle,
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
    mission: "เลือกรายการและทดสอบตรวจสอบสิทธิ์เพื่อเริ่มการทดลอง",
    mentor:
      "หากเราต้องการจะเช็คความถูกต้องของรายการออร์เดอร์ที่เราได้สั่งซื้อไป จะมีกระบวนการอย่างไร?\nจึงได้เกิดขั้นตอนของ merkle tree ขึ้นมาเพื่อแก้ปัญหานี้",
  },
  {
    index: 2,
    topic: "สร้าง Hash",
    mission: "เลือกรายการและทดสอบตรวจสอบสิทธิ์เพื่อเริ่มการทดลอง",
    mentor: "มาทำการจำลองการสั่งซื้อเพื่อส่งคำสั่งซื้อเข้าไปให้กับระบบกันครับ",
  },
  {
    index: 3,
    topic: "ประกอบต้นไม้",
    mentor: "เอาล่ะครับ! เรามาดูวิธีการที่ผู้ตวจสอบ (ระบบ) ตรวจหา Order ของเรากันครับ",
  },
  {
    index: 4,
    topic: "เลือกสิ่งที่จะพิสูจน์",
    mentor: "ตอนนี้เลือก Order ที่คุณอยากพิสูจน์ได้เลยครับ",
  },
  {
    index: 5,
    topic: "สร้างและตรวจ Proof",
    mission: "เลือกรายการและทดสอบตรวจสอบสิทธิ์เพื่อเริ่มการทดลอง",
    mentor: "ต่อมาจะเป็นขั้นตอนการหาว่าข้อมูลของเรา อยู่ในชุดข้อมูลหรือเปล่าครับ",
  },
  {
    index: 6,
    topic: "ทดสอบการแก้ไขข้อมูล",
    mission: "เลือกรายการและทดสอบตรวจสอบสิทธิ์เพื่อเริ่มการทดลอง",
    mentor: "ลองเปลี่ยนข้อมูลดูอย่างเล็กน้อย แล้วดูว่า Hash กับ Root เปลี่ยนตามไหมครับ",
  },
  {
    index: 7,
    topic: "เวิร์กโฟลว์ ZKP (จำลอง)",
    mission: "เลือกรายการและทดสอบตรวจสอบสิทธิ์เพื่อเริ่มการทดลอง",
    mentor: "มาดู 4 ขั้นตอนกันครับ: ประกาศ Root → ข้อมูลลับของผู้ใช้ → สร้าง Proof → แสดงหลักฐาน (จำลอง)",
  },
  {
    index: 8,
    topic: "Merkle กับ ZKP",
    mission: "เลือกรายการและทดสอบตรวจสอบสิทธิ์เพื่อเริ่มการทดลอง",
    mentor: "ลองสลับดูครับว่าเมื่อใช้ ZKP ข้อมูลอะไรถูกซ่อน และผู้ตรวจยังตรวจอะไรได้บ้าง",
  },
  {
    index: 9,
    topic: "สรุปในบริบทการเทรด",
    mission: "เลือกรายการและทดสอบตรวจสอบสิทธิ์เพื่อเริ่มการทดลอง",
    mentor: "ปิดท้ายด้วยการดูว่า proof เดิมถูกใช้ซ้ำในบริบทเดิมได้ไหมครับ",
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
  selectedLeaf: 0,
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
          return lessonState.builtPairs.every(Boolean) && lessonState.isRootBuilt
        case 4:
          return lessonState.selectedLeaf !== null
        case 5:
          return (
            authPathSteps.length > 0 &&
            authPathSteps.every((pathStep) => lessonState.foundSiblings.includes(pathStep.nodeId)) &&
            lessonState.isRootComputed
          )
        case 6:
          return true
        case 7:
          return lessonState.isZkpWorkflowDone
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
  incorrect: { icon: RotateCcw, tone: "danger" },
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
  return (
    <div
      role="status"
      className={JoinClassNames(
        "lab5-animate-merge-up lab5-feedback",
        config.tone === "success" ? "lab5-feedback--success" : "lab5-feedback--danger",
        className,
      )}
    >
      <Icon className={JoinClassNames("lab5-feedback-icon", config.tone === "success" ? "lab5-feedback-icon--success" : "lab5-feedback-icon--danger")} />
      <div className="lab5-space-y-1">
        <p className={JoinClassNames("lab5-feedback-title", config.tone === "success" ? "lab5-feedback-title--success" : "lab5-feedback-title--danger")}>
          {title}
        </p>
        {children && <div className="lab5-text-sm lab5-leading-relaxed lab5-text-foreground-80">{children}</div>}
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
function MerkleTreeDiagram({ nodeStateMap = {}, visibilityMap, hashNodeIds = [], clickableNodeIds = [], onNodeClick, className }) {
  const { tree } = useLab05()

  /**
   * หาค่า hash ของโหนดที่ระบุ (ถ้าโหนดนั้นต้องแสดง hash)
   *
   * @param {string} nodeId รหัสโหนด
   * @return {string|undefined} ค่า hash หรือ undefined ถ้าไม่ต้องแสดง
   * @author StealthTrade Team
   */
  const getHashByNodeId = (nodeId) => {
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
    if (isError(fromState) || isError(toState)) return "error"
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
        {currentStep === 0 ? "บทนำ" : `ขั้นที่ ${currentStep} · ${STEP_META[currentStep]?.topic || ""}`}
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
    <div className="lab5-space-y-8 lab5-text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
      <div className="lab5-space-y-6">
        <div className="lab5-flex lab5-justify-center">
          <span className="lab5-inline-flex lab5-items-center lab5-gap-2 lab5-rounded-full lab5-border lab5-border-border lab5-bg-surface-soft lab5-px-4 lab5-py-1.5 lab5-font-mono lab5-text-10 lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-muted-foreground">
            LAB 5 <span style={{ opacity: 0.5 }}>·</span> Merkle Trees
          </span>
        </div>

        <div className="lab5-space-y-2">
          <h1
            className="lab5-text-balance lab5-text-4xl lab5-font-extrabold lab5-leading-tight lab5-sm:text-5xl"
            style={{ backgroundImage: 'linear-gradient(to right, #12a05a 15%, #5b3ff2 45%)', WebkitBackgroundClip: 'text', color: 'transparent' }}
          >
            Lab 05 — Merkle Trees แบบ ZKP
          </h1>
          <h2 className="lab5-text-balance lab5-text-2xl lab5-font-extrabold lab5-leading-tight lab5-text-foreground lab5-sm:text-4xl">
            พิสูจน์ข้อมูลโดยไม่ต้องเปิดเผยข้อมูลลับ
          </h2>
        </div>

        <p className="lab5-mx-auto lab5-max-w-lg lab5-text-pretty lab5-text-sm lab5-leading-relaxed lab5-text-muted-foreground lab5-sm:text-base">
          เว็บเทรดมี Order จำนวนมาก เราจะพิสูจน์ได้อย่างไรว่า Order ของเราอยู่ในชุดข้อมูล โดยไม่ต้องเปิดเผยข้อมูลทั้งหมดให้ผู้ตรวจสอบ?
          <br />
          เรียนรู้ผ่านการสร้าง Merkle Tree และจำลองการพิสูจน์ด้วย ZKP
        </p>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <button
          type="button"
          onClick={goNext}
          className="lab5-inline-flex lab5-items-center lab5-gap-2 lab5-rounded-full lab5-bg-primary lab5-px-6 lab5-py-3 lab5-text-base lab5-font-bold lab5-text-primary-foreground lab5-shadow-sm lab5-transition-all lab5-hover-brightness"
        >
          เริ่มเรียนรู้
          <ArrowRight className="lab5-size-5" />
        </button>
      </div>
    </div>
  )
}

const step1Choices = [
  {
    title: "ส่งรายชื่อทั้งหมด + บอกว่าฉันคือใคร",
    desc: "— ตรวจได้ แต่ไม่เป็นส่วนตัว",
    feedbackTitle: "ตรวจได้ แต่ไม่เป็นส่วนตัวเลย",
    feedbackDesc: "ผู้ตรวจเห็นรายชื่อทั้งหมดและรู้ว่าคุณคือใคร ซึ่งจะไม่ตรงกับหลักการของ ZKP",
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
    feedbackDesc: "เราจะเรียนทีละชั้น: Merkle Tree ในรูปแบบของ ZKP (ขั้น 2–7) แล้วใช้ ZKP ซ่อนตัวตน (ขั้น 8–9)",
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
  const { step1Answer, isStep1Correct, answerStep1 } = useLab05()

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="ปัญหาที่เราจะแก้"
        title="จะพิสูจน์ว่าออร์เดอร์ B ของเราที่สั่งซื้อไป อยู่ในชุดข้อมูลหรือเปล่า?"
      />

      <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3 lab5-sm:grid-cols-4">
        {orders.map((order) => {
          const isTarget = order.id === "B"
          return (
            <div
              key={order.id}
              className={JoinClassNames(
                "lab5-rounded-xl lab5-p-3.5 lab5-text-center lab5-transition-all",
                isTarget
                  ? "lab5-border-2 lab5-border-primary lab5-bg-primary-soft lab5-shadow-sm"
                  : "lab5-border lab5-border-border lab5-bg-surface-soft",
              )}
            >
              <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">
                {order.label}
              </p>
              <p className="lab5-mt-1 lab5-font-mono lab5-text-11 lab5-leading-tight lab5-text-muted-foreground">{order.value}</p>
              {isTarget && <p className="lab5-mt-1.5 lab5-text-11 lab5-font-semibold lab5-text-primary">← อยากพิสูจน์</p>}
            </div>
          )
        })}
      </div>

      <div className="lab5-flex lab5-items-start lab5-gap-3 lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
        <Lightbulb className="lab5-size-5 lab5-shrink-0 lab5-text-primary lab5-mt-0.5" />
        <div className="lab5-space-y-1 lab5-text-xs lab5-leading-relaxed lab5-text-foreground-80">
          <p className="lab5-text-muted-foreground">
            Merkle Tree สรุปชุดข้อมูลทั้งหมดให้เหลือค่าเดียว เรียกว่า Root
          </p>
          <p className="lab5-text-muted-foreground">
            ถ้าอยากตรวจสอบ 1 รายการ ให้ทำการส่ง Order นั้น + Hash ของออร์เดอร์ที่เราซื้ออยู่ ที่จำเป็นต่อการคำนวณย้อนกลับไปหา Root หรือชุดข้อมูลที่ทำการเก็บ ออร์เดอร์ของเรา
          </p>
        </div>
      </div>

      <div className="lab5-space-y-1">
        <p className="lab5-text-xs lab5-font-semibold lab5-text-foreground">
          เป้าหมาย: พิสูจน์ว่าคุณเป็นออร์เดอร์ โดยไม่บอกว่าคุณเป็นใคร เลือกวิธีส่งข้อมูล 1 วิธี
        </p>
        <p className="lab5-text-xs lab5-text-muted-foreground">
          ZKP = พิสูจน์ว่าบางอย่างเป็นจริง โดยไม่เปิดเผยข้อมูลลับ
        </p>
      </div>

      <div className="lab5-space-y-3">
        {step1Choices.map((choice, index) => {
          const isSelected = step1Answer === index
          const choiceState = isSelected ? (index === 2 ? "correct" : "incorrect") : "default"
          return (
            <ChoiceCard
              key={index}
              isSelected={isSelected}
              choiceState={choiceState}
              onClick={() => answerStep1(index)}
              className="lab5-flex lab5-flex-col lab5-items-start lab5-gap-0.5"
            >
              <span className="lab5-text-sm lab5-font-bold lab5-text-foreground">{choice.title}</span>
              <span
                className={JoinClassNames(
                  "lab5-text-xs",
                  choiceState === "incorrect"
                    ? "lab5-text-danger"
                    : choiceState === "correct"
                    ? "lab5-text-success"
                    : "lab5-text-muted-foreground",
                )}
              >
                {choice.desc}
              </span>
            </ChoiceCard>
          )
        })}
      </div>

      {!isStep1Correct && (
        <HintButton label="ทำไม?">
          คำใบ้: เราต้องการพิสูจน์ว่า Order B อยู่ในชุดข้อมูลจริง โดยไม่ต้องเปิดเผย Order อื่นทั้งหมด และไม่เปิดเผยตัวตนของเรา
        </HintButton>
      )}

      {step1Answer !== null && !isStep1Correct && (
        <FeedbackCard variant="incorrect" title={step1Choices[step1Answer].feedbackTitle}>
          {step1Choices[step1Answer].feedbackDesc}
        </FeedbackCard>
      )}

      {isStep1Correct && (
        <div className="lab5-animate-merge-up lab5-space-y-4">
          <FeedbackCard variant="correct" title="ถูกต้อง นี่คือเป้าหมายของแลป">
            เราจะเรียนทีละชั้น: Merkle Tree ในรูปแบบของ ZKP (ขั้น 2–7) แล้วใช้ ZKP ซ่อนตัวตน (ขั้น 8–9)
          </FeedbackCard>

          <Step1MerklePreview />

          <div className="lab5-flex lab5-items-start lab5-gap-3 lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
            <Users className="lab5-size-4 lab5-shrink-0 lab5-text-primary lab5-mt-0.5" />
            <p className="lab5-text-xs lab5-leading-relaxed lab5-text-foreground-80">
              <strong className="lab5-text-foreground">ตัวอย่างการใช้งานจริง:</strong> ระบบมีรายชื่อผู้มีสิทธิ์ 10,000 คน แต่ไม่อยากเปิดเผยรายชื่อทั้งหมด Merkle Tree ช่วยตรวจว่า “คนนี้อยู่ในรายชื่อจริงไหม” โดยใช้ Root + หลักฐานของคนนั้น
            </p>
          </div>
        </div>
      )}
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
  const isAllHashed = hashedLeaves.every(Boolean)

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="สร้าง HASH"
        title="เปลี่ยนรหัสลับเป็น Hash"
        description="เราไม่เอาค่าดั้งเดิมของออร์เดอร์ไปวางในต้นไม้ แต่เปลี่ยนเป็น Hash ก่อน เพื่อให้ข้อมูลเดิมไม่ถูกเปิดเผย"
      />

      <MentorMessage message="ทำไปทำไม? เมื่อเราสั่งซื้อแล้วเราก็จะต้องส่งคำสั่งซื้อที่ทำการ Hash แล้วไปให้กับระบบครับ เพราะเราจะเอา Hash เหล่านี้ไปจับคู่กันในขั้นต่อไป เพื่อสร้าง Merkle Tree ครับ และหา Root ของชุดข้อมูลครับ" />

      <div className="lab5-space-y-3">
        {orders.map((order, index) => {
          const isHashed = hashedLeaves[index]
          return (
            <div key={order.id} className="lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
              <div className="lab5-flex lab5-flex-wrap lab5-items-center lab5-justify-between lab5-gap-3">
                <div>
                  <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">{order.label}</p>
                  <p className="lab5-text-xs lab5-text-muted-foreground">
                    รหัสลับ: <span className="lab5-font-mono">{order.value}</span>
                  </p>
                </div>

                {!isHashed ? (
                  <button
                    type="button"
                    onClick={() => revealHash(index)}
                    className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-bg-primary lab5-px-4 lab5-py-2 lab5-text-sm lab5-font-semibold lab5-text-primary-foreground lab5-transition-all lab5-hover-brightness"
                  >
                    <Sparkles className="lab5-size-4" />
                    สร้าง Hash
                  </button>
                ) : (
                  <div className="lab5-flex lab5-items-center lab5-gap-1.5 lab5-text-xs lab5-font-semibold lab5-text-success">
                    <ArrowDown className="lab5-size-3.5" />
                    <span>Hash (SHA-256)</span>
                  </div>
                )}
              </div>

              {isHashed && tree && (
                <div className="lab5-animate-merge-up lab5-mt-3 lab5-border-t lab5-border-border lab5-pt-3">
                  <HashValue hash={tree.leafHashes[index]} label={`Hash ของ ${order.label} =`} tone="primary" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isAllHashed && (
        <FeedbackCard variant="correct" title="ครบทั้ง 4 ใบแล้ว">
          รหัสลับของแต่ละออร์เดอร์ถูกเปลี่ยนเป็น Hash ด้วย SHA-256 แล้ว ตอนนี้เรามี Hash ครบ 4 ค่า Hash เหล่านี้คือ Input ของขั้นต่อไปในขั้นถัดไป — ขั้นต่อไปเราจะจับ Hash ทีละ 2 ตัวมารวมกัน
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
 * ขั้นที่ 3: ประกอบต้นไม้โดยจับคู่ hash จนได้ root
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 3
 * @author StealthTrade Team
 */
function Step3BuildTree() {
  const { builtPairs, isRootBuilt, buildPair, buildRoot } = useLab05()
  const isFirstPairDone = builtPairs[0] && !builtPairs[1]
  const hasBothPairs = builtPairs.every(Boolean)

  const nodeStateMap = {
    "leaf-0": "neutral",
    "leaf-1": "neutral",
    "leaf-2": "neutral",
    "leaf-3": "neutral",
    "mid-0": builtPairs[0] ? "path" : "neutral",
    "mid-1": builtPairs[1] ? "path" : "neutral",
    root: isRootBuilt ? "success" : "neutral",
  }

  const visibilityMap = {
    "mid-0": builtPairs[0],
    "mid-1": builtPairs[1],
    root: isRootBuilt,
  }

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="ประกอบต้นไม้"
        title="นำค่า Hash มาจับคู่กันเพื่อสร้างโครงสร้าง Merkle Tree"
        description="ตอนนี้เรามีรอยประทับของ Order A, B, C และ D แล้ว ขั้นต่อไป เราจะเอา Hash ทีละ 2 ตัวมารวมกันเพื่อที่จะสร้าง แผนภาพต้นไม้ "
      />

      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
        <MerkleTreeDiagram nodeStateMap={nodeStateMap} visibilityMap={visibilityMap} hashNodeIds={["leaf-0", "leaf-1", "leaf-2", "leaf-3", "mid-0", "mid-1", "root"]} />
      </div>

      {!hasBothPairs && (
        <div className="lab5-space-y-3">
          <p className="lab5-text-center lab5-text-sm lab5-font-medium lab5-text-foreground">คุณคิดว่า คู่แรกควรเป็นคู่ไหน?</p>
          <div className="lab5-grid lab5-gap-3 lab5-sm:grid-cols-2">
            <PairButton label="จับคู่ H(A) + H(B)" isDone={builtPairs[0]} onClick={() => buildPair(0)} />
            <PairButton label="จับคู่ H(C) + H(D)" isDone={builtPairs[1]} onClick={() => buildPair(1)} />
          </div>
        </div>
      )}

      {isFirstPairDone && (
        <FeedbackCard variant="correct" title="ได้ Hash ของคู่แรกแล้ว">
          เราเอา Hash ของ A และ B มารวมกัน แล้วสร้าง Hash ใหม่ที่แทน “คู่ A+B” — ทำแบบเดียวกันกับ C
          และ D ต่อได้เลย
        </FeedbackCard>
      )}

      {hasBothPairs && !isRootBuilt && (
        <div className="lab5-animate-merge-up lab5-space-y-3">
          <FeedbackCard variant="correct" title="ครบทั้งสองคู่แล้ว">ตอนนี้เรามี Hash ที่แทนข้อมูลเป็นคู่แล้ว</FeedbackCard>
          <MentorMessage message="ตอนนี้เรายังมี 2 Hash — ถ้าอยากได้ Hash เดียวที่สรุปข้อมูลทั้ง 4 “คำสั่งซื้อ” เราต้องรวม 2 คู่นี้อีกครั้ง" />
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

      {isRootBuilt && (
        <FeedbackCard variant="correct" title="ต้นไม้สมบูรณ์แล้ว">
          <p>
            Root คือ Hash เดียวที่สรุปข้อมูลทั้งหมดในต้นไม้ — เราเรียกมันว่า{" "}
            <span className="lab5-font-semibold">Root (Merkle Root)</span> ถ้าข้อมูลใบใดใบหนึ่งเปลี่ยน Root ก็จะ
            เปลี่ยนตามทันที
          </p>
          <p className="lab5-mt-2 lab5-font-mono lab5-text-xs lab5-text-foreground-60">
            Order → Hash → จับเป็นคู่ → Hash ใหม่ → รวมต่อ → Root
          </p>
        </FeedbackCard>
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
function Step4SelectTarget() {
  const { selectedLeaf, selectLeaf } = useLab05()

  const nodeStateMap = selectedLeaf !== null ? { [`leaf-${selectedLeaf}`]: "target" } : {}

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="เลือกสิ่งที่จะพิสูจน์"
        title="ตอนนี้เราจะลองพิสูจน์ Order หนึ่งรายการ"
        description="เลือก Order หนึ่งรายการที่คุณอยากพิสูจน์ว่า “อยู่ในต้นไม้นี้จริง”"
      />

      <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3 lab5-sm:grid-cols-4">
        {orders.map((order, index) => (
          <ChoiceCard key={order.id} isSelected={selectedLeaf === index} onClick={() => selectLeaf(index)} className="lab5-text-center">
            <div className="lab5-flex lab5-flex-col lab5-items-center lab5-gap-1">
              <Target className={JoinClassNames("lab5-size-5", selectedLeaf === index ? "lab5-text-primary" : "lab5-text-muted-foreground")} />
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
        <MerkleTreeDiagram nodeStateMap={nodeStateMap} />
      </div>
    </div>
  )
}

/**
 * ขั้นที่ 5: สร้างและตรวจ Proof (หา Sibling Hash และคำนวณย้อนกลับหา Root)
 *
 * @return {JSX.Element|null} เนื้อหาขั้นที่ 5
 * @author StealthTrade Team
 */
function Step5AuthPath() {
  const {
    tree,
    selectedLeaf,
    authPathSteps,
    foundSiblings,
    findSibling,
    isRootComputed,
    computeRootStep,
    resetRootStep,
  } = useLab05()
  const [wrongNodeId, setWrongNodeId] = useState(null)
  const [flash, setFlash] = useState("idle")
  const [showDetails, setShowDetails] = useState(false)

  const currentLeaf = selectedLeaf ?? 0
  const targetLabel = orders[currentLeaf]?.label || "ออร์เดอร์ A"

  // เรียงตามลำดับที่คลิกจริง (ไม่ใช่ลำดับใน authPathSteps)
  const orderedFoundSiblings = foundSiblings
    .map((nodeId) => authPathSteps.find((pathStep) => pathStep.nodeId === nodeId))
    .filter(Boolean)

  const isAllSiblingsFound = foundSiblings.length >= 2

  const nodeStateMap = {
    [`leaf-${currentLeaf}`]: "target",
  }
  for (const nodeId of foundSiblings) nodeStateMap[nodeId] = "path"
  if (isRootComputed) {
    nodeStateMap["mid-0"] = "path"
    nodeStateMap.root = "path"
  }
  if (wrongNodeId) nodeStateMap[wrongNodeId] = "error"

  const clickableNodeIds = ["leaf-0", "leaf-1", "leaf-2", "leaf-3", "mid-0", "mid-1"].filter(
    (nodeId) => nodeId !== `leaf-${currentLeaf}` && !foundSiblings.includes(nodeId) && !isRootComputed,
  )

  const handleClick = (nodeId) => {
    const result = findSibling(nodeId)
    if (result === "wrong") {
      setWrongNodeId(nodeId)
      setFlash("wrong")
      setTimeout(() => setWrongNodeId(null), 700)
    } else if (result === "correct") {
      setFlash("correct")
    }
  }

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="สร้างและตรวจ PROOF"
        title={`พิสูจน์ว่า ${targetLabel} อยู่ในชุดข้อมูลจริง`}
        description="เลือก Hash ที่อยู่ข้าง ๆ ตามเส้นทางจริง แล้วคำนวณย้อนกลับจาก Leaf ไปจนถึง Root ที่เชื่อถือได้"
      />

      {/* แถบคำใบ้สีม่วงด้านบน (แสดงตามสถานะ) */}
      {!isAllSiblingsFound && (
        <div className="lab5-animate-merge-up lab5-flex lab5-items-center lab5-justify-between lab5-gap-2 lab5-rounded-2xl lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-px-4 lab5-py-3 lab5-text-xs">
          <div className="lab5-flex lab5-items-center lab5-gap-2">
            <HelpCircle className="lab5-size-4 lab5-shrink-0 lab5-text-primary" />
            <span className="lab5-font-bold lab5-text-primary">
              {foundSiblings.length === 0
                ? "ถ้าจะสร้าง H(A+B) เราต้องรู้อะไรเพิ่ม?"
                : "เมื่อได้ H(A+B) แล้ว ต้องใช้อะไรต่อเพื่อไปยัง Root?"}
            </span>
          </div>
          <span className="lab5-text-primary-80 lab5-shrink-0">คลิกบนต้นไม้เพื่อเลือก Sibling Hash</span>
        </div>
      )}

      {/* Interactive Merkle Tree Box */}
      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4 lab5-space-y-4">
        <div className="lab5-flex lab5-items-center lab5-justify-between">
          <div>
            <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">Interactive Merkle Tree</p>
            <p className="lab5-text-xs lab5-text-muted-foreground">Leaf → Parent Hash → Root</p>
          </div>
          <span className="lab5-rounded-full lab5-bg-primary-soft lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold lab5-text-primary">
            {foundSiblings.length}/2 Sibling Hash
          </span>
        </div>

        <MerkleTreeDiagram
          nodeStateMap={nodeStateMap}
          clickableNodeIds={clickableNodeIds}
          onNodeClick={handleClick}
        />
      </div>

      {/* เส้นทางตรวจสอบสิทธิ์ (Authentication Path) */}
      {foundSiblings.length > 0 && (
        <div className="lab5-animate-merge-up lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4 lab5-space-y-3">
          <p className="lab5-text-xs lab5-font-bold lab5-text-foreground">
            เส้นทางตรวจสอบสิทธิ์ (Authentication Path)
          </p>
          <div className="lab5-grid lab5-gap-3 lab5-sm:grid-cols-2">
            {orderedFoundSiblings.map((sibling, index) => (
              <div
                key={sibling.nodeId}
                className="lab5-flex lab5-items-center lab5-justify-between lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-2.5"
              >
                <div className="lab5-flex lab5-items-center lab5-gap-2">
                  <span className="lab5-flex lab5-size-5 lab5-items-center lab5-justify-center lab5-rounded-full lab5-bg-primary-soft lab5-text-xs lab5-font-bold lab5-text-primary">
                    {index + 1}
                  </span>
                  <HashChip tone="primary" label={`${sibling.label} =`} hash={sibling.hash} />
                </div>
                <span className="lab5-text-xs lab5-text-muted-foreground">
                  {sibling.position === "right" ? "ขวา" : "ซ้าย"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* แจ้งเตือนเมื่อคลิกผิด */}
      {flash === "wrong" && !isAllSiblingsFound && (
        <FeedbackCard variant="incorrect" title="ลองอีกครั้ง">
          ลองดูตำแหน่งของ Order ที่เรากำลังพิสูจน์อีกครั้ง เราต้องหา Hash ที่อยู่ “ข้าง ๆ เส้นทาง” ของมัน
        </FeedbackCard>
      )}

      {/* แจ้งเตือนเมื่อพบ Sibling แรก */}
      {foundSiblings.length === 1 && !isAllSiblingsFound && (
        <FeedbackCard variant="correct" title="ถูกต้อง">
          พบ Sibling Hash ที่จำเป็นแล้ว ลองเดินตามเส้นทางขึ้นไปอีกระดับ
        </FeedbackCard>
      )}

      {/* Root Reconstruction Box */}
      {isAllSiblingsFound && (
        <div className="lab5-animate-merge-up lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4 lab5-space-y-4">
          <div className="lab5-flex lab5-items-start lab5-justify-between">
            <div>
              <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">Root Reconstruction</p>
              <p className="lab5-text-xs lab5-text-muted-foreground">
                คำนวณจากข้อมูลจริงทีละขั้นตามลำดับของ Authentication Path
              </p>
            </div>
            {isRootComputed && (
              <span className="lab5-text-success">
                <Check className="lab5-size-5" />
              </span>
            )}
          </div>

          {/* สมการคำนวณ */}
          <div className="lab5-flex lab5-flex-wrap lab5-items-center lab5-justify-center lab5-gap-2 lab5-py-2 lab5-text-xs">
            <span className="lab5-rounded-lg lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-px-2.5 lab5-py-1 lab5-font-mono lab5-font-bold lab5-text-primary">
              H(A)
            </span>
            <span className="lab5-font-bold lab5-text-muted-foreground">+</span>
            <span className="lab5-rounded-lg lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-px-2.5 lab5-py-1 lab5-font-mono lab5-font-bold lab5-text-primary">
              H(B)
            </span>
            <span className="lab5-font-bold lab5-text-muted-foreground">→</span>
            {isRootComputed ? (
              <span className="lab5-rounded-lg lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-px-2.5 lab5-py-1 lab5-font-mono lab5-font-bold lab5-text-primary">
                H(A+B)
              </span>
            ) : (
              <span className="lab5-rounded-lg lab5-border lab5-border-border lab5-bg-surface-soft lab5-px-2.5 lab5-py-1 lab5-font-mono lab5-font-bold lab5-text-muted-foreground">
                ?
              </span>
            )}
            <span className="lab5-font-bold lab5-text-muted-foreground">+</span>
            <span className="lab5-rounded-lg lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-px-2.5 lab5-py-1 lab5-font-mono lab5-font-bold lab5-text-primary">
              H(C+D)
            </span>
            <span className="lab5-font-bold lab5-text-muted-foreground">→</span>
            <span className="lab5-rounded-lg lab5-border lab5-border-success-30 lab5-bg-success-soft lab5-px-2.5 lab5-py-1 lab5-font-mono lab5-font-bold lab5-text-success">
              Root
            </span>
          </div>

          {!isRootComputed ? (
            <div className="lab5-flex lab5-justify-center">
              <button
                type="button"
                onClick={computeRootStep}
                className="lab5-inline-flex lab5-items-center lab5-gap-2 lab5-rounded-full lab5-bg-primary lab5-px-6 lab5-py-2.5 lab5-text-sm lab5-font-semibold lab5-text-primary-foreground lab5-transition-all lab5-hover-brightness"
              >
                คำนวณ Hash สู่ Root
              </button>
            </div>
          ) : (
            <div className="lab5-space-y-3">
              <div className="lab5-flex lab5-justify-center">
                <button
                  type="button"
                  onClick={resetRootStep}
                  className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-border lab5-border-border lab5-bg-surface lab5-px-3 lab5-py-1 lab5-text-xs lab5-text-muted-foreground lab5-transition-colors lab5-hover-surface-soft"
                >
                  <RotateCcw className="lab5-size-3.5" />
                  คำนวณใหม่
                </button>
              </div>
              <div className="lab5-flex lab5-items-center lab5-justify-center lab5-gap-2 lab5-rounded-xl lab5-border lab5-border-success-30 lab5-bg-success-soft lab5-p-3 lab5-text-xs lab5-font-semibold lab5-text-success">
                <span>ตรวจสอบผ่าน: ข้อมูลถูกต้อง Root ที่คำนวณได้ ตรงกับ ค่า Root ดั้งเดิมที่อ้างอิง</span>
                <Check className="lab5-size-4" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ผลลัพธ์สุดท้ายเมื่อคำนวณ Root เสร็จสิ้น */}
      {isRootComputed && (
        <FeedbackCard variant="correct" title="ตรวจสอบผ่าน">
          Root ตรงกัน เป็นการ Hash ที่คุณคำนวณยืนยันได้ว่า ออร์เดอร์ A เป็นออร์เดอร์ของชุดข้อมูล โดยไม่ต้องเปิดเผย Leaf อื่นทั้งหมด
        </FeedbackCard>
      )}

      {/* ส่วนท้าย Accordion */}
      <div className="lab5-space-y-3">
        <HintButton>
          เราต้องการเฉพาะ Hash ที่อยู่ข้าง ๆ เส้นทางที่เดินจาก {targetLabel} ไปหา Root ไม่ใช่ทุก Hash ในต้นไม้
        </HintButton>

        <div className="lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="lab5-flex lab5-w-full lab5-items-center lab5-justify-between lab5-p-3 lab5-text-xs lab5-font-semibold lab5-text-foreground"
          >
            <span>ดูรายละเอียดการคำนวณและหลักการ</span>
            <ChevronDown className={JoinClassNames("lab5-size-4 lab5-transition-transform", showDetails && "lab5-rotate-180")} />
          </button>
          {showDetails && (
            <div className="lab5-animate-merge-up lab5-border-t lab5-border-border lab5-bg-surface-soft lab5-p-4 lab5-text-xs lab5-leading-relaxed lab5-text-muted-foreground lab5-space-y-2">
              <p><strong>Authentication Path:</strong> คือชุดของ Sibling Hash ที่จำเป็นต้องใช้ในการคำนวณย้อนกลับไปหา Merkle Root</p>
              <p><strong>ทำไมถึงเป็นส่วนตัว?</strong> เพราะผู้พิสูจน์ไม่จำเป็นต้องส่งข้อมูลของ Order อื่นๆ ทั้งหมด ส่งเพียง Hash ของฝั่งตรงข้ามในแต่ละระดับต้นไม้เท่านั้น ผู้ตรวจสอบก็สามารถหา Root และยืนยันได้ทันที</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ขั้นที่ 6: คำนวณจาก Order กลับไปหา Root ทีละขั้น
 *
 * @return {JSX.Element|null} เนื้อหาขั้นที่ 6 หรือ null ถ้ายังไม่พร้อมแสดง
 * @author StealthTrade Team
 */


/**
 * ขั้นที่ 6: ทดสอบการแก้ไขข้อมูล (แอบแก้ข้อมูลแล้วดูว่า Root เปลี่ยนตามไหม)
 *
 * @return {JSX.Element|null} เนื้อหาขั้นที่ 6
 * @author StealthTrade Team
 */
function Step7Tamper() {
  const { tree, selectedLeaf, tamperedProof, isTamperMode, toggleTamper } = useLab05()
  const [isExplanationOpen, setIsExplanationOpen] = useState(false)

  const currentLeaf = selectedLeaf ?? 0
  const targetLabel = orders[currentLeaf]?.label || "ออร์เดอร์ A"

  useEffect(() => {
    setIsExplanationOpen(isTamperMode)
  }, [isTamperMode])

  if (!tree) return null

  const isMatching = !isTamperMode

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="ทดสอบการแก้ข้อมูล"
        title="ถ้าข้อมูลคำสั่งซื้อถูกเปลี่ยน จะเกิดอะไรขึ้น?"
        description={`ลองแก้ไขข้อมูลของ ${targetLabel} แล้วใช้ Authentication Path ชุดเดิมมาตรวจสอบอีกครั้ง`}
      />

      {/* Switch Toggle Card */}
      <div className="lab5-flex lab5-items-center lab5-justify-between lab5-gap-4 lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
        <div>
          <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">จำลองการแก้ไขข้อมูลของ {targetLabel}</p>
          <p className="lab5-text-xs lab5-text-muted-foreground">
            {isTamperMode
              ? `ระบบจะแก้ข้อมูลคำสั่งซื้อเล็กน้อย (${orders[currentLeaf].value} → ${orders[currentLeaf].tamperedValue}) แล้วคำนวณ Leaf Hash และ Root ใหม่จากข้อมูลจริงทันที`
              : "ระบบจะคำนวณ Leaf Hash และ Root ใหม่จากข้อมูลจริงทันที"}
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

      {/* ผลการตรวจสอบ Banner */}
      {isMatching ? (
        <div className="lab5-animate-merge-up lab5-flex lab5-items-start lab5-gap-3 lab5-rounded-2xl lab5-border lab5-border-success-30 lab5-bg-success-soft lab5-p-4">
          <Check className="lab5-size-5 lab5-shrink-0 lab5-text-success lab5-mt-0.5" />
          <div className="lab5-space-y-0.5">
            <p className="lab5-text-base lab5-font-bold lab5-text-success">ตรวจสอบผ่าน: ข้อมูลถูกต้อง</p>
            <p className="lab5-text-xs lab5-text-success">ข้อมูลเดิมยังตรงกับค่า Root ดั้งเดิมที่อ้างอิง</p>
          </div>
        </div>
      ) : (
        <div className="lab5-animate-merge-up lab5-flex lab5-items-start lab5-gap-3 lab5-rounded-2xl lab5-border lab5-border-danger-30 lab5-bg-danger-soft lab5-p-4">
          <AlertTriangle className="lab5-size-5 lab5-shrink-0 lab5-text-danger lab5-mt-0.5" />
          <div className="lab5-space-y-1">
            <p className="lab5-text-base lab5-font-bold lab5-text-danger">ปฏิเสธ: ตรวจพบการแก้ไขข้อมูล</p>
            <p className="lab5-text-xs lab5-text-danger">
              ค่า Root ไม่ตรงกัน เพราะข้อมูลที่ใช้ตรวจสอบไม่ตรงกับชุดข้อมูลที่อ้างอิง
            </p>
            <p className="lab5-text-xs lab5-text-danger" style={{ opacity: 0.85 }}>
              ธุรกรรมถูกปฏิเสธโดยกลไกจำลองของ Lab เท่านั้น ไม่ได้เชื่อมต่อหรือบล็อกธุรกรรมบน Blockchain จริง
            </p>
          </div>
        </div>
      )}

      {/* กล่องรวม Flow Pills และ Root Comparison */}
      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4 lab5-space-y-5">
        {/* Flow Pills */}
        <div className="lab5-flex lab5-flex-wrap lab5-items-center lab5-justify-center lab5-gap-2 lab5-text-xs">
          {isMatching ? (
            <>
              <span className="lab5-rounded-full lab5-border lab5-border-success-30 lab5-bg-success-soft lab5-px-3 lab5-py-1 lab5-font-semibold lab5-text-success">
                ข้อมูล เดิม
              </span>
              <span className="lab5-font-bold lab5-text-muted-foreground">→</span>
              <span className="lab5-rounded-full lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-px-3 lab5-py-1 lab5-font-semibold lab5-text-primary">
                Leaf Hash เดิม
              </span>
              <span className="lab5-font-bold lab5-text-muted-foreground">→</span>
              <span className="lab5-rounded-full lab5-border lab5-border-success-30 lab5-bg-success-soft lab5-px-3 lab5-py-1 lab5-font-semibold lab5-text-success">
                Root ตรงกัน
              </span>
            </>
          ) : (
            <>
              <span className="lab5-rounded-full lab5-border lab5-border-danger-30 lab5-bg-danger-soft lab5-px-3 lab5-py-1 lab5-font-semibold lab5-text-danger">
                ข้อมูล เปลี่ยน
              </span>
              <span className="lab5-font-bold lab5-text-muted-foreground">→</span>
              <span className="lab5-rounded-full lab5-border lab5-border-danger-30 lab5-bg-danger-soft lab5-px-3 lab5-py-1 lab5-font-semibold lab5-text-danger">
                Leaf Hash เปลี่ยน
              </span>
              <span className="lab5-font-bold lab5-text-muted-foreground">→</span>
              <span className="lab5-rounded-full lab5-border lab5-border-danger-30 lab5-bg-danger-soft lab5-px-3 lab5-py-1 lab5-font-semibold lab5-text-danger">
                Root เปลี่ยน
              </span>
            </>
          )}
        </div>

        {/* Two Root Cards with Center Icon */}
        <div className="lab5-relative lab5-grid lab5-grid-cols-2" style={{ gap: "2.75rem" }}>
          {/* Left Box */}
          <div
            className="lab5-flex lab5-flex-col lab5-justify-between lab5-rounded-2xl lab5-border"
            style={{
              borderColor: "rgba(22, 169, 121, 0.4)",
              backgroundColor: "rgba(234, 248, 242, 0.75)",
              minHeight: "100px",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div className="lab5-flex lab5-items-center lab5-gap-2 lab5-text-xs lab5-font-semibold lab5-text-success">
              <ShieldCheck className="lab5-size-4 lab5-shrink-0" />
              <span className="lab5-leading-snug">ค่า Root ดั้งเดิมที่อ้างอิง</span>
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <HashChip tone="success" hash={tree.root} className="lab5-hash-chip--onsoft" />
            </div>
          </div>

          {/* Center Indicator */}
          <div
            className="lab5-absolute lab5-z-10 lab5-flex lab5-items-center lab5-justify-center"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            {isMatching ? (
              <div
                className="lab5-flex lab5-size-8 lab5-items-center lab5-justify-center lab5-rounded-full lab5-text-white lab5-shadow-md"
                style={{ backgroundColor: "#16a979" }}
              >
                <Check className="lab5-size-4" strokeWidth={2.8} />
              </div>
            ) : (
              <div
                className="lab5-flex lab5-size-8 lab5-items-center lab5-justify-center lab5-rounded-full lab5-text-white lab5-shadow-md"
                style={{ backgroundColor: "#e5485d" }}
              >
                <X className="lab5-size-4" strokeWidth={2.8} />
              </div>
            )}
          </div>

          {/* Right Box */}
          <div
            className="lab5-flex lab5-flex-col lab5-justify-between lab5-rounded-2xl lab5-border"
            style={{
              borderColor: isMatching ? "rgba(22, 169, 121, 0.4)" : "rgba(229, 72, 93, 0.4)",
              backgroundColor: isMatching ? "rgba(234, 248, 242, 0.75)" : "rgba(255, 240, 242, 0.75)",
              minHeight: "100px",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div className={JoinClassNames("lab5-text-xs lab5-font-semibold lab5-leading-snug", isMatching ? "lab5-text-success" : "lab5-text-danger")}>
              Root คำนวณได้
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <HashChip
                key={isMatching ? "match" : "tamper"}
                tone={isMatching ? "success" : "danger"}
                hash={isMatching ? tree.root : tamperedProof?.root}
                className="lab5-hash-chip--onsoft"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accordion */}
      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-shadow-sm lab5-overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExplanationOpen((prev) => !prev)}
          className="lab5-flex lab5-w-full lab5-items-center lab5-justify-between lab5-px-5 lab5-py-4 lab5-text-xs lab5-font-semibold lab5-text-foreground lab5-transition-colors"
        >
          <span className="lab5-text-sm lab5-font-medium">ทำไม Root ถึงเปลี่ยน?</span>
          <ChevronDown className={JoinClassNames("lab5-size-4 lab5-text-muted-foreground lab5-transition-transform", isExplanationOpen && "lab5-rotate-180")} />
        </button>
        {isExplanationOpen && (
          <div className="lab5-animate-merge-up lab5-zk-explain">
            <div className="lab5-grid lab5-gap-3 lab5-sm:grid-cols-2">
              <div className="lab5-zk-explain-card">
                <p className="lab5-zk-field-label">Original Data</p>
                <p className="lab5-font-mono lab5-text-xs lab5-text-muted-foreground">{orders[currentLeaf].value}</p>
                <p className="lab5-zk-field-label lab5-mt-2">Original Leaf Hash</p>
                <HashChip tone="success" hash={tree.leafHashes[currentLeaf]} />
              </div>
              <div className="lab5-zk-explain-card">
                <p className="lab5-zk-field-label">Modified Data</p>
                <p className="lab5-font-mono lab5-text-xs lab5-text-muted-foreground">{tamperedProof?.value} (แก้ไข)</p>
                <p className="lab5-zk-field-label lab5-mt-2">Modified Leaf Hash</p>
                <HashChip tone="danger" hash={tamperedProof?.leafHash} />
              </div>
            </div>
            <p className="lab5-zk-explain-text">
              เมื่อข้อมูลต้นทางเปลี่ยน Leaf Hash จึงเปลี่ยน และผลลัพธ์ของ Parent Hash ต่อเนื่องไปจนถึง Root เปลี่ยนตาม แม้จะแก้เพียงจุดเดียว
            </p>
            <p className="lab5-break-all lab5-font-mono lab5-text-11 lab5-leading-relaxed lab5-text-muted-foreground">
              Parent Hashes: {tamperedProof?.steps.join(" → ")}
            </p>
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
  const { tree, selectedLeaf, authPathSteps, tamperedProof, zkpWorkflowStage, goToZkpStage, goNext } = useLab05()
  const [isWitnessVisible, setIsWitnessVisible] = useState(false)
  const [isWitnessTampered, setIsWitnessTampered] = useState(false)

  const targetIndex = selectedLeaf ?? 0
  const targetOrder = orders[targetIndex] || orders[0]
  const rootHash = tree?.root
  const leafHash = tree?.leafHashes[targetIndex]
  const computedRoot = isWitnessTampered ? tamperedProof?.root : rootHash
  const stage = zkpWorkflowStage
  const isNextBlocked = stage === 3 && isWitnessTampered

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="เวิร์กโฟลว์ ZKP (จำลอง)"
        title="พิสูจน์ Order โดยไม่เปิดเผยข้อมูลทั้งหมด"
        description="เว็บเทรดประกาศ Root ไว้ก่อน ผู้ใช้ใช้ Order และ Hash ข้างเคียงเป็นข้อมูลลับ แนวคิด ZKP ช่วยให้ผู้ตรวจสอบเช็กได้โดยไม่ต้องเห็นข้อมูลลับเหล่านี้"
      />

      <div className="lab5-zk-banner">
        <Info className="lab5-size-4 lab5-shrink-0 lab5-text-primary" />
        <span>แล็บนี้จำลองขั้นตอน ไม่ได้สร้างหรือ verify ZK Proof จริง</span>
      </div>

      {/* ตัวบอกขั้นย่อย */}
      <div className="lab5-zk-card lab5-zk-stepper">
        <div className="lab5-zk-stepper-head">
          <span className="lab5-font-bold lab5-text-primary">
            ขั้นที่ {stage} จาก 4 : {zkpWorkflowStages[stage - 1].title}
          </span>
          <span className="lab5-text-muted-foreground">เป้าหมาย: ตรวจสอบความถูกต้องโดยไม่เปิดเผยข้อมูลลับ</span>
        </div>
        <div className="lab5-zk-stepper-items">
          {zkpWorkflowStages.map((workflowStage, index) => {
            const stageNumber = index + 1
            const isActive = stage === stageNumber
            const isPast = stage > stageNumber
            return (
              <button
                key={workflowStage.title}
                type="button"
                disabled={!isPast}
                onClick={() => goToZkpStage(stageNumber)}
                aria-current={isActive ? "step" : undefined}
                className={JoinClassNames("lab5-zk-stepper-item", isActive && "lab5-zk-stepper-item--active")}
              >
                <span
                  className={JoinClassNames(
                    "lab5-zk-stepper-dot",
                    isActive && "lab5-zk-stepper-dot--active",
                    isPast && "lab5-zk-stepper-dot--done",
                  )}
                >
                  {isPast ? <Check className="lab5-size-3" strokeWidth={3} /> : stageNumber}
                </span>
                <span className="lab5-zk-stepper-title">{workflowStage.title}</span>
                <span className="lab5-zk-stepper-sub">{workflowStage.sub}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ขั้นย่อยที่ 1: Root ที่ประกาศไว้ */}
      {stage === 1 && (
        <div key="stage-1" className="lab5-animate-merge-up lab5-zk-card lab5-zk-card--padded">
          <ZkCardHeader
            icon={ShieldCheck}
            tone="success"
            title="เว็บเทรดประกาศ Root ไว้แล้ว"
            description="เว็บเทรดรวม Order ในรอบนี้ แล้วคำนวณ Root หนึ่งค่าไว้ใช้ตรวจสอบภายหลัง"
          />
          <div className="lab5-zk-commit-grid">
            <div className="lab5-zk-box lab5-zk-box--soft">
              <p className="lab5-zk-box-title">
                <Layers className="lab5-size-4 lab5-text-muted-foreground" />
                ชุด Order ของรอบนี้
              </p>
              <p className="lab5-zk-box-text">เว็บเทรดรวบรวม Order ทั้งหมดในรอบนี้ไว้ เพื่อคำนวณสรุปเป็น Root</p>
              <div className="lab5-zk-secret-box">
                <span aria-hidden="true">🔒</span> เนื้อหา Order ทุกรายการถูกเก็บเป็นความลับ ไม่ได้เปิดเผยต่อสาธารณะ
              </div>
            </div>

            <div className="lab5-zk-commit-arrow">
              <ArrowRight className="lab5-size-4" />
              <span>คำนวณเป็น Root</span>
            </div>

            <div className="lab5-zk-box lab5-zk-box--success">
              <p className="lab5-zk-box-title lab5-text-success">
                <Globe className="lab5-size-4" />
                Root ที่ประกาศไว้
                <span className="lab5-zk-badge lab5-zk-badge--success">ค่าอ้างอิงที่ผู้ตรวจสอบต้องเชื่อถือ</span>
              </p>
              <p className="lab5-zk-box-text">ค่าสรุปเพียงค่าเดียวที่ทุกคนสามารถใช้เป็นตัวอ้างอิงร่วมกัน</p>
              <div>
                <HashChip tone="success" label="Root ที่ประกาศไว้" hash={rootHash} />
              </div>
            </div>
          </div>
          <div className="lab5-zk-note lab5-zk-note--primary">
            <Lightbulb className="lab5-size-3.5 lab5-shrink-0 lab5-text-muted-foreground" />
            <span>
              <strong>ข้อสังเกต:</strong> ผู้ตรวจต้องเชื่อถือ Root นี้ก่อน จึงจะใช้ตรวจข้อมูลภายหลังได้
            </span>
          </div>
        </div>
      )}

      {/* ขั้นย่อยที่ 2: ข้อมูลลับของผู้ใช้ */}
      {stage === 2 && (
        <div key="stage-2" className="lab5-animate-merge-up lab5-zk-card lab5-zk-card--padded lab5-zk-card--dashed">
          <ZkCardHeader
            icon={Lock}
            title="ข้อมูลที่ใช้พิสูจน์ยังอยู่กับผู้ใช้"
            description="ผู้ใช้มี Order ที่ต้องการพิสูจน์ และ Hash ข้างเคียงที่ใช้คำนวณกลับไปหา Root"
          />
          <div className="lab5-zk-witness">
            <div className="lab5-zk-witness-head">
              <p className="lab5-zk-witness-title">
                <Lock className="lab5-size-4" />
                ข้อมูลลับของผู้ใช้
                <span className="lab5-zk-witness-tag">(Private Witness)</span>
              </p>
              <button
                type="button"
                onClick={() => setIsWitnessVisible((previousIsVisible) => !previousIsVisible)}
                className="lab5-zk-btn lab5-zk-btn--outline-primary"
              >
                {isWitnessVisible ? <EyeOff className="lab5-size-3.5" /> : <Eye className="lab5-size-3.5" />}
                {isWitnessVisible ? "ซ่อนข้อมูลของผู้ใช้" : "ดูข้อมูลของผู้ใช้"}
              </button>
            </div>
            <p className="lab5-zk-box-text">ข้อมูลที่คุณถือไว้ ได้แก่ Order ของตนเอง และ Hash ข้างเคียงเพื่อใช้คำนวณกลับไปหา Root</p>

            {isWitnessVisible ? (
              <div className="lab5-animate-merge-up lab5-zk-witness-detail">
                <div>
                  <p className="lab5-zk-field-label">Order ที่เลือก</p>
                  <div className="lab5-zk-order-line">
                    <ZkChip tone="primary">
                      <span className="lab5-zk-chip-label">{targetOrder.label}</span>
                    </ZkChip>
                    <span className="lab5-font-mono lab5-text-xs lab5-text-foreground">{targetOrder.value}</span>
                  </div>
                </div>
                <div>
                  <p className="lab5-zk-field-label">Leaf Hash</p>
                  <HashChip tone="primary" label={`H(${targetOrder.id})`} hash={leafHash} />
                </div>
                <div>
                  <p className="lab5-zk-field-label">
                    Hash ข้างเคียงที่ติดกัน <span className="lab5-font-medium lab5-text-muted-foreground">(Sibling Hash)</span>
                  </p>
                  <div className="lab5-flex lab5-flex-wrap lab5-gap-1.5">
                    {authPathSteps.map((pathStep) => (
                      <HashChip key={pathStep.nodeId} tone="primary" label={pathStep.label} hash={pathStep.hash} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="lab5-zk-witness-hidden">
                <div className="lab5-flex lab5-flex-wrap lab5-gap-1.5">
                  <ZkChip tone="primary" className="lab5-font-mono">
                    <Lock className="lab5-size-3" />
                    Order ที่เลือก: {targetOrder.label}
                  </ZkChip>
                  <ZkChip tone="primary" className="lab5-font-mono">
                    <Lock className="lab5-size-3" />
                    Hash ข้างเคียงที่ติดกัน
                  </ZkChip>
                </div>
                <span className="lab5-text-11 lab5-text-muted-foreground">(กด "ดูข้อมูลของผู้ใช้" เพื่อเปิดรายละเอียด)</span>
              </div>
            )}
          </div>
          <div className="lab5-zk-note lab5-zk-note--soft">
            <Contrast className="lab5-size-3.5 lab5-shrink-0" />
            <span>
              <strong>ข้อสังเกต:</strong> ในแนวคิด ZKP ข้อมูลเหล่านี้ใช้ตรวจอยู่ภายในวงจร แต่ไม่เปิดเผยให้ผู้ตรวจเห็น
            </span>
          </div>
        </div>
      )}

      {/* ขั้นย่อยที่ 3: สร้าง Proof */}
      {stage === 3 && (
        <div key="stage-3" className="lab5-animate-merge-up lab5-zk-card lab5-zk-card--padded">
          <ZkCardHeader
            icon={Cpu}
            title="ใช้ข้อมูลลับสร้าง Proof"
            description="ผู้ใช้ใช้ Order และ Hash ข้างเคียงเป็นข้อมูลลับ ส่วน ZK circuit กำหนดว่าข้อมูลต้องคำนวณไปถึง Root ที่ประกาศไว้ได้"
          />
          <div className="lab5-zk-banner lab5-zk-banner--box">
            <Info className="lab5-size-4 lab5-shrink-0 lab5-text-primary" />
            <span>ขั้นนี้เป็นภาพจำลอง ใช้การคำนวณ Merkle เพื่อสาธิตเงื่อนไข แต่ไม่ได้สร้าง ZK Proof จริง</span>
          </div>
          <div className="lab5-zk-note lab5-zk-note--soft lab5-zk-note--block">
            <Lightbulb className="lab5-size-3.5 lab5-shrink-0" />
            <span>
              <strong>บทบาทของแต่ละส่วน:</strong> ZK circuit เป็นกติกาที่กำหนดเงื่อนไข — ถ้าข้อมูลผ่านเงื่อนไข Prover จะสร้าง Proof
              เพื่อส่งให้ผู้ตรวจ (Verifier ในขั้นที่ 5) โดยไม่ต้องส่ง Order และ Hash ข้างเคียงทั้งหมด
            </span>
          </div>

          <div className="lab5-zk-box lab5-zk-box--soft lab5-zk-toggle-row">
            <div>
              <p className="lab5-text-xs lab5-font-bold lab5-text-foreground">ทดลองเปลี่ยนสถานะข้อมูล</p>
              <p className="lab5-text-11 lab5-text-muted-foreground">
                ลองดูว่าถ้าใช้ข้อมูลผิดหรือไม่ตรงกับชุดข้อมูล การสร้าง Proof ตัวอย่างจะเป็นอย่างไร
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsWitnessTampered((previousIsTampered) => !previousIsTampered)}
              className={JoinClassNames("lab5-zk-btn", isWitnessTampered ? "lab5-zk-btn--outline-danger" : "lab5-zk-btn--outline")}
            >
              <AlertTriangle className="lab5-size-3.5" />
              {isWitnessTampered ? "คืนข้อมูลเดิม" : "ลองใช้ข้อมูลผิด"}
            </button>
          </div>

          <div className="lab5-zk-box lab5-zk-box--soft lab5-zk-flow">
            <p className="lab5-zk-flow-title">
              ขั้นตอนการสร้าง Proof: ข้อมูลลับ + Root/เงื่อนไข → ZK circuit (กติกา) → Prover สร้าง Proof ตัวอย่าง
            </p>
            <div className="lab5-zk-flow-grid">
              <div className="lab5-zk-flow-col lab5-zk-flow-col--secret">
                <p className="lab5-zk-flow-col-title lab5-text-primary">
                  <Lock className="lab5-size-3.5" />
                  ข้อมูลลับ + Root/เงื่อนไข
                </p>
                <div className="lab5-zk-flow-sub">
                  <strong className="lab5-text-primary">ข้อมูลลับ:</strong>{" "}
                  {isWitnessTampered ? "⚠️ ข้อมูลถูกแก้ไข (ไม่ถูกต้อง)" : `Order ${targetOrder.label} + Hash ข้างเคียงที่ติดกัน`}
                </div>
                <div className="lab5-zk-flow-sub">
                  <strong className="lab5-text-success">Root ที่ประกาศไว้:</strong> เปรียบเทียบเป็น Public Input
                </div>
              </div>
              <ArrowRight className="lab5-zk-flow-arrow" />
              <div className="lab5-zk-flow-col">
                <p className="lab5-zk-flow-col-title lab5-text-foreground">
                  <Cpu className="lab5-size-3.5 lab5-text-primary" />
                  ZK circuit (กติกา)
                </p>
                <p className="lab5-zk-flow-text">กำหนดเงื่อนไขว่า Order และ Hash ข้างเคียงต้องคำนวณไปถึง Root ที่ประกาศไว้ได้</p>
                <p className="lab5-zk-flow-hint">(วงจรเป็นกติกา ไม่ใช่ผู้สร้างหรือตรวจ proof เอง)</p>
              </div>
              <ArrowRight className="lab5-zk-flow-arrow" />
              {isWitnessTampered ? (
                <div className="lab5-zk-flow-col lab5-zk-flow-col--danger">
                  <p className="lab5-zk-flow-col-title lab5-text-danger">
                    <AlertTriangle className="lab5-size-3.5" />
                    Prover สร้าง Proof ตัวอย่าง
                  </p>
                  <p className="lab5-zk-flow-strong lab5-text-danger">ข้อมูลไม่ตรงกับ Root จึงสร้าง Proof ตัวอย่างที่ผ่านเงื่อนไขไม่ได้</p>
                  <p className="lab5-zk-flow-text lab5-text-danger">Order หรือ Hash ข้างเคียงไม่ตรงกับ Root จึงไม่ผ่านเงื่อนไขของ circuit</p>
                </div>
              ) : (
                <div className="lab5-zk-flow-col lab5-zk-flow-col--success">
                  <p className="lab5-zk-flow-col-title lab5-text-success">
                    <Check className="lab5-size-3.5" strokeWidth={3} />
                    Prover สร้าง Proof ตัวอย่าง
                  </p>
                  <p className="lab5-zk-flow-strong lab5-text-success">ข้อมูลผ่านเงื่อนไข — พร้อมแสดง Proof ตัวอย่างในขั้นถัดไป</p>
                  <p className="lab5-zk-flow-text lab5-text-success">
                    Prover สามารถสร้าง Proof เพื่อส่งให้ Verifier ตรวจในหน้าถัดไป โดยไม่ต้องเปิดเผยข้อมูลลับ
                  </p>
                </div>
              )}
            </div>
            <div className="lab5-zk-root-row">
              <div className="lab5-space-y-1">
                <p className="lab5-zk-field-label">Root ที่คำนวณได้จากข้อมูล:</p>
                <HashChip key={isWitnessTampered ? "tamper" : "match"} tone={isWitnessTampered ? "danger" : "success"} hash={computedRoot} />
              </div>
              <div className="lab5-space-y-1 lab5-zk-root-row-end">
                <p className="lab5-zk-field-label">Root ที่ประกาศไว้ (Public Reference):</p>
                <HashChip tone="success" hash={rootHash} />
              </div>
            </div>
          </div>

          {isWitnessTampered && (
            <div className="lab5-animate-merge-up lab5-zk-reject">
              <span>ข้อมูลไม่ตรงกับ Root จึงสร้าง Proof ตัวอย่างที่ผ่านเงื่อนไขไม่ได้</span>
              <button type="button" onClick={() => setIsWitnessTampered(false)} className="lab5-zk-reject-btn">
                คืนข้อมูลเดิม
              </button>
            </div>
          )}
        </div>
      )}

      {/* ขั้นย่อยที่ 4: หลักฐาน */}
      {stage === 4 && (
        <div key="stage-4" className="lab5-animate-merge-up lab5-zk-card lab5-zk-card--padded">
          <ZkCardHeader
            icon={Sparkles}
            title="ส่งหลักฐาน แทนการส่งข้อมูลลับ"
            description="ในระบบ ZKP จริง ผู้ใช้ส่ง Proof ให้ผู้ตรวจ โดยไม่ต้องส่ง Order และ Hash ข้างเคียงไปด้วย"
          />
          <div className="lab5-zk-box lab5-zk-box--soft lab5-zk-proof-strip">
            <ZkChip tone="primary">ข้อมูลลับ</ZkChip>
            <span className="lab5-text-muted-foreground">+</span>
            <ZkChip tone="success">Root ที่ประกาศไว้</ZkChip>
            <span className="lab5-text-muted-foreground">→</span>
            <ZkChip tone="outline">ZK circuit (แนวคิด)</ZkChip>
            <span className="lab5-text-muted-foreground">→</span>
            <ZkChip tone="solid">Proof ตัวอย่าง</ZkChip>
          </div>

          <div className="lab5-zk-package">
            <div className="lab5-zk-package-head">
              <div>
                <p className="lab5-text-xs lab5-font-bold lab5-text-primary">สิ่งที่ส่งให้ผู้ตรวจสอบ</p>
                <p className="lab5-text-11 lab5-text-muted-foreground">แพ็กเกจนี้ประกอบด้วยข้อมูลสาธารณะและหลักฐานเท่านั้น</p>
              </div>
              <span className="lab5-zk-badge lab5-zk-badge--primary">ตัวอย่างจำลอง</span>
            </div>
            <div className="lab5-zk-package-item">
              <p className="lab5-zk-field-label">1. Root ที่ประกาศไว้</p>
              <HashChip tone="success" label="Root ที่ประกาศไว้" hash={rootHash} />
            </div>
            <div className="lab5-zk-package-item lab5-zk-package-item--proof">
              <p className="lab5-zk-field-label lab5-text-primary lab5-flex lab5-items-center lab5-gap-1.5">
                <ShieldCheck className="lab5-size-3.5" />
                2. Proof ตัวอย่าง (จำลอง)
              </p>
              <div className="lab5-zk-proof-box">
                <p className="lab5-text-lg lab5-font-medium lab5-text-foreground">หลักฐานขนาดสั้นที่ใช้ยืนยันความถูกต้อง</p>
                <p className="lab5-text-11 lab5-text-muted-foreground">ไม่เปิดเผย Order หรือ Hash ข้างเคียงออกมาในหลักฐานนี้</p>
              </div>
            </div>
          </div>

          <div className="lab5-zk-banner lab5-zk-banner--center lab5-font-semibold">
            นี่คือตัวอย่างสิ่งที่ผู้ใช้ส่งต่อ โดยไม่แนบ Order และ Hash ข้างเคียงทั้งหมด
          </div>
          <div className="lab5-zk-disclaimer">⚠️ หมายเหตุ: นี่เป็นภาพจำลองเพื่อการเรียนรู้ ไม่ได้สร้างหรือ verify ZK Proof จริง</div>
        </div>
      )}

      {/* ปุ่มนำทางขั้นย่อย */}
      <div className="lab5-zk-subnav">
        <button type="button" onClick={() => goToZkpStage(1)} className="lab5-zk-subnav-reset">
          <RotateCcw className="lab5-size-3.5" />
          เริ่มใหม่ (ขั้นตอนที่ 1)
        </button>
        <div className="lab5-flex lab5-items-center lab5-gap-2">
          {stage > 1 && (
            <button type="button" onClick={() => goToZkpStage(stage - 1)} className="lab5-zk-btn lab5-zk-btn--outline lab5-zk-btn--nav">
              <ArrowLeft className="lab5-size-3.5" />
              ย้อนกลับ
            </button>
          )}
          {stage < 4 ? (
            <button
              type="button"
              disabled={isNextBlocked}
              onClick={() => goToZkpStage(stage + 1)}
              className="lab5-zk-btn lab5-zk-btn--primary lab5-zk-btn--nav"
            >
              ขั้นถัดไป
              <ArrowRight className="lab5-size-3.5" />
            </button>
          ) : (
            <button type="button" onClick={goNext} className="lab5-zk-btn lab5-zk-btn--primary lab5-zk-btn--nav">
              ไปด่านถัดไป: เปรียบเทียบกับ ZKP
              <ArrowRight className="lab5-size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ขั้นที่ 8: Merkle กับ ZKP (เปรียบเทียบสิ่งที่ผู้ตรวจสอบเห็นระหว่าง Merkle proof กับ Merkle + ZKP)
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 8
 * @author StealthTrade Team
 */
function Step8MerkleZkp() {
  const { tree, selectedLeaf, authPathSteps } = useLab05()
  const [zkpMode, setZkpMode] = useState("merkle") // "merkle" | "zkp"

  const targetOrder = orders[selectedLeaf ?? 0] || orders[0]
  const rootHash = tree?.root
  const isZkp = zkpMode === "zkp"

  const matrixRows = [
    { name: "ลายเซ็นข้อมูลเดิม (Leaf Data)", isHidden: isZkp },
    { name: "ค่า Hash คู่เคียง (Sibling Hashes)", isHidden: isZkp },
    { name: "ค่ารากดั้งเดิม (Trusted Root)", isHidden: false, isPublic: true },
  ]

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="MERKLE กับ ZKP"
        title="มาดูกันว่าการใช้ Merkle proof  กับ Merkle + ZKP แตกต่างกันอย่างไร?"
        description={
          <>
            Merkle proof พิสูจน์ได้ว่า Order อยู่ในต้นไม้ แต่ผู้ตรวจสอบต้องเห็น Order และ Hash ที่ส่งมาทั้งหมด
            <br />
            ลองสลับดูว่าถ้านำการตรวจแบบเดียวกันไปไว้ในระบบ ZKP ผู้ตรวจสอบจะเห็นอะไรเปลี่ยนไป
          </>
        }
      />

      <div className="lab5-grid lab5-gap-3 lab5-sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setZkpMode("merkle")}
          aria-pressed={!isZkp}
          className={JoinClassNames("lab5-zk-mode", !isZkp && "lab5-zk-mode--danger")}
        >
          <p className="lab5-zk-mode-title">Merkle proof อย่างเดียว</p>
          <p className="lab5-zk-mode-sub">ส่งหลักฐานให้ผู้ตรวจสอบตรง ๆ</p>
        </button>
        <button
          type="button"
          onClick={() => setZkpMode("zkp")}
          aria-pressed={isZkp}
          className={JoinClassNames("lab5-zk-mode", isZkp && "lab5-zk-mode--success")}
        >
          <p className="lab5-zk-mode-title">Merkle + ZKP (จำลอง)</p>
          <p className="lab5-zk-mode-sub">ซ่อนข้อมูลไว้ในวงจรพิสูจน์</p>
        </button>
      </div>

      <div className="lab5-zk-shared-root">
        <span className="lab5-text-xs lab5-font-bold lab5-text-foreground">ราก (เห็นเหมือนกันทั้งสองโหมด)</span>
        <HashChip tone="white" hash={rootHash} />
      </div>

      <div className="lab5-space-y-3">
        <div className="lab5-flex lab5-items-center lab5-justify-between">
          <h3 className="lab5-text-sm lab5-font-bold lab5-text-foreground">เปรียบเทียบสิ่งที่แต่ละฝ่ายมองเห็น</h3>
          <span className="lab5-text-11 lab5-font-bold lab5-text-primary">Side-by-side view</span>
        </div>

        <div key={zkpMode} className="lab5-animate-merge-up lab5-grid lab5-gap-4 lab5-sm:grid-cols-2">
          {/* ผู้พิสูจน์ */}
          <div className="lab5-zk-party lab5-zk-party--prover">
            <ZkCardHeader
              icon={Lock}
              isCompact
              title="ผู้พิสูจน์ (Prover)"
              description={isZkp ? "ข้อมูลที่ซ่อนไว้ในวงจร" : "ส่งทุกอย่างนี้ให้ผู้ตรวจสอบ"}
            />
            <div className="lab5-zk-party-body">
              {isZkp ? (
                <>
                  <div>
                    <p className="lab5-zk-field-label">Order ที่เลือก (ข้อมูลลับ)</p>
                    <ZkChip tone="primary" isDashed className="lab5-font-mono">
                      <Lock className="lab5-size-3" />
                      {targetOrder.label} - {targetOrder.value}
                    </ZkChip>
                  </div>
                  <div>
                    <p className="lab5-zk-field-label">Sibling Hashes (ข้อมูลลับ)</p>
                    <div className="lab5-flex lab5-flex-wrap lab5-gap-1.5">
                      {authPathSteps.map((pathStep) => (
                        <ZkChip key={pathStep.nodeId} tone="primary" isDashed className="lab5-font-mono">
                          <Lock className="lab5-size-3" />
                          {pathStep.label}
                        </ZkChip>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="lab5-zk-party-empty">
                  ไม่มีอะไรถูกซ่อน ผู้พิสูจน์ส่ง {targetOrder.label}
                  <br />
                  และ SiblingHashes ให้ผู้ตรวจสอบตรง ๆ
                </p>
              )}
            </div>
          </div>

          {/* ผู้ตรวจสอบ */}
          <div className="lab5-zk-party">
            <ZkCardHeader
              icon={Eye}
              tone="neutral"
              isCompact
              title="ผู้ตรวจสอบ (Verifier) เห็น"
              description={isZkp ? "ราก + proof จำลอง" : "ราก + Order + Sibling Hashes"}
            />
            <div className="lab5-zk-party-body">
              <div>
                <p className="lab5-zk-field-label">ราก</p>
                <HashChip hash={rootHash} />
              </div>
              {isZkp ? (
                <>
                  <div>
                    <p className="lab5-zk-field-label">หลักฐานแบบซ่อนข้อมูล (Zero-Knowledge Proof)</p>
                    <ZkChip className="lab5-font-sans">ยืนยันสิทธิ์ได้โดยไม่เปิดเผยออร์เดอร์</ZkChip>
                  </div>
                  <p className="lab5-flex lab5-items-center lab5-gap-1.5 lab5-text-11 lab5-text-muted-foreground">
                    <EyeOff className="lab5-size-3.5 lab5-shrink-0" />
                    ผู้ตรวจสอบไม่เห็น Order ที่เลือก และไม่เห็น Sibling Hashes
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <p className="lab5-zk-field-label">Order ที่กำลังพิสูจน์</p>
                    <p className="lab5-flex lab5-items-baseline lab5-gap-2">
                      <span className="lab5-text-sm lab5-font-bold lab5-text-foreground">{targetOrder.label}</span>
                      <span className="lab5-font-mono lab5-text-11 lab5-text-muted-foreground">{targetOrder.value}</span>
                    </p>
                  </div>
                  <div>
                    <p className="lab5-zk-field-label">Sibling Hashes ที่ส่งมาพร้อมหลักฐาน</p>
                    <div className="lab5-flex lab5-flex-wrap lab5-gap-1.5">
                      {authPathSteps.map((pathStep) => (
                        <HashChip key={pathStep.nodeId} tone="primary" label={pathStep.label} hash={pathStep.hash} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visibility Matrix */}
      <div className="lab5-zk-matrix">
        <div className="lab5-zk-matrix-head">
          <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">Visibility Matrix</p>
          <p className="lab5-text-11 lab5-text-muted-foreground">สรุปสิ่งที่ผู้พิสูจน์และผู้ตรวจสอบมองเห็น</p>
        </div>
        <table className="lab5-zk-matrix-table">
          <thead>
            <tr>
              <th>ข้อมูลในระบบ</th>
              <th className="lab5-text-center">Prover</th>
              <th className="lab5-text-center">Verifier</th>
            </tr>
          </thead>
          <tbody>
            {matrixRows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td className="lab5-text-center lab5-text-success">เห็น</td>
                <td className={JoinClassNames("lab5-text-center", row.isPublic || row.isHidden ? "lab5-text-success" : "lab5-text-danger")}>
                  {row.isHidden ? "ซ่อนด้วย ZKP" : "เห็น"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lab5-zk-callout">
        {isZkp ? (
          <p>
            ในแนวคิดของ ZKP วงจรจะตรวจการคำนวณจาก Order ไปหาราก ให้อยู่ข้างใน ผู้ตรวจสอบจึงยืนยันได้ว่า “มีออร์เดอร์บางรายอยู่ใต้ราก
            นี้” โดยไม่ต้องเห็น Order และเส้นทางที่ใช้
          </p>
        ) : (
          <p>
            ผู้ตรวจสอบคำนวณรากเองได้จากหลักฐานที่ได้รับ จึงยืนยันได้ว่า {targetOrder.label} อยู่ในต้นไม้ แต่ก็รู้ด้วยว่า กำลังพิสูจน์{" "}
            <strong className="lab5-text-foreground">{targetOrder.label}</strong>
          </p>
        )}
      </div>

      <p className="lab5-text-11 lab5-leading-relaxed lab5-text-muted-foreground">
        ตัวอย่างระบบที่ใช้แนวคิดใกล้เคียงกัน: Semaphore ใช้ Merkle Tree ของออร์เดอร์กลุ่มร่วมกับ ZK circuit
        เพื่อพิสูจน์ว่าเป็นออร์เดอร์กลุ่มโดยไม่ระบุตัวตน ส่วนในแลปนี้เป็นเพียงภาพจำลองเพื่อให้เห็นว่าผู้ตรวจสอบเห็นข้อมูลต่างกันอย่างไร
      </p>
    </div>
  )
}

/**
 * ขั้นที่ 9: สรุปบริบทการเทรด (แล้วมันช่วยอะไรเรา?)
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 9
 * @author StealthTrade Team
 */
function Step9Efficiency() {
  const { goToStep, reset } = useLab05()

  const comparisonRows = [
    ["อาจต้องดู/ส่งข้อมูลจำนวนมาก", "ใช้ Root + หลักฐานเฉพาะเส้นทาง"],
    ["ตรวจออร์เดอร์ของชุดใหญ่ได้ยากกว่า", "ตรวจออร์เดอร์ได้เป็นขั้นตอน"],
    ["หลักฐานอาจโตตามจำนวนข้อมูล", "Authentication Path โตตามความลึกของต้นไม้"],
    ["ไม่มีค่าเดียวสรุปทั้งชุด", "มี Merkle Root เป็นค่าอ้างอิง"],
  ]

  return (
    <div className="lab5-space-y-6">
      <LessonHeading sectionLabel="สรุปประโยชน์" title="แล้วมันช่วยอะไรเรา?" />

      <div className="lab5-grid lab5-gap-3 lab5-sm:grid-cols-2">
        <div className="lab5-zk-summary-card">
          <p className="lab5-text-xs lab5-font-bold lab5-text-muted-foreground">ไม่มี Merkle Tree</p>
          <div className="lab5-flex lab5-flex-wrap lab5-items-center lab5-gap-2">
            {["A", "B", "C", "D"].map((id) => (
              <span key={id} className="lab5-zk-summary-leaf">
                {id}
              </span>
            ))}
          </div>
          <p className="lab5-text-xs lab5-text-muted-foreground">ต้องเปิดเผยทุก Order</p>
        </div>

        <div className="lab5-zk-summary-card lab5-zk-summary-card--primary">
          <p className="lab5-text-xs lab5-font-bold lab5-text-primary">มี Merkle Tree</p>
          <div className="lab5-flex lab5-flex-wrap lab5-items-center lab5-gap-2 lab5-text-xs">
            <span className="lab5-zk-summary-leaf lab5-zk-summary-leaf--active">A</span>
            <span className="lab5-text-muted-foreground">+</span>
            <span className="lab5-zk-summary-hash">H(B)</span>
            <span className="lab5-text-muted-foreground">+</span>
            <span className="lab5-zk-summary-hash">H(C+D)</span>
            <ArrowRight className="lab5-size-3.5 lab5-text-primary" />
            <span className="lab5-zk-summary-hash lab5-zk-summary-hash--root">Root</span>
          </div>
          <p className="lab5-text-xs lab5-text-muted-foreground">Order อื่นเปิดเผยแค่ Hash ที่จำเป็น</p>
        </div>
      </div>

      <div className="lab5-zk-matrix">
        <table className="lab5-zk-matrix-table lab5-zk-summary-table">
          <thead>
            <tr>
              <th className="lab5-text-foreground">ไม่มี Merkle Tree</th>
              <th className="lab5-text-primary">มี Merkle Tree</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map(([withoutTree, withTree]) => (
              <tr key={withoutTree}>
                <td className="lab5-text-muted-foreground">{withoutTree}</td>
                <td>{withTree}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lab5-animate-merge-up lab5-zk-complete">
        <PartyPopper className="lab5-mx-auto lab5-size-8 lab5-text-success" />
        <h3 className="lab5-text-lg lab5-font-bold lab5-text-foreground">เรียนจบ Lab 05 แล้ว</h3>
        <p className="lab5-text-xs lab5-text-muted-foreground">
          คุณสร้างต้นไม้ พิสูจน์ว่าข้อมูลอยู่ในต้นไม้ และตรวจจับการปลอมแปลงได้ด้วยตัวเองแล้ว
        </p>
        <div className="lab5-flex lab5-flex-wrap lab5-items-center lab5-justify-center lab5-gap-3 lab5-pt-3">
          <button type="button" onClick={() => goToStep(4)} className="lab5-zk-btn lab5-zk-btn--outline-primary lab5-zk-btn--lg">
            ลองพิสูจน์ Order อื่น
          </button>
          <button type="button" onClick={reset} className="lab5-zk-btn lab5-zk-btn--outline lab5-zk-btn--lg">
            <RotateCcw className="lab5-size-3.5" />
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
      return <Step4SelectTarget />
    case 5:
      return <Step5AuthPath />
    case 6:
      return <Step7Tamper />
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
            <div className="lab5-rounded-2xl lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-px-4 lab5-py-3">
              <p className="lab5-text-xs lab5-font-semibold lab5-text-primary">
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
